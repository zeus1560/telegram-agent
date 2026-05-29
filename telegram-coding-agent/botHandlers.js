/**
 * @fileoverview Telegram 봇 커맨드 및 액션 핸들러.
 * 각 /커맨드와 인라인 버튼 콜백이 독립된 네임드 함수로 구현된다.
 * registerHandlers()는 라우팅 테이블 역할만 담당한다.
 */
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const { Markup } = require('telegraf');
const { isAuthorized } = require('./security');
const lock = require('./lock');
const { applyChanges, readFile, fuzzySearch, buildFlatFileList, normalizeChangePaths } = require('./fileOps');
const { autoCommit, revertLast } = require('./gitHandler');
const { PROJECTS } = require('./config');
const history = require('./conversationHistory');
const projectState = require('./projectState');
const { logCommit } = require('./notionLogger');
const { analyzeCode, generateChanges } = require('./aiShim');
const { formatDiffMessage } = require('./diffUtils');

const ALLOWED_NPM_CMDS = new Set(['install', 'test', 'ci']);
const ALLOWED_NPM_RUN = new Set(['build', 'dev', 'start', 'test', 'lint', 'preview']);

// ── Command Handlers ──────────────────────────────────────────────────────────

/**
 * /status — 현재 Lock 상태와 마지막 작업 결과를 반환한다.
 * @param {import('telegraf').Context} ctx
 */
function handleStatus(ctx) {
  if (!isAuthorized(ctx.from.id)) return;
  const { isLocked, lastResult } = lock.get();
  const status = isLocked ? '🔒 작업 중' : '🟢 대기 중';
  ctx.reply(`상태: ${status}\n마지막 작업: ${lastResult}`);
}

/**
 * /projects — 등록된 프로젝트 목록과 현재 활성 프로젝트를 표시한다.
 * @param {import('telegraf').Context} ctx
 */
function handleProjects(ctx) {
  if (!isAuthorized(ctx.from.id)) return;
  const entries = Object.entries(PROJECTS);
  const current = projectState.getName();
  const lines = entries.map(([name, projPath]) => {
    const marker = name === current ? '▶ ' : '  ';
    return `${marker}${name}  →  ${projPath}`;
  });
  ctx.reply(`📂 등록된 프로젝트 목록\n\n${lines.join('\n')}\n\n전환: /switch <이름>`);
}

/**
 * /switch <name> — 활성 프로젝트를 전환한다. Lock 중에는 차단된다.
 * @param {import('telegraf').Context} ctx
 */
function handleSwitch(ctx) {
  if (!isAuthorized(ctx.from.id)) return;
  const args = ctx.message.text.split(/\s+/).slice(1);
  const name = args[0] && args[0].toLowerCase();

  if (!name) return ctx.reply('사용법: /switch <프로젝트명>\n목록 확인: /projects');
  if (!PROJECTS[name]) {
    const available = Object.keys(PROJECTS).join(', ');
    return ctx.reply(`❌ 알 수 없는 프로젝트: "${name}"\n사용 가능: ${available}`);
  }
  if (lock.get().isLocked) return ctx.reply('현재 작업 중입니다. 완료 후 전환해 주세요 ⏳');

  projectState.set(name, PROJECTS[name]);
  ctx.reply(`✅ 프로젝트 전환 완료\n▶ ${name}  →  ${PROJECTS[name]}`);
}

/**
 * /history — 최근 코드 수정 내역(최대 5건)을 시간순으로 출력한다.
 * @param {import('telegraf').Context} ctx
 */
function handleHistory(ctx) {
  if (!isAuthorized(ctx.from.id)) return;
  const turns = history.getAll();
  if (turns.length === 0) return ctx.reply('📋 최근 수정 내역이 없습니다.');

  const lines = turns.map((t, i) => {
    const date = new Date(t.timestamp).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });
    const files = t.files && t.files.length ? `\n    파일: ${t.files.join(', ')}` : '';
    return `[${i + 1}] ${date}\n    명령: "${t.userMessage}"\n    수정: ${t.description}\n    커밋: ${t.commitMessage}${files}`;
  });
  ctx.reply(`📋 최근 수정 내역\n\n${lines.join('\n\n')}`);
}

