const express = require('express');
const asyncHandler = require('express-async-handler');
const controller = require('../controllers/files');
const { fileUpload, imageUpload } = require('../../middlewares');

const router = express.Router({ mergeParams: true });

// 파일 업로드
router
  .route('/')
  .post(fileUpload.single('file'), asyncHandler(controller.fileUpload));

// 이미지 업로드
router
  .route('/images')
  .post(imageUpload.single('image'), asyncHandler(controller.imageUpload));

// 디스크 업로드일 경우에만 유효
router.route('/:fileName').get(asyncHandler(controller.download));

// 디스크 업로드일 경우에만 유효
router.route('/images/:imageName').get(asyncHandler(controller.streamImage));

module.exports = router;
