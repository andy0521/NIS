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
var NST = "9";
var preNST=9;



module.exports = router;
