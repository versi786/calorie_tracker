'use strict';
var express = require('express');
var router = express.Router();
var db = require('../database/database');
var SHA3 = require('crypto-js/sha3');
/* GET login listing. */
router.get('/', function(req, res, next) {
  if(req.session.error){
    res.render('login', {error: req.session.error});
    req.session.error = null;
  }else if(req.session.user){
    res.redirect('/');
  }else{
    res.render('login', {error: null});
  }
});

router.post('/', function(req, res, next){
  console.log(req.body);
  console.log(req.error);

});

module.exports = router;
