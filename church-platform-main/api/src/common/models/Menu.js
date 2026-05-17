const Sequelize = require('sequelize');

module.exports = (sequelize) => {
  class Menu extends Sequelize.Model {
    static associate(models) {
      this.hasMany(models.Menu, {
        as: 'menus',
        foreignKey: 'parentMenuId',
        sourceKey: 'id'
      });
    }
  }
  Menu.init(
    {
      type: Sequelize.DataTypes.INTEGER,
      // 1. 카테고리 2. 일반 3.카드  4. 칼렌더 5. 페이지 6. custom
      title: Sequelize.DataTypes.STRING,
      parentMenuId: Sequelize.DataTypes.INTEGER,
      content: Sequelize.DataTypes.TEXT
    },
    {
      sequelize,
      modelName: 'Menu',
      tableName: 'menu'
    }
  );
  return Menu;
};
