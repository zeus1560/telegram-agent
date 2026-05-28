const { ALLOWED_USER_ID } = require('./config');

function isAuthorized(userId) {
  return userId === ALLOWED_USER_ID;
}

module.exports = { isAuthorized };
