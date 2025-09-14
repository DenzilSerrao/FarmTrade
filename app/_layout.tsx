import '../global.css'; 
import { useEffect } from 'react';
import { Stack, SplashScreen } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import React from 'react';

// Keep the splash screen visible until the fonts are loaded
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    'ProductSans-Light': require('../assets/fonts/ProductSans-Light.ttf'),
    'ProductSans-Regular': require('../assets/fonts/ProductSans-Regular.ttf'),
    'ProductSans-Medium': require('../assets/fonts/ProductSans-Medium.ttf'),
    'ProductSans-Bold': require('../assets/fonts/ProductSans-Bold.ttf'),
    'ProductSans-Italic': require('../assets/fonts/ProductSans-Italic.ttf'),
    'ProductSans-BoldItalic': require('../assets/fonts/ProductSans-BoldItalic.ttf'),
  });

  useEffect(() => {
    // Hide the splash screen once the fonts are loaded
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  // Don't render the UI until the fonts are ready
  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="auth" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}