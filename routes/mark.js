var express = require('express');
var router = express.Router();

router.get('/', (req, res, next) => {
  res.redirect('/');
  return;
});

module.exports = router;