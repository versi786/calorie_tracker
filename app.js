'use strict';

var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var uuid = require('node-uuid');
var fs = require('fs');
var https = require('https');
//parse arguments
var argv = require('minimist')(process.argv.slice(2));
//"houndify" module contains both client-side ("Houndify") and server-side ("HoundifyNode") parts of SDK
var houndifyNode = require('houndify').HoundifyNode;
//config file for houndify
var configFile = argv.config || 'config';
var config = require(__dirname + '/' + configFile);
var Blob = require('blob');
var routes = require('./routes/index');
var users = require('./routes/users');
var login = require('./routes/login');
var signup = require('./routes/signup');
var editGoalsRouter = require('./routes/edit');
var newEntryRouter = require('./routes/newEntry');
var sessionValidateRouter = require('./middlewares/sessionValidate');

var pub = require('./routes/public');
var newEntry = require('./routes/newEntry');
var newExerciseEntry = require('./routes/newExerciseEntry');
var logout = require('./routes/logout');
var calculator = require('./routes/calculator');
var search = require('./routes/search');
var db = require('./database/database');
var favorites = require('./routes/favorites');
var history = require('./routes/history');
var mysql = require('mysql');
var weight = require('./routes/weight');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public/', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  genid: function(req) {
    return uuid.v1();
  },
  secret: 'CIS350_group10_calorie_tracker',
  resave: false,
  saveUninitialized: false
}));


app.use('/login', login);
app.use('/signup', signup);

// All non-login/signup requests must be sessioned
app.use(sessionValidateRouter);

app.use('/', routes);

app.use('/users', users);

app.use('/edit', editGoalsRouter);
app.use('/public', pub);
app.use('/newEntry', newEntryRouter);
app.use('/logout', logout);
app.use('/weight', weight);
app.use('/search', search);
app.use('/favorites', favorites);
app.use('/newExerciseEntry', newExerciseEntry);
app.use('/calculator', calculator);
app.use('/history', history);


//authenticates requests
app.get('/houndifyAuth', houndifyNode.createAuthenticationHandler({
  clientId:  config.clientId,
  clientKey: config.clientKey
}));

//sends the request to Houndify backend with authentication headers
app.get('/textSearchProxy', houndifyNode.createTextProxyHandler());


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// ** ERROR ROUTERS **

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user

app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
