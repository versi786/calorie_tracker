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

    if(req.session.error){
      //TODO distplay the error
      req.session.error = null;
    }

    var goalsql = 'SELECT carbs, fat, protein, goals, food FROM users WHERE username = ?';
    var inserts = [req.params.username];
    goalsql = mysql.format(goalsql, inserts);
    //Query the user goals
    db.query(goalsql, function(err, rows1, fields) {
      if(err) {
          req.session.error = 'database error';
          console.log('database error');
          res.redirect('/');
          return;
      }
      // Check whether there are food entries
      var dailyExist = 'SELECT * FROM FOOD_ENTRIES WHERE (Entry_Date = ?) AND (username = ?);';
        var inserts = [req.session.today, req.session.user];
        dailyExist = mysql.format(dailyExist, inserts);


        db.query(dailyExist, function(err, rows, fields) {
          if(err){
            req.session.error = 'database error';
            console.log('this databse error');
            res.redirect('/');
          }else{
            //calculate the number of calories remainging
            var fat = (rows1[0].fat===null?0:rows1[0].fat);
            var carbs = (rows1[0].carbs===null?0:rows1[0].carbs);
            var protein = (rows1[0].protein===null?0:rows1[0].protein);
            
            var entry = (rows.length===1) ? JSON.parse(rows[0].Entry_Content) : {
                            'breakfast':[],
                            'lunch':[],
                            'dinner':[],
                            'snack':[]
                          };

            res.render('public', {fat: fat,
                          carbs: carbs,
                          protein: protein,
                          goals: rows1[0].goals,
                          food: rows1[0].food,
                          username: req.session.user,
                          entry: entry
            });
            if(rows.length===1){
              console.log('Data for user');
              console.log(JSON.parse(rows[0].Entry_Content));
            }
          }
        }
    );
  });
});

module.exports = router;
