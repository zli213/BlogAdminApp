const bcrypt = require('bcrypt')
const passport = require('passport')
const LocalStrategy = require('passport-local')
const userDao = require('../modules/user-dao')


passport.use(new LocalStrategy(async function verify(username, password, cb) {
    try {
      const user = await userDao.getUser(username);
      if (!user) {
        return cb(null, false, { message: 'Incorrect username or password.' });
      }
  
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return cb(null, false, { message: 'Incorrect username or password.' });
      }
  
      return cb(null, user);
    } catch (err) {
      return cb(err);
    }
}));

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});
  

module.exports = passport