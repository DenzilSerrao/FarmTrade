import { jwtDecode } from 'jwt-decode';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types';

interface DecodedToken {
  exp: number;
  userId: string;
}

const AUTH_TOKEN_KEY = 'farmtrade_token';
const AUTH_USER_KEY = 'farmtrade_user';

export const isValidToken = (token: string): boolean => {
  try {
    const decoded = jwtDecode<DecodedToken>(token);
    const currentTime = Date.now() / 1000;
    return decoded.exp > currentTime;
  } catch {
    return false;
  }
};

export const getStoredAuth = (): { token: string | null; user: User | null } => {
  try {
    // For React Native, we'll use AsyncStorage but return synchronously for now
    // In a real implementation, this should be async
    const token = null; // Will be handled by async version
    const userStr = null; // Will be handled by async version
    
    if (!token || !userStr) {
      return { token: null, user: null };
    }

    const user = JSON.parse(userStr);
    return { token, user };
  } catch {
    return { token: null, user: null };
  }
};

// Async versions for React Native
export const getStoredAuthAsync = async (): Promise<{ token: string | null; user: User | null }> => {
  try {
    const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
    const userStr = await AsyncStorage.getItem(AUTH_USER_KEY);
    
    if (!token || !userStr) {
      return { token: null, user: null };
    }
};

    const user = JSON.parse(userStr);
    return { token, user };
  } catch {
    return { token: null, user: null };
  }
};

export const setStoredAuth = async (token: string, user: User): Promise<void> => {
  try {
    await AsyncStorage.setItem(AUTH_TOKEN_KEY, token);
    await AsyncStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  } catch (error) {
    console.error('Error storing auth data:', error);
  }
export const clearStoredAuth = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
    await AsyncStorage.removeItem(AUTH_USER_KEY);
  } catch (error) {
    console.error('Error clearing auth data:', error);
  }
};