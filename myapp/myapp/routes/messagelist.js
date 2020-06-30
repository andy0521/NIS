var express = require('express');
var router = express.Router();

// create object
//var data = {};
//con.query('select * from bbinfo', function(err, rows, fields) {
//  if (err) throw err;
// set data to object
//  data.user = rows[0];
//});

/* GET home page. */
router.get('/messagelist', function (req, res, next) {

  res.render('messagelist', { title: '護理站訊息列表' });
});

module.exports = router;

//app.get('/messagelist', function(req, res){
  // add data property to about page
//  var db = req.con;
//  var data = "";

//  db.query('SELECT * FROM nis.bbinfo', function(err, rows){
//  if (err) {
//    console.log(err);
//  }
//  var data = rows;
//  res.render('messagelist',{data: data});
//});
//});