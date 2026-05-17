module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('board', 'deletedAt', {
      allowNull: true,
      type: Sequelize.DATE,
      defaultValue: null
    });
  },

  async down(queryInterface, _Sequelize) {
    await queryInterface.removeColumn('board', 'deletedAt');
  }
};
