var express = require('express');
var router = express.Router();
var mysql  = require ('mysql');
var bodyParser = require('body-parser');
var app=express();
var session = require('express-session');
var preusername = "admin";
var prepwd="";
/* GET home page. */
var con = mysql.createConnection({
    host: "localhost",
    port: '3306',
    user: "root",
    password: "123456",
    database: "nis"
});

router.get('/', function(req, res, next) {//重新導入至首頁
    var  NST = "9";

    if(req.session.userName){ 
   
    var data = "";

    var user = "";
    var user = req.query.user;
  
  
    con.query('Select BNo,PName,MN,CNS  from bhdata join patientdata using(PNo) where BNo like '+"?",[NST+"%"] , function(err, rows) {
      if (err) {
          console.log(err);
      }
      if(rows.length >0){
          var data = rows;
          console.log (data);

          res.render('index',{"user":req.session.userName,data:data});
        }else {
          res.redirect('index',{"user":req.session.userName,data:"null"});
          console.log(wrong);
     
      
        }
  });

    
   
    }else{
        var data=　"" ;
          res.redirect('login');//導向登入頁面
         
      }
});

// add page

   
router.post('/changeNST', function (req, res) {
    var NST =req.body.NSTdata;
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
  con.end();
  });
  app.get('/logout', function (req, res) {
    username = "";
   password = ""; 
   req.session.userName = null; // 删除session
   res.re('login',{'wrong':" "})
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
// edit page


module.exports = router;
