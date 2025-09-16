import React, { useState } from 'react';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
} from 'react-native';
import {
  Bell,
  Search,
  Filter,
  Heart,
  Star,
  Home,
  Compass,
  ShoppingCart,
  User,
} from 'lucide-react-native';
import { getShelfItems } from '@/lib/api';
import { router } from 'expo-router';

export default function HomeScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchFilters, setSearchFilters] = useState({
    closestToMe: false,
    cheapest: true,
    highStock: false,
    fresh: false,
  });

  const productCategories = [
    { name: 'Veggies', image: require('../../assets/images/veggies.jpg') },
    { name: 'Herbs', image: require('../../assets/images/herbs.jpg') },
    { name: 'Fruits', image: require('../../assets/images/fruits.png') },
    { name: 'Grains', image: require('../../assets/images/grains.png') },
  ];

  useEffect(() => {
    loadFeaturedProducts();
  }, [searchFilters]);

  const loadFeaturedProducts = async () => {
    try {
      const response = await getShelfItems();
      if (response.success) {
        let products = response.data.items || [];
        
        // Apply filters
        if (searchFilters.cheapest) {
          products = products.sort((a, b) => a.price - b.price);
        }
        
        if (searchFilters.highStock) {
          products = products.filter(item => item.quantity > 50);
        }
        
        if (searchFilters.fresh) {
          const threeDaysAgo = new Date();
          threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
          products = products.filter(item => new Date(item.harvestDate) >= threeDaysAgo);
        }
        
        // Take first 8 items for featured section
        setFeaturedProducts(products.slice(0, 8));
      }
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      await loadFeaturedProducts();
      return;
    }

    try {
      // Implement search with filters
      const response = await getShelfItems();
      if (response.success) {
        let products = response.data.items || [];
        
        // Filter by search query
        products = products.filter(item =>
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.description.toLowerCase().includes(searchQuery.toLowerCase())
        );
        
        // Apply other filters
        if (searchFilters.cheapest) {
          products = products.sort((a, b) => a.price - b.price);
        }
        
        setFeaturedProducts(products.slice(0, 8));
      }
    } catch (error) {
      console.error('Error searching products:', error);
    }
  };

  const toggleFilter = (filterKey: string) => {
    setSearchFilters(prev => ({
      ...prev,
      [filterKey]: !prev[filterKey],
    }));
  };

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 pt-16 pb-4">
        <TouchableOpacity>
          <View className="w-6 h-6 items-center justify-center">
            <View className="w-full h-1 bg-green-500 rounded-full mb-1"></View>
            <View className="w-full h-1 bg-green-500 rounded-full mb-1"></View>
            <View className="w-full h-1 bg-green-500 rounded-full"></View>
          </View>
        </TouchableOpacity>
        <Image source={require('../../assets/images/cropkart-logo.png')} className="w-24 h-8" />
        <TouchableOpacity className="relative">
          <Bell size={24} color="#000" />
          <View className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1">
        {/* Categories Section */}
        <View className="flex-row justify-around py-4">
          {productCategories.map((category, index) => (
            <TouchableOpacity key={index} className="items-center">
              <Image source={category.image} className="w-16 h-16 rounded-full" />
              <Text className="text-xs text-gray-500 mt-2">{category.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Search Bar */}
        <View className="mx-6 my-4">
          <View className="flex-row items-center justify-between px-4 py-2 border border-gray-300 rounded-full">
          <Search size={20} color="#9CA3AF" />
          <TextInput
            className="flex-1 ml-2 text-base text-gray-800"
            placeholder="Search.."
            placeholderTextColor="#9ca3af"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
          />
          <TouchableOpacity 
            className="bg-green-500 w-10 h-10 rounded-full items-center justify-center ml-2"
            onPress={handleSearch}
          >
            <Filter size={20} color="white" />
          </TouchableOpacity>
        </View>
          
          {/* Search Filters */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-6">
            <TouchableOpacity
              className={`mr-3 px-4 py-2 rounded-full border ${searchFilters.closestToMe ? 'bg-green-100 border-green-500' : 'bg-white border-gray-300'}`}
              onPress={() => toggleFilter('closestToMe')}
            >
              <Text className={`text-sm ${searchFilters.closestToMe ? 'text-green-700' : 'text-gray-600'}`}>
                Closest to me
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              className={`mr-3 px-4 py-2 rounded-full border ${searchFilters.cheapest ? 'bg-green-100 border-green-500' : 'bg-white border-gray-300'}`}
              onPress={() => toggleFilter('cheapest')}
            >
              <Text className={`text-sm ${searchFilters.cheapest ? 'text-green-700' : 'text-gray-600'}`}>
                Cheapest first
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              className={`mr-3 px-4 py-2 rounded-full border ${searchFilters.highStock ? 'bg-green-100 border-green-500' : 'bg-white border-gray-300'}`}
              onPress={() => toggleFilter('highStock')}
            >
              <Text className={`text-sm ${searchFilters.highStock ? 'text-green-700' : 'text-gray-600'}`}>
                High stock
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Hero Banner */}
        <View className="w-full px-6 mb-6">
          <Image source={require('../../assets/images/hero-banner.png')} className="w-full h-40 rounded-2xl" />
        </View>

        {/* Browse Products Section */}
        <View className="px-6">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-lg font-semibold text-gray-900">Browse Products</Text>
            <TouchableOpacity>
              <Text className="text-sm font-semibold text-green-600">View all</Text>
            </TouchableOpacity>
          </View>
          <View className="flex-row flex-wrap justify-between">
            {featuredProducts.map((product) => (
              <TouchableOpacity 
                key={product._id || product.id} 
                className="w-[48%] mb-6 bg-white rounded-lg border border-gray-200 shadow-sm"
                onPress={() => router.push({
                  pathname: '/product/[id]',
                  params: { id: product._id || product.id }
                })}
              >
                <Image 
                  source={{ 
                    uri: product.primaryImage?.urls?.medium || 
                         'https://images.pexels.com/photos/1300972/pexels-photo-1300972.jpeg?auto=compress&cs=tinysrgb&w=200' 
                  }} 
                  className="w-full h-32 rounded-t-lg" 
                />
                <TouchableOpacity className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md">
                  <Heart size={20} color="#EF4444" fill="#EF4444" />
                </TouchableOpacity>
                <View className="p-3">
                  <Text className="text-base font-medium text-gray-900">{product.name}</Text>
                  <Text className="text-lg font-bold text-gray-900 mt-1">₹{product.price}/{product.unit}</Text>
                  <Text className="text-sm text-gray-500">by {product.ownerId?.name || 'Unknown'}</Text>
                  <View className="flex-row items-center mt-1">
                    <Star size={14} color="#F59E0B" fill="#F59E0B" />
                    <Text className="ml-1 text-sm text-gray-500">{product.ownerId?.rating || '4.5'}</Text>
                    <Text className="text-sm text-gray-400"> ({product.ownerId?.totalTrades || 0})</Text>
                    {product.organic && (
                      <View className="ml-2 bg-green-100 px-2 py-1 rounded">
                        <Text className="text-xs text-green-700 font-medium">Organic</Text>
                      </View>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
        </View>
      </ScrollView>
    </View>
  );
}