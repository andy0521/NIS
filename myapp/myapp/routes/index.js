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
    res.render('index',{"username":req.session.userName});//從其他頁面回來時依舊可以取用
    

    con.query('Select EENo,EEName,DeptCode from eecode ' , function(err, rows) {
        if (err) {
            console.log(err);
        }
        console.log(rows);
        var data = rows;

        // use index.ejs
        res.render('index', {user:"", data: data});
    });
    }else{
        var data=　"" ;
          res.redirect('login');//導向登入頁面
         
      }
});

// add page

   


// edit page


module.exports = router;
