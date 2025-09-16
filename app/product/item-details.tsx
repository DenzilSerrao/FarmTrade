import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { 
  ArrowLeft, 
  Edit3, 
  Trash2, 
  Package, 
  Calendar,
  Star,
  MapPin,
  Clock,
  Leaf,
  StopCircle,
  Play
} from 'lucide-react-native';
import { getShelfItem, deleteShelfItem, toggleItemAvailability } from '@/lib/api';

const { width: screenWidth } = Dimensions.get('window');

interface ShelfItem {
  _id: string;
  name: string;
  description: string;
  category: string;
  quantity: number;
  unit: string;
  price: number;
  minOrderQuantity: number;
  lowStockThreshold: number;
  organic: boolean;
  available: boolean;
  harvestDate?: string;
  expiryDate?: string;
  qualityGrade: string;
  images: Array<{
    url: string;
    isPrimary: boolean;
  }>;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export default function ItemDetailsScreen() {
  const { itemId } = useLocalSearchParams();
  const [item, setItem] = useState<ShelfItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadItemDetails();
  }, [itemId]);

  const loadItemDetails = async () => {
    try {
      setLoading(true);
      const response = await getShelfItem(itemId as string);
      if (response.success) {
        setItem(response.item || response.data);
      } else {
        Alert.alert('Error', 'Failed to load item details');
        router.back();
      }
    } catch (error) {
      console.error('Error loading item:', error);
      Alert.alert('Error', 'Failed to load item details');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAvailability = async () => {
    if (!item) return;

    setUpdating(true);
    try {
      const response = await toggleItemAvailability(item._id, !item.available);
      if (response.success) {
        setItem(prev => prev ? { ...prev, available: !prev.available } : null);
        Alert.alert(
          'Success', 
          item.available ? 'Item is now hidden from marketplace' : 'Item is now available for sale'
        );
      } else {
        Alert.alert('Error', 'Failed to update item availability');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update item availability');
    } finally {
      setUpdating(false);
    }
  };

  const handleEdit = () => {
    if (!item) return;
    
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
        organic: item.organic.toString(),
        expiryDate: item.expiryDate || '',
        qualityGrade: item.qualityGrade || 'B',
      }
    });
  };

  const handleDelete = () => {
    if (!item) return;

    Alert.alert(
      'Delete Item',
      'Are you sure you want to permanently delete this item from your shelf?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await deleteShelfItem(item._id);
              if (response.success) {
                Alert.alert('Success', 'Item deleted successfully', [
                  { text: 'OK', onPress: () => router.back() }
                ]);
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

  const handleImageScroll = (event: any) => {
    const contentOffset = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffset / screenWidth);
    setCurrentImageIndex(index);
  };

  if (loading) {
    return (
      <View className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color="#22C55E" />
        <Text className="text-gray-500 mt-2">Loading item details...</Text>
      </View>
    );
  }

  if (!item) {
    return (
      <View className="flex-1 bg-white justify-center items-center">
        <Text className="text-gray-500 text-lg">Item not found</Text>
        <TouchableOpacity 
          className="mt-4 bg-green-500 px-6 py-3 rounded-lg"
          onPress={() => router.back()}
        >
          <Text className="text-white font-semibold">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const images = item.images?.length > 0 ? item.images : [
    { url: 'https://images.pexels.com/photos/568383/pexels-photo-568383.jpeg?auto=compress&cs=tinysrgb&w=400', isPrimary: true }
  ];

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row justify-between items-center px-4 pt-16 pb-4 bg-white border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="p-2">
          <ArrowLeft size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text className="flex-1 text-lg font-semibold text-gray-800 text-center">
          Item Details
        </Text>
        <View className="flex-row gap-2">
          <TouchableOpacity onPress={handleEdit} className="p-2">
            <Edit3 size={20} color="#6B7280" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDelete} className="p-2">
            <Trash2 size={20} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Image Carousel */}
        <View className="relative">
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleImageScroll}
            scrollEventThrottle={16}
          >
            {images.map((image, index) => (
              <View key={index} style={{ width: screenWidth }}>
                <Image 
                  source={{ uri: image.url }} 
                  style={{ width: screenWidth, height: 300 }}
                  resizeMode="cover"
                />
              </View>
            ))}
          </ScrollView>
          
          {/* Image Indicators */}
          {images.length > 1 && (
            <View className="absolute bottom-4 left-0 right-0 flex-row justify-center">
              {images.map((_, index) => (
                <View
                  key={index}
                  className={`w-2 h-2 rounded-full mx-1 ${
                    index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                  }`}
                />
              ))}
            </View>
          )}

          {/* Status Badge */}
          <View className="absolute top-4 right-4">
            {!item.available && (
              <View className="bg-red-500 px-3 py-1 rounded-full">
                <Text className="text-white text-sm font-medium">Not Selling</Text>
              </View>
            )}
            {item.organic && (
              <View className="bg-green-500 px-3 py-1 rounded-full mt-2">
                <Text className="text-white text-sm font-medium">Organic</Text>
              </View>
            )}
          </View>
        </View>

        {/* Item Info */}
        <View className="px-6 py-6">
          <View className="flex-row justify-between items-start">
            <View className="flex-1">
              <Text className="text-2xl font-bold text-gray-800">{item.name}</Text>
              <Text className="text-lg font-semibold text-green-600 mt-1">
                ${item.price} per {item.unit.slice(0, -1) || 'unit'}
              </Text>
            </View>
            
            {/* Quality Grade */}
            <View className="bg-gray-100 px-3 py-2 rounded-lg">
              <View className="flex-row items-center">
                <Star size={16} color="#F59E0B" />
                <Text className="text-sm font-semibold text-gray-700 ml-1">
                  Grade {item.qualityGrade}
                </Text>
              </View>
            </View>
          </View>

          {/* Stats Row */}
          <View className="flex-row gap-4 mt-4">
            <View className="flex-1 bg-gray-50 rounded-lg p-3">
              <Package size={20} color="#6B7280" />
              <Text className="text-lg font-bold text-gray-800 mt-1">{item.quantity}</Text>
              <Text className="text-xs text-gray-500">{item.unit} Available</Text>
            </View>
            
            <View className="flex-1 bg-gray-50 rounded-lg p-3">
              <Text className="text-lg font-bold text-gray-800">{item.minOrderQuantity}</Text>
              <Text className="text-xs text-gray-500">Min Order</Text>
            </View>
            
            {item.lowStockThreshold && (
              <View className="flex-1 bg-gray-50 rounded-lg p-3">
                <Text className="text-lg font-bold text-red-600">{item.lowStockThreshold}</Text>
                <Text className="text-xs text-gray-500">Low Stock Alert</Text>
              </View>
            )}
          </View>

          {/* Description */}
          <View className="mt-6">
            <Text className="text-lg font-semibold text-gray-800 mb-2">Description</Text>
            <Text className="text-gray-600 leading-relaxed">
              {item.description || `Fresh ${item.name.toLowerCase()} directly from our farm. High quality produce grown with care.`}
            </Text>
          </View>

          {/* Details Grid */}
          <View className="mt-6">
            <Text className="text-lg font-semibold text-gray-800 mb-3">Details</Text>
            <View className="gap-3">
              <View className="flex-row items-center">
                <View className="w-8 h-8 bg-gray-100 rounded-full items-center justify-center">
                  <Package size={16} color="#6B7280" />
                </View>
                <Text className="ml-3 text-gray-800">Category: {item.category}</Text>
              </View>
              
              {item.harvestDate && (
                <View className="flex-row items-center">
                  <View className="w-8 h-8 bg-gray-100 rounded-full items-center justify-center">
                    <Calendar size={16} color="#6B7280" />
                  </View>
                  <Text className="ml-3 text-gray-800">
                    Harvested: {new Date(item.harvestDate).toLocaleDateString()}
                  </Text>
                </View>
              )}
              
              {item.expiryDate && (
                <View className="flex-row items-center">
                  <View className="w-8 h-8 bg-gray-100 rounded-full items-center justify-center">
                    <Clock size={16} color="#6B7280" />
                  </View>
                  <Text className="ml-3 text-gray-800">
                    Expires: {new Date(item.expiryDate).toLocaleDateString()}
                  </Text>
                </View>
              )}
              
              <View className="flex-row items-center">
                <View className="w-8 h-8 bg-gray-100 rounded-full items-center justify-center">
                  <Leaf size={16} color="#22C55E" />
                </View>
                <Text className="ml-3 text-gray-800">
                  {item.organic ? 'Organic' : 'Conventional'} farming
                </Text>
              </View>
            </View>
          </View>

          {/* Tags */}
          {item.tags && item.tags.length > 0 && (
            <View className="mt-6">
              <Text className="text-lg font-semibold text-gray-800 mb-3">Tags</Text>
              <View className="flex-row flex-wrap gap-2">
                {item.tags.map((tag, index) => (
                  <View key={index} className="bg-green-100 px-3 py-1 rounded-full">
                    <Text className="text-green-700 text-sm font-medium">{tag}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Action Buttons */}
          <View className="flex-row gap-3 mt-8">
            <TouchableOpacity
              className={`flex-1 flex-row items-center justify-center py-4 rounded-xl ${
                item.available ? 'bg-red-500' : 'bg-green-500'
              }`}
              onPress={handleToggleAvailability}
              disabled={updating}
            >
              {updating ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  {item.available ? (
                    <StopCircle size={20} color="#FFFFFF" />
                  ) : (
                    <Play size={20} color="#FFFFFF" />
                  )}
                  <Text className="text-white font-semibold ml-2">
                    {item.available ? 'Stop Selling' : 'Start Selling'}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Timestamps */}
          <View className="mt-6 pt-6 border-t border-gray-100">
            <Text className="text-sm text-gray-500">
              Added: {new Date(item.createdAt).toLocaleDateString()}
            </Text>
            <Text className="text-sm text-gray-500 mt-1">
              Updated: {new Date(item.updatedAt).toLocaleDateString()}
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}