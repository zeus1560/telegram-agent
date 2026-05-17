module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('boardFiles', 'deletedAt', {
      allowNull: true,
      type: Sequelize.DATE,
      defaultValue: null
    });
  },

  async down(queryInterface, _Sequelize) {
    await queryInterface.removeColumn('boardFiles', 'deletedAt');
  }
};
