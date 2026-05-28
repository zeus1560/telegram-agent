const { Markup } = require('telegraf');
const { isAuthorized } = require('./security');
const lock = require('./lock');
const { identifyTargetFiles, generateChanges } = require('./aiShim');
const { readFile, fuzzySearch, buildFlatFileList } = require('./fileOps');
const { formatDiffMessage } = require('./diffUtils');
const { TARGET_PROJECT_PATH } = require('./config');

async function handleMessage(ctx) {
  // 1. 보안: 미등록 User ID 완전 무시
  if (!isAuthorized(ctx.from.id)) return;

  // 2. 동시 명령 차단
  if (lock.get().isLocked) {
    return ctx.reply('현재 이전 지시사항을 처리 중입니다. 완료 후 다시 명령해주세요 ⏳');
  }

  lock.lock();

  try {
    const userMessage = ctx.message.text;
    await ctx.reply('🔍 명령을 분석 중입니다...');

    // 3. 1차 AI 호출: 어떤 파일을 수정할지 파악
    const fileList = buildFlatFileList(TARGET_PROJECT_PATH).join('\n');
    const fileTree = fileList;
    let intent;
    try {
      intent = await identifyTargetFiles(userMessage, fileTree);
    } catch (err) {
      console.error('[orchestrator] 파일 식별 실패:', err.message);
      lock.unlock();
      return ctx.reply('❌ 명령 분석에 실패했습니다. 잠시 후 다시 시도해 주세요.');
    }

    // 4. 모호한 명령 → 역질문
    if (intent.status === 'clarification_needed') {
      lock.unlock();
      return ctx.reply(`🤔 ${intent.clarificationQuestion}`);
    }

    // 5. 파일 실제 내용 읽기
    const fileContents = {};
    for (const filePath of intent.targetFiles) {
      const content = readFile(filePath, TARGET_PROJECT_PATH);
      if (content === null) {
        const candidates = fuzzySearch(filePath, TARGET_PROJECT_PATH);
        lock.unlock();
        if (candidates.length === 0) {
          return ctx.reply(`❌ 파일을 찾을 수 없습니다: \`${filePath}\`\n프로젝트 내에 해당 파일이 없습니다.`);
        }
        const list = candidates.map((c, i) => `  ${i + 1}. \`${c}\``).join('\n');
        return ctx.reply(`🔎 \`${filePath}\` 파일을 찾을 수 없습니다.\n혹시 아래 파일을 말씀하시는 건가요?\n${list}\n\n정확한 파일명으로 다시 명령해 주세요.`);
      }
      fileContents[filePath] = content;
    }

    // 6. 2차 AI 호출: 실제 파일 내용 기반으로 정확한 변경 생성
    await ctx.reply('✏️ 수정 코드를 생성 중입니다...');
    let changesResult;
    try {
      changesResult = await generateChanges(userMessage, intent.description, fileContents);
    } catch (err) {
      console.error('[orchestrator] 코드 생성 실패:', err.message);
      lock.unlock();
      return ctx.reply('❌ 수정 코드 생성에 실패했습니다. 명령을 더 구체적으로 입력해 주세요.');
    }

    const shimResult = {
      ...intent,
      ...changesResult,
    };

    // 7. Diff 메시지 생성 + 승인 버튼 전송
    const diffMessage = formatDiffMessage(shimResult, fileContents);
    lock.setPending(shimResult);

    await ctx.reply(diffMessage, {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard([
        Markup.button.callback('✅ 승인', 'approve'),
        Markup.button.callback('❌ 거절', 'reject'),
      ]),
    });

  } catch (err) {
    console.error('[orchestrator] 예상치 못한 오류:', err.message);
    lock.unlock();
    ctx.reply('❌ 처리 중 오류가 발생했습니다. /status 로 상태를 확인해 주세요.');
  }
}

module.exports = { handleMessage };
