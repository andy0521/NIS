var express = require('express');
var router = express.Router();
var mysql  = require ('mysql');
var bodyParser = require('body-parser');
var app=express();
var session = require('express-session');
var preusername = "admin";
var prepwd="";
/* GET home page. */
var loginRouter = require('./routes/login');
var conn = mysql.createConnection({
  host : 'localhost',
  prot : '3306',
  user: 'root',
  password : '123456',
  database : 'nis'
});

/*router.get('/login', function(req, res){//取得登入頁面
  res.render('login',{'wrong':" "})
})

router.get('/', function(req, res, next) {
  if(req.session.userName){  //判斷session 狀態，如果有效，則返回主頁，否则轉到登錄頁面
    wrong=false;
      res.location('/');
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

router.get('/logout', function (req, res,next) {
  req.session.userName = null; // 删除session
  res.redirect('login');
});
router.get('/changepwd', function(req, res,next){
  res.render('changepwd',{'wrong':" "})
});
router.post('/changepwd', function(req, res,next){

  if(req.body.username == preusername && req.body.pwd == prepwd){
      prepwd=req.body.new_pwd
      
      res.redirect('/');
  }
  else{
    res.render('changepwd',{'wrong':"帳號或密碼錯誤"})
   
     
  }
  router.get('/logout', function (req, res,next) {
  req.session.userName = null; // 删除session
  res.redirect('login');
});
});
router.get('/exitmap', function (req, res,next) {
 res.render('exitmap')
});
router.get('/message', function (req, res,next) {
  res.render('message')
 });
 router.get('/remind', function (req, res,next) {
  res.render('remind')
 });
router.get('/shift',function(req,res,next){
  res.render('shift')
});
router.get('/messagelist',function(req,re,next){
  res.render('messagelist')
});

*/
module.exports = router;
