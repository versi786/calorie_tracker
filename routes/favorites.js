'use strict';
var express = require('express');
var router = express.Router();
var db = require('../database/database');
var mysql = require('mysql');
/* GET. */
router.get('/', function(req, res, next) {
  if(!req.session.user || req.session.error){
    var save = req.session.error;
    req.session.error = null;
    res.render('login', {error: save});
  } else {
	  var sql = 'SELECT * FROM favorites WHERE username = ?';
	  var inserts = [req.session.user];
	  sql = mysql.format(sql, inserts);
	  console.log('getting favorites for ' + req.session.user);
	  db.query(sql, function(err, rows, fields) {
	    if(err) {
	        req.session.error = 'database error';
	        console.log('database error');
	        res.redirect('/');
	        return;
	    }
	    else {
	    		res.render('favorites', {username: req.session.user, rows:rows});
	    }
	  });
	}
});

router.post('/', function(req, res, next) {

    // Always confirm request is part of a session.
    if (!req.session.user) {
        res.redirect('../');
    }

    //add the date to the session if it is not there;
    if(!req.session.today){
        var today = new Date();
        var mm = (today.getMonth()+1).toString();
        var dd = today.getDate().toString();
        var yyyy = today.getFullYear().toString();
        var date_entry = (mm[1]?mm:'0'+mm[0]) + '-' + (dd[1]?dd:'0'+dd[0]) + '-' + yyyy;
        console.log(date_entry);
        req.session.today = date_entry;
    }

    // Form must be completed
  if(req.body.name === '' ||
    req.body.carbs === '' ||
    req.body.protein === '' ||
    req.body.fat === '' ||
    req.body.unit === '' ||
    req.body.serving === '' ||
    req.body.meal_choice === '') {

    req.session.error = 'All fields must be filled in';
    var backURL=req.header('Referer') || '/';
    res.redirect(backURL);
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
          content.food = req.body.name;
          content.quantity_meas = req.body.unit;

          try
          {
            content.quantity = parseInt(req.body.serving);
            content.fat = parseInt(req.body.fat);
            content.protein = parseInt(req.body.protein);
            content.carbs = parseInt(req.body.carbs);
          } catch (e) {
            req.session.error = 'numerical fields must be numbers';
            // var backURL=req.header('Referer') || '/';
            // res.redirect(backURL);
            return;
          }
          console.log('new entry flag ' + newEntry_FLAG);
          // CREATE NEW DAY ENTRY
          if (newEntry_FLAG) {

            console.log('I got here adding new entry');

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
                var backURL=req.header('Referer') || '/';
                res.redirect(backURL);
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
  }
 });

module.exports = router;
