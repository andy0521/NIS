var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/exitmap', function (req, res, next) {
  res.render('exitmap', { title: '逃生平面圖' });
});

module.exports = router;
