var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

module.exports = router;
module.exports = {
  items: [
  {name: 'test', password: '0000'}
  ]
  };