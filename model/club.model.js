const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Registration = require('./registration.model');

const ClubSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    zipcode: {
        type: String,
        required: true
    },
    description: String,
    registrations: [Registration.schema]
}, {
    timestamps: true
});


const Club = mongoose.model('club', ClubSchema);


module.exports = Club;