const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const { secret } = require('../config');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const User = require('../models/User');
const Recipe = require('../recipe/RecipeModel');
const Role = require('../models/Role');

const generateAccessToken = (id, roles) => {
    const payload = {
        id,
        roles,
    }
    return jwt.sign(payload, secret, {expiresIn: '24h'});
}

class authController {
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

            res.redirect(`http://localhost:3000/login?token=${token}&name=${username}`);
        } catch (e) {
            console.error(e);
            res.status(500).json({ message: 'GitHub Login Error' });
        }
    }

    async registration(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ message: "username must not be empty" });
            }

            const { username, password } = req.body;

            const candidate = await User.findOne({ username });
            if (candidate) {
                return res.status(400).json({ message: 'User already exists' });
            }

            const hashPassword = bcrypt.hashSync(password, 8);

            const userRole = await Role.findOne({ value: "USER" });
            if (!userRole) {
                return res.status(400).json({ message: 'Role "USER" not found' });
            }

            const user = new User({ username, password: hashPassword, roles: [userRole.value] });
            await user.save();
            return res.json({ message: 'Registration successfully' });
        } catch (e) {
            console.log(e);
            res.status(400).json({ message: 'Registration error' });
        }
    }

    async login(req, res) {
        try{
            const { username, password } = req.body;
            const user = await User.findOne({ username });
            if(!user){
                return res.status(400).json({message: 'Password or login not correct'});
            }
            const validatePassword = await bcrypt.compareSync(password, user.password);
            if(!validatePassword){
                return res.status(400).json({message: 'Password or login not correct'});
            }
            const token = generateAccessToken(user._id, user.roles);
            return res.json({token});
        } catch (e) {
            console.log(e);
            res.status(400).json({message: 'Login error'});
        }
    }

    async getProfile(req, res) {
        try {
            const userId = req.user.id;
            const user = await User.findById(userId).select('-password');
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            res.json(user);
        } catch (e) {
            console.log(e);
            res.status(400).json({ message: 'Error fetching profile' });
        }
    }

    async addRecipe(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ message: "Validation error in recipe" });
            }

            const token = req.headers.authorization.split(' ')[1];
            const decodedData = jwt.verify(token, secret);
            const userId = decodedData.id;

            const {
                name, description, category, season,
                compound, cooking, difficult, time,
                portion, country, kcal, veget,
                lightness, meal, story, slugName
            } = req.body;

            let imagePath = req.body.img;
            if (req.file) {
                imagePath = req.file.path;
            }

            const newRecipe = new Recipe({
                name, description, category, season,
                compound, cooking, difficult, time,
                portion, country, kcal, veget,
                lightness, meal, story, slugName,
                img: imagePath, cook: userId,
            });

            const savedRecipe = await newRecipe.save();

            if (req.file) {
                const recipeDir = path.join(__dirname, 'uploads', 'recipes', savedRecipe._id.toString());
                fs.mkdirSync(recipeDir, { recursive: true });

                const oldPath = req.file.path;
                const newPath = path.join(recipeDir, req.file.filename);
                fs.renameSync(oldPath, newPath);
            }

            const user = await User.findById(userId);
            user.recipes.push(savedRecipe._id);
            await user.save();

            res.status(201).json({ message: "Recipe successfully added", recipe: savedRecipe });
        } catch (error) {
            console.error("Error creating recipe:", error);
            res.status(500).json({ message: "Error creating recipe" });
        }
    }

    async deleteRecipe(req, res) {
        try {
            const { id } = req.body;

            const deletedRecipe = await Recipe.findByIdAndDelete(id);

            if (!deletedRecipe) return res.status(404).json({ message: "Recipe not found" });

            const user = await User.findById(deletedRecipe.cook);
            if (user) {
                user.recipes = user.recipes.filter(recipeId => recipeId.toString() !== id);
                await user.save();
            }

            res.status(200).json({ message: "Recipe successfully deleted and removed from user" });
        } catch (error) {
            console.error("Error deleting recipe:", error);
            res.status(500).json({ message: "Error deleting recipe" });
        }
    }
}

module.exports = new authController();
