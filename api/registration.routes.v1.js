//
// ./api/v1/user.routes.v1.js
//
var express = require('express');
var routes = express.Router();
var mongodb = require('../config/mongo.db');
var Registration = require('../model/registration.model');

//
// Geef een lijst van alle registrations.
//
routes.get('/registration', function (req, res) {
    res.contentType('application/json');

    Registration.find({})
        .then(function (registration) {
            res.status(200).json(registration);
        })
        .catch((error) => {
            res.status(400).json(error);
        });
});

module.exports = routes;