const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { getIsInMemoryFallback } = require('../config/db');
const { memoryUsers } = require('../controllers/authController');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'taskmind_ai_super_secret_jwt_key_2026_production');

      let user = null;

      if (!getIsInMemoryFallback() && decoded.id && /^[0-9a-fA-F]{24}$/.test(decoded.id)) {
        try {
          user = await User.findById(decoded.id).select('-password');
        } catch (err) {
          console.warn('MongoDB User.findById lookup failed:', err.message);
        }
      }

      if (!user) {
        user = memoryUsers.find(u => u._id.toString() === decoded.id.toString());
      }

      if (!user) {
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }

      req.user = user;
      return next();
    } catch (error) {
      console.error('Auth middleware error:', error.message);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token provided' });
  }
};

module.exports = { protect };
