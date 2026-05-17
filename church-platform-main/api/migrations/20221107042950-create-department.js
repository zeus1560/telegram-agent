const { defaltCreate } = require('../migrationLib/createHelper');

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('departments', {
      ...defaltCreate,
      name: {
        type: Sequelize.STRING
      }
    });
  },

  async down(queryInterface, _Sequelize) {
    await queryInterface.dropTable('departments');
  }
};
