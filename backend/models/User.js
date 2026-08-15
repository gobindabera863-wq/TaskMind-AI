const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a name'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Please add an email'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please add a valid email']
    },
    password: {
      type: String,
      required: [true, 'Please add a password'],
      minlength: 6,
      select: false
    },
    isVerified: {
      type: Boolean,
      default: true
    },
    avatar: {
      type: String,
      default: ''
    },
    bio: {
      type: String,
      default: ''
    },
    preferences: {
      theme: { type: String, default: 'navy' },
      notificationsEnabled: { type: Boolean, default: true },
      emailAlertsEnabled: { type: Boolean, default: true },
      defaultReminder: { type: String, default: '15-min' },
      aiAutoParse: { type: Boolean, default: true },
      aiAutoBreakdown: { type: Boolean, default: true }
    },
    otp: {
      type: String,
      default: null
    },
    otpExpires: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Encrypt password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Match password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
