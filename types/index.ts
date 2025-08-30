export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  rating: number;
  verified: boolean;
  avatar?: string;
  joinDate: string;
}

export interface ShelfItem {
  id: number;
  name: string;
  quantity: number;
  unit: string;
  price: number;
  expiryDate: string;
  lowStock: boolean;
  image: string;
  category: string;
}

export interface Order {
  id: number;
  crop: string;
  quantity: number;
  unit: string;
  status: 'pending' | 'accepted' | 'shipped' | 'delivered';
  seller: string;
  sellerId?: string;
  price: number;
  orderDate: string;
  estimatedDelivery?: string;
  actualDelivery?: string;
  buyerId: string;
}

export interface MarketData {
  crop: string;
  price: string;
  change: string;
  trend: 'up' | 'down';
  volume?: number;
  region?: string;
}

export interface NewsItem {
  id: number;
  title: string;
  summary: string;
  content?: string;
  time: string;
  category: 'market' | 'weather' | 'policy' | 'technology';
  image?: string;
}

export interface Conversation {
  id: number;
  participantId: string;
  participantName: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  avatar?: string;
}

export interface Message {
  id: number;
  conversationId: number;
  senderId: string;
  content: string;
  timestamp: string;
  type: 'text' | 'image' | 'location';
}