const { emptySuccessResponse } = require('../../define');
const models = require('../../db');

/**
 * @swagger
 * tags:
 *   name: Department
 *   description: 부서 관리 API
 */

const sendMenuAttributes = ['id', 'name'];

/**
 * @swagger
 * /api/departments:
 *   get:
 *     summary: 부서 목록 조회
 *     tags: [Department]
 *     responses:
 *       200:
 *         description: 성공
 */
module.exports.list = async (_req, res) => {
  const departments = await models.Department.findAll({
    attributes: sendMenuAttributes
  });
  res.send(departments);
};

/**
 * @swagger
 * /api/departments/{id}:
 *   get:
 *     summary: 부서 상세 조회
 *     tags: [Department]
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
  const department = await models.Department.findOne({
    where: { id },
    attributes: sendMenuAttributes
  });
  res.send(department);
};

/**
 * @swagger
 * /api/departments:
 *   post:
 *     summary: 부서 추가
 *     tags: [Department]
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
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       200:
 *         description: 추가 성공
 */
module.exports.add = async (req, res) => {
  const { name } = req.body;
  const department = await models.Department.create({
    name
  });
  res.send(department);
};

/**
 * @swagger
 * /api/departments/{id}:
 *   delete:
 *     summary: 부서 삭제
 *     tags: [Department]
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
  await models.Department.destroy({
    where: { id }
  });
  res.send(emptySuccessResponse);
};

/**
 * @swagger
 * /api/departments/{id}:
 *   put:
 *     summary: 부서 수정
 *     tags: [Department]
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
  const menu = await models.Department.update(
    { name },
    {
      where: { id }
    }
  );
  res.send(menu);
};
