/**
 * Main application file.
 *
 * NOTE: This file contains many required packages, but not all of them - you may need to add more!
 */

// Setup Express
const express = require('express');
const app = express();
const port = 3000;

// Make the "public" folder available statically
const path = require('path');
app.use(express.static(path.join(__dirname, 'public')));

// Session middleware
const session = require('express-session');
require('dotenv').config();

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

// Passport initialization middleware
const passport = require('./middleware/passport');
app.use(passport.initialize());
app.use(passport.session());

// Setup Handlebars

const handlebars = require('express-handlebars');
const helpers = require('./helper');  //handlebar helper
app.engine(
  'handlebars',
  handlebars({
    defaultLayout: 'main',
    partialsDir: path.join(__dirname, 'views/partials/'),
    helpers: helpers, // Register the helper functions
  })
);
app.set('view engine', 'handlebars');



// Setup body-parser
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Setup cookie-parser
const cookieParser = require('cookie-parser');
app.use(cookieParser());

// Use the toaster middleware
app.use(require('./middleware/toaster-middleware.js'));

// Setup routes
app.use(require("./routes/application-routes.js"));
const articleRoutes = require('./routes/article.js');
app.use('/', articleRoutes);

// Middleware to handle 404 errors
app.use((req, res, next) => {
    res.status(404).render('404');
});

// Middleware to handle 500 errors
app.use((err, req, res, next) => {
  console.error(err);
  res.locals.baseUrl = `${req.protocol}://${req.get('host')}`;
  res.locals.message = 'Did someone pull out a cable?';
  res.status(500).render('500');
});

// Start the server running.
app.listen(port, function () {
  console.log(`App listening on port ${port}!`);
});
