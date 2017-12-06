const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Club = require('./club.model');

const SportSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    description: String,
    clubs: [Club.schema]
}, {
    timestamps: true
});


const Sport = mongoose.model('sport', SportSchema);

// Add a 'dummy' user (every time you require this file!)
// const sport = new Sport({
//     name: 'Sport',
//     description: 'test sport',
//     clubs: [{
//         name: 'A club',
//         description: 'test club',
//         registrations: [{
//             name: 'Registrations',
//             description: 'test description'
//         }]
//     }]
// }).save();

module.exports = Sport;