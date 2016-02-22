'use strict';
var express = require('express');
var router = express.Router();
var db = require('../database/database');
var SHA3 = require('crypto-js/sha3');

/* RENDER THE USER PAGE */
router.get('/:username', function(req, res, next) {

	db.query('select carbs, fat, protein, goals, food from users where username = ?',[req.session.user], function(err, rows, fields){
      //pass to view in json
      if(err){
        console.log(err);
      }else{
        res.render('public', {error: null, food: rows[0].food, goals: rows[0].goals,
         carbs: rows[0].carbs, fat: rows[0].fat, protein: rows[0].protein});  
      }
    });

});

module.exports = router;