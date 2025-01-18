const mongoose = require('mongoose');
const RecipeModel = require('./recipe/RecipeModel');

mongoose.connect('mongodb+srv://admin:ZxcGul1000minus7@cluster0.r7acfi5.mongodb.net/web?retryWrites=true&w=majority&appName=Cluster0', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('DB connected');
    convertWeightsToString();
}).catch((err) => console.log('DB connection error: ' + err));

const convertWeightsToString = async () => {
    try {
        const recipes = await RecipeModel.find();

        for (let recipe of recipes) {
            recipe.compound = recipe.compound.map(item => ({
                ...item,
                weight: isNaN(Number(item.weight)) ? item.weight : String(Number(item.weight)),
            }));

            await recipe.save();
            console.log(`Updated recipe ${recipe.name}`);
        }

        console.log('All recipes have been updated.');
    } catch (err) {
        console.error('Error converting weights:', err);
    } finally {
        mongoose.disconnect();
    }
};
