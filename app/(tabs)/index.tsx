import React, { useState } from 'react';
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

const productCategories = [
  { name: 'Veggies', image: require('../../assets/images/veggies.jpg') },
  { name: 'Herbs', image: require('../../assets/images/herbs.jpg') },
  { name: 'Fruits', image: require('../../assets/images/fruits.png') },
  { name: 'Grains', image: require('../../assets/images/grains.png') },
];

const featuredProducts = [
  { id: 1, name: 'Berries', price: '₹500', rating: '4.5', reviews: '672', image: require('../../assets/images/berries.png') },
  { id: 2, name: 'Tomatoes', price: '₹500', rating: '4.5', reviews: '672', image: require('../../assets/images/tomatoes.png') },
  { id: 3, name: 'Tulsi', price: '₹500', rating: '4.5', reviews: '672', image: require('../../assets/images/tulsi.png') },
  { id: 4, name: 'Milk', price: '₹70', rating: '4.5', reviews: '672', image: require('../../assets/images/milk.png') },
];

export default function HomeScreen() {
  const [searchQuery, setSearchQuery] = useState('');

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
        <View className="flex-row items-center justify-between px-4 py-2 mx-6 my-4 border border-gray-300 rounded-full">
          <Search size={20} color="#9CA3AF" />
          <TextInput
            className="flex-1 ml-2 text-base text-gray-800"
            placeholder="Search.."
            placeholderTextColor="#9ca3af"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <TouchableOpacity className="bg-green-500 w-10 h-10 rounded-full items-center justify-center ml-2">
            <Filter size={20} color="white" />
          </TouchableOpacity>
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
              <View key={product.id} className="w-[48%] mb-6 bg-white rounded-lg border border-gray-200 shadow-sm">
                <Image source={product.image} className="w-full h-32 rounded-t-lg" />
                <TouchableOpacity className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md">
                  <Heart size={20} color="#EF4444" fill="#EF4444" />
                </TouchableOpacity>
                <View className="p-3">
                  <Text className="text-base font-medium text-gray-900">{product.name}</Text>
                  <Text className="text-lg font-bold text-gray-900 mt-1">{product.price}</Text>
                  <View className="flex-row items-center mt-1">
                    <Star size={14} color="#F59E0B" fill="#F59E0B" />
                    <Text className="ml-1 text-sm text-gray-500">{product.rating}</Text>
                    <Text className="text-sm text-gray-400"> ({product.reviews})</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}