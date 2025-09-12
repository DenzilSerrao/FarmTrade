import React from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { StatusBar } from 'expo-status-bar';

const categories = [
  { name: 'Veggies', image: 'https://placehold.co/100x100/A0E7A2/3C6E40?text=veggies' },
  { name: 'Herbs', image: 'https://placehold.co/100x100/A0E7A2/3C6E40?text=herbs' },
  { name: 'Fruits', image: 'https://placehold.co/100x100/FAD390/C75B00?text=fruits' },
  { name: 'Grains', image: 'https://placehold.co/100x100/F5F5DC/8B4513?text=grains' },
  // Add more categories as needed
];

const products = [
  { name: 'Berries', price: '₹500', rating: '4.5', reviews: '672', image: 'https://placehold.co/300x300/e94d6e/FFF?text=Berries' },
  { name: 'Tomatoes', price: '₹500', rating: '4.5', reviews: '672', image: 'https://placehold.co/300x300/F05030/FFF?text=Tomatoes' },
  { name: 'Tulsi', price: '₹500', rating: '4.5', reviews: '672', image: 'https://placehold.co/300x300/3E8D30/FFF?text=Tulsi' },
  { name: 'Milk', price: '₹70', rating: '4.5', reviews: '672', image: 'https://placehold.co/300x300/D0E7F5/4682B4?text=Milk' },
];

const CropkartApp = () => {
  return (
    <View className="flex-1 bg-white">
      <StatusBar style="dark" />
      
      {/* Header */}
      <View className="flex-row justify-between items-center px-6 pt-16 pb-4">
        <TouchableOpacity>
          <Image source={{ uri: 'https://placehold.co/100x100/000/fff?text=Menu' }} className="w-6 h-6" />
        </TouchableOpacity>
        <Text className="text-2xl font-semibold text-green-700">CropKart</Text>
        <TouchableOpacity>
          <Image source={{ uri: 'https://placehold.co/100x100/000/fff?text=Bell' }} className="w-6 h-6" />
        </TouchableOpacity>
      </View>

      {/* Main content scroll view */}
      <ScrollView className="flex-1">
        {/* Categories Section */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="my-4"
          contentContainerStyle={{ paddingHorizontal: 16 }}
        >
          {categories.map((category, index) => (
            <TouchableOpacity key={index} className="items-center mx-2">
              <Image source={{ uri: category.image }} className="w-16 h-16 rounded-full" />
              <Text className="text-xs text-gray-600 mt-2">{category.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Search Bar */}
        <View className="flex-row items-center mx-6 mt-2 mb-6 bg-gray-100 rounded-2xl px-4 py-3">
          <Image source={{ uri: 'https://placehold.co/100x100/000/fff?text=Search' }} className="w-5 h-5 mr-2" />
          <TextInput
            className="flex-1 text-base text-gray-600"
            placeholder="Search.."
            placeholderTextColor="#9ca3af"
          />
          <TouchableOpacity className="ml-2 bg-gray-200 p-2 rounded-full">
            <Image source={{ uri: 'https://placehold.co/100x100/000/fff?text=Filter' }} className="w-5 h-5" />
          </TouchableOpacity>
        </View>

        {/* Hero Banner */}
        <View className="relative mx-6 h-48 rounded-xl overflow-hidden mb-6">
          <Image
            source={{ uri: 'https://placehold.co/600x400/000000/fff?text=I%20Love%20the%20farmers%20market' }}
            className="w-full h-full"
            resizeMode="cover"
          />
          <View className="absolute inset-0 items-center justify-center">
            <Text className="text-white text-3xl font-bold">I love the farmers market</Text>
          </View>
        </View>

        {/* Browse Products Section */}
        <View className="px-6">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-xl font-bold text-gray-800">Browse Products</Text>
            <TouchableOpacity>
              <Text className="text-sm text-green-600">View all</Text>
            </TouchableOpacity>
          </View>

          <View className="flex-row flex-wrap justify-between">
            {products.map((product, index) => (
              <TouchableOpacity key={index} className="w-[48%] mb-6 rounded-lg overflow-hidden bg-white shadow-md">
                <View className="relative">
                  <Image source={{ uri: product.image }} className="w-full h-40" resizeMode="cover" />
                  <TouchableOpacity className="absolute top-2 right-2 p-2 bg-white rounded-full">
                    <Image source={{ uri: 'https://placehold.co/100x100/FF0000/fff?text=Heart' }} className="w-6 h-6" />
                  </TouchableOpacity>
                </View>
                <View className="p-3">
                  <Text className="text-base font-semibold">{product.name}</Text>
                  <Text className="text-sm text-gray-500 mt-1">{product.price}</Text>
                  <View className="flex-row items-center mt-1">
                    <Image source={{ uri: 'https://placehold.co/100x100/FFD700/fff?text=Star' }} className="w-4 h-4" />
                    <Text className="text-xs text-gray-600 ml-1">{product.rating} ({product.reviews})</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View className="flex-row justify-around items-center px-6 py-4 border-t border-gray-200 bg-white">
        <TouchableOpacity className="items-center">
          <Image source={{ uri: 'https://placehold.co/100x100/000/fff?text=Home' }} className="w-6 h-6" />
          <Text className="text-xs text-green-600 font-bold mt-1">Home</Text>
        </TouchableOpacity>
        
        <TouchableOpacity className="items-center">
          <Image source={{ uri: 'https://placehold.co/100x100/000/fff?text=Explore' }} className="w-6 h-6" />
          <Text className="text-xs text-gray-500 mt-1">Explore</Text>
        </TouchableOpacity>
        
        <TouchableOpacity className="items-center">
          <Image source={{ uri: 'https://placehold.co/100x100/000/fff?text=Cart' }} className="w-6 h-6" />
          <Text className="text-xs text-gray-500 mt-1">Cart</Text>
        </TouchableOpacity>
        
        <TouchableOpacity className="items-center">
          <Image source={{ uri: 'https://placehold.co/100x100/000/fff?text=Profile' }} className="w-6 h-6" />
          <Text className="text-xs text-gray-500 mt-1">Profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default CropkartApp;
