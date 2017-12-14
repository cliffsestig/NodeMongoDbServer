var express = require('express');
var routes = express.Router();
var mongodb = require('../config/mongo.db');
var Sport = require('../model/sport.model');
var Club = require('../model/club.model');
var Registration = require('../model/registration.model');
const mongoose = require('mongoose');
var neo4j = require('neo4j-driver').v1;
var driver = neo4j.driver("bolt://hobby-gnpcegpfcfhdgbkemofmijal.dbs.graphenedb.com:24786", neo4j.auth.basic("test", "b.jUwOcqqDuvWm.bzGTqEIJwoiGAbQR"));
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
	newSport.save()
		.then(sport => {
			const resultPromise = session.run(
			  'CREATE (a:Sport {_id: $id, name: $name, description: $description})',
			  {id: sport._id.toString(), name: req.body.name, description: req.body.description}
			);

			resultPromise.then(result => {
			  session.close();

			  // on application exit:
			  driver.close();
			});
			res.status(200).json(sport);
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
		var newClub = new Club(req.body);
		sport.clubs.push(newClub);
		sport.save()
			.then(sport => {

				const resultPromise = session.run(
					'MATCH (s:Sport) WHERE s.name = $sportName CREATE (a:Club {_id: $id, name: $clubName, description: $description, city: $city, address: $address, zipcode: $zipcode}), (a)-[:ClubOf]->(s)',
					{id: sport.clubs[sport.clubs.length-1]._id.toString(), sportName: sport.name, clubName: req.body.name, description: req.body.description, city: req.body.city, address: req.body.address, zipcode: req.body.address}
				);

				resultPromise.then(result => {
					session.close();

					// on application exit:
					driver.close();
				});
				res.status(200).json(sport.clubs[sport.clubs.length-1]);
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
			sport.clubs = req.body.clubs || sport.clubs;
			sport.save((err, sport) => {
				if (err) {
					res.status(500).send(err)
				}
				const resultPromise = session.run(
					'MATCH (s:Sport) WHERE s._id = $id SET s = {_id: $id, name: $name, description: $description}',
					{id: sport._id.toString(), name: req.body.name, description: req.body.description }
				);

				resultPromise.then(result => {
					session.close();

					// on application exit:
					driver.close();
				});
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
		const resultPromise = session.run(
			'MATCH (s:Sport {_id: $id})<-[*0..]-(c) DETACH DELETE c',
			{id: req.params.id}
		);

		resultPromise.then(result => {
			session.close();

			// on application exit:
			driver.close();
		});
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
			sport.clubs.id(cid).city = req.body.city || sport.clubs.id(cid).city;
			sport.clubs.id(cid).address = req.body.address || sport.clubs.id(cid).address;
			sport.clubs.id(cid).zipcode = req.body.zipcode || sport.clubs.id(cid).zipcode;
			sport.clubs.id(cid).description = req.body.description || sport.clubs.id(cid).description;
			sport.save((err, sport) => {
				if (err) {
					res.status(500).send(err)
				}
				
				const resultPromise = session.run(
					'MATCH (c:Club) WHERE c._id = $id SET c = {_id: $id, name: $name, city: $city, address: $address, zipcode: $zipcode, description: $description}',
					{id: sport.clubs.id(cid)._id.toString(), name: req.body.name, city: req.body.city, address: req.body.address, zipcode: req.body.zipcode, description: req.body.description }
				);

				resultPromise.then(result => {
					session.close();

					// on application exit:
					driver.close();
				});
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
		const resultPromise = session.run(
			'MATCH (c:Club {_id: $id})<-[*0..]-(r) DETACH DELETE r',
			{id: req.params.cid}
		);

		resultPromise.then(result => {
			session.close();

			// on application exit:
			driver.close();
		});
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
		var newRegistration = new Registration(req.body);
		sport.clubs.id(cid).registrations.push(newRegistration);
		sport.save()
			.then(sport => {
				const resultPromise = session.run(
					'MATCH (c:Club) WHERE c.name = $clubName CREATE (r:Registration {_id: $id, firstname: $firstName, lastname: $lastName, age: $age, gender: $gender}), (r)-[:RegisteredTo]->(c)',
					{clubName: sport.clubs.id(cid).name, id: sport.clubs.id(cid).registrations[sport.clubs.id(cid).registrations.length-1]._id.toString(), firstName: req.body.firstname, lastName: req.body.lastname, age: req.body.age, gender: req.body.gender }
				);

				resultPromise.then(result => {
					session.close();

					// on application exit:
					driver.close();
				});
				res.status(200).json(sport.clubs.id(cid).registrations[sport.clubs.id(cid).registrations.length-1]);
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
		const resultPromise = session.run(
			'MATCH (r)-[c]-() WHERE r._id = $id DELETE r,c',
			{id: req.params.rid}
		);

		resultPromise.then(result => {
			session.close();

			// on application exit:
			driver.close();
		});
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
			sport.clubs.id(cid).registrations.id(rid).firstname = req.body.firstname || sport.clubs.id(cid).registrations.id(rid).firstname;
			sport.clubs.id(cid).registrations.id(rid).lastname = req.body.lastname || sport.clubs.id(cid).registrations.id(rid).lastname;
			sport.clubs.id(cid).registrations.id(rid).age = req.body.age || sport.clubs.id(cid).registrations.id(rid).age;
			sport.clubs.id(cid).registrations.id(rid).gender = req.body.gender || sport.clubs.id(cid).registrations.id(rid).gender;
			sport.save((err, sport) => {
				if (err) {
					res.status(500).send(err)
				}
				const resultPromise = session.run(
					'MATCH (r:Registration) WHERE r._id = $id SET r = {_id: $id, firstname: $firstName, lastname: $lastName, age: $age, gender: $gender}',
					{id: sport.clubs.id(cid).registrations.id(rid)._id.toString(), firstName: req.body.firstname, lastName: req.body.lastname, age: req.body.age, gender: req.body.gender }
				);

				resultPromise.then(result => {
					session.close();

					// on application exit:
					driver.close();
				});

				res.status(200).send(sport);
			});
		}
	});
});
module.exports = routes;