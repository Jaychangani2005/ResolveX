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
  Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

const { width, height } = Dimensions.get('window');

export default function SignupScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signup } = useAuth();

  // Memoized validation to prevent unnecessary re-renders
  const isFormValid = useMemo(() => {
    return (
      name.trim().length > 0 &&
      email.trim().length > 0 &&
      password.trim().length >= 6 &&
      password === confirmPassword
    );
  }, [name, email, password, confirmPassword]);

  // Memoized button styles to prevent style recalculations
  const buttonStyles = useMemo(() => [
    styles.signupButton,
    !isFormValid && styles.signupButtonDisabled
  ], [isFormValid]);

  // Optimized signup handler with proper loading state
  const handleSignup = useCallback(async () => {
    if (!isFormValid || isLoading) return;

    try {
      setIsLoading(true);
      console.log('🚀 Signup process started');
      
      const success = await signup(email.trim(), password, name.trim());
      
      if (success) {
        console.log('✅ Signup successful, redirecting to login...');
        Alert.alert(
          'Success! 🎉',
          'Account created successfully! Please sign in with your credentials.',
          [
            {
              text: 'OK',
              onPress: () => router.push('/login')
            }
          ]
        );
      }
    } catch (error: any) {
      console.error('❌ Signup failed:', error);
      Alert.alert(
        'Signup Failed',
        error.message || 'An error occurred during signup. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  }, [name, email, password, isFormValid, isLoading, signup]);

  // Optimized navigation handlers
  const handleBackToLogin = useCallback(() => {
    router.push('/login');
  }, []);

  // Memoized input change handlers
  const handleNameChange = useCallback((text: string) => {
    setName(text);
  }, []);

  const handleEmailChange = useCallback((text: string) => {
    setEmail(text);
  }, []);

  const handlePasswordChange = useCallback((text: string) => {
    setPassword(text);
  }, []);

  const handleConfirmPasswordChange = useCallback((text: string) => {
    setConfirmPassword(text);
  }, []);

  return (
    <LinearGradient
      colors={['#1a5f7a', '#0d2e3a', '#051a23']}
      style={styles.container}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ThemedView style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Join Mangrove Watch</Text>
            <Text style={styles.subtitle}>Create your account to start contributing</Text>
          </View>

          {/* Signup Form */}
          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={handleNameChange}
                placeholder="Enter your full name"
                placeholderTextColor="#8a9ba8"
                autoCapitalize="words"
                autoCorrect={false}
                editable={!isLoading}
                autoFocus={true}
              />
            </View>

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
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={handlePasswordChange}
                placeholder="Enter your password (min 6 characters)"
                placeholderTextColor="#8a9ba8"
                secureTextEntry={true}
                editable={!isLoading}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Confirm Password</Text>
              <TextInput
                style={styles.input}
                value={confirmPassword}
                onChangeText={handleConfirmPasswordChange}
                placeholder="Confirm your password"
                placeholderTextColor="#8a9ba8"
                secureTextEntry={true}
                editable={!isLoading}
              />
            </View>

            {/* Password match indicator */}
            {password.length > 0 && confirmPassword.length > 0 && (
              <View style={styles.passwordMatchContainer}>
                <Text style={[
                  styles.passwordMatchText,
                  password === confirmPassword ? styles.passwordMatchSuccess : styles.passwordMatchError
                ]}>
                  {password === confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
                </Text>
              </View>
            )}

            {/* Signup Button */}
            <TouchableOpacity
              style={buttonStyles}
              onPress={handleSignup}
              disabled={!isFormValid || isLoading}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color="#ffffff" />
                  <Text style={styles.loadingText}>Creating account...</Text>
                </View>
              ) : (
                <Text style={styles.signupButtonText}>Create Account</Text>
              )}
            </TouchableOpacity>

            {/* Back to Login */}
            <TouchableOpacity
              style={styles.backToLoginButton}
              onPress={handleBackToLogin}
              disabled={isLoading}
              activeOpacity={0.7}
            >
              <Text style={styles.backToLoginText}>
                Already have an account? Sign in
              </Text>
            </TouchableOpacity>
          </View>
        </ThemedView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 30,
    paddingVertical: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 50,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#b8c5cc',
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#ffffff',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  passwordMatchContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  passwordMatchText: {
    fontSize: 14,
    fontWeight: '500',
  },
  passwordMatchSuccess: {
    color: '#4CAF50',
  },
  passwordMatchError: {
    color: '#f44336',
  },
  signupButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  signupButtonDisabled: {
    backgroundColor: '#666666',
    opacity: 0.6,
  },
  signupButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  backToLoginButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  backToLoginText: {
    color: '#b8c5cc',
    fontSize: 16,
    textDecorationLine: 'underline',
  },
}); 