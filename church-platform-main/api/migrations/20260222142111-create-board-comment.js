const { defaltCreate, userCreate } = require('../migrationLib/createHelper');

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('boardComments', {
      ...defaltCreate,
      ...userCreate,
      deletedAt: {
        type: Sequelize.DATE
      },
      boardId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'board',
          key: 'id'
        },
        onUpdate: 'no action',
        onDelete: 'no action'
      },
      parentCommentId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'boardComments',
          key: 'id'
        },
        onUpdate: 'no action',
        onDelete: 'no action'
      },
      content: {
        type: Sequelize.TEXT
      }
    });
  },

  async down(queryInterface, _Sequelize) {
    await queryInterface.dropTable('boardComments');
  }
};
