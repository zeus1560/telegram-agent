const express = require('express');
const asyncHandler = require('express-async-handler');
const controller = require('../controllers/user');

const router = express.Router({ mergeParams: true });

router
  .route('/')
  .get(asyncHandler(controller.list))
  .post(asyncHandler(controller.add));

router
  .route('/:id')
  .get(asyncHandler(controller.detail))
  .put(asyncHandler(controller.update))
  .delete(asyncHandler(controller.delete));

router.put('/:id/approve', asyncHandler(controller.approve));

module.exports = router;
