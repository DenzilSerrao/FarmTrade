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
import { register } from '@/lib/api';
import { setStoredAuth } from '@/lib/auth';

export default function CreateAccountScreen() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    // Validation
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      Alert.alert('Error', 'Please fill in all required fields.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }

    if (formData.password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);

    try {
      const response = await register(formData.name, formData.email, formData.password);
      
      if (response.success) {
        // Store auth data
        await setStoredAuth(response.token, response.user);
        
        Alert.alert('Success', 'Account created successfully!', [
          { text: 'OK', onPress: () => router.replace('/(tabs)') }
        ]);
      } else {
        Alert.alert('Error', response.message || 'Registration failed.');
      }
    } catch (error) {
      console.error('Registration error:', error);
      Alert.alert('Error', 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <KeyboardAvoidingView 
      className="flex-1 bg-white" 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 justify-center">
          {/* Header */}
          <Text className="text-4xl font-bold mt-16 mb-8">
            Create{'\n'}your account
          </Text>

          {/* Form */}
          <View className="space-y-4">
            {/* Full Name */}
            <TextInput
              className="h-12 border-b border-gray-300 text-base"
              placeholder="Enter your name"
              placeholderTextColor="#9ca3af"
              value={formData.name}
              onChangeText={(value) => updateFormData('name', value)}
            />

            {/* Email Address */}
            <TextInput
              className="h-12 border-b border-gray-300 text-base"
              placeholder="Email address"
              placeholderTextColor="#9ca3af"
              value={formData.email}
              onChangeText={(value) => updateFormData('email', value)}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            {/* Password */}
            <TextInput
              className="h-12 border-b border-gray-300 text-base"
              placeholder="Password"
              placeholderTextColor="#9ca3af"
              value={formData.password}
              onChangeText={(value) => updateFormData('password', value)}
              secureTextEntry
              autoCapitalize="none"
            />

            {/* Confirm Password */}
            <TextInput
              className="h-12 border-b border-gray-300 text-base"
              placeholder="Confirm password"
              placeholderTextColor="#9ca3af"
              value={formData.confirmPassword}
              onChangeText={(value) => updateFormData('confirmPassword', value)}
              secureTextEntry
              autoCapitalize="none"
            />
          </View>

          {/* Register Button */}
          <TouchableOpacity 
            className={`bg-neutral-800 rounded-full h-14 items-center justify-center mt-8 ${loading ? 'opacity-60' : ''}`}
            onPress={handleRegister}
            disabled={loading}
          >
            <Text className="text-white text-base font-medium">
              {loading ? 'Creating Account...' : 'SIGN UP'}
            </Text>
          </TouchableOpacity>

          {/* Social Login */}
          <Text className="text-center text-gray-400 mt-6 mb-4">
            or sign up with
          </Text>
          <View className="flex-row justify-center space-x-6">
            <TouchableOpacity className="w-12 h-12 rounded-full border border-gray-300 items-center justify-center">
              <Text className="text-2xl"></Text>
            </TouchableOpacity>
            <TouchableOpacity className="w-12 h-12 rounded-full border border-gray-300 items-center justify-center">
              <Text className="text-2xl">G</Text>
            </TouchableOpacity>
            <TouchableOpacity className="w-12 h-12 rounded-full border border-gray-300 items-center justify-center">
              <Text className="text-2xl">f</Text>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View className="flex-row justify-center mt-12 mb-20">
            <Text className="text-gray-500">
              Already have account?{' '}
            </Text>
            <Link href="/auth/login" asChild>
              <TouchableOpacity>
                <Text className="text-gray-900 font-semibold underline">
                  Log in
                </Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </ScrollView>

    </KeyboardAvoidingView>
  );
}
