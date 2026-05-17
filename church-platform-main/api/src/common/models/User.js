const Sequelize = require('sequelize');

module.exports = (sequelize) => {
  class User extends Sequelize.Model {
    static associate(_models) {}
  }
  User.init(
    {
      name: Sequelize.DataTypes.STRING, // 이름
      mail: Sequelize.DataTypes.STRING, // 이메일
      password: Sequelize.DataTypes.STRING, // 비번
      admin: Sequelize.DataTypes.BOOLEAN, // 관리자인지
      provider: Sequelize.DataTypes.STRING, // 소셜 로그인 (kakao), 이메일 로그인 ..
      snsId: Sequelize.DataTypes.STRING, // sns id
      lastLoginAt: Sequelize.DataTypes.DATE, // 최종 로그인
      approved: Sequelize.DataTypes.BOOLEAN, // 승인 여부
      phone: Sequelize.DataTypes.STRING // 전화번호
    },
    {
      sequelize,
      modelName: 'User',
      tableName: 'users',
      paranoid: true
    }
  );
  return User;
};
