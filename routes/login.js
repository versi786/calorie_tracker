'use strict';

/*
Route to handle login page and login requests.
*/

var express = require('express');
var router = express.Router();
var db = require('../database/database');
var SHA3 = require('crypto-js/sha3');

/*
Handles get requests to the login page
*/
router.get('/', function(req, res, next) {
  if(req.session.error){
    // Render the error on page
    var save = req.session.error;
    req.session.error = null;
    res.render('login', {error: save});
  } else if(req.session.user) {
    // User already logged in. Redirect to index which will send to user
    res.redirect('/');
  } else {
    // No logged in. Render the login page.
    res.render('login', {error: null});
  }
});

/*
Handles attempts to login using form or facebook login button.
*/
router.post('/', function(req, res, next){
  console.log(req.body);
  console.log(req.error);
  // All fields must be filled in
  if(req.body.username === '' ||
    req.body.password === ''){
    req.session.error = 'All fields must be filled in';
    res.redirect('/login');
  }
  // Query the db for existing user
  db.query('select password from users where username = ?',
    [req.body.username.toLowerCase()], function(err, rows, fields){
      if (err) {
        req.session.error = 'database error';
        res.redirect('/login');
      } else if(rows.length === 0 ||
        // User not in db or error filling in form. Redirect to login page.
        SHA3(req.body.password).toString() !== rows[0].password){
        req.session.error = 'error with username or password';
        res.redirect('/login');
      } else{
        // Valid login. Establish the session and the date.
        req.session.user = req.body.username.toLowerCase();

        var today = new Date();
        var mm = (today.getMonth()+1).toString();
        var dd = today.getDate().toString();
        var yyyy = today.getFullYear().toString();
        var date_entry = (mm[1]?mm:'0'+mm[0]) + '-' + (dd[1]?dd:'0'+dd[0]) + '-' + yyyy;

        console.log(date_entry);
        req.session.today = date_entry;
        // Redirect to user page.
        res.redirect('/users/'+req.session.user);
      }
    });
});

module.exports = router;
