/**
 * @fileoverview Telegram Coding Agent 진입점.
 * 봇을 초기화하고 PM2 크래시 감지 플래그를 관리한다.
 * nodemon/PM2가 프로세스를 감시하므로 앱 재시작은 이 파일이 담당하지 않는다.
 */
const fs = require('fs');
const path = require('path');
const { Telegraf } = require('telegraf');
const { TELEGRAM_BOT_TOKEN, ALLOWED_USER_ID, TARGET_PROJECT_PATH } = require('./config');
const { handleMessage } = require('./orchestrator');
const { registerHandlers } = require('./botHandlers');

const CRASH_FLAG = path.join(__dirname, '.crash_guard');

const bot = new Telegraf(TELEGRAM_BOT_TOKEN);

registerHandlers(bot);
bot.on('text', handleMessage);

// bot.launch()는 Telegraf v4에서 봇이 종료될 때 resolve됨 → .then() 사용 금지
bot.launch();

const wasCrash = fs.existsSync(CRASH_FLAG);
fs.writeFileSync(CRASH_FLAG, String(process.pid));

const startupMsg = wasCrash
  ? '⚠️ 봇이 비정상 종료 후 PM2에 의해 재시작되었습니다.'
  : '🟢 Telegram Coding Agent가 시작되었습니다.';

console.log('🤖 Telegram Coding Agent 시작됨');
console.log(`   타겟 프로젝트: ${TARGET_PROJECT_PATH}`);

bot.telegram.sendMessage(ALLOWED_USER_ID, startupMsg).catch(e => {
  console.error('[startup] 알림 전송 실패:', e.message);
});

/**
 * 봇을 정상 종료하고 크래시 감지 플래그 파일을 삭제한다.
 * 플래그가 남아 있으면 다음 시작 시 비정상 종료로 오인되므로 반드시 제거한다.
 * @param {'SIGINT'|'SIGTERM'} signal 수신한 OS 시그널
 */
function cleanShutdown(signal) {
  try { fs.unlinkSync(CRASH_FLAG); } catch {}
  bot.stop(signal);
}

process.once('SIGINT', () => cleanShutdown('SIGINT'));
process.once('SIGTERM', () => cleanShutdown('SIGTERM'));
