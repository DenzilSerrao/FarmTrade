import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import config from '../config/auth.config.js';

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
        { userId: user._id, email: user.email },
        config.jwt.secret,
        { expiresIn: '1h' }
      );

      // TODO: Send email with reset token
      console.log('Password reset token:', resetToken);

      return { success: true, message: 'If email exists, reset link sent' };
    } catch (error) {
      throw error;
    }
  }

  // Reset password
  async resetPassword(token, newPassword) {
    try {
      const decoded = jwt.verify(token, config.jwt.secret);
      const user = await User.findById(decoded.userId);

      if (!user) {
        throw new Error('Invalid or expired reset token');
      }

      // Hash new password
      const saltRounds = config.security.saltRounds;
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

      // Update password
      user.password = hashedPassword;
      await user.save();

      return { success: true, message: 'Password reset successful' };
    } catch (error) {
      throw error;
    }
  }
}

export default new AuthService();