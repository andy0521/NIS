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
const { compile } = require('morgan');
const { cpuUsage } = require('process');
const f = require('session-file-store');
const { SSL_OP_SSLEAY_080_CLIENT_DH_BUG } = require('constants');
var preusername = "admin";
var prepwd="";
var preNST=9;
var taboocount=12;
var pretaboorecord = ["TABOO_01","TABOO_02","TABOO_03","TABOO_04","TABOO_05","TABOO_06","TABOO_07","TABOO_08","TABOO_09","TABOO_10","TABOO_11","TABOO_12"];
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

app.get('/changepwd', function(req, res){//進入頁面
  res.render('changepwd',{'wrong':" ","username":req.session.username})

});
app.post('/change_pwd', function(req, res){ // 變更密碼render & SQL command
  username = req.body.username;
   con.query("select Password from eecode where EENo = "+""+username+"",function(err,rows){
    if (err) {
      console.log(err);
  }
  if(rows.length >0){
    password =rows[0].Password;
 
  console.log('original username:'+username+'/ password:'+password);
  }
  if(req.body.username == preusername & req.body.pwd == prepwd){ // admin情況的模擬變更
      prepwd=req.body.new_pwd;
      res.redirect('/');
  }else if(req.body.username == username & req.body.pwd == password){ // 一般情況的密碼變更
      var newpassword = ""+req.body.new_pwd;
      console.log(newpassword);
      if(newpassword == password || newpassword == ""){
        res.render('changepwd', {'wrong':"新密碼不得與舊密碼相同或空白"})
      }else{
        sql ="update eecode set Password = '"+ newpassword +"' where EENo ='"+username+"'";
        console.log(sql);
        con.query(sql);
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
     
      }


  }
});
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
  con.query('Select BNo,PNo,PName,MN,CNS  from bhdata join patientdata using(PNo)  where  BNo like '+"?",[BNo]  , function(err, rows) {
    if (err) {
        console.log(err);
    }
    if(rows.length >0){
        console.log(rows);
        var data = rows;
        console.log (data);
        console.log(data[0].PName);
        PNo=data[0].PNo;
        var checkdatasql = "select * from taboorecord join bedidx using (PNo) where PNo =?";
        con.query(checkdatasql,[""+PNo] ,function(err,rows){//檢查sql

          if (err) {
            console.log(err);
        }
        if(rows.length >0){//查到資料
          console.log(rows);
          selecttaboo= rows[0];
          console.log(selecttaboo);

      }


    });
        
        res.render('detail.ejs',{PName:data[0].PName,BNo:data[0].BNo,CNS:data[0].CNS,MN:data[0].MN,PNo:data[0].PNo});
      }else {
        res.render('index',{"user":req.session.userName,data:"null"});
        console. log(wrong);
   
    
      }
});
 
});

app.post('/changeNST', function (req, res) {//切換護理站

  NST = req.body.NSTdata;
  
  if(NST==""){
    NST=preNST;
    }
    preNST=NST;
    
    console.log("現在護理站:"+preNST)
  console.log(NST);
  con.query('Select BNo,PNo,PName,MN,CNS  from bhdata join patientdata using(PNo) where  DHDate =0 and BNo like '+"?",[NST+"%"]  , function(err, rows) {
      if (err) {
          console.log(err);
      }
      if(rows.length >0){
          console.log(rows);
          var data = rows;
          console.log (data);
         
        
          res.render('index',{"user":req.session.userName,data:data, "NST":preNST,taboo:selecttaboo});
        }else {
          res.render('index',{"user":req.session.userName,data:"","NST":preNST});

          console.log(wrong);
     
      
        }
});
    
});
app.post('/savePD',function(req,res){
  console.log("類型："+typeof(req.body.TABOO))
  console.log(req.body.TABOO);
   var sqltaboo=[];
  var settrue=[];
  var  inserttaboo = [];
  var  updatetaboo = [];
  var taboo;
  var PNo = req.body.PNo;//序號
  taboo=req.body.TABOO;
  
  console.log(taboo);
  console.log(PNo);
 
  console.log(typeof(taboo));
  if(req.body.TABOO==null){
    
  }else{
    taboo = new Array(req.body.TABOO);//轉陣列
    console.log("取得資料長度"+taboo.length);
    console.log (taboo);
    
}

  var checkdatasql = "select * from taboorecord where PNo =?";
  con.query(checkdatasql,[""+PNo] ,function(err,rows){//檢查sql

    if (err) {
      console.log(err);
  }
  console.log(rows);
  
  if(rows.length >0){//查到資料
      console.log(rows);
      if(req.body.TABOO==undefined){//全部傳0
        sql = "Update taboorecord set TABOO_01 = false,TABOO_02 = false,TABOO_03 = false,TABOO_04 = false,TABOO_05 = false,TABOO_06 = false, TABOO_07 = false ,TABOO_08 = false,TABOO_09 = false,TABOO_10 = false,TABOO_11 = false,TABOO_12 = false where PNo = ? "
        con.query(sql,[PNo], function(err,rowa){
          if(err){
            console.log(err);
          }
          console.log(rows);
        });
      }else{
        if(taboo.length==1){
          
      
      }else{
        
      }
 

  


        for (i=0;i<req.body.TABOO.length;i++){//有用
          updatetaboo[i] = req.body.TABOO[i] +"=1"+" "
        }
      sql="Update taboorecord set "+""+updatetaboo+""+ " where PNo= ?";
      
      con.query(sql,[""+PNo]);//有問題
      }
    }else {
      if(req.body.TABOO==undefined){//預設值
        sql = "insert into taboorecord (PNo) value(?)" ;
        con.query(sql,[""+PNo]);
      }else{
        if(taboo.length==1){
          for (i=0;i<taboo.length;i++){
            settrue[i] = 1;
          }
        }else{
          for (i=0;i<req.body.TABOO.length;i++){
            settrue[i] = 1;
          }
        }
     sql = "insert into taboorecord (PNo,?) value(?,?)" ;
    con.query(sql,[taboo,""+PNo,settrue]);
      }
  
    }
  })
  
 
  
  console.log('Taboo:' + req.body.TABOO);
  if(req.body.TABOO==null){
    sql = "";
    res.send(req.body.name + '謝謝你的回覆!12');
  }
 
 
  for(i=0;i<taboo;i++){

  }
  console.log(taboo);
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
