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
var preusername = "admin";
var prepwd="";
//sql setting
var conn = mysql.createConnection({
  host : 'localhost',
  prot : '3306',
  user: 'root',
  password : '123456',
  database : 'nis'
});

var connStatus = 0;


router.get('/login', function(req, res){//取得登入頁面
  res.render('login',{'wrong':" "})
})
  router.get('/', function(req, res, next) {
    if(req.session.userName){  //判斷session 狀態，如果有效，則返回主頁，否则轉到登錄頁面
      wrong=false;
        res.render('index',{username : req.session.userName}); 
    }else{
        res.redirect('login');//導向登入頁面
    }
  });

  app.post('/login', function(req, res,next){ 
    var username = req.body.username;
    var password = req.body.pwd; 
    if(username == preusername && password == prepwd){//假密碼登入
      req.session.userName = req.body.username; // 登錄成功，设置 session
      wrong=false;
      res.redirect('/');
  }
  else{
  }
    var sql = 'select DeptCode, Password from eecode where DeptCode = "'+ username +'" and Password = "'+ password +'")';
    if(username && password){
      conn.query(sql,[username,password], function(error, results, fields){
       
          req.session.userName = req.body.username; // 登錄成功，设置 session
          wrong=false;
          console.log(username+' '+password);
          res.redirect('/');
          req.session.userName = req.body.username; // 登錄成功，设置 session
        res.end();
      });       
           
    } else {
      res.render('login',{'wrong':"帳號或密碼錯誤"})
      res.end();
    }
    
  });
  module.exports = router;
 