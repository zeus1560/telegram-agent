module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('users', 'phone', {
      type: Sequelize.STRING
    });
  },

  async down(queryInterface, _Sequelize) {
    await queryInterface.removeColumn('users', 'phone');
  }
};
