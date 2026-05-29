/**
 * @fileoverview 자유 텍스트 메시지 처리 오케스트레이터.
 * 두 단계 AI 호출(파일 식별 → 코드 생성)을 조율하고 승인 UI를 전송한다.
 */
const { Markup } = require('telegraf');
const { isAuthorized, isSensitiveFile, mentionsSensitiveFile } = require('./security');
const lock = require('./lock');
const { identifyTargetFiles, generateChanges } = require('./aiShim');
const { readFile, fuzzySearch, buildFlatFileList, normalizeChangePaths } = require('./fileOps');
const { formatDiffMessage, formatFileDiff } = require('./diffUtils');
const history = require('./conversationHistory');
const projectState = require('./projectState');

/**
 * shimResult의 변경 파일 수에 따라 단일 승인 버튼 또는 파일별 부분 승인 버튼을 전송한다.
 * @param {import('telegraf').Context} ctx
 * @param {{changes: Array, description: string, commitMessage: string}} shimResult AI 생성 결과
 * @param {Object.<string, string>} fileContents 파일 경로 → 원본 내용 맵
 * @param {string} userMessage 원본 사용자 명령
 */
async function dispatchChanges(ctx, shimResult, fileContents, userMessage) {
  const fileGroups = {};
  for (const change of shimResult.changes) {
    if (!fileGroups[change.file]) fileGroups[change.file] = [];
    fileGroups[change.file].push(change);
  }
  const files = Object.keys(fileGroups);

  if (files.length > 1) {
    const decisions = {};
    files.forEach((_, i) => { decisions[i] = null; });

    lock.setPartialApproval({
      fileGroups,
      files,
      decisions,
      base: { ...shimResult, userMessage, allFileContents: fileContents },
    });
    lock.unlock();

    await ctx.reply(
      `📋 총 *${files.length}개 파일*이 수정됩니다. 파일별로 승인 또는 거절해 주세요.`,
      { parse_mode: 'Markdown' }
    );

    for (let i = 0; i < files.length; i++) {
      const diffMsg = formatFileDiff(files[i], fileGroups[files[i]], fileContents[files[i]]);
      await ctx.reply(diffMsg, {
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard([
          Markup.button.callback('✅ 승인', `pf_a_${i}`),
          Markup.button.callback('❌ 거절', `pf_r_${i}`),
        ]),
      });
    }
  } else {
    const diffMessage = formatDiffMessage(shimResult, fileContents);
    lock.setPending({ ...shimResult, userMessage });
    await ctx.reply(diffMessage, {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard([
        Markup.button.callback('✅ 승인', 'approve'),
        Markup.button.callback('❌ 거절', 'reject'),
      ]),
    });
  }
}

/**
 * 자유 텍스트 메시지를 처리하는 메인 핸들러.
 * 피드백 대기 상태이면 handleFeedback으로 위임하고,
 * 아니면 두 단계 AI 호출(파일 식별 → 코드 생성) 후 승인 버튼을 전송한다.
 * @param {import('telegraf').Context} ctx
 */
