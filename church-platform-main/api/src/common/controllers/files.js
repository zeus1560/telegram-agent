const path = require('path');
const config = require('config');

module.exports.fileUpload = async (req, res) => {
  res.send({ url: `${req.file.location}` });
};

module.exports.imageUpload = async (req, res) => {
  res.send({ url: `${req.file ? req.file.location : ''}` });
};

module.exports.download = async (req, res) => {
  const { fileName } = req.params;
  const filePath = path.join(`${config.fileInfo.destination}/files`, fileName);
  res.download(filePath);
};

module.exports.streamImage = (req, res) => {
  const { imageName } = req.params;
  const options = {
    root: path.resolve(`${config.fileInfo.destination}/images`),
    dotfiles: 'deny'
  };
  res.sendFile(imageName, options);
};
