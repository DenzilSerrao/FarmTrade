export default ({ config }) => {
  return {
    ...config,
    extra: {
      ...config.extra,
      API_URL: process.env.API_URL || 'https://your-production-api.com/api',
      NODE_ENV: 'production',
      ENABLE_GOOGLE_AUTH: true,
      ENABLE_FACEBOOK_AUTH: true,
      ENABLE_EMAIL_AUTH: true,
      MAX_UPLOAD_SIZE: 5242880,
      APP_NAME: 'FarmTrade',
    },
  };
};
