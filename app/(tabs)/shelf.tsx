import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { Plus, TriangleAlert, Package, Calendar, CreditCard, Trash2, Eye } from 'lucide-react-native';
import { getShelfItems, deleteShelfItem, getShelfAnalytics } from '@/lib/api';
import { useFocusEffect } from '@react-navigation/native';

interface ShelfItemImage {
  filename: string;
  originalName: string;
  variants: {
    thumbnail: { filename: string; url: string };
    medium: { filename: string; url: string };
    large: { filename: string; url: string };
    original: { filename: string; url: string };
  };
  alt: string;
  isPrimary: boolean;
  uploadedAt: string;
}

interface ShelfItem {
  _id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  quantity: number;
  unit: string;
  minOrderQuantity: number;
  lowStockThreshold: number;
  images: ShelfItemImage[];
  ownerId: string;
  available: boolean;
  organic: boolean;
  harvestDate?: string;
  expiryDate?: string;
  location?: string;
  qualityGrade: 'A' | 'B' | 'C';
  tags: string[];
  views: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  // Virtual fields from backend
  lowStock?: boolean;
  daysUntilExpiry?: number;
}

interface ShelfAnalytics {
  totalItems: number;
  lowStockItems: number;
  expiringItems: number;
  totalValue: number;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  items?: T; // Sometimes backend returns 'items' instead of 'data'
  analytics?: T; // For analytics response
  message?: string;
}

