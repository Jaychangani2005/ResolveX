import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Dimensions, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { FormInput } from '@/components/FormInput';
import { ActionButton } from '@/components/ActionButton';
import { useAuth } from '@/contexts/AuthContext';

const { width, height } = Dimensions.get('window');

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { login, signup } = useAuth();

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (!isLogin && !name.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }

    setIsLoading(true);
    
    try {
      if (isLogin) {
        const success = await login(email, password);
        if (success) {
          console.log('✅ Login successful - waiting for navigation...');
          // Don't reset loading state - let AuthContext handle navigation
          return;
        }
      } else {
        const success = await signup(email, password, name);
        if (success) {
          console.log('✅ Signup successful - showing success message...');
          Alert.alert(
            'Success! 🎉', 
            'Account created successfully! Please sign in with your credentials.',
            [
              {
                text: 'OK',
                onPress: () => {
                  // Switch to login mode after successful signup
                  setIsLogin(true);
                  setEmail('');
                  setPassword('');
                  setName('');
                  setIsLoading(false);
                }
              }
            ]
          );
          return;
        }
      }
    } catch (error: any) {
      console.error('❌ Auth error:', error);
      Alert.alert(
        'Error', 
        error.message || 'Something went wrong. Please try again.'
      );
    }
    
    // Only reset loading state if we didn't succeed
    setIsLoading(false);
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setEmail('');
    setPassword('');
    setName('');
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[colors.primary, colors.secondary, colors.accent]}
        style={styles.gradientBackground}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <KeyboardAvoidingView 
          style={styles.keyboardAvoidingView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView contentContainerStyle={styles.scrollContent}>
            {/* Floating Elements */}
            <View style={styles.floatingElements}>
              <View style={[styles.floatingCircle, styles.circle1]} />
              <View style={[styles.floatingCircle, styles.circle2]} />
              <View style={[styles.floatingCircle, styles.circle3]} />
            </View>

            {/* Header */}
            <View style={styles.header}>
              <View style={styles.logoContainer}>
                <Text style={styles.logoEmoji}>🌱</Text>
                <Text style={styles.logoText}>Mangrove</Text>
                <Text style={styles.logoSubtext}>Watch</Text>
              </View>
              <Text style={styles.tagline}>
                Protecting our coastal ecosystems together
              </Text>
            </View>

            {/* Form Card */}
            <View style={styles.formCard}>
              <Text style={styles.formTitle}>
                {isLogin ? 'Welcome Back!' : 'Join Our Community'}
              </Text>
              <Text style={styles.formSubtitle}>
                {isLogin 
                  ? 'Sign in to continue monitoring mangroves' 
                  : 'Create an account to start contributing'
                }
              </Text>

              {!isLogin && (
                <FormInput
                  label="Name"
                  placeholder="Enter your full name"
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                  autoComplete="name"
                />
              )}

              <FormInput
                label="Email"
                placeholder="Enter your email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />

              <FormInput
                label="Password"
                placeholder="Enter your password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoComplete="password"
              />

              <ActionButton
                title={isLoading ? "Please wait..." : (isLogin ? "Sign In" : "Create Account")}
                onPress={handleSubmit}
                variant="primary"
                style={styles.submitButton}
                disabled={isLoading || !email.trim() || !password.trim()}
              />
              
              {isLoading && (
                <Text style={styles.loadingText}>
                  {isLogin ? "Signing you in..." : "Creating your account..."}
                </Text>
              )}
              
              {!isLoading && !isLogin && (
                <Text style={styles.helpText}>
                  After creating your account, you'll be able to sign in
                </Text>
              )}

              <TouchableOpacity onPress={toggleMode} style={styles.toggleButton}>
                <Text style={styles.toggleText}>
                  {isLogin ? "Don't have an account? " : "Already have an account? "}
                  <Text style={styles.toggleHighlight}>
                    {isLogin ? "Sign Up" : "Sign In"}
                  </Text>
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                onPress={() => router.push('/admin-login')} 
                style={styles.adminLoginButton}
              >
                <Text style={styles.adminLoginText}>
                  🔐 Admin Login
                </Text>
              </TouchableOpacity>
            </View>

            {/* Features Preview */}
            <View style={styles.featuresContainer}>
              <Text style={styles.featuresTitle}>What you can do:</Text>
              <View style={styles.featuresGrid}>
                <View style={styles.featureItem}>
                  <Text style={styles.featureEmoji}>📸</Text>
                  <Text style={styles.featureText}>Report Incidents</Text>
                </View>
                <View style={styles.featureItem}>
                  <Text style={styles.featureEmoji}>📍</Text>
                  <Text style={styles.featureText}>GPS Tracking</Text>
                </View>
                <View style={styles.featureItem}>
                  <Text style={styles.featureEmoji}>🏆</Text>
                  <Text style={styles.featureText}>Earn Badges</Text>
                </View>
                <View style={styles.featureItem}>
                  <Text style={styles.featureEmoji}>🌊</Text>
                  <Text style={styles.featureText}>Save Ecosystems</Text>
                </View>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradientBackground: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    minHeight: height,
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
    width: 120,
    height: 120,
    top: height * 0.1,
    right: -60,
    backgroundColor: '#fff',
  },
  circle2: {
    width: 80,
    height: 80,
    top: height * 0.3,
    left: -40,
    backgroundColor: '#fff',
  },
  circle3: {
    width: 60,
    height: 60,
    top: height * 0.6,
    right: -30,
    backgroundColor: '#fff',
  },
  header: {
    alignItems: 'center',
    marginTop: height * 0.08,
    marginBottom: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  logoEmoji: {
    fontSize: 64,
    marginBottom: 8,
  },
  logoText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 2,
  },
  logoSubtext: {
    fontSize: 24,
    fontWeight: '300',
    color: '#fff',
    opacity: 0.9,
    letterSpacing: 1,
  },
  tagline: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    opacity: 0.9,
    lineHeight: 22,
  },
  formCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 24,
    padding: 32,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#2E8B57',
  },
  formSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    color: '#666',
    lineHeight: 20,
  },
  submitButton: {
    marginTop: 16,
    marginBottom: 20,
  },
  toggleButton: {
    alignItems: 'center',
  },
  toggleText: {
    fontSize: 14,
    color: '#666',
  },
  toggleHighlight: {
    color: '#2E8B57',
    fontWeight: '600',
  },
  loadingText: {
    fontSize: 14,
    color: '#2E8B57',
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
  helpText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
  featuresContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 20,
  },
  featureItem: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 16,
    borderRadius: 16,
    minWidth: 80,
    backdropFilter: 'blur(10px)',
  },
  featureEmoji: {
    fontSize: 24,
    marginBottom: 8,
  },
  featureText: {
    fontSize: 12,
    color: '#fff',
    textAlign: 'center',
    fontWeight: '500',
  },
  adminLoginButton: {
    marginTop: 20,
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  adminLoginText: {
    fontSize: 14,
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600',
  },
}); 