/**
 * @fileoverview 최근 코드 수정 내역 관리 모듈.
 * 메모리와 .history.json 파일에 최대 MAX_TURNS건을 유지하며,
 * AI의 파일 위치 추론(historyContext)과 /history /undo 커맨드에 활용된다.
 */
const fs = require('fs');
const path = require('path');

const MAX_TURNS = 5;
const HISTORY_FILE = path.join(__dirname, '.history.json');

let turns = [];

// 시작 시 파일에서 이전 내역 복원 (봇 재시작 후에도 히스토리 유지)
try {
  if (fs.existsSync(HISTORY_FILE)) {
    turns = JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf-8'));
  }
} catch {
  turns = [];
}

/**
 * 현재 turns 배열을 .history.json 파일에 저장한다.
 */
function save() {
  try {
    fs.writeFileSync(HISTORY_FILE, JSON.stringify(turns, null, 2), 'utf-8');
  } catch (e) {
    console.error('[history] 저장 실패:', e.message);
  }
}

/**
 * 수정 내역을 한 건 추가한다. MAX_TURNS 초과 시 가장 오래된 항목을 제거한다.
 * @param {string} userMessage 사용자 자연어 명령
 * @param {string} description AI가 요약한 변경 내용
 * @param {string[]} files 수정된 파일 경로 목록
 * @param {string} commitMessage Git 커밋 메시지
 */
function addTurn(userMessage, description, files, commitMessage) {
  turns.push({ userMessage, description, files, commitMessage, timestamp: Date.now() });
  if (turns.length > MAX_TURNS) turns.shift();
  save();
}

/**
 * 가장 최근 내역 1건을 제거한다. /undo 커맨드 실행 후 호출된다.
 */
function removeLast() {
  turns.pop();
  save();
}

/**
 * AI 프롬프트용 히스토리 컨텍스트 문자열을 생성한다.
 * @returns {string} "[이전 N] 명령: ..." 형식의 줄 구분 문자열, 비어있으면 빈 문자열
 */
function formatHistory() {
  if (turns.length === 0) return '';
  return turns
    .map((t, i) => {
      const filesStr = t.files && t.files.length ? ` (수정파일: ${t.files.join(', ')})` : '';
      return `[이전 ${i + 1}] 명령: "${t.userMessage}" → ${t.description}${filesStr}`;
    })
    .join('\n');
}

/**
 * 저장된 모든 내역의 복사본을 반환한다.
 * @returns {Array<{userMessage: string, description: string, files: string[], commitMessage: string, timestamp: number}>}
 */
function getAll() {
  return [...turns];
}

module.exports = { addTurn, removeLast, formatHistory, getAll };
