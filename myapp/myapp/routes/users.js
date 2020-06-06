var express = require('express');
var mysql = require("mysql");
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});
// users.js


var mysql = require("mysql");

var conn = mysql.createConnection({
    host: "localhost",
    port: '3306',
    user: "root",
    password: "123456",
    database: "nis"
});

conn.query('SELECT 12 + 34 AS result', function(err, rows, fields) {
  if (err) throw err;
  console.log('The result is: ', rows[0].result);
}); 
conn.end();
module.exports = router;
