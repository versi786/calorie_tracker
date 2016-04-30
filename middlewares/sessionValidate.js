'use strict';

/*
Middleware to validate session. Mounted as primary middleware to field server
requests after login and signup branches. Checks that there is an existing
session before a client can view pages other than login/signup.
*/

var express = require('express');
var router = new express.Router();

// Match every URL and all HTTP request types
router.use('/', function (req, res, next ) {

// Session exists proceed with request
if (req.session.user) {
    next();
  } else {
    // No session. Redirect to login.
    res.redirect('/login');
  }
});

module.exports = router;

