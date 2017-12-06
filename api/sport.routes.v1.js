//
// ./api/v1/user.routes.v1.js
//
var express = require('express');
var routes = express.Router();
var mongodb = require('../config/mongo.db');
var Sport = require('../model/sport.model');

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

module.exports = routes;