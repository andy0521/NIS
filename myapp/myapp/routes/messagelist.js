var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/messagelist', function(req, res, next) {
  res.render('messagelist', { title: '護理站訊息列表' });
});

module.exports = router;
