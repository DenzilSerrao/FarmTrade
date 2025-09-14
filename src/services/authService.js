import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import config from '../config/auth.config.js';
import emailService from './emailService.js';

class AuthService {
  // Generate JWT token
  generateToken(user) {
    return jwt.sign(
      {
        id: user._id,
        email: user.email,
        verified: user.verified,
      },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );
  }

  // Generate email verification token
  generateVerificationToken(user) {
    return jwt.sign(
      {
        userId: user._id,
        email: user.email,
        type: 'email_verification',
      },
      config.jwt.secret,
      { expiresIn: '24h' }
    );
  }

  // Generate 5-digit verification code
  generateVerificationCode() {
    return Math.floor(10000 + Math.random() * 90000).toString();
  }

  // Register new user
  // Register new user - SUPER DETAILED DEBUG
  async register(userData) {
    try {
      const { name, email, password } = userData;

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        throw new Error('User with this email already exists');
      }

      console.log('=== REGISTRATION DEBUG ===');
      console.log('Original password:', password);
      console.log('Salt rounds from config:', config.security.saltRounds);

      // Hash password using config
      const hashedPassword = await bcrypt.hash(
        password,
        config.security.saltRounds
      );

      console.log('Hashed password:', hashedPassword);

      // Test the hash immediately
      const immediateTest = await bcrypt.compare(password, hashedPassword);
      console.log('Immediate hash test:', immediateTest);

      // Generate verification code and token
      const verificationCode = this.generateVerificationCode();
      const verificationToken = this.generateVerificationToken({
        _id: 'temp',
        email,
      });

      console.log('About to create user object...');

      // Create user object (but don't save yet)
      const user = new User({
        name,
        email,
        password: hashedPassword,
        verified: false,
        authProvider: 'local',
        verificationCode,
        verificationCodeExpires: new Date(Date.now() + 24 * 60 * 60 * 1000),
        verificationToken,
      });

      console.log('User object created, password field:', user.password);
      console.log(
        'Password still matches hash:',
        user.password === hashedPassword
      );

      // Test hash before save
      const beforeSaveTest = await bcrypt.compare(password, user.password);
      console.log('Before save test:', beforeSaveTest);

      console.log('About to save user...');
      await user.save();
      console.log('User saved successfully');

      // Immediately fetch the saved user
      const savedUser = await User.findOne({ email }).select('+password');
      console.log('Fetched saved user password:', savedUser.password);
      console.log(
        'Saved password matches original hash:',
        savedUser.password === hashedPassword
      );

      // Test the saved hash
      const savedHashTest = await bcrypt.compare(password, savedUser.password);
      console.log('Saved hash test:', savedHashTest);

      // If hashes don't match, let's see what might have changed
      if (savedUser.password !== hashedPassword) {
        console.log('🚨 HASH MISMATCH DETECTED!');
        console.log('Original hash length:', hashedPassword.length);
        console.log('Saved hash length:', savedUser.password.length);
        console.log(
          'Original hash starts with:',
          hashedPassword.substring(0, 10)
        );
        console.log(
          'Saved hash starts with:',
          savedUser.password.substring(0, 10)
        );

        // Check if it's being hashed again
        const isDoubleHashed = await bcrypt.compare(
          hashedPassword,
          savedUser.password
        );
        console.log('Is original hash being hashed again?', isDoubleHashed);
      }

      console.log('=======================');

      // Generate auth token
      const token = this.generateToken(user);

      // Update verification token with actual user ID
      const updatedVerificationToken = this.generateVerificationToken(user);
      user.verificationToken = updatedVerificationToken;
      await user.save();

      // Send welcome email
      try {
        await emailService.sendWelcomeEmail(
          user.email,
          user.name,
          updatedVerificationToken,
          verificationCode
        );
        console.log(`Welcome email sent to: ${user.email}`);
      } catch (emailError) {
        console.error('Failed to send welcome email:', emailError);
      }

      return {
        success: true,
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          verified: user.verified,
        },
        message:
          'Registration successful! Please check your email to verify your account.',
      };
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }
  // Login user with rate limiting
  async login(email, password) {
    try {
      // Find user and include login attempt fields
      const user = await User.findOne({ email }).select(
        '+password +loginAttempts +lockUntil'
      );
      if (!user) {
        throw new Error('Missing credentials');
      }

      // Check if account is locked
      if (user.lockUntil && user.lockUntil > Date.now()) {
        const lockTimeRemaining = Math.ceil(
          (user.lockUntil - Date.now()) / 1000 / 60
        );
        throw new Error(
          `Account locked due to too many failed attempts. Try again in ${lockTimeRemaining} minutes.`
        );
      }

      // Check if user is verified
      if (!user.verified) {
        throw new Error('Please verify your email before logging in');
      }
      // Debug logs - FIXED VERSION
      console.log('=== LOGIN DEBUG ===');
      console.log('User found:', user.email);
      console.log('User verified:', user.verified);
      console.log('Input password:', password);
      console.log('Stored hash:', user.password);
      console.log(
        'Hash length:',
        user.password ? user.password.length : 'undefined'
      );
      // Test with a known password/hash pair
      const testPassword = 'test123';
      const testHash = await bcrypt.hash(
        testPassword,
        config.security.saltRounds
      );
      const testResult = await bcrypt.compare(testPassword, testHash);
      console.log('Test bcrypt comparison:', testResult); // Should be true
      console.log('=================');
      // Check password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      console.log('Is password valid:', isPasswordValid);
      if (!isPasswordValid) {
        // Handle failed login attempt
        await this.handleFailedLoginAttempt(user);
        throw new Error('Invalid credentials');
      }

      // Reset login attempts on successful login
      if (user.loginAttempts > 0 || user.lockUntil) {
        await User.findByIdAndUpdate(user._id, {
          $unset: { loginAttempts: 1, lockUntil: 1 },
        });
      }

      // Update last login
      user.lastLogin = new Date();
      await user.save();

      // Generate token
      const token = this.generateToken(user);

      return {
        success: true,
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          verified: user.verified,
        },
        message: 'Login successful',
      };
    } catch (error) {
      throw error;
    }
  }

  // Handle failed login attempts with rate limiting
  async handleFailedLoginAttempt(user) {
    const loginAttempts = (user.loginAttempts || 0) + 1;
    const updates = { loginAttempts };

    // Lock account if max attempts reached using config
    if (loginAttempts >= config.security.maxLoginAttempts) {
      updates.lockUntil = Date.now() + config.security.lockoutTime;
      updates.loginAttempts = 0; // Reset attempts after locking
    }

    await User.findByIdAndUpdate(user._id, updates);

    const attemptsLeft = config.security.maxLoginAttempts - loginAttempts;
    if (attemptsLeft > 0) {
      throw new Error(
        `Invalid credentials. ${attemptsLeft} attempts remaining.`
      );
    } else {
      throw new Error('Account locked due to too many failed attempts.');
    }
  }

  // Verify email address (supports both token and code)
  async verifyEmail(tokenOrCode) {
    try {
      // First try to verify as JWT token
      try {
        const decoded = jwt.verify(tokenOrCode, config.jwt.secret);

        if (decoded.type !== 'email_verification') {
          throw new Error('Invalid verification token');
        }

        const user = await User.findById(decoded.userId);
        if (!user) {
          throw new Error('User not found');
        }

        if (user.verified) {
          return { success: true, message: 'Email already verified' };
        }

        // Update user verification status
        user.verified = true;
        user.emailVerifiedAt = new Date();
        user.verificationCode = undefined;
        user.verificationCodeExpires = undefined;
        user.verificationToken = undefined;
        await user.save();

        return {
          success: true,
          message: 'Email verified successfully!',
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            verified: user.verified,
          },
        };
      } catch (jwtError) {
        // If JWT verification fails, try as verification code
        const user = await User.findOne({
          verificationCode: tokenOrCode,
          verificationCodeExpires: { $gt: new Date() },
        });

        if (!user) {
          throw new Error('Invalid or expired verification code');
        }

        if (user.verified) {
          return { success: true, message: 'Email already verified' };
        }

        // Update user verification status
        user.verified = true;
        user.emailVerifiedAt = new Date();
        user.verificationCode = undefined;
        user.verificationCodeExpires = undefined;
        user.verificationToken = undefined;
        await user.save();

        return {
          success: true,
          message: 'Email verified successfully!',
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            verified: user.verified,
          },
        };
      }
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new Error('Verification token has expired');
      }
      throw error;
    }
  }

  // Resend verification email
  async resendVerificationEmail(email) {
    try {
      const user = await User.findOne({ email });
      if (!user) {
        // Don't reveal if user exists
        return {
          success: true,
          message: 'If email exists, verification email sent',
        };
      }

      if (user.verified) {
        return { success: true, message: 'Email is already verified' };
      }

      // Generate new verification code and token
      const verificationCode = this.generateVerificationCode();
      const verificationToken = this.generateVerificationToken(user);

      // Update user with new verification data
      user.verificationCode = verificationCode;
      user.verificationCodeExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
      user.verificationToken = verificationToken;
      await user.save();

      try {
        await emailService.sendWelcomeEmail(
          user.email,
          user.name,
          verificationToken,
          verificationCode
        );
        console.log(`Verification email resent to: ${user.email}`);
      } catch (emailError) {
        console.error('Failed to resend verification email:', emailError);
      }

      return {
        success: true,
        message: 'If email exists, verification email sent',
      };
    } catch (error) {
      throw error;
    }
  }

  // Verify token
  async verifyToken(token) {
    try {
      const decoded = jwt.verify(token, config.jwt.secret);
      const user = await User.findById(decoded.id);

      if (!user) {
        throw new Error('User not found');
      }

      return {
        success: true,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          verified: user.verified,
        },
      };
    } catch (error) {
      throw error;
    }
  }

  // Request password reset
  async requestPasswordReset(email) {
    try {
      const user = await User.findOne({ email });
      if (!user) {
        // Don't reveal if user exists for security
        return { success: true, message: 'If email exists, reset link sent' };
      }

      // Generate reset token using config
      const resetToken = jwt.sign(
        {
          userId: user._id,
          email: user.email,
          type: 'password_reset',
        },
        config.jwt.secret,
        { expiresIn: '1h' }
      );

      // Store reset token in database for additional security
      user.passwordResetToken = resetToken;
      user.passwordResetExpires = new Date(Date.now() + 3600000); // 1 hour
      await user.save();

      // Send password reset email
      try {
        await emailService.sendPasswordResetEmail(
          email,
          resetToken,
          user.name || ''
        );
        console.log(`Password reset email sent to: ${email}`);
      } catch (emailError) {
        console.error('Email sending failed:', emailError);
        // Don't throw error to maintain security - user shouldn't know if email failed
      }

      return { success: true, message: 'If email exists, reset link sent' };
    } catch (error) {
      console.error('Password reset request failed:', error);
      throw error;
    }
  }

  // Reset password
  async resetPassword(token, newPassword) {
    try {
      const decoded = jwt.verify(token, config.jwt.secret);

      if (decoded.type !== 'password_reset') {
        throw new Error('Invalid reset token');
      }

      const user = await User.findById(decoded.userId);

      if (!user) {
        throw new Error('Invalid or expired reset token');
      }

      // Check if token matches the one stored in database (additional security)
      if (user.passwordResetToken !== token) {
        throw new Error('Invalid or expired reset token');
      }

      // Check if token has expired
      if (user.passwordResetExpires && user.passwordResetExpires < new Date()) {
        throw new Error('Reset token has expired');
      }

      // Hash new password using config
      const hashedPassword = await bcrypt.hash(
        newPassword,
        config.security.saltRounds
      );

      // Update password and clear reset fields
      user.password = hashedPassword;
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      user.passwordChangedAt = new Date();
      await user.save();

      // Send password change confirmation email
      try {
        await emailService.sendPasswordChangeConfirmation(
          user.email,
          user.name
        );
        console.log(`Password change confirmation sent to: ${user.email}`);
      } catch (emailError) {
        console.error(
          'Failed to send password change confirmation:',
          emailError
        );
        // Don't fail the password reset if email fails
      }

      return { success: true, message: 'Password reset successful' };
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new Error('Reset token has expired');
      }
      throw error;
    }
  }

  // Change password (for authenticated users)
  async changePassword(userId, currentPassword, newPassword) {
    try {
      const user = await User.findById(userId).select('+password');
      if (!user) {
        throw new Error('User not found');
      }

      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(
        currentPassword,
        user.password
      );
      if (!isCurrentPasswordValid) {
        throw new Error('Current password is incorrect');
      }

      // Hash new password using config
      const hashedPassword = await bcrypt.hash(
        newPassword,
        config.security.saltRounds
      );

      // Update password
      user.password = hashedPassword;
      user.passwordChangedAt = new Date();
      await user.save();

      // Send confirmation email
      try {
        await emailService.sendPasswordChangeConfirmation(
          user.email,
          user.name
        );
        console.log(`Password change confirmation sent to: ${user.email}`);
      } catch (emailError) {
        console.error(
          'Failed to send password change confirmation:',
          emailError
        );
      }

      return { success: true, message: 'Password changed successfully' };
    } catch (error) {
      throw error;
    }
  }

  // OAuth user handling
  async handleOAuthUser(profile, provider) {
    try {
      let user = await User.findOne({
        $or: [{ email: profile.email }, { [`${provider}Id`]: profile.id }],
      });

      if (user) {
        // Update existing user with OAuth info if needed
        if (!user[`${provider}Id`]) {
          user[`${provider}Id`] = profile.id;
          await user.save();
        }
        user.lastLogin = new Date();
        await user.save();
      } else {
        // Create new user from OAuth profile
        user = new User({
          name: profile.displayName || profile.name,
          email: profile.email,
          [`${provider}Id`]: profile.id,
          authProvider: provider,
          verified: true, // OAuth accounts are considered verified
          emailVerifiedAt: new Date(),
        });
        await user.save();
      }

      const token = this.generateToken(user);

      return {
        success: true,
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          verified: user.verified,
        },
      };
    } catch (error) {
      throw error;
    }
  }

  // Logout (optional: for token blacklisting)
  async logout(token) {
    // If you implement token blacklisting, add logic here
    return { success: true, message: 'Logged out successfully' };
  }
}

export default new AuthService();
