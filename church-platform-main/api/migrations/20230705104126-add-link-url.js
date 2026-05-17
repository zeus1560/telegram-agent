module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('board', 'videoUrl', {
      type: Sequelize.STRING
    });
  },

  async down(queryInterface, _Sequelize) {
    await queryInterface.removeColumn('board', 'videoUrl');
  }
};
