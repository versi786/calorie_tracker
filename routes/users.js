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
    var date;
    if(!req.query.date){
      date = req.session.today;
    }else{
      date = req.query.date;
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
      var inserts = [date, req.session.user];
      dailyExist = mysql.format(dailyExist, inserts);

      db.query(dailyExist, function(err, rows, fields) {
        if(err){
          req.session.error = 'database error';
          console.log('food entry database error');
          res.redirect('/');
        }else{

          var dailyExist2 = 'SELECT * FROM exercise WHERE (Entry_Date = ?) AND (username = ?);';
          var inserts = [date, req.session.user];
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
                      'breakfast':[],
                      'lunch':[],
                      'dinner':[],
                      'snack':[],
                    };

                    /*
                    if (lunchEntries.length == 0) {
                      console.log('In there');
                      var textJob = new cronJob( '* * * * *', function(){
                        client.sendMessage( { to:'2154701461', from:'2674604107',
                         body:'Hello! Hope you’re having a good day!' }, function( err, data ) {});
                        },  null, true);
                    }
                    */

                    var entry2 = (rows2.length===1) ? JSON.parse(rows2[0].Entry_Content) : {
                      'exercises':[],
                    };

                    for(var i = 0; i < entry.breakfast.length; i++){
                      fat -= (entry.breakfast[i].fat *
                        entry.breakfast[i].quantity);
                      carbs -= (entry.breakfast[i].carbs *
                        entry.breakfast[i].quantity);
                      protein -= (entry.breakfast[i].protein *
                        entry.breakfast[i].quantity);
                    }


                    for(i = 0; i < entry.lunch.length; i++){
                      fat -= (entry.lunch[i].fat *
                        entry.lunch[i].quantity);
                      carbs -= (entry.lunch[i].carbs *
                        entry.lunch[i].quantity);
                      protein -= (entry.lunch[i].protein *
                        entry.lunch[i].quantity);
                    }

                    for(i = 0; i < entry.dinner.length; i++){
                      fat -= (entry.dinner[i].fat *
                        entry.dinner[i].quantity);
                      carbs -= (entry.dinner[i].carbs *
                        entry.dinner[i].quantity);
                      protein -= (entry.dinner[i].protein *
                        entry.dinner[i].quantity);
                    }

                    for(i = 0; i < entry.snack.length; i++){
                      fat -= (entry.snack[i].fat *
                        entry.snack[i].quantity);
                      carbs -= (entry.snack[i].carbs *
                        entry.snack[i].quantity);
                      protein -= (entry.snack[i].protein *
                        entry.snack[i].quantity);
                    }

                    for(i = 0; i < entry2.exercises.length; i++){
                      fat += (entry2.exercises[i].fat *
                        entry2.exercises[i].quantity_input);
                      carbs += (entry2.exercises[i].carbs *
                        entry2.exercises[i].quantity_input);
                      protein += (entry2.exercises[i].protein *
                        entry2.exercises[i].quantity_input);
                    }

                    res.render('users', {fat: fat,
                      carbs: carbs,
                      protein: protein,
                      calories: fat * 9 + carbs * 4 + protein * 4,
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

router.post('/date', function(req, res, next) {
  res.redirect('/users/'+req.session.user+'?'+'date=' + req.body.date);
});

router.get('/', function(req, res, next) {
  res.redirect('/users/'+req.session.user);
});
module.exports = router;
