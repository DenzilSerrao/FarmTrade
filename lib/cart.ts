import AsyncStorage from '@react-native-async-storage/async-storage';
import { CartItem } from '../types/payment';

const CART_STORAGE_KEY = 'farm_trade_cart';

class CartService {
  // Get cart items from storage
  async getCartItems(): Promise<CartItem[]> {
    try {
      const cartData = await AsyncStorage.getItem(CART_STORAGE_KEY);
      return cartData ? JSON.parse(cartData) : [];
    } catch (error) {
      console.error('Error getting cart items:', error);
      return [];
    }
  }

  // Add item to cart
  async addToCart(item: Omit<CartItem, 'id' | 'totalPrice'>): Promise<void> {
    try {
      const cartItems = await this.getCartItems();
      
      // Check if item already exists
      const existingItemIndex = cartItems.findIndex(
        cartItem => cartItem.productId === item.productId && cartItem.sellerId === item.sellerId
      );

      const newItem: CartItem = {
        ...item,
        id: `${item.productId}_${item.sellerId}_${Date.now()}`,
        totalPrice: item.quantity * item.pricePerUnit,
      };

      if (existingItemIndex >= 0) {
        // Update existing item quantity
        const existingItem = cartItems[existingItemIndex];
        const newQuantity = existingItem.quantity + item.quantity;
        
        if (newQuantity <= item.maxQuantity) {
          cartItems[existingItemIndex] = {
            ...existingItem,
            quantity: newQuantity,
            totalPrice: newQuantity * existingItem.pricePerUnit,
          };
        } else {
          throw new Error(`Cannot add more than ${item.maxQuantity} ${item.unit}`);
        }
      } else {
        cartItems.push(newItem);
      }

      await AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error;
    }
  }

  // Update cart item quantity
  async updateCartItem(itemId: string, quantity: number): Promise<void> {
    try {
      const cartItems = await this.getCartItems();
      const itemIndex = cartItems.findIndex(item => item.id === itemId);

      if (itemIndex >= 0) {
        if (quantity <= 0) {
          cartItems.splice(itemIndex, 1);
        } else if (quantity <= cartItems[itemIndex].maxQuantity) {
          cartItems[itemIndex].quantity = quantity;
          cartItems[itemIndex].totalPrice = quantity * cartItems[itemIndex].pricePerUnit;
        } else {
          throw new Error(`Cannot add more than ${cartItems[itemIndex].maxQuantity} ${cartItems[itemIndex].unit}`);
        }

        await AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
      }
    } catch (error) {
      console.error('Error updating cart item:', error);
      throw error;
    }
  }

  // Remove item from cart
  async removeFromCart(itemId: string): Promise<void> {
    try {
      const cartItems = await this.getCartItems();
      const filteredItems = cartItems.filter(item => item.id !== itemId);
      await AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(filteredItems));
    } catch (error) {
      console.error('Error removing from cart:', error);
      throw error;
    }
  }

  // Clear entire cart
  async clearCart(): Promise<void> {
    try {
      await AsyncStorage.removeItem(CART_STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing cart:', error);
      throw error;
    }
  }

  // Get cart summary
  async getCartSummary() {
    try {
      const cartItems = await this.getCartItems();
      const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
      const subtotal = cartItems.reduce((sum, item) => sum + item.totalPrice, 0);
      
      return {
        totalItems,
        subtotal,
        itemCount: cartItems.length,
      };
    } catch (error) {
      console.error('Error getting cart summary:', error);
      return { totalItems: 0, subtotal: 0, itemCount: 0 };
    }
  }
}

export default new CartService();