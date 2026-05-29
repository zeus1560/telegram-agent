/**
 * @fileoverview Diff 생성 및 Telegram 메시지 포맷팅 유틸리티.
 * AI 변경 사항을 사용자가 검토할 수 있는 diff 형식으로 변환한다.
 */
const Diff = require('diff');

/**
 * 원본과 수정본을 비교해 unified diff 문자열을 반환한다.
 * Telegram 코드블록 길이 제한을 고려해 헤더(--- / +++)는 제거하고 본문만 반환한다.
 * @param {string} original 원본 파일 내용
 * @param {string} modified 수정된 파일 내용
 * @param {string} filename diff 헤더에 표시할 파일명
 * @returns {string} unified diff 본문
 */
function generateDiff(original, modified, filename) {
  const patch = Diff.createPatch(filename, original, modified, '', '');
  // 헤더 2줄(--- / +++) 이후 변경 내용만 추출
  const lines = patch.split('\n').slice(2).join('\n');
  return lines.trim();
}

/**
 * 단일 파일 변경에 대한 Telegram diff 메시지를 생성한다.
 * 승인/거절 버튼과 함께 전송되는 메인 변경 프리뷰에 사용된다.
 * @param {{ changes: Array, description: string }} shimResult AI 생성 결과
 * @param {Object.<string, string>} originalContents 파일 경로 → 원본 내용 맵
 * @returns {string} Markdown 형식 diff 메시지
 */
function formatDiffMessage(shimResult, originalContents) {
  const parts = [];

  for (const change of shimResult.changes) {
    const original = originalContents[change.file] || '';
    let modified = original;

    if (change.type === 'replace') {
      modified = original.replace(change.originalSnippet, change.newSnippet);
    } else if (change.type === 'insert') {
      modified = original + '\n' + change.newSnippet;
    } else if (change.type === 'delete') {
      modified = original.replace(change.originalSnippet, '');
    } else if (change.type === 'create') {
      modified = change.newSnippet || '';
    }

    const diff = generateDiff(original, modified, change.file);
    parts.push(`📄 *${change.file}*\n\`\`\`diff\n${diff}\n\`\`\``);
  }

  const summary = shimResult.description || '코드 수정';
  return `📋 *수정 계획*\n\n${parts.join('\n\n')}\n\n✏️ ${summary}\n\n진행할까요?`;
}

/**
 * 다중 파일 부분 승인 시 파일 단위 diff 메시지를 생성한다.
 * @param {string} file 파일 상대 경로
 * @param {Array<{type: string, originalSnippet: string, newSnippet: string}>} changes 해당 파일의 변경 목록
 * @param {string} originalContent 해당 파일의 원본 내용
 * @returns {string} Markdown 형식 diff 메시지
 */
function formatFileDiff(file, changes, originalContent) {
  const original = originalContent || '';
  let modified = original;

  for (const change of changes) {
    if (change.type === 'replace') {
      modified = modified.replace(change.originalSnippet, change.newSnippet);
    } else if (change.type === 'insert') {
      modified = modified + '\n' + change.newSnippet;
    } else if (change.type === 'delete') {
      modified = modified.replace(change.originalSnippet, '');
    } else if (change.type === 'create') {
      modified = change.newSnippet || '';
    }
  }

  const diff = generateDiff(original, modified, file);
  return `📄 *${file}*\n\`\`\`diff\n${diff}\n\`\`\``;
}

module.exports = { formatDiffMessage, formatFileDiff };
