var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var app = express();
var session = require('express-session');
var bodyparser = require('body-parser');

var wrong=false;
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var loginRouter = require('./routes/login');
var exitmapRouter = require('./routes/exitmap');
var messageRouter = require('./routes/messsage');
var remindRouter = require('./routes/remind');
var shiftRouter = require('./routes/shift');
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
app.use(bodyparser.urlencoded({ extended: true }));
// 使用 session
app.use(session({
    secret :  'secret', // 對session id 相關的cookie 進行签名
    resave : true,
    saveUninitialized: false, 
    cookie : {
        maxAge : 1000 * 60 * 3, // 設置 session 的有效时間，單位毫秒
    },
}));
// 獲取登入頁面
app.get('/login', function(req, res){
  res.render('login',{'wrong':" "})
  
    })
  


app.post('/login', function(req, res){
  var username = req.body.username;
  var password = req.body.pwd; 
 /* var sql = `select * from eecode where DeptCode = '${username}' and Password = '${password}'`;
  connection.query(sql, function (err, result) {
    console.log(result)
    if (err || result.length == 0) {
        res.status(200),
            res.json("登陸失敗")
    } else {
        res.status(200),
            res.json("登陸成功")
    }
});*/
  if(username == preusername && password == prepwd){
      req.session.userName = req.body.username; // 登錄成功，设置 session
      wrong=false;
      res.redirect('/');

  }
  else{

    res.render('login',{'wrong':"帳號或密碼錯誤"})
    
     
  }
});

// 獲取主頁
app.get('/', function (req, res) {
  if(req.session.userName){  //判斷session 狀態，如果有效，則返回主頁，否则轉到登錄頁面
    wrong=false;
      res.render('index',{username : req.session.userName});
      
  }else{
  
      res.redirect('login');
  }
})
app.get('/logout', function (req, res) {
  req.session.userName = null; // 删除session
  res.redirect('login');
});
app.get('/changepwd', function(req, res){
  res.render('changepwd',{'wrong':" "})
});
app.post('/changepwd', function(req, res){
  if(req.body.username == username && req.body.pwd == pwd){
      pwd=req.body.new_pwd
      
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
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/login', loginRouter);
app.use('/exitmap', exitmapRouter);
app.use('/message', messageRouter);
app.use('/remind', remindRouter);
app.use('/shift',shiftRouter);

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
