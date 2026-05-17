const { Op } = require('sequelize');
const { commonUserAttributes, emptySuccessResponse } = require('../../define');
const models = require('../../db');
const { ErrInfo, Err } = require('../../err');
const { crudHelper } = require('../../lib/crudHelper');
const { deleteFile } = require('../../middlewares');

/**
 * @swagger
 * tags:
 *   name: Board
 *   description: 게시판 관리 API
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Board:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         title:
 *           type: string
 *         content:
 *           type: string
 *         menuId:
 *           type: integer
 *         userId:
 *           type: integer
 *         isTemp:
 *           type: boolean
 *           description: 임시저장 여부
 *         videoUrl:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/board/{menuId}:
 *   get:
 *     summary: 게시판 목록 조회 (관리자용)
 *     tags: [Board]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: menuId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 메뉴 ID
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: 조회 개수
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: 오프셋
 *     responses:
 *       200:
 *         description: 성공
 */
module.exports.list = async (req, res) => {
  const { limit, offset } = req.query;
  const { menuId } = req.params;
  const result = await crudHelper.list(
    models.Board,
    parseInt(limit, 10) || 10,
    parseInt(offset, 10) || 0,
    ['id', 'title', 'createdAt', 'isTemp', 'videoUrl'],
    { menuId },
    [
      {
        model: models.User,
        as: 'creator',
        attributes: commonUserAttributes
      }
    ],
    [['createdAt', 'DESC']]
  );

  res.send(result);
};

/**
 * @swagger
 * /api/board/{menuId}/front:
 *   get:
 *     summary: 게시판 목록 조회 (프론트엔드용, 임시글 제외)
 *     tags: [Board]
 *     parameters:
 *       - in: path
 *         name: menuId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *     responses:
 *       200:
 *         description: 성공
 */
module.exports.frontList = async (req, res) => {
  const { limit, offset } = req.query;
  const { menuId } = req.params;
  const result = await crudHelper.list(
    models.Board,
    parseInt(limit, 10) || 10,
    parseInt(offset, 10) || 0,
    ['id', 'title', 'createdAt', 'videoUrl'],
    { menuId, isTemp: false },
    [
      {
        model: models.User,
        as: 'creator',
        attributes: commonUserAttributes
      },
      {
        model: models.BoardImage,
        as: 'images',
        attributes: ['id', 'originalname', 'location'],
        limit: 1,
        separate: true
      },
      {
        model: models.BoardFile,
        as: 'files',
        attributes: ['id', 'originalname', 'location'],
        limit: 1,
        separate: true
      }
    ],
    [['createdAt', 'DESC']]
  );

  res.send(result);
};

/**
 * @swagger
 * /api/board/{menuId}/images:
 *   post:
 *     summary: 게시글 이미지 업로드
 *     tags: [Board]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: menuId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: 이미지 업로드 성공
 */
module.exports.addImage = async (req, res) => {
  const result = await models.BoardImage.create({
    originalname: req.file.originalname,
    key: req.file.key,
    location: req.file.location
  });

  res.send(result);
};

/**
 * @swagger
 * /api/board/{menuId}:
 *   post:
 *     summary: 게시글 추가
 *     tags: [Board]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: menuId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - content
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               isTemp:
 *                 type: boolean
 *               videoUrl:
 *                 type: string
 *               attachedImageIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *               attachedFiles:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: 게시글 추가 성공
 */
module.exports.add = async (req, res) => {
  const { title, content, isTemp, videoUrl, attachedImageIds } = req.body;
  const { menuId } = req.params;

  const findMenu = await models.Menu.findOne({
    where: { id: menuId }
  });

  if (!findMenu) {
    throw new Err(ErrInfo.BadRequest);
  }

  const transaction = await models.sequelize.transaction();

  let result;
  try {
    result = await models.Board.create(
      {
        title,
        content,
        menuId,
        userId: req.user.id,
        isTemp,
        videoUrl
      },
      { transaction }
    );
    let fileData;
    if (req.files && req.files.length > 0) {
      fileData = req.files.map((file) => ({
        boardId: result.id,
        originalname: file.originalname,
        key: file.key,
        location: file.location
      }));
    }
    if (fileData) {
      await models.BoardFile.bulkCreate(fileData, { transaction });
    }
    if (attachedImageIds) {
      await models.BoardImage.update(
        { boardId: result.id },
        { where: { id: { [Op.in]: attachedImageIds } }, transaction }
      );
    }

    await transaction.commit();
    res.send(result);
  } catch (err) {
    await transaction.rollback();
    throw err;
  }
};

