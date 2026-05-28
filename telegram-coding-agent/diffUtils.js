const Diff = require('diff');

function generateDiff(original, modified, filename) {
  const patch = Diff.createPatch(filename, original, modified, '', '');
  // 헤더 2줄(--- / +++) 이후 변경 내용만 추출
  const lines = patch.split('\n').slice(2).join('\n');
  return lines.trim();
}

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
    }

    const diff = generateDiff(original, modified, change.file);
    parts.push(`📄 *${change.file}*\n\`\`\`diff\n${diff}\n\`\`\``);
  }

  const summary = shimResult.description || '코드 수정';
  return `📋 *수정 계획*\n\n${parts.join('\n\n')}\n\n✏️ ${summary}\n\n진행할까요?`;
}

module.exports = { generateDiff, formatDiffMessage };
