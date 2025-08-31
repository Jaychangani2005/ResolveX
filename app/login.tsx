import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Dimensions,
  ScrollView,
  SafeAreaView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { ActionButton } from '@/components/ActionButton';
import { 
    getResponsiveValue, 
    getResponsivePadding, 
    getResponsiveMargin, 
    getResponsiveFontSize,
    isLargeScreen,
    spacing,
    fontSizes,
    inputHeights,
    borderRadius
} from '@/utils/responsive';

const { width, height } = Dimensions.get('window');

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  // Memoized validation to prevent unnecessary re-renders
  const isFormValid = useMemo(() => {
    return email.trim().length > 0 && password.trim().length >= 6;
  }, [email, password]);

  // Memoized button styles to prevent style recalculations
  const buttonStyles = useMemo(() => [
    styles.loginButton,
    !isFormValid && styles.loginButtonDisabled
  ], [isFormValid]);

  // Optimized login handler with proper loading state
  const handleLogin = useCallback(async () => {
    if (!isFormValid || isLoading) return;

    try {
      setIsLoading(true);
      console.log('🚀 Login process started');
      
      const success = await login(email.trim(), password);
      
      if (success) {
        console.log('✅ Login successful, redirecting...');
        // Navigation will be handled by AuthContext
      }
    } catch (error: any) {
      console.error('❌ Login failed:', error);
      
      let errorMessage = 'An error occurred during login. Please try again.';
      
      // Handle specific Firebase Auth errors
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email address. Please check your email or create a new account.';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password. Please try again.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed login attempts. Please try again later.';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Network error. Please check your internet connection and try again.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      Alert.alert(
        'Login Failed',
        errorMessage,
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  }, [email, password, isFormValid, isLoading, login]);

  // Optimized navigation handlers
  const handleSignup = useCallback(() => {
    router.push('/signup');
  }, []);

  // Memoized input change handlers
  const handleEmailChange = useCallback((text: string) => {
    setEmail(text);
  }, []);

  const handlePasswordChange = useCallback((text: string) => {
    setPassword(text);
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient
        colors={['#1a5f7a', '#0d2e3a', '#051a23']}
        style={styles.container}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            <ThemedView style={styles.content}>
              {/* Header */}
              <View style={styles.header}>
                <Text style={styles.title}>Mangrove Watch</Text>
                <Text style={styles.subtitle}>Sign in to your account</Text>
              </View>

              {/* Login Form */}
              <View style={styles.form}>
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Email</Text>
                  <TextInput
                    style={styles.input}
                    value={email}
                    onChangeText={handleEmailChange}
                    placeholder="Enter your email"
                    placeholderTextColor="#8a9ba8"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!isLoading}
                    autoFocus={true}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Password</Text>
                  <TextInput
                    style={styles.input}
                    value={password}
                    onChangeText={handlePasswordChange}
                    placeholder="Enter your password"
                    placeholderTextColor="#8a9ba8"
                    secureTextEntry={true}
                    editable={!isLoading}
                  />
                </View>

                {/* Login Button */}
                <TouchableOpacity
                  style={buttonStyles}
                  onPress={handleLogin}
                  disabled={!isFormValid || isLoading}
                  activeOpacity={0.8}
                >
                  {isLoading ? (
                    <View style={styles.loadingContainer}>
                      <ActivityIndicator size="small" color="#ffffff" />
                      <Text style={styles.loadingText}>Signing in...</Text>
                    </View>
                  ) : (
                    <Text style={styles.loginButtonText}>Sign In</Text>
                  )}
                </TouchableOpacity>

                {/* Alternative Actions */}
                <View style={styles.alternativeActions}>
                  <TouchableOpacity
                    style={styles.alternativeButton}
                    onPress={handleSignup}
                    disabled={isLoading}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.alternativeButtonText}>
                      Don't have an account? Sign up
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ThemedView>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#1a5f7a',
  },
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    minHeight: height,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: getResponsivePadding(),
    paddingVertical: getResponsiveMargin(),
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
    marginTop: spacing.md,
  },
  title: {
    fontSize: fontSizes.title,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: spacing.sm,
    textAlign: 'center',
    lineHeight: fontSizes.largeTitle,
  },
  subtitle: {
    fontSize: fontSizes.md,
    color: '#b8c5cc',
    textAlign: 'center',
    lineHeight: fontSizes.xl,
    paddingHorizontal: spacing.md,
  },
  form: {
    width: '100%',
    maxWidth: isLargeScreen ? 500 : '100%',
    alignSelf: 'center',
  },
  inputContainer: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: fontSizes.md,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: fontSizes.md,
    color: '#ffffff',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    minHeight: inputHeights.medium,
  },
  loginButton: {
    backgroundColor: '#4CAF50',
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.lg,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    minHeight: inputHeights.large,
  },
  loginButtonDisabled: {
    backgroundColor: '#666666',
    opacity: 0.6,
  },
  loginButtonText: {
    color: '#ffffff',
    fontSize: fontSizes.lg,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: '#ffffff',
    fontSize: fontSizes.lg,
    fontWeight: 'bold',
    marginLeft: spacing.sm,
  },
  alternativeActions: {
    alignItems: 'center',
  },
  alternativeButton: {
    paddingVertical: spacing.md,
    marginVertical: spacing.sm,
  },
  alternativeButtonText: {
    color: '#b8c5cc',
    fontSize: fontSizes.md,
    textDecorationLine: 'underline',
  },
}); 