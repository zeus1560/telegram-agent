const { commonUserAttributes, emptySuccessResponse } = require('../../define');
const models = require('../../db');
const { ErrInfo, Err } = require('../../err');

/**
 * @swagger
 * tags:
 *   name: BoardComment
 *   description: 게시글 댓글 API
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     BoardComment:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         content:
 *           type: string
 *         boardId:
 *           type: integer
 *         userId:
 *           type: integer
 *         parentCommentId:
 *           type: integer
 *           nullable: true
 *           description: 대댓글인 경우 부모 댓글 ID
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/board/menu/{menuId}/basic/{boardId}/comment:
 *   get:
 *     summary: 댓글 목록 조회
 *     description: 최상위 댓글과 대댓글을 함께 반환합니다.
 *     tags: [BoardComment]
 *     parameters:
 *       - in: path
 *         name: menuId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 메뉴 ID
 *       - in: path
 *         name: boardId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 게시글 ID
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 count:
 *                   type: integer
 *                 rows:
 *                   type: array
 *                   items:
 *                     allOf:
 *                       - $ref: '#/components/schemas/BoardComment'
 *                       - type: object
 *                         properties:
 *                           creator:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: integer
 *                               name:
 *                                 type: string
 *                               mail:
 *                                 type: string
 *                           replies:
 *                             type: array
 *                             items:
 *                               $ref: '#/components/schemas/BoardComment'
 */
module.exports.list = async (req, res) => {
  const { boardId } = req.params;
  const { limit, offset } = req.query;

  const result = await models.BoardComment.findAndCountAll({
    where: { boardId, parentCommentId: null },
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
        ],
        separate: true,
        order: [['createdAt', 'ASC']]
      }
    ],
    order: [['createdAt', 'ASC']],
    limit: parseInt(limit, 10) || 20,
    offset: parseInt(offset, 10) || 0
  });

  res.send(result);
};

/**
 * @swagger
 * /api/board/menu/{menuId}/basic/{boardId}/comment:
 *   post:
 *     summary: 댓글 작성
 *     description: 게시글에 댓글을 작성합니다. parentCommentId를 전달하면 대댓글이 됩니다.
 *     tags: [BoardComment]
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
 *       - in: path
 *         name: boardId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 게시글 ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *                 description: 댓글 내용
 *               parentCommentId:
 *                 type: integer
 *                 description: 대댓글인 경우 부모 댓글 ID
 *     responses:
 *       200:
 *         description: 댓글 작성 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BoardComment'
 *       400:
 *         description: 게시글 또는 부모 댓글을 찾을 수 없음
 *       401:
 *         description: 로그인 필요
 */
module.exports.add = async (req, res) => {
  const { boardId } = req.params;
  const { content, parentCommentId } = req.body;

  const board = await models.Board.findOne({ where: { id: boardId } });
  if (!board) {
    throw new Err(ErrInfo.BadRequest);
  }

  if (parentCommentId) {
    const parentComment = await models.BoardComment.findOne({
      where: { id: parentCommentId, boardId }
    });
    if (!parentComment) {
      throw new Err(ErrInfo.BadRequest);
    }
  }

  const result = await models.BoardComment.create({
    boardId,
    userId: req.user.id,
    parentCommentId: parentCommentId || null,
    content
  });

  res.send(result);
};

/**
 * @swagger
 * /api/board/menu/{menuId}/basic/{boardId}/comment/{commentId}:
 *   put:
 *     summary: 댓글 수정
 *     description: 본인이 작성한 댓글만 수정할 수 있습니다.
 *     tags: [BoardComment]
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
 *       - in: path
 *         name: boardId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 게시글 ID
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 댓글 ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *                 description: 수정할 댓글 내용
 *     responses:
 *       200:
 *         description: 댓글 수정 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BoardComment'
 *       400:
 *         description: 댓글을 찾을 수 없거나 본인 댓글이 아님
 *       401:
 *         description: 로그인 필요
 */
module.exports.update = async (req, res) => {
  const { commentId } = req.params;
  const { content } = req.body;

  const comment = await models.BoardComment.findOne({
    where: { id: commentId, userId: req.user.id }
  });
  if (!comment) {
    throw new Err(ErrInfo.BadRequest);
  }

  await comment.update({ content });
  res.send(comment);
};

/**
 * @swagger
 * /api/board/menu/{menuId}/basic/{boardId}/comment/{commentId}:
 *   delete:
 *     summary: 댓글 삭제
 *     description: 본인이 작성한 댓글만 삭제할 수 있습니다. (soft-delete)
 *     tags: [BoardComment]
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
 *       - in: path
 *         name: boardId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 게시글 ID
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 댓글 ID
 *     responses:
 *       200:
 *         description: 댓글 삭제 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 result:
 *                   type: string
 *                   example: success
 *       400:
 *         description: 댓글을 찾을 수 없거나 본인 댓글이 아님
 *       401:
 *         description: 로그인 필요
 */
module.exports.delete = async (req, res) => {
  const { commentId } = req.params;

  const result = await models.BoardComment.destroy({
    where: { id: commentId, userId: req.user.id }
  });
  if (!result) {
    throw new Err(ErrInfo.BadRequest);
  }

  res.send(emptySuccessResponse);
};
