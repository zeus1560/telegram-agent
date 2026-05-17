const express = require('express');
const asyncHandler = require('express-async-handler');
const {
  login,
  logout,
  profile,
  adminLogin,
  join
} = require('../controllers/login');
const departmentRouter = require('./departmanet');
const menuRouter = require('./menu');
const fileRouter = require('./files');
const userRouter = require('./user');
const { onlyLoginUser } = require('../../middlewares');

const router = express.Router({ mergeParams: true });

router.post('/join', asyncHandler(join));
router.post('/login/admin', asyncHandler(adminLogin));
router.post('/login', asyncHandler(login));
router.post('/logout', asyncHandler(logout));
router.get('/profile', onlyLoginUser, asyncHandler(profile));

router.use('/departments', departmentRouter);
router.use('/menu', menuRouter);
router.use('/files', fileRouter);
router.use('/users', userRouter);

module.exports = router;
