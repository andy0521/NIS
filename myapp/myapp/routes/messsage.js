var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/message', function(req, res, next) {
  res.render('message', { title: '護理站訊息編輯' });
});



module.exports = router;


