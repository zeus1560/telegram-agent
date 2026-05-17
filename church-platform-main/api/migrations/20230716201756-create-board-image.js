const { defaltCreate } = require('../migrationLib/createHelper');

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('boardImages', {
      ...defaltCreate,
      boardId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'board',
          key: 'id'
        },
        onUpdate: 'no action',
        onDelete: 'no action'
      },
      originalname: {
        // 원본 파일명
        type: Sequelize.STRING
      },
      key: {
        // S3 저장 key
        type: Sequelize.STRING
      },
      location: {
        // S3 저장 url
        type: Sequelize.TEXT
      }
    });
  },

  async down(queryInterface, _Sequelize) {
    await queryInterface.dropTable('boardImages');
  }
};
