'use strict';

var mysql = require('mysql');
var fs = require('fs');
var credentials= JSON.parse(fs.readFileSync('credentials.json', 'utf8'));

var conf = {
  host     : 'cis350group10db2-cluster.cluster-ctctmliw2lup.us-east-1.rds.amazonaws.com',
  user     : credentials.user,
  password : credentials.password,
  port     : '3306',
};

var connection = mysql.createConnection(conf);
connection.connect(function(err){
    if (err){
        console.error("couldn't connect",err);
    }
    else{
        console.log("mysql connected");
    }
});

module.exports = connection;