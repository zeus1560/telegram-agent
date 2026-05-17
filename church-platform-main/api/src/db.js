const config = require('config');
const Sequelize = require('sequelize');

const dbconfig = config.sequelize;

const db = {};

const sequelize = new Sequelize(
  dbconfig.database,
  dbconfig.username,
  dbconfig.password,
  dbconfig
);

db.sequelize = sequelize;
db.Sequelize = Sequelize;
db.Board = require('./board/models/Board')(sequelize);
db.BoardCalendar = require('./board/models/Calendar')(sequelize, Sequelize);
db.Department = require('./common/models/Department')(sequelize);
db.Menu = require('./common/models/Menu')(sequelize);
db.User = require('./common/models/User')(sequelize);
db.BoardFile = require('./board/models/BoardFile')(sequelize);
db.BoardNum = require('./board/models/BoardNum')(sequelize);
db.BoardImage = require('./board/models/BoardImage')(sequelize);
db.BoardComment = require('./board/models/BoardComment')(sequelize);

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

module.exports = db;
