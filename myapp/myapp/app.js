var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var app = express();
var session = require('express-session');
var bodyparser = require('body-parser');


var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var loginRouter = require('./routes/login');
var username = "admin";
var pwd="0000";
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(bodyparser.json()); // 使用bodyparder中间件，
app.use(bodyparser.urlencoded({ extended: true }));
// 使用 session 中间件
app.use(session({
    secret :  'secret', // 对session id 相关的cookie 进行签名
    resave : true,
    saveUninitialized: false, // 是否保存未初始化的会话
    cookie : {
        maxAge : 1000 * 60 * 3, // 设置 session 的有效时间，单位毫秒
    },
}));
// 获取登录页面
app.get('/login', function(req, res){
  res.sendFile(__dirname,'views' + '/login.html')
});

app.post('/login', function(req, res){
  if(req.body.username == username && req.body.pwd == pwd){
      req.session.userName = req.body.username; // 登录成功，设置 session
      res.redirect('/');
  }
  else{
      res.redirect('/');
      res.json({ret_code : 1, ret_msg : '账号或密码错误'});// 若登录失败，重定向到登录页面
     
  }
});

// 获取主页
app.get('/', function (req, res) {
  if(req.session.userName){  //判断session 状态，如果有效，则返回主页，否则转到登录页面
      res.render('index',{username : req.session.userName});
  }else{
      res.redirect('login');
  }
})
app.get('/logout', function (req, res) {
  req.session.userName = null; // 删除session
  res.redirect('login');
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
