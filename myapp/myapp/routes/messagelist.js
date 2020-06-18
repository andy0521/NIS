var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/messagelist', function(req, res, next) {

  var db = req.con;
  var data = "";

  db.query('SELECT * FROM account', function(err, rows) {
      if (err) {
          console.log(err);
      }
      var data = rows;

  res.render('messagelist', { title: '護理站訊息列表' });
});
});

module.exports = router;


var mysql = require('mysql');
// 連線資料庫的配置
var connection = mysql.createConnection({
// 主機名稱，一般是本機
host: 'localhost',
// 資料庫的埠號，如果不設定，預設是3306
port: '3306',
// 建立資料庫時設定使用者名稱
user: 'root',
// 建立資料庫時設定的密碼
password: '123456',
// 建立的資料庫
database: 'nis'
});
