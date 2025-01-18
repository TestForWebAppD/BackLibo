const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const compression = require('compression');
const session = require('express-session');
const passport = require('./config/passport');

const authRouter = require('./auth/authRouter');
const recipeRouter = require('./recipe/Recipe.router');
const adminRouter = require('./admin/authAdminRouter');

const PORT = 5000;

const app = express();

app.use(cors());
app.use(compression());
app.use(express.json());

mongoose
    .connect('mongodb+srv://admin:ZxcGul1000minus7@cluster0.r7acfi5.mongodb.net/web?retryWrites=true&w=majority&appName=Cluster0')
    .then(() => {
        console.log('DB OK');
    })
    .catch((err) => console.log('DB error: ' + err));

app.use(
    session({
        secret: 'd14bc55ce44f382387238d72f21fd709add39645',
        resave: false,
        saveUninitialized: true,
    })
);

app.use(passport.initialize());
app.use(passport.session());

app.use('/auth', authRouter);
app.use('/auth/admin', adminRouter);
app.use('/recipes', recipeRouter);
app.use('/uploads', express.static('uploads'));

app.listen(PORT, () => console.log(`Server run on port ${PORT}!`));
