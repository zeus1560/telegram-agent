module.exports.saltRounds = 10;

module.exports.emptySuccessResponse = {
  result: 'success'
};

module.exports.MenuType = {
  Category: 1,
  Basic: 2, // 일반 게시판
  Sermon: 3, // 영상 게시판
  Gallery: 4, // 갤러리 게시판
  Page: 5, // editor
  Custom: 6, // 커스텀
  Card: 7, // 카드 형태 게시판
};

module.exports.commonUserAttributes = ['id', 'name', 'mail'];
