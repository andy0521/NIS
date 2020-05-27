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
var username = "admin";
var pwd="0000";
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
  if(req.body.username == username && req.body.pwd == pwd){
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
});

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/login', loginRouter);

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
