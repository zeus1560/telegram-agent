const { isAuthorized } = require('./security');
const lock = require('./lock');
const { applyChanges } = require('./fileOps');
const { autoCommit } = require('./gitHandler');
const { TARGET_PROJECT_PATH } = require('./config');

function registerHandlers(bot) {
  // /status 명령
  bot.command('status', (ctx) => {
    if (!isAuthorized(ctx.from.id)) return;
    const { isLocked, lastResult } = lock.get();
    const status = isLocked ? '🔒 작업 중' : '🟢 대기 중';
    ctx.reply(`상태: ${status}\n마지막 작업: ${lastResult}`);
  });

  // /cancel 명령
  bot.command('cancel', (ctx) => {
    if (!isAuthorized(ctx.from.id)) return;
    if (!lock.get().isLocked) {
      return ctx.reply('취소할 작업이 없습니다.');
    }
    lock.unlock();
    ctx.reply('🚫 작업이 취소되었습니다.');
  });

  // [✅ 승인] 콜백
  bot.action('approve', async (ctx) => {
    if (!isAuthorized(ctx.from.id)) return;

    const { pendingChanges } = lock.get();
    if (!pendingChanges) {
      await ctx.answerCbQuery();
      return ctx.reply('승인할 작업이 없습니다.');
    }

    await ctx.answerCbQuery('처리 중...');
    await ctx.editMessageReplyMarkup({ inline_keyboard: [] });

    try {
      // 파일 저장
      applyChanges(pendingChanges.changes, TARGET_PROJECT_PATH);
      await ctx.reply('💾 파일 저장 완료. Hot-reload가 서버를 재시작합니다.');

      // Git 커밋
      const result = await autoCommit(TARGET_PROJECT_PATH, pendingChanges.commitMessage);
      if (result.success) {
        lock.setLastResult(`커밋 완료: ${result.message}`);
        await ctx.reply(`✅ 커밋 완료\n\`${result.message}\``);
      } else {
        console.error('[botHandlers] Git 커밋 실패:', result.error);
        lock.setLastResult('파일 수정 성공, 커밋 실패');
        await ctx.reply('⚠️ 파일 수정은 완료됐습니다.\nGit 커밋에 실패했습니다. 터미널에서 직접 커밋해 주세요.');
      }
    } catch (err) {
      console.error('[botHandlers] 파일 저장 실패:', err.message);
      lock.setLastResult('파일 저장 실패');
      await ctx.reply('❌ 파일 저장에 실패했습니다. 원본 파일은 유지됩니다.');
    } finally {
      lock.unlock();
    }
  });

  // [❌ 거절] 콜백
  bot.action('reject', async (ctx) => {
    if (!isAuthorized(ctx.from.id)) return;
    await ctx.answerCbQuery();
    await ctx.editMessageReplyMarkup({ inline_keyboard: [] });
    lock.setLastResult('거절됨');
    lock.unlock();
    ctx.reply('🚫 취소되었습니다. 파일은 변경되지 않았습니다.');
  });
}

module.exports = { registerHandlers };
