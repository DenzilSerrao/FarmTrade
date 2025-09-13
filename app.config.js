export default ({ config }) => {
  const environment = process.env.APP_ENV || 'development';

  const envConfigs = {
    development: {
      API_URL: 'http://localhost:5000/api',
      FRONTEND_URL: 'http://localhost:8081',
      GOOGLE_CLIENT_ID: 'your-google-client-id', // Safe to expose
      FACEBOOK_CLIENT_ID: 'your-facebook-client-id', // Safe to expose
      RAZORPAY_KEY_ID: 'rzp_test_your_key', // Safe to expose (public key)
      APP_NAME: 'CropKart',
      ENABLE_GOOGLE_AUTH: false,
      ENABLE_FACEBOOK_AUTH: false,
      ENABLE_EMAIL_AUTH: true,
      MAX_FILE_SIZE: 5242880,
    },
    production: {
      API_URL: 'https://api.cropkart.com/api',
      FRONTEND_URL: 'https://cropkart.com',
      GOOGLE_CLIENT_ID: 'your-prod-google-client-id',
      FACEBOOK_CLIENT_ID: 'your-prod-facebook-client-id',
      RAZORPAY_KEY_ID: 'rzp_live_your_key',
      APP_NAME: 'CropKart',
      ENABLE_GOOGLE_AUTH: true,
      ENABLE_FACEBOOK_AUTH: true,
      ENABLE_EMAIL_AUTH: true,
      MAX_FILE_SIZE: 5242880,
    },
  };

  return {
    ...config,
    extra: {
      ...envConfigs[environment],
    },
  };
};
