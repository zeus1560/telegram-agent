const multer = require('multer');
const uuid = require('uuid');
const path = require('path');

const { Err, ErrInfo } = require('./err');

const imageExt = ['jpg', 'jpeg', 'bmp', 'png'];

const diskStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, 'uploads/files/');
  },
  filename: (_req, file, cb) => {
    const extension = path.extname(file.originalname);
    cb(null, `${uuid.v4()}${extension}`);
  }
});

module.exports.fileUpload = multer({
  limits: {
    fileSize: 3000000
  },
  storage: diskStorage
});

module.exports.imageUpload = multer({
  limits: {
    fileSize: 3000000
  },
  fileFilter: (_req, file, cb) => {
    if (imageExt.includes(path.extname(file.originalname))) {
      cb(new Err(ErrInfo.FileExtNotAllowed));
    } else {
      cb(null, true);
    }
  },
  storage: diskStorage
});

module.exports.deleteFile = async (fileKey) => {
  const fs = require('fs');
  const filePath = path.join('uploads/files/', fileKey);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};

module.exports.onlyLoginUser = (req, _res, next) => {
  if (req.user) {
    next();
    return;
  }
  throw new Err(ErrInfo.UnAuthorized);
};
