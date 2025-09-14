import { Schema, model } from 'mongoose';
import pkg from 'bcryptjs';
const { hash, compare } = pkg;
import jwt from 'jsonwebtoken';
import config from '../config/auth.config.js';

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please enter a valid email',
      ],
    },
    password: {
      type: String,
      required: function () {
        return !this.googleId && !this.facebookId;
      },
      minlength: 8,
      select: false, // Exclude password from queries by default
    },
    phone: {
      type: String,
      trim: true,
      match: [/^\+?[\d\s\-\(\)]+$/, 'Please enter a valid phone number'],
    },
    location: {
      type: String,
      trim: true,
      maxlength: 200,
    },
    avatar: {
      type: String,
      default: null,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalTrades: {
      type: Number,
      default: 0,
      min: 0,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    authProvider: {
      type: String,
      enum: ['local', 'google', 'facebook'],
      default: 'local',
    },
    googleId: {
      type: String,
      sparse: true,
      unique: true,
    },
    facebookId: {
      type: String,
      sparse: true,
      unique: true,
    },
    joinDate: {
      type: Date,
      default: Date.now,
    },
    lastLogin: {
      type: Date,
      default: Date.now,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    emailVerifiedAt: {
      type: Date,
      default: null,
    },
    // Legacy field - keeping for backward compatibility
    emailVerificationToken: {
      type: String,
      default: null,
      select: false, // Hide from normal queries
    },
    // New dual verification system fields
    verificationToken: {
      type: String,
      sparse: true,
      select: false, // Hide from normal queries for security
    },
    verificationCode: {
      type: String,
      sparse: true,
      select: false, // Hide from normal queries for security
    },
    verificationCodeExpires: {
      type: Date,
      sparse: true,
      select: false, // Hide from normal queries
    },
    // Password reset fields
    passwordResetToken: {
      type: String,
      default: null,
      select: false, // Hide from normal queries for security
    },
    passwordResetExpires: {
      type: Date,
      default: null,
      select: false, // Hide from normal queries
    },
    passwordChangedAt: {
      type: Date,
      default: null,
    },
    // Rate limiting fields
    loginAttempts: {
      type: Number,
      default: 0,
      select: false, // Don't include in normal queries
    },
    lockUntil: {
      type: Date,
      select: false, // Don't include in normal queries
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        delete ret.password;
        delete ret.emailVerificationToken;
        delete ret.verificationToken;
        delete ret.verificationCode;
        delete ret.verificationCodeExpires;
        delete ret.passwordResetToken;
        delete ret.passwordResetExpires;
        delete ret.loginAttempts;
        delete ret.lockUntil;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Indexes for performance
userSchema.index({ email: 1 });
userSchema.index({ googleId: 1 });
userSchema.index({ facebookId: 1 });
userSchema.index({ lockUntil: 1 });
userSchema.index({ verified: 1 });
userSchema.index({ isActive: 1 });
// New indexes for verification system
userSchema.index({ verificationCode: 1 }, { sparse: true });
userSchema.index({ verificationCodeExpires: 1 }, { sparse: true });
userSchema.index({ verificationToken: 1 }, { sparse: true });

// Pre-save middleware to hash password using config
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    // Use salt rounds from config
    this.password = await hash(this.password, config.security.saltRounds);

    // Update password change timestamp
    if (!this.isNew) {
      this.passwordChangedAt = new Date();
    }

    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) return false;
  return compare(candidatePassword, this.password);
};

// Method to generate auth token using config
userSchema.methods.generateAuthToken = function () {
  return jwt.sign(
    {
      id: this._id.toString(),
      email: this.email,
      verified: this.verified,
    },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn }
  );
};

// Method to check if verification code is valid and not expired
userSchema.methods.isVerificationCodeValid = function (code) {
  return (
    this.verificationCode === code &&
    this.verificationCodeExpires &&
    this.verificationCodeExpires > new Date()
  );
};

// Method to clear all verification data
userSchema.methods.clearVerificationData = function () {
  this.verificationCode = undefined;
  this.verificationCodeExpires = undefined;
  this.verificationToken = undefined;
  this.emailVerificationToken = undefined; // Clear legacy field too
};

// Static method to find user by verification code
userSchema.statics.findByVerificationCode = function (code) {
  return this.findOne({
    verificationCode: code,
    verificationCodeExpires: { $gt: new Date() },
  });
};

// Static method to cleanup expired verification codes (for maintenance)
userSchema.statics.cleanupExpiredVerifications = function () {
  return this.updateMany(
    { verificationCodeExpires: { $lt: new Date() } },
    {
      $unset: {
        verificationCode: 1,
        verificationCodeExpires: 1,
        verificationToken: 1,
      },
    }
  );
};

export default model('User', userSchema);
