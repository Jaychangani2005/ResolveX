import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useAuth } from '@/contexts/AuthContext';

const { width, height } = Dimensions.get('window');

export default function SplashScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { user, isLoading } = useAuth();

  const fadeAnim = new Animated.Value(0);
  const scaleAnim = new Animated.Value(0.8);
  const rotateAnim = new Animated.Value(0);

  useEffect(() => {
    const animations = [
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.loop(
          Animated.timing(rotateAnim, {
            toValue: 1,
            duration: 3000,
            useNativeDriver: true,
          })
        ),
      ]),
    ];

    Animated.sequence(animations).start();
  }, []);

  // Handle authentication routing
  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => {
        if (user) {
          // User is authenticated, redirect based on role
          if (user.role === 'admin') {
            router.replace('/(admin)/dashboard');
          } else if (user.role === 'conservation_ngos' || user.role === 'government_forestry' || user.role === 'researchers') {
            router.replace('/(ngo)/dashboard');
          } else {
            router.replace('/(tabs)');
          }
        } else {
          // User is not authenticated, go to login
          router.replace('/login');
        }
      }, 2000); // Show splash for 2 seconds

      return () => clearTimeout(timer);
    }
  }, [user, isLoading]);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.primary, colors.secondary, colors.accent]}
        style={styles.gradientBackground}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Floating Elements */}
        <View style={styles.floatingElements}>
          <Animated.View 
            style={[
              styles.floatingCircle, 
              styles.circle1,
              { opacity: fadeAnim }
            ]} 
          />
          <Animated.View 
            style={[
              styles.floatingCircle, 
              styles.circle2,
              { opacity: fadeAnim }
            ]} 
          />
          <Animated.View 
            style={[
              styles.floatingCircle, 
              styles.circle3,
              { opacity: fadeAnim }
            ]} 
          />
        </View>

        {/* Main Content */}
        <View style={styles.content}>
          <Animated.View
            style={[
              styles.logoContainer,
              {
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            <Animated.Text 
              style={[
                styles.logoEmoji,
                { transform: [{ rotate: spin }] }
              ]}
            >
              🌱
            </Animated.Text>
            <Text style={styles.logoText}>Mangrove</Text>
            <Text style={styles.logoSubtext}>Watch</Text>
          </Animated.View>

          <Animated.Text
            style={[
              styles.tagline,
              { opacity: fadeAnim },
            ]}
          >
            Protecting our coastal ecosystems together
          </Animated.Text>

          <Animated.View
            style={[
              styles.loadingContainer,
              { opacity: fadeAnim },
            ]}
          >
            <View style={styles.loadingDots}>
              <View style={[styles.dot, styles.dot1]} />
              <View style={[styles.dot, styles.dot2]} />
              <View style={[styles.dot, styles.dot3]} />
            </View>
            <Text style={styles.loadingText}>
              {isLoading ? 'Loading...' : 'Ready'}
            </Text>
          </Animated.View>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradientBackground: {
    flex: 1,
  },
  floatingElements: {
    position: 'absolute',
    width: width,
    height: height,
  },
  floatingCircle: {
    position: 'absolute',
    borderRadius: 100,
    opacity: 0.1,
  },
  circle1: {
    width: 150,
    height: 150,
    top: height * 0.1,
    right: -75,
    backgroundColor: '#fff',
  },
  circle2: {
    width: 100,
    height: 100,
    top: height * 0.4,
    left: -50,
    backgroundColor: '#fff',
  },
  circle3: {
    width: 80,
    height: 80,
    top: height * 0.7,
    right: -40,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logoEmoji: {
    fontSize: 80,
    marginBottom: 16,
  },
  logoText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 3,
    marginBottom: 4,
  },
  logoSubtext: {
    fontSize: 28,
    fontWeight: '300',
    color: '#fff',
    opacity: 0.9,
    letterSpacing: 2,
  },
  tagline: {
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
    opacity: 0.9,
    lineHeight: 26,
    marginBottom: 60,
  },
  loadingContainer: {
    alignItems: 'center',
  },
  loadingDots: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
  },
  dot1: {
    opacity: 0.3,
  },
  dot2: {
    opacity: 0.6,
  },
  dot3: {
    opacity: 1,
  },
  loadingText: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.8,
  },
}); 