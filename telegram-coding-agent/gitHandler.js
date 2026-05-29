/**
 * @fileoverview Git 자동화 유틸리티.
 * 변경 파일을 스테이징하고 커밋한 뒤, 원격이 연결돼 있으면 push까지 수행한다.
 */
const simpleGit = require('simple-git');

/**
 * 지정된 파일을 스테이징하고 커밋한다. 원격 저장소가 있으면 현재 브랜치로 push한다.
 * @param {string} repoPath 타겟 프로젝트 루트 경로 (git 저장소 루트)
 * @param {string} message 커밋 메시지
 * @param {string[]|null} [files=null] 스테이징할 파일 목록. null이면 전체 변경 사항을 스테이징한다.
 * @returns {Promise<{success: boolean, message?: string, pushed?: boolean, error?: string}>}
 */
async function autoCommit(repoPath, message, files = null) {
  const git = simpleGit(repoPath);
  try {
    await git.addConfig('user.name', process.env.GIT_USER_NAME || 'Telegram Bot');
    await git.addConfig('user.email', process.env.GIT_USER_EMAIL || 'bot@church.local');
    if (files && files.length > 0) {
      await git.add(files);
    } else {
      await git.add('.');
    }
    await git.commit(message);

    const remotes = await git.getRemotes(true);
    if (remotes.length > 0) {
      const branch = await git.revparse(['--abbrev-ref', 'HEAD']);
      await git.push('origin', branch.trim());
      return { success: true, message, pushed: true };
    }

    return { success: true, message, pushed: false };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * HEAD 커밋을 revert한다. 원격 저장소가 있으면 push까지 수행한다.
 * @param {string} repoPath 타겟 프로젝트 루트 경로
 * @returns {Promise<{success: boolean, pushed?: boolean, error?: string}>}
 */
async function revertLast(repoPath) {
  const git = simpleGit(repoPath);
  try {
    await git.addConfig('user.name', process.env.GIT_USER_NAME || 'Telegram Bot');
    await git.addConfig('user.email', process.env.GIT_USER_EMAIL || 'bot@church.local');
    await git.revert('HEAD', { '--no-edit': null });

    const remotes = await git.getRemotes(true);
    if (remotes.length > 0) {
      const branch = await git.revparse(['--abbrev-ref', 'HEAD']);
      await git.push('origin', branch.trim());
      return { success: true, pushed: true };
    }
    return { success: true, pushed: false };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

module.exports = { autoCommit, revertLast };
