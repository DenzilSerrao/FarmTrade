import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { Bell, Search, Filter, Heart, Star, MapPin } from 'lucide-react-native';
import { getMarketplaceItems, searchMarketplace } from '@/lib/api';
import { router } from 'expo-router';

// Marketplace item interface based on your backend schema
interface MarketplaceItem {
  _id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  quantity: number;
  unit: string;
  minOrderQuantity: number;
  images: Array<{
    filename: string;
    variants: {
      thumbnail: { filename: string; url: string };
      medium: { filename: string; url: string };
      large: { filename: string; url: string };
      original: { filename: string; url: string };
    };
    isPrimary: boolean;
  }>;
  ownerId: {
    _id: string;
    name: string;
    rating?: number;
    totalTrades?: number;
    location?: string;
  };
  available: boolean;
  organic: boolean;
  harvestDate?: string;
  expiryDate?: string;
  qualityGrade: 'A' | 'B' | 'C';
  tags: string[];
  views: number;
  createdAt: string;
  location?: string;
  // Virtual fields
  lowStock?: boolean;
  daysUntilExpiry?: number;
}

interface ApiResponse {
  success: boolean;
  items: MarketplaceItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  message?: string;
}

// Search filters type
type SearchFilters = {
  closestToMe: boolean;
  cheapest: boolean;
  highStock: boolean;
  fresh: boolean;
  organic: boolean;
};

