const express = require('express');
const session = require('express-session');
const passport = require('./config/passport');
const authRoutes = require('./controllers/authController');
require('dotenv').config();

const app = express();

// Middlewares
app.use(express.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

// ✅ Mount Auth routes
app.use('/auth', authRoutes);

app.listen(5000, () => console.log('Server running on http://localhost:5000'));
