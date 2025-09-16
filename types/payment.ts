export interface CartItem {
  id: string;
  productId: string;
  productName: string;
  sellerId: string;
  sellerName: string;
  sellerLocation: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  totalPrice: number;
  image?: string;
  category: string;
  estimatedDelivery: string;
  deliveryMode: 'pickup' | 'delivery';
  maxQuantity: number;
}

export interface SavedAddress {
  id: string;
  userId: string;
  label: string; // Home, Work, Other
  name: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  landmark?: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentDetails {
  cartItems: CartItem[];
  totalAmount: number;
  deliveryAddress: SavedAddress;
  paymentMethod: 'phonepe' | 'cod';
  deliveryCharges: number;
  taxes: number;
  discount: number;
  finalAmount: number;
  estimatedDelivery: string;
}

export interface PaymentTransaction {
  id: string;
  userId: string;
  orderId: string;
  transactionId: string;
  amount: number;
  status: 'pending' | 'success' | 'failed' | 'cancelled';
  paymentMethod: string;
  phonepeTransactionId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  message: string;
  messageType: 'text' | 'image' | 'order_update';
  timestamp: string;
  isRead: boolean;
  orderReference?: string;
}

export interface Conversation {
  id: string;
  participants: string[];
  participantDetails: {
    id: string;
    name: string;
    avatar?: string;
  }[];
  lastMessage: ChatMessage;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
}