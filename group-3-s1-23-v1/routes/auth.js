const express = require("express");
const passport = require('../middleware/passport');
const userDao = require('../modules/user-dao');
const router = express.Router();

router.post('/signin', (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) {
            return next(err);
        }
        if (!user) {
            return res.redirect('/signin?error=' + encodeURIComponent(info.message));
        }
        req.login(user, (err) => {
            if (err) {
                // Handle error
                return next(err);
            }
                return res.redirect('/userbrowsing');
        });
    })(req, res, next);
});

router.post('/signup', async (req, res) => {
    try {
        const userId = await userDao.createUser(req.body);
        if (userId) {
            res.redirect('/signupsuccess');
        } else {
            console.error('/auth/signup no userId returned: failed to register user for some unknown reason')
            res.locals.baseUrl = `${req.protocol}://${req.get('host')}`;
            res.locals.message = 'Failed to register user.';
            res.render('500');
        }
    } catch (error) {
        console.error('/auth/signup error during signup \n', error)
        res.locals.baseUrl = `${req.protocol}://${req.get('host')}`;
        res.locals.message = 'An error occurred during registration.';
        res.render('500');
    }
})

module.exports = router