/**
 * @swagger
 * /api/board/{menuId}/{id}:
 *   put:
 *     summary: 게시글 수정
 *     tags: [Board]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: menuId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               isTemp:
 *                 type: boolean
 *               videoUrl:
 *                 type: string
 *               attachedImageIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *               removeAttachedFileIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *               removeImageIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *               attachedFiles:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: 수정 성공
 */
module.exports.update = async (req, res) => {
  const {
    title,
    content,
    isTemp,
    videoUrl,
    removeAttachedFileIds,
    attachedImageIds,
    removeImageIds
  } = req.body;
  const id = parseInt(req.params.id, 10);
  const { menuId } = req.params;

  const findBoard = await models.Board.findOne({
    where: { id, menuId }
  });

  if (!findBoard) {
    throw new Err(ErrInfo.BadRequest);
  }

  const transaction = await models.sequelize.transaction();

  let result;
  try {
    result = await models.Board.update(
      {
        title,
        content,
        menuId,
        userId: req.user.id,
        isTemp,
        videoUrl
      },
      { where: { id }, transaction }
    );
    let fileData;
    if (req.files && req.files.length > 0) {
      fileData = req.files.map((file) => ({
        boardId: id,
        originalname: file.originalname,
        key: file.key,
        location: file.location
      }));
    }
    if (removeAttachedFileIds) {
      await models.BoardFile.destroy({
        where: { id: { [Op.in]: removeAttachedFileIds } },
        transaction
      });
    }
    if (removeImageIds) {
      await models.BoardImage.destroy({
        where: { id: { [Op.in]: removeImageIds } },
        transaction
      });
    }
    if (attachedImageIds) {
      await models.BoardImage.update(
        { boardId: id },
        { where: { id: { [Op.in]: attachedImageIds } }, transaction }
      );
    }
    if (fileData) {
      await models.BoardFile.bulkCreate(fileData, { transaction });
    }
    await transaction.commit();
    res.send(result);
  } catch (err) {
    await transaction.rollback();
    throw err;
  }
};

/**
 * @swagger
 * /api/board/{menuId}/{id}:
 *   get:
 *     summary: 게시글 상세 조회
 *     tags: [Board]
 *     parameters:
 *       - in: path
 *         name: menuId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 content:
 *                   $ref: '#/components/schemas/Board'
 *                 nextContent:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     title:
 *                       type: string
 *                 prevContent:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     title:
 *                       type: string
 */
module.exports.detail = async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const menuId = parseInt(req.params.menuId, 10);

  const result = await models.Board.findOne({
    where: { id },
    include: [
      {
        model: models.User,
        as: 'creator',
        attributes: commonUserAttributes
      },
      {
        model: models.BoardFile,
        as: 'files',
        attributes: ['id', 'originalname', 'location'],
        separate: true
      },
      {
        model: models.BoardImage,
        as: 'images',
        attributes: ['id', 'originalname', 'location'],
        separate: true
      },
      {
        model: models.BoardComment,
        as: 'comments',
        where: { parentCommentId: null },
        required: false,
        attributes: ['id', 'content', 'createdAt', 'updatedAt'],
        include: [
          {
            model: models.User,
            as: 'creator',
            attributes: commonUserAttributes
          },
          {
            model: models.BoardComment,
            as: 'replies',
            attributes: ['id', 'content', 'createdAt', 'updatedAt'],
            include: [
              {
                model: models.User,
                as: 'creator',
                attributes: commonUserAttributes
              }
            ]
          }
        ]
      }
    ]
  });

  const nextResult = await models.Board.findOne({
    where: { menuId, id: { [Op.gt]: id } },
    attributes: ['id', 'title'],
    order: [['id', 'asc']]
  });

  const prevContent = await models.Board.findOne({
    where: { menuId, id: { [Op.lt]: id } },
    attributes: ['id', 'title'],
    order: [['id', 'desc']]
  });

  res.send({ content: result, nextContent: nextResult, prevContent });
};

/**
 * @swagger
 * /api/board/{menuId}/{id}:
 *   delete:
 *     summary: 게시글 삭제
 *     tags: [Board]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: menuId
 *         required: true
 *         schema:
 *           type: integer
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

  const files = await models.BoardFile.findOne({
    where: { boardId: id }
  });

  const transaction = await models.sequelize.transaction();

  try {
    await models.BoardFile.destroy({
      where: { boardId: id },
      transaction
    });

    await models.Board.destroy({
      where: { id, userId: req.user.id },
      transaction
    });

    await transaction.commit();

    if (files && files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        await deleteFile(files[i].key);
      }
    }

    res.send(emptySuccessResponse);
  } catch (err) {
    await transaction.rollback();
    throw err;
  }
};
