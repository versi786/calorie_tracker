'use strict';
var express = require('express');
var router = express.Router();
var db = require('../database/database');
var mysql = require('mysql');

/* RENDER THE USER PAGE */
router.get('/:username', function(req, res, next) {

    // If not in user session re-direct to home-page. Still a vulernability - fairly certain the library doesn't hash when inserting data into the session-ID. If I knew the username I could manually construct a request object with the username in the sessionId.
    if (!req.session.user) {
      res.redirect('../');
    }

    var goalsql = 'SELECT carbs, fat, protein FROM users WHERE username = ?';
    var inserts = [req.params.username];
    goalsql = mysql.format(goalsql, inserts);

    var fat, carbs, protein;

    db.query(goalsql, function(err, rows, fields) {
      if(err) {
          req.session.error = 'database error';
          res.redirect('/:username');
      }
      res.render('users', {fat: (rows[0].fat===null?0:rows[0].fat),
                          carbs: (rows[0].carbs===null?0:rows[0].carbs),
                          protein: (rows[0].protein===null?0:rows[0].protein),
                          username: req.session.user}
                );
    });
});

router.post('/', function(req, res, next) {

  console.log(req.body);

    // Always confirm request is part of a session.
    if (!req.session.user) {
      res.redirect('../');
    }

  // Form must be completed
  if(req.body.food_input === '' ||
    req.body.quantity_measure === '' ||
    req.body.quantity_choose === '' ||
    req.body.fat_input === '' ||
    req.body.protein_input === '' ||
    req.body.carbs_input === '' ||
    req.body.meal_choice === '') {

    req.session.error = 'All fields must be filled in';
    res.redirect('/users/' + req.session.user);
  } else {

        console.log('Server received valid form submission');

        var entry_content = {};
        entry_content.food = req.body.food_input;
        entry_content.meal = req.body.meal_choice;
        entry_content.quantity_meas = req.body.quantity_measure;
        entry_content.quantity = req.body.quantity_choose;
        entry_content.fat = req.body.fat_input;
        entry_content.protein = req.body.protein_input;
        entry_content.carbs = req.body.carbs_input;


        var sql = 'INSERT INTO FOOD_ENTRIES \
                (Entry_Date, username, Entry_Content) \
                VALUES (?, (SELECT username from users WHERE username=?), ?);';

        var inserts = [req.session.today, req.session.user, JSON.stringify(entry_content)];
        sql = mysql.format(sql, inserts);

        // Add the new entry to the food entries table if valid
        db.query(sql, function(err, rows, fields) {
          console.log('Heard back from the sql server');
        if(err) {
          req.session.error = 'database error';
        }
        res.redirect('/users/' + req.session.user);
      });
  }
});

module.exports = router;
