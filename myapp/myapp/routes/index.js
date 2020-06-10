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

    if(req.session.userName){ 
   
    var data = "";

    var user = "";
    var user = req.query.user;
    var NST =9;
  
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
        
       
        // use index.ejs
       
    });
    con.end();
    
   
    }else{
        var data=　"" ;
          res.redirect('login');//導向登入頁面
         
      }
});

// add page

   
router.post('/changeNST', function (req, res) {
    NST =req.body.NSTdata;

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
 
// edit page


module.exports = router;
