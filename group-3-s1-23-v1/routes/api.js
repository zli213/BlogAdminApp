const express = require("express");
const multer = require("multer");
const path = require('path');
const upload = multer({
    dest: path.join(__dirname, "/../temp")
});
const fs = require("fs");
const passport = require('../middleware/passport');
const userDao = require('../modules/user-dao');
const { ensureAuthenticated, ensureAdmin } = require('../middleware/auth-middleware');
const router = express.Router();

router.get('/usernames', async (req, res) => {
    res.json(await userDao.getAllUsernames())
})

router.post('/addimage', upload.single("imageUpload"), async (req, res) => {
    try {
        const fileInfo = req.file;
        // Move the file somewhere more sensible
        const oldFileName = fileInfo.path;
        const newFileName = `./public/images/uploads/${fileInfo.originalname}`;
        fs.renameSync(oldFileName, newFileName);
        res.json(`/images/uploads/${fileInfo.originalname}`);
    } catch (error) {
        console.error(error)
        res.status(500).send(new Error('Error uploading and saving image'))
    }
})

router.post('/login', (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) {
            return next(err);
        }
        if (!user) {
            return res.status(401).send('Failed to login');
        }
        req.login(user, (err) => {
            if (err) {
                // Handle error
                return next(err);
            }
            return res.status(204).json({ 'user': user });
        });
    })(req, res, next);
});

router.get('/logout', ensureAuthenticated, (req, res) => {
    req.logout((err) => {
        if (err) { return next(err); }
        res.status(204).send('Successfully logged out');
    });
})

router.get('/users', ensureAdmin, async (req, res) => {
    try {
        const users = await userDao.getAllUsers();
        res.json({ users })
    } catch (error) {
        res.status(401).send('Failed to get users')
        console.error('/api/users', error)
    }
})

router.delete('/users/:id', ensureAdmin, async (req, res) => {
    try {
        const isDeleted = await userDao.deleteUserAccount(req.params.id)
        if (isDeleted) {
            res.status(204).send('User successfully deleted')
        } else {
            res.status(401).send('Failed to delete user')
        }
    } catch (error) {
        res.status(401).send('Failed to delete user')
        console.error('delete /users/:id', error)
    }
})

module.exports = router