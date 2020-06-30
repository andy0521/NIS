var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/remindchange', function (req, res, next) {
  res.render('remindchange', { title: '溫馨提醒訊息編輯' });
});



module.exports = router;
