import React, { useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
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
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <CheckCircle size={64} color="#22C55E" />
        </View>

        <Text style={styles.title}>Email Verified!</Text>
        <Text style={styles.description}>
          Your email has been successfully verified.{'\n'}
          Welcome to FarmTrade!
        </Text>

        <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
          <Text style={styles.continueButtonText}>Continue to App</Text>
        </TouchableOpacity>

        <Text style={styles.autoRedirectText}>
          You'll be automatically redirected in a few seconds...
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 100,
    alignItems: 'center',
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F0FDF4',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
  },
  continueButton: {
    backgroundColor: '#22C55E',
    borderRadius: 8,
    paddingVertical: 16,
    paddingHorizontal: 32,
    marginBottom: 20,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  autoRedirectText: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
  },
});