export default function ShelfScreen() {
  const [shelfItems, setShelfItems] = useState<ShelfItem[]>([]);
  const [analytics, setAnalytics] = useState<ShelfAnalytics>({
    totalItems: 0,
    expiringItems: 0,
    lowStockItems: 0,
    totalValue: 0
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    // Refresh on initial render
    loadShelfData();
  }, []);
  
  // refresh when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadShelfData();
    }, [])
  );

  const loadShelfData = async () => {
    try {
      const [itemsResponse, analyticsResponse] = await Promise.all([
        getShelfItems() as unknown as Promise<ApiResponse<ShelfItem[]>>,
        getShelfAnalytics() as Promise<ApiResponse<ShelfAnalytics>>,
      ]);

      // Handle items response
      if (itemsResponse.success) {
        setShelfItems(itemsResponse.data || itemsResponse.items || []);
      } else {
        Alert.alert('Error', itemsResponse.message || 'Failed to load shelf items');
      }

      // Handle analytics response
      if (analyticsResponse.success) {
        setAnalytics(analyticsResponse.analytics || analyticsResponse.data || analytics);
      } else {
        console.warn('Failed to load analytics:', analyticsResponse.message);
      }
    } catch (error) {
      console.error('Error loading shelf data:', error);
      Alert.alert('Error', 'Failed to load shelf items');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadShelfData();
    setRefreshing(false);
  };

  const handleDeleteItem = (id: string) => {
    Alert.alert(
      'Delete Item',
      'Are you sure you want to remove this item from your shelf?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await deleteShelfItem(id) as ApiResponse<any>;
              if (response.success) {
                setShelfItems(prev => prev.filter(item => item._id !== id));
                // Refresh analytics
                loadShelfData();
              } else {
                Alert.alert('Error', 'Failed to delete item');
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to delete item');
            }
          }
        }
      ]
    );
  };

  const handleAddItem = () => {
    router.push('/add-item');
  };

  const handleEditItem = (item: ShelfItem) => {
    router.push({
      pathname: '/add-item',
      params: { 
        editMode: 'true',
        itemId: item._id,
        name: item.name,
        description: item.description,
        category: item.category,
        quantity: item.quantity.toString(),
        unit: item.unit,
        price: item.price.toString(),
        minOrderQuantity: item.minOrderQuantity?.toString() || '1',
        organic: item.organic?.toString() || 'false',
        expiryDate: item.expiryDate || '',
        qualityGrade: item.qualityGrade || 'B',
      }
    });
  };

  const handleViewItem = (item: ShelfItem) => {
    router.push({
      pathname: '/product/item-details', // Fixed path
      params: { itemId: item._id }
    });
  };

  // Helper function to get image URL
  const getImageUrl = (item: ShelfItem): string => {
    const primaryImage = item.images?.find(img => img.isPrimary);
    const firstImage = item.images?.[0];
    
    if (primaryImage?.variants?.medium?.url) {
      return primaryImage.variants.medium.url;
    }
    if (firstImage?.variants?.medium?.url) {
      return firstImage.variants.medium.url;
    }
    // Fallback image
    return 'https://images.pexels.com/photos/568383/pexels-photo-568383.jpeg?auto=compress&cs=tinysrgb&w=200';
  };

  if (loading) {
    return (
      <View className="flex-1 bg-gray-50 justify-center items-center">
        <ActivityIndicator size="large" color="#22C55E" />
        <Text className="text-gray-500 mt-2">Loading your shelf...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="flex-row justify-between items-center px-6 pt-16 pb-5 bg-white">
        <View>
          <Text className="text-2xl font-bold text-gray-800">My Shelf</Text>
          <Text className="text-sm text-gray-500 mt-0.5">Manage your inventory</Text>
        </View>
        <TouchableOpacity 
          className="bg-green-500 rounded-xl p-3"
          onPress={handleAddItem}
        >
          <Plus size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Low Stock Alert */}
      {analytics.lowStockItems > 0 && (
        <View className="flex-row items-center bg-yellow-100 p-3 mx-6 mt-4 rounded-lg border border-yellow-500">
          <TriangleAlert size={20} color="#F59E0B" />
          <Text className="ml-2 text-sm text-yellow-900 font-medium">
            {analytics.lowStockItems} item{analytics.lowStockItems > 1 ? 's' : ''} running low
          </Text>
        </View>
      )}

      {/* Stats */}
      <View className="flex-row px-6 mt-4 gap-3">
        <View className="flex-1 bg-white rounded-xl p-4 items-center border border-gray-200">
          <Package size={20} color="#22C55E" />
          <Text className="text-xl font-bold text-gray-800 mt-1">{analytics.totalItems}</Text>
          <Text className="text-xs text-gray-500 mt-0.5">Total Items</Text>
        </View>
        <View className="flex-1 bg-white rounded-xl p-4 items-center border border-gray-200">
          <Calendar size={20} color="#F59E0B" />
          <Text className="text-xl font-bold text-gray-800 mt-1">{analytics.expiringItems}</Text>
          <Text className="text-xs text-gray-500 mt-0.5">Expiring Soon</Text>
        </View>
        <View className="flex-1 bg-white rounded-xl p-4 items-center border border-gray-200">
          <TriangleAlert size={20} color="#EF4444" />
          <Text className="text-xl font-bold text-gray-800 mt-1">{analytics.lowStockItems}</Text>
          <Text className="text-xs text-gray-500 mt-0.5">Low Stock</Text>
        </View>
      </View>

      {/* Shelf Items */}
      <ScrollView 
        className="flex-1 px-6" 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View className="pt-6 gap-4">
          {shelfItems.length === 0 ? (
            <View className="items-center py-20">
              <Package size={48} color="#9CA3AF" />
              <Text className="text-gray-500 text-lg font-medium mt-4">No items on your shelf</Text>
              <Text className="text-gray-400 text-sm mt-1 text-center px-8">
                Add your first crop to start selling
              </Text>
              <TouchableOpacity 
                className="bg-green-500 px-6 py-3 rounded-lg mt-4"
                onPress={handleAddItem}
              >
                <Text className="text-white font-semibold">Add Item</Text>
              </TouchableOpacity>
            </View>
          ) : (
            shelfItems.map((item) => (
              <TouchableOpacity
                key={item._id}
                className={`
                  bg-white rounded-xl p-4 border flex-row items-center
                  ${item.lowStock ? 'border-yellow-500 bg-yellow-50' : 'border-gray-200'}
                  ${!item.available ? 'opacity-60' : ''}
                `}
                onPress={() => handleViewItem(item)}
              >
                <Image 
                  source={{ uri: getImageUrl(item) }} 
                  className="w-15 h-15 rounded-lg" 
                />
                
                {item.lowStock && (
                  <View className="absolute top-2 left-2 bg-yellow-100 rounded flex-row items-center px-1.5 py-0.5">
                    <TriangleAlert size={14} color="#F59E0B" />
                    <Text className="text-xs text-yellow-900 font-medium ml-0.5">Low Stock</Text>
                  </View>
                )}

                {!item.available && (
                  <View className="absolute top-2 right-2 bg-red-100 rounded px-2 py-1">
                    <Text className="text-xs text-red-900 font-medium">Not Selling</Text>
                  </View>
                )}

                <View className="flex-1 ml-4">
                  <Text className="text-base font-semibold text-gray-800">{item.name}</Text>
                  <Text className="text-sm text-gray-500 mt-0.5">
                    {item.quantity} {item.unit}
                  </Text>
                  <Text className="text-sm font-semibold text-green-500 mt-1">
                    ${item.price}/{item.unit.slice(0, -1) || 'unit'}
                  </Text>
                  {item.expiryDate && (
                    <Text className="text-xs text-gray-500 mt-0.5">
                      Expires: {new Date(item.expiryDate).toLocaleDateString()}
                    </Text>
                  )}
                </View>

                <View className="flex-row gap-2">
                  <TouchableOpacity 
                    className="p-2"
                    onPress={(e) => {
                      e.stopPropagation();
                      handleViewItem(item);
                    }}
                  >
                    <Eye size={16} color="#6B7280" />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    className="p-2"
                    onPress={(e) => {
                      e.stopPropagation();
                      handleEditItem(item);
                    }}
                  >
                    <CreditCard size={16} color="#6B7280" />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    className="p-2"
                    onPress={(e) => {
                      e.stopPropagation();
                      handleDeleteItem(item._id);
                    }}
                  >
                    <Trash2 size={16} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}