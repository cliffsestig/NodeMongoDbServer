const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const RegistrationSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    description: String,
}, {
    timestamps: true
});


const Registration = mongoose.model('registration', RegistrationSchema);


module.exports = Registration;