import React, { useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { router } from 'expo-router';
import { CircleCheck as CheckCircle } from 'lucide-react-native';

export default function VerifySuccessScreen() {
  useEffect(() => {
    // Auto redirect after 3 seconds
    const timer = setTimeout(() => {
      router.replace('/(tabs)');
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const handleContinue = () => {
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 px-8 pt-24 items-center">
        
        <View className="w-24 h-24 rounded-full bg-primary-100 items-center justify-center mb-8">
          <CheckCircle size={64} color="#22C55E" />
        </View>

        <Text className="text-3xl font-medium text-black mb-4 text-center">
          Email Verified!
        </Text>
        <Text className="text-base text-gray-500 font-light text-center leading-6 mb-10">
          Your email has been successfully verified.{'\n'}
          Welcome to FarmTrade!
        </Text>

        <TouchableOpacity 
          className="bg-neutral-800 rounded-full h-14 items-center justify-center mb-5 w-full" 
          onPress={handleContinue}
        >
          <Text className="text-white text-base font-medium tracking-wide">
            CONTINUE TO APP
          </Text>
        </TouchableOpacity>

        <Text className="text-xs text-gray-400 font-light text-center">
          You'll be automatically redirected in a few seconds...
        </Text>
      </View>
    </SafeAreaView>
  );
}