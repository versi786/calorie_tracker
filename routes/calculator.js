'use strict';
var express = require('express');
var router = express.Router();
var db = require('../database/database');
var SHA3 = require('crypto-js/sha3');
/* GET login listing. */

router.get('/', function(req, res, next) {
  if(req.session.error){
    var save = req.session.error;
    req.session.error = null;
    res.render('calculator', {username: req.session.user, displayResults: false, calories: "", carbs: "",
              protein :'', fat:'', error:save});
  }
  console.log(req.session.user);
  if(!req.session.user){
    res.redirect('/login');
  }
  else {
    res.render('calculator', {username: req.session.user, displayResults: false, calories: "", carbs: "",
              protein :'', fat:'', error:null});  
  }
});

router.post('/', function(req, res, next) {
  var username = req.session.user;
  console.log('User opened calculator '+ username);
  console.log(req.body);

  if (req.body.calories === '' ||
    req.body.carbsPercent === '' ||
    req.body.fatPercent === '' ||
    req.body.proteinPercent === '') {
      req.session.error = 'All fields must be filled in';
      res.redirect('calculator');
  } 

  var totalCalories = parseInt(req.body.calories);
  var carbs = JSON.stringify((parseInt(req.body.carbsPercent) / 100) * totalCalories);
  var protein = JSON.stringify((parseInt(req.body.proteinPercent) / 100) * totalCalories);
  var fat = JSON.stringify((parseInt(req.body.fatPercent) / 100) * totalCalories);
  if (parseInt(req.body.carbsPercent) + parseInt(req.body.proteinPercent) + parseInt(req.body.fatPercent) == 100) {
    console.log('About to render results');
    res.render('calculator', {username: req.session.user, displayResults: true, calories: req.body.calories, carbs: carbs,
              protein :protein, fat:fat, error:null});
  } else {
    req.session.error = 'Percentages must add up to 100';
    res.redirect('calculator');
    console.log('Percentages must add up to 100');
  }
});


router.post('/submit', function(req, res, next) {
  var username = req.session.user;
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
            console.log('Error updating carbs column' + err);
          }
          else{
            console.log('Updated database');
          }
        });
      // update protein column
      db.query('UPDATE users SET protein = ? WHERE users.username = ?', 
        [req.body.protein, username], 
        function(err, rows, fields){
          if(err){
            console.log('Error updating database' + err);
          }
          else{
            console.log('Updated protein column');
          }
        });
      // update fat column
      db.query('UPDATE users SET fat = ? WHERE users.username = ?', 
        [req.body.fat, username], 
        function(err, rows, fields){
          if(err){
            console.log('Error updating fat column' + err);
          }
          else{
            console.log('Updated database');
          }
        });
    } 
    else {
      req.session.error = 'database error';
      res.redirect('/users/' + req.session.user);
    }
    res.redirect('/'); // ***************** MAY HAVE TO ADD SUBMIT *******************
  });
});

module.exports = router;
