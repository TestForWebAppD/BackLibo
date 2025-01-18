const Router = require('express');
const passport = require('passport');
const router = new Router();
const controller = require('./authController');
const { check } = require('express-validator');
const authMiddleware = require('../middleware/authMiddleWare');

router.get('/validate-token', authMiddleware, (req, res) => {
    res.status(200).json({ valid: true });
});

router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));

router.get(
    '/github/callback',
    passport.authenticate('github', { failureRedirect: '/login' }),
    controller.githubCallback
);

router.get('/profile', authMiddleware, controller.getProfile);
router.post('/registration', [
    check('username', 'username must not be empty').notEmpty(),
    check('password', 'password must not be empty').isLength({ min: 8, max: 64 }),
], controller.registration);
router.post('/login', controller.login);
router.post('/addRecipe', authMiddleware, controller.addRecipe);
router.post('/deleteRecipe', authMiddleware, controller.deleteRecipe);

module.exports = router;
