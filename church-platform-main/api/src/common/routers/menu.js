const express = require('express');
const asyncHandler = require('express-async-handler');
const controller = require('../controllers/menu');
const { checkAddMenu, checkUpdateMenu } = require('../middlewares');

const router = express.Router({ mergeParams: true });

router.get('/', asyncHandler(controller.list));
router.post('/', checkAddMenu, asyncHandler(controller.add));

router.get('/:id', asyncHandler(controller.detail));
router.put('/:id', checkUpdateMenu, asyncHandler(controller.update));
router.delete('/:id', asyncHandler(controller.delete));

module.exports = router;
