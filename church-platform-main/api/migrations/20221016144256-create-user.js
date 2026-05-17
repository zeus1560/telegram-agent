const config = require('config').sequelize;
const { defaltCreate } = require('../migrationLib/createHelper');

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(
      `ALTER DATABASE ${config.database} CHARACTER SET ${config.define.charset} COLLATE ${config.define.dialectOptions.collate};`
    );
    // db 속성 변경

    await queryInterface.createTable('users', {
      ...defaltCreate,
      name: {
        type: Sequelize.STRING
      },
      password: {
        type: Sequelize.STRING
      },
      mail: {
        type: Sequelize.STRING,
        unique: true
      },
      admin: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      provider: {
        type: Sequelize.STRING
      },
      snsId: {
        type: Sequelize.STRING
      },
      lastLoginAt: {
        type: Sequelize.DATE
      },
      deletedAt: {
        allowNull: true,
        type: Sequelize.DATE,
        defaultValue: null
      }
    });
  },

  async down(queryInterface, _Sequelize) {
    await queryInterface.dropTable('users');
  }
};
