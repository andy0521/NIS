var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var app = express();
var session = require('express-session');
var bodyparser = require('body-parser');
var mysql = require('mysql');
var conn = require('./lib/mysql');

var wrong = false;
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
//var loginRouter = require('./routes/login');
var exitmapRouter = require('./routes/exitmap');
var messageRouter = require('./routes/message');
var remindRouter = require('./routes/remind');
var shiftRouter = require('./routes/shift');
var messagelistRouter = require('./routes/messagelist');
var remindlistRouter = require('./routes/remindlist');
var spshiftRouter = require('./routes/spshift');
var messagechangeRouter = require('./routes/messagechange');
var remindchangeRouter = require('./routes/remindchange');
const { data } = require('jquery');
const { compile } = require('morgan');
const { cpuUsage, send } = require('process');
const f = require('session-file-store');
const { SSL_OP_SSLEAY_080_CLIENT_DH_BUG } = require('constants');
var NST = 12;//預設護理站
var preNST = 12;
var taboocount = 12;
var pretaboorecord = ["TABOO_01", "TABOO_02", "TABOO_03", "TABOO_04", "TABOO_05", "TABOO_06", "TABOO_07", "TABOO_08", "TABOO_09", "TABOO_10", "TABOO_11", "TABOO_12"];
var preDNR = ["BIdx_01", "BIdx_02", "BIdx_03", "BIdx_04", "BIdx_05", "BIdx_06", "BIdx_07", "BIdx_08", "BIdx_09", "BIdx_10"];
var MNnamesql = "select EEName from eecode where EENo = ?";
/*var connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '123456',
  database: 'nis'
});
connection.connect();*/
// view engine setup

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(bodyparser.json()); // 使用bodyparder
app.use(bodyparser.urlencoded({ extended: false }));
// 使用 session
//var con = mysql.createConnection({//建立連線
 // host: 'JS108-36',
  //port: '3306',
 // user: 'nisbs',
 // password: '123456',
 // database: 'nis'
//});
var con = mysql.createConnection({//建立連線
  host: 'localhost',
  user: 'root',
  password: '123456',
  database: 'nis'
});
con.connect(function (err) {
  if (err) {
    console.log('connecting error');
    return;
  }
  console.log('connecting success');
  console.log('http://localhost:3000')
})

var user = "";
var username = "";
var password = "";
var BNo;

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(function (req, res, next) {
  req.con = con;
  next();
});
app.use(session({
  secret: 'secret', // 對session id 相關的cookie 進行签名
  resave: true,
  saveUninitialized: false,
  cookie: {
    // maxAge : 1000 * 60 * 3, // 設置 session 的有效时間，單位毫秒
  },
}));



// 獲取登入頁面
app.get('/login', function (req, res) {
  res.render('login', { 'wrong': " " })
})




