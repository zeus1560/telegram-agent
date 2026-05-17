const { MenuType } = require('../src/define');
const models = require('../src/db');

module.exports = {
  async up(_queryInterface, _Sequelize) {
    // 샘플 메뉴 데이터 - 필요에 따라 수정하세요
    let menu = await models.Menu.create({
      type: MenuType.Category,
      title: '소개'
    });

    await models.Menu.bulkCreate([
      {
        type: MenuType.Page,
        parentMenuId: menu.id,
        title: '안내'
      },
      {
        type: MenuType.Page,
        parentMenuId: menu.id,
        title: '오시는 길'
      }
    ]);

    menu = await models.Menu.create({
      type: MenuType.Category,
      title: '게시판'
    });

    await models.Menu.bulkCreate([
      {
        type: MenuType.Basic,
        parentMenuId: menu.id,
        title: '공지사항'
      },
      {
        type: MenuType.Gallery,
        parentMenuId: menu.id,
        title: '갤러리'
      }
    ]);
  },

  async down(_queryInterface, _Sequelize) {
    console.log('');
  }
};
