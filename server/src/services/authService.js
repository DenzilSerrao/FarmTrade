// authService.js
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

  // Register new user
  async register(userData) {
    try {
      const { name, email, password } = userData;

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        throw new Error('User with this email already exists');
      }

      // Hash password
      const saltRounds = config.security.saltRounds;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Create user
      const user = new User({
        name,
        email,
        password: hashedPassword,
        verified: false,
        authProvider: 'local',
      });

      await user.save();

      // Generate tokens
      const token = this.generateToken(user);
      const verificationToken = this.generateVerificationToken(user);

      // Send welcome email with verification link
      try {
        await emailService.sendWelcomeEmail(
          user.email,
          user.name,
          verificationToken
        );
        console.log(`Welcome email sent to: ${user.email}`);
      } catch (emailError) {
        console.error('Failed to send welcome email:', emailError);
        // Don't fail registration if email fails
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
      throw error;
    }
  }

  // Login user
  async login(email, password) {
    try {
      // Find user
      const user = await User.findOne({ email });
      if (!user) {
        throw new Error('Invalid credentials');
      }

      // Check password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new Error('Invalid credentials');
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
      };
    } catch (error) {
      throw error;
    }
  }

  // Verify email address
  async verifyEmail(token) {
    try {
      const decoded = jwt.verify(token, config.jwt.secret);

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
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new Error('Verification token has expired');
      }
      throw new Error('Invalid verification token');
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

      const verificationToken = this.generateVerificationToken(user);

      try {
        await emailService.sendWelcomeEmail(
          user.email,
          user.name,
          verificationToken
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

      // Generate reset token
      const resetToken = jwt.sign(
        {
          userId: user._id,
          email: user.email,
          type: 'password_reset',
        },
        config.jwt.secret,
        { expiresIn: '1h' }
      );

      // Optional: Store reset token in database for additional security
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
        // In production, you might want to log this to an error tracking service
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

      // Hash new password
      const saltRounds = config.security.saltRounds;
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

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
      const user = await User.findById(userId);
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

      // Hash new password
      const saltRounds = config.security.saltRounds;
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

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

  // Logout (optional: for token blacklisting)
  async logout(token) {
    // If you implement token blacklisting, add logic here
    return { success: true, message: 'Logged out successfully' };
  }
}

export default new AuthService();