async function handleMessage(ctx) {
  // 1. 보안: 미등록 User ID 완전 무시
  if (!isAuthorized(ctx.from.id)) return;

  const lockState = lock.get();

  // 2. 거절 후 피드백 대기 상태 → 피드백 처리 경로
  if (lockState.waitingForFeedback) {
    return handleFeedback(ctx, lockState.retryContext);
  }

  // 3. 파일별 부분 승인 대기 중 → 새 명령 차단
  if (lockState.partialApproval) {
    return ctx.reply('⏳ 파일별 승인을 먼저 완료해 주세요. (/cancel 로 취소)');
  }

  // 4. 동시 명령 차단
  if (lockState.isLocked) {
    return ctx.reply('현재 이전 지시사항을 처리 중입니다. 완료 후 다시 명령해주세요 ⏳');
  }

  // 새 명령 진입 시 미사용 snippet retry 컨텍스트 초기화
  if (lockState.snippetRetryContext) lock.clearSnippetRetry();

  lock.lock();

  try {
    const userMessage = ctx.message.text;

    // 프리플라이트: 메시지에 민감 파일 키워드 포함 시 AI 호출 없이 즉시 차단
    if (mentionsSensitiveFile(userMessage)) {
      lock.unlock();
      return ctx.reply('🔒 보안 파일(.env, .key, .pem 등)은 수정할 수 없습니다.\n다른 파일을 지정해 주세요.');
    }

    await ctx.reply('🔍 명령을 분석 중입니다...');

    // 5. 1차 AI 호출: 어떤 파일을 수정할지 파악
    const fileList = buildFlatFileList(projectState.get()).join('\n');
    const historyContext = history.formatHistory();
    let intent;
    try {
      intent = await identifyTargetFiles(userMessage, fileList, historyContext);
    } catch (err) {
      console.error('[orchestrator] 파일 식별 실패:', err.message);
      lock.unlock();
      return ctx.reply('❌ 명령 분석에 실패했습니다. 잠시 후 다시 시도해 주세요.');
    }

    // 6. 모호한 명령 → 역질문
    if (intent.status === 'clarification_needed') {
      lock.unlock();
      return ctx.reply(`🤔 ${intent.clarificationQuestion}`);
    }

    // 7. 민감 파일 차단
    const sensitiveFiles = intent.targetFiles.filter(f => isSensitiveFile(f));
    if (sensitiveFiles.length > 0) {
      lock.unlock();
      return ctx.reply(`🔒 보안 파일은 수정할 수 없습니다:\n${sensitiveFiles.map(f => `  • \`${f}\``).join('\n')}\n\n다른 파일을 지정해 주세요.`);
    }

    // 8. 파일 실제 내용 읽기
    const fileContents = {};
    for (const filePath of intent.targetFiles) {
      let content;
      try {
        content = readFile(filePath, projectState.get());
      } catch (err) {
        lock.unlock();
        return ctx.reply(`❌ 파일을 읽을 수 없습니다.\n\`${filePath}\`: ${err.message}`);
      }
      if (content === null) {
        if (intent.action === 'create') {
          fileContents[filePath] = '';
          continue;
        }
        const candidates = fuzzySearch(filePath, projectState.get());
        lock.unlock();
        if (candidates.length === 0) {
          return ctx.reply(`❌ 파일을 찾을 수 없습니다: \`${filePath}\`\n프로젝트 내에 해당 파일이 없습니다.`);
        }
        const list = candidates.map((c, i) => `  ${i + 1}. \`${c}\``).join('\n');
        return ctx.reply(`🔎 \`${filePath}\` 파일을 찾을 수 없습니다.\n혹시 아래 파일을 말씀하시는 건가요?\n${list}\n\n정확한 파일명으로 다시 명령해 주세요.`);
      }
      fileContents[filePath] = content;
    }

    // 9. 2차 AI 호출: 실제 파일 내용 기반으로 정확한 변경 생성
    await ctx.reply('✏️ 수정 코드를 생성 중입니다...');
    let changesResult;
    try {
      changesResult = await generateChanges(userMessage, intent.description, fileContents, historyContext);
    } catch (err) {
      console.error('[orchestrator] 코드 생성 실패:', err.message);
      lock.unlock();
      return ctx.reply('❌ 수정 코드 생성에 실패했습니다. 명령을 더 구체적으로 입력해 주세요.');
    }

    if (!Array.isArray(changesResult?.changes) || changesResult.changes.length === 0) {
      lock.unlock();
      return ctx.reply('❌ AI가 유효한 수정 코드를 생성하지 못했습니다. 명령을 더 구체적으로 입력해 주세요.');
    }

    normalizeChangePaths(changesResult.changes, projectState.get());

    const shimResult = { ...intent, ...changesResult };

    // 10. 단일/다중 파일에 따라 승인 버튼 전송
    await dispatchChanges(ctx, shimResult, fileContents, userMessage);

  } catch (err) {
    console.error('[orchestrator] 예상치 못한 오류:', err.message);
    lock.unlock();
    ctx.reply('❌ 처리 중 오류가 발생했습니다. /status 로 상태를 확인해 주세요.');
  }
}

/**
 * 거절 후 피드백 입력을 처리한다.
 * 피드백을 반영해 코드를 재생성하고 새 승인 버튼을 전송한다.
 * @param {import('telegraf').Context} ctx
 * @param {{targetFiles: string[], originalMessage: string, description: string}} retryContext 재시도 컨텍스트
 */
async function handleFeedback(ctx, retryContext) {
  if (lock.get().isLocked) {
    return ctx.reply('현재 작업 중입니다 ⏳');
  }

  lock.clearFeedback();
  lock.lock();

  try {
    const feedbackMessage = ctx.message.text;
    await ctx.reply('✏️ 피드백을 반영해 수정 코드를 재생성 중입니다...');

    // 동일 파일의 최신 내용 다시 읽기
    const fileContents = {};
    for (const filePath of retryContext.targetFiles) {
      let content;
      try { content = readFile(filePath, projectState.get()); } catch { content = null; }
      fileContents[filePath] = content !== null ? content : '';
    }

    // 피드백을 주 지시사항으로, 원래 명령은 맥락으로만 전달 (AI가 원래 명령 우선시하는 버그 방지)
    const feedbackDescription = `${retryContext.description} → 수정 요청: ${feedbackMessage}`;

    // 거절된 작업의 파일 경로만 전달 — 원래 명령 내용 제외해 AI 혼동 방지
    const retryNote = `[재시도 대상 파일] ${retryContext.targetFiles.join(', ')}`;
    const baseHistory = history.formatHistory();
    const historyContext = retryNote + (baseHistory ? '\n' + baseHistory : '');

    let changesResult;
    try {
      changesResult = await generateChanges(feedbackMessage, feedbackDescription, fileContents, historyContext);
    } catch (err) {
      console.error('[orchestrator] 피드백 코드 생성 실패:', err.message);
      lock.unlock();
      return ctx.reply('❌ 수정 코드 생성에 실패했습니다. 다시 시도해 주세요.');
    }

    if (!Array.isArray(changesResult?.changes) || changesResult.changes.length === 0) {
      lock.unlock();
      return ctx.reply('❌ AI가 유효한 수정 코드를 생성하지 못했습니다. 다시 시도해 주세요.');
    }

    normalizeChangePaths(changesResult.changes, projectState.get());

    const shimResult = {
      targetFiles: retryContext.targetFiles,
      description: retryContext.description,
      ...changesResult,
    };

    const combinedMessage = `${retryContext.originalMessage} → 피드백 반영: ${feedbackMessage}`;
    await dispatchChanges(ctx, shimResult, fileContents, combinedMessage);

  } catch (err) {
    console.error('[orchestrator] 피드백 처리 오류:', err.message);
    lock.unlock();
    ctx.reply('❌ 처리 중 오류가 발생했습니다. /cancel 후 다시 시도해 주세요.');
  }
}

module.exports = { handleMessage };
