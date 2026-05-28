const simpleGit = require('simple-git');

async function autoCommit(repoPath, message) {
  const git = simpleGit(repoPath);
  try {
    await git.addConfig('user.name', process.env.GIT_USER_NAME || 'Telegram Bot');
    await git.addConfig('user.email', process.env.GIT_USER_EMAIL || 'bot@church.local');
    await git.add('.');
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

module.exports = { autoCommit };
