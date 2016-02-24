'use strict';
var express = require('express');
var router = express.Router();
var db = require('../database/database');
var SHA3 = require('crypto-js/sha3');
/* GET login listing. */
router.get('/', function(req, res, next) {
  if(req.session.error){
    res.render('login', {error: req.session.error});
    req.session.error = null;
  } else if(req.session.user) {
    res.redirect('/');
  } else {
    res.render('login', {error: null});
  }
});

router.post('/', function(req, res, next){
  console.log(req.body);
  console.log(req.error);
  if(req.body.username === '' ||
    req.body.password === ''){
    req.session.error = 'All fields must be filled in';
    res.redirect('login');
  }
  db.query('select password from users where username = ?',
    [req.body.username.toLowerCase()], function(err, rows, fields){
      if(err){
        req.session.error = 'database error';
        res.redirect('login');
      }else if(rows.length === 0 ||
        SHA3(req.body.password).toString() !== rows[0].password){
        req.session.error = 'error with username or password';
        res.redirect('login');
      }else{
        req.session.user = req.body.username.toLowerCase();

        var today = new Date();
        var mm = (today.getMonth()+1).toString();
        var dd = today.getDate().toString();
        var yyyy = today.getFullYear().toString();
        var date_entry = (mm[1]?mm:'0'+mm[0]) + '-' + (dd[1]?dd:'0'+dd[0]) + '-' + yyyy;

        console.log(date_entry);
        req.session.today = date_entry;

        res.redirect('/users/'+req.session.user);
      }
    });
});

module.exports = router;
