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
    host: "JS108-36",
    port: '3306',
    user: "nisbs",
    password: "123456",
    database: "nis"
});

con.query('SELECT 12 + 34 AS result', function(err, rows, fields) {
  if (err) throw err;
  console.log('The result is: ', rows[0].result);
}); 
con.end();


module.exports = router;
