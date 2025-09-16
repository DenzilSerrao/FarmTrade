import axios, { AxiosError } from 'axios';
import { getStoredAuthAsync, clearStoredAuth } from './auth';
import { ShelfItem } from '../types';
import { Config } from './config';

// Create axios instance with default config
const api = axios.create({
  baseURL: Config.API_URL || 'http://localhost:5000/farmertrader/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for authentication
api.interceptors.request.use(async (config) => {
  try {
    const { token } = await getStoredAuthAsync();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (error) {
    console.error('Error getting token:', error);
  }
  return config;
});

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      await clearStoredAuth();
      // In React Native, you might want to navigate to login screen
      // This would be handled by your navigation logic
    }
    console.error('API Error:', error.response?.data); // Logging for verification
    return Promise.reject(error);
  }
);

// ==================== AUTH ENDPOINTS ====================
export const login = async (email: string, password: string) => {
  const response = await api.post('/auth/login', { email, password });
  console.log('Login:', response.data);
  return response.data;
};

export const register = async (name: string, email: string, password: string) => {
  const response = await api.post('/auth/register', { name, email, password });
  console.log('register:', response);
  return response.data;
};

export const logout = async () => {
  const response = await api.post('/auth/logout');
  return response.data;
};

export const verifyToken = async (token: string) => {
  const response = await api.post('/auth/verify', { token });
  console.log('token verified:', response);
  return response.data;
};

export const requestPasswordReset = async (email: string) => {
  const response = await api.post('/auth/request-password-reset', { email });
  return response.data;
};

export const resetPassword = async (token: string, newPassword: string) => {
  const response = await api.post('/auth/reset-password', { token, newPassword });
  return response.data;
};

export const verifyEmail = async (token: string) => {
  const response = await api.post('/auth/verify-email', { token });
  return response.data;
};

// OAuth endpoints (these would typically redirect in browser)
export const getGoogleAuthUrl = () => `${Config.API_URL}/auth/google`;
export const getFacebookAuthUrl = () => `${Config.API_URL}/auth/facebook`;

// ==================== CATEGORY & CROPS ENDPOINTS ====================
export const getCategories = async () => {
  const response = await api.get('/categories');
  return response.data;
};

export const getCropsByCategory = async (category: string) => {
  const response = await api.get(`/categories/${encodeURIComponent(category)}/crops`);
  return response.data;
};

export const searchCrops = async (query: string) => {
  const response = await api.get(`/crops/search`, {
    params: { q: query }
  });
  return response.data;
};

export const getAllCrops = async () => {
  const response = await api.get('/crops');
  return response.data;
};

export const getUnits = async () => {
  const response = await api.get('/units');
  return response.data;
};

// ==================== DASHBOARD ENDPOINTS ====================
export const getNews = async () => {
  const response = await api.get('/dashboard/news');
  return response.data;
};

export const getSalesAnalytics = async () => {
  const response = await api.get('/dashboard/analytics');
  return response.data;
};

export const getMarketData = async () => {
  const response = await api.get('/dashboard/market-data');
  return response.data;
};

export const getDashboardSummary = async () => {
  const response = await api.get('/dashboard/summary');
  return response.data;
};

// ==================== ORDER ENDPOINTS ====================
export const getOrders = async () => {
  const response = await api.get('/orders');
  console.log('getOrders:', response.data);
  return response.data;
};

export const getOrder = async (orderId: string) => {
  const response = await api.get(`/orders/${orderId}`);
  console.log('getOrder:', response);
  return response.data;
};

export const createOrder = async (orderData: any) => {
  const response = await api.post('/orders', orderData);
  return response.data;
};

export const updateOrder = async (orderId: string, orderData: any) => {
  const response = await api.put(`/orders/${orderId}`, orderData);
  return response.data;
};

export const cancelOrder = async (orderId: string) => {
  const response = await api.delete(`/orders/${orderId}`);
  console.log('Canceling Order:', response);
  return response.data;
};

