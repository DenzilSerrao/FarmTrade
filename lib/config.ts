// lib/config.ts
import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Define the config type
interface AppConfig {
  // API Configuration
  API_URL: string;
  NODE_ENV: 'development' | 'production' | 'test';
  
  // App Info
  APP_NAME: string;
  APP_VERSION: string;
  
  // Feature Flags
  ENABLE_GOOGLE_AUTH: boolean;
  ENABLE_FACEBOOK_AUTH: boolean;
  ENABLE_EMAIL_AUTH: boolean;
  
  // Payment Configuration
  VITE_RAZORPAY_KEY_ID: string;
  
  // Limits
  MAX_UPLOAD_SIZE: number;
  
  // Platform info
  IS_IOS: boolean;
  IS_ANDROID: boolean;
  IS_WEB: boolean;
}

// Helper function to parse boolean values safely
const parseBoolean = (value: any, defaultValue: boolean): boolean => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    if (value.toLowerCase() === 'true') return true;
    if (value.toLowerCase() === 'false') return false;
  }
  return defaultValue;
};

// Helper function to parse number values safely
const parseNumber = (value: any, defaultValue: number): number => {
  const num = Number(value);
  return isNaN(num) ? defaultValue : num;
};

// Get config from Expo constants
const getConfig = (): AppConfig => {
  const extra = Constants.expoConfig?.extra || {};
  
  return {
    // API Configuration
    API_URL: extra.API_URL || 'http://localhost:5000/api',
    NODE_ENV: extra.NODE_ENV || 'development',
    
    // App Info
    APP_NAME: extra.APP_NAME || 'FarmTrade',
    APP_VERSION: Constants.expoConfig?.version || '1.0.0',
    
    // Feature Flags
    ENABLE_GOOGLE_AUTH: parseBoolean(extra.ENABLE_GOOGLE_AUTH, false),
    ENABLE_FACEBOOK_AUTH: parseBoolean(extra.ENABLE_FACEBOOK_AUTH, false),
    ENABLE_EMAIL_AUTH: parseBoolean(extra.ENABLE_EMAIL_AUTH, true),
    
    // Payment Configuration
    VITE_RAZORPAY_KEY_ID: extra.VITE_RAZORPAY_KEY_ID || '',
    
    // Limits
    MAX_UPLOAD_SIZE: parseNumber(extra.MAX_UPLOAD_SIZE, 5242880),
    
    // Platform info
    IS_IOS: Platform.OS === 'ios',
    IS_ANDROID: Platform.OS === 'android',
    IS_WEB: Platform.OS === 'web',
  };
};

// Export the config
export const Config = getConfig();

// Helper functions
export const isDev = (): boolean => Config.NODE_ENV === 'development';
export const isProd = (): boolean => Config.NODE_ENV === 'production';
export const isTest = (): boolean => Config.NODE_ENV === 'test';

// Log config in development (without sensitive data)
if (isDev()) {
  console.log('App Config:', {
    ...Config,
    VITE_RAZORPAY_KEY_ID: Config.VITE_RAZORPAY_KEY_ID ? '*** SET ***' : '*** NOT SET ***'
  });
}

export default Config;