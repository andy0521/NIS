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
var preDNR = ["BIdx_01","BIdx_02","BIdx_03","BIdx_04","BIdx_05","BIdx_06","BIdx_07","BIdx_08","BIdx_09","BIdx_10"];
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
var con = mysql.createConnection({//建立連線
  host: 'localhost',
  port: '3306',
  user: 'root',
  password: '123456',
  database: 'nis'
});

var user = "";
var username = "";
var password = ""; 
var BNo;
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
  




app.post('/login', function(req, res){//登入功能
  
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
    req.session.preNST=preNST;
    console.log("fakelogin");
    
    res.render('index',{'user':username, data:" ",NST:NST,"changeselect":preNST+"號護理站"});
    

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
  
            res.render('index',{"user":req.session.userName,data:data,NST:NST,"changeselect":preNST+"號護理站"});
          }else {
            res.redirect('index',{"user":req.session.userName,data:"null","changeselect":preNST+"號護理站"});
            console.log(wrong);
       
        
          }
      });
        // use index.ejs
    });
  }
    
     
  
  
});
app.get('/', function(req, res, next) {//重新導入至首頁

    
  if(req.session.userName){ 
 
  var data = "";

  var user = "";
  var user = req.query.user;


  con.query('Select BNo,PName,MN,CNS  from bhdata join patientdata using(PNo) where DHDate =0 and BNo like '+"?",[NST+"%"] , function(err, rows) {
    if (err) {
        console.log(err);
    }
    if(rows.length >0){
        var data = rows;
        console.log (data);

        res.render('index',{"user":req.session.userName,data:data,NST:NST,"changeselect":preNST+"號護理站"});
      }else {
        res.redirect('index',{"user":req.session.userName,data:"null",NST:NST,"changeselect":preNST+"號護理站"});
        console.log(wrong);
   
    
      }
});

  
 
  }else{
      var data=　"" ;
        res.redirect('login');//導向登入頁面
       
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
 res.render('exitmap',{"user":req.session.userName,"changeselect":preNST+"號護理站"})
});
app.get('/contact', function (req, res) {
  res.render('contact',{"user":req.session.userName,"changeselect":preNST+"號護理站"})
 });
app.get('/message', function (req, res) {
  res.render('message',{"user":req.session.userName,"changeselect":preNST+"號護理站"})
 });
 app.get('/remind', function (req, res) {
  res.render('remind')
 });
app.get('/shift',function(req,res){//排班網頁
  
  res.render('shift',{"user":req.session.userName,"changeselect":preNST+"號護理站"})

});
app.get('/messagelist',function(req,res){
  res.render('messagelist',{"user":req.session.userName,"changeselect":preNST+"號護理站"})
});
app.get('/remindlist',function(req,res){
  res.render('remindlist',{"user":req.session.userName,"changeselect":preNST+"號護理站"})
});
app.get('/detail/:BNo',function(req,res){
  BNo=req.params.BNo;
  var listtaboo=[];
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
        console.log(PNo);
        var checkdatasql = "select * from taboorecord join bedidx using (PNo) where PNo =?";
        con.query(checkdatasql,[""+PNo] ,function(err,rows){//檢查sql
          if (err) {
            console.log(err);
        }
        if(rows.length >0){//查到資料
          console.log(rows);
 
        
          var checkdatasql = "select TABOO_01,TABOO_02,TABOO_03,TABOO_04,TABOO_05,TABOO_06,TABOO_07,TABOO_08,TABOO_09,TABOO_10,"+
          "TABOO_11,TABOO_12,BIdx_01,BIdx_02,BIdx_03,BIdx_04,BIdx_05,BIdx_06,BIdx_07,BIdx_08,BIdx_09,BIdx_10 from taboorecord join bedidx using (PNo) where PNo =?";
                con.query(checkdatasql,[""+PNo] ,function(err,rows){//檢查sql
                  if(rows.length >0){//查到資料
                    console.log(rows);
                    listtaboo= rows[0];
                    console.log(Object.keys(listtaboo));
                    console.log(Object.values(listtaboo));
                    const idList=Object.keys(listtaboo);
                    const valueList =Object.values(listtaboo);
                    console.log(idList);
                    console.log(valueList);
                    for(i=0;i<valueList.length;i++){
                      if(valueList[i]==1){
                        valueList[i]="checked";
                      }else{
                        valueList[i]="";
                      }
                      
                    }
                    console.log(valueList);
                    res.render('detail.ejs',{"user":req.session.userName,PName:data[0].PName,BNo:data[0].BNo,CNS:data[0].CNS,MN:data[0].MN,PNo:data[0].PNo,"changeselect":preNST+"號護理站",TABOO_01:idList[0]
                    ,TABOO_02:idList[1],TABOO_03:idList[2],TABOO_04:idList[3],TABOO_05:idList[4],TABOO_06:idList[5],TABOO_07:idList[6],TABOO_08:idList[7],TABOO_09:idList[8],TABOO_10:idList[9],TABOO_11:idList[10],TABOO_12:idList[11],
                    BIdx_01:idList[12],BIdx_02:idList[13],BIdx_03:idList[14],BIdx_04:idList[15],BIdx_05:idList[16],BIdx_06:idList[17],BIdx_07:idList[18],BIdx_08:idList[19],BIdx_09:idList[20],BIdx_10:idList[21],checked:valueList});
                  }
                  }); 
      //    res.render('detail.ejs',{"user":req.session.userName,PName:data[0].PName,BNo:data[0].BNo,CNS:data[0].CNS,MN:data[0].MN,PNo:data[0].PNo,"changeselect":preNST+"號護理站"});
          }else{
              sql = "insert into taboorecord (PNo) value(?)" ;//新建資料，需要預設值
              con.query(sql,[""+PNo]);
              sql = "insert into bedidx (PNo) value(?)" ;//新建資料
              con.query(sql,[""+PNo]);
                }
                var checkdatasql = "select TABOO_01,TABOO_02,TABOO_03,TABOO_04,TABOO_05,TABOO_06,TABOO_07,TABOO_08,TABOO_09,TABOO_10,"+
                "TABOO_11,TABOO_12,BIdx_01,BIdx_02,BIdx_03,BIdx_04,BIdx_05,BIdx_06,BIdx_07,BIdx_08,BIdx_09,BIdx_10 from taboorecord join bedidx using (PNo) where PNo =?";
                con.query(checkdatasql,[""+PNo] ,function(err,rows){//檢查sql
                  if(rows.length >0){//查到資料
                    console.log(rows);
                    listtaboo= rows[0];
                    const idList=Object.keys(listtaboo);
                    const valueList =Object.values(listtaboo);
                    console.log(idList);
                    console.log(valueList);
                   
                    for(i=0;i<valueList.length;i++){
                      if(valueList[i]==1){
                        valueList[i]="checked";
                      }else{
                        valueList[i]="";
                      }
                      
                    }
                    res.render('detail.ejs',{"user":req.session.userName,PName:data[0].PName,BNo:data[0].BNo,CNS:data[0].CNS,MN:data[0].MN,PNo:data[0].PNo,"changeselect":preNST+"號護理站",TABOO_01:idList[0]
                    ,TABOO_02:idList[1],TABOO_03:idList[2],TABOO_04:idList[3],TABOO_05:idList[4],TABOO_06:idList[5],TABOO_07:idList[6],TABOO_08:idList[7],TABOO_09:idList[8],TABOO_10:idList[9],TABOO_11:idList[10],TABOO_12:idList[11],
                    BIdx_01:idList[12],BIdx_02:idList[13],BIdx_03:idList[14],BIdx_04:idList[15],BIdx_05:idList[16],BIdx_06:idList[17],BIdx_07:idList[18],BIdx_08:idList[19],BIdx_09:idList[20],BIdx_10:idList[21],checked:valueList});
                  }
                  }); 
        });
     //   res.render('detail.ejs',{"user":req.session.userName,PName:data[0].PName,BNo:data[0].BNo,CNS:data[0].CNS,MN:data[0].MN,PNo:data[0].PNo,"changeselect":preNST+"號護理站",TABOO:listtaboo});
      }else {
        res.render('index',{"user":req.session.userName,data:"null","changeselect":preNST+"號護理站"});
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
    req.session.preNST=preNST;
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
         
        
          res.render('index',{"user":req.session.userName,data:data, "NST":preNST,"changeselect":preNST+"號護理站"});
        }else {
          res.render('index',{"user":req.session.userName,data:"","NST":preNST,"changeselect":preNST+"號護理站"});

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
  var zerotaboo=[];
  var taboo;
  var PNo = req.body.PNo;//序號
  console.log(req.body.length);
  console.log(PNo);
 

  

  if(taboo==null){
    
  }else{

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
      if(req.body.TABOO==undefined){//全部為勾選，全部傳0
        sql = "Update taboorecord set TABOO_01 = false,TABOO_02 = false,TABOO_03 = false,TABOO_04 = false,TABOO_05 = false,TABOO_06 = false, TABOO_07 = false ,TABOO_08 = false,TABOO_09 = false,TABOO_10 = false,TABOO_11 = false,TABOO_12 = false where PNo = ? "
        con.query(sql,[PNo], function(err,rowa){
          if(err){
            console.log(err);
          }
          console.log(rows);
        });


      }else{

        if(typeof(req.body.TABOO)=="string"){//1筆變更的狀況
          taboo = new Array(req.body.TABOO);//轉陣列
          for (i=0;i<taboo.length;i++){//有用
            updatetaboo[i] = taboo +"=1"+" "//加工
          }
          console.log("Work")
          var temp = []; //臨時陣列1 
          var temparray = [];//臨時陣列2  
          for (var i = 0; i < taboo.length; i++) { 
            temp[taboo] = true;//巧妙地方：把陣列B的值當成臨時陣列1的鍵並賦值為真 
  
            };
            
            console.log(temp); 
        }else{
        for (i=0;i<req.body.TABOO.length;i++){//有用
          updatetaboo[i] = req.body.TABOO[i] +"=1"+" "//加工
        }
        console.log(updatetaboo);
        var temp = []; //臨時陣列1 
        var temparray = [];//臨時陣列2  
        for (var i = 0; i < req.body.TABOO.length; i++) { 
          temp[req.body.TABOO[i]] = true;//把陣列B的值當成臨時陣列1的鍵並賦值為真 

          };
          
          console.log(temp); 
        }
          for (var i = 0; i < pretaboorecord.length; i++  ) { 
            if (!temp[pretaboorecord[i]]) { 
            temparray.push(pretaboorecord[i]);//同時把陣列A的值當成臨時陣列1的鍵並判斷是否為真，如果不為真說明沒重複，就合併到一個新陣列裡，這樣就可以得到一個全新並無重複的陣列 
            }; 
            }; 
            temparray.join(","); 
            console.log(temparray);
            console.log(temparray.length);
        for(i=0;i<temparray.length;i++){ //設定=0
         zerotaboo[i]= temparray[i]+ "= 0"+" ";
        }
        console.log(zerotaboo);
          sql="Update taboorecord set "+" "+updatetaboo+" "+","+" "+zerotaboo+" "+ " where PNo= ?";
          con.query(sql,[""+PNo]);
          res.redirect("/");
          }
        }
      
  })
  
 
  
  
});
app.post('/saveDNR',function(req,res){
  console.log("類型："+typeof(req.body.DNR))
  console.log(req.body.DNR);
   var sqlDNR=[];
  var settrue=[];
  var  insertDNR = [];
  var  updateDNR = [];
  var zeroDNR=[];
  var DNR;
  var PNo = req.body.PNo;//序號
  console.log(PNo);
 

  

  if(DNR==null){
    
  }else{

    console.log("取得資料長度"+DNR.length);
    console.log (DNR);
}

  var checkdatasql = "select * from bedidx where PNo =?";
  con.query(checkdatasql,[""+PNo] ,function(err,rows){//檢查sql

    if (err) {
      console.log(err);
  }
  console.log(rows);
  
  if(rows.length >0){//查到資料
      console.log(rows);
      if(req.body.DNR==undefined){//全部為勾選，全部傳0
        sql = "Update bedidx set BIdx_01 = false,BIdx_02 = false,BIdx_03 = false,BIdx_04 = false,BIdx_05 = false,BIdx_06 = false, BIdx_07 = false ,BIdx_08 = false,BIdx_09 = false,BIdx_10 = false where PNo = ? "
        con.query(sql,[PNo], function(err,rowa){
          if(err){
            console.log(err);
          }
          console.log(rows);
        });


      }else{

        if(typeof(req.body.DNR)=="string"){//1筆變更的狀況
          DNR = new Array(req.body.DNR);//轉陣列
          for (i=0;i<DNR.length;i++){//有用
            updateDNR[i] = DNR +"=1"+" "//加工
          }
          console.log("Work")
          var temp = []; //臨時陣列1 
          var temparray = [];//臨時陣列2  
          for (var i = 0; i < DNR.length; i++) { 
            temp[DNR] = true;//巧妙地方：把陣列B的值當成臨時陣列1的鍵並賦值為真 
  
            };
            
            console.log(temp); 
        }else{
        for (i=0;i<req.body.DNR.length;i++){//有用
          updateDNR[i] = req.body.DNR[i] +"=1"+" "//加工
        }
        console.log(updateDNR);
        var temp = []; //臨時陣列1 
        var temparray = [];//臨時陣列2  
        for (var i = 0; i < req.body.DNR.length; i++) { 
          temp[req.body.DNR[i]] = true;//巧妙地方：把陣列B的值當成臨時陣列1的鍵並賦值為真 

          };
          
          console.log(temp); 
        }
          for (var i = 0; i < preDNR.length; i++  ) { 
            if (!temp[preDNR[i]]) { 
            temparray.push(preDNR[i]);//巧妙地方：同時把陣列A的值當成臨時陣列1的鍵並判斷是否為真，如果不為真說明沒重複，就合併到一個新陣列裡，這樣就可以得到一個全新並無重複的陣列 
            }; 
            }; 
            temparray.join(","); 
            console.log(temparray);
            console.log(temparray.length);
        for(i=0;i<temparray.length;i++){ //設定=0
         zeroDNR[i]= temparray[i]+ "= 0"+" ";
        }
        console.log(zeroDNR);
      
          sql="Update bedidx set "+" "+updateDNR+" "+","+" "+zeroDNR+" "+ " where PNo= ?";
          con.query(sql,[""+PNo]);
        
          res.redirect("/");
          }
        }
      
  })
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
