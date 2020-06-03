var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/exit', function(req, res, next) {
  res.render('exit', { title: '護理控台首頁' });
});

module.exports = router;
