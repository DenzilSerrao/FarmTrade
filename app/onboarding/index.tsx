import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';

const CropkartApp = () => {
  return (
    <View className="flex-1 bg-white">
      <StatusBar style="dark" />
      
      {/* Header */}
      <View className="flex-row justify-between items-center px-6 pt-12 pb-4 bg-white shadow-sm">
        <Text className="text-2xl font-bold text-green-800">Cropkart</Text>
        <View className="flex-row space-x-4">
          <TouchableOpacity className="p-2">
            <Text className="text-green-600">Login</Text>
          </TouchableOpacity>
          <TouchableOpacity className="bg-green-600 px-4 py-2 rounded-full">
            <Text className="text-white font-medium">Sign Up</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Hero Section */}
      <View className="flex-1 px-6 justify-center items-center">
        <View className="items-center mb-8">
          <Text className="text-5xl font-bold text-green-800 text-center mb-4">
            Cropkart
          </Text>
          <Text className="text-xl text-gray-600 text-center mb-8">
            Fresh produce, straight from the farm
          </Text>
          
          {/* Decorative elements */}
          <View className="flex-row justify-center space-x-6 mb-8">
            <View className="w-16 h-16 bg-green-100 rounded-full items-center justify-center">
              <Text className="text-2xl">🌱</Text>
            </View>
            <View className="w-16 h-16 bg-yellow-100 rounded-full items-center justify-center">
              <Text className="text-2xl">🍎</Text>
            </View>
            <View className="w-16 h-16 bg-orange-100 rounded-full items-center justify-center">
              <Text className="text-2xl">🥕</Text>
            </View>
          </View>
        </View>

        {/* CTA Button */}
        <TouchableOpacity className="bg-green-600 px-8 py-4 rounded-full shadow-lg">
          <Text className="text-white text-lg font-semibold">Shop Fresh Now</Text>
        </TouchableOpacity>

        {/* Features Grid */}
        <View className="flex-row flex-wrap justify-center mt-16 gap-6">
          <View className="items-center w-28">
            <View className="w-14 h-14 bg-green-50 rounded-xl items-center justify-center mb-2">
              <Text className="text-2xl">🚚</Text>
            </View>
            <Text className="text-sm text-gray-600 text-center">Fast Delivery</Text>
          </View>
          
          <View className="items-center w-28">
            <View className="w-14 h-14 bg-green-50 rounded-xl items-center justify-center mb-2">
              <Text className="text-2xl">🌿</Text>
            </View>
            <Text className="text-sm text-gray-600 text-center">Organic</Text>
          </View>
          
          <View className="items-center w-28">
            <View className="w-14 h-14 bg-green-50 rounded-xl items-center justify-center mb-2">
              <Text className="text-2xl">⭐</Text>
            </View>
            <Text className="text-sm text-gray-600 text-center">Quality</Text>
          </View>
        </View>
      </View>

      {/* Bottom Navigation */}
      <View className="flex-row justify-around items-center px-6 py-4 border-t border-gray-200">
        <TouchableOpacity className="items-center">
          <Text className="text-2xl">🏠</Text>
          <Text className="text-xs text-green-600 mt-1">Home</Text>
        </TouchableOpacity>
        
        <TouchableOpacity className="items-center">
          <Text className="text-2xl">🛒</Text>
          <Text className="text-xs text-gray-500 mt-1">Shop</Text>
        </TouchableOpacity>
        
        <TouchableOpacity className="items-center">
          <Text className="text-2xl">❤️</Text>
          <Text className="text-xs text-gray-500 mt-1">Favorites</Text>
        </TouchableOpacity>
        
        <TouchableOpacity className="items-center">
          <Text className="text-2xl">👤</Text>
          <Text className="text-xs text-gray-500 mt-1">Profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default CropkartApp;