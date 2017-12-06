const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const RecipeSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    description: String,
    imagePath: String,
    ingredients: [{
        name: String,
        amount: Number,
    }]
}, {
    timestamps: true
});


const Recipe = mongoose.model('recipe', RecipeSchema);

// Add a 'dummy' user (every time you require this file!)
const recipe = new Recipe({
    name: 'Cookies',
    description:
}).save();

module.exports = Recipe;