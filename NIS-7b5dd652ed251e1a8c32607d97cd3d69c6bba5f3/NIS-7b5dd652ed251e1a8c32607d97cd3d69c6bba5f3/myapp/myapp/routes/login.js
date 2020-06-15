var express = require('express');
var router = express.Router();
/* GET users listing. */
router.get('/', function(req, res, next) {
    res.render('login', { title: '護理控台' });
  });
  
  module.exports = router;