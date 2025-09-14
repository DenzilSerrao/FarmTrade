import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Modal, // Modal is not used in this specific login screen, but kept from original
  Alert,
  Image, // Import Image for social icons
} from 'react-native';
import { Link, router } from 'expo-router';
import { login } from '@/lib/api'; // Assuming these paths are correct
import { setStoredAuth } from '@/lib/auth'; // Assuming these paths are correct
import { Eye, EyeOff } from 'lucide-react-native';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    setLoading(true);

    try {
      console.log('Attempting login with:', email);
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

  const handleSocialLogin = (provider: string) => {
    // TODO: Implement social login
    Alert.alert('Coming Soon', `${provider} login will be available soon!`);
  };

  const handleForgotPassword = () => {
    router.push('/auth/forgot-password');
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        className="flex-1 px-8 pt-24 pb-10"
      >
        <View className="flex-1">
          {/* Header */}
          <View className="mb-10">
            <Text className="text-4xl font-medium text-black leading-11">Log into</Text>
            <Text className="text-4xl font-medium text-black leading-11">your account</Text>
          </View>

          {/* Form */}
          <View className="flex-1">
            <View className="mb-6">
              <TextInput
                className="border-b border-gray-200 pb-3 text-base text-black font-light"
                placeholder="Email address"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View className="mb-2">
              <View className="flex-row items-center border-b border-gray-200">
                <TextInput
                  className="border-b border-gray-200 flex-1 pb-3 text-base text-black font-light"
                  placeholder="Password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  placeholderTextColor="#9CA3AF"
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} className="p-2 -mr-2">
                  {showPassword ? (
                    <Eye size={20} color="#9CA3AF" />
                  ) : (
                    <EyeOff size={20} color="#9CA3AF" />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity className="self-end mb-8 mt-4" onPress={handleForgotPassword}>
              <Text className="text-sm text-gray-500 font-light">Forgot Password?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className={`bg-neutral-800 rounded-full h-14 items-center justify-center mb-6 ${loading ? 'opacity-60' : ''}`}
              onPress={handleLogin}
              disabled={loading}
            >
              <Text className="text-white text-base font-medium tracking-wide">
                {loading ? 'LOGGING IN...' : 'LOG IN'}
              </Text>
            </TouchableOpacity>

            {/* Social Login Options */}
            <Text className="text-center text-sm text-gray-400 font-light mb-6">or log in with</Text>
            <View className="flex-row justify-center gap-6 mb-16">
              <TouchableOpacity
                className="w-12 h-12 rounded-full bg-white items-center justify-center border border-gray-300"
                onPress={() => handleSocialLogin('apple')}
              >
                <Image source={require('../../assets/images/apple.png')} className="w-6 h-6" />
              </TouchableOpacity>

              <TouchableOpacity
                className="w-12 h-12 rounded-full bg-white items-center justify-center border border-gray-300"
                onPress={() => handleSocialLogin('google')}
              >
                <Image source={require('../../assets/images/google.png')} className="w-6 h-6" />
              </TouchableOpacity>

              <TouchableOpacity
                className="w-12 h-12 rounded-full bg-white items-center justify-center border border-gray-300"
                onPress={() => handleSocialLogin('facebook')}
              >
                <Image source={require('../../assets/images/facebook.png')} className="w-6 h-6" />
              </TouchableOpacity>
            </View>

            {/* Footer */}
            <View className="flex-row justify-center items-center">
              <Text className="text-base text-gray-700 font-light">Don't have an account? </Text>
              <Link href="/auth/register" asChild>
                <TouchableOpacity>
                  <Text className="text-base text-black font-medium underline">Sign Up</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}