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
    //db query to get current data
    db.query('select carbs, fat, protein, goals, food from users where username = ?',[req.session.user], function(err, rows, fields){
      //pass to view in json
      if(err){
        console.log(err);
      }else{
        res.render('edit', {error: null, food: rows[0].food, goals: rows[0].goals,
         carbs: rows[0].carbs, fat: rows[0].fat, protein: rows[0].protein});  
      }
    });
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
      // update public goals setting
      var goals = 0;
      if(req.body.goals === 'on'){
        goals = 1;
      }
      db.query('UPDATE users SET goals = ? WHERE users.username = ?', 
        [goals, username], 
        function(err, rows, fields){
          if(err){
            console.log("Error updating goals column" + err);
          }
          else{
            console.log("Updated database");
          }
        });
      // update public foods setting
      var foods = 0;
      if(req.body.food === 'on'){
        foods = 1;
      }
      db.query('UPDATE users SET food = ? WHERE users.username = ?', 
        [foods, username], 
        function(err, rows, fields){
          if(err){
            console.log("Error updating food column" + err);
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
