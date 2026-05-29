/**
 * @fileoverview 타겟 프로젝트 파일 I/O 유틸리티.
 * 파일 읽기·쓰기, 퍼지 검색, AI 변경 사항 적용, 경로 정규화를 담당한다.
 */
const fs = require('fs');
const path = require('path');

const IGNORE_DIRS = new Set(['node_modules', '.git', 'dist', 'build', '.next', 'coverage']);

/**
 * 타겟 프로젝트 내 파일을 상대 경로로 읽는다.
 * @param {string} relativePath 프로젝트 루트 기준 상대 경로
 * @param {string} rootPath 프로젝트 루트 절대 경로
 * @returns {string|null} 파일 내용, 존재하지 않으면 null
 */
function readFile(relativePath, rootPath) {
  const fullPath = path.join(rootPath, relativePath);
  if (!fs.existsSync(fullPath)) return null;
  try {
    return fs.readFileSync(fullPath, 'utf-8');
  } catch (err) {
    const reason = err.code === 'EACCES' ? '읽기 권한이 없습니다' : err.message;
    throw new Error(`파일 읽기 실패 (${relativePath}): ${reason}`);
  }
}

/**
 * 타겟 프로젝트 내 파일을 상대 경로로 저장한다. 중간 디렉터리가 없으면 자동 생성한다.
 * @param {string} relativePath 프로젝트 루트 기준 상대 경로
 * @param {string} content 저장할 내용
 * @param {string} rootPath 프로젝트 루트 절대 경로
 */
function writeFile(relativePath, content, rootPath) {
  const fullPath = path.join(rootPath, relativePath);
  const dir = path.dirname(fullPath);
  try {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(fullPath, content, 'utf-8');
  } catch (err) {
    const reason = err.code === 'EACCES' ? '쓰기 권한이 없습니다'
      : err.code === 'ENOSPC' ? '디스크 공간이 부족합니다'
      : err.message;
    throw new Error(`파일 저장 실패 (${relativePath}): ${reason}`);
  }
}

/**
 * 파일명으로 프로젝트 내 파일을 퍼지 검색한다 (최대 maxResults개).
 * AI가 잘못된 경로를 반환했을 때 후보를 사용자에게 제안하는 용도로 쓰인다.
 * @param {string} filename 검색할 파일명 (부분 일치)
 * @param {string} rootPath 프로젝트 루트 절대 경로
 * @param {number} [maxResults=3] 반환할 최대 결과 수
 * @returns {string[]} 일치하는 파일의 상대 경로 목록
 */
function fuzzySearch(filename, rootPath, maxResults = 3) {
  const base = path.basename(filename).toLowerCase();
  const results = [];

  function walk(dir) {
    if (results.length >= maxResults) return;
    let entries;
    try { entries = fs.readdirSync(dir, { withFileTypes: true }); }
    catch { return; }

    for (const entry of entries) {
      if (results.length >= maxResults) return;
      if (entry.isDirectory()) {
        if (!IGNORE_DIRS.has(entry.name)) walk(path.join(dir, entry.name));
      } else if (entry.name.toLowerCase().includes(base)) {
        results.push(path.relative(rootPath, path.join(dir, entry.name)).replace(/\\/g, '/'));
      }
    }
  }

  walk(rootPath);
  return results;
}

const SOURCE_EXTS = new Set([
  '.js', '.ts', '.jsx', '.tsx', '.json', '.json5',
  '.css', '.scss', '.less', '.html', '.vue', '.svelte',
  '.py', '.java', '.go', '.rs', '.rb', '.php',
  '.md', '.yaml', '.yml', '.env', '.env.example',
  '.sh', '.sql', '.prisma', '.graphql',
]);

/**
 * 프로젝트 내 소스 파일 경로를 평탄한 배열로 반환한다.
 * LLM이 정확한 경로를 선택할 수 있도록 node_modules 등 불필요한 디렉터리는 제외한다.
 * @param {string} rootPath 프로젝트 루트 절대 경로
 * @returns {string[]} 상대 경로 목록 (슬래시 구분)
 */
