'use strict';
var express = require('express');
var router = express.Router();
var db = require('../database/database');
var mysql = require('mysql');

/* RENDER THE USER PAGE */
router.get('/:username', function(req, res, next) {

    // If not in user session re-direct to home-page. Still a vulernability - fairly certain the library doesn't hash when inserting data into the session-ID. If I knew the username I could manually construct a request object with the username in the sessionId.
    if (!req.session.user || req.session.user !== req.params.username) {
      res.redirect('../');
    }

    if(req.session.error){
      //TODO distplay the error
      req.session.error = null;
    }

    var goalsql = 'SELECT carbs, fat, protein FROM users WHERE username = ?';
    var inserts = [req.params.username];
    goalsql = mysql.format(goalsql, inserts);

    db.query(goalsql, function(err, rows1, fields) {
      if(err) {
        req.session.error = 'database error';
        console.log('database error');
        res.redirect('/');
        return;
      }
      var dailyExist = 'SELECT * FROM FOOD_ENTRIES WHERE (Entry_Date = ?) AND (username = ?);';
      var inserts = [req.session.today, req.session.user];
      dailyExist = mysql.format(dailyExist, inserts);

      db.query(dailyExist, function(err, rows, fields) {
        if(err){
          req.session.error = 'database error';
          console.log('food entry database error');
          res.redirect('/');
        }else{

          var dailyExist2 = 'SELECT * FROM exercise WHERE (Entry_Date = ?) AND (username = ?);';
          var inserts = [req.session.today, req.session.user];
          dailyExist2 = mysql.format(dailyExist2, inserts);

          db.query(dailyExist2, function(err, rows2, fields) {
            if(err){
              req.session.error = 'database error';
              console.log('exercise database error');
              res.redirect('/');
            }else{
                    //calculate the number of calories remainging
                    var fat = (rows1[0].fat===null?0:rows1[0].fat);

                    var carbs = (rows1[0].carbs===null?0:rows1[0].carbs);

                    var protein = (rows1[0].protein===null?0:rows1[0].protein);

                    var entry = (rows.length===1) ? JSON.parse(rows[0].Entry_Content) : {
                      "breakfast":[],
                      "lunch":[],
                      "dinner":[],
                      "snack":[],
                    };

                    var entry2 = (rows2.length===1) ? JSON.parse(rows2[0].Entry_Content) : {
                      "exercises":[],
                    };

                    for(var i = 0; i < entry.breakfast.length; i++){
                      fat -= entry.breakfast[i].fat;
                      carbs -= entry.breakfast[i].carbs;
                      protein -= entry.breakfast[i].protein;
                    }

                    for(var i = 0; i < entry.lunch.length; i++){
                      fat -= entry.lunch[i].fat;
                      carbs -= entry.lunch[i].carbs;
                      protein -= entry.lunch[i].protein;
                    }

                    for(var i = 0; i < entry.dinner.length; i++){
                      fat -= entry.dinner[i].fat;
                      carbs -= entry.dinner[i].carbs;
                      protein -= entry.dinner[i].protein;
                    }

                    for(var i = 0; i < entry.snack.length; i++){
                      fat -= entry.snack[i].fat;
                      carbs -= entry.snack[i].carbs;
                      protein -= entry.snack[i].protein;
                    }

                    for(var i = 0; i < entry2.exercises.length; i++){
                      fat += entry2.exercises[i].fat;
                      carbs += entry2.exercises[i].carbs;
                      protein += entry2.exercises[i].protein;
                    }

                    res.render('users', {fat: fat,
                      carbs: carbs,
                      protein: protein,
                      username: req.session.user,
                      entry: entry,
                      entry2: entry2

                    });
                    if(rows.length===1){
                      console.log('Data for user');
                      console.log(JSON.parse(rows[0].Entry_Content));
                    }
                  }
                });
        }
      });
    });
  });


router.get('/', function(req, res, next) {
  res.redirect('/users/'+req.session.user);
});
module.exports = router;
