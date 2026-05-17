const express = require('express');
const asyncHandler = require('express-async-handler');
const controller = require('../controllers/boardComment');
const { onlyLoginUser } = require('../../middlewares');

const router = express.Router({ mergeParams: true });

router.get('/', asyncHandler(controller.list));
router.post('/', onlyLoginUser, asyncHandler(controller.add));
router.put('/:commentId', onlyLoginUser, asyncHandler(controller.update));
router.delete('/:commentId', onlyLoginUser, asyncHandler(controller.delete));

module.exports = router;
