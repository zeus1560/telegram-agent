const { defaltCreate, userCreate } = require('../migrationLib/createHelper');

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('menu', {
      ...defaltCreate,
      type: { type: Sequelize.INTEGER },
      title: { type: Sequelize.STRING },
      parentMenuId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'menu',
          key: 'id'
        },
        onUpdate: 'no action',
        onDelete: 'no action'
      },
      content: { type: Sequelize.TEXT }
    });

    await queryInterface.createTable('board', {
      ...defaltCreate,
      ...userCreate,
      menuId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'menu',
          key: 'id'
        },
        onUpdate: 'no action',
        onDelete: 'no action'
      },
      title: { type: Sequelize.STRING },
      content: { type: Sequelize.TEXT }
    });

    await queryInterface.createTable('calendar', {
      ...defaltCreate,
      ...userCreate,
      menuId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'menu',
          key: 'id'
        },
        onUpdate: 'no action',
        onDelete: 'no action'
      },
      title: { type: Sequelize.STRING },
      content: { type: Sequelize.TEXT },
      startAt: { type: Sequelize.DATE },
      endAt: { type: Sequelize.DATE }
    });
  },

  async down(queryInterface, _Sequelize) {
    await queryInterface.dropTable('menu');
  }
};
