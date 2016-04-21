'use strict';
var express = require('express');
var router = express.Router();
var fs = require('fs');
var nutritionix = {};
var urlfront;
var urlend;
var request = require('request');
var mysql = require('mysql');
var db = require('../database/database');
fs.readFile('credentials.json', 'utf8', function (err, data) {
    if (err) {
        throw err;
    }
    var nutritionixJSON = JSON.parse(data);
    nutritionix.appId = nutritionixJSON.nutritionix_application_id;
    nutritionix.appKey =nutritionixJSON.nutritionix_application_key;

    urlfront = 'https://api.nutritionix.com/v1_1/search/';
    urlend = '?results=0%3A20&cal_min=0&cal_max=50000&fields=*&appId=' +
                nutritionix.appId +
                '&appKey=' +
                nutritionix.appKey;
    console.log('Nutritionix Search Database set up');
});

// use the flickr API without auth

router.get('/', function(req, res, next) {
  console.log(req.session.user);
  if(!req.session.user){
    res.redirect('/login');
  }else{
    if(!req.query.searchTerm){
    res.render('search',{username: req.session.user,
        'searchTerm': req.query.searchTerm,
        'searchResultsArr': null});
    }else{
        //actually do the search in the databse and show the results
        request({
            url: urlfront + req.query.searchTerm + urlend,
            json: true
        }, function (error, response, body) {
        if (!error && response.statusCode === 200) {
            console.log(body); // Print the json response
            var resultArr = body.hits;
            res.render('search',{username: req.session.user,
            'searchTerm': req.query.searchTerm,
            'searchResultsArr': resultArr}
            );
        }

        });
    }
  }
});


router.post('/', function(req, res, next) {
  console.log(req.session.user);
  console.log('/search/?searchTerm=' + req.body.searchTerm);
  res.redirect('/search/?searchTerm=' + req.body.searchTerm);
  console.log('redirected');
});

router.post('/submit', function(req, res, next) {

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
  if(req.body.item_name === '' ||
    req.body.nf_calories === '' ||
    req.body.nf_total_carbohydrate === '' ||
    req.body.nf_total_fat === '' ||
    req.body.nf_protein === '' ||
    req.body.nf_serving_size_qty === '' ||
    req.body.nf_serving_size_unit === '' ||
    req.body.meal_choice === '') {

    req.session.error = 'All fields must be filled in';
    var backURL=req.header('Referer') || '/';
    res.redirect(backURL);
  } else {
        var err;
        // add food to favorites list
        if (req.body.add_to_favorites) {
            console.log('Adding new food to favorites');
            var sql = 'INSERT INTO favorites ' +
                    '(name, carbs, fat, protein, unit, serving, meal, username) ' +
                    'VALUES (?, ?, ?, ?, ?, ?, ?, (SELECT username from users WHERE username=?));';
            var inserts = [req.body.item_name, req.body.nf_total_carbohydrate,
              req.body.nf_total_fat,
              req.body.nf_protein, req.body.nf_serving_size_unit,
              req.body.nf_serving_size_qty,
              req.body.meal_choice.toLowerCase(), req.session.user];
            sql = mysql.format(sql, inserts);
            db.query(sql, function(err, rows, fields) {
              console.log('Heard back from the sql server');
              if(err) {
                req.session.error = 'database error';
              }
              else {
                console.log('Added new food to favorites');
              }
            });
        }

        if(err) {
          req.session.error = 'database error';
        }
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
          content.food = req.body.item_name;
          content.quantity_meas = req.body.nf_serving_size_unit;

          Flickr.tokenOnly(flickrOptions, function(error, flickr) {
            // we can now use 'flickr' as our API object,
            // but we can only call public methods and access public data
              // Search for photos with a tag of 'badgers'
            console.log('Searching flickr for ' + content.food);
            flickr.photos.search({text:content.food, sort:'relevance', group_id:'99392030@N00'},  function(error, results) {
              var photo = results.photos.photo[0];
              console.log('PHOTO', photo);
              var url = '';
              if(photo){
                var url = 'https://farm' + photo.farm + '.staticflickr.com/' + photo.server + '/' + photo.id + '_' + photo.secret + '.jpg';
                content.url = url;
              }
              try
              {
                content.quantity = parseInt(req.body.nf_serving_size_qty);
                content.fat = parseInt(req.body.nf_total_fat);
                content.protein = parseInt(req.body.nf_protein);
                content.carbs = parseInt(req.body.nf_total_carbohydrate);
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


                var sql = 'INSERT INTO FOOD_ENTRIES ' +
                        '(Entry_Date, username, Entry_Content) ' +
                        'VALUES (?, (SELECT username from users WHERE username=?), ?);';

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

                var updateSql = 'UPDATE FOOD_ENTRIES SET Entry_Content = ? ' +
                        'WHERE (Entry_Date = ?) AND (username = ?);';

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
          });
        });
      }
    });


var Flickr = require('flickrapi'),
    flickrOptions = {
      api_key: '28f8fdc0e94256d11a035d8e95298cd8',
      secret: '21ad4ae275363532'
};





module.exports = router;
