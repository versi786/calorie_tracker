'use strict';
var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  //if(req.session.user) req.session.user.password = null;
  console.log(req.session.user);
  if(!req.session.user){
    res.redirect('/login');
  }else{
    //render homepage for user
    res.render('index', { title: 'Express', username: req.session.user });
  }
});

module.exports = router;
