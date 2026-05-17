const { defaltCreate } = require('../migrationLib/createHelper');

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('boardFiles', {
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

    await queryInterface.createTable('boardNums', {
      ...defaltCreate,
      menuId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'menu',
          key: 'id'
        },
        onUpdate: 'no action',
        onDelete: 'no action'
      },
      rowNum: {
        type: Sequelize.INTEGER
      }
    });

    await queryInterface.addColumn('board', 'rowNum', {
      type: Sequelize.INTEGER
    });
  },

  async down(queryInterface, _Sequelize) {
    await queryInterface.dropTable('boardFiles');
    await queryInterface.dropTable('boardNums');
    await queryInterface.removeColumn('board', 'rowNum');
  }
};
