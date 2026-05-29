/**
 * @fileoverview 환경변수 로드 및 검증.
 * 필수 키가 누락되면 즉시 process.exit(1)로 조기 실패(fail-fast)한다.
 * PROJECT_<이름>=<경로> 형식의 추가 환경변수를 파싱해 다중 프로젝트 맵(PROJECTS)을 빌드한다.
 */
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

const defaultName = (process.env.TARGET_PROJECT_NAME || 'default').toLowerCase();
const PROJECTS = { [defaultName]: process.env.TARGET_PROJECT_PATH };

for (const [key, val] of Object.entries(process.env)) {
  const match = key.match(/^PROJECT_(.+)$/i);
  if (match && val) {
    PROJECTS[match[1].toLowerCase()] = val;
  }
}

module.exports = {
  TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN,
  ALLOWED_USER_ID: Number(process.env.ALLOWED_USER_ID),
  TARGET_PROJECT_PATH: process.env.TARGET_PROJECT_PATH,
  PROJECTS,
};
