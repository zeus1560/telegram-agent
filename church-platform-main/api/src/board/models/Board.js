const Sequelize = require('sequelize');

module.exports = (sequelize) => {
  class Board extends Sequelize.Model {
    static associate(models) {
      this.belongsTo(models.User, {
        as: 'creator',
        foreignKey: 'userId',
        onUpdate: 'no action',
        onDelete: 'no action'
      });
      this.hasMany(models.BoardFile, {
        as: 'files',
        foreignKey: 'boardId',
        sourceKey: 'id',
        onUpdate: 'no action',
        onDelete: 'no action'
      });
      this.hasMany(models.BoardImage, {
        as: 'images',
        foreignKey: 'boardId',
        sourceKey: 'id',
        onUpdate: 'no action',
        onDelete: 'no action'
      });
      this.hasMany(models.BoardComment, {
        as: 'comments',
        foreignKey: 'boardId',
        sourceKey: 'id',
        onUpdate: 'no action',
        onDelete: 'no action'
      });
    }
  }
  Board.init(
    {
      videoUrl: Sequelize.DataTypes.STRING,
      isTemp: Sequelize.DataTypes.BOOLEAN,
      userId: Sequelize.DataTypes.INTEGER,
      menuId: Sequelize.DataTypes.INTEGER,
      title: Sequelize.DataTypes.STRING,
      content: Sequelize.DataTypes.TEXT,
      rowNum: Sequelize.DataTypes.INTEGER
    },
    {
      sequelize,
      modelName: 'Board',
      tableName: 'board',
      paranoid: true
    }
  );
  return Board;
};
