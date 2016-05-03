'use strict';

var mysql = require('mysql');
var fs = require('fs');
var credentials= JSON.parse(fs.readFileSync('credentials.json', 'utf8'));
var cj = require('cron').CronJob;
var conf = {
  host     : 'cis350group10db.cca9bnl1w9fn.us-west-2.rds.amazonaws.com',
  user     : credentials.user,
  password : credentials.password,
  port     : '3306',
  databse  : 'cis350_database'
};

// Establish persistent connection to mySQL database
var connection = mysql.createConnection(conf);
connection.connect(function(err){
    if (err){
        console.error('couldn\'t connect',err);
    }
    else{
        // console.log('mysql connected');
        connection.query('USE cis350_database', function(err, rows, fields){
        if(err) {
          throw err;
        }
      console.log('Databse connection successful');
      setUpEmailsJob();
      });
    }
});

var db = connection;

// Function to send emails to all users that haven't logged food
function emails(){

  var twilio = require('twilio'),
  client = twilio('AC4b693216486edfad0ee1c1a63afcb418', 'e7b0e6695decd126b2bae81facf11d16'),
  cronJob = require('cron').CronJob;

    var date = new Date();
    var dd = date.getDate();
    var mm = date.getMonth()+1; //January is 0!
    var yyyy = date.getFullYear();
    if(dd < 10) {
      dd = '0' + dd;
    }

    if(mm < 10) {
      mm = '0' + mm;
    }
    date = mm+'-'+dd+'-'+yyyy;
    var goalsql = 'SELECT username, phoneNumber FROM users';
    db.query(goalsql, function(err, rows, fields) {
      if(err){
        console.log(err);
      }
      var phoneNumber;
      var newEntry_FLAG;
      for(var i = 0; i < rows.length; i++) {

        phoneNumber = rows[i].phoneNumber;
        // See what users have logged food
        var dailyExist = 'SELECT * FROM FOOD_ENTRIES WHERE (Entry_Date = ?) AND (username = ?);';
        var inserts = [date, rows[i].username];
        dailyExist = mysql.format(dailyExist, inserts);
        !function outer(i, phoneNumber){
            db.query(dailyExist, function inner(err, rows1, fields) {
              if (err) {
                console.log('food entry database error');
              } else {
                  newEntry_FLAG = (rows1.length === 0 ? true : false);
                  if (newEntry_FLAG) {
                    new cronJob( '10 19 * * *', function(){
                      client.sendMessage( { to:phoneNumber, from:'2674604107',
                      body:'You have not logged your food today! Please log your food!'}, function( err, data ) {});
                      },  null, true);
                  }
              }
            });
        }(i, phoneNumber);
      }
      console.log('Twilio chron job set up');
    });
}


function setUpEmailsJob(){
  new cj('59 23 * * *', emails());
}

module.exports = connection;

/** how to connect through commandline
mysql -h cis350group10db.cca9bnl1w9fn.us-west-2.rds.amazonaws.com -P 3306 -u cis350_group10 -p


**/
