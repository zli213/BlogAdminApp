function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return next()
    }
  
    res.redirect('/signin');
}

function ensureAdmin(req, res, next) {
    if (req.isAuthenticated() && req.user.admin) {
      return next();
    }
  
    res.status(401).send('Not authenticated for that action');
}

  
module.exports = {
    ensureAuthenticated,
    ensureAdmin
};