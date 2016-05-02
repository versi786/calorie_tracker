'use strict';
var express = require('express');
var router = express.Router();
//var user = require('../models/user');
var db = require('../database/database');
var SHA3 = require('crypto-js/sha3');


/* Authenticate fb signup. */
router.post('/fblogin', function (req, res) {
  console.log('Facebook login was reflected in server');
  console.log(req.body.username);

  /* Facebook login needs to reflect standard login pattern */
  db.query('SELECT username from users where username=?',[req.body.username],
    function (err, rows, fields){
    if (err) {
      req.session.error = 'database error';
      res.send({redirect: '/signup'});
    }
    if (rows.length === 0) {
      // User has not logged in or signed up previously with Facebook
      console.log('Creating user ' + req.body.username);

      /* Facebook login requires auto-generated password
      this is fine for demonstration purposes - in reality this is highly insecure */
      var password = SHA3(Math.random().toString(36).slice(-12)).toString();

      // In theory neither checkbox has been filled - a banner on redirect to the user page should recommend filling in goals
      var goals = 0;
      var foods = 0;

      db.query('INSERT into users (username, password, firstname, lastname, fat, carbs, protein, food, goals) VALUES' +
        '(?, ?, ?, ?, ? ,? ,?, ?, ?, ?)', [req.body.username, password,
        req.body.firstname, req.body.lastname, 0, 0, 0, foods, goals],

        function(err, rows, fields){
          if (err) {
            req.session.error = 'database error';
            console.log(err);
            res.send({redirect: '/signup'});
          } else {
            req.session.user = req.body.username;
            res.send({redirect: '/'});
          }
        });
    } else {
      // User exists - send to user page by routing through home
      req.session.error = 'Username is already taken';
      req.session.user = req.body.username;
      res.send({redirect: '/'});
    }
  });
});






// render signup page
router.get('/', function(req, res, next) {
  if (req.session.error) {
    res.render('signup', {error: req.session.error});
    req.session.error = null;
  } else if (req.session.user) {
    res.redirect('/');
  } else {
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
    var goals = 0;
      if(req.body.goals === 'on'){
        goals = 1;
      }
      var foods = 0;
      if(req.body.food === 'on'){
        foods = 1;
      }
      db.query('INSERT into users (username, password, firstname, lastname, fat, carbs, protein, food, goals, phoneNumber) VALUES' +
        '(?, ?, ?, ?, ? ,? ,?, ?, ?, ?)', [req.body.username.toLowerCase(), password,
        req.body.firstname, req.body.lastname, parseInt(req.body.fat), parseInt(req.body.carbs),
         parseInt(req.body.protein), foods, goals, req.body.phoneNumber],
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
