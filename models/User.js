const { Schema, model} = require('mongoose');

const User = new Schema({
    username: {type: String, unique: true , required: true},
    password: {type: String, required: true},
    roles: [{type: String, ref: 'Role'}],
    description: {type: String},
    recipes: [{type: String, ref: 'Recipe'}],
    git: {type: String},
})

module.exports = model('User', User);
