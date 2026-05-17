const Sequelize = require('sequelize');

module.exports = (sequelize) => {
  class Department extends Sequelize.Model {
    static associate(_models) {}
  }
  Department.init(
    {
      name: Sequelize.DataTypes.STRING // 소속 이름
    },
    {
      sequelize,
      modelName: 'Department',
      tableName: 'department'
    }
  );
  return Department;
};
