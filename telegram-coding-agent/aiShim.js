/**
 * @fileoverview Groq LLM 호출 어댑터.
 * 사용자 자연어 명령을 두 단계 AI 호출로 변환해 ShimResult JSON을 반환한다.
 *   1단계: identifyTargetFiles — 수정 대상 파일 식별 (llama-3.1-8b-instant)
 *   2단계: generateChanges   — 실제 코드 변경 생성 (llama-3.3-70b-versatile)
 */
const Groq = require('groq-sdk');
const { INTENT_PROMPT, CHANGES_PROMPT, ANALYZE_PROMPT } = require('./prompts');

/** LLM 컨텍스트 절약: 파일 내용은 최대 이 줄 수만 전송한다. */
const CONTENT_LINE_LIMIT = 150;
/** LLM 컨텍스트 절약: 파일 트리는 최대 이 줄 수만 전송한다. */
const TREE_LINE_LIMIT = 100;

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

/**
 * 파일 내용이 CONTENT_LINE_LIMIT을 초과하면 앞부분만 잘라 반환한다.
 * @param {string} content 원본 파일 내용
 * @returns {string}
 */
function truncateContent(content) {
  const lines = content.split('\n');
  if (lines.length <= CONTENT_LINE_LIMIT) return content;
  return lines.slice(0, CONTENT_LINE_LIMIT).join('\n') + '\n// ... (이하 생략)';
}

/**
 * 파일 트리 문자열이 TREE_LINE_LIMIT을 초과하면 잘라 반환한다.
 * @param {string} tree 파일 경로 목록 (줄 구분)
 * @returns {string}
 */
function truncateTree(tree) {
  const lines = tree.split('\n');
  if (lines.length <= TREE_LINE_LIMIT) return tree;
  return lines.slice(0, TREE_LINE_LIMIT).join('\n') + '\n... (이하 생략)';
}

/**
 * AI 응답에서 마크다운 코드블록을 제거하고 JSON 파싱 전 문자열을 정규화한다.
 * 무효 이스케이프 시퀀스와 trailing comma를 수정한다.
 * @param {string} raw Groq 응답 원본 문자열
 * @returns {string} JSON.parse 가능한 정리된 문자열
 */
function sanitizeJson(raw) {
  let text = raw.trim()
    .replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();

  // 유효 이스케이프(\uXXXX, \", \\, 등)는 유지, 그 외 무효 이스케이프는 리터럴로 변환
  text = text.replace(/\\(u[0-9a-fA-F]{4}|["\\/bfnrt]|[\s\S])/g, (match, capture) => {
    if (capture.length > 1 || /^["\\/bfnrt]$/.test(capture)) return match;
    return '\\\\' + capture;
  });

  // JSON 표준 위반인 trailing comma 제거 (AI가 자주 생성하는 패턴)
  text = text.replace(/,\s*([}\]])/g, '$1');
  return text;
}

/**
 * Groq API를 호출하고 응답을 JSON으로 파싱한다.
 * 1차 방어: response_format json_object로 API 레벨에서 valid JSON 강제.
 * 2차 방어: sanitizeJson으로 마크다운 블록 제거 및 이스케이프 정규화.
 * 파싱 실패 시 clarification_needed 폴백 객체를 반환한다.
 * @param {string} model Groq 모델 ID
 * @param {string} systemPrompt 시스템 프롬프트
 * @param {string} userContent 사용자 입력 내용
 * @param {string} [label] 콘솔 타이밍 출력용 레이블
 * @returns {Promise<object>}
 */
async function callGroq(model, systemPrompt, userContent, label = model) {
  let response;
  const t0 = Date.now();
  try {
    response = await groq.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userContent },
      ],
      temperature: 0,
      response_format: { type: 'json_object' },
    });
  } catch (err) {
    if (err.status === 429) throw new Error('AI API 요청 한도를 초과했습니다. 잠시 후 다시 시도해 주세요.');
    if (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND' || err.code === 'ETIMEDOUT') {
      throw new Error('AI API 서버에 연결할 수 없습니다. 네트워크 상태를 확인해 주세요.');
    }
    throw new Error(`AI API 호출 실패: ${err.message}`);
  }
  const elapsed = Date.now() - t0;
  console.log(`[AI ${label}] 완료 — ${elapsed}ms`);

  const raw = response.choices[0].message.content;
  const text = sanitizeJson(raw);
  try {
    return JSON.parse(text);
  } catch (e) {
    console.error('[aiShim] JSON 파싱 실패:', e.message);
    console.error('[aiShim] 원본 응답:', raw.slice(0, 500));
    return {
      status: 'clarification_needed',
      clarificationQuestion: '명령이 너무 모호합니다. 수정할 파일명과 변경 내용을 구체적으로 알려주세요.\n예) "src/App.jsx 파일의 버튼 색을 빨간색으로 바꿔줘"',
      targetFiles: [],
      description: '',
    };
  }
}

