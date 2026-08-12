const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const { registerUser, verifyOTP, resendOTP, loginUser, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validateMiddleware');

router.post(
  '/register',
  [
    check('name', 'Name is required').notEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password must be at least 6 characters long').isLength({ min: 6 }),
    validate
  ],
  registerUser
);

router.post(
  '/verify-otp',
  [
    check('email', 'Please include a valid email').isEmail(),
    check('otp', 'OTP code is required').notEmpty(),
    validate
  ],
  verifyOTP
);

router.post(
  '/resend-otp',
  [
    check('email', 'Please include a valid email').isEmail(),
    validate
  ],
  resendOTP
);

router.post(
  '/login',
  [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists(),
    validate
  ],
  loginUser
);

router.get('/me', protect, getMe);

module.exports = router;
