var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/remindlist', function(req, res, next) {
  res.render('remindlist', { title: '溫馨提醒訊息列表' });
});

module.exports = router;
