var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var app = express();
var session = require('express-session');
var bodyparser = require('body-parser');
var mysql = require('mysql');
var conn = require ('./lib/mysql');
var wrong=false;
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
//var loginRouter = require('./routes/login');
var exitmapRouter = require('./routes/exitmap');
var messageRouter = require('./routes/messsage');
var remindRouter = require('./routes/remind');
var shiftRouter = require('./routes/shift');
var messagelistRouter = require('./routes/messagelist');
var preusername = "admin";
var prepwd="";
/*var connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '123456',
  database: 'nis'
});
connection.connect();*/
// view engine setup

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(bodyparser.json()); // 使用bodyparder
app.use(bodyparser.urlencoded({ extended: false }));
// 使用 session
var con = mysql.createConnection({
  host: 'localhost',
  port: '3306',
  user: 'root',
  password: '123456',
  database: 'nis'
});

var user = "";
var  username = "";
var password = ""; 
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(function(req, res, next) {
  req.con = con;
  next();
});
app.use(session({
  secret :  'secret', // 對session id 相關的cookie 進行签名
  resave : true,
  saveUninitialized: false, 
  cookie : {
     // maxAge : 1000 * 60 * 3, // 設置 session 的有效时間，單位毫秒
  },
}));



// 獲取登入頁面
app.get('/login', function(req, res){
  res.render('login',{'wrong':" "})
    })
  




app.post('/login', function(req, res){
  
   username = ""+req.body.username;
   password = ""+req.body.pwd; 
  var NST = 9;//預設護理站
  
  if(username == preusername && password == prepwd){
    req.session.userName = req.body.username; // 登錄成功，设置 session

    console.log("fakelogin");
    
    res.render('index',{'user':username, data:" "});
    

}else{
} 
  var sql = "select EEName from eecode where EENO = "+username+" and Password = '"+password+"'";//檢查資料庫有沒有使用者
  if(username && password){
    con.query(sql,[username,password], function(err, rs, fields){

      if(rs.length >0){
        req.session.userName = req.body.username; // 登錄成功，设置 session
   
        wrong=false;
        console.log(rs);
        console.log(username+' '+password);
        user = rs[0].EEName;
        
       
       
      }else {
        res.render('login',{'wrong':"帳號或密碼錯誤"})
        console.log(wrong);
   
    
      }
        // use index.ejs
       
    });
    con.query('Select BNo,PName,MN,CNS  from bhdata join patientdata using(PNo) where BNo like '+"?",[NST+"%"] , function(err, rows) {
      if (err) {
          console.log(err);
      }
      if(rows.length >0){
          var data = rows;
          console.log (data);

          res.render('index',{"user":req.session.userName,data:data});
        }else {
          res.render('index',{"user":req.session.userName,data:"null"});
          console.log(wrong);
     
      
        }
  });
    
     
  
      
      con.end(); 
  } else {
    res.render('login',{'wrong':"帳號或密碼錯誤"})
		res.end();
  }
  
  
});

// 獲取主頁
app.get('/logout', function (req, res) {
   username = "";
  password = ""; 
  req.session.userName = null; // 删除session
  res.render('login',{'wrong':" "})
});
app.get('/changepwd', function(req, res){
  res.render('changepwd',{'wrong':" "})
});
app.post('/changepwd', function(req, res){

  if(req.body.username == preusername && req.body.pwd == prepwd){
      prepwd=req.body.new_pwd
      
      res.redirect('/');
  }
  else{
    res.render('changepwd',{'wrong':"帳號或密碼錯誤"})
   
     
  }
  app.get('/logout', function (req, res) {
  req.session.userName = null; // 删除session
  res.redirect('login');
});
});
app.get('/exitmap', function (req, res) {
 res.render('exitmap')
});
app.get('/message', function (req, res) {
  res.render('message')
 });
 app.get('/remind', function (req, res) {
  res.render('remind')
 });
app.get('/shift',function(req,res){
  res.render('shift')
});
app.get('/messagelist',function(req,res){
  res.render('messagelist')
});
app.get('/detail',function(req,res){
  res.render('detail')
});
app.get("/changeNST",function(req,res){
  NST=
  res.redirect("index");
})
app.post('/changeNST', function (req, res) {
  let NST = req.body.changeNST;
  console.log(NST);
  con.query('Select BNo,PName,MN,CNS  from bhdata join patientdata using(PNo) where BNo like '+"?",[NST+"%"]  , function(err, rows) {
      if (err) {
          console.log(err);
      }
      if(rows.length >0){
          console.log(rows);
          var data = rows;
          console.log (data);

          res.render('index',{"user":req.session.userName,data:data});
        }else {
          res.render('index',{"user":req.session.userName,data:"null"});
          console.log(wrong);
     
      
        }
});
});
app.use('/', indexRouter);
//app.use('/login', loginRouter);
app.use('/users', usersRouter);
app.use('/exitmap', exitmapRouter);
app.use('/message', messageRouter);
app.use('/remind', remindRouter);
app.use('/shift',shiftRouter);
app.use('/messagelist',messagelistRouter);



// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
