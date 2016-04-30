'use strict';
var express = require('express');
var router = express.Router();

/* Route handles user login. */
router.get('/', function(req, res, next) {
  console.log(req.session.user);
  // Can only visit user page if logged in. Redirect to login.
  if (!req.session.user) {
    res.redirect('/login');
  } else {
    //render homepage for user
  	res.redirect('/users/'+req.session.user);
  }
});

module.exports = router;
