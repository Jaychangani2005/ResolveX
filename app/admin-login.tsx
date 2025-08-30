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

export default function AdminLoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { adminLogin } = useAuth();

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setIsLoading(true);
    
    try {
      const success = await adminLogin(email, password);
      if (success) {
        console.log('✅ Admin login successful - waiting for navigation...');
        return;
      }
    } catch (error: any) {
      console.error('❌ Admin auth error:', error);
      Alert.alert(
        'Access Denied', 
        error.message || 'Invalid admin credentials or insufficient permissions.'
      );
    }
    
    setIsLoading(false);
  };

  const goToUserLogin = () => {
    router.replace('/login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#1a1a2e', '#16213e', '#0f3460']}
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
                <Text style={styles.logoEmoji}>🛡️</Text>
                <Text style={styles.logoText}>Admin</Text>
                <Text style={styles.logoSubtext}>Portal</Text>
              </View>
              <Text style={styles.tagline}>
                Secure administrative access to Mangrove Watch
              </Text>
            </View>

            {/* Form Card */}
            <View style={styles.formCard}>
              <Text style={styles.formTitle}>
                Administrative Access
              </Text>
                             <Text style={styles.formSubtitle}>
                 Sign in with your admin credentials
               </Text>

               {/* Admin Info */}
               <View style={styles.adminInfo}>
                 <Text style={styles.adminInfoText}>
                   🔐 This portal is for authorized administrators only.
                 </Text>
                 <Text style={styles.adminInfoText}>
                   Your role will be determined automatically based on your account permissions.
                 </Text>
               </View>

              <FormInput
                label="Admin Email"
                placeholder="Enter admin email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />

              <FormInput
                label="Admin Password"
                placeholder="Enter admin password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoComplete="password"
              />

              <ActionButton
                title={isLoading ? "Authenticating..." : "Sign In as Admin"}
                onPress={handleSubmit}
                variant="primary"
                style={styles.submitButton}
                disabled={isLoading || !email.trim() || !password.trim()}
              />
              
              {isLoading && (
                <Text style={styles.loadingText}>
                  Verifying admin credentials...
                </Text>
              )}

              <TouchableOpacity onPress={goToUserLogin} style={styles.userLoginButton}>
                <Text style={styles.userLoginText}>
                  ← Back to User Login
                </Text>
              </TouchableOpacity>
            </View>

            {/* Security Notice */}
            <View style={styles.securityNotice}>
              <Text style={styles.securityTitle}>🔒 Security Notice</Text>
              <Text style={styles.securityText}>
                This portal is restricted to authorized administrative personnel only. 
                All access attempts are logged and monitored.
              </Text>
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
    color: '#1a1a2e',
  },
  formSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    color: '#666',
    lineHeight: 20,
  },
  adminInfo: {
    marginBottom: 24,
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  adminInfoText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 8,
  },
  submitButton: {
    marginTop: 16,
    marginBottom: 20,
    backgroundColor: '#1a1a2e',
  },
  loadingText: {
    fontSize: 14,
    color: '#1a1a2e',
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
  userLoginButton: {
    alignItems: 'center',
    padding: 16,
  },
  userLoginText: {
    fontSize: 14,
    color: '#1a1a2e',
    fontWeight: '600',
  },
  securityNotice: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 40,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  securityTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
  },
  securityText: {
    fontSize: 12,
    color: '#fff',
    textAlign: 'center',
    opacity: 0.8,
    lineHeight: 18,
  },
}); 