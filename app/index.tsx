import { useEffect } from 'react';
import { router, useRootNavigationState } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';

export default function IndexScreen() {
  const rootNavigationState = useRootNavigationState();

  useEffect(() => {
    // Wait for the root navigation state to be loaded
    if (!rootNavigationState?.isLoaded) {
      return;
    }

    // Simulate auth check - in production, check actual auth state
    const isAuthenticated = false; // Replace with actual auth check
    
    if (isAuthenticated) {
      router.replace('/(tabs)');
    } else {
      router.replace('/auth/login');
    }
  }, [rootNavigationState?.isLoaded]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color="#22C55E" />
    </View>
  );
}