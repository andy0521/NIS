var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/messagechange', function (req, res, next) {
  res.render('messagechange', { title: '護理站訊息編輯' });
});



module.exports = router;