export const getOrderInvoice = async (orderId: string, userId?: string) => {
  const response = await api.get(`/orders/${orderId}/invoice`, {
    params: userId ? { userId } : {},
    responseType: 'blob', // Important for handling binary data
  });
  return response.data;
};

// ==================== PROFILE ENDPOINTS ====================
export const getCurrentUserProfile = async () => {
  const response = await api.get('/profile');
  return response.data;
};

export const getUserProfile = async (userId: string) => {
  const response = await api.get(`/profile/${userId}`);
  return response.data;
};

export const updateUserProfile = async (profileData: any) => {
  const response = await api.put('/profile', profileData);
  return response.data;
};

export const uploadAvatar = async (formData: FormData) => {
  const response = await api.post('/profile/avatar', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const deleteAccount = async () => {
  const response = await api.delete('/profile');
  return response.data;
};

export const getUserStats = async () => {
  const response = await api.get('/profile/stats');
  return response.data;
};

// ==================== SHELF ENDPOINTS ====================
export const getShelfItems = async (): Promise<ShelfItem[]> => {
  const response = await api.get('/shelf');
  return response.data;
};

export const getShelfItem = async (itemId: string) => {
  const response = await api.get(`/shelf/${itemId}`);
  return response.data;
};

export const addShelfItem = async (itemData: any) => {
  const response = await api.post('/shelf', itemData);
  return response.data;
};

export const updateShelfItem = async (itemId: string, itemData: any) => {
  const response = await api.put(`/shelf/${itemId}`, itemData);
  return response.data;
};

export const toggleItemAvailability = async (itemId: string, available: boolean) => {
  const response = await api.patch(`/shelf/${itemId}/availability`, { available });
  return response.data;
};

export const deleteShelfItem = async (itemId: string) => {
  const response = await api.delete(`/shelf/${itemId}`);
  return response.data;
};

export const getShelfAnalytics = async () => {
  const response = await api.get('/shelf/analytics/dashboard');
  return response.data;
};

// ==================== PAYMENT & CART ENDPOINTS ====================
export const createPaymentOrder = async (orderData: any) => {
  const response = await api.post('/payment/create-order', orderData);
  return response.data;
};

export const verifyPayment = async (paymentData: any) => {
  const response = await api.post('/payment/verify', paymentData);
  return response.data;
};

// ==================== ADDRESS ENDPOINTS ====================
export const getSavedAddresses = async () => {
  const response = await api.get('/profile/addresses');
  return response.data;
};

export const createAddress = async (addressData: any) => {
  const response = await api.post('/profile/addresses', addressData);
  return response.data;
};

export const updateAddress = async (addressId: string, addressData: any) => {
  const response = await api.put(`/profile/addresses/${addressId}`, addressData);
  return response.data;
};

export const deleteAddress = async (addressId: string) => {
  const response = await api.delete(`/profile/addresses/${addressId}`);
  return response.data;
};

// ==================== CHAT ENDPOINTS ====================
export const getConversations = async () => {
  const response = await api.get('/chat/conversations');
  return response.data;
};

export const getChatMessages = async (conversationId: string) => {
  const response = await api.get(`/chat/conversations/${conversationId}/messages`);
  return response.data;
};

export const sendMessage = async (messageData: any) => {
  const response = await api.post('/chat/messages', messageData);
  return response.data;
};

export const createConversation = async (participantId: string) => {
  const response = await api.post('/chat/conversations', { participantId });
  return response.data;
};

// ==================== SUPPORT ENDPOINTS ====================
export const getFAQs = async () => {
  const response = await api.get('/support/faqs');
  return response.data;
};

export const sendSupportMessage = async (messageData: any) => {
  const response = await api.post('/support/messages', messageData);
  return response.data;
};

export const getUserMessages = async () => {
  const response = await api.get('/support/messages');
  return response.data;
};

export const getSupportMessage = async (messageId: string) => {
  const response = await api.get(`/support/messages/${messageId}`);
  return response.data;
};

export const getContactInfo = async () => {
  const response = await api.get('/support/contact');
  return response.data;
};

export default api;