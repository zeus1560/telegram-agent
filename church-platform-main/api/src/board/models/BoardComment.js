const Sequelize = require('sequelize');

module.exports = (sequelize) => {
  class BoardComment extends Sequelize.Model {
    static associate(models) {
      this.belongsTo(models.User, {
        as: 'creator',
        foreignKey: 'userId',
        onUpdate: 'no action',
        onDelete: 'no action'
      });
      this.belongsTo(models.Board, {
        as: 'board',
        foreignKey: 'boardId',
        onUpdate: 'no action',
        onDelete: 'no action'
      });
      this.belongsTo(models.BoardComment, {
        as: 'parent',
        foreignKey: 'parentCommentId',
        onUpdate: 'no action',
        onDelete: 'no action'
      });
      this.hasMany(models.BoardComment, {
        as: 'replies',
        foreignKey: 'parentCommentId',
        sourceKey: 'id',
        onUpdate: 'no action',
        onDelete: 'no action'
      });
    }
  }
  BoardComment.init(
    {
      boardId: Sequelize.DataTypes.INTEGER,
      userId: Sequelize.DataTypes.INTEGER,
      parentCommentId: Sequelize.DataTypes.INTEGER,
      content: Sequelize.DataTypes.TEXT
    },
    {
      sequelize,
      modelName: 'BoardComment',
      tableName: 'boardComments',
      paranoid: true
    }
  );
  return BoardComment;
};
