// emailService.js
import nodemailer from 'nodemailer';

class EmailService {
  constructor() {
    // Configure your email transporter
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER, // your-email@gmail.com
        pass: process.env.EMAIL_APP_PASSWORD, // App-specific password
      },
    });

    this.fromAddress = {
      name: process.env.APP_NAME || 'Your App',
      address: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    };
  }

  // Test email connection
  async testConnection() {
    try {
      await this.transporter.verify();
      console.log('Email service is ready');
      return true;
    } catch (error) {
      console.error('Email service connection failed:', error);
      return false;
    }
  }

  // Send password reset email
  async sendPasswordResetEmail(email, resetToken, userName = '') {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    const mailOptions = {
      from: this.fromAddress,
      to: email,
      subject: 'Password Reset Request',
      html: this.getPasswordResetTemplate(resetUrl, userName),
      text: this.getPasswordResetText(resetUrl, userName),
    };

    try {
      const result = await this.transporter.sendMail(mailOptions);
      console.log('Password reset email sent successfully:', result.messageId);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('Failed to send password reset email:', error);
      throw new Error('Failed to send email');
    }
  }

  // Send welcome/verification email with both web button and 5-digit code
  async sendWelcomeEmail(email, userName, verificationToken, verificationCode) {
    const verificationUrl = verificationToken
      ? `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`
      : null;

    const mailOptions = {
      from: this.fromAddress,
      to: email,
      subject: `Welcome to ${process.env.APP_NAME || 'Our App'}!`,
      html: this.getWelcomeTemplate(
        userName,
        verificationUrl,
        verificationCode
      ),
      text: this.getWelcomeText(userName, verificationUrl, verificationCode),
    };

    try {
      const result = await this.transporter.sendMail(mailOptions);
      console.log('Welcome email sent successfully:', result.messageId);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('Failed to send welcome email:', error);
      throw new Error('Failed to send welcome email');
    }
  }

  // Send password change confirmation
  async sendPasswordChangeConfirmation(email, userName) {
    const mailOptions = {
      from: this.fromAddress,
      to: email,
      subject: 'Password Changed Successfully',
      html: this.getPasswordChangeTemplate(userName),
      text: this.getPasswordChangeText(userName),
    };

    try {
      const result = await this.transporter.sendMail(mailOptions);
      console.log('Password change confirmation sent:', result.messageId);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('Failed to send password change confirmation:', error);
      // Don't throw error for confirmation emails
      return { success: false, error: error.message };
    }
  }

  // Email Templates
  getPasswordResetTemplate(resetUrl, userName) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 8px; margin-bottom: 30px; }
          .content { padding: 0; }
          .button { 
            display: inline-block; 
            background: #007bff; 
            color: white !important; 
            padding: 15px 30px; 
            text-decoration: none; 
            border-radius: 5px; 
            margin: 20px 0; 
            font-weight: bold;
          }
          .button:hover { background: #0056b3; }
          .footer { font-size: 12px; color: #666; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; }
          .warning { background: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ffc107; }
          .url-box { word-break: break-all; background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0; font-family: monospace; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${process.env.APP_NAME || 'Your App'}</h1>
          </div>
          
          <div class="content">
            <h2>Password Reset Request</h2>
            <p>Hi ${userName},</p>
            
            <p>You requested a password reset for your account. Click the button below to create a new password:</p>
            
            <p style="text-align: center;">
              <a href="${resetUrl}" class="button">Reset Password</a>
            </p>
            
            <p>Or copy and paste this link into your browser:</p>
            <div class="url-box">${resetUrl}</div>
            
            <div class="warning">
              <strong>⚠️ Important Security Information:</strong>
              <ul>
                <li>This link will expire in <strong>1 hour</strong></li>
                <li>If you didn't request this reset, please ignore this email</li>
                <li>Your password won't change until you create a new one</li>
                <li>Never share this link with anyone</li>
              </ul>
            </div>
          </div>
          
          <div class="footer">
            <p>Best regards,<br>${process.env.APP_NAME || 'Your App'} Team</p>
            <p><em>This is an automated message, please don't reply to this email.</em></p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  getPasswordResetText(resetUrl, userName) {
    return `
Password Reset Request

Hi ${userName},

You requested a password reset for your account.

Click the following link to reset your password:
${resetUrl}

IMPORTANT:
- This link will expire in 1 hour
- If you didn't request this reset, please ignore this email
- Your password won't change until you create a new one

Best regards,
${process.env.APP_NAME || 'Your App'} Team
    `.trim();
  }

  getWelcomeTemplate(userName, verificationUrl, verificationCode) {
    const verificationSection =
      verificationUrl && verificationCode
        ? `
      <div style="background: #e7f3ff; padding: 25px; border-radius: 8px; margin: 25px 0; border: 1px solid #cce7ff;">
        <h3 style="color: #0066cc; margin-top: 0;">📧 Verify Your Email Address</h3>
        
        <!-- Web Verification Button -->
        <div style="text-align: center; margin: 25px 0;">
          <a href="${verificationUrl}" 
             style="display: inline-block; background: #28a745; color: white !important; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            ✅ Verify Email on Web
          </a>
        </div>
        
        <div style="text-align: center; margin: 20px 0; color: #666; font-weight: bold;">
          OR
        </div>
        
        <!-- Mobile App Code Section -->
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; border: 2px dashed #007bff;">
          <h4 style="color: #333; margin-top: 0;">For Mobile App Users:</h4>
          <p style="margin: 10px 0; color: #666;">Enter this verification code in the app:</p>
          <div style="background: white; padding: 15px 25px; margin: 15px 0; border-radius: 8px; border: 2px solid #007bff; display: inline-block;">
            <span style="font-family: 'Courier New', monospace; font-size: 24px; font-weight: bold; color: #007bff; letter-spacing: 3px;">${verificationCode}</span>
          </div>
          <p style="font-size: 12px; color: #666; margin-bottom: 0;">
            <strong>Code expires in 24 hours</strong>
          </p>
        </div>
        
        <div style="margin-top: 20px; padding: 15px; background: #fff3cd; border-radius: 5px; border-left: 4px solid #ffc107;">
          <p style="margin: 0; font-size: 14px; color: #856404;">
            <strong>💡 Choose your preferred method:</strong><br>
            • Click the button above to verify on our website<br>
            • Or use the 5-digit code in your mobile app
          </p>
        </div>
      </div>
    `
        : '';

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome!</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f7f7f7; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: white; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 8px; margin-bottom: 30px; }
          .content { padding: 0 10px; }
          .button { 
            display: inline-block; 
            background: #007bff; 
            color: white !important; 
            padding: 15px 30px; 
            text-decoration: none; 
            border-radius: 5px; 
            margin: 10px 0; 
            font-weight: bold;
          }
          .footer { font-size: 12px; color: #666; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0; font-size: 28px;">🎉 Welcome to ${
              process.env.APP_NAME || 'Our App'
            }!</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">We're excited to have you on board!</p>
          </div>
          
          <div class="content">
            <h2 style="color: #333;">Hello ${userName}!</h2>
            <p>Thank you for joining us. To get started and secure your account, please verify your email address.</p>
            
            ${verificationSection}
            
            <p>Once verified, you'll have full access to all our features. If you have any questions or need assistance, our support team is here to help.</p>
          </div>
          
          <div class="footer">
            <p>Best regards,<br><strong>${
              process.env.APP_NAME || 'Your App'
            } Team</strong></p>
            <p style="margin-top: 15px;"><em>This is an automated message, please don't reply to this email.</em></p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  getWelcomeText(userName, verificationUrl, verificationCode) {
    const verificationText =
      verificationUrl && verificationCode
        ? `
EMAIL VERIFICATION REQUIRED
============================

Choose your preferred verification method:

🌐 WEB VERIFICATION:
Click this link: ${verificationUrl}

📱 MOBILE APP VERIFICATION:
Enter this 5-digit code in the app: ${verificationCode}

(Code expires in 24 hours)
      `
        : '';

    return `
Welcome to ${process.env.APP_NAME || 'Our App'}!

Hello ${userName}!

Thank you for joining us. We're excited to have you on board!
${verificationText}
Once verified, you'll have full access to all our features.

If you have any questions, feel free to reach out to our support team.

Best regards,
${process.env.APP_NAME || 'Your App'} Team
    `.trim();
  }

  getPasswordChangeTemplate(userName) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Password Changed</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #28a745; color: white; padding: 20px; text-align: center; border-radius: 8px; }
          .alert { background: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ffc107; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Password Changed Successfully</h1>
          </div>
          
          <p>Hi ${userName},</p>
          <p>Your password has been successfully changed.</p>
          
          <div class="alert">
            <strong>⚠️ If you didn't make this change:</strong>
            <p>Please contact our support team immediately as your account may be compromised.</p>
          </div>
          
          <p>Best regards,<br>${process.env.APP_NAME || 'Your App'} Team</p>
        </div>
      </body>
      </html>
    `;
  }

  getPasswordChangeText(userName) {
    return `
Password Changed Successfully

Hi ${userName},

Your password has been successfully changed.

⚠️ If you didn't make this change, please contact our support team immediately.

Best regards,
${process.env.APP_NAME || 'Your App'} Team
    `.trim();
  }
}

export default new EmailService();
