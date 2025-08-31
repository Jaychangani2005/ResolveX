import { ThemedView } from '@/components/ThemedView';
import { useAuth } from '@/contexts/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    ScrollView,
    SafeAreaView
} from 'react-native';
import { validatePhoneNumber, formatPhoneNumber } from '@/services/firebaseService';
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

export default function SignupScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signup } = useAuth();

  // Memoized validation to prevent unnecessary re-renders
  const isFormValid = useMemo(() => {
    const basicValidation = (
      name.trim().length > 0 &&
      email.trim().length > 0 &&
      password.trim().length >= 6 &&
      password === confirmPassword
    );
    
    // Phone number is now mandatory and must be valid
    const phoneValidation = phoneNumber.trim().length > 0 && validatePhoneNumber(phoneNumber);
    
    return basicValidation && phoneValidation;
  }, [name, email, password, confirmPassword, phoneNumber]);

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
      
      const success = await signup(email.trim(), password, name.trim(), phoneNumber.trim());
      
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
      
      let errorMessage = 'An error occurred during signup. Please try again.';
      
      // Handle specific Firebase Auth errors
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'An account with this email already exists. Please try logging in instead.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak. Please use at least 6 characters.';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Network error. Please check your internet connection and try again.';
      } else if (error.message.includes('phone number')) {
        errorMessage = error.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      Alert.alert(
        'Signup Failed',
        errorMessage,
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  }, [name, email, password, phoneNumber, isFormValid, isLoading, signup]);

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

  const handlePhoneNumberChange = useCallback((text: string) => {
    setPhoneNumber(text);
  }, []);

  // Phone number validation status
  const phoneNumberStatus = useMemo(() => {
    if (phoneNumber.trim().length === 0) return 'empty'; // Required field
    if (!validatePhoneNumber(phoneNumber)) return 'invalid';
    return 'valid';
  }, [phoneNumber]);

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
                <Text style={styles.title}>Join Mangrove Watch</Text>
                <Text style={styles.subtitle}>Create your account to start contributing</Text>
              </View>

              {/* Signup Form */}
              <View style={styles.form}>
                <View style={styles.requiredNote}>
                  <Text style={styles.requiredNoteText}>* Required fields</Text>
                </View>
                
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Full Name *</Text>
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
                  <Text style={styles.label}>Email *</Text>
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
                  <Text style={styles.label}>Phone Number *</Text>
                  <TextInput
                    style={[
                      styles.input,
                      phoneNumberStatus === 'invalid' && styles.inputError,
                      phoneNumberStatus === 'valid' && styles.inputSuccess
                    ]}
                    value={phoneNumber}
                    onChangeText={handlePhoneNumberChange}
                    placeholder="Enter your phone number (required)"
                    placeholderTextColor="#8a9ba8"
                    keyboardType="phone-pad"
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!isLoading}
                  />
                  {phoneNumberStatus === 'invalid' && (
                    <Text style={styles.errorText}>
                      Please enter a valid phone number
                    </Text>
                  )}
                  {phoneNumberStatus === 'valid' && (
                    <Text style={styles.successText}>
                      ✓ Valid phone number
                    </Text>
                  )}
                  {phoneNumber.trim().length === 0 && (
                    <Text style={styles.errorText}>
                      Phone number is required
                    </Text>
                  )}
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Password *</Text>
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
                  <Text style={styles.label}>Confirm Password *</Text>
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
  requiredNote: {
    marginBottom: spacing.md,
    alignItems: 'center',
  },
  requiredNoteText: {
    color: '#b8c5cc',
    fontSize: fontSizes.sm,
    fontStyle: 'italic',
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
  inputError: {
    borderColor: '#f44336',
    borderWidth: 2,
  },
  inputSuccess: {
    borderColor: '#4CAF50',
    borderWidth: 2,
  },
  errorText: {
    color: '#f44336',
    fontSize: fontSizes.xs,
    marginTop: spacing.xs,
  },
  successText: {
    color: '#4CAF50',
    fontSize: fontSizes.xs,
    marginTop: spacing.xs,
  },
  passwordMatchContainer: {
    marginBottom: spacing.md,
    alignItems: 'center',
  },
  passwordMatchText: {
    fontSize: fontSizes.sm,
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
  signupButtonDisabled: {
    backgroundColor: '#666666',
    opacity: 0.6,
  },
  signupButtonText: {
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
  backToLoginButton: {
    alignItems: 'center',
    paddingVertical: spacing.md,
    marginBottom: spacing.md,
  },
  backToLoginText: {
    color: '#b8c5cc',
    fontSize: fontSizes.md,
    textDecorationLine: 'underline',
  },
}); 