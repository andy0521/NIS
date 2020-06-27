var express = require('express');
var router = express.Router();
var mysql  = require ('mysql');
var bodyParser = require('body-parser');
var connStatus = 0;
/* GET users listing. */
var app = express();
  var conn = mysql.createConnection({
    host : 'localhost',
    prot : '3306',
    user: 'root',
    password : '123456',
    database : 'nis'
  });
  var sql;
  router.get('/', function(req, res, next) {
    res.redirect('/');
  });
 
  module.exports = router;