app.post('/login', function (req, res) {//登入功能

  username = "" + req.body.username;
  password = "" + req.body.pwd;
  if (password == "") {
    res.render('login', { 'wrong': "帳號或密碼為空" })
  }
  if (username == "") {
    res.render('login', { 'wrong': "帳號或密碼為空" })
  }

  var sql = "select EEName from eecode where EENO = " + username + " and Password = '" + password + "'";//檢查資料庫有沒有使用者
  if (username && password) {
    con.query(sql, [username, password], function (err, rs, fields) {

      if (rs.length > 0) {
        req.session.userName = req.body.username; // 登錄成功，设置 session

        wrong = false;
        console.log(rs);
        console.log(username + ' ' + password);
        user = rs[0].EEName;


        con.query('Select BNo,PName,MN,CNS  from bhdata join patientdata using(PNo) where DHDate =0 and BNo like ?', [NST + "%"], function (err, rows) {//查詢預設護理站欄位
          if (err) {
            console.log(err);
          }
          if (rows.length > 0) {
            var data = rows;
            console.log(data);
            var sqlNST = "select NST,WD,HN from nstrecord where NST = ? ";
            con.query(sqlNST, [preNST], function (err, rows) {//有找到護理站編輯
              NSTrecord = rows[0];
              console.log(NSTrecord);
              console.log(NST);
              con.query("SELECT PNo,CallTime,CancelTime,callRequest,CallDate,BNo,callContent FROM nis.callrecording join callrequirements using(callRequest) where isCalling= 1 and BNo like ?", [preNST + "%"], function (err, rows) {
                if (err) {
                  console.log("查不到");
                  
                }
                 
                if (rows.length > 0) {
                  var requestlog = rows;
                  console.log(requestlog);

                  res.render('index', { "user": req.session.userName, data: data, NST: NST, "changeselect": preNST + "號護理站", NSTrecord: NSTrecord, 'requestlog': requestlog });
                }else{
                  requestlog = "";
                  res.render('index', { "user": req.session.userName, data: data, NST: NST, "changeselect": preNST + "號護理站", NSTrecord: NSTrecord, 'requestlog': "" });
                }
                
                
              })
            })


          } else {
            res.redirect('index', { "user": req.session.userName, data: "null", "changeselect": preNST + "號護理站", requestlog: requestlog });//當前護理站沒有病人
            console.log(wrong);


          }
        });



      } else {//沒找到使用者資料
        res.render('login', { 'wrong': "帳號或密碼錯誤" })

      }


      // use index.ejs
    });
  }




});
app.get('/', function (req, res, next) {//重新導入至首頁


  if (req.session.userName) {

    var data = "";

    var user = "";
    var user = req.query.user;


    con.query('Select BNo,PName,MN,CNS  from bhdata join patientdata using(PNo)  where DHDate =0 and BNo like ' + "?", [NST + "%"], function (err, rows) {//查詢預設護理站欄位
      if (err) {
        console.log(err);
      }
      if (rows.length > 0) {
        var data = rows;
        console.log(data);
        var sqlNST = "select NST,WD,HN from nstrecord where NST = ? ";
        con.query(sqlNST, [preNST], function (err, rows) {
          NSTrecord = rows[0];
          console.log(NSTrecord);
          con.query("SELECT PNo,CallTime,CancelTime,callRequest,CallDate,BNo,callContent FROM nis.callrecording join callrequirements using(callRequest) where isCalling= 1 and BNo like ?", [preNST + "%"], function (err, rows) {
            if (err) {
              console.log("查不到");
              requestlog = "";
         
            }

              if (rows.length > 0) {
                var requestlog = rows;
                var test = rows.NVisit;
  
                res.render('index', { "user": req.session.userName, data: data, NST: NST, "changeselect": preNST + "號護理站", NSTrecord: NSTrecord, requestlog: requestlog });
            }else{
              res.render('index', { "user": req.session.userName, data: data, NST: NST, "changeselect": preNST + "號護理站", NSTrecord: NSTrecord, requestlog: "" });
              console.log("直接按首頁");//因為沒資料
            }
          
        
            
          });

        });
      } else {
        res.render('index', { "user": req.session.userName, data: "", NST: NST, "changeselect": preNST + "號護理站", NSTrecord: NSTrecord, requestlog: "" });

        console.log(wrong);


      }
    });



  } else {
    var data = "";
    res.redirect('login');//導向登入頁面

  }
});
// 獲取主頁
app.get('/logout', function (req, res) {
  username = "";
  password = "";
  req.session.userName = null; // 删除session
  res.redirect('login')
});

app.get('/changepwd', function (req, res) {//進入頁面
  res.render('changepwd', { 'wrong': " ", "username": req.session.username })

});
app.post('/change_pwd', function (req, res) { // 變更密碼render & SQL command
  username = req.body.username;
  con.query("select Password from eecode where EENo = " + "" + username + "", function (err, rows) {
    if (err) {
      console.log(err);
    }
    if (rows.length > 0) {
      password = rows[0].Password;

      console.log('original username:' + username + '/ password:' + password);
    }
    if (req.body.username == username & req.body.pwd == password) { // 一般情況的密碼變更
      var newpassword = "" + req.body.new_pwd;
      console.log(newpassword);
      if (newpassword == password || newpassword == "") {
        res.render('changepwd', { 'wrong': "新密碼不得與舊密碼相同或空白" })
      } else {
        sql = "update eecode set Password = '" + newpassword + "' where EENo ='" + username + "'";
        console.log(sql);
        con.query(sql);
        con.query('Select BNo,PName,MN,CNS  from bhdata join patientdata using(PNo) where DHDate =0 and BNo like ' + "?", [NST + "%"], function (err, rows) {//查詢預設護理站欄位
          if (err) {
            console.log(err);
          }
          if (rows.length > 0) {
            var data = rows;
            console.log(data);

            res.redirect('/');
          } else {
            res.redirect('index', { "user": req.session.userName, data: "null" });
            console.log(wrong);


          }
        });

      }


    }
  });
  app.get('/logout', function (req, res) {
    req.session.userName = null; // 删除session
    res.redirect('login');
  });
});
app.get('/exitmap', function (req, res) {
  res.render('exitmap', { "user": req.session.userName, "changeselect": preNST + "號護理站" })
});
app.get('/contact', function (req, res) {
  res.render('contact', { "user": req.session.userName, "changeselect": preNST + "號護理站" })
});
app.get('/message', function (req, res) {
  //var db = req.con;
  //var data = "";

  //db.query('select * from nis.bbinfo where MsgNo=(select max(MsgNO) from nis.bbinfo;)', function(err, rows){
  //if (err) {
  //  console.log(err);
  //}
  // var data = rows;
  //console.log(data);
  res.render('message', {/*"data": data,*/"user": req.session.userName, "changeselect": preNST + "號護理站" })
  //});
});

