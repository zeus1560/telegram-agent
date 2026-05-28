const { Telegraf } = require('telegraf');
const { TELEGRAM_BOT_TOKEN, TARGET_PROJECT_PATH } = require('./config');
const { handleMessage } = require('./orchestrator');
const { registerHandlers } = require('./botHandlers');

const bot = new Telegraf(TELEGRAM_BOT_TOKEN);

registerHandlers(bot);
bot.on('text', handleMessage);

bot.launch();

console.log('🤖 Telegram Coding Agent 시작됨');
console.log(`   타겟 프로젝트: ${TARGET_PROJECT_PATH}`);

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
