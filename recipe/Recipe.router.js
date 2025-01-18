const Router = require('express');
const router = new Router();
const controller = require('./Recipe.controller');

router.get('/allRecipes', controller.getAllRecipes);

router.post('/recipesById', controller.getRecipeById);
router.post('/Recipe', controller.getRecipe);
router.post('/allRecipesByCountry', controller.getAllRecipesByCountry);
router.post('/allRecipesBySeason', controller.getAllRecipesBySeason);
router.post('/allRecipesByCategories', controller.getAllRecipesByCategories);
router.post('/allRecipesByName', controller.getAllRecipesByName);
router.post('/allRecipesByCompound', controller.getAllRecipesByCompound);

module.exports = router;
