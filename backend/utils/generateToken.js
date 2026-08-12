const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'taskmind_ai_super_secret_jwt_key_2026_production', {
    expiresIn: '30d'
  });
};

module.exports = generateToken;
