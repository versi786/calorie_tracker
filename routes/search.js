'use strict';
var express = require('express');
var router = express.Router();
var fs = require('fs');
var nutritionix;
fs.readFile('credentials.json', 'utf8', function (err, data) {
  if (err) throw err;
  var nutritionixJSON = JSON.parse(data);
  nutritionix = require('nutritionix')({
    appId: nutritionixJSON.nutritionix_application_id,
    appKey: nutritionixJSON.nutritionix_application_
}, false);
});


router.get('/', function(req, res, next) {
  console.log(req.session.user);
  if(!req.session.user){
    res.redirect('/login');
  }else{
  	if(!req.query.searchTerm){
  	res.render('search',{username: req.session.user, 
  		'searchTerm': req.query.searchTerm,
  		'searchEntries': []});
  	}else{
  		//actually do the search in the databse and show the results
  		res.render('search',{username: req.session.user, 
  		'searchTerm': req.query.searchTerm,
  		'searchEntries': []});
  	}
  }
});



router.post('/', function(req, res, next) {
  console.log(req.session.user);
  res.redirect('/search/?searchTerm=' + req.body.searchTerm);
});

module.exports = router;
