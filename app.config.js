// app.config.js
export default ({ config }) => {
  // Determine environment
  const environment = process.env.APP_ENV || 'development';

  // Environment-specific configurations
  const envConfigs = {
    development: {
      API_URL: process.env.API_URL || 'http://localhost:5000/api',
      NODE_ENV: 'development',
      ENABLE_GOOGLE_AUTH: false,
      ENABLE_FACEBOOK_AUTH: false,
      ENABLE_EMAIL_AUTH: true,
      VITE_RAZORPAY_KEY_ID:
        process.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_development_key',
      MAX_UPLOAD_SIZE: 5242880,
    },
    production: {
      API_URL: process.env.API_URL || 'https://your-production-api.com/api',
      NODE_ENV: 'production',
      ENABLE_GOOGLE_AUTH: true,
      ENABLE_FACEBOOK_AUTH: true,
      ENABLE_EMAIL_AUTH: true,
      VITE_RAZORPAY_KEY_ID:
        process.env.VITE_RAZORPAY_KEY_ID || 'rzp_live_production_key',
      MAX_UPLOAD_SIZE: 5242880,
    },
  };

  // Get current environment config
  const currentEnvConfig = envConfigs[environment] || envConfigs.development;

  return {
    ...config,
    extra: {
      ...config.extra,
      ...currentEnvConfig,
      APP_NAME: 'FarmTrade',
    },
  };
};
