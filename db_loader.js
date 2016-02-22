'use strict';
var db = require('./database/database');
var async = require('async');
var SHA3 = require('crypto-js/sha3');


function deleteDatabase() {
  console.log("attempting to delete database");
  db.query('DROP DATABASE cis350_database', function(err, rows, fields){
    if(err) {
      console.log(err);
    }
  });
  console.log("DATABASE DELETED");
  return;
}

function useDatabase() {
  console.log("attempting to use db");
  db.query('USE cis350_database', function(err, rows, fields){
    if(err) {
      throw err;
    }
  console.log("USING DATABASE");
  console.log(rows);
  console.log(fields);
  });
}

function createDatabase() {
  console.log("attempting to create database");
  db.query('CREATE DATABASE cis350_database', function(err, rows, fields){
    if(err) {
      throw err;
    }
    console.log("CREATED DATABASE");
    console.log(rows);
    console.log(fields);
  });
  console.log("done");
}

function createTables() {
  console.log("creating tables");

  db.query('CREATE TABLE users ( \
      username CHARACTER(100) NOT NULL PRIMARY KEY,\
      firstname CHARACTER(100) NOT NULL, \
      lastname CHARACTER(100) NOT NULL, \
      password CHARACTER(200) NOT NULL, \
      calories INT \
      carbs INT \
      fat INT \
      protein INT\
      goals BOOLEAN \
      food BOOLEAN);', function(err, rows, fields) {
    if(err) {
      throw err;
    }
    console.log("CREATED TABLES users");
    console.log(rows);
    console.log(fields);
  });

  db.query('CREATE TABLE FOOD_ENTRIES ( \
            Entry_ID INT NOT NULL PRIMARY KEY AUTO_INCREMENT,\
            Entry_Date CHARACTER(10) NOT NULL,\
            username CHARACTER(100) NOT NULL,\
            Entry_Content TEXT(5000) NOT NULL \
            );', function(err, rows, fields) {

    if(err) {
      throw err;
    }
    console.log("CREATED TABLES FOOD_ENTRIES");
    console.log(rows);
    console.log(fields);
  });

  db.query('ALTER TABLE FOOD_ENTRIES \
            ADD CONSTRAINT fk_user FOREIGN KEY (username) REFERENCES users(username) \
            ON UPDATE CASCADE \
            ON DELETE CASCADE;', function(err, rows, fields) {
    if(err) {
      throw err;
    }
    console.log("Foreign key constraint added to FOOD_ENTRIES");
    console.log(rows);
    console.log(fields);
  });

  return;
}

function loadBasics() {
  console.log("loading basics");
  return;
}

function addMacrosColumns() {
  db.query(ALTER table users add column (carbs int));
}


console.log("[WARNING] This sometimes does not work when AWS decides to be slow");
console.log("[WARNING] Must drop all tables before running");
setTimeout(function() {
  console.log("here we go");
  async.series([
  // deleteDatabase,
  //createDatabase,
  // useDatabase,
  // setTimeout(createTables, 3000),
  //setTimeout(loadBasics, 3000)
  addMacrosColumns
  ]);
<<<<<<< HEAD
=======



>>>>>>> 7c0a3ba18d550f9de20f99c192a4685353ec4dff
}, 3000);

