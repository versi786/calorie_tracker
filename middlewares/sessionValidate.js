'use strict';
var express = require('express');
var router = new express.Router();

// Match every URL and all HTTP request types
router.use('/', function (req, res, next ) {

  // User logged in traditionally
if (req.session.user) {
    next();
  } else {
    res.redirect('/login');
  }
});

module.exports = router;

