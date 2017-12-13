//
// ./api/v1/user.routes.v1.js
//
var express = require('express');
var routes = express.Router();
var mongodb = require('../config/mongo.db');
var Club = require('../model/club.model');
var neo4j = require('neo4j-driver').v1;
var driver = neo4j.driver("bolt://localhost:7687", neo4j.auth.basic("neo4j", "neo4j"));
var session = driver.session();

//
// Geef een lijst van alle clubs.
//
routes.get('/club', function (req, res) {
    res.contentType('application/json');
		session
		  .run('MATCH (n:Club) RETURN n LIMIT 25')
		  .then(function (result) {
		  	 res.status(200).json(result.records);
		  	 session.close();
		     driver.close();
		   
		  })	
		  .catch(function (error) {
            res.status(400).json(error);
		    console.log(error);
		  });
});

module.exports = routes;