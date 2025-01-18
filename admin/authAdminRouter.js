const Router = require('express');
const router = new Router();
const controller = require('./authAdminController');
const authMiddleware = require('../middleware/authMiddleWare');
const adminMiddleware = require('../middleware/authAdminMiddleware');
const passport = require("passport");

router.get('/profile', authMiddleware, adminMiddleware, controller.getProfile);

router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));

router.get(
    '/github/callback',
    passport.authenticate('github', { failureRedirect: '/login' }),
    controller.githubCallback
);

router.post('/login', controller.login);

router.post('/addRecipe', authMiddleware, adminMiddleware, controller.addRecipe);
router.delete('/deleteRecipe', authMiddleware, adminMiddleware, controller.deleteRecipe);

router.get('/getAllUsers', controller.getAllUsers);
router.delete('/deleteUser', controller.deleteUser);

router.post('/recipe/update-field', authMiddleware, adminMiddleware, controller.updateRecipeField);
router.post('/recipe/update-compound', authMiddleware, adminMiddleware, controller.updateCompound);
router.post('/recipe/update-cooking', authMiddleware, adminMiddleware, controller.updateCooking);
router.post('/recipe/update-story', authMiddleware, adminMiddleware, controller.updateStory);

module.exports = router;
