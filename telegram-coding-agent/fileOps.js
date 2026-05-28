const fs = require('fs');
const path = require('path');

const IGNORE_DIRS = new Set(['node_modules', '.git', 'dist', 'build', '.next', 'coverage']);

function readFile(relativePath, rootPath) {
  const fullPath = path.join(rootPath, relativePath);
  if (!fs.existsSync(fullPath)) return null;
  return fs.readFileSync(fullPath, 'utf-8');
}

function writeFile(relativePath, content, rootPath) {
  const fullPath = path.join(rootPath, relativePath);
  fs.writeFileSync(fullPath, content, 'utf-8');
}

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
        results.push(path.relative(rootPath, path.join(dir, entry.name)));
      }
    }
  }

  walk(rootPath);
  return results;
}

function buildFileTree(rootPath, indent = '') {
  const lines = [];

  function walk(dir, prefix) {
    let entries;
    try { entries = fs.readdirSync(dir, { withFileTypes: true }); }
    catch { return; }

    const filtered = entries.filter(e => !IGNORE_DIRS.has(e.name));
    filtered.forEach((entry, i) => {
      const isLast = i === filtered.length - 1;
      const connector = isLast ? '└── ' : '├── ';
      lines.push(prefix + connector + entry.name);
      if (entry.isDirectory()) {
        walk(path.join(dir, entry.name), prefix + (isLast ? '    ' : '│   '));
      }
    });
  }

  walk(rootPath, indent);
  return lines.join('\n');
}

const SOURCE_EXTS = new Set([
  '.js', '.ts', '.jsx', '.tsx', '.json', '.json5',
  '.css', '.scss', '.less', '.html', '.vue', '.svelte',
  '.py', '.java', '.go', '.rs', '.rb', '.php',
  '.md', '.yaml', '.yml', '.env', '.env.example',
  '.sh', '.sql', '.prisma', '.graphql',
]);

// 소스 파일만 상대경로 목록으로 반환 (LLM이 정확한 경로를 고르도록)
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
        results.push(path.relative(rootPath, fullPath));
      }
    }
  }

  walk(rootPath);
  return results;
}

function applyChanges(changes, rootPath) {
  // 파일별로 그룹핑해서 순서대로 적용
  const fileMap = {};
  for (const change of changes) {
    if (!fileMap[change.file]) {
      const content = readFile(change.file, rootPath);
      if (content === null) throw new Error(`파일을 찾을 수 없습니다: ${change.file}`);
      fileMap[change.file] = content;
    }

    if (change.type === 'replace') {
      if (!fileMap[change.file].includes(change.originalSnippet)) {
        throw new Error(`originalSnippet을 파일에서 찾을 수 없습니다: ${change.file}`);
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

module.exports = { readFile, writeFile, fuzzySearch, buildFileTree, buildFlatFileList, applyChanges };
