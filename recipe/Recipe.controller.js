const RecipeModel = require("./RecipeModel");

class RecipeController {
    async getAllRecipes(req, res) {
        try {
            const recipes = await RecipeModel.find();
            res.status(200).json(recipes);
        } catch (error) {
            res.status(500).json({ message: "Ошибка при получении рецептов", error });
        }
    }

    async getRecipe(req, res) {
        const { slugName } = req.body;
        try {
            const recipe = await RecipeModel.findOne({ slugName });
            if (recipe) {
                res.status(200).json(recipe);
            } else {
                res.status(404).json({ message: "Рецепт не найден" });
            }
        } catch (error) {
            res.status(500).json({ message: "Ошибка при получении рецепта", error });
        }
    }

    async getAllRecipesByCountry(req, res) {
        const { country } = req.body;
        try {
            const recipes = await RecipeModel.find({ country });
            res.status(200).json(recipes);
        } catch (error) {
            res.status(500).json({ message: "Ошибка при получении рецептов по стране", error });
        }
    }

    async getAllRecipesBySeason(req, res) {
        const { season } = req.body;
        try {
            const recipes = await RecipeModel.find({
                season: { $regex: new RegExp(season, 'i') }
            });
            res.status(200).json(recipes);
        } catch (error) {
            res.status(500).json({ message: "Ошибка при получении рецептов по сезону", error });
        }
    }

    async getAllRecipesByCategories(req, res) {
        const { query } = req.body;

        if (!query || query.trim() === "") {
            return res.status(400).json({ message: "Категория не должна быть пустой" });
        }

        try {
            const recipes = await RecipeModel.find({
                category: { $regex: new RegExp(`^${query}$`, 'i') }
            });
            res.status(200).json(recipes);
        } catch (error) {
            console.error("Ошибка при получении рецептов по категории:", error);
            res.status(500).json({ message: "Ошибка при получении рецептов по категории", error: error.message });
        }
    }


    async getAllRecipesByName(req, res) {
        const { name } = req.body;
        try {
            const recipes = await RecipeModel.find({ name: { $regex: name, $options: "i" } });
            res.status(200).json(recipes);
        } catch (error) {
            res.status(500).json({ message: "Ошибка при получении рецептов по названию", error });
        }
    }

    async getAllRecipesByCompound(req, res) {
        const { compound } = req.body;
        try {
            const compoundRegexes = compound.map(ingredient => ({
                "compound.name": { $regex: ingredient, $options: "i" }
            }));
            const recipes = await RecipeModel.find({ $and: compoundRegexes });
            res.status(200).json(recipes);
        } catch (error) {
            res.status(500).json({ message: "Ошибка при получении рецептов по составу", error });
        }
    }

    async getRecipeById(req, res) {
        try {
            const { id } = req.body;

            const recipe = await RecipeModel.findById(id);

            if (!recipe) {
                return res.status(404).json({ message: "Recipe not found" });
            }

            res.status(200).json(recipe);
        } catch (error) {
            console.error("Error fetching recipe:", error);
            res.status(500).json({ message: "Error fetching recipe" });
        }
    }
}

module.exports = new RecipeController();
