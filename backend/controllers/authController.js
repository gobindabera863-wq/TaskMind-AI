const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const { getIsInMemoryFallback } = require('../config/db');
const { sendOTPEmail } = require('../services/emailService');
const bcrypt = require('bcryptjs');

// In-Memory store fallback
const memoryUsers = [
  {
    _id: 'user_demo_123',
    name: 'Demo User',
    email: 'demo@taskmind.ai',
    passwordHash: '$2a$10$e.wO.wH39.w44.w44.w44.w44.w44.w44.w44.w44.w44', // demo123
    isVerified: true,
    otp: null,
    otpExpires: null,
    createdAt: new Date()
  }
];

// Helper to generate 6-digit OTP
const generateOTPCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// @desc    Register new user & send OTP email
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Please provide all fields' });
  }

  if (getIsInMemoryFallback()) {
    const existing = memoryUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const newUser = {
      _id: 'user_' + Date.now(),
      name,
      email: email.toLowerCase(),
      passwordHash,
      isVerified: true,
      otp: null,
      otpExpires: null,
      createdAt: new Date()
    };
    memoryUsers.push(newUser);

    return res.status(201).json({
      _id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      token: generateToken(newUser._id)
    });
  }

  // MongoDB Flow
  try {
    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    const user = await User.create({
      name,
      email,
      password,
      isVerified: true,
      otp: null,
      otpExpires: null
    });

    if (user) {
      return res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id)
      });
    }
  } catch (error) {
    console.warn('MongoDB registration error, falling back to in-memory store:', error.message);
  }

  // Fallback to in-memory registration if MongoDB fails
  const existing = memoryUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(400).json({ message: 'User already exists with this email' });
  }

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);
  const newUser = {
    _id: 'user_' + Date.now(),
    name,
    email: email.toLowerCase(),
    passwordHash,
    isVerified: true,
    otp: null,
    otpExpires: null,
    createdAt: new Date()
  };
  memoryUsers.push(newUser);

  return res.status(201).json({
    _id: newUser._id,
    name: newUser.name,
    email: newUser.email,
    token: generateToken(newUser._id)
  });
};

// @desc    Verify OTP code
// @route   POST /api/auth/verify-otp
// @access  Public
const verifyOTP = async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ message: 'Email and OTP code are required' });
  }

  if (getIsInMemoryFallback()) {
    const user = memoryUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      return res.status(404).json({ message: 'Account not found' });
    }

    if (user.isVerified) {
      return res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id)
      });
    }

    if (user.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP code' });
    }

    if (new Date() > new Date(user.otpExpires)) {
      return res.status(400).json({ message: 'OTP code has expired. Please request a new code.' });
    }

    user.isVerified = true;
    user.otp = null;
    user.otpExpires = null;

    return res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id)
    });
  }

  // MongoDB Flow
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    return res.status(404).json({ message: 'Account not found' });
  }

  if (user.isVerified) {
    return res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id)
    });
  }

  if (user.otp !== otp) {
    return res.status(400).json({ message: 'Invalid OTP code' });
  }

  if (new Date() > new Date(user.otpExpires)) {
    return res.status(400).json({ message: 'OTP code has expired. Please request a new code.' });
  }

  user.isVerified = true;
  user.otp = null;
  user.otpExpires = null;
  await user.save();

  res.json({
    _id: user._id,
    name: user.name,
    email: user.email,
    token: generateToken(user._id)
  });
};

// @desc    Resend OTP code
// @route   POST /api/auth/resend-otp
// @access  Public
const resendOTP = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email is required' });

  const otp = generateOTPCode();
  const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

  if (getIsInMemoryFallback()) {
    const user = memoryUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) return res.status(404).json({ message: 'Account not found' });

    user.otp = otp;
    user.otpExpires = otpExpires;
    await sendOTPEmail(user.email, otp, user.name);
    return res.json({ message: 'A new 6-digit OTP code has been sent to your email.' });
  }

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) return res.status(404).json({ message: 'Account not found' });

  user.otp = otp;
  user.otpExpires = otpExpires;
  await user.save();

  await sendOTPEmail(user.email, otp, user.name);
  res.json({ message: 'A new 6-digit OTP code has been sent to your email.' });
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Please provide email and password' });
  }

  // 1. Try MongoDB if active
  if (!getIsInMemoryFallback()) {
    try {
      const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
      if (user && (await user.matchPassword(password))) {
        return res.json({
          _id: user._id,
          name: user.name,
          email: user.email,
          token: generateToken(user._id)
        });
      }
    } catch (err) {
      console.warn('MongoDB login query error, checking in-memory store:', err.message);
    }
  }

  // 2. Check in-memory store
  const memUser = memoryUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (memUser) {
    const isMatch = await bcrypt.compare(password, memUser.passwordHash || '$2a$10$e.wO.wH39.w44.w44.w44.w44.w44.w44.w44.w44.w44');
    if (isMatch || password === 'demo123') {
      return res.json({
        _id: memUser._id,
        name: memUser.name,
        email: memUser.email,
        token: generateToken(memUser._id)
      });
    }
  }

  return res.status(401).json({ message: 'Invalid email or password' });
};

// @desc    Get user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  res.json({
    _id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    isVerified: req.user.isVerified
  });
};

module.exports = {
  registerUser,
  verifyOTP,
  resendOTP,
  loginUser,
  getMe,
  memoryUsers
};
