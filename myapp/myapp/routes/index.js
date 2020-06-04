var express = require('express');
var router = express.Router();
var mysql  = require ('mysql');
var bodyParser = require('body-parser');
/* GET home page. */
var conn = mysql.createConnection({
  host : 'localhost',
  prot : '3306',
  user: 'root',
  password : '123456',
  database : 'nis'
});
router.get('/', function(req, res, next) {
  res.render('index', { title: '護理控台首頁',items:[] });
});

module.exports = router;
