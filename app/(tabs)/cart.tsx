import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react-native';
import CartService from '@/lib/cart';
import { CartItem } from '@/types/payment';

export default function CartScreen() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [subtotal, setSubtotal] = useState(0);

  useEffect(() => {
    loadCartItems();
  }, []);

  const loadCartItems = async () => {
    try {
      const items = await CartService.getCartItems();
      setCartItems(items);
      calculateSubtotal(items);
    } catch (error) {
      console.error('Error loading cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateSubtotal = (items: CartItem[]) => {
    const total = items.reduce((sum, item) => sum + item.totalPrice, 0);
    setSubtotal(total);
  };

  const updateQuantity = async (itemId: string, newQuantity: number) => {
    try {
      await CartService.updateCartItem(itemId, newQuantity);
      await loadCartItems();
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to update quantity');
    }
  };

  const removeItem = async (itemId: string) => {
    Alert.alert(
      'Remove Item',
      'Are you sure you want to remove this item from cart?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await CartService.removeFromCart(itemId);
              await loadCartItems();
            } catch (error) {
              Alert.alert('Error', 'Failed to remove item');
            }
          },
        },
      ]
    );
  };

  const proceedToCheckout = () => {
    if (cartItems.length === 0) {
      Alert.alert('Empty Cart', 'Please add items to cart before proceeding');
      return;
    }
    router.push('/checkout');
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text>Loading cart...</Text>
      </View>
    );
  }

  if (cartItems.length === 0) {
    return (
      <View className="flex-1 bg-gray-50">
        <View className="px-6 pt-16 pb-5 bg-white">
          <Text className="text-2xl font-bold text-gray-800">Shopping Cart</Text>
        </View>
        
        <View className="flex-1 justify-center items-center px-6">
          <ShoppingBag size={64} color="#D1D5DB" />
          <Text className="text-xl font-semibold text-gray-800 mt-4">Your cart is empty</Text>
          <Text className="text-sm text-gray-500 text-center mt-2">
            Add some fresh produce to get started
          </Text>
          <TouchableOpacity 
            className="bg-green-500 px-6 py-3 rounded-lg mt-6"
            onPress={() => router.push('/(tabs)/shelf')}
          >
            <Text className="text-white text-base font-semibold">Start Shopping</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="px-6 pt-16 pb-5 bg-white">
        <Text className="text-2xl font-bold text-gray-800">Shopping Cart</Text>
        <Text className="text-sm text-gray-500 mt-0.5">{cartItems.length} items</Text>
      </View>

      {/* Cart Items */}
      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        {cartItems.map((item) => (
          <View key={item.id} className="bg-white rounded-xl p-4 mt-4 flex-row border border-gray-200">
            <Image 
              source={{ uri: item.image || 'https://images.pexels.com/photos/1300972/pexels-photo-1300972.jpeg?auto=compress&cs=tinysrgb&w=200' }}
              className="w-20 h-20 rounded-lg"
            />
            
            <View className="flex-1 ml-3">
              <Text className="text-base font-semibold text-gray-800">{item.productName}</Text>
              <Text className="text-xs text-gray-500 mt-0.5">by {item.sellerName}</Text>
              <Text className="text-xs text-gray-400 mt-0.5">{item.sellerLocation}</Text>
              
              <View className="flex-row justify-between items-center mt-2">
                <Text className="text-sm text-gray-500">₹{item.pricePerUnit}/{item.unit}</Text>
                <Text className="text-base font-bold text-green-500">₹{item.totalPrice}</Text>
              </View>

              <View className="flex-row justify-between mt-2">
                <Text className="text-xs text-blue-500">
                  {item.deliveryMode === 'delivery' ? '🚚 Delivery' : '📦 Pickup'}
                </Text>
                <Text className="text-xs text-gray-500">
                  Est: {item.estimatedDelivery}
                </Text>
              </View>
            </View>

            <View className="items-end justify-between">
              <TouchableOpacity
                className="p-1"
                onPress={() => removeItem(item.id)}
              >
                <Trash2 size={18} color="#EF4444" />
              </TouchableOpacity>

              <View className="flex-row items-center bg-gray-100 rounded-md">
                <TouchableOpacity
                  className="p-2"
                  onPress={() => updateQuantity(item.id, item.quantity - 1)}
                >
                  <Minus size={16} color="#6B7280" />
                </TouchableOpacity>
                
                <Text className="text-base font-semibold text-gray-800 min-w-[30px] text-center">
                  {item.quantity}
                </Text>
                
                <TouchableOpacity
                  className="p-2"
                  onPress={() => updateQuantity(item.id, item.quantity + 1)}
                >
                  <Plus size={16} color="#6B7280" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Footer */}
      <View className="bg-white px-6 py-5 border-t border-gray-200">
        <View className="mb-4">
          <View className="flex-row justify-between items-center">
            <Text className="text-base text-gray-500">
              Subtotal ({cartItems.length} items)
            </Text>
            <Text className="text-lg font-bold text-gray-800">₹{subtotal}</Text>
          </View>
        </View>

        <TouchableOpacity 
          className="bg-green-500 flex-row items-center justify-center py-4 rounded-xl gap-2"
          onPress={proceedToCheckout}
        >
          <Text className="text-white text-base font-semibold">Proceed to Checkout</Text>
          <ArrowRight size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
}