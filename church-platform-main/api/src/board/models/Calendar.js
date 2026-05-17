const Sequelize = require('sequelize');

module.exports = (sequelize) => {
  class BoardCalendar extends Sequelize.Model {
    static associate(_models) {}
  }
  BoardCalendar.init(
    {
      userId: Sequelize.DataTypes.INTEGER,
      menuId: Sequelize.DataTypes.INTEGER,
      title: Sequelize.DataTypes.STRING,
      content: Sequelize.DataTypes.TEXT
    },
    {
      sequelize,
      modelName: 'Calendar',
      tableName: 'calendar'
    }
  );
  return BoardCalendar;
};