function buildFlatFileList(rootPath) {
  const results = [];

  function walk(dir) {
    let entries;
    try { entries = fs.readdirSync(dir, { withFileTypes: true }); }
    catch { return; }

    for (const entry of entries) {
      if (IGNORE_DIRS.has(entry.name)) continue;
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (SOURCE_EXTS.has(path.extname(entry.name).toLowerCase())) {
        results.push(path.relative(rootPath, fullPath).replace(/\\/g, '/'));
      }
    }
  }

  walk(rootPath);
  return results;
}

/**
 * AI가 생성한 변경 사항을 실제 파일에 적용한다.
 * replace 타입은 originalSnippet이 파일에 정확히 1개 존재해야 한다.
 * @param {Array<{file: string, type: string, originalSnippet: string, newSnippet: string}>} changes
 * @param {string} rootPath 프로젝트 루트 절대 경로
 * @throws {Error} originalSnippet을 찾을 수 없거나 중복될 때
 */
function applyChanges(changes, rootPath) {
  const fileMap = {};
  for (const change of changes) {
    if (change.type === 'create') {
      fileMap[change.file] = change.newSnippet || '';
      continue;
    }

    if (!fileMap[change.file]) {
      const content = readFile(change.file, rootPath);
      if (content === null) throw new Error(`파일을 찾을 수 없습니다: ${change.file}`);
      fileMap[change.file] = content;
    }

    if (change.type === 'replace') {
      const occurrences = fileMap[change.file].split(change.originalSnippet).length - 1;
      if (occurrences === 0) {
        throw new Error(`originalSnippet을 파일에서 찾을 수 없습니다: ${change.file}`);
      }
      if (occurrences > 1) {
        throw new Error(`originalSnippet을 파일에서 찾을 수 없습니다: ${change.file} (동일 스니펫 ${occurrences}개 발견 — 더 넓은 컨텍스트로 재시도)`);
      }
      fileMap[change.file] = fileMap[change.file].replace(change.originalSnippet, change.newSnippet);
    } else if (change.type === 'insert') {
      fileMap[change.file] = fileMap[change.file] + '\n' + change.newSnippet;
    } else if (change.type === 'delete') {
      fileMap[change.file] = fileMap[change.file].replace(change.originalSnippet, '');
    }
  }

  for (const [filePath, content] of Object.entries(fileMap)) {
    writeFile(filePath, content, rootPath);
  }
}

/**
 * AI가 생성한 파일 경로를 실제 프로젝트 파일 목록과 대조해 정규화한다.
 * 예) 프로젝트 루트가 front인데 AI가 "front/src/App.jsx" 반환 → "src/App.jsx" 로 교정
 * @param {Array<{file: string, type: string}>} changes AI 생성 변경 목록
 * @param {string} rootPath 프로젝트 루트 절대 경로
 * @returns {Array} 정규화된 changes (원본 배열을 직접 수정 후 반환)
 */
function normalizeChangePaths(changes, rootPath) {
  const fileList = buildFlatFileList(rootPath);
  const fileSet = new Set(fileList);

  for (const change of changes) {
    if (change.type === 'create' || fileSet.has(change.file)) continue;

    // 케이스 1: AI가 상위 경로를 추가한 경우 (front/src/App.jsx → src/App.jsx)
    const stripped = change.file.replace(/^[^/]+\//, '');
    if (fileSet.has(stripped)) { change.file = stripped; continue; }

    // 케이스 2: AI가 상위 경로를 빠뜨린 경우 (src/App.jsx → front/src/App.jsx)
    const bySuffix = fileList.find(f => f.endsWith('/' + change.file));
    if (bySuffix) { change.file = bySuffix; continue; }

    // 케이스 3: 파일명만 매칭 (최후 수단, 유일할 때만 적용)
    const basename = path.basename(change.file);
    const byBaseAll = fileList.filter(f => path.basename(f) === basename);
    if (byBaseAll.length === 1) { change.file = byBaseAll[0]; }
  }

  return changes;
}

module.exports = { readFile, writeFile, fuzzySearch, buildFlatFileList, applyChanges, normalizeChangePaths };
