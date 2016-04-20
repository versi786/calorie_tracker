'use strict';
var express = require('express');
var router = express.Router();
var db = require('../database/database');
/* GET login listing. */

router.get('/', function(req, res, next) {
  if(req.session.error){
    var save = req.session.error;
    req.session.error = null;
    res.render('calculator', {username: req.session.user, displayCalorieResults: false, displayGramResults: false,
      displayGramPerLbResults: false, calories: '', carbs: '', protein :'', fat:'', error:save});
  }
  console.log(req.session.user);
  if(!req.session.user){
    res.redirect('/login');
  }
  else {
    res.render('calculator', {username: req.session.user, displayCalorieResults: false, displayGramResults: false,
      displayGramPerLbResults: false, calories: '', carbs: '', protein :'', fat:''});
  }
});

function isNormalInteger(str) {
    var n = Math.floor(Number(str));
    return String(n) === str && n >= 0;
}

function isNumber(str) {
    var n = Number(str);
    if (str !== '' && n < 1 && str.charAt(0) !== '0') {
      var zero = '0';
      str = zero.concat(str);
    }
    return String(n) === str && n >= 0;
}

router.post('/', function(req, res, next) {
  var username = req.session.user;
  console.log('User opened calculator '+ username);
  console.log(req.body);
  // if calories form was submitted
  if (req.body.calories !== undefined &&
    req.body.carbsPercent !== undefined &&
    req.body.fatPercent !== undefined &&
    req.body.proteinPercent !== undefined) {
    // if any non numbers were entered
    if (!isNormalInteger(req.body.calories) ||
        !isNormalInteger(req.body.carbsPercent) ||
        !isNormalInteger(req.body.fatPercent) ||
        !isNormalInteger(req.body.proteinPercent)) {
      console.log('Percentages must be integers adding to 100');
      req.session.error = 'Percentages must be integers adding to 100';
      res.render('calculator',
        {username: req.session.user,
          displayCalorieResults: false,
          displayGramResults: false,
          displayGramPerLbResults: false,
          error:req.session.error});
    }
    else {
      console.log('no non-numbers were entered');
      var totalCalories = parseInt(req.body.calories);
      var carbs = JSON.stringify((parseInt(req.body.carbsPercent) / 100) * totalCalories);
      var protein = JSON.stringify((parseInt(req.body.proteinPercent) / 100) * totalCalories);
      var fat = JSON.stringify((parseInt(req.body.fatPercent) / 100) * totalCalories);
      if (parseInt(req.body.carbsPercent) + parseInt(req.body.proteinPercent) + parseInt(req.body.fatPercent) === 100) {
        console.log('About to render results');
        res.render('calculator',
          {username: req.session.user,
            displayCalorieResults: true,
            displayGramResults: false,
            displayGramPerLbResults: false,
            calories: req.body.calories,
            carbs: carbs,
            protein: protein,
            fat: fat,
            error:null});
      } else {
        req.session.error = 'Percentages must add up to 100';
        console.log('Percentages must add up to 100');
        res.render('calculator',
          {username: req.session.user,
            displayCalorieResults: false,
            displayGramResults: false,
            displayGramPerLbResults: false,
            error:req.session.error});
      }
    }
  }
  // if grams form was submitted
  else if (req.body.carbsGrams !== undefined &&
      req.body.fatGrams !== undefined &&
      req.body.proteinGrams !== undefined) {
        // if any non numbers were entered
    if (!isNormalInteger(req.body.carbsGrams) ||
        !isNormalInteger(req.body.proteinGrams) ||
        !isNormalInteger(req.body.fatGrams)) {
      req.session.error = 'Grams must be integers';
      console.log('Grams must be integers');
      res.render('calculator',
        {username: req.session.user,
          displayCalorieResults: false,
          displayGramResults: false,
          displayGramPerLbResults: false,
          error:req.session.error});
    }
    else {
      var carbs = JSON.stringify((parseInt(req.body.carbsGrams)) * 4);
      var protein = JSON.stringify((parseInt(req.body.proteinGrams)) * 4);
      var fat = JSON.stringify((parseInt(req.body.fatGrams)) * 9);
      res.render('calculator',
        {username: req.session.user,
          displayCalorieResults: false,
          displayGramResults: true,
          displayGramPerLbResults: false,
          carbs: carbs,
          protein: protein,
          fat: fat,
          error:null});
    }
  }
  // if grams per lb form was submitted
  else if (req.body.bodyweight !== undefined &&
      req.body.carbsGramsPerLb !== undefined &&
      req.body.fatGramsPerLb !== undefined &&
      req.body.proteinGramsPerLb !== undefined) {
    // if any non numbers were entered
    if (!isNumber(req.body.bodyweight) ||
        !isNumber(req.body.carbsGramsPerLb) ||
        !isNumber(req.body.proteinGramsPerLb) ||
        !isNumber(req.body.fatGramsPerLb)) {
      req.session.error = 'Grams per lb must be non-negative numbers';
      console.log('Grams per lb must be non-negative numbers');
      res.render('calculator',
        {username: req.session.user,
          displayCalorieResults: false,
          displayGramResults: false,
          displayGramPerLbResults: false,
          error:req.session.error});
    }
    else {
      var bw = JSON.stringify(parseFloat(req.body.bodyweight));
      var carbs = JSON.stringify((parseFloat(req.body.carbsGramsPerLb)) * bw );
      var protein = JSON.stringify((parseFloat(req.body.proteinGramsPerLb)) * bw);
      var fat = JSON.stringify((parseFloat(req.body.fatGramsPerLb)) * bw);
      res.render('calculator',
        {username: req.session.user,
          displayCalorieResults: false,
          displayGramResults: false,
          displayGramPerLbResults: true,
          carbs: carbs,
          protein: protein,
          fat: fat,
          error:null});
    }
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
