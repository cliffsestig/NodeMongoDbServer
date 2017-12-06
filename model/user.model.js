const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    title: String,
    recipes: [{
        name: String,
        time: String,
        ingredients: [{
            name: String,
            amount: Number
        }]
    }]
}, {
    timestamps: true
});


const User = mongoose.model('user', UserSchema);

// Add a 'dummy' user (every time you require this file!)
const user = new User({
    name: 'Joe',
}).save();

module.exports = User;