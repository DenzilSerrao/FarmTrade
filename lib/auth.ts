import { jwtDecode } from 'jwt-decode';
import { User } from '../types';

interface DecodedToken {
  exp: number;
  userId: string;
}

const AUTH_TOKEN_KEY = 'ana_beauty_token';
const AUTH_USER_KEY = 'ana_beauty_user';

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
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    const userStr = localStorage.getItem(AUTH_USER_KEY);
    console.log("Found token")
    if (!token || !userStr) {
      //|| !isValidToken(token) to be debugged later
      // clearStoredAuth();
      console.log("Null token sent")
      return { token: null, user: null };
    }

    const user = JSON.parse(userStr);
    console.log("sending token")
    return { token, user };
  } catch {
    // clearStoredAuth();
    console.log("Null token sent")
    return { token: null, user: null };
  }
};

export const setStoredAuth = (token: string, user: User): void => {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
};

export const clearStoredAuth = (): void => {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
};