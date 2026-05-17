const Sequelize = require('sequelize');

module.exports = (sequelize) => {
  class BoardFile extends Sequelize.Model {
    static associate(_models) {}
  }
  BoardFile.init(
    {
      boardId: Sequelize.DataTypes.INTEGER,
      originalname: Sequelize.DataTypes.STRING,
      key: Sequelize.DataTypes.STRING,
      location: Sequelize.DataTypes.TEXT
    },
    {
      sequelize,
      modelName: 'BoardFile',
      tableName: 'boardFiles',
      freezeTableName: true,
      paranoid: true
    }
  );

  return BoardFile;
};
