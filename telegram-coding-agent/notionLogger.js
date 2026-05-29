/**
 * @fileoverview Notion 커밋 로그 연동 모듈 (선택 기능).
 * NOTION_TOKEN과 NOTION_DATABASE_ID가 설정된 경우에만 활성화된다.
 *
 * Notion 설정 방법:
 * 1. https://www.notion.so/my-integrations 에서 Integration 생성 → NOTION_TOKEN
 * 2. 아래 속성을 가진 데이터베이스 생성:
 *    - 커밋  (Title)
 *    - 명령  (Rich text)
 *    - 파일  (Rich text)
 *    - 날짜  (Date)
 * 3. 데이터베이스 우측 상단 ⋯ → Connections → Integration 연결
 * 4. 데이터베이스 URL의 마지막 32자리 → NOTION_DATABASE_ID
 */
const { Client } = require('@notionhq/client');

let notion = null;

/**
 * Notion 클라이언트를 반환한다. NOTION_TOKEN이 없으면 null을 반환한다.
 * @returns {import('@notionhq/client').Client|null}
 */
function getClient() {
  if (!notion && process.env.NOTION_TOKEN) {
    notion = new Client({ auth: process.env.NOTION_TOKEN });
  }
  return notion;
}

/**
 * 단일 코드 변경을 Notion code 블록으로 변환한다.
 * @param {{ type: string, file: string, originalSnippet?: string, newSnippet?: string }} change
 * @returns {object} Notion block 객체
 */
function buildChangeBlock(change) {
  let body;
  if (change.type === 'create') {
    body = `[CREATE] ${change.file}\n${'─'.repeat(40)}\n${change.newSnippet || ''}`;
  } else if (change.type === 'delete') {
    body = `[DELETE] ${change.file}\n${'─'.repeat(40)}\n삭제:\n${change.originalSnippet || ''}`;
  } else {
    body = `[${change.type.toUpperCase()}] ${change.file}\n${'─'.repeat(40)}\n` +
      `--- 변경 전 ---\n${change.originalSnippet || ''}\n\n` +
      `+++ 변경 후 ---\n${change.newSnippet || ''}`;
  }

  return {
    object: 'block',
    type: 'code',
    code: {
      rich_text: [{ type: 'text', text: { content: body.slice(0, 1900) } }],
      language: 'diff',
    },
  };
}

/**
 * 승인된 변경 사항을 Notion 데이터베이스에 기록한다.
 * NOTION_TOKEN 또는 NOTION_DATABASE_ID가 없으면 조용히 건너뛴다.
 * @param {{ commitMessage?: string, userMessage?: string, targetFiles?: string[], changes?: Array }} pendingChanges
 * @returns {Promise<void>}
 */
async function logCommit(pendingChanges) {
  const client = getClient();
  if (!client || !process.env.NOTION_DATABASE_ID) return;

  try {
    const fileList = (pendingChanges.targetFiles || []).join(', ') || '-';
    const changeBlocks = (pendingChanges.changes || [])
      .slice(0, 10)
      .map(buildChangeBlock);

    await client.pages.create({
      parent: { database_id: process.env.NOTION_DATABASE_ID },
      properties: {
        '커밋': {
          title: [{ text: { content: (pendingChanges.commitMessage || '(제목 없음)').slice(0, 2000) } }],
        },
        '명령': {
          rich_text: [{ text: { content: (pendingChanges.userMessage || '').slice(0, 2000) } }],
        },
        '파일': {
          rich_text: [{ text: { content: fileList.slice(0, 2000) } }],
        },
        '날짜': {
          date: { start: new Date().toISOString() },
        },
      },
      children: changeBlocks,
    });
  } catch (err) {
    console.error('[Notion] 로그 기록 실패:', err.message);
  }
}

module.exports = { logCommit };
