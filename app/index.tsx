import { useEffect } from 'react';
import { router, useRootNavigationState } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { getStoredAuth } from '@/lib/auth';

export default function IndexScreen() {
  const rootNavigationState = useRootNavigationState();
  const navigationReady = rootNavigationState?.routes.length > 0;

  useEffect(() => {
    // Wait for the root navigation state to be loaded
    if (!navigationReady) {
      return;
    }

    // Check actual auth state
    const { token, user } = getStoredAuth();
    const isAuthenticated = !!(token && user);
    
    if (isAuthenticated) {
      router.replace('/(tabs)');
    } else {
      router.replace('/onboarding');
    }
  }, [navigationReady]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color="#22C55E" />
    </View>
  );
}
