const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const RecipeSchema = new Schema({
    name: String,
    description: String,
    category: String,
    season: String,
    compound: [{ name: String, weight: String }],
    cooking: [{ step: Number, stepDescription: String }],
    img: String,
    difficult: String,
    time: String,
    portion: Number,
    country: String,
    kcal: String,
    veget: Boolean,
    lightness: String,
    meal: String,
    story: [{ year: String, history: String }],
    slugName: String,
    cook: { type: Schema.Types.ObjectId, ref: 'User' },
});

const RecipeModel = mongoose.model('Recipe', RecipeSchema);

module.exports = RecipeModel;
