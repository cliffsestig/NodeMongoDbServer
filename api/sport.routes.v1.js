//
// ./api/v1/user.routes.v1.js
//
var express = require('express');
var routes = express.Router();
var mongodb = require('../config/mongo.db');
var Sport = require('../model/sport.model');
var Club = require('../model/club.model');
const mongoose = require('mongoose');

//
// Geef een lijst van alle sports.
//
routes.get('/sport', function (req, res) {
    res.contentType('application/json');

    Sport.find({})
        .then(function (sports) {
            res.status(200).json(sports);
        })
        .catch((error) => {
            res.status(400).json(error);
        });
});

routes.post('/sport', function (req, res) {
	var newSport = new Sport(req.body);

	newSport.save()
	    .then(sport => {
	            res.send("Sport saved to database");
	    })
	    .catch((error) => {
	        res.status(400);
    });
});

routes.get('/sport/:id', function (req, res) {
    res.contentType('application/json');
    var id = mongoose.Types.ObjectId(req.params.id);

    Sport.findById(id)
        .then(function (sports) {
            res.status(200).json(sports);
        })
        .catch((error) => {
            res.status(400).json(error);
        });
});


routes.post('/sport/:id',function (req, res) {
	var id = mongoose.Types.ObjectId(req.params.id);
	Sport.findById(id, function(err, sport){
		var newClub = new Club(req.body);
		sport.clubs.push(newClub);
		sport.save()
		    .then(club => {
		        res.send("Club saved to database");
		    })
		    .catch((error) => {
		        res.status(400);
	    });
	});
});

routes.get('/sport/:id/club', function (req, res) {
    res.contentType('application/json');
    var id = mongoose.Types.ObjectId(req.params.id);

    Sport.findById(id)
        .then(function (sports) {
            res.status(200).json(sports.clubs);
        })
        .catch((error) => {
            res.status(400).json(error);
        });
});


routes.get('/sport/:id/club/:cid', function (req, res) {
    res.contentType('application/json');
    var id = mongoose.Types.ObjectId(req.params.id);
    var cid = mongoose.Types.ObjectId(req.params.cid);

    Sport.findById(id, function(err, sport){
		res.status(200).json(sport.clubs.id(cid));
	});
});

module.exports = routes;