app.post('/new_message', function (req, res, next) {

  var db = req.con;

  var fullDate = new Date();
  var yyyy = fullDate.getFullYear();
  var MM = (fullDate.getMonth() + 1) >= 10 ? (fullDate.getMonth() + 1) : ("0" + (fullDate.getMonth() + 1));
  var dd = fullDate.getDate() < 10 ? ("0"+fullDate.getDate()) : fullDate.getDate();
  var date = yyyy + "-" + MM + "-" + dd;

  var status;

  console.log(req.body.Playing);

  // if(req.body.Playing == 1){
  //   status = "顯示"
  //}

  var sql = {
    MsgClass: '01',
    Playing: req.body.Playing,
    NST: req.body.NST,
    BBCon: req.body.BBCon,
    LDate: date
  };

  console.log(sql);
  db.query('INSERT INTO bbinfo SET ?', sql, function (err, rows) {
    if (err) {
      console.log(err);
    }
    res.setHeader('Content-Type', 'application/json');
    res.redirect('/messagelist');
  });
});

app.get('/messagelist', function (req, res) {
  // add data property to about page
  var db = req.con;
  var data = "";

  var NST = "";
  var NST = req.query.NST;

  var filter = "";
  if (NST) {
    filter = 'WHERE NST = ?';
  }

  db.query('SELECT MsgNO,MsgClass,Playing,NST,BBCon,DATE_FORMAT(LDate, "%Y%-%m%-%e") as LDate FROM nis.bbinfo ' + filter, NST, function (err, rows) {
    if (err) {
      console.log(err);
    }
    var data = rows;
    console.log(data);
    res.render('messagelist', { "data": data, "NST": NST, "user": req.session.userName, "changeselect": preNST + "號護理站" });
  });
});

app.get('/messagechange', function (req, res, next) {

  var MsgNO = req.query.MsgNO;
  var db = req.con;
  var data = "";

  console.log(MsgNO);

  db.query('SELECT * FROM bbinfo WHERE MsgNO = ?', MsgNO, function (err, rows) {
    if (err) {
      console.log(err);
    }
    var data = rows;
    //data=data.replaceAll("\n", "\n<br/>") ;
    console.log(data);
    res.render('messagechange', { "data": data, "user": req.session.userName, "changeselect": preNST + "號護理站" });
  });

});

app.post('/change_message', function (req, res, next) {

  var db = req.con;
  var MsgNO = req.body.MsgNO;
  var date = new Date();

  var sql = {
    MsgClass: '01',
    Playing: req.body.Playing,
    NST: req.body.NST,
    BBCon: req.body.BBCon,
    LDate: date
  };
  console.log(MsgNO);
  console.log(sql);

  var qur = db.query('UPDATE nis.bbinfo SET ? WHERE MsgNO = ?;', [sql, MsgNO], function (err, rows) {
    if (err) {
      console.log(err);
    }
    var data = rows;
    console.log(data);
    res.setHeader('Content-Type', 'application/json');
    res.redirect('/messagelist');
  });

});

app.get('/messageDelete', function (req, res, next) {

  var MsgNO = req.query.MsgNO;
  var db = req.con;

  var qur = db.query('DELETE FROM bbinfo WHERE MsgNO = ?', MsgNO, function (err, rows) {
    if (err) {
      console.log(err);
    }
    res.redirect('/messagelist');
  });
});

app.get('/remind', function (req, res) {
  res.render('remind', { "user": req.session.userName, "changeselect": preNST + "號護理站" })
});

app.post('/new_remind', function (req, res, next) {

  var db = req.con;

  var fullDate = new Date();
  var yyyy = fullDate.getFullYear();
  var MM = (fullDate.getMonth() + 1) >= 10 ? (fullDate.getMonth() + 1) : ("0" + (fullDate.getMonth() + 1));
  var dd = fullDate.getDate() < 10 ? ("0"+fullDate.getDate()) : fullDate.getDate();
  var date = yyyy + "-" + MM + "-" + dd;
  var status;

  console.log(req.body.Playing);

  // if(req.body.Playing == 1){
  //   status = "顯示"
  //}

  var sql = {

    MsgClass: '02',
    Playing: req.body.Playing,
    NST: req.body.NST,
    BBCon: req.body.BBCon,
    LDate: date
  };

  console.log(sql);
  db.query('INSERT INTO bbinfo SET ?', sql, function (err, rows) {
    if (err) {
      console.log(err);
    }
    res.setHeader('Content-Type', 'application/json');
    res.redirect('/remindlist');
  });
});

app.get('/remindlist', function (req, res) {
  // add data property to about page
  var db = req.con;
  var data = "";

  var NST = "";
  var NST = req.query.NST;

  var filter = "";
  if (NST) {
    filter = 'WHERE NST = ?';
  }


  db.query('SELECT MsgNO,MsgClass,Playing,NST,BBCon,DATE_FORMAT(LDate, "%Y%-%m%-%e") as LDate FROM nis.bbinfo ' + filter, NST, function (err, rows) {
    if (err) {
      console.log(err);
    }
    var data = rows;
    console.log(data);
    res.render('remindlist', { "data": data, "NST": NST, "user": req.session.userName, "changeselect": preNST + "號護理站" })
  });
});

