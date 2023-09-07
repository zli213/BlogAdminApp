const express = require('express');
const multer = require('multer');
const passport = require('../middleware/passport');
const userDao = require('../modules/user-dao');
const router = express.Router();
const upload = multer();

router.put('/update', upload.none(), async (req, res) => {
  try {
    const updatedUser = await userDao.editUserAccount(req.body, req.user);
    if (updatedUser) {
      req.session.passport.user = updatedUser;
      await req.session.save((err) => {
        if (err) {
          return next(err);
        }
      });
      res.json({ success: true });
    } else {
      res.json({ success: false });
      console.error('Failed to edit account for some unknown reason');
    }
  } catch (error) {
    console.error('/editAccount/update', error);
    res.json({ success: false });
  }
});

router.delete('/delete', async (req, res) => {
  try {
    const result = await userDao.deleteUserAccount(req.user.id);
    if (result) {
      req.logout((err) => {
        if (err) {
          return next(err);
        }
      });
      res.json({ success: true });
    } else {
      console.error('Failed to delete account for some unknown reason');
      res.json({ success: false });
    }
  } catch (error) {
    console.error('/editAccount/delete', error);
    res.json({ success: false });
  }
});

module.exports = router;
