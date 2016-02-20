'use strict';
var express = require('express');
var router = express.Router();
var db = require('../database/database');
var SHA3 = require('crypto-js/sha3');
/* GET login listing. */
router.get('/', function(req, res, next) {
  console.log(req.session.user);
  if(!req.session.user){
    res.redirect('/login');
  }
  else {
    res.render('edit', {error: null});
  }
});

router.post('/', function(req, res, next) {

  var username = req.session.user;
  console.log("User editing his goals is "+ username);
  console.log(req.body);

//   console.log(req.body);
//   console.log(req.session.error);
  if (req.body.carbs === '' ||
    req.body.fat === '' ||
    req.body.protein === '') {
    req.session.error = 'All fields must be filled in';
    res.redirect('edit');
  }

  //check to see if user exists
  db.query('SELECT username from users where username=?',[username.toLowerCase()],
    function(err, rows, fields){
    if (err) {
      req.session.error = 'database error';
      res.redirect('edit');
    }
    if (rows.length === 1){
      console.log('Updating goals of ' + username);
      // update carbs column
      db.query('UPDATE users SET carbs = ? WHERE users.username = ?', 
        [req.body.carbs, username], 
        function(err, rows, fields){
          if(err){
            console.log("Error updating carbs column" + err);
          }
          else{
            console.log("Updated database");
          }
        });
      // update protein column
      db.query('UPDATE users SET protein = ? WHERE users.username = ?', 
        [req.body.protein, username], 
        function(err, rows, fields){
          if(err){
            console.log("Error updating database" + err);
          }
          else{
            console.log("Updated protein column");
          }
        });
      // update fat column
      db.query('UPDATE users SET fat = ? WHERE users.username = ?', 
        [req.body.fat, username], 
        function(err, rows, fields){
          if(err){
            console.log("Error updating fat column" + err);
          }
          else{
            console.log("Updated database");
          }
        });
    } 
    else {
      req.session.error = 'database error';
      res.redirect('edit');
    }
  });
  res.redirect('/');
});

module.exports = router;
