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
var remindlistRouter = require('./routes/remindlist');
const { data } = require('jquery');
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
var username = "";
var password = ""; 
var NST = 9;//預設護理站
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
   if(password==""){
    res.render('login',{'wrong':"帳號或密碼為空"})
   }
   if(username==""){
    res.render('login',{'wrong':"帳號或密碼為空"})
   }
  if(username == preusername && password == prepwd){
    req.session.userName = req.body.username; // 登錄成功，设置 session

    console.log("fakelogin");
    
    res.render('index',{'user':username, data:" ",NST:NST});
    

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

      } else {
        res.render('login',{'wrong':"帳號或密碼錯誤"})
    
      }
      
      con.query('Select BNo,PName,MN,CNS  from bhdata join patientdata using(PNo) where DHDate =0 and BNo like '+"?",[NST+"%"]  , function(err, rows) {//查詢預設護理站欄位
        if (err) {
            console.log(err);
        }
        if(rows.length >0){
            var data = rows;
            console.log (data);
  
            res.render('index',{"user":req.session.userName,data:data,NST:NST});
          }else {
            res.redirect('index',{"user":req.session.userName,data:"null"});
            console.log(wrong);
       
        
          }
      });
        // use index.ejs
    });
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
app.post('/changepwd', function(req, res){ // 變更密碼render & SQL command
  console.log('original username:'+username+'/ password:'+password);
  if(req.body.username == preusername && req.body.pwd == prepwd){ // admin情況的模擬變更
      
      prepwd=req.body.new_pwd;
      res.redirect('/');
  }else if(req.body.username == username && req.body.pwd == password){ // 一般情況的密碼變更
      var newpassword = ""+req.body.new_pwd;
      if(newpassword == password || newpassword == ""){
        res.render('changepwd', {'wrong':"新密碼不得與舊密碼相同或空白"})
      }else{
        con.query("update eecode set Password = '"+ newpassword +"' where EENo ="+username)
        res.redirect('/')
      }


  }else{
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
app.get('/contact', function (req, res) {
  res.render('contact',{"user":req.session.userName})
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
app.get('/remindlist',function(req,res){
  res.render('remindlist')
});
app.get('/detail/:BNo',function(req,res){
  BNo=req.params.BNo;
console.log(BNo);
  con.query('Select BNo,PName,MN,CNS  from bhdata join patientdata using(PNo) where  BNo like '+"?",[BNo]  , function(err, rows) {
    if (err) {
        console.log(err);
    }
    if(rows.length >0){
        console.log(rows);
        var data = rows;
        console.log (data);
        console.log(data[0].PName);
     
        
        res.render('detail.ejs',{PName:data[0].PName,BNo:data[0].BNo,CNS:data[0].CNS,MN:data[0].MN});
      }else {
        res.render('index',{"user":req.session.userName,data:"null"});
        console. log(wrong);
   
    
      }
});
 
});

app.post('/changeNST', function (req, res) {//切換護理站
  preNST=9;

  NST = req.body.NSTdata;
  if(NST==""){
    NST=preNST;
    
    }
    var changeNST=NST;
    console.log("現在護理站:"+changeNST)
  console.log(NST);
  con.query('Select BNo,PName,MN,CNS  from bhdata join patientdata using(PNo) where  DHDate =0 and BNo like '+"?",[NST+"%"]  , function(err, rows) {
      if (err) {
          console.log(err);
      }
      if(rows.length >0){
          console.log(rows);
          var data = rows;
          console.log (data);
          
          res.render('index',{"user":req.session.userName,data:data, "NST":changeNST});
        }else {
          res.render('index',{"user":req.session.userName,data:"","NST":changeNST});

          console.log(wrong);
     
      
        }
});
    
});
app.post('/savePD',function(req,res){

  console.log('PName:' +req.body.PName);
  console.log('Taboo:' + req.body.TABOO);
  taboo = req.body.TABOO;
  res.send(req.body.name + '謝謝你的回覆');
})

app.use('/', indexRouter);
//app.use('/login', loginRouter);
app.use('/users', usersRouter);
app.use('/exitmap', exitmapRouter);
app.use('/message', messageRouter);
app.use('/remind', remindRouter);
app.use('/shift',shiftRouter);
app.use('/messagelist',messagelistRouter);
app.use('/remindlist',remindlistRouter);



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
