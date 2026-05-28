let isLocked = false;
let pendingChanges = null;
let lastResult = '없음';

module.exports = {
  get: () => ({ isLocked, pendingChanges, lastResult }),
  lock: () => { isLocked = true; },
  unlock: () => { isLocked = false; pendingChanges = null; },
  setPending: (changes) => { pendingChanges = changes; },
  setLastResult: (msg) => { lastResult = msg; },
};
