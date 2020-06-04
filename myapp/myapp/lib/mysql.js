const mysql = require('mysql')
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '123456',
  database: 'nis' // 手動建DB Test
})

let query = function (sql, values) {
  return new Promise((resolve, reject) => {
    pool.getConnection(function (err, connection) {
      if (err) {
        reject(err)
      } else {
        connection.query(sql, values, (err, rows) => {
          if (err) {
            reject(err)
          } else {
            resolve(rows)
          }
          connection.release()
        })
      }
    })
  })
}

let member =
  `create table if not exists cgh_member(
  id int NOT NULL AUTO_INCREMENT,
  userNo varchar(10) NOT NULL,
  userName varchar(10) NOT NULL,
  password varchar(30) NOT NULL,
  PRIMARY KEY (id,userNo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 `

let createTable = function (sql) {
  return query(sql, [])
}

createTable(member)

// ------------------------------------------------------------------
// 查詢登入者資訊
let queryMember = function (userNo, password) {
  let _sql = `select * from eecode where DeptCode = "${userNo}" and password = "${password}"`
  return query(_sql)
}

module.exports = {
  queryMember
}