/**
 * 1단계 AI 호출 — 자연어 명령에서 수정 대상 파일과 액션을 식별한다.
 * @param {string} userMessage 사용자 자연어 명령
 * @param {string} fileList 프로젝트 파일 경로 목록 (줄 구분)
 * @param {string} [historyContext=''] 이전 대화 기록 (파일 위치 파악 전용)
 * @returns {Promise<{status: string, action: string, targetFiles: string[], description: string, clarificationQuestion: string}>}
 */
async function identifyTargetFiles(userMessage, fileList, historyContext = '') {
  const historySection = historyContext
    ? `\n\n[이전 대화 기록 — 파일 위치 파악 참고용]\n${historyContext}`
    : '';
  return callGroq(
    'llama-3.1-8b-instant',
    INTENT_PROMPT,
    `[존재하는 파일 목록 — 이 경로만 사용할 것]\n${truncateTree(fileList)}${historySection}\n\n[현재 명령 — 반드시 이것만 따를 것]\n${userMessage}`,
    '1단계 llama-8b'
  );
}

/**
 * 2단계 AI 호출 — 실제 파일 내용을 기반으로 구체적인 코드 변경을 생성한다.
 * @param {string} userMessage 사용자 자연어 명령
 * @param {string} description 1단계에서 식별된 변경 의도 요약
 * @param {Object.<string, string>} fileContents 파일 경로 → 내용 맵
 * @param {string} [historyContext=''] 이전 대화 기록 (파일 위치 참고 전용)
 * @returns {Promise<{changes: Array<{file: string, type: string, originalSnippet: string, newSnippet: string}>, commitMessage: string}>}
 */
async function generateChanges(userMessage, description, fileContents, historyContext = '') {
  const filesSection = Object.entries(fileContents)
    .map(([filePath, content]) => `=== ${filePath} ===\n${truncateContent(content)}`)
    .join('\n\n');
  const historySection = historyContext
    ? `\n\n[이전 대화 기록 — 파일 위치 참고 전용, 명령 해석에 사용 금지]\n${historyContext}`
    : '';
  return callGroq(
    'llama-3.3-70b-versatile',
    CHANGES_PROMPT,
    `[현재 명령 — 반드시 이것만 따를 것]\n${userMessage}\n\n[수정 의도]\n${description}${historySection}\n\n[실제 파일 내용]\n${filesSection}`,
    '2단계 llama-70b'
  );
}

/**
 * /analyze 커맨드 — AI가 파일 품질을 분석한 한국어 보고서를 반환한다.
 * @param {string} filePath 분석할 파일의 상대 경로
 * @param {string} content 파일 내용
 * @returns {Promise<string>} 카테고리별 분석 보고서 (텍스트)
 */
async function analyzeCode(filePath, content) {
  let response;
  try {
    response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: ANALYZE_PROMPT },
        { role: 'user', content: `파일: ${filePath}\n\n${truncateContent(content)}` },
      ],
      temperature: 0.3,
    });
  } catch (err) {
    if (err.status === 429) throw new Error('AI API 요청 한도를 초과했습니다. 잠시 후 다시 시도해 주세요.');
    if (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND' || err.code === 'ETIMEDOUT') {
      throw new Error('AI API 서버에 연결할 수 없습니다. 네트워크 상태를 확인해 주세요.');
    }
    throw new Error(`AI API 호출 실패: ${err.message}`);
  }
  return response.choices[0].message.content;
}

module.exports = { identifyTargetFiles, generateChanges, analyzeCode };