export default function HomeScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [featuredProducts, setFeaturedProducts] = useState<MarketplaceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [refreshing, setRefreshing] = useState(false); 
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    closestToMe: false,
    cheapest: true,
    highStock: false,
    fresh: false,
    organic: false,
  });

  const productCategories = [
    { name: 'Veggies', image: require('../../assets/images/veggies.jpg') },
    { name: 'Herbs', image: require('../../assets/images/herbs.jpg') },
    { name: 'Fruits', image: require('../../assets/images/fruits.png') },
    { name: 'Grains', image: require('../../assets/images/grains.png') },
  ];

  const onRefresh = async () => {
    setRefreshing(true);
    await loadFeaturedProducts();
    setRefreshing(false);
  };

  useEffect(() => {
    loadFeaturedProducts();
  }, []);

  // Apply filters whenever they change
  useEffect(() => {
    if (!loading) {
      handleSearch();
    }
  }, [searchFilters]);

  const loadFeaturedProducts = async () => {
    try {
      setLoading(true);
      const response = await getMarketplaceItems({
        page: 1,
        limit: 12,
        sortBy: 'recent',
      }) as ApiResponse;

      if (response.success) {
        console.log('Fetched products');
        setFeaturedProducts(response.items || []);
      } else {
        Alert.alert('Error', response.message || 'Failed to load products');
      }
    } catch (error) {
      console.error('Error loading products:', error);
      Alert.alert('Error', 'Failed to load marketplace items');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    try {
      setSearching(true);
      
      // Build filter parameters
      const filterParams: any = {};
      
      if (searchFilters.cheapest) {
        filterParams.sortBy = 'price_asc';
      } else {
        filterParams.sortBy = 'recent';
      }
      
      if (searchFilters.highStock) {
        filterParams.minQuantity = 50;
      }
      
      if (searchFilters.fresh && searchFilters.fresh) {
        const threeDaysAgo = new Date();
        threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
        filterParams.harvestAfter = threeDaysAgo.toISOString();
      }
      
      if (searchFilters.organic) {
        filterParams.organic = true;
      }
      
      if (searchFilters.closestToMe) {
        // TODO: Implement location-based filtering
        filterParams.sortBy = 'distance';
      }

      let response: ApiResponse;
      
      if (searchQuery.trim()) {
        response = await searchMarketplace(searchQuery, filterParams) as ApiResponse;
      } else {
        response = await getMarketplaceItems({
          page: 1,
          limit: 12,
          ...filterParams,
        }) as ApiResponse;
      }

      if (response.success) {
        setFeaturedProducts(response.items || []);
      } else {
        Alert.alert('Error', response.message || 'Search failed');
      }
    } catch (error) {
      console.error('Error searching products:', error);
      Alert.alert('Error', 'Search failed');
    } finally {
      setSearching(false);
    }
  };

  const toggleFilter = (filterKey: keyof SearchFilters) => {
    setSearchFilters(prev => ({
      ...prev,
      [filterKey]: !prev[filterKey],
    }));
  };

  const handleCategoryPress = (categoryName: string) => {
    // Navigate to existing marketplace or create category filter
    router.push({
      pathname: '/(tabs)/marketplace' as any, // Cast to bypass TypeScript route checking
      params: { category: categoryName.toLowerCase() }
    });
  };

  const handleProductPress = (product: MarketplaceItem) => {
    router.push({
      pathname: '/product/item-details',
      params: { itemId: product._id }
    });
  };

  const getImageUrl = (item: MarketplaceItem): string => {
    const primaryImage = item.images?.find(img => img.isPrimary);
    const firstImage = item.images?.[0];
    
    if (primaryImage?.variants?.medium?.url) {
      return primaryImage.variants.medium.url;
    }
    if (firstImage?.variants?.medium?.url) {
      return firstImage.variants.medium.url;
    }
    return 'https://images.pexels.com/photos/1300972/pexels-photo-1300972.jpeg?auto=compress&cs=tinysrgb&w=200';
  };

  const formatTimeAgo = (dateString: string): string => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  };

  return (
    <ScrollView 
      className="flex-1 bg-gray-50"
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={['#22C55E']} // Green color to match your theme
          tintColor="#22C55E"
        />
      }
    >
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

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Categories Section */}
        <View className="flex-row justify-around py-4 px-6">
          {productCategories.map((category, index) => (
            <TouchableOpacity 
              key={index} 
              className="items-center"
              onPress={() => handleCategoryPress(category.name)}
            >
              <Image source={category.image} className="w-16 h-16 rounded-full" />
              <Text className="text-xs text-gray-500 mt-2">{category.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Search Bar */}
        <View className="mx-6 my-4">
          <View className="flex-row items-center justify-between px-4 py-3 border border-gray-300 rounded-full">
            <Search size={20} color="#9CA3AF" />
            <TextInput
              className="flex-1 ml-3 text-base text-gray-800"
              placeholder="Search crops, farmers..."
              placeholderTextColor="#9ca3af"
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
            />
            <TouchableOpacity 
              className="bg-green-500 w-10 h-10 rounded-full items-center justify-center ml-2"
              onPress={handleSearch}
              disabled={searching}
            >
              {searching ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Filter size={20} color="white" />
              )}
            </TouchableOpacity>
          </View>
          
          {/* Search Filters - Fixed spacing */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            className="mt-3"
            contentContainerStyle={{ paddingHorizontal: 0 }}
          >
            <TouchableOpacity
              className={`mr-3 px-4 py-2 rounded-full border ${
                searchFilters.closestToMe ? 'bg-green-100 border-green-500' : 'bg-white border-gray-300'
              }`}
              onPress={() => toggleFilter('closestToMe')}
            >
              <Text className={`text-sm ${
                searchFilters.closestToMe ? 'text-green-700' : 'text-gray-600'
              }`}>
                Closest to me
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              className={`mr-3 px-4 py-2 rounded-full border ${
                searchFilters.cheapest ? 'bg-green-100 border-green-500' : 'bg-white border-gray-300'
              }`}
              onPress={() => toggleFilter('cheapest')}
            >
              <Text className={`text-sm ${
                searchFilters.cheapest ? 'text-green-700' : 'text-gray-600'
              }`}>
                Cheapest first
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              className={`mr-3 px-4 py-2 rounded-full border ${
                searchFilters.highStock ? 'bg-green-100 border-green-500' : 'bg-white border-gray-300'
              }`}
              onPress={() => toggleFilter('highStock')}
            >
              <Text className={`text-sm ${
                searchFilters.highStock ? 'text-green-700' : 'text-gray-600'
              }`}>
                High stock
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              className={`mr-3 px-4 py-2 rounded-full border ${
                searchFilters.fresh ? 'bg-green-100 border-green-500' : 'bg-white border-gray-300'
              }`}
              onPress={() => toggleFilter('fresh')}
            >
              <Text className={`text-sm ${
                searchFilters.fresh ? 'text-green-700' : 'text-gray-600'
              }`}>
                Fresh harvest
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              className={`mr-3 px-4 py-2 rounded-full border ${
                searchFilters.organic ? 'bg-green-100 border-green-500' : 'bg-white border-gray-300'
              }`}
              onPress={() => toggleFilter('organic')}
            >
              <Text className={`text-sm ${
                searchFilters.organic ? 'text-green-700' : 'text-gray-600'
              }`}>
                Organic
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
            <Text className="text-lg font-semibold text-gray-900">
              {searchQuery ? `Search Results` : 'Fresh from Farms'}
            </Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/marketplace' as any)}>
              <Text className="text-sm font-semibold text-green-600">View all</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <View className="flex-row justify-center py-10">
              <ActivityIndicator size="large" color="#22C55E" />
            </View>
          ) : featuredProducts.length === 0 ? (
            <View className="items-center py-10">
              <Text className="text-gray-500 text-base">No products found</Text>
              <Text className="text-gray-400 text-sm mt-1">Try adjusting your search or filters</Text>
            </View>
          ) : (
            <View className="flex-row flex-wrap justify-between">
              {featuredProducts.map((product) => (
                <TouchableOpacity 
                  key={product._id} 
                  className="w-[48%] mb-6 bg-white rounded-lg border border-gray-200 shadow-sm"
                  onPress={() => handleProductPress(product)}
                >
                  <View className="relative">
                    <Image 
                      source={{ uri: getImageUrl(product) }} 
                      className="w-full h-32 rounded-t-lg" 
                    />
                    
                    {/* Organic badge */}
                    {product.organic && (
                      <View className="absolute top-2 left-2 bg-green-500 px-2 py-1 rounded">
                        <Text className="text-white text-xs font-medium">Organic</Text>
                      </View>
                    )}
                    
                    {/* Time ago badge */}
                    <View className="absolute top-2 right-2 bg-black/70 px-2 py-1 rounded">
                      <Text className="text-white text-xs">{formatTimeAgo(product.createdAt)}</Text>
                    </View>
                    
                    {/* Heart icon */}
                    <TouchableOpacity className="absolute bottom-2 right-2 bg-white rounded-full p-2 shadow-md">
                      <Heart size={16} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                  
                  <View className="p-3">
                    <Text className="text-base font-medium text-gray-900 mb-1" numberOfLines={1}>
                      {product.name}
                    </Text>
                    
                    <Text className="text-lg font-bold text-gray-900 mb-1">
                      ₹{product.price}/{product.unit}
                    </Text>
                    
                    {/* Seller info */}
                    <View className="flex-row items-center mb-2">
                      <Text className="text-sm text-gray-500" numberOfLines={1}>
                        by {product.ownerId?.name || 'Unknown'}
                      </Text>
                      {product.ownerId?.location && (
                        <View className="flex-row items-center ml-2">
                          <MapPin size={12} color="#9CA3AF" />
                          <Text className="text-xs text-gray-400 ml-1" numberOfLines={1}>
                            {product.ownerId.location}
                          </Text>
                        </View>
                      )}
                    </View>
                    
                    {/* Rating and quality */}
                    <View className="flex-row items-center justify-between">
                      <View className="flex-row items-center">
                        <Star size={14} color="#F59E0B" fill="#F59E0B" />
                        <Text className="ml-1 text-sm text-gray-500">
                          {product.ownerId?.rating || '4.5'}
                        </Text>
                        <Text className="text-sm text-gray-400">
                          ({product.ownerId?.totalTrades || 0})
                        </Text>
                      </View>
                      
                      <View className="bg-gray-100 px-2 py-1 rounded">
                        <Text className="text-xs text-gray-600 font-medium">
                          Grade {product.qualityGrade}
                        </Text>
                      </View>
                    </View>
                    
                    {/* Stock info */}
                    <Text className="text-xs text-gray-500 mt-1">
                      {product.quantity} {product.unit} available
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Extra padding at bottom */}
        <View className="h-20" />
      </ScrollView>
    </View>
    </ScrollView>
  );
}