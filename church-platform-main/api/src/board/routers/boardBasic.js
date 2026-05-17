const express = require('express');
const asyncHandler = require('express-async-handler');
const controller = require('../controllers/board');
const { fileUpload, imageUpload } = require('../../middlewares');

const router = express.Router({ mergeParams: true });

// 어드민 에서 board 리스트
router.get('/', asyncHandler(controller.list));

// board 추가
router.post(
  '/',
  fileUpload.array('attachedFiles'),
  asyncHandler(controller.add)
);

// board img 추가
router.post(
  '/images',
  imageUpload.single('image'),
  asyncHandler(controller.addImage)
);

// board 수정
router.put(
  '/:id',
  fileUpload.array('attachedFiles'),
  asyncHandler(controller.update)
);

// front 에서 리스트
router.get('/front', asyncHandler(controller.frontList));

// board 상세
router.get('/:id', asyncHandler(controller.detail));

// board 삭제
router.delete('/:id', asyncHandler(controller.delete));

module.exports = router;