/**
 * /undo — 마지막 Git 커밋을 revert하고 history에서 제거한다.
 * @param {import('telegraf').Context} ctx
 */
async function handleUndo(ctx) {
  if (!isAuthorized(ctx.from.id)) return;
  if (lock.get().isLocked) return ctx.reply('현재 작업 중입니다. 완료 후 다시 시도해 주세요 ⏳');

  const turns = history.getAll();
  if (turns.length === 0) return ctx.reply('⚠️ 되돌릴 내역이 없습니다.');

  const last = turns[turns.length - 1];
  await ctx.reply(`⏪ 마지막 커밋을 되돌립니다...\n커밋: \`${last.commitMessage}\``);

  const result = await revertLast(projectState.get());
  if (result.success) {
    history.removeLast();
    const pushNote = result.pushed ? ' (원격 push 완료)' : '';
    await ctx.reply(`✅ Revert 완료${pushNote}\n"${last.userMessage}" 작업이 취소되었습니다.`);
  } else {
    await ctx.reply(`❌ Revert 실패\n\`${result.error}\``);
  }
}

/**
 * /analyze [filePath] — AI가 파일 품질을 분석해 한국어 보고서를 반환한다.
 * 인수 없이 호출하면 현재 프로젝트 파일 목록을 출력한다.
 * @param {import('telegraf').Context} ctx
 */
async function handleAnalyze(ctx) {
  if (!isAuthorized(ctx.from.id)) return;

  const filePath = ctx.message.text.split(/\s+/).slice(1).join(' ').trim();
  if (!filePath) {
    const files = buildFlatFileList(projectState.get());
    const preview = files.slice(0, 20).map(f => `  ${f}`).join('\n');
    const more = files.length > 20 ? `\n  ... 외 ${files.length - 20}개` : '';
    return ctx.reply(`사용법: /analyze <파일경로>\n\n📂 현재 프로젝트 파일 목록 (상위 20개):\n${preview}${more}`);
  }

  const content = readFile(filePath, projectState.get());
  if (content === null) {
    const candidates = fuzzySearch(filePath, projectState.get());
    if (candidates.length > 0) {
      const list = candidates.map((c, i) => `  ${i + 1}. \`${c}\``).join('\n');
      return ctx.reply(`🔎 \`${filePath}\` 를 찾을 수 없습니다.\n혹시 아래 파일인가요?\n${list}\n\n정확한 경로로 다시 입력해 주세요.`);
    }
    return ctx.reply(`❌ 파일을 찾을 수 없습니다: \`${filePath}\`\n\n파일 목록 확인: /analyze (인수 없이 입력)`);
  }

  await ctx.reply(`🔍 \`${filePath}\` 분석 중...`);
  try {
    const report = await analyzeCode(filePath, content);
    const MAX = 4000;
    await ctx.reply(report.length > MAX ? report.slice(0, MAX) + '\n_(이하 생략)_' : report);
  } catch (err) {
    console.error('[analyze]', err.message);
    await ctx.reply('❌ 분석에 실패했습니다. 잠시 후 다시 시도해 주세요.');
  }
}

/**
 * /npm <subcommand> — 화이트리스트에 있는 npm 명령을 타겟 프로젝트에서 실행한다.
 * 허용 명령: install, ci, test, run build/dev/start/test/lint/preview
 * @param {import('telegraf').Context} ctx
 */
