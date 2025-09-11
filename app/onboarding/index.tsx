import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

export default function OnboardingScreen() {
  const handleGetStarted = () => {
    router.push('/auth/register');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Top Section with Title and Subtitle */}
      <View style={styles.topSection}>
        <Text style={styles.title}>Cropkart</Text>
        <Text style={styles.subtitle}>Fresh produce, stright from the farm</Text>
        
        {/* Get Started Button */}
        <TouchableOpacity style={styles.getStartedButton} onPress={handleGetStarted}>
          <Text style={styles.getStartedText}>Get Started</Text>
        </TouchableOpacity>
      </View>

      {/* Bottom Hero Section */}
      <View style={styles.heroSection}>
        <View style={styles.heroContainer}>
          <LinearGradient
            colors={['#10B981', '#059669']}
            style={styles.heroBackground}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            {/* Farmer Image */}
            <View style={styles.imageContainer}>
              <Image
                source={{
                  uri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face'
                }}
                style={styles.farmerImage}
                resizeMode="cover"
              />
              
              {/* Vegetables in arms */}
              <View style={styles.vegetablesContainer}>
                <Image
                  source={{
                    uri: 'https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?w=100&h=100&fit=crop'
                  }}
                  style={[styles.vegetableImage, styles.carrot]}
                  resizeMode="cover"
                />
                <Image
                  source={{
                    uri: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=100&h=100&fit=crop'
                  }}
                  style={[styles.vegetableImage, styles.pepper]}
                  resizeMode="cover"
                />
                <Image
                  source={{
                    uri: 'https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?w=100&h=100&fit=crop'
                  }}
                  style={[styles.vegetableImage, styles.leafy]}
                  resizeMode="cover"
                />
              </View>
            </View>
          </LinearGradient>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  topSection: {
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: 60,
    paddingBottom: 40,
  },
  title: {
    fontSize: 42,
    fontWeight: '800',
    color: '#059669',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#059669',
    textAlign: 'center',
    marginBottom: 40,
    fontWeight: '500',
  },
  getStartedButton: {
    backgroundColor: '#9CA3AF',
    borderRadius: 30,
    paddingVertical: 18,
    paddingHorizontal: 48,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  getStartedText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  heroSection: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  heroContainer: {
    height: '75%',
    width: '100%',
  },
  heroBackground: {
    flex: 1,
    borderTopLeftRadius: 200,
    borderTopRightRadius: 200,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  farmerImage: {
    width: 280,
    height: 350,
    borderRadius: 20,
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  vegetablesContainer: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  vegetableImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    backgroundColor: '#FFFFFF',
  },
  carrot: {
    transform: [{ rotate: '-15deg' }],
  },
  pepper: {
    transform: [{ rotate: '10deg' }],
  },
  leafy: {
    transform: [{ rotate: '-8deg' }],
  },
});

// About NativeWind (React Native's Tailwind equivalent):
// 
// To use NativeWind in your project, you would need to:
// 1. Install: npm install nativewind
// 2. Install: npm install --save-dev tailwindcss@3.3.2
// 3. Run: npx tailwindcss init
// 4. Configure your tailwind.config.js
// 5. Add NativeWind to your babel.config.js
//
// Then you could use className instead of style:
// <View className="flex-1 bg-white">
//   <Text className="text-4xl font-bold text-green-600">Cropkart</Text>
// </View>
//
// But for now, this uses regular StyleSheet which works out of the box.