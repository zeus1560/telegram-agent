const express = require('express');
const router = express.Router();

router.get('/health', (req, res) => {
  res.send('OK');
});

module.exports = router;
router.get('/health', (req, res) => {
  res.send('OK');
});
router.get('/ping', (req, res) => {
  res.send('PONG');
});