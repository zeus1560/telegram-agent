module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('users', 'approved', {
      type: Sequelize.BOOLEAN,
      defaultValue: false
    });
  },

  async down(queryInterface, _Sequelize) {
    await queryInterface.removeColumn('users', 'approved');
  }
};
