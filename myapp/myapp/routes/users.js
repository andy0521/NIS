var express = require('express');
var mysql = require("mysql");
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});
// users.js


var mysql = require("mysql");

var con = mysql.createConnection({
    host: "localhost",
    port: '3306',
    user: "root",
    password: "123456",
    database: "nis"
});


module.exports = router;
