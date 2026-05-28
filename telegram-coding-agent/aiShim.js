const Groq = require('groq-sdk');

const MAX_FILE_LINES = 150;
const MAX_TREE_LINES = 100;

function truncateContent(content) {
  const lines = content.split('\n');
  if (lines.length <= MAX_FILE_LINES) return content;
  return lines.slice(0, MAX_FILE_LINES).join('\n') + '\n// ... (이하 생략)';
}

function truncateTree(tree) {
  const lines = tree.split('\n');
  if (lines.length <= MAX_TREE_LINES) return tree;
  return lines.slice(0, MAX_TREE_LINES).join('\n') + '\n... (이하 생략)';
}

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const INTENT_PROMPT = `당신은 코드 수정 의도 분석기입니다.
사용자 명령과 아래 파일 목록을 보고 어떤 파일을 수정해야 하는지 파악하세요.
반드시 순수 JSON만 반환하세요. 마크다운 코드 블록 금지.

중요 규칙:
- targetFiles에는 반드시 아래 "존재하는 파일 목록"에 있는 경로만 그대로 사용하세요.
- 목록에 없는 경로를 절대 만들거나 추측하지 마세요.
- 사용자가 파일명을 직접 언급했다면 목록에서 해당 이름을 찾아 정확한 경로를 사용하세요.
- 어떤 파일인지 불분명하면 clarification_needed를 반환하세요.

스키마:
{
  "status": "ok" | "clarification_needed",
  "clarificationQuestion": "string (clarification_needed일 때만)",
  "targetFiles": ["목록에 있는 정확한 상대경로"],
  "description": "변경 내용 한 줄 요약"
}`;

const CHANGES_PROMPT = `당신은 코드 수정 전문가입니다.
아래 파일 내용을 직접 보고 정확한 수정 코드를 생성하세요.
반드시 순수 JSON만 반환하세요. 마크다운 코드 블록 금지.

스키마:
{
  "changes": [
    {
      "file": "상대경로/파일.js",
      "type": "replace" | "insert" | "delete",
      "targetIdentifier": "함수명 또는 위치 힌트",
      "originalSnippet": "파일에서 정확히 찾을 수 있는 변경 전 코드",
      "newSnippet": "변경 후 코드"
    }
  ],
  "commitMessage": "feat: 커밋 메시지"
}

규칙:
- originalSnippet은 반드시 제공된 실제 파일 내용에서 그대로 복사한 문자열
- 공백, 따옴표, 들여쓰기까지 완전히 일치해야 함
- 수정 범위는 최소한으로 유지`;

const VALID_JSON_ESCAPES = new Set(['"', '\\', '/', 'b', 'f', 'n', 'r', 't', 'u']);

function sanitizeJson(raw) {
  // 마크다운 코드블록 제거
  let text = raw.trim()
    .replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();

  // \x 형태를 한 쌍씩 읽어서: \\(유효) → 유지, \c(무효) → \\c 로 수정
  text = text.replace(/\\([\s\S])/g, (match, char) => {
    if (VALID_JSON_ESCAPES.has(char)) return match;
    return '\\\\' + char;
  });

  return text;
}

async function callGroq(model, systemPrompt, userContent) {
  const response = await groq.chat.completions.create({
    model,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userContent },
    ],
    temperature: 0,
  });
  const raw = response.choices[0].message.content;
  const text = sanitizeJson(raw);
  try {
    return JSON.parse(text);
  } catch (e) {
    console.error('[aiShim] JSON 파싱 실패:', e.message);
    console.error('[aiShim] 원본 응답:', raw.slice(0, 500));
    throw new Error('AI 응답을 처리할 수 없습니다. 다시 시도해 주세요.');
  }
}

async function identifyTargetFiles(userMessage, fileList) {
  return callGroq(
    'llama-3.1-8b-instant',
    INTENT_PROMPT,
    `존재하는 파일 목록 (이 경로만 사용할 것):\n${fileList}\n\n명령: ${userMessage}`
  );
}

async function generateChanges(userMessage, description, fileContents) {
  const filesSection = Object.entries(fileContents)
    .map(([path, content]) => `=== ${path} ===\n${truncateContent(content)}`)
    .join('\n\n');
  return callGroq(
    'llama-3.3-70b-versatile',
    CHANGES_PROMPT,
    `명령: ${userMessage}\n수정 의도: ${description}\n\n실제 파일 내용:\n${filesSection}`
  );
}

module.exports = { identifyTargetFiles, generateChanges };
