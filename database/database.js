'use strict';

var mysql = require('mysql');
var fs = require('fs');
var credentials= JSON.parse(fs.readFileSync('credentials.json', 'utf8'));

var conf = {
  host     : 'cis350group10db.cca9bnl1w9fn.us-west-2.rds.amazonaws.com',
  user     : credentials.user,
  password : credentials.password,
  port     : '3306',
  databse  : 'cis350_database'
};

var connection = mysql.createConnection(conf);
connection.connect(function(err){
    if (err){
        console.error('couldn\'t connect',err);
    }
    else{
        console.log('mysql connected');
        connection.query('USE cis350_database', function(err, rows, fields){
        if(err) {
          throw err;
        }
      console.log('Using cis350_database');

      });
    }
});

module.exports = connection;

/** how to connect through commandline
mysql -h cis350group10db.cca9bnl1w9fn.us-west-2.rds.amazonaws.com -P 3306 -u cis350_group10 -p



**/
