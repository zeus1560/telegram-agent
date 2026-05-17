const Sequelize = require('sequelize');

module.exports = (sequelize) => {
  class BoardNum extends Sequelize.Model {
    static associate(_models) {}
  }
  BoardNum.init(
    {
      menuId: Sequelize.DataTypes.INTEGER,
      rowNum: Sequelize.DataTypes.INTEGER
    },
    {
      sequelize,
      modelName: 'BoardNum',
      tableName: 'boardNums'
    }
  );

  return BoardNum;
};
