const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const RegistrationSchema = new Schema({
    firstname: {
        type: String,
        required: true
    },
    lastname: {
        type: String,
        required: true
    },
    age: {
        type: String,
        required: true
    },
    gender: {
        type: String,
        required: true
    },
}, {
    timestamps: true
});


const Registration = mongoose.model('registration', RegistrationSchema);


module.exports = Registration;