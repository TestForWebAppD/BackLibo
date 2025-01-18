const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const { secret } = require('../config');
const User = require('../models/User');
const Recipe = require('../recipe/RecipeModel');
const crypto = require("crypto");
const Role = require("../models/Role");

const generateAccessToken = (id, roles) => {
    const payload = { id, roles };
    return jwt.sign(payload, secret, { expiresIn: '24h' });
};

class authAdminController {
    async githubCallback(req, res) {
        try {
            const user = req.user;
            const username = user.username;

            let existingUser = await User.findOne({ username });

            if (!existingUser) {
                const randomPassword = crypto.randomBytes(8).toString('hex');
                const hashedPassword = bcrypt.hashSync(randomPassword, 8);

                const userRole = await Role.findOne({ value: "USER" });
                if (!userRole) {
                    return res.status(400).json({ message: 'Role "USER" not found' });
                }

                if (!user.roles.includes('ADMIN')) {
                    return res.status(403).json({ message: 'Access denied. Not an admin.' });
                }

                existingUser = new User({
                    username: username,
                    password: hashedPassword,
                    roles: [userRole.value],
                    git: 'git',
                });
                await existingUser.save();
            }

            const userId = existingUser._id;
            const userRoles = existingUser.roles;

            const token = generateAccessToken(userId, userRoles);

            res.redirect(`http://217.114.10.30:3000/login?token=${token}&name=${username}`);
        } catch (e) {
            console.error(e);
            res.status(500).json({ message: 'GitHub Login Error' });
        }
    }

    async login(req, res) {
        try {
            const { username, password } = req.body;

            const user = await User.findOne({ username });
            if (!user) {
                return res.status(404).json({ message: 'Invalid password or login' });
            }

            if (!user.roles.includes('ADMIN')) {
                return res.status(403).json({ message: 'Access denied. Not an admin.' });
            }

            const isPasswordValid = bcrypt.compareSync(password, user.password);
            if (!isPasswordValid) {
                return res.status(401).json({ message: 'Invalid password or login' });
            }

            const token = generateAccessToken(user._id, user.roles);
            return res.status(200).json({ token });
        } catch (e) {
            console.error('Login error:', e);
            return res.status(500).json({ message: 'Login error' });
        }
    }

    async getProfile(req, res) {
        try {
            const userId = req.user.id;
            const user = await User.findById(userId).select('-password');
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            res.status(200).json(user);
        } catch (e) {
            console.error('Error fetching profile:', e);
            res.status(500).json({ message: 'Error fetching profile' });
        }
    }

    async getAllUsers(req, res) {
        try {
            const users = await User.find();

            res.status(200).json(users);
        } catch (error) {
            console.error("Error fetching users:", error);
            res.status(500).json({ error: "Error fetching users" });
        }
    }

    async deleteUser (req, res) {
        try {
            const { userId } = req.body;

            const deletedUser = await User.findOneAndDelete({ username: userId });

            if (!deletedUser) {
                return res.status(404).json({ message: 'Пользователь не найден' });
            }

            res.status(200).json({ message: 'Пользователь удалён' });
        } catch (error) {
            console.error('Ошибка при удалении пользователя:', error);
            res.status(500).json({ message: 'Ошибка сервера при удалении пользователя' });
        }
    }

    async addRecipe(req, res) {
        try {
            const { name, description, category, cooking } = req.body;
            if (!name || !description || !category || !cooking) {
                return res.status(400).json({ message: 'Missing required fields' });
            }

            const newRecipe = new Recipe({
                ...req.body,
                cook: req.user.id,
            });

            const savedRecipe = await newRecipe.save();
            res.status(201).json({ message: 'Recipe added successfully', recipe: savedRecipe });
        } catch (e) {
            console.error('Error adding recipe:', e);
            res.status(500).json({ message: 'Error adding recipe' });
        }
    }

    async deleteRecipe(req, res) {
        try {
            const { slugName } = req.body;

            if (!slugName) {
                return res.status(400).json({ message: 'Missing slugName' });
            }

            const recipe = await Recipe.findOneAndDelete({ slugName });

            if (!recipe) {
                return res.status(404).json({ message: 'Recipe not found' });
            }

            res.status(200).json({ message: 'Recipe deleted successfully' });
        } catch (error) {
            console.error('Error deleting recipe:', error.message || error);
            res.status(500).json({ message: 'Error deleting recipe' });
        }
    }

    async updateRecipeField(req, res) {
        try {
            const { recipeId, fieldName, value } = req.body;

            if (!recipeId || !fieldName || value === undefined) {
                return res.status(400).json({ message: 'Missing required fields' });
            }

            const allowedFields = [
                'name',
                'description',
                'category',
                'season',
                'difficult',
                'time',
                'portion',
                'country',
                'kcal',
                'veget',
                'lightness',
                'meal',
            ];

            if (!allowedFields.includes(fieldName)) {
                return res.status(400).json({ message: `Field ${fieldName} cannot be updated` });
            }

            const recipe = await Recipe.findOne({ slugName: recipeId });

            if (!recipe) {
                return res.status(404).json({ message: 'Recipe not found' });
            }

            recipe[fieldName] = value;
            await recipe.save();

            res.status(200).json({ message: `${fieldName} updated successfully`, recipe });
        } catch (error) {
            console.error('Error updating recipe:', error.message || error);
            res.status(500).json({ message: 'Error updating recipe field' });
        }
    }


    async updateCompound(req, res) {
        try {
            const { recipeId, compound } = req.body;

            if (!recipeId || !Array.isArray(compound)) {
                return res.status(400).json({ message: 'Invalid compound data' });
            }

            const recipe = await Recipe.findById(recipeId);
            if (!recipe) {
                return res.status(404).json({ message: 'Recipe not found' });
            }

            recipe.compound = compound;
            await recipe.save();

            res.status(200).json({ message: 'Compound updated successfully', recipe });
        } catch (error) {
            console.error('Error updating compound:', error);
            res.status(500).json({ message: 'Error updating compound' });
        }
    }

    async updateCooking(req, res) {
        try {
            const { recipeId, cooking } = req.body;

            if (!recipeId || !Array.isArray(cooking)) {
                return res.status(400).json({ message: 'Invalid cooking data' });
            }

            const recipe = await Recipe.findById(recipeId);
            if (!recipe) {
                return res.status(404).json({ message: 'Recipe not found' });
            }

            recipe.cooking = cooking;
            await recipe.save();

            res.status(200).json({ message: 'Cooking updated successfully', recipe });
        } catch (error) {
            console.error('Error updating cooking:', error);
            res.status(500).json({ message: 'Error updating cooking' });
        }
    }

    async updateStory(req, res) {
        try {
            const { recipeId, story } = req.body;

            if (!recipeId || !Array.isArray(story)) {
                return res.status(400).json({ message: 'Invalid story data' });
            }

            const recipe = await Recipe.findById(recipeId);
            if (!recipe) {
                return res.status(404).json({ message: 'Recipe not found' });
            }

            recipe.story = story;
            await recipe.save();

            res.status(200).json({ message: 'Story updated successfully', recipe });
        } catch (error) {
            console.error('Error updating story:', error);
            res.status(500).json({ message: 'Error updating story' });
        }
    }
}

module.exports = new authAdminController();
