import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { router } from 'expo-router';
import { 
  firebaseSignIn, 
  firebaseSignUp, 
  firebaseSignOut, 
  getCurrentUser,
  getUserProfile,
  adminSignIn,
  updateUserProfile,
  User 
} from '@/services/firebaseService';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<boolean>;
  adminLogin: (email: string, password: string) => Promise<boolean>;
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

  // Load user from local storage on app start
  useEffect(() => {
    const loadUserFromStorage = async () => {
      try {
        console.log('🔄 Loading user from local storage...');
        
        // Check if user session exists
        const sessionData = await AsyncStorage.getItem(SESSION_STORAGE_KEY);
        if (sessionData) {
          const session = JSON.parse(sessionData);
          const now = new Date().getTime();
          
          // Check if session is still valid (24 hours)
          if (now - session.timestamp < 24 * 60 * 60 * 1000) {
            const userData = await AsyncStorage.getItem(USER_STORAGE_KEY);
            if (userData) {
              const userProfile = JSON.parse(userData);
              console.log('✅ User session found, restoring user state');
              setUser(userProfile);
              
              // Navigate based on user role
              if (userProfile.role === 'admin' || userProfile.role === 'super_user') {
                router.replace('/(admin)/dashboard');
              } else {
                router.replace('/(tabs)');
              }
            }
          } else {
            // Session expired, clear storage
            console.log('⏰ User session expired, clearing storage');
            await AsyncStorage.multiRemove([USER_STORAGE_KEY, SESSION_STORAGE_KEY]);
          }
        }
      } catch (error) {
        console.error('❌ Error loading user from storage:', error);
        // Clear any corrupted data
        await AsyncStorage.multiRemove([USER_STORAGE_KEY, SESSION_STORAGE_KEY]);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserFromStorage();
  }, []);

  // Save user to local storage
  const saveUserToStorage = async (userData: User) => {
    try {
      await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
      await AsyncStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify({
        timestamp: new Date().getTime()
      }));
      console.log('💾 User saved to local storage');
    } catch (error) {
      console.error('❌ Error saving user to storage:', error);
    }
  };

  // Clear user from local storage
  const clearUserFromStorage = async () => {
    try {
      await AsyncStorage.multiRemove([USER_STORAGE_KEY, SESSION_STORAGE_KEY]);
      console.log('🗑️ User cleared from local storage');
    } catch (error) {
      console.error('❌ Error clearing user from storage:', error);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log('🔐 Attempting login for:', email);
      const userProfile = await firebaseSignIn(email, password);
      console.log('✅ Login successful, user profile:', userProfile);
      
      // Save user to local storage and set state
      await saveUserToStorage(userProfile);
      setUser(userProfile);
      
      console.log('🎉 Login complete! User should now be redirected to main app');
      
      return true;
    } catch (error: any) {
      console.error('❌ Login error:', error);
      // Re-throw the error so the UI can show the specific message
      throw error;
    }
  };

  const signup = async (email: string, password: string, name: string): Promise<boolean> => {
    try {
      console.log('📝 Attempting signup for:', email);
      const userProfile = await firebaseSignUp(email, password, name);
      console.log('✅ Signup successful, user profile:', userProfile);
      
      // Save user to local storage and set state
      await saveUserToStorage(userProfile);
      setUser(userProfile);
      
      // Show success message and redirect to login
      console.log('🎉 Signup complete! User should now be redirected to login');
      
      return true;
    } catch (error: any) {
      console.error('❌ Signup error:', error);
      // Re-throw the error so the UI can show the specific message
      throw error;
    }
  };

  const adminLogin = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log('🔐 Attempting admin login for:', email);
      const userProfile = await adminSignIn(email, password);
      console.log('✅ Admin login successful, user profile:', userProfile);
      
      // Save user to local storage and set state
      await saveUserToStorage(userProfile);
      setUser(userProfile);
      
      console.log('🎉 Admin login complete! User should now be redirected to admin dashboard');
      
      return true;
    } catch (error: any) {
      console.error('❌ Admin login error:', error);
      // Re-throw the error so the UI can show the specific message
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await firebaseSignOut();
      await clearUserFromStorage();
      setUser(null);
      
      // Navigate to login
      router.replace('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const updateProfile = async (updates: Partial<Omit<User, 'id' | 'email' | 'role' | 'createdAt'>>): Promise<void> => {
    if (!user) {
      throw new Error('No user logged in');
    }

    try {
      console.log('📝 Updating user profile for:', user.id);
      await updateUserProfile(user.id, updates);
      
      // Update local user state and storage
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      await saveUserToStorage(updatedUser);
      
      console.log('✅ User profile updated successfully');
    } catch (error: any) {
      console.error('❌ Profile update error:', error);
      throw error;
    }
  };

  const refreshUser = async (): Promise<void> => {
    if (!user) {
      return;
    }

    try {
      console.log('🔄 Refreshing user profile for:', user.id);
      const refreshedProfile = await getUserProfile(user.id);
      if (refreshedProfile) {
        setUser(refreshedProfile);
        await saveUserToStorage(refreshedProfile);
        console.log('✅ User profile refreshed successfully');
      }
    } catch (error) {
      console.error('❌ Error refreshing user profile:', error);
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    login,
    logout,
    signup,
    adminLogin,
    updateProfile,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
} 