app.get('/remindchange', function (req, res) {
  var MsgNO = req.query.MsgNO;
  var db = req.con;
  var data = "";
  console.log(MsgNO);

  db.query('SELECT * FROM bbinfo WHERE MsgNO = ?', MsgNO, function (err, rows) {
    if (err) {
      console.log(err);
    }
    var data = rows;
    console.log(data);


    res.render('remindchange', { "data": data, "user": req.session.userName, "changeselect": preNST + "號護理站" })
  });
});
app.post('/change_remind', function (req, res, next) {

  var db = req.con;
  var MsgNO = req.body.MsgNO;
  var date = new Date();

  var sql = {
    MsgClass: '02',
    Playing: req.body.Playing,
    NST: req.body.NST,
    BBCon: req.body.BBCon,
    LDate: date
  };
  console.log(MsgNO);
  console.log(sql);

  var qur = db.query('UPDATE nis.bbinfo SET ? WHERE MsgNO = ?;', [sql, MsgNO], function (err, rows) {
    if (err) {
      console.log(err);
    }
    var data = rows;
    console.log(data);
    res.setHeader('Content-Type', 'application/json');
    res.redirect('/remindlist');
  });

});

app.get('/remindDelete', function (req, res, next) {

  var MsgNO = req.query.MsgNO;
  var db = req.con;

  var qur = db.query('DELETE FROM bbinfo WHERE MsgNO = ?', MsgNO, function (err, rows) {
    if (err) {
      console.log(err);
    }
    res.redirect('/remindlist');
  });
});


app.get('/shift',function(req,res){//排班網頁
  
  sql ="select BNo,NSTName,PNo,PName,VSD,MN,CNS from patientdata join bhdata using (PNo) join bedrecord using (BNo) where NST=? and DHDate=0 order by MN;"
  con.query(sql,[preNST],function(err,rows){
    if (err) {
      console.log(err);


  }
  if(rows.length >0){
    console.log(rows);
   
    var  data = rows;
    console.log (data);
  
}
  console.log(preNST);
  console.log(typeof(preNST));

  if(preNST>=14){

    var MNNST=Number(preNST)+1;
  console.log(MNNST);
    
  }else{
    if(preNST<10){
      MNNST=0+String(preNST);
      console.log(MNNST);
    }else{
      MNNST=preNST+"";
    }

    

  }

  console.log(MNNST);
  sql2="select EENo,EEName from eecode where DeptCode like  ?";
  console.log(sql2);
  con.query(sql2,["A"+MNNST+"%"],function(err,rows){
    if (err) {
      console.log(err);
  }
  if(rows.length >0){
    console.log(rows);
    var  MNdata = rows;
    console.log (MNdata);
  }else{
    console.log("Error");
  }

    console.log(data);
    if(data==undefined){
      data=[];
    }
    if(MNdata==undefined){
      MNdata=[];
    }
    con.query("SELECT PNo,CallTime,CancelTime,callRequest,CallDate,BNo,callContent FROM nis.callrecording join callrequirements using(callRequest) where isCalling= 1 and BNo like ?", [preNST + "%"], function (err, rows) {
      if (err){
        console.log("查不到");
    
      }
        if(rows.length>0){
          var  requestlog=rows;
          console.log(requestlog);
    
          res.render('shift',{"user":req.session.userName,"changeselect":preNST+"號護理站",data:data ,MNdata:MNdata,requestlog:requestlog});
      }else{
        requestlog="";
        res.render('shift',{"user":req.session.userName,"changeselect":preNST+"號護理站",data:data ,MNdata:MNdata,requestlog:""});
      }
      
      
    });
  })
  
  })

  

});
app.get('/spshift', function (req, res) {//排班網頁 
  sql = "select BNo,NSTName,PNo,PName,VSD,MN,CNS from patientdata join bhdata using (PNo) join bedrecord using (BNo) where NST=? and DHDate=0 order by CNS;"
  con.query(sql, [preNST], function (err, rows) {
    if (err) {
      console.log(err);
    }
    if (rows.length > 0) {
      console.log(rows);

      var data = rows;
      console.log(data);
    }
    sql2 = "select EENo,EEName from eecode where DeptCode = 8700";
    con.query(sql2, function (err, rows) {
      if (err) {
        console.log(err);
      }
      if (rows.length > 0) {
        console.log(rows);
        var SPdata = rows;
        console.log(SPdata);
      } else {
        console.log("Error");
      }

      console.log(data);
      if (data == undefined) {
        data = [];
      }
      if (SPdata == undefined) {
        SPdata = [];
      }
      con.query("SELECT PNo,CallTime,CancelTime,callRequest,CallDate,BNo,callContent FROM nis.callrecording join nis.callrequirements using(callRequest) where isCalling=1 and BNo like ?", [preNST + "%"], function (err, rows) {
        if (err){
          console.log("查不到");
          
        } else{
        if(rows.length>0){
        var  requestlog=rows;
        console.log(requestlog);
  
      res.render('spshift',{"user":req.session.userName,"changeselect":preNST+"號護理站",data:data ,SPdata:SPdata,requestlog:requestlog});
        }else{
          requestlog="";
          res.render('spshift',{"user":req.session.userName,"changeselect":preNST+"號護理站",data:data ,SPdata:SPdata,requestlog:""});
        }
      }
      });
    })
    
    })
  });
