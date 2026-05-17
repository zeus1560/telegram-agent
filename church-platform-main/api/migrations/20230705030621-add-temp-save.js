module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('board', 'isTemp', {
      allowNull: false,
      type: Sequelize.BOOLEAN,
      defaultValue: false
    });
  },

  async down(queryInterface, _Sequelize) {
    await queryInterface.removeColumn('board', 'isTemp');
  }
};
