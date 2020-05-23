var express = require('express');
var router = express.Router();

/* GET home page. */
router.post('/', function(req, res, next) {
  res.render('index', { title: '護理控台首頁'});
  
});

module.exports = router;
