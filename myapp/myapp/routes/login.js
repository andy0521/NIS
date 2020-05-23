var express = require('express');
var router = express.Router();

router.post('/', function(req, res, next) {
    res.render('login', { title: 'login' });
  });
  
  module.exports = router;