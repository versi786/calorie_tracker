'use strict';
var express = require('express');
var router = new express.Router();

// Match every URL and all HTTP request types
router.use('/', function (req, res, next ) {

  // User logged in traditionally
if (req.session.user) {
    next();
  } else {
    req.session.error = 'Yowzah - you need to log in or sign up!';
    res.redirect('/login');
  }
});


module.exports = router;

// f (req.session.error) {
//     res.render('login', {error: req.session.error});
//     req.session.error = null;
//   } else
