export const API_BASE_URL = import.meta.env.VITE_API_URL;
export const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID;

export const STATUS_ICONS = {
  pending: 'Clock',
  processing: 'Package2',
  shipped: 'Truck',
  delivered: 'CheckCircle2'
} as const;

export const STATUS_COLORS = {
  pending: 'text-yellow-500',
  processing: 'text-blue-500',
  shipped: 'text-purple-500',
  delivered: 'text-green-500'
} as const;