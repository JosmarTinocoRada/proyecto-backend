const passport = require('passport');

// Middleware para verificar que el usuario esté autenticado
const isAuthenticated = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user) => {
    if (err || !user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    req.user = user; // Adjunta el usuario autenticado al objeto req
    next();
  })(req, res, next);
};

// Middleware para verificar si el rol del usuario es 'admin'
const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Forbidden: You do not have admin privileges' });
  }
  next();
};

// Middleware para verificar si el rol del usuario es 'user'
const isUser = (req, res, next) => {
  if (req.user.role !== 'user') {
    return res.status(403).json({ message: 'Forbidden: You do not have user privileges' });
  }
  next();
};

module.exports = {
  isAuthenticated,
  isAdmin,
  isUser,
};
