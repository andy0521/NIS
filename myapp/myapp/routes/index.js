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

router.get('/', function(req, res, next) {
    if(req.session.userName){ 
   
    var data = "";

    var user = "";
    var user = req.query.user;
    var NIS = 9;
  
    con.query('Select * from bhdata where BNo like '+"?",[NIS+"%"] , function(err, rows) {
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
    
    
   
    }else{
        var data=　"" ;
          res.redirect('login');//導向登入頁面
         
      }
});

// add page

   


// edit page


module.exports = router;
