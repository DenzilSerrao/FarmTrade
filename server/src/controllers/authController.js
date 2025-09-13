import AuthService from "../services/authService.js";

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

    // Handle specific error cases
    if (error.message.includes("locked")) {
      return res.status(423).json({
        success: false,
        message: error.message,
      });
    }

    if (error.message.includes("verify your email")) {
      return res.status(401).json({
        success: false,
        message: error.message,
      });
    }

    res.status(401).json({
      success: false,
      message: error.message || "Login failed",
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

    // Additional password validation
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters long",
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
    const token = req.headers.authorization?.replace("Bearer ", "");
    const result = await AuthService.logout(token);
    res.json(result);
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

    const result = await AuthService.requestPasswordReset(email);
    res.json(result);
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

    // Additional password validation
    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters long",
      });
    }

    const result = await AuthService.resetPassword(token, newPassword);
    res.json(result);
  } catch (error) {
    console.error("Password reset error:", error);

    if (
      error.message.includes("expired") ||
      error.message.includes("Invalid")
    ) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

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

    const result = await AuthService.verifyEmail(token);
    res.json(result);
  } catch (error) {
    console.error("Email verification error:", error);

    if (
      error.message.includes("expired") ||
      error.message.includes("Invalid")
    ) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Resend verification email
export const resendVerificationEmail = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const result = await AuthService.resendVerificationEmail(email);
    res.json(result);
  } catch (error) {
    console.error("Resend verification error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Change password (for authenticated users)
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user?.id; // Assumes auth middleware sets req.user

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password and new password are required",
      });
    }

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // Additional password validation
    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters long",
      });
    }

    const result = await AuthService.changePassword(
      userId,
      currentPassword,
      newPassword
    );
    res.json(result);
  } catch (error) {
    console.error("Change password error:", error);

    if (error.message.includes("incorrect")) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Verify token
export const verifyToken = async (req, res) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token is required",
      });
    }

    const result = await AuthService.verifyToken(token);
    res.json(result);
  } catch (error) {
    console.error("Token verification error:", error);
    res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

// Google OAuth callback
export const googleCallback = async (req, res) => {
  try {
    const { user } = req; // Set by Passport.js

    if (!user) {
      return res.redirect("/login?error=oauth_failed");
    }

    const result = await AuthService.handleOAuthUser(user, "google");

    // Redirect to frontend with token
    res.redirect(`/dashboard?token=${result.token}&auth=success`);
  } catch (error) {
    console.error("Google OAuth callback error:", error);
    res.redirect("/login?error=oauth_failed");
  }
};

// Facebook OAuth callback
export const facebookCallback = async (req, res) => {
  try {
    const { user } = req; // Set by Passport.js

    if (!user) {
      return res.redirect("/login?error=oauth_failed");
    }

    const result = await AuthService.handleOAuthUser(user, "facebook");

    // Redirect to frontend with token
    res.redirect(`/dashboard?token=${result.token}&auth=success`);
  } catch (error) {
    console.error("Facebook OAuth callback error:", error);
    res.redirect("/login?error=oauth_failed");
  }
};
