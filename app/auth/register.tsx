import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
} from 'react-native';
import { Link, router } from 'expo-router';
import { User, Mail, Phone, MapPin, Lock } from 'lucide-react-native';
import { register } from '../../lib/api';
import { setStoredAuth } from '../../lib/auth';

export default function RegisterScreen() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    // Validation
    if (!formData.name || !formData.email || !formData.password) {
      Alert.alert('Error', 'Please fill in all required fields (Name, Email, Password)');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    
    try {
      const response = await register(formData.name, formData.email, formData.password);
      
      if (response.success) {
        // Store auth data if login is automatic after registration
        if (response.token && response.user) {
          await setStoredAuth(response.token, response.user);
          
          Alert.alert('Success', 'Account created successfully!', [
            {
              text: 'OK',
              onPress: () => router.replace('/(tabs)'),
            },
          ]);
        } else {
          // If manual login required
          Alert.alert('Success', 'Account created successfully! Please log in.', [
            {
              text: 'OK',
              onPress: () => router.replace('/auth/login'),
            },
          ]);
        }
      } else {
        Alert.alert('Error', response.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      Alert.alert(
        'Error',
        // error.response?.data?.message || 'Registration failed. Please try again.'
        'Registration failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <KeyboardAvoidingView 
      className="flex-1 bg-gray-50" 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 40 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View className="items-center mb-10">
          <View className="w-12 h-12 bg-green-500 rounded-full items-center justify-center mb-4">
            <Text className="text-white text-xl font-bold">🌱</Text>
          </View>
          <Text className="text-3xl font-bold text-gray-900 mt-4">Join FarmTrade</Text>
          <Text className="text-base text-gray-500 mt-1">Start trading with fellow farmers</Text>
        </View>

        {/* Form */}
        <View className="gap-4">
          {/* Full Name */}
          <View className="flex-row items-center bg-white rounded-xl px-4 py-4 border border-gray-200">
            <User size={20} color="#6B7280" className="mr-3" />
            <TextInput
              className="flex-1 text-base text-gray-900"
              placeholder="Full Name"
              value={formData.name}
              onChangeText={(value) => updateFormData('name', value)}
              placeholderTextColor="#9CA3AF"
            />
          </View>

          {/* Email Address */}
          <View className="flex-row items-center bg-white rounded-xl px-4 py-4 border border-gray-200">
            <Mail size={20} color="#6B7280" className="mr-3" />
            <TextInput
              className="flex-1 text-base text-gray-900"
              placeholder="Email Address"
              value={formData.email}
              onChangeText={(value) => updateFormData('email', value)}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              placeholderTextColor="#9CA3AF"
            />
          </View>

          {/* Phone Number */}
          <View className="flex-row items-center bg-white rounded-xl px-4 py-4 border border-gray-200">
            <Phone size={20} color="#6B7280" className="mr-3" />
            <TextInput
              className="flex-1 text-base text-gray-900"
              placeholder="Phone Number (Optional)"
              value={formData.phone}
              onChangeText={(value) => updateFormData('phone', value)}
              keyboardType="phone-pad"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          {/* Farm Location */}
          <View className="flex-row items-center bg-white rounded-xl px-4 py-4 border border-gray-200">
            <MapPin size={20} color="#6B7280" className="mr-3" />
            <TextInput
              className="flex-1 text-base text-gray-900"
              placeholder="Farm Location (Optional)"
              value={formData.location}
              onChangeText={(value) => updateFormData('location', value)}
              placeholderTextColor="#9CA3AF"
            />
          </View>

          {/* Password */}
          <View className="flex-row items-center bg-white rounded-xl px-4 py-4 border border-gray-200">
            <Lock size={20} color="#6B7280" className="mr-3" />
            <TextInput
              className="flex-1 text-base text-gray-900"
              placeholder="Password"
              value={formData.password}
              onChangeText={(value) => updateFormData('password', value)}
              secureTextEntry
              autoCapitalize="none"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          {/* Confirm Password */}
          <View className="flex-row items-center bg-white rounded-xl px-4 py-4 border border-gray-200">
            <Lock size={20} color="#6B7280" className="mr-3" />
            <TextInput
              className="flex-1 text-base text-gray-900"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChangeText={(value) => updateFormData('confirmPassword', value)}
              secureTextEntry
              autoCapitalize="none"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          {/* Register Button */}
          <TouchableOpacity 
            className={`bg-green-500 rounded-xl py-4 items-center mt-2 ${loading ? 'opacity-60' : ''}`}
            onPress={handleRegister}
            disabled={loading}
          >
            <Text className="text-white text-base font-semibold">
              {loading ? 'Creating Account...' : 'Create Account'}
            </Text>
          </TouchableOpacity>

          {/* Footer */}
          <View className="flex-row justify-center mt-6">
            <Text className="text-gray-500 text-sm">Already have an account? </Text>
            <Link href="/auth/login" asChild>
              <TouchableOpacity>
                <Text className="text-green-500 text-sm font-semibold">Sign In</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}