/**
 * @fileoverview 요청 인가 및 민감 파일 보호 유틸리티.
 * 단일 사용자(ALLOWED_USER_ID) 외 모든 요청을 조용히 차단하고,
 * .env·.key·.pem 등 민감 파일에 대한 읽기·수정 시도를 이중으로 방어한다.
 */
const path = require('path');
const { ALLOWED_USER_ID } = require('./config');

/**
 * Telegram User ID가 허가된 사용자인지 확인한다.
 * @param {number} userId ctx.from.id 값
 * @returns {boolean}
 */
function isAuthorized(userId) {
  return userId === ALLOWED_USER_ID;
}

const SENSITIVE_PATTERNS = [
  /^\.env(\.|$)/i,
  /\.key$/i,
  /\.pem$/i,
  /\.cert$/i,
  /\.p12$/i,
  /\.pfx$/i,
  /\.secret$/i,
  /credentials\.json$/i,
  /service-account.*\.json$/i,
  /id_rsa/i,
  /id_ed25519/i,
];

const SENSITIVE_KEYWORDS = ['.env', '.key', '.pem', '.cert', '.p12', '.pfx', '.secret'];

/**
 * 파일 경로가 민감 파일 패턴에 해당하는지 검사한다.
 * AI가 생성한 targetFiles를 커밋 전에 필터링할 때 사용한다.
 * @param {string} filePath 검사할 파일 경로
 * @returns {boolean}
 */
function isSensitiveFile(filePath) {
  const basename = path.basename(filePath);
  return SENSITIVE_PATTERNS.some(p => p.test(basename) || p.test(filePath));
}

/**
 * 사용자 메시지 텍스트에 민감 파일 키워드가 포함됐는지 검사한다.
 * AI 호출 전 프리플라이트 체크로 사용해 불필요한 LLM 비용을 차단한다.
 * @param {string} text 사용자 자연어 명령
 * @returns {boolean}
 */
function mentionsSensitiveFile(text) {
  const lower = text.toLowerCase();
  return SENSITIVE_KEYWORDS.some(kw => lower.includes(kw));
}

module.exports = { isAuthorized, isSensitiveFile, mentionsSensitiveFile };
