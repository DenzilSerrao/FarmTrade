import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Modal,
  Alert,
} from 'react-native';
import { Link, router } from 'expo-router';
import { login } from '@/lib/api';
import { setStoredAuth } from '@/lib/auth';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    setLoading(true);
    
    try {
      const response = await login(email, password);

      if (response.success) {
        // Store auth data
        await setStoredAuth(response.token, response.user);
        
        Alert.alert('Success', 'Logged in successfully!', [
          { text: 'OK', onPress: () => router.replace('/(tabs)') }
        ]);
      } else {
        Alert.alert('Error', response.message || 'Login failed.');
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Error', 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      className="flex-1 bg-white" 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        className="flex-1 px-8 pt-32 pb-10"
      >
        <View className="flex-1">
          {/* Header */}
          <View className="mb-12">
            <Text className="text-4xl font-normal text-black leading-11">Log into</Text>
            <Text className="text-4xl font-normal text-black leading-11">your account</Text>
          </View>

          {/* Form */}
          <View className="flex-1">
            <View className="mb-6">
              <TextInput
                className="border-b border-gray-200 pb-3 text-base text-black"
                placeholder="Email address"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View className="mb-6">
              <TextInput
                className="border-b border-gray-200 pb-3 text-base text-black"
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <TouchableOpacity className="self-end mb-10 mt-4">
              <Text className="text-sm text-gray-500 font-normal">Forgot Password?</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              className={`bg-neutral-800 rounded-full h-14 items-center justify-center mb-8 ${loading ? 'opacity-60' : ''}`}
              onPress={handleLogin}
              disabled={loading}
            >
              <Text className="text-white text-base font-semibold tracking-wide">
                {loading ? 'LOGGING IN...' : 'LOG IN'}
              </Text>
            </TouchableOpacity>

            <Text className="text-center text-sm text-gray-400 mb-6">or log in with</Text>

            {/* Social Login Options */}
            <View className="flex-row justify-center gap-6 mb-16">
              <TouchableOpacity className="w-12 h-12 rounded-full bg-white items-center justify-center border border-gray-300">
                <Text className="text-2xl font-semibold text-gray-700"></Text>
              </TouchableOpacity>
              
              <TouchableOpacity className="w-12 h-12 rounded-full bg-white items-center justify-center border border-gray-300">
                <Text className="text-xl font-semibold text-gray-700">G</Text>
              </TouchableOpacity>
              
              <TouchableOpacity className="w-12 h-12 rounded-full bg-white items-center justify-center border border-gray-300">
                <Text className="text-xl font-semibold text-gray-700">f</Text>
              </TouchableOpacity>
            </View>

            {/* Footer */}
            <View className="flex-row justify-center items-center mt-auto">
              <Text className="text-base text-gray-700 font-normal">Don't have an account? </Text>
              <Link href="/auth/register" asChild>
                <TouchableOpacity>
                  <Text className="text-base text-black font-semibold underline">Sign Up</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>
        </View>
      </ScrollView>

    </KeyboardAvoidingView>
  );
}