app.get('/detail/:BNo', function (req, res) {
  BNo = req.params.BNo;
  var listtaboo = [];
  console.log(BNo);
  con.query('Select BNo,PNo,PName,MN,CNS  from bhdata join patientdata using(PNo)  where  BNo like ' + "?", [BNo], function (err, rows) {
    if (err) {
      console.log(err);
    }
    if (rows.length > 0) {
      console.log(rows);
      var data = rows;
      console.log(data);
      console.log(data[0].PName);
      PNo = data[0].PNo;
      console.log(PNo);
      var checkdatasql = "select * from taboorecord join bedidx using (PNo) where PNo =?";
      con.query(checkdatasql, ["" + PNo], function (err, rows) {//檢查sql
        if (err) {
          console.log(err);
        }
        if (rows.length > 0) {//查到資料
          console.log(rows);


          var checkdatasql = "select TABOO_01,TABOO_02,TABOO_03,TABOO_04,TABOO_05,TABOO_06,TABOO_07,TABOO_08,TABOO_09,TABOO_10," +
            "TABOO_11,TABOO_12,BIdx_01,BIdx_02,BIdx_03,BIdx_04,BIdx_05,BIdx_06,BIdx_07,BIdx_08,BIdx_09,BIdx_10 from taboorecord join bedidx using (PNo) where PNo =?";
          con.query(checkdatasql, ["" + PNo], function (err, rows) {//檢查sql
            if (rows.length > 0) {//查到資料
              console.log(rows);
              listtaboo = rows[0];
              console.log(Object.keys(listtaboo));
              console.log(Object.values(listtaboo));
              const idList = Object.keys(listtaboo);
              const valueList = Object.values(listtaboo);
              console.log(idList);
              console.log(valueList);
              for (i = 0; i < valueList.length; i++) {
                if (valueList[i] == 1) {
                  valueList[i] = "checked";
                } else {
                  valueList[i] = "";
                }

              }
              console.log(valueList);
              res.render('detail.ejs', {
                "user": req.session.userName, PName: data[0].PName, BNo: data[0].BNo, CNS: data[0].CNS, MN: data[0].MN, PNo: data[0].PNo, "changeselect": preNST + "號護理站", TABOO_01: idList[0]
                , TABOO_02: idList[1], TABOO_03: idList[2], TABOO_04: idList[3], TABOO_05: idList[4], TABOO_06: idList[5], TABOO_07: idList[6], TABOO_08: idList[7], TABOO_09: idList[8], TABOO_10: idList[9], TABOO_11: idList[10], TABOO_12: idList[11],
                BIdx_01: idList[12], BIdx_02: idList[13], BIdx_03: idList[14], BIdx_04: idList[15], BIdx_05: idList[16], BIdx_06: idList[17], BIdx_07: idList[18], BIdx_08: idList[19], BIdx_09: idList[20], BIdx_10: idList[21], checked: valueList
              });
            }
          });
          //    res.render('detail.ejs',{"user":req.session.userName,PName:data[0].PName,BNo:data[0].BNo,CNS:data[0].CNS,MN:data[0].MN,PNo:data[0].PNo,"changeselect":preNST+"號護理站"});
        } else {
          sql = "insert into taboorecord (PNo) value(?)";//新建資料，需要預設值
          con.query(sql, ["" + PNo]);
          sql = "insert into bedidx (PNo) value(?)";//新建資料
          con.query(sql, ["" + PNo]);
        }
        var checkdatasql = "select TABOO_01,TABOO_02,TABOO_03,TABOO_04,TABOO_05,TABOO_06,TABOO_07,TABOO_08,TABOO_09,TABOO_10," +
          "TABOO_11,TABOO_12,BIdx_01,BIdx_02,BIdx_03,BIdx_04,BIdx_05,BIdx_06,BIdx_07,BIdx_08,BIdx_09,BIdx_10 from taboorecord join bedidx using (PNo) where PNo =?";
        con.query(checkdatasql, ["" + PNo], function (err, rows) {//檢查sql
          if (rows.length > 0) {//查到資料
            console.log(rows);
            listtaboo = rows[0];
            const idList = Object.keys(listtaboo);
            const valueList = Object.values(listtaboo);
            console.log(idList);
            console.log(valueList);

            for (i = 0; i < valueList.length; i++) {
              if (valueList[i] == 1) {
                valueList[i] = "checked";
              } else {
                valueList[i] = "";
              }

            }
            res.render('detail.ejs', {
              "user": req.session.userName, PName: data[0].PName, BNo: data[0].BNo, CNS: data[0].CNS, MN: data[0].MN, PNo: data[0].PNo, "changeselect": preNST + "號護理站", TABOO_01: idList[0]
              , TABOO_02: idList[1], TABOO_03: idList[2], TABOO_04: idList[3], TABOO_05: idList[4], TABOO_06: idList[5], TABOO_07: idList[6], TABOO_08: idList[7], TABOO_09: idList[8], TABOO_10: idList[9], TABOO_11: idList[10], TABOO_12: idList[11],
              BIdx_01: idList[12], BIdx_02: idList[13], BIdx_03: idList[14], BIdx_04: idList[15], BIdx_05: idList[16], BIdx_06: idList[17], BIdx_07: idList[18], BIdx_08: idList[19], BIdx_09: idList[20], BIdx_10: idList[21], checked: valueList
            });
          }
        });
      });
      //   res.render('detail.ejs',{"user":req.session.userName,PName:data[0].PName,BNo:data[0].BNo,CNS:data[0].CNS,MN:data[0].MN,PNo:data[0].PNo,"changeselect":preNST+"號護理站",TABOO:listtaboo});
    } else {
      res.render('index', { "user": req.session.userName, data: "null", "changeselect": preNST + "號護理站" });
      console.log(wrong);
    }
  });

});

