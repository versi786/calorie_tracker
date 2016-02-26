'use strict';
var express = require('express');
var router = express.Router();
var db = require('../database/database');
var mysql = require('mysql');

/* RENDER THE USER PAGE */
router.get('/:username', function(req, res, next) {

    // If not in user session re-direct to home-page. Still a vulernability - fairly certain the library doesn't hash when inserting data into the session-ID. If I knew the username I could manually construct a request object with the username in the sessionId.
    if (!req.session.user) {
      res.redirect('../');
    }

    var goalsql = 'SELECT carbs, fat, protein FROM users WHERE username = ?';
    var inserts = [req.params.username];
    goalsql = mysql.format(goalsql, inserts);

    db.query(goalsql, function(err, rows, fields) {
      if(err) {
          req.session.error = 'database error';
          res.redirect('/:username');
      }
      res.render('users', {fat: (rows[0].fat===null?0:rows[0].fat),
                          carbs: (rows[0].carbs===null?0:rows[0].carbs),
                          protein: (rows[0].protein===null?0:rows[0].protein),
                          username: req.session.user}
                );
    });
});

module.exports = router;
