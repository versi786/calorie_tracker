'use strict';
var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var db = require('../database/database');

router.get('/', function(req, res, next) {
  console.log(req.session.user);
  if(!req.session.user){
    res.redirect('/login');
  }else{
    if(!req.query.date1 && !req.query.date2){
      var myDate = new Date(new Date().getTime() - (60*60*24*7*1000));
      var prettyDate = ((myDate.getMonth()+1) < 10 ? '0':'') + (myDate.getMonth()+1) +
        '-' + ((myDate.getDate()) < 10 ? '0':'') +myDate.getDate() +
        '-' + myDate.getFullYear();
      req.query.date1 = prettyDate;

      var myDate2 = new Date(new Date().getTime());
      var prettyDate2 = ((myDate2.getMonth()+1) < 10 ? '0':'') + (myDate2.getMonth()+1) +
        '-' + ((myDate2.getDate()) < 10 ? '0':'') +myDate2.getDate() +
        '-' + myDate2.getFullYear();
      req.query.date2 = prettyDate2;
      console.log('going from ' + prettyDate + ' to ' + prettyDate2);
    }
    console.log(req.query);
    var dailyExist = 'SELECT * FROM FOOD_ENTRIES WHERE (Entry_Date >= ? AND' +
      ' Entry_Date <= ?) AND (username = ?);';
    var inserts = [req.query.date1, req.query.date2, req.session.user];
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
          var carbs_arr = [];
          var fat_arr = [];
          var protein_arr = [];
          var calories_arr = [];
          var date_arr = [];
          for(var j = 0; j < rows.length; j++){
            var entry = JSON.parse(rows[j].Entry_Content);
            var fat = 0;
            var carbs = 0;
            var protein= 0;

            for(var i = 0; i < entry.breakfast.length; i++){
              fat += (entry.breakfast[i].fat *
                entry.breakfast[i].quantity);
              carbs += (entry.breakfast[i].carbs *
                entry.breakfast[i].quantity);
              protein += (entry.breakfast[i].protein *
                entry.breakfast[i].quantity);
            }


            for(var i = 0; i < entry.lunch.length; i++){
              fat += (entry.lunch[i].fat *
                entry.lunch[i].quantity);
              carbs += (entry.lunch[i].carbs *
                entry.lunch[i].quantity);
              protein += (entry.lunch[i].protein *
                entry.lunch[i].quantity);
            }

            for(var i = 0; i < entry.dinner.length; i++){
              fat += (entry.dinner[i].fat *
                entry.dinner[i].quantity);
              carbs += (entry.dinner[i].carbs *
                entry.dinner[i].quantity);
              protein += (entry.dinner[i].protein *
                entry.dinner[i].quantity);
            }

            for(var i = 0; i < entry.snack.length; i++){
              fat += (entry.snack[i].fat *
                entry.snack[i].quantity);
              carbs += (entry.snack[i].carbs *
                entry.snack[i].quantity);
              protein += (entry.snack[i].protein *
                entry.snack[i].quantity);
            }
            carbs_arr.push(carbs);
            fat_arr.push(fat);
            protein_arr.push(protein);
            calories_arr.push(carbs * 4 + fat * 9 + protein * 4);
            console.log(rows[j].Entry_Date);
            var date = rows[j].Entry_Date.split('-');
            date_arr.push(new Date(date[2], date[0]-1, date[1]));
          }
          console.log(carbs_arr);
          console.log(date_arr);
          res.render('history',{username: req.session.user, carbs_arr:carbs_arr,
            fat_arr:fat_arr,
            protein_arr:protein_arr, date_arr:date_arr, calories_arr:calories_arr});
        }
      });
  }
});


router.post('/', function(req, res, next) {
  console.log(req.session.user);
  console.log(req.body);
  res.redirect('/history/?date1=' + req.body.date1 + '&date2=' +req.body.date2);
});

module.exports = router;
