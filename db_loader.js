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
   db.query('CREATE TABLE users ( \
      username CHARACTER(100) NOT NULL PRIMARY KEY,\
      firstname CHARACTER(100) NOT NULL, \
      lastname CHARACTER(100) NOT NULL, \
      password CHARACTER(200) NOT NULL, \
      calories INT \
      carbs INT \
      fat INT \
      protein INT \
    );', function(err, rows, fields){
    if(err) {
      throw err;
    }
    console.log("CREATE DASTABSE");
    console.log(rows);
    console.log(fields);
  });

  return;
}

function loadBasics(){
  console.log("loading basics");
  return;
}

function addMacrosColumns() {
  db.query(ALTER table users add column (carbs int));
}


console.log("[WARNING] This sometimes does not work when AWS decides to be slow");
console.log("[WARNING] Must drop all tables before running");
setTimeout(function(){ 
  console.log("here we go");
  async.series([
  // deleteDatabase,
  //createDatabase,
  // useDatabase,
  // setTimeout(createTables, 3000),
  //setTimeout(loadBasics, 3000)
  addMacrosColumns
  ]);



}, 3000);

