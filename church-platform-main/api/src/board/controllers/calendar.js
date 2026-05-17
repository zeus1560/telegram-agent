const { emptySuccessResponse } = require('../../define');

// 리스트
module.exports.list = (req, res) => {
  res.send(emptySuccessResponse);
};

// 추가
module.exports.add = async (req, res) => {
  // const { title, content, menuId } = req.body;
  // const findMenu = await models.Menu.findOne({
  //   where: { id: menuId }
  // });
  // if (findMenu.type !== MenuType.Calendar) {
  //   throw new Err(ErrInfo.BadRequest);
  // }
  // const result = await models.BoardCalendar.create({
  //   title,
  //   content,
  //   menuId,
  //   userId: req.user.id
  // });
  // res.send(result);
};

// 상세
module.exports.detail = (req, res) => {
  const id = parseInt(req.params.id, 10);
  res.send({ id });
};

// 삭제
module.exports.delete = (req, res) => {
  const id = parseInt(req.params.id, 10);
  res.send({ id });
};

// 수정
module.exports.update = (req, res) => {
  const id = parseInt(req.params.id, 10);
  res.send({ id });
};
