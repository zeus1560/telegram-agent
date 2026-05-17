module.exports = {
  async up(queryInterface, _Sequelize) {
    await queryInterface.bulkUpdate(
      'menu',
      {
        type: 6
      },
      {
        title: '훈련프로그램'
      }
    );

    await queryInterface.bulkUpdate(
      'menu',
      {
        type: 6
      },
      {
        title: '새가족교육'
      }
    );

    await queryInterface.bulkUpdate(
      'menu',
      {
        type: 6
      },
      {
        title: '유치부'
      }
    );

    await queryInterface.bulkUpdate(
      'menu',
      {
        type: 6
      },
      {
        title: '아동부'
      }
    );

    await queryInterface.bulkUpdate(
      'menu',
      {
        type: 6
      },
      {
        title: '청소년부'
      }
    );

    await queryInterface.bulkUpdate(
      'menu',
      {
        type: 6
      },
      {
        title: '청년부'
      }
    );

    await queryInterface.bulkUpdate(
      'menu',
      {
        title: '최전방개척선교',
        type: 6
      },
      {
        title: '이슬람권선교'
      }
    );

    await queryInterface.bulkUpdate(
      'menu',
      {
        title: '지역사회전도',
        type: 6
      },
      {
        title: '통일대비선교'
      }
    );

    await queryInterface.bulkUpdate(
      'menu',
      {
        title: '꿈꾸는책동산',
        type: 6
      },
      {
        title: '문화선교'
      }
    );
  },

  async down(_queryInterface, _Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  }
};
