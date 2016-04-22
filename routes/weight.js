'use strict';
var express = require('express');
var router = express.Router();
var db = require('../database/database');
var mysql = require('mysql');


/* GET login listing. */
router.get('/', function(req, res, next) {
  console.log(req.session.user);
  if(!req.session.user){
    res.redirect('/login');
  }
  else {
    var dailyExist = 'SELECT * FROM weight WHERE (username = ?);';
    var inserts = [req.session.user];
    dailyExist = mysql.format(dailyExist, inserts);
    console.log(dailyExist);
     db.query(dailyExist, function(err, rows, fields) {
        if(err){
          req.session.error = 'database error';
          console.log('food entry database error');
          console.log(err);
          res.redirect('/');
        }else{
          //console.log(rows);
          var weight_arr = [];
          var date_arr = [];
          for(var j = 0; j < rows.length; j++){
            var weight = parseInt(rows[j].userWeight);
            console.log(weight);
            weight_arr.push(weight);
            var date = rows[j].Entry_Date.split('-');
            date_arr.push(new Date(date[2], date[0]-1, date[1]));
          }
          console.log(weight_arr);
          console.log(date_arr);

          var lastWeight = rows.length === 0 ? '0' : rows[rows.length - 1].userWeight;
          res.render('weight',{username: req.session.user, weight_arr:weight_arr,
           date_arr:date_arr, lastWeight: lastWeight});
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
  if(req.body.weight === '') {
    req.session.error = 'All fields must be filled in';
    res.redirect('/users/' + req.session.user);
  } else {
        // Form completed correctly
        console.log('Server received valid form submission');

        // Does a daily entry object already exist?
        var newEntry_FLAG;

        var dailyExist = 'SELECT * FROM weight WHERE (Entry_Date = ?) AND (username = ?);';
        var inserts = [req.session.today, req.session.user];
        dailyExist = mysql.format(dailyExist, inserts);


        db.query(dailyExist, function(err, rows, fields) {

          console.log('Heard back from the sql server');
          if(err) {
            req.session.error = 'database error';
          }

          newEntry_FLAG = (rows.length === 0 ? true : false);

          try {
            console.log(req.body.weight);
            var newWeight = parseInt(req.body.weight);
          } catch (e) {
            req.session.error = 'numerical fields must be numbers';
            res.redirect('/weight');
            return;
          }

          // CREATE NEW DAY ENTRY
          if (newEntry_FLAG) {

            console.log('I got here adding new entry');

            var sql = 'INSERT INTO weight \
            (Entry_Date, username, userWeight) \
            VALUES (?, (SELECT username from users WHERE username=?), ?);';

            var inserts = [req.session.today, req.session.user, newWeight];
            sql = mysql.format(sql, inserts);
            console.log(sql);
            // Add the new entry to the food entries table if valid
            db.query(sql, function(err, rows, fields) {
              console.log('Heard back from the sql server');
              if(err) {
                req.session.error = 'database error';
                console.log(err);
              }
              res.redirect('/users/' + req.session.user);
            });

          } else {

            var updateSql = 'UPDATE weight SET userWeight = ? \
            WHERE (Entry_Date = ?) AND (username = ?);';

            var inserts = [newWeight, req.session.today, req.session.user];
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