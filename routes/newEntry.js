'use strict';
var express = require('express');
var router = express.Router();
var db = require('../database/database');
var mysql = require('mysql');

/* RENDER THE USER PAGE */
router.get('/', function(req, res, next) {

    // If not in user session re-direct to home-page. Still a vulernability - fairly certain the library doesn't hash when inserting data into the session-ID. If I knew the username I could manually construct a request object with the username in the sessionId.
    if (!req.session.user) {
      res.redirect('../');
    }

    var goalsql = 'SELECT carbs, fat, protein FROM users WHERE username = ?';
    var inserts = [req.params.username];
    goalsql = mysql.format(goalsql, inserts);

    db.query(goalsql, function(err, rows, fields) {
      if(err) {
          req.session.error = 'database error';
          res.redirect('/');
      }
      res.render('newEntry',{username: req.session.user,
                  error: req.session.error});
      req.session.error = null;
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
        // Form completed correctly
        console.log('Server received valid form submission');

        // Does a daily entry object already exist?
        var newEntry_FLAG;
        var oldEntry_object;

        var dailyExist = 'SELECT * FROM FOOD_ENTRIES WHERE (Entry_Date = ?) AND (username = ?);';
        var inserts = [req.session.today, req.session.user];
        dailyExist = mysql.format(dailyExist, inserts);


        db.query(dailyExist, function(err, rows, fields) {

          console.log('Heard back from the sql server');

          if(err) {
            req.session.error = 'database error';
          }

          newEntry_FLAG = (rows.length === 0 ? true : false);
          console.log('New Entry: ' + newEntry_FLAG);
          oldEntry_object = ( newEntry_FLAG ? undefined : rows[0]);
          console.log(newEntry_FLAG);

          // BUILD THE NEW FOOD ENTRY
          var content = {};
          content.food = req.body.food_input;
          content.quantity_meas = req.body.quantity_measure;

          try
          {
            content.quantity = parseInt(req.body.quantity_choose);
            content.fat = parseInt(req.body.fat_input);
            content.protein = parseInt(req.body.protein_input);
            content.carbs = parseInt(req.body.carbs_input);
          } catch (e) {
            req.session.error = 'numerical fields must be numbers';
            res.redirect('/newEntry');
            return;
          }
          // CREATE NEW DAY ENTRY
          if (newEntry_FLAG) {

            console.log('I got here')

            var dayEntry = {};
            dayEntry.breakfast = [];
            dayEntry.lunch = [];
            dayEntry.dinner = [];
            dayEntry.snack = [];
            dayEntry[req.body.meal_choice.toLowerCase()].push(content);


            var sql = 'INSERT INTO FOOD_ENTRIES \
                    (Entry_Date, username, Entry_Content) \
                    VALUES (?, (SELECT username from users WHERE username=?), ?);';

            var inserts = [req.session.today, req.session.user, JSON.stringify(dayEntry)];
            sql = mysql.format(sql, inserts);

            // Add the new entry to the food entries table if valid
            db.query(sql, function(err, rows, fields) {
              console.log('Heard back from the sql server');
              if(err) {
                req.session.error = 'database error';
              }
              res.redirect('/users/' + req.session.user);
            });

          } else {

            var newContent = JSON.parse(oldEntry_object.Entry_Content);
            newContent[req.body.meal_choice.toLowerCase()].push(content);

            var updateSql = 'UPDATE FOOD_ENTRIES SET Entry_Content = ? \
                    WHERE (Entry_Date = ?) AND (username = ?);';

            var inserts = [JSON.stringify(newContent), req.session.today, req.session.user];
            updateSql = mysql.format(updateSql, inserts);

            db.query(updateSql, function(err, rows, fields) {
              console.log('Heard back from the sql server');
              if(err) {
                req.session.error = 'database error';
              }
              res.redirect('/users/' + req.session.user);
            });
          }





        });

        // NEW ENTRY




  }
});

module.exports = router;