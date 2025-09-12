import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';
import { User } from '../types';

interface DecodedToken {
  exp: number;
  userId: string;
}

const AUTH_TOKEN_KEY = 'farm_trade_token';
const AUTH_USER_KEY = 'farm_trade_user';

export const isValidToken = (token: string): boolean => {
  try {
    const decoded = jwtDecode<DecodedToken>(token);
    const currentTime = Date.now() / 1000;
    return decoded.exp > currentTime;
  } catch {
    return false;
  }
};

// Synchronous version for immediate use (returns cached values)
export const getStoredAuth = (): { token: string | null; user: User | null } => {
  // This is a fallback that returns null - use getStoredAuthAsync for actual data
  console.log("Use getStoredAuthAsync for React Native");
  return { token: null, user: null };
};

// Async version for React Native
export const getStoredAuthAsync = async (): Promise<{ token: string | null; user: User | null }> => {
  try {
    const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
    const userStr = await AsyncStorage.getItem(AUTH_USER_KEY);
    
    if (!token || !userStr) {
      console.log("No stored auth found");
      return { token: null, user: null };
    }

    // Validate token
    if (!isValidToken(token)) {
      console.log("Token expired, clearing auth");
      await clearStoredAuth();
      return { token: null, user: null };
    }

    const user = JSON.parse(userStr);
    console.log("Found valid stored auth");
    return { token, user };
  } catch (error) {
    console.error("Error getting stored auth:", error);
    await clearStoredAuth();
    return { token: null, user: null };
  }
};

export const setStoredAuth = async (token: string, user: User): Promise<void> => {
  try {
    await AsyncStorage.setItem(AUTH_TOKEN_KEY, token);
    await AsyncStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
    console.log("Auth stored successfully");
  } catch (error) {
    console.error("Error storing auth:", error);
    throw error;
  }
};

export const clearStoredAuth = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
    await AsyncStorage.removeItem(AUTH_USER_KEY);
    console.log("Auth cleared successfully");
  } catch (error) {
    console.error("Error clearing auth:", error);
  }
};

// Helper function to get current user ID
export const getCurrentUserId = async (): Promise<string | null> => {
  const { user } = await getStoredAuthAsync();
  return user?.id || null;
};

// Helper function to check if user is authenticated
export const isAuthenticated = async (): Promise<boolean> => {
  const { token, user } = await getStoredAuthAsync();
  return !!(token && user);
};