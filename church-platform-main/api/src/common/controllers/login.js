const bcrypt = require('bcrypt');
const _ = require('lodash');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const config = require('config');
const { emptySuccessResponse, saltRounds } = require('../../define');
const models = require('../../db');
const { Err, ErrInfo } = require('../../err');

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: 인증 관련 API
 */

/**
 * @swagger
 * /api/login:
 *   post:
 *     summary: 일반 사용자 로그인
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - mail
 *               - password
 *             properties:
 *               mail:
 *                 type: string
 *                 format: email
 *                 example: "user@example.com"
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: 로그인 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: JWT 토큰
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     name:
 *                       type: string
 *                     mail:
 *                       type: string
 *                     admin:
 *                       type: boolean
 *       401:
 *         description: 인증 실패
 */
module.exports.login = (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      console.error(err);
      return next(err);
    }
    if (info) {
      return res.status(401).send(info.reason);
    }
    return req.login(user, { session: false }, async (loginErr) => {
      if (loginErr) {
        console.error(loginErr);
        return next(loginErr);
      }

      if (user.approved === false) {
        return res.status(401).send(ErrInfo.NotApproved);
      }

      await models.User.update(
        {
          lastLoginAt: models.sequelize.fn('NOW')
        },
        {
          where: { id: req.user.id }
        }
      );

      // 나중에 종합 정보로 변경
      const userRes = _.pick(user, ['id', 'name', 'mail', 'admin']);

      const token = jwt.sign({ id: user.id }, config.JWT.JWT_SECRET, {
        expiresIn: '7d'
      });

      return res.send({ token, user: userRes });
    });
  })(req, res, next);
};

/**
 * @swagger
 * /api/login/admin:
 *   post:
 *     summary: 관리자 로그인
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - mail
 *               - password
 *             properties:
 *               mail:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: 로그인 성공
 *       401:
 *         description: 인증 실패 또는 관리자 권한 없음
 */
module.exports.adminLogin = (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      console.error(err);
      return next(err);
    }
    if (info) {
      return res.status(401).send(info.reason);
    }
    if (user.admin) {
      return req.login(user, { session: false }, async (loginErr) => {
        if (loginErr) {
          console.error(loginErr);
          return next(loginErr);
        }

        await models.User.update(
          {
            lastLoginAt: models.sequelize.fn('NOW')
          },
          {
            where: { id: req.user.id }
          }
        );

        // 나중에 종합 정보로 변경
        const userRes = _.pick(user, ['id', 'name', 'mail', 'admin']);

        const token = jwt.sign({ id: user.id }, config.JWT.JWT_SECRET, {
          expiresIn: '1d'
        });

        return res.send({ token, user: userRes });
      });
    }
    return next(new Err(ErrInfo.UnAuthorized));
  })(req, res, next);
};

/**
 * @swagger
 * /api/join:
 *   post:
 *     summary: 회원가입
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - mail
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: "홍길동"
 *               mail:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *               phone:
 *                 type: string
 *     responses:
 *       200:
 *         description: 회원가입 성공
 */
module.exports.join = async (req, res) => {
  const { name, mail, password, phone } = req.body;

  const hash = await bcrypt.hash(password, saltRounds);

  const result = await models.User.create({
    name,
    mail,
    password: hash,
    admin: false,
    approved: true,
    phone
  });
  res.send(result);
};

/**
 * @swagger
 * /api/logout:
 *   post:
 *     summary: 로그아웃
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: 로그아웃 성공
 */
module.exports.logout = (req, res) => {
  req.logout();
  res.send(emptySuccessResponse);
};

/**
 * @swagger
 * /api/profile:
 *   get:
 *     summary: 현재 로그인한 사용자 프로필 조회
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 name:
 *                   type: string
 *                 mail:
 *                   type: string
 *                 admin:
 *                   type: boolean
 *       401:
 *         description: 인증 필요
 */
module.exports.profile = (req, res) => {
  const userRes = _.pick(req.user, ['id', 'name', 'mail', 'admin']);
  res.send(userRes);
};
