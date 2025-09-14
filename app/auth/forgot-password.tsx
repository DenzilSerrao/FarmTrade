import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Link, router } from 'expo-router';
import { Mail } from 'lucide-react-native';
import { requestPasswordReset } from '@/lib/api';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendReset = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    setLoading(true);

    try {
      const response = await requestPasswordReset(email);

      if (response.success) {
        Alert.alert('Success', 'Password reset instructions sent to your email', [
          { text: 'OK', onPress: () => router.back() }
        ]);
      } else {
        Alert.alert('Error', response.message || 'Failed to send reset email');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 px-8 pt-24 pb-10">
        
        {/* Header */}
        <View className="mb-10">
          <Text className="text-4xl font-medium text-black leading-11">Forgot</Text>
          <Text className="text-4xl font-medium text-black leading-11">password?</Text>
        </View>

        <Text className="text-base text-gray-500 font-light mb-8">
          Enter email associated with your account and we'll send an email with instructions to reset your password.
        </Text>

        {/* Input */}
        <View className="mb-8">
          <View className="flex-row items-center border-b border-gray-200 pb-3">
            <Mail size={20} color="#9CA3AF" />
            <TextInput
              className="flex-1 text-base text-black pl-2 font-light"
              placeholder="Email address"
              placeholderTextColor="#9ca3af"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
        </View>

        {/* Button */}
        <TouchableOpacity
          className={`bg-neutral-800 rounded-full h-14 items-center justify-center ${loading ? 'opacity-60' : ''}`}
          onPress={handleSendReset}
          disabled={loading}
        >
          <Text className="text-white text-base font-medium tracking-wide">
            {loading ? 'SENDING...' : 'RESET PASSWORD'}
          </Text>
        </TouchableOpacity>

        {/* Footer */}
        <View className="flex-row justify-center items-center mt-16">
          <Text className="text-base text-gray-700 font-light">Remember your password? </Text>
          <Link href="/auth/login" asChild>
            <TouchableOpacity>
              <Text className="text-base text-black font-medium underline">Go back to Login</Text>
            </TouchableOpacity>
          </Link>
        </View>
        
      </View>
    </SafeAreaView>
  );
}