const bcrypt = require('bcrypt');
const { saltRounds } = require('../src/define');

module.exports = {
  async up(queryInterface, Sequelize) {
    const timeFields = {
      createdAt: Sequelize.fn('NOW'),
      updatedAt: Sequelize.fn('NOW')
    };
    const passwordHash = await bcrypt.hash('admin', saltRounds);

    await queryInterface.bulkInsert('users', [
      {
        name: '관리자',
        password: passwordHash,
        mail: 'admin@example.com',
        admin: true,
        ...timeFields
      }
    ]);
  },

  // eslint-disable-next-line no-empty-function
  async down(_queryInterface, _Sequelize) {}
};
