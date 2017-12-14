//
// Tests voor versie 1 van de API.
//
// Referentie: zie http://chaijs.com/api/bdd/#members-section
//
process.env.NODE_ENV = 'test';

var chai = require('chai');
var chaiHttp = require('chai-http');
var server = require('../server.js');
var chould = chai.should();

var Sport = require('../model/sport.model');
var Club = require('../model/club.model');
var Registration = require('../model/registration.model');

chai.use(chaiHttp);

describe('Sport API v1', function() {

     it('Returns sports', function(done) {
        chai.request(require('../server.js'))
            .get('/api/v1/sport')
            .end(function(err, res) {
                res.should.have.status(200);
                res.should.be.json;
                res.body.should.be.a('array');
                done();
            });
    });

    it('Saves a sport', function(done) {
        let sport = {
            name: 'Test name',
            description: 'Test description'
        };
        chai.request(require('../server.js'))
            .post('/api/v1/sport')
            .send(sport)
            .end(function(err, res) {
                res.should.have.status(200);
                res.should.be.json;
                res.body.should.be.a('object');
                done();
            });
    });

    it('Updates a sport', function(done) {
        let sport = new Sport({
            name: 'Test name',
            description: 'Test description'
        });
        sport.save((err, sport) => {
            chai.request(require('../server.js'))
            .put('/api/v1/sport/' + sport._id)
            .send({name: "Hond", description: "Kat"})
            .end(function(err, res) {
                res.should.have.status(200);
                res.should.be.json;
                res.body.should.be.a('object');
                res.body.should.have.property('name').eql('Hond');
                res.body.should.have.property('description').eql('Kat');
                done();
            });
        });
    });

    it('Deletes a sport', function(done) {
        let sport = new Sport({
            name: 'Test name',
            description: 'Test description'
        });
        sport.save((err, sport) => {
            chai.request(require('../server.js'))
            .delete('/api/v1/sport/' + sport._id)
            .end(function(err, res) {
                res.should.have.status(200);
                res.body.should.have.property('message').eql('Sport successfully deleted');
                done();
            });
        });
    });

    it('Get a single sport', function(done) {
        let sport = new Sport({
            name: 'Test name',
            description: 'Test description'
        });
        sport.save((err, sport) => {
            chai.request(require('../server.js'))
            .get('/api/v1/sport/' + sport._id)
            .end(function(err, res) {
                res.should.have.status(200);
                res.should.be.json;
                res.body.should.be.a('object');
                res.body.should.have.property('name');
                res.body.should.have.property('description');
                res.body.should.have.property('_id');
                done();
            });
        });
    });

    it('Saves a club', function(done) {
        let sport = new Sport({
            name: 'Test name',
            description: 'Test description'
        });
        sport.save((err, sport) => {
        let club = {
            name: 'Test name',
            city: 'Test city',
            address: 'Test address',
            zipcode: 'Test zipcode',
            description: 'Test description'
        };
        chai.request(require('../server.js'))
            .post('/api/v1/sport/' + sport._id)
            .send(club)
            .end(function(err, res) {
                res.should.have.status(200);
                res.should.be.json;
                res.body.should.be.a('object');
                done();
            });
        });
    });

    it('Updates a club', function(done) {
        let sport = new Sport({
            name: 'Test name sport',
            description: 'Test description'
        });
        sport.save((err, sport) => {
            let club = new Club({
                name: 'Test name',
                city: 'Test city',
                address: 'Test address',
                zipcode: 'Test zipcode',
                description: 'Test description'
            });
            sport.clubs.push(club);
            sport.save((err, club) => {
                chai.request(require('../server.js'))
                    .put('/api/v1/sport/' + sport._id + "/club/" + club.clubs[0]._id)
                    .send({name: "Testhond", city: "Testkat", zipcode: "Testzipcode", description: "Testdescription"})
                    .end(function(err, res) {
                        res.should.have.status(200);
                        res.should.be.json;
                        res.body.should.be.a('object');
                        res.body.clubs[0].should.have.property('name').eql('Testhond');
                        res.body.clubs[0].should.have.property('city').eql('Testkat');
                        res.body.clubs[0].should.have.property('address').eql('Test address');
                        res.body.clubs[0].should.have.property('zipcode').eql('Testzipcode');
                        res.body.clubs[0].should.have.property('description').eql('Testdescription');
                        done();
                    });
                });
            });
        });
});