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
  console.log('LoginFB:', response.data);
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
  const response = await api.get(`/auth/verify-email?token=${token}`);
  return response.data;
};

// OAuth endpoints (these would typically redirect in browser)
export const getGoogleAuthUrl = () => `${Config.API_URL}/auth/google`;
export const getFacebookAuthUrl = () => `${Config.API_URL}/auth/facebook`;

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
  const response = await api.get('/shelf/items');
  return response.data.data || response.data;
};

export const getShelfItem = async (itemId: string) => {
  const response = await api.get(`/shelf/items/${itemId}`);
  return response.data;
};

export const addShelfItem = async (itemData: any) => {
  const response = await api.post('/shelf/items', itemData);
  return response.data;
};

export const updateShelfItem = async (itemId: string, itemData: any) => {
  const response = await api.put(`/shelf/items/${itemId}`, itemData);
  return response.data;
};

export const uploadShelfItem = async (formData: FormData) => {
  const response = await api.post('/profile/avatar', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const deleteShelfItem = async (itemId: string) => {
  const response = await api.delete(`/shelf/items/${itemId}`);
  return response.data;
};

export const getShelfAnalytics = async () => {
  const response = await api.get('/shelf/analytics');
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

// ==================== LEGACY/PAYMENT ENDPOINTS ====================
// These appear to be from your original API but don't match your current routes
// Keep them if you still need them, otherwise consider removing

// export const fetchProducts = async (): Promise<ShelfItem[]> => {
//   // This might map to getShelfItems now
//   const response = await api.get('/shelfitems');
//   return response.data.data.products;
// };

// export const createPaymentOrder = async (orderData: any) => {
//   const paymentResponse = await api.post('/payment/create-order', orderData);
//   return paymentResponse.data;
// };

// export const verifyPayment = async (paymentData: any) => {
//   const response = await api.post('/payment/verify-payment', {
//     ...paymentData,
//     timestamp: Date.now()
//   });
//   console.log('verifyPayment:', response);
//   return response.data;
// };

// Legacy admin endpoints - keep if you have admin routes not shown
// export const getAllOrdersAdmin = async () => {
//   const response = await api.get('/admin/allOrders');
//   console.log('Getting all orders (admin):', response);
//   return response.data;
// };

// export const getOrderAdmin = async (orderId: string) => {
//   const response = await api.get(`/admin/orders/${orderId}`);
//   return response.data;
// };

// export const deleteOrderAdmin = async (orderId: string) => {
//   const response = await api.delete(`/admin/orders/${orderId}`);
//   return response.data;
// };

// export const updateOrderStatus = async (orderId: string, status: string) => {
//   const response = await api.patch(`/admin/orders/${orderId}`, { status });
//   return response.data;
// };

// export const getOrderInvoiceAdmin = async (orderId: string, userId: string) => {
//   const response = await api.get(`/orders/${orderId}/invoice`, {
//     params: { userId },
//     responseType: 'blob',
//   });
//   return response.data;
// };

// export const createProduct = async (productData: any) => {
//   const response = await api.post('/products', productData);
//   return response.data;
// };

// export const updateProduct = async (productId: string, productData: any) => {
//   const response = await api.put(`/products/${productId}`, productData);
//   return response.data;
// };

// export const uploadProductImage = async (formData: FormData) => {
//   const response = await api.post('/products/upload', formData, {
//     headers: {
//       'Content-Type': 'multipart/form-data',
//     },
//   });
//   return response.data;
// };

export default api;