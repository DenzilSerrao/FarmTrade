import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { verifyEmail } from '@/lib/api';
import { setStoredAuth } from '@/lib/auth';

export default function VerifyEmailScreen() {
  const { token } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (token && typeof token === 'string') {
      handleVerification(token);
    } else {
      setError('Invalid verification link');
      setLoading(false);
    }
  }, [token]);

  const handleVerification = async (verificationToken: string) => {
    try {
      setLoading(true);
      const response = await verifyEmail(verificationToken);

      if (response.success) {
        if (response.user && response.token) {
          await setStoredAuth(response.token, response.user);
        }
        
        router.replace('/auth/verify-success');
      } else {
        setError(response.message || 'Verification failed');
      }
    } catch (error) {
      console.error('Email verification error:', error);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An unknown error occurred.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 justify-center items-center px-8">
          <ActivityIndicator size="large" color="#22C55E" />
          <Text className="text-base text-gray-500 mt-4 text-center font-light">
            Verifying your email...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 justify-center items-center px-8">
          <Text className="text-2xl font-medium text-red-500 mb-4 text-center">
            Verification Failed
          </Text>
          <Text className="text-base text-gray-500 text-center font-light mb-4">
            {error}
          </Text>
          <Text className="text-sm text-gray-400 text-center font-light">
            Please try registering again or contact support if the problem persists.
          </Text>
        </View>
      </SafeAreaView>
    );
  }
  
  return null;
}