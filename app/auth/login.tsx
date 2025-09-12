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
} from 'react-native';
import { Link, router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { login } from '../../lib/api';
import { setStoredAuth } from '../../lib/auth';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  const showMessage = (message: React.SetStateAction<string>) => {
    setModalMessage(message);
    setModalVisible(true);
  };

  const handleLogin = async () => {
    if (!email || !password) {
      showMessage('Please fill in all fields.');
      return;
    }

    setLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      // const response = await login(email, password);

      const response = { success: true, message: 'Logged in successfully!' };
      
      if (response.success) {
        // Store auth data
        // await setStoredAuth(response.token, response.user);
        
        showMessage('Logged in successfully!');
        // In a real app, you would navigate to the next screen here
        // router.replace('/(tabs)');
      } else {
        showMessage(response.message || 'Login failed.');
      }
    } catch (error) {
      console.error('Login error:', error);
      showMessage('Login failed. Please try again.');
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

      {/* Custom Modal for Messages */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white p-6 rounded-lg w-3/4">
            <Text className="text-lg font-bold mb-2">Message</Text>
            <Text className="text-gray-700">{modalMessage}</Text>
            <TouchableOpacity 
              onPress={() => setModalVisible(false)}
              className="mt-4 bg-gray-200 rounded-md py-2 px-4 items-center"
            >
              <Text>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}
