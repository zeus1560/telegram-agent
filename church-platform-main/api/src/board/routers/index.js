const express = require('express');
const boardBasicController = require('./boardBasic');
const calendarController = require('./boardCalendar');
const commentController = require('./boardComment');

const router = express.Router({ mergeParams: true });

router.use('/menu/:menuId/basic', boardBasicController);
router.use('/menu/:menuId/basic/:boardId/comment', commentController);
router.use('/menu/:menuId/calendar', calendarController);

module.exports = router;
