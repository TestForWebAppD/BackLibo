const mongoose = require('mongoose');
const slugify = require('slugify');
const RecipeModel = require('./recipe/RecipeModel');

mongoose.connect('mongodb+srv://admin:ZxcGul1000minus7@cluster0.r7acfi5.mongodb.net/web?retryWrites=true&w=majority&appName=Cluster0', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('DB connected');
    generateSlugs();
}).catch((err) => console.log('DB connection error: ' + err));

const generateSlugs = async () => {
    try {
        const recipes = await RecipeModel.find();

        for (let recipe of recipes) {
            if (!recipe.slugName) {
                let baseSlug = slugify(recipe.name, { lower: true });

                let uniqueSlug = slugify(`${recipe.category}-${recipe.country}-${recipe.name}`, { lower: true });

                let existingRecipe = await RecipeModel.findOne({ slugName: uniqueSlug });

                if (existingRecipe) {
                    const uniqueId = new mongoose.Types.ObjectId().toString().slice(-5);
                    uniqueSlug = slugify(`${recipe.category}-${recipe.country}-${recipe.name}-${uniqueId}`, { lower: true });
                }

                recipe.slugName = uniqueSlug;
                await recipe.save();
                console.log(`Updated recipe ${recipe.name} with slug ${recipe.slugName}`);
            }
        }

        console.log('All recipes have been updated with slugs.');
    } catch (err) {
        console.error('Error generating slugs:', err);
    } finally {
        mongoose.disconnect();
    }
};
