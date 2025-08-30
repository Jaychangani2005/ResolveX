import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { ActionButton } from '@/components/ActionButton';
import { useAuth } from '@/contexts/AuthContext';

export default function NGOLoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { ngoLogin } = useAuth();

  const handleNGOLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setIsLoading(true);
    try {
      await ngoLogin(email.trim(), password);
      // Navigation is handled in the AuthContext
    } catch (error: any) {
      console.error('NGO Login error:', error);
      
      // Provide specific error messages for common Firebase Auth errors
      let errorMessage = 'Login failed. Please try again.';
      
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No NGO account found with this email address.';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password. Please try again.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed attempts. Please try again later.';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Network error. Please check your connection.';
      } else if (error.message && error.message.includes('NGO privileges')) {
        errorMessage = 'Access denied. This account does not have NGO privileges.';
      }
      
      Alert.alert('Login Failed', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToMain = () => {
    router.replace('/login');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <ThemedView style={styles.header}>
            <ThemedText style={[styles.title, { color: colors.text }]}>
              🌿 NGO Login
            </ThemedText>
            <ThemedText style={[styles.subtitle, { color: colors.icon }]}>
              Access your NGO dashboard to view incident reports
            </ThemedText>
          </ThemedView>

          {/* Login Form */}
          <ThemedView style={styles.formContainer}>
            <View style={styles.inputContainer}>
              <ThemedText style={[styles.label, { color: colors.text }]}>
                Email Address
              </ThemedText>
              <TextInput
                style={[
                  styles.input,
                  { 
                    backgroundColor: colors.card,
                    color: colors.text,
                    borderColor: colors.border
                  }
                ]}
                placeholder="Enter your NGO email"
                placeholderTextColor={colors.icon}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                autoComplete="email"
              />
            </View>

            <View style={styles.inputContainer}>
              <ThemedText style={[styles.label, { color: colors.text }]}>
                Password
              </ThemedText>
              <TextInput
                style={[
                  styles.input,
                  { 
                    backgroundColor: colors.card,
                    color: colors.text,
                    borderColor: colors.border
                  }
                ]}
                placeholder="Enter your password"
                placeholderTextColor={colors.icon}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="password"
              />
            </View>

            {/* Login Button */}
            <ActionButton
              title="Login to NGO Dashboard"
              onPress={handleNGOLogin}
              loading={isLoading}
              style={styles.loginButton}
            />

            {/* Back to Main Login */}
            <TouchableOpacity
              style={styles.backButton}
              onPress={handleBackToMain}
              disabled={isLoading}
            >
              <ThemedText style={[styles.backButtonText, { color: colors.primary }]}>
                ← Back to Main Login
              </ThemedText>
            </TouchableOpacity>
          </ThemedView>

          {/* Info Section */}
          <ThemedView style={styles.infoContainer}>
            <ThemedText style={[styles.infoTitle, { color: colors.text }]}>
              NGO Access Features
            </ThemedText>
            <View style={styles.featureList}>
              <View style={styles.featureItem}>
                <Text style={[styles.featureIcon, { color: colors.primary }]}>📋</Text>
                <ThemedText style={[styles.featureText, { color: colors.icon }]}>
                  View all incident reports
                </ThemedText>
              </View>
              <View style={styles.featureItem}>
                <Text style={[styles.featureIcon, { color: colors.primary }]}>🤖</Text>
                <ThemedText style={[styles.featureText, { color: colors.icon }]}>
                  AI validation status
                </ThemedText>
              </View>
              <View style={styles.featureItem}>
                <Text style={[styles.featureIcon, { color: colors.primary }]}>📍</Text>
                <ThemedText style={[styles.featureText, { color: colors.icon }]}>
                  Location and photo details
                </ThemedText>
              </View>
              <View style={styles.featureItem}>
                <Text style={[styles.featureIcon, { color: colors.primary }]}>👤</Text>
                <ThemedText style={[styles.featureText, { color: colors.icon }]}>
                  User information access
                </ThemedText>
              </View>
            </View>
          </ThemedView>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
    marginTop: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.8,
    lineHeight: 22,
  },
  formContainer: {
    marginBottom: 30,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    minHeight: 48,
  },
  loginButton: {
    marginTop: 10,
    marginBottom: 20,
  },
  backButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  infoContainer: {
    padding: 20,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  featureList: {
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureIcon: {
    fontSize: 20,
    width: 24,
    textAlign: 'center',
  },
  featureText: {
    fontSize: 14,
    flex: 1,
  },
});
