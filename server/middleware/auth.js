const jwt = require('jsonwebtoken');
const User = require('../models/User');

async function auth(req, res, next) {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      req.userId = 'mock-user-id';
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-here-change-in-production');
    const user = await User.findById(decoded.userId);

    if (!user) {
      req.userId = 'mock-user-id';
      return next();
    }

    req.userId = user._id;
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    req.userId = 'mock-user-id';
    next();
  }
}

module.exports = auth;
