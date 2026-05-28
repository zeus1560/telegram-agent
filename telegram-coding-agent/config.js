require('dotenv').config();

const REQUIRED_KEYS = [
  'TELEGRAM_BOT_TOKEN',
  'ALLOWED_USER_ID',
  'GROQ_API_KEY',
  'TARGET_PROJECT_PATH',
];

for (const key of REQUIRED_KEYS) {
  if (!process.env[key]) {
    console.error(`[config] 필수 환경변수 누락: ${key}`);
    console.error('  → .env.example을 참고해 .env 파일을 작성해주세요.');
    process.exit(1);
  }
}

module.exports = {
  TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN,
  ALLOWED_USER_ID: Number(process.env.ALLOWED_USER_ID),
  TARGET_PROJECT_PATH: process.env.TARGET_PROJECT_PATH,
};
