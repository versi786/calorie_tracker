'use strict';
var express = require('express');
var router = express.Router();
//var user = require('../models/user');
var db = require('../database/database');
var SHA3 = require('crypto-js/sha3');
/* GET login listing. */
router.get('/', function(req, res, next) {
  if(req.session.error){
    res.render('signup', {error: req.session.error});
    req.session.error = null;
  }else if(req.session.user){
    res.redirect('/');
  }else{
    res.render('signup', {error: null});
  }
});

router.post('/', function(req, res, next){
  console.log(req.body);
  console.log(req.session.error);
  if(req.body.username === '' ||
    req.body.password === '' ||
    req.body.c_password === '' ||
    req.body.firstname === '' || 
    req.body.lastname === ''){

    req.session.error = 'All fields must be filled in';
    res.redirect('signup');
  }

  if(req.body.password !== req.body.c_password){
    req.session.error = 'Passwords must match';
    res.redirect('signup');
  }

  //check to see if user exists
  db.query('SELECT username from users where username=?',[req.body.username.toLowerCase()],
    function(err, rows, fields){
    if(err) {
      req.session.error = 'database error';
      res.redirect('signup');
    }
    if(rows.length === 0){
      console.log('Creating user ' + req.body.username);
      var password = SHA3(req.body.password).toString();
      db.query('INSERT into users (username, password, firstname, lastname) VALUES' +
        '(?, ?, ?, ?)', [req.body.username.toLowerCase(), password,
        req.body.firstname, req.body.lastname],
        function(err, rows, fields){
          if(err){
            req.session.error = 'database error';
            res.redirect('signup');
          }else{
            req.session.user = req.body.username;
            res.redirect('/');
          }
        });
    } else{
      req.session.error = 'Username is already taken';
      res.redirect('signup');
    }
  });
  
});

module.exports = router;
