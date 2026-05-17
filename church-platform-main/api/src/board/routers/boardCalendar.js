const express = require('express');
const asyncHandler = require('express-async-handler');
const controller = require('../controllers/calendar');

const router = express.Router({ mergeParams: true });

router.get('/', asyncHandler(controller.list));
router.post('/', asyncHandler(controller.add));

router.get('/:id', asyncHandler(controller.detail));
router.put('/:id', asyncHandler(controller.update));
router.delete('/:id', asyncHandler(controller.delete));

module.exports = router;
