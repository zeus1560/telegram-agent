const { MenuType } = require('../define');
const { Err, ErrInfo } = require('../err');

module.exports.checkAddMenu = (req, _res, next) => {
  const { type } = req.body;
  if (!type) {
    throw new Err(ErrInfo.BadRequest);
  }
  if (type < MenuType.Category || type > MenuType.Custom) {
    throw new Err(ErrInfo.BadRequest);
  }
  next();
};

module.exports.checkUpdateMenu = (req, _res, next) => {
  const { type } = req.body;
  if (type) {
    if (type < MenuType.Category || type > MenuType.Custom) {
      throw new Err(ErrInfo.BadRequest);
    }
  }
  next();
};