async function handleNpm(ctx) {
  if (!isAuthorized(ctx.from.id)) return;

  const args = ctx.message.text.split(/\s+/).slice(1);
  if (args.length === 0) {
    return ctx.reply(
      '사용법: /npm <명령>\n\n허용 목록:\n  install, ci, test\n  run build / dev / start / test / lint / preview'
    );
  }

  const isAllowed =
    ALLOWED_NPM_CMDS.has(args[0]) ||
    (args[0] === 'run' && args[1] && ALLOWED_NPM_RUN.has(args[1]));
  const cmdStr = args.join(' ');

  if (!isAllowed) {
    return ctx.reply(
      `🚫 허용되지 않은 명령입니다: \`npm ${cmdStr}\`\n\n허용 목록: install, ci, test, run build/dev/start/test/lint/preview`,
      { parse_mode: 'Markdown' }
    );
  }

  if (lock.get().isLocked) return ctx.reply('현재 작업 중입니다. 완료 후 다시 시도해 주세요 ⏳');

  lock.lock();
  await ctx.reply(`⚙️ \`npm ${cmdStr}\` 실행 중...`, { parse_mode: 'Markdown' });

  const rootPath = projectState.get();
  const pkgAtRoot = path.join(rootPath, 'package.json');

  if (!fs.existsSync(pkgAtRoot)) {
    // 서브디렉터리에서 package.json 탐색 (1단계 깊이)
    const found = [];
    try {
      const entries = fs.readdirSync(rootPath, { withFileTypes: true });
      for (const e of entries) {
        if (!e.isDirectory() || e.name === 'node_modules' || e.name.startsWith('.')) continue;
        if (fs.existsSync(path.join(rootPath, e.name, 'package.json'))) found.push(e.name);
      }
    } catch {}

    lock.unlock();
    if (found.length > 0) {
      const list = found.map(n => `  • \`${n}\` → /switch ${n}`).join('\n');
      return ctx.reply(
        `❌ 현재 프로젝트 루트에 package.json이 없습니다.\n\n아래 하위 폴더에서 발견됐습니다:\n${list}\n\n.env에 \`PROJECT_<이름>=<전체경로>\` 로 등록하거나,\n/switch 로 해당 프로젝트로 전환 후 다시 시도해 주세요.`,
        { parse_mode: 'Markdown' }
      );
    }
    return ctx.reply(
      `❌ \`${rootPath}\` 에 package.json이 없습니다.\n/projects 로 프로젝트 목록을 확인해 주세요.`,
      { parse_mode: 'Markdown' }
    );
  }

  if (args[0] === 'run') {
    if (!fs.existsSync(path.join(rootPath, 'node_modules'))) {
      lock.unlock();
      return ctx.reply(
        `⚠️ [${projectState.getName()}] node_modules가 없습니다.\n\n먼저 /npm install 을 실행해 의존성을 설치해 주세요.`
      );
    }

    if (args[1]) {
      let pkg;
      try { pkg = JSON.parse(fs.readFileSync(pkgAtRoot, 'utf-8')); } catch {}
      const scripts = pkg?.scripts || {};
      if (!scripts[args[1]]) {
        lock.unlock();
        const available = Object.keys(scripts);
        const list = available.length > 0
          ? available.map(s => `  • npm run ${s}`).join('\n')
          : '  (정의된 스크립트 없음)';
        return ctx.reply(`❌ [${projectState.getName()}] '${args[1]}' 스크립트가 없습니다.\n\n사용 가능한 스크립트:\n${list}`);
      }
    }
  }

  const child = spawn('npm', args, {
    cwd: rootPath,
    shell: true,
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  let stdoutBuf = '';
  let stderrBuf = '';
  child.stdout.on('data', d => { stdoutBuf += d.toString(); });
  child.stderr.on('data', d => { stderrBuf += d.toString(); });

  const killTimer = setTimeout(() => child.kill(), 300000);

  child.on('error', async (spawnErr) => {
    clearTimeout(killTimer);
    lock.unlock();
    await ctx.reply(
      `❌ \`npm\` 실행에 실패했습니다.\nnpm이 설치돼 있는지, PATH가 올바른지 확인해 주세요.\n\`${spawnErr.message}\``,
      { parse_mode: 'Markdown' }
    );
  });

  child.on('close', async (code) => {
    clearTimeout(killTimer);
    lock.unlock();

    const raw = [stdoutBuf, stderrBuf].filter(Boolean).join('\n').trim();
    const output = raw.length > 3500 ? raw.slice(0, 3500) + '\n...(이하 생략)' : raw;
    const timedOut = code === null;
    const icon = timedOut ? '⏱️' : code === 0 ? '✅' : '❌';
    const label = timedOut ? '시간 초과 (5분)' : code === 0 ? '완료' : '실패';

    try {
      await ctx.reply(
        `${icon} \`npm ${cmdStr}\` ${label}\n\`\`\`\n${output || '(출력 없음)'}\n\`\`\``,
        { parse_mode: 'Markdown' }
      );
    } catch {
      await ctx.reply(`${icon} \`npm ${cmdStr}\` ${label}\n\n${output || '(출력 없음)'}`);
    }
  });
}

/**
 * /show [filePath] — 파일 내용을 Telegram에 출력한다 (최대 50줄).
 * 인수 없이 호출하면 현재 프로젝트 파일 목록을 표시한다.
 * @param {import('telegraf').Context} ctx
 */
function handleShow(ctx) {
  if (!isAuthorized(ctx.from.id)) return;

  const filePath = ctx.message.text.split(/\s+/).slice(1).join(' ').trim();
  if (!filePath) {
    const files = buildFlatFileList(projectState.get());
    const preview = files.slice(0, 20).map(f => `  ${f}`).join('\n');
    const more = files.length > 20 ? `\n  ... 외 ${files.length - 20}개` : '';
    return ctx.reply(`사용법: /show <파일경로>\n\n📂 현재 프로젝트 파일 목록 (상위 20개):\n${preview}${more}`);
  }

  const content = readFile(filePath, projectState.get());
  if (content === null) {
    const candidates = fuzzySearch(filePath, projectState.get());
    if (candidates.length > 0) {
      const list = candidates.map((c, i) => `  ${i + 1}. \`${c}\``).join('\n');
      return ctx.reply(`🔎 \`${filePath}\` 를 찾을 수 없습니다.\n혹시 아래 파일인가요?\n${list}\n\n정확한 경로로 다시 입력해 주세요.`);
    }
    return ctx.reply(`❌ 파일을 찾을 수 없습니다: \`${filePath}\`\n\n파일 목록 확인: /show (인수 없이 입력)`);
  }

  const lines = content.split('\n');
  const LIMIT = 50;
  const preview = lines.slice(0, LIMIT).join('\n');
  const suffix = lines.length > LIMIT ? `\n\n_이하 생략 (전체 ${lines.length}줄 중 ${LIMIT}줄 표시)_` : '';

  const MAX_CHARS = 3800;
  const body = preview.length > MAX_CHARS ? preview.slice(0, MAX_CHARS) + '\n...' : preview;
  ctx.reply(`📄 \`${filePath}\`\n\`\`\`\n${body}\n\`\`\`${suffix}`, { parse_mode: 'Markdown' });
}

/**
 * /cancel — 진행 중인 모든 작업 상태(Lock, 피드백 대기, 부분 승인)를 초기화한다.
 * @param {import('telegraf').Context} ctx
 */
function handleCancel(ctx) {
  if (!isAuthorized(ctx.from.id)) return;
  const { isLocked, waitingForFeedback, snippetRetryContext, partialApproval } = lock.get();
  if (!isLocked && !waitingForFeedback && !snippetRetryContext && !partialApproval) {
    return ctx.reply('취소할 작업이 없습니다.');
  }
  lock.unlock();
  lock.clearFeedback();
  lock.clearSnippetRetry();
  lock.clearPartialApproval();
  ctx.reply('🚫 작업이 취소되었습니다. 새 명령을 입력해 주세요.');
}

// ── Action Callbacks ──────────────────────────────────────────────────────────

/**
 * [✅ 승인] 인라인 버튼 콜백 — 변경을 파일에 저장하고 Git 커밋한다.
 * originalSnippet 불일치 시 snippet_retry 흐름으로 전환한다.
 * @param {import('telegraf').Context} ctx
 */
async function handleApproveAction(ctx) {
  if (!isAuthorized(ctx.from.id)) return;

  const { pendingChanges } = lock.get();
  if (!pendingChanges) {
    await ctx.answerCbQuery();
    return ctx.reply('승인할 작업이 없습니다.');
  }

  await ctx.answerCbQuery('처리 중...');
  await ctx.editMessageReplyMarkup({ inline_keyboard: [] });

  try {
    applyChanges(pendingChanges.changes, projectState.get());
    await ctx.reply('💾 파일 저장 완료. Hot-reload가 서버를 재시작합니다.');

    const changedFiles = [...new Set(pendingChanges.changes.map(c => c.file))];
    const result = await autoCommit(projectState.get(), pendingChanges.commitMessage, changedFiles);
    if (result.success) {
      history.addTurn(
        pendingChanges.userMessage,
        pendingChanges.description,
        pendingChanges.targetFiles,
        pendingChanges.commitMessage
      );
      lock.setLastResult(`커밋 완료: ${result.message}`);
      logCommit(pendingChanges).catch(() => {});
      await ctx.reply(`✅ 커밋 완료\n\`${result.message}\``);
    } else {
      console.error('[botHandlers] Git 커밋 실패:', result.error);
      lock.setLastResult('파일 수정 성공, 커밋 실패');
      await ctx.reply('⚠️ 파일 수정은 완료됐습니다.\nGit 커밋에 실패했습니다. 터미널에서 직접 커밋해 주세요.');
    }
  } catch (err) {
    console.error('[botHandlers] 파일 저장 실패:', err.message);
    if (err.message.includes('originalSnippet을')) {
      const failedFile = err.message.replace('originalSnippet을 파일에서 찾을 수 없습니다: ', '');
      lock.setSnippetRetry({
        targetFiles: pendingChanges.targetFiles,
        userMessage: pendingChanges.userMessage,
        description: pendingChanges.description,
      });
      lock.setLastResult('코드 패턴 불일치 — 재시도 대기');
      await ctx.reply(
        `⚠️ \`${failedFile}\` 파일에서 해당 코드 패턴을 찾을 수 없어 적용에 실패했습니다.\n\nAI가 파일을 다시 읽고 코드를 재생성할까요?`,
        Markup.inlineKeyboard([
          Markup.button.callback('🔄 재시도', 'snippet_retry'),
          Markup.button.callback('❌ 취소', 'cancel_action'),
        ])
      );
    } else {
      lock.setLastResult('파일 저장 실패');
      await ctx.reply(`❌ 파일 저장에 실패했습니다.\n원인: ${err.message}\n\n원본 파일은 유지됩니다.`);
    }
  } finally {
    lock.unlock();
  }
}

/**
 * [❌ 거절] 인라인 버튼 콜백 — 변경을 취소하고 피드백 입력 대기 상태로 전환한다.
 * @param {import('telegraf').Context} ctx
 */
async function handleRejectAction(ctx) {
  if (!isAuthorized(ctx.from.id)) return;
  await ctx.answerCbQuery();
  await ctx.editMessageReplyMarkup({ inline_keyboard: [] });

  const { pendingChanges } = lock.get();
  if (pendingChanges) {
    lock.setWaitingForFeedback({
      targetFiles: pendingChanges.targetFiles,
      originalMessage: pendingChanges.userMessage,
      description: pendingChanges.description,
    });
  }
  lock.setLastResult('거절됨');
  lock.unlock();
  await ctx.reply('🚫 거절되었습니다. 파일은 변경되지 않았습니다.\n\n어떻게 수정할까요? 피드백을 입력해 주세요.\n(새 명령으로 처음부터 하려면 /cancel 을 먼저 입력하세요)');
}

/**
 * [🔄 재시도] 콜백 — originalSnippet 불일치 발생 시 최신 파일 내용으로 코드를 재생성한다.
 * @param {import('telegraf').Context} ctx
 */
async function handleSnippetRetryAction(ctx) {
  if (!isAuthorized(ctx.from.id)) return;

  const { snippetRetryContext } = lock.get();
  if (!snippetRetryContext) {
    await ctx.answerCbQuery();
    return ctx.reply('재시도할 작업이 없습니다.');
  }

  await ctx.answerCbQuery('재생성 중...');
  await ctx.editMessageReplyMarkup({ inline_keyboard: [] });

  lock.clearSnippetRetry();
  lock.lock();

  try {
    await ctx.reply('✏️ 파일을 다시 읽고 코드를 재생성 중입니다...');

    const fileContents = {};
    for (const filePath of snippetRetryContext.targetFiles) {
      let content;
      try { content = readFile(filePath, projectState.get()); } catch { content = null; }
      fileContents[filePath] = content !== null ? content : '';
    }

    let changesResult;
    try {
      changesResult = await generateChanges(
        snippetRetryContext.userMessage,
        snippetRetryContext.description,
        fileContents,
        history.formatHistory()
      );
    } catch (err) {
      console.error('[snippet_retry] 코드 재생성 실패:', err.message);
      lock.unlock();
      return ctx.reply('❌ 코드 재생성에 실패했습니다. 명령을 다시 입력해 주세요.');
    }

    normalizeChangePaths(changesResult.changes, projectState.get());

    const shimResult = {
      targetFiles: snippetRetryContext.targetFiles,
      description: snippetRetryContext.description,
      ...changesResult,
    };

    lock.setPending({ ...shimResult, userMessage: snippetRetryContext.userMessage });
    await ctx.reply(formatDiffMessage(shimResult, fileContents), {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard([
        Markup.button.callback('✅ 승인', 'approve'),
        Markup.button.callback('❌ 거절', 'reject'),
      ]),
    });
  } catch (err) {
    console.error('[snippet_retry] 처리 오류:', err.message);
    lock.unlock();
    ctx.reply('❌ 처리 중 오류가 발생했습니다. 명령을 다시 입력해 주세요.');
  }
}

/**
 * [❌ 취소] 콜백 — snippet retry 흐름을 취소하고 새 명령을 받을 수 있는 상태로 복귀한다.
 * @param {import('telegraf').Context} ctx
 */
async function handleCancelAction(ctx) {
  if (!isAuthorized(ctx.from.id)) return;
  await ctx.answerCbQuery();
  await ctx.editMessageReplyMarkup({ inline_keyboard: [] });
  lock.clearSnippetRetry();
  await ctx.reply('🚫 재시도가 취소되었습니다. 새 명령을 입력해 주세요.');
}

/**
 * 파일별 부분 승인/거절 콜백 팩토리 (pf_a_N / pf_r_N).
 * 모든 파일이 결정되면 승인된 파일만 저장하고 Git 커밋한다.
 * @param {'approved'|'rejected'} decision
 * @returns {Function} Telegraf action 콜백
 */
function makePartialHandler(decision) {
  return async (ctx) => {
    if (!isAuthorized(ctx.from.id)) return;

    const index = parseInt(ctx.match[1], 10);
    const pa = lock.getPartialApproval();
    if (!pa || pa.decisions[index] === undefined) {
      await ctx.answerCbQuery();
      return;
    }
    if (pa.decisions[index] !== null) {
      await ctx.answerCbQuery('이미 결정되었습니다.');
      return;
    }

    lock.updatePartialDecision(index, decision);
    await ctx.answerCbQuery(decision === 'approved' ? '✅ 승인' : '❌ 거절');
    await ctx.editMessageReplyMarkup({ inline_keyboard: [] });
    await ctx.reply(
      decision === 'approved'
        ? `✅ \`${pa.files[index]}\` 승인됨`
        : `❌ \`${pa.files[index]}\` 거절됨`,
      { parse_mode: 'Markdown' }
    );

    const updated = lock.getPartialApproval();
    if (!updated) return;
    if (!Object.values(updated.decisions).every(d => d !== null)) return;

    // 모든 파일 결정 완료 → 승인된 파일만 저장·커밋
    lock.clearPartialApproval();
    lock.lock();

    const approvedFiles = updated.files.filter((_, i) => updated.decisions[i] === 'approved');
    const rejectedFiles = updated.files.filter((_, i) => updated.decisions[i] === 'rejected');

    if (approvedFiles.length === 0) {
      lock.unlock();
      return ctx.reply('🚫 모든 파일이 거절되었습니다. 파일은 변경되지 않았습니다.');
    }

    const approvedChanges = approvedFiles.flatMap(f => updated.fileGroups[f]);

    try {
      applyChanges(approvedChanges, projectState.get());
      const rejectedNote = rejectedFiles.length > 0 ? ` (거절된 파일: ${rejectedFiles.join(', ')})` : '';
      await ctx.reply(`💾 ${approvedFiles.length}개 파일 저장 완료.${rejectedNote}`);

      const result = await autoCommit(projectState.get(), updated.base.commitMessage, approvedFiles);
      if (result.success) {
        history.addTurn(
          updated.base.userMessage,
          updated.base.description,
          approvedFiles,
          updated.base.commitMessage
        );
        lock.setLastResult(`커밋 완료: ${result.message}`);
        logCommit({ ...updated.base, targetFiles: approvedFiles, changes: approvedChanges }).catch(() => {});
        await ctx.reply(`✅ 커밋 완료\n\`${result.message}\``);
      } else {
        lock.setLastResult('파일 수정 성공, 커밋 실패');
        await ctx.reply('⚠️ 파일 수정은 완료됐습니다.\nGit 커밋에 실패했습니다.');
      }
    } catch (err) {
      console.error('[partial approve]', err.message);
      if (err.message.includes('originalSnippet을')) {
        const failedFile = err.message.replace('originalSnippet을 파일에서 찾을 수 없습니다: ', '');
        lock.setSnippetRetry({
          targetFiles: approvedFiles,
          userMessage: updated.base.userMessage,
          description: updated.base.description,
        });
        lock.setLastResult('코드 패턴 불일치 — 재시도 대기');
        await ctx.reply(
          `⚠️ \`${failedFile}\` 파일에서 해당 코드 패턴을 찾을 수 없어 적용에 실패했습니다.\n\nAI가 파일을 다시 읽고 코드를 재생성할까요?`,
          Markup.inlineKeyboard([
            Markup.button.callback('🔄 재시도', 'snippet_retry'),
            Markup.button.callback('❌ 취소', 'cancel_action'),
          ])
        );
      } else {
        await ctx.reply(`❌ 파일 저장에 실패했습니다.\n원인: ${err.message}\n\n원본 파일은 유지됩니다.`);
      }
    } finally {
      lock.unlock();
    }
  };
}

// ── Registration (라우팅 테이블) ───────────────────────────────────────────────

/**
 * Telegraf 봇에 모든 커맨드와 액션 핸들러를 등록한다.
 * 비즈니스 로직은 각 핸들러 함수에 있으며, 이 함수는 라우팅만 담당한다.
 * @param {import('telegraf').Telegraf} bot
 */
function registerHandlers(bot) {
  bot.command('status',   handleStatus);
  bot.command('projects', handleProjects);
  bot.command('switch',   handleSwitch);
  bot.command('history',  handleHistory);
  bot.command('undo',     handleUndo);
  bot.command('analyze',  handleAnalyze);
  bot.command('npm',      handleNpm);
  bot.command('show',     handleShow);
  bot.command('cancel',   handleCancel);

  bot.action('approve',       handleApproveAction);
  bot.action('reject',        handleRejectAction);
  bot.action('snippet_retry', handleSnippetRetryAction);
  bot.action('cancel_action', handleCancelAction);
  bot.action(/^pf_a_(\d+)$/, makePartialHandler('approved'));
  bot.action(/^pf_r_(\d+)$/, makePartialHandler('rejected'));
}

module.exports = { registerHandlers };