app.post('/changeNST', function (req, res) {//切換護理站

  NST = req.body.NSTdata;

  if (NST == "") {
    NST = preNST;
  }
  preNST = NST;
  req.session.preNST = preNST;
  console.log("現在護理站:" + preNST)
  console.log(NST);
  con.query('Select BNo,PNo,PName,MN,CNS from bhdata join patientdata using(PNo) where  DHDate =0 and BNo like ' + "?", [NST + "%"], function (err, rows) {
    if (err) {
      console.log(err);
    }
    if (rows.length > 0) {
      console.log(rows);
      var data = rows;
      console.log(data);


      res.redirect('/');
    } else {

      res.render('index', { "user": req.session.userName, data: "", "NST": preNST, "changeselect": preNST + "號護理站", requestlog: "" });
    }
  });
});
app.post('/savePD', function (req, res) {
  console.log("類型：" + typeof (req.body.TABOO))
  console.log(req.body.TABOO);
  var sqltaboo = [];
  var settrue = [];
  var inserttaboo = [];
  var updatetaboo = [];
  var zerotaboo = [];
  var taboo;
  var PNo = req.body.PNo;//序號
  console.log(req.body.length);
  console.log(PNo);




  if (taboo == null) {

  } else {

    console.log("取得資料長度" + taboo.length);
    console.log(taboo);
  }

  var checkdatasql = "select * from taboorecord where PNo =?";
  con.query(checkdatasql, ["" + PNo], function (err, rows) {//檢查sql

    if (err) {
      console.log(err);
    }
    console.log(rows);

    if (rows.length > 0) {//查到資料
      console.log(rows);
      console.log(req.body.TABOO);
      if (req.body.TABOO == undefined) {//全部未勾選，全部傳0
        sql = "Update taboorecord set TABOO_01 = false,TABOO_02 = false,TABOO_03 = false,TABOO_04 = false,TABOO_05 = false,TABOO_06 = false, TABOO_07 = false ,TABOO_08 = false,TABOO_09 = false,TABOO_10 = false,TABOO_11 = false,TABOO_12 = false where PNo = ? "
        con.query(sql, [PNo], function (err, rowa) {
          if (err) {
            console.log(err);
          }
          console.log(rows);
          res.redirect("/detail/" + BNo);
        });


      } else {

        if (typeof (req.body.TABOO) == "string") {//1筆變更的狀況
          taboo = new Array(req.body.TABOO);//轉陣列
          for (i = 0; i < taboo.length; i++) {
            updatetaboo[i] = taboo + "=1" + " "//加工
          }
          console.log("Work")
          var temp = []; //臨時陣列1 
          var temparray = [];//臨時陣列2  
          for (var i = 0; i < taboo.length; i++) {
            temp[taboo] = true;

          };

          console.log(temp);
        } else {
          for (i = 0; i < req.body.TABOO.length; i++) {//有用
            updatetaboo[i] = req.body.TABOO[i] + "=1" + " "//加工
          }
          console.log(updatetaboo);
          var temp = []; //臨時陣列1 
          var temparray = [];//臨時陣列2  
          for (var i = 0; i < req.body.TABOO.length; i++) {
            temp[req.body.TABOO[i]] = true;//把陣列B的值當成臨時陣列1的鍵並賦值為真 

          };

          console.log(temp);
        }
        for (var i = 0; i < pretaboorecord.length; i++) {
          if (!temp[pretaboorecord[i]]) {
            temparray.push(pretaboorecord[i]);//同時把陣列A的值當成臨時陣列1的鍵並判斷是否為真，如果不為真說明沒重複，就合併到一個新陣列裡，這樣就可以得到一個全新並無重複的陣列 
          };
        };
        temparray.join(",");
        console.log(temparray);
        console.log(temparray.length);
        for (i = 0; i < temparray.length; i++) { //設定=0
          zerotaboo[i] = temparray[i] + "= 0" + " ";
        }
        console.log(zerotaboo);
        sql = "Update taboorecord set " + " " + updatetaboo + " " + "," + " " + zerotaboo + " " + " where PNo= ?";
        con.query(sql, ["" + PNo]);
        res.redirect("/detail/" + BNo);
      }
    }

  })




});
app.post('/saveDNR', function (req, res) {
  console.log("類型：" + typeof (req.body.DNR))
  console.log(req.body.DNR);
  var sqlDNR = [];
  var settrue = [];
  var insertDNR = [];
  var updateDNR = [];
  var zeroDNR = [];
  var DNR;
  var PNo = req.body.PNo;//序號
  console.log(PNo);




  if (DNR == null) {

  } else {

    console.log("取得資料長度" + DNR.length);
    console.log(DNR);
  }

  var checkdatasql = "select * from bedidx where PNo =?";
  con.query(checkdatasql, ["" + PNo], function (err, rows) {//檢查sql

    if (err) {
      console.log(err);
    }
    console.log(rows);

    if (rows.length > 0) {//查到資料
      console.log(rows);
      if (req.body.DNR == undefined) {//全部為勾選，全部傳0
        sql = "Update bedidx set BIdx_01 = false,BIdx_02 = false,BIdx_03 = false,BIdx_04 = false,BIdx_05 = false,BIdx_06 = false, BIdx_07 = false ,BIdx_08 = false,BIdx_09 = false,BIdx_10 = false where PNo = ? "
        con.query(sql, [PNo], function (err, rowa) {
          if (err) {
            console.log(err);
          }
          console.log(rows);
          res.redirect("/detail/" + BNo);
        });


      } else {

        if (typeof (req.body.DNR) == "string") {//1筆變更的狀況
          DNR = new Array(req.body.DNR);//轉陣列
          for (i = 0; i < DNR.length; i++) {//有用
            updateDNR[i] = DNR + "=1" + " "//加工
          }
          console.log("Work")
          var temp = []; //臨時陣列1 
          var temparray = [];//臨時陣列2  
          for (var i = 0; i < DNR.length; i++) {
            temp[DNR] = true;//巧妙地方：把陣列B的值當成臨時陣列1的鍵並賦值為真 

          };

          console.log(temp);
        } else {
          for (i = 0; i < req.body.DNR.length; i++) {//有用
            updateDNR[i] = req.body.DNR[i] + "=1" + " "//加工
          }
          console.log(updateDNR);
          var temp = []; //臨時陣列1 
          var temparray = [];//臨時陣列2  
          for (var i = 0; i < req.body.DNR.length; i++) {
            temp[req.body.DNR[i]] = true;//巧妙地方：把陣列B的值當成臨時陣列1的鍵並賦值為真 

          };

          console.log(temp);
        }
        for (var i = 0; i < preDNR.length; i++) {
          if (!temp[preDNR[i]]) {
            temparray.push(preDNR[i]);//巧妙地方：同時把陣列A的值當成臨時陣列1的鍵並判斷是否為真，如果不為真說明沒重複，就合併到一個新陣列裡，這樣就可以得到一個全新並無重複的陣列 
          };
        };
        temparray.join(",");
        console.log(temparray);
        console.log(temparray.length);
        for (i = 0; i < temparray.length; i++) { //設定=0
          zeroDNR[i] = temparray[i] + "= 0" + " ";
        }
        console.log("zeroDNR:"+zeroDNR);
        var dot;
        if(zeroDNR==""){
          dot=" ";
        }else{
          dot=",";
        }

        sql = "Update bedidx set " + " " + updateDNR + " " + dot + " " + zeroDNR + " " + " where PNo= ?";
        con.query(sql, ["" + PNo]);

        res.redirect("/detail/" + BNo);
      }
    }

  })
})
app.post("/saveNSTedit", function (req, res) {

  updatenstsql = "update nstrecord set  WD=?,HN=?,NSTP=? where NST =?"
  con.query(updatenstsql, [req.body.wd + "", req.body.hn + "", req.body.nstp + "", req.body.NSTedit + ""]);
  res.redirect("/NSTedit");
});
app.post("/saveshift", function (req, res) {
  console.log(req.body.MNdata);
  console.log(req.body.shift);
  var PD = req.body.shift;
  var MN = req.body.MNdata + " ";
  var updatePD = [];
 
  if (typeof (req.body.shift) == "string") {//1筆變更的狀況
    PD = new Array(req.body.shift);//轉陣列
    updatePD = PD;
  } else {

    if (req.body.shift == undefined) {

    } else {

      updatePD = PD.join(" or PNo= ") + " ";
    }

  }

  console.log(updatePD);
  console.log(typeof (updatePD));
  console.log(typeof (MN));
  sql3 = "update bhdata set MN= " + "" + MN + " " + " where PNo = " + updatePD + " ";
  console.log(sql3);
  con.query(sql3, function (err, rows) {
    if (err) {
      console.log("error")
    }
    if (PD == null | MN == null) {

    } else {

    }
    res.redirect("/shift");
  })


})
app.post("/saveSPshift", function (req, res) {
  console.log(req.body.SPdata);
  console.log(req.body.shift);
  var PD = req.body.shift;
  var SP = req.body.SPdata + " ";
  var updatePD = [];

  if (typeof (req.body.shift) == "string") {//1筆變更的狀況
    PD = new Array(req.body.shift);//轉陣列
    updatePD = PD;
  } else {
    if (req.body.shift == undefined) {
      res.redirect("/spshift");
    } else {

      updatePD = PD.join(" or PNo= ") + " ";
    }

  }

  console.log(updatePD);
  console.log(typeof (updatePD));
  console.log(typeof (SP));
  sql3 = "update bhdata set CNS= " + "" + SP + " " + " where PNo = " + updatePD + " ";
  console.log(sql3);
  con.query(sql3, function (err, rows) {
    if (err) {
      console.log("error")
    }
    if (PD == null | SP == null) {

    } else {
      res.redirect("/spshift");
    }

  })


});
app.get("/NSTedit", function (req, res) {
  var sqlNST = "select NST,WD,HN from nstrecord where NST = ? ";
  con.query(sqlNST, [preNST], function (err, rows) {
    NSTrecord = rows[0];
    console.log(NSTrecord);
    var sqlNSTedit = "select NST,WD,HN,NSTP from nstrecord ";
    con.query(sqlNSTedit, [preNST], function (err, rows) {
      var data = rows;
      con.query("SELECT PNo,CallTime,CancelTime,callRequest,CallDate,BNo,callContent FROM nis.callrecording join nis.callrequirements using(callRequest) where isCalling=1 and BNo like ?", [preNST + "%"], function (err, rows) {
        if (err) {
          console.log("查不到");
         
        }
        if (rows.length > 0) {
          var requestlog = rows;
          var test = rows.NVisit;

          res.render('NSTedit', { "user": req.session.userName, "changeselect": preNST + "號護理站", data: data, NSTrecord: NSTrecord, requestlog: requestlog });
        }else{
          requestlog = "";
          res.render('NSTedit', { "user": req.session.userName, "changeselect": preNST + "號護理站", data: data, NSTrecord: NSTrecord, requestlog: "" });
        }
      
      });
    });
  });
});
app.get("/NSTedit/:NST", function (req, res) {
  var sqlNST = "select NST,WD,HN from nstrecord where NST = ? ";
  con.query(sqlNST, [preNST], function (err, rows) {
    NSTrecord = rows[0];
    console.log(NSTrecord);
    var NST = req.params.NST;
    var sqlNST = "select NST ,WD,HN,NSTP from nstrecord where NST = ? ";
    con.query(sqlNST, [NST], function (err, rows) {
      var data = rows;
      WD = data[0].WD + "";
      HN = data[0].HN + "";
      NSTP = data[0].NSTP + "";
      NST = data[0].NST + "";
      console.log(WD);
      console.log(data);
     con.query("SELECT PNo,CallTime,CancelTime,callRequest,CallDate,BNo,callContent FROM nis.callrecording join nis.callrequirements using(callRequest) where isCalling=1 and BNo like ?", [preNST + "%"], function (err, rows) {
        if (err) {
          console.log("查不到");
         
        }else{
        
        if (rows.length > 0) {
          var requestlog = rows;
          var test = rows.NVisit;

          res.render("NSTeditpage", { "user": req.session.userName, "changeselect": preNST + "號護理站", NST: NST, WD: WD, HN: HN, NSTP: NSTP, NSTrecord: NSTrecord, requestlog: requestlog })
        }else{
          requestlog = "";
          res.render("NSTeditpage", { "user": req.session.userName, "changeselect": preNST + "號護理站", NST: NST, WD: WD, HN: HN, NSTP: NSTP, NSTrecord: NSTrecord, requestlog: "" })
        }
      }
         
      });
    });
  });
});
app.post("/resetshift",function(req,res){
  console.log("resetshift");
  sql3 = "update bhdata set MN= '00000' "  + " where BNo like  " +"'"+preNST+"%"+"'"  + " ";
  con.query(sql3,function(err,rows){
  console.log(sql3);
    if(err){
      console.log(err);
    }
    res.redirect("shift");
  })
})
app.post("/resetspshift",function(req,res){
  console.log("resetspshift");
  sql3 = "update bhdata set CNS= '00000' "  + " where BNo like  " +"'"+preNST+"%"+"'"  + " ";
  con.query(sql3,function(err,rows){
  console.log(sql3);
    if(err){
      console.log(err);
    }
    res.redirect("spshift");
  })
})

app.use('/', indexRouter);
//app.use('/login', loginRouter);
app.use('/users', usersRouter);
app.use('/exitmap', exitmapRouter);
app.use('/message', messageRouter);
app.use('/remind', remindRouter);
app.use('/shift', shiftRouter);
app.use('/messagelist', messagelistRouter);
app.use('/remindlist', remindlistRouter);
app.use('/spshift', spshiftRouter);
app.use('/messagechange', messagechangeRouter);
app.use('/remindchange', remindchangeRouter);


// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
