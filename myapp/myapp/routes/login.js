var express = require('express');
var router = express.Router();
var mysql  = require ('mysql');
var session = require('express-session');
var bodyparser = require('body-parser');
var app = express();
app.use(bodyparser.json()); // 使用bodyparser
app.use(bodyparser.urlencoded({ extended: true }));
/* GET users listing. */
app.use(session({
  secret :  'secret', // 對session id 相關的cookie 進行签名
  resave : true,
  saveUninitialized: false, 
  cookie : {
    //  maxAge : 1000 * 60 * 3, // 設置 session 的有效时間，單位毫秒
  },
}));
//sql setting
var conn = mysql.createConnection({
  host : 'localhost',
  prot : '3306',
  user: 'root',
  password : '123456',
  database : 'nis'
});

var connStatus = 0;



router.get('/login', function(req, res, next) {
    res.render('login', { title: '護理控台' });
  });
  router.get('/', function(req, res, next) {
    res.render('index');
  });

  module.exports = router;
 