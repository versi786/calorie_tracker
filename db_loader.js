'use strict';
var db = require('./database/database');
var async = require('async');
var SHA3 = require('crypto-js/sha3');


function deleteDatabase(){
  console.log("deleting database");
  db.query('DROP DATABASE cis350_database', function(err, rows, fields){
    if(err) {
      console.log(err);
    }
  });
  console.log("done");
  return;
}

function useDatabase() {
  console.log("using db");
  db.query('USE cis350_database', function(err, rows, fields){
    if(err) {
      throw err;
    }
  console.log("USE DASTABSE");
  console.log(rows);
  console.log(fields);
  });
}

function createDatabase(){
  console.log("creating database");
  db.query('CREATE DATABASE cis350_database', function(err, rows, fields){
    if(err) {
      throw err;
    }
    console.log("CREATE DASTABSE");
    console.log(rows);
    console.log(fields);
  });
  console.log("done");
}

function createTables(){
  console.log("creating tables");
  return;
}

function loadBasics(){
  console.log("loading basics");
  return;
}


console.log("[WARNING] This sometimes does not work when AWS decides to be slow");
console.log("[WARNING] DELETING ALL EXISTING TABLES YOU HAVE 3 SECONDS TO EXIT!");
setTimeout(function(){ 
  console.log("here we go");
  async.series([
  deleteDatabase,
  // setTimeout(createDatabase, 3000),
  // setTimeout(useDatabase, 3000),
  setTimeout(createTables, 3000),
  setTimeout(loadBasics, 3000)
  ]);

}, 3000);

