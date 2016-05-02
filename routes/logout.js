'use strict';
var express = require('express');
var router = express.Router();

/* GET logout page. */
router.get('/', function(req, res, next) {
  //if(req.session.user) req.session.user.password = null;
  console.log(req.session.user);
  if(!req.session.user){
    res.redirect('/login');
  }else{
  	req.session.error = null;
  	req.session.user = null;
  	res.redirect('/login');
  }
});

module.exports = router;
