var express = require('express');
var routes = express.Router();
var mongodb = require('../config/mongo.db');
var Sport = require('../model/sport.model');
var Club = require('../model/club.model');
var Registration = require('../model/registration.model');
const mongoose = require('mongoose');
var neo4j = require('neo4j-driver').v1;
var driver = neo4j.driver("bolt://localhost:7687", neo4j.auth.basic("neo4j", "neo4j"));
var session = driver.session();

//
// Returns a list of sports
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

//
// Make a new sport
//
routes.post('/sport', function (req, res) {
	var newSport = new Sport(req.body);
	const resultPromise = session.run(
	  'CREATE (a:Sport {name: $name, description: $description})',
	  {name: req.body.name, description: req.body.description}
	);

	resultPromise.then(result => {
	  session.close();

	  // on application exit:
	  driver.close();
	});
	newSport.save()
		.then(sport => {
				res.send("Sport saved to database");
		})
		.catch((error) => {
			res.status(400);
	});

});

//
// Returns a single sport
//

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

//
// Makes a new club on a specific sport
//

routes.post('/sport/:id',function (req, res) {
	var id = mongoose.Types.ObjectId(req.params.id);
	Sport.findById(id, function(err, sport){
		const resultPromise = session.run(
			'MATCH (s:Sport) WHERE s.name = $sportName CREATE (a:Club {name: $clubName, description: $description}), (a)-[:ClubOf]->(s)',
			{sportName: sport.name, clubName: req.body.name, description: req.body.description}
		);

		resultPromise.then(result => {
			session.close();

			// on application exit:
			driver.close();
		});
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

routes.put('/sport/:id', function (req, res) {
	var id = mongoose.Types.ObjectId(req.params.id);
	Sport.findById(id, (err, sport) => {  
		if (err) {
			res.status(500).send(err);
		} else {
			sport.name = req.body.name || sport.name;
			sport.description = req.body.description || sport.description;
			sport.imgurl = req.body.imgurl || sport.imgurl;
			sport.clubs = req.body.clubs || sport.clubs;
			sport.save((err, sport) => {
				if (err) {
					res.status(500).send(err)
				}
				res.status(200).send(sport);
			});
		}
	});
});

routes.delete('/sport/:id', function (req, res) {
	var id = mongoose.Types.ObjectId(req.params.id);
	Sport.findById(id, (err, sport) => {  
		sport.remove();
		response = {
			message: "Sport successfully deleted",
			id: sport._id
		};
		res.status(200).send(response);
	});
});

//
// Update a club
//

routes.put('/sport/:id/club/:cid', function (req, res) {
	var id = mongoose.Types.ObjectId(req.params.id);
	var cid = mongoose.Types.ObjectId(req.params.cid);
	Sport.findById(id, (err, sport) => {  
		if (err) {
			res.status(500).send(err);
		} else {
			sport.clubs.id(cid).name = req.body.name || sport.clubs.id(cid).name;
			sport.clubs.id(cid).description = req.body.description || sport.clubs.id(cid).description;
			sport.clubs.id(cid).imgurl = req.body.imgurl || sport.clubs.id(cid).imgurl;
			sport.clubs.id(cid).clubs = req.body.clubs || sport.clubs.id(cid).clubs;
			sport.save((err, sport) => {
				if (err) {
					res.status(500).send(err)
				}
				res.status(200).send(sport);
			});
		}
	});
});

//
// Delete a club
//

routes.delete('/sport/:id/club/:cid', function (req, res) {
	var id = mongoose.Types.ObjectId(req.params.id);
	var cid = mongoose.Types.ObjectId(req.params.cid);
	Sport.findById(id, (err, sport) => {  
		sport.clubs.pull(cid);
		sport.save();
		response = {
			message: "Club successfully deleted",
			id: sport._id
		};
		res.status(200).send(response);
	});
});

//
// Make a new registration on a single club
// 
routes.post('/sport/:id/club/:cid',function (req, res) {
	var id = mongoose.Types.ObjectId(req.params.id);
	var cid = mongoose.Types.ObjectId(req.params.cid);
	Sport.findById(id, function(err, sport){
		const resultPromise = session.run(
			'MATCH (c:Club) WHERE c.name = $clubName CREATE (r:Registration {name: $registrationName, description: $description}), (r)-[:RegisteredTo]->(c)',
			{clubName: sport.clubs.id(cid).name, registrationName: req.body.name, description: req.body.description }
		);

		resultPromise.then(result => {
			session.close();

			// on application exit:
			driver.close();
		});

		var newRegistration = new Registration(req.body);
		sport.clubs.id(cid).registrations.push(newRegistration);
		sport.save()
			.then(registration => {
				res.send("Registration saved to database");
			})
			.catch((error) => {
				res.status(400);
		});
	});
});

//
// Returns a single club
//
routes.get('/sport/:id/club/:cid', function (req, res) {
	res.contentType('application/json');
	var id = mongoose.Types.ObjectId(req.params.id);
	var cid = mongoose.Types.ObjectId(req.params.cid);

	Sport.findById(id, function(err, sport){
		res.status(200).json(sport.clubs.id(cid));
	});
});

//
// Returns all registrations of a single club
//
routes.get('/sport/:id/club/:cid/registration', function (req, res) {
	res.contentType('application/json');
	var id = mongoose.Types.ObjectId(req.params.id);
	var cid = mongoose.Types.ObjectId(req.params.cid);

	Sport.findById(id, function(err, sport){
		res.status(200).json(sport.clubs.id(cid).registrations);
	});
});


//
// Delete a registration
//

routes.delete('/sport/:id/club/:cid/registration/:rid', function (req, res) {
	var id = mongoose.Types.ObjectId(req.params.id);
	var cid = mongoose.Types.ObjectId(req.params.cid);
	var rid = mongoose.Types.ObjectId(req.params.rid);
	Sport.findById(id, (err, sport) => {  
		sport.clubs.id(cid).registrations.pull(rid);
		sport.save();
		response = {
			message: "Registration successfully deleted",
			id: sport._id
		};
		res.status(200).send(response);
	});
});

//
// Update a registration
//

routes.put('/sport/:id/club/:cid/registration/:rid', function (req, res) {
	var id = mongoose.Types.ObjectId(req.params.id);
	var cid = mongoose.Types.ObjectId(req.params.cid);
	var rid = mongoose.Types.ObjectId(req.params.rid);
	Sport.findById(id, (err, sport) => {  
		if (err) {
			res.status(500).send(err);
		} else {
			sport.clubs.id(cid).registrations.id(rid).name = req.body.name || sport.clubs.id(cid).registrations.id(rid).name;
			sport.clubs.id(cid).registrations.id(rid).description = req.body.description || sport.clubs.id(cid).registrations.id(rid).description;
			sport.save((err, sport) => {
				if (err) {
					res.status(500).send(err)
				}
				res.status(200).send(sport);
			});
		}
	});
});
module.exports = routes;