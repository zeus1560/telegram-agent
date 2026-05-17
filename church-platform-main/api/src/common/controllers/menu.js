const { emptySuccessResponse } = require('../../define');
const models = require('../../db');

/**
 * @swagger
 * tags:
 *   name: Menu
 *   description: 메뉴 관리 API
 */

const sendMenuAttributes = ['id', 'type', 'title'];

/**
 * @swagger
 * /api/menu:
 *   get:
 *     summary: 메뉴 목록 조회 (계층 구조)
 *     tags: [Menu]
 *     responses:
 *       200:
 *         description: 성공
 */
module.exports.list = async (_req, res) => {
  const menuList = await models.Menu.findAll({
    attributes: sendMenuAttributes,
    where: { parentMenuId: null },
    include: [
      {
        model: models.Menu,
        as: 'menus',
        attributes: sendMenuAttributes,
        separate: true
      }
    ]
  });
  res.send(menuList);
};

/**
 * @swagger
 * /api/menu/{id}:
 *   get:
 *     summary: 메뉴 상세 조회
 *     tags: [Menu]
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
  const menu = await models.Menu.findOne({
    where: { id },
    attributes: [...sendMenuAttributes, 'content']
  });
  res.send(menu);
};

/**
 * @swagger
 * /api/menu:
 *   post:
 *     summary: 메뉴 추가
 *     tags: [Menu]
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
 *               - type
 *               - title
 *             properties:
 *               type:
 *                 type: integer
 *                 description: 메뉴 타입 (1:카테고리, 2:일반, 3:카드, 4:캘린더, 5:페이지, 6:custom)
 *               title:
 *                 type: string
 *               parentMenuId:
 *                 type: integer
 *                 nullable: true
 *               content:
 *                 type: string
 *     responses:
 *       200:
 *         description: 추가 성공
 */
module.exports.add = async (req, res) => {
  const { type, title, parentMenuId, content } = req.body;
  const menu = await models.Menu.create({
    type,
    title,
    parentMenuId,
    content
  });
  res.send(menu);
};

/**
 * @swagger
 * /api/menu/{id}:
 *   delete:
 *     summary: 메뉴 삭제
 *     tags: [Menu]
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
  await models.Menu.destroy({
    where: { id }
  });
  res.send(emptySuccessResponse);
};

/**
 * @swagger
 * /api/menu/{id}:
 *   put:
 *     summary: 메뉴 수정
 *     tags: [Menu]
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
 *               type:
 *                 type: integer
 *               title:
 *                 type: string
 *               parentMenuId:
 *                 type: integer
 *               content:
 *                 type: string
 *     responses:
 *       200:
 *         description: 수정 성공
 */
module.exports.update = async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const updating = {};
  const { type, title, parentMenuId, content } = req.body;
  if (type) {
    updating.type = type;
  }
  if (title) {
    updating.title = title;
  }
  if (parentMenuId) {
    updating.parentMenuId = parentMenuId;
  }
  if (content) {
    updating.content = content;
  }
  const menu = await models.Menu.update(
    { ...updating },
    {
      where: { id }
    }
  );
  res.send(menu);
};
