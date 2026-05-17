const bcrypt = require('bcrypt');
const { emptySuccessResponse, saltRounds } = require('../../define');
const models = require('../../db');
const { crudHelper } = require('../../lib/crudHelper');

/**
 * @swagger
 * tags:
 *   name: User
 *   description: 사용자 관리 API
 */

const sendMenuAttributes = ['id', 'name', 'mail', 'admin', 'approved', 'phone'];

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: 사용자 목록 조회
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: 조회 개수
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *         description: 오프셋
 *     responses:
 *       200:
 *         description: 성공
 */
module.exports.list = async (req, res) => {
  const { limit, offset } = req.query;

  const result = await crudHelper.list(
    models.User,
    parseInt(limit, 10),
    parseInt(offset, 10),
    sendMenuAttributes
  );
  res.send(result);
};

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: 사용자 상세 조회
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 성공
 */
module.exports.detail = async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const department = await models.User.findOne({
    where: { id },
    attributes: sendMenuAttributes
  });
  res.send(department);
};

/**
 * @swagger
 * /api/users/{id}/approve:
 *   put:
 *     summary: 사용자 승인
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 승인 성공
 */
module.exports.approve = async (req, res) => {
  const id = parseInt(req.params.id, 10);
  await models.User.update(
    { approved: true },
    {
      where: { id }
    }
  );
  res.send(emptySuccessResponse);
};

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: 사용자 추가
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
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
 *               mail:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *               type:
 *                 type: string
 *                 enum: [admin, user]
 *     responses:
 *       200:
 *         description: 추가 성공
 */
module.exports.add = async (req, res) => {
  const { name, mail, password, type } = req.body;

  const hash = await bcrypt.hash(password, saltRounds);

  await models.User.create({
    name,
    mail,
    password: hash,
    admin: type === 'admin'
  });
  res.send(emptySuccessResponse);
};

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: 사용자 삭제
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 삭제 성공
 */
module.exports.delete = async (req, res) => {
  const id = parseInt(req.params.id, 10);
  await models.User.destroy({
    where: { id }
  });
  res.send(emptySuccessResponse);
};

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: 사용자 수정
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       200:
 *         description: 수정 성공
 */
module.exports.update = async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { name } = req.body;
  const menu = await models.User.update(
    { name },
    {
      where: { id }
    }
  );
  res.send(menu);
};
