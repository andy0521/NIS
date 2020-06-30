var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/remind', function (req, res, next) {
  res.render('remind', { title: '新增溫馨提醒訊息' });
});

module.exports = router;
