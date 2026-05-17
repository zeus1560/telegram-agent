const Sequelize = require('sequelize');

module.exports = (sequelize) => {
  class BoardImage extends Sequelize.Model {
    static associate(_models) {}
  }
  BoardImage.init(
    {
      boardId: Sequelize.DataTypes.INTEGER,
      originalname: Sequelize.DataTypes.STRING,
      key: Sequelize.DataTypes.STRING,
      location: Sequelize.DataTypes.TEXT
    },
    {
      sequelize,
      modelName: 'BoardImage',
      tableName: 'boardImages'
    }
  );

  return BoardImage;
};
