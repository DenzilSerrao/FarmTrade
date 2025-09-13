import AuthService from "../services/authService.js";
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

// Login controller
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const result = await AuthService.login(email, password);

    res.json(result);
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

// Register controller
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and password are required",
      });
    }

    const result = await AuthService.register({ name, email, password });

    res.status(201).json(result);
  } catch (error) {
    console.error("Registration error:", error);
    res.status(400).json({
      success: false,
      message: error.message || "Registration failed",
    });
  }
};

// Logout controller
export const logout = async (req, res) => {
  try {
    // For JWT, logout is typically handled client-side by removing the token
    // You might want to implement token blacklisting here if needed

    res.json({
      success: true,
      message: "Logout successful",
    });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Request password reset
export const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal if user exists or not for security
      return res.json({
        success: true,
        message: "If the email exists, a password reset link has been sent.",
      });
    }

    // Generate reset token
    const resetToken = jwt.sign(
      { userId: user.id, email: user.email },
      config.jwt.secret,
      { expiresIn: "1h" }
    );

    // TODO: Send password reset email here
    console.log("Password reset token:", resetToken);

    res.json({
      success: true,
      message: "If the email exists, a password reset link has been sent.",
    });
  } catch (error) {
    console.error("Password reset request error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Reset password
export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Token and new password are required",
      });
    }

    // Verify reset token
    const decoded = jwt.verify(token, config.jwt.secret);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token",
      });
    }

    // Hash new password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    user.password = hashedPassword;
    await user.save();

    res.json({
      success: true,
      message: "Password reset successful",
    });
  } catch (error) {
    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError"
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token",
      });
    }

    console.error("Password reset error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Verify email
export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Verification token is required",
      });
    }

    // Verify token
    const decoded = jwt.verify(token, config.jwt.secret);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification token",
      });
    }

    if (user.verified) {
      return res.json({
        success: true,
        message: "Email is already verified",
      });
    }

    // Verify user
    user.verified = true;
    user.verifiedAt = new Date();
    await user.save();

    res.json({
      success: true,
      message: "Email verified successfully",
    });
  } catch (error) {
    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError"
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification token",
      });
    }

    console.error("Email verification error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Google OAuth callback
export const googleCallback = async (req, res) => {
  try {
    // Passport.js puts user info in req.user after successful OAuth
    const { user } = req;

    if (!user) {
      return res.redirect("/login?error=oauth_failed");
    }

    // Generate JWT token
    const token = generateToken(user);

    // Redirect to frontend with token
    res.redirect(`/dashboard?token=${token}&auth=success`);
  } catch (error) {
    console.error("Google OAuth callback error:", error);
    res.redirect("/login?error=oauth_failed");
  }
};

// Facebook OAuth callback
export const facebookCallback = async (req, res) => {
  try {
    // Passport.js puts user info in req.user after successful OAuth
    const { user } = req;

    if (!user) {
      return res.redirect("/login?error=oauth_failed");
    }

    // Generate JWT token
    const token = generateToken(user);

    // Redirect to frontend with token
    res.redirect(`/dashboard?token=${token}&auth=success`);
  } catch (error) {
    console.error("Facebook OAuth callback error:", error);
    res.redirect("/login?error=oauth_failed");
  }
};
