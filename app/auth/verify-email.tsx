import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
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
        // If the response includes user data and token, store them
        if (response.user && response.token) {
          await setStoredAuth(response.token, response.user);
        }
        
        // Redirect to success screen
        router.replace('/auth/verify-success');
      } else {
        setError(response.message || 'Verification failed');
      }
    } catch (error: any) {
      console.error('Email verification error:', error);
      setError(error.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <ActivityIndicator size="large" color="#22C55E" />
          <Text style={styles.loadingText}>Verifying your email...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.errorTitle}>Verification Failed</Text>
          <Text style={styles.errorText}>{error}</Text>
          <Text style={styles.helpText}>
            Please try registering again or contact support if the problem persists.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 16,
    textAlign: 'center',
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#EF4444',
    marginBottom: 16,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 16,
  },
  helpText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
});