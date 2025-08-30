import {
    firebaseSignIn,
    firebaseSignOut,
    firebaseSignUp,
    getUserProfile,
    updateUserProfile
} from '@/services/firebaseService';
import { User } from '@/types/user';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React, { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  signup: (email: string, password: string, name: string, phoneNumber: string) => Promise<boolean>;
  updateProfile: (updates: Partial<Omit<User, 'id' | 'email' | 'role' | 'createdAt'>>) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

// Storage keys for local persistence
const USER_STORAGE_KEY = 'mangrove_watch_user';
const SESSION_STORAGE_KEY = 'mangrove_watch_session';

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 🔒 AUTO-LOGIN DISABLED: Users must sign up and login manually
  // No automatic session restoration from local storage

  // Auto-login disabled - users must sign up and login manually
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        console.log('🔒 Auto-login disabled - users must sign up and login manually');
        
        // Set loading to false immediately since we're not loading any user
        setIsLoading(false);
        
        // Ensure user is redirected to login page
        console.log('🧭 No auto-login - users must login manually');
        
      } catch (error) {
        console.error('❌ Error initializing auth:', error);
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // User storage for normal login/signup sessions (not auto-login)
  const saveUserToStorage = useCallback(async (userData: User) => {
    try {
      const storageData: [string, string][] = [
        [USER_STORAGE_KEY, JSON.stringify(userData)],
        [SESSION_STORAGE_KEY, JSON.stringify({
          timestamp: new Date().getTime()
        })]
      ];
      
      await AsyncStorage.multiSet(storageData);
      console.log('💾 User saved to local storage');
    } catch (error) {
      console.error('❌ Error saving user to storage:', error);
    }
  }, []);

  // Optimized storage clearing
  const clearUserFromStorage = useCallback(async () => {
    try {
      await AsyncStorage.multiRemove([USER_STORAGE_KEY, SESSION_STORAGE_KEY]);
      console.log('🗑️ User cleared from local storage');
    } catch (error) {
      console.error('❌ Error clearing user from storage:', error);
    }
  }, []);

  // Optimized login with immediate state update
  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      console.log('🔐 Attempting login for:', email);
      
      // Start login process
      const loginPromise = firebaseSignIn(email, password);
      
      // Show loading state immediately
      setIsLoading(true);
      
      const userProfile = await loginPromise;
      console.log('✅ Login successful, user profile:', userProfile);
      
      // Update state immediately for better UX
      setUser(userProfile);
      
      // Save to storage in background (non-blocking)
      saveUserToStorage(userProfile).catch(console.error);
      
      // Refresh user data to ensure we have the latest information
      setTimeout(async () => {
        try {
          const refreshedUser = await getUserProfile(userProfile.id);
          if (refreshedUser) {
            setUser(refreshedUser);
            await saveUserToStorage(refreshedUser);
            console.log('🔄 User data refreshed after login');
          }
        } catch (error) {
          console.warn('⚠️ Could not refresh user data:', error);
        }
      }, 1000);
      
      console.log('🎉 Login complete! User should now be redirected to main app');
      
      // Navigate based on user role
      setTimeout(() => {
        console.log('🧭 Navigating user to appropriate dashboard based on role:', userProfile.role);
        if (userProfile.role === 'admin') {
          console.log('🛡️ Redirecting admin user to admin dashboard');
          router.replace('/(admin)/dashboard');
        } else if (userProfile.role === 'conservation_ngos' || userProfile.role === 'government_forestry' || userProfile.role === 'researchers') {
          console.log('🏢 Redirecting professional user to NGO dashboard');
          router.replace('/(ngo)/dashboard');
        } else {
          console.log('👤 Redirecting coastal community user to main tabs');
          router.replace('/(tabs)');
        }
      }, 100);
      
      return true;
    } catch (error: any) {
      console.error('❌ Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [saveUserToStorage]);

  // Optimized signup
  const signup = useCallback(async (email: string, password: string, name: string, phoneNumber: string): Promise<boolean> => {
    try {
      console.log('📝 Attempting signup for:', email);
      console.log('📱 Phone number provided:', phoneNumber);
      
      // Validate phone number is provided
      if (!phoneNumber || phoneNumber.trim().length === 0) {
        throw new Error('Phone number is required for signup');
      }
      
      setIsLoading(true);
      const userProfile = await firebaseSignUp(email, password, name, phoneNumber);
      console.log('✅ Signup successful, user profile:', userProfile);
      
      // Save user to local storage and set state
      await saveUserToStorage(userProfile);
      setUser(userProfile);
      
      console.log('🎉 Signup complete! User should now be redirected to main app');
      
      // Navigate based on user role (new users are always 'coastal_communities' role)
      setTimeout(() => {
        console.log('🧭 Navigating new coastal community user to main tabs');
        router.replace('/(tabs)');
      }, 100);
      
      return true;
    } catch (error: any) {
      console.error('❌ Signup error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [saveUserToStorage]);





  // Optimized logout
  const logout = useCallback(async (): Promise<void> => {
    try {
      // Clear state immediately for better UX
      setUser(null);
      
      // Perform logout operations in parallel
      await Promise.all([
        firebaseSignOut(),
        clearUserFromStorage()
      ]);
      
      // Navigate to login
      router.replace('/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Still navigate even if logout fails
      router.replace('/login');
    }
  }, [clearUserFromStorage]);

  // Optimized profile update
  const updateProfile = useCallback(async (updates: Partial<Omit<User, 'id' | 'email' | 'role' | 'createdAt'>>): Promise<void> => {
    if (!user) {
      throw new Error('No user logged in');
    }

    try {
      console.log('📝 Updating user profile for:', user.id);
      await updateUserProfile(user.id, updates);
      
      // Update local user state and storage
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      
      // Save to storage in background
      saveUserToStorage(updatedUser).catch(console.error);
      
      console.log('✅ User profile updated successfully');
    } catch (error: any) {
      console.error('❌ Profile update error:', error);
      throw error;
    }
  }, [user, saveUserToStorage]);

  // Optimized user refresh
  const refreshUser = useCallback(async (): Promise<void> => {
    if (!user) {
      return;
    }

    try {
      console.log('🔄 Refreshing user profile for:', user.id);
      const refreshedProfile = await getUserProfile(user.id);
      if (refreshedProfile) {
        setUser(refreshedProfile);
        // Save to storage in background
        saveUserToStorage(refreshedProfile).catch(console.error);
        console.log('✅ User profile refreshed successfully');
      }
    } catch (error) {
      console.error('❌ Error refreshing user profile:', error);
    }
  }, [user, saveUserToStorage]);

  const value: AuthContextType = {
    user,
    isLoading,
    login,
    logout,
    signup,
    updateProfile,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
} 