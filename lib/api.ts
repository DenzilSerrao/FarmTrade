import axios, { AxiosError } from 'axios';
import { getStoredAuthAsync } from './auth';
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
  (error: AxiosError) => {
    // if (error.response?.status === 401) {
    //   // Handle unauthorized access
    //   clearStoredAuth();
    //   window.location.href = '/login';
    // }
    console.error('API Error:', error.response?.data); // Logging for verification
    return Promise.reject(error);
  }
);

// Auth endpoints
export const login = async (email: string, password: string) => {
  const response = await api.post('/auth/login', { email, password });
  console.log('LoginFB:',response.data)
  return response.data;
};

export const register = async (name: string, email: string, password: string) => {
  const response = await api.post('/auth/register', { name, email, password });
  console.log('register:',response)
  return response.data;
};

export const verifyToken = async (token: string) => {
  const response = await api.post('/auth/verify', { token });
  console.log('token verified:',response)
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

export const fetchProducts = async (): Promise<ShelfItem[]> => {
  const response = await api.get('/shelfitems');
  return response.data.data.products;
};

export const getOrders = async () => {
  const response = await api.get('/orders');
  console.log('getOrder:', response.data)
  return response.data;
};

export const createPaymentOrder = async (orderData: any) => {

  const paymentResponse = await api.post('/payment/create-order', orderData);
  return paymentResponse.data;
};

export const verifyPayment = async (paymentData: any) => {
  const response = await api.post('/payment/verify-payment', {
    ...paymentData,
    timestamp: Date.now()
  });
  console.log('verifyPayment:',response)
  return response.data;
};

export const getOrder = async (orderId: string) => {
  const response = await api.get(`/orders/${orderId}`);
  console.log('getOrder:',response)
  return response.data;
};

export const deleteOrder = async (orderId: string) => {
  const response = await api.delete(`/orders/${orderId}`);
  console.log('Deleting Order:',response)
  return response.data;
};

export const getOrderInvoice = async (orderId: string, userId: string) => {
  const response = await api.get(`/orders/${orderId}/invoice`, {
    params: { userId },
    responseType: 'blob', // Important for handling binary data
  });
  return response.data;
};

export const getAllOrdersAdmin = async () => {
  const response = await api.get('/admin/allOrders');
  console.log('Deleting Order:',response)
  return response.data;
};

export const getOrderAdmin = async (orderId: string) => {
  const response = await api.get(`/admin/orders/${orderId}`);
  return response.data;
};

export const deleteOrderAdmin = async (orderId: string) => {
  const response = await api.delete(`/admin/orders/${orderId}`);
  return response.data;
};

export const updateOrderStatus = async (orderId: string, status: string) => {
  const response = await api.patch(`/admin/orders/${orderId}`, { status });
  return response.data;
};

export const getOrderInvoiceAdmin = async (orderId: string, userId: string) => {
  const response = await api.get(`/orders/${orderId}/invoice`, {
    params: { userId },
    responseType: 'blob', // Important for handling binary data
  });
  return response.data;
};

export const createProduct = async (productData: any) => {
  const response = await api.post('/products', productData);
  return response.data;
};

export const updateProduct = async (productId: string, productData: any) => {
  const response = await api.put(`/products/${productId}`, productData);
  return response.data;
};

export const uploadProductImage = async (formData: FormData) => {
  const response = await api.post('/products/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export default api;