import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
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

  // Optimized user loading with faster session validation
  useEffect(() => {
    const loadUserFromStorage = async () => {
      try {
        console.log('🔄 Loading user from local storage...');
        
        // Use Promise.all for parallel operations
        const [sessionData, userData] = await Promise.all([
          AsyncStorage.getItem(SESSION_STORAGE_KEY),
          AsyncStorage.getItem(USER_STORAGE_KEY)
        ]);

        if (sessionData && userData) {
          const session = JSON.parse(sessionData);
          const userProfile = JSON.parse(userData);
          const now = new Date().getTime();
          
          // Faster session validation (reduced to 12 hours for better UX)
          if (now - session.timestamp < 12 * 60 * 60 * 1000) {
            console.log('✅ User session found, restoring user state');
            setUser(userProfile);
            
            // Navigate based on user role (non-blocking)
            setTimeout(() => {
              if (userProfile.role === 'admin' || userProfile.role === 'super_user') {
                router.replace('/(admin)/dashboard');
              } else {
                router.replace('/(tabs)');
              }
            }, 100);
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

  // Optimized user storage with batch operations
  const saveUserToStorage = useCallback(async (userData: User) => {
    try {
      const storageData = [
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
      
      console.log('🎉 Login complete! User should now be redirected to main app');
      
      return true;
    } catch (error: any) {
      console.error('❌ Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [saveUserToStorage]);

  // Optimized signup
  const signup = useCallback(async (email: string, password: string, name: string): Promise<boolean> => {
    try {
      console.log('📝 Attempting signup for:', email);
      
      setIsLoading(true);
      const userProfile = await firebaseSignUp(email, password, name);
      console.log('✅ Signup successful, user profile:', userProfile);
      
      // Save user to local storage and set state
      await saveUserToStorage(userProfile);
      setUser(userProfile);
      
      console.log('🎉 Signup complete! User should now be redirected to login');
      
      return true;
    } catch (error: any) {
      console.error('❌ Signup error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [saveUserToStorage]);

  // Optimized admin login
  const adminLogin = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      console.log('🔐 Attempting admin login for:', email);
      
      setIsLoading(true);
      const userProfile = await adminSignIn(email, password);
      console.log('✅ Admin login successful, user profile:', userProfile);
      
      // Save user to local storage and set state
      await saveUserToStorage(userProfile);
      setUser(userProfile);
      
      console.log('🎉 Admin login complete! User should now be redirected to admin dashboard');
      
      return true;
    } catch (error: any) {
      console.error('❌ Admin login error:', error);
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