import {
    adminSignIn,
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
  signup: (email: string, password: string, name: string) => Promise<boolean>;
  adminLogin: (email: string, password: string) => Promise<boolean>;
  ngoLogin: (email: string, password: string) => Promise<boolean>;
  governmentLogin: (email: string, password: string) => Promise<boolean>;
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
              console.log('🧭 Restoring user session, navigating to appropriate dashboard for role:', userProfile.role);
              if (userProfile.role === 'admin' || userProfile.role === 'super_user') {
                console.log('🛡️ Restoring admin session, redirecting to admin dashboard');
                router.replace('/(admin)/dashboard');
              } else if (userProfile.role === 'ngo') {
                console.log('🏢 Restoring NGO session, redirecting to NGO dashboard');
                router.replace('/(ngo)/dashboard');
              } else if (userProfile.role === 'government') {
                console.log('🏛️ Restoring Government session, redirecting to Government dashboard');
                router.replace('/(government)/dashboard');
              } else {
                console.log('👤 Restoring regular user session, redirecting to main tabs');
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
      
      console.log('🎉 Login complete! User should now be redirected to main app');
      
      // Navigate based on user role
      setTimeout(() => {
        console.log('🧭 Navigating user to appropriate dashboard based on role:', userProfile.role);
        if (userProfile.role === 'admin' || userProfile.role === 'super_user') {
          console.log('🛡️ Redirecting admin user to admin dashboard');
          router.replace('/(admin)/dashboard');
        } else if (userProfile.role === 'ngo') {
          console.log('🏢 Redirecting NGO user to NGO dashboard');
          router.replace('/(ngo)/dashboard');
        } else {
          console.log('👤 Redirecting regular user to main tabs');
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
  const signup = useCallback(async (email: string, password: string, name: string): Promise<boolean> => {
    try {
      console.log('📝 Attempting signup for:', email);
      
      setIsLoading(true);
      const userProfile = await firebaseSignUp(email, password, name);
      console.log('✅ Signup successful, user profile:', userProfile);
      
      // Save user to local storage and set state
      await saveUserToStorage(userProfile);
      setUser(userProfile);
      
      console.log('🎉 Signup complete! User should now be redirected to main app');
      
      // Navigate based on user role (new users are always 'user' role)
      setTimeout(() => {
        console.log('🧭 Navigating new user to main tabs');
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
      
      // Navigate admin user to admin dashboard
      setTimeout(() => {
        console.log('🛡️ Redirecting admin user to admin dashboard');
        router.replace('/(admin)/dashboard');
      }, 100);
      
      return true;
    } catch (error: any) {
      console.error('❌ Admin login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [saveUserToStorage]);

  // Optimized NGO login
  const ngoLogin = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      console.log('🏢 Attempting NGO login for:', email);
      
      setIsLoading(true);
      const userProfile = await firebaseSignIn(email, password);
      
      // Check if user has NGO role
      if (userProfile.role !== 'ngo') {
        throw new Error('Access denied. NGO privileges required.');
      }
      
      console.log('✅ NGO login successful, user profile:', userProfile);
      
      // Save user to local storage and set state
      await saveUserToStorage(userProfile);
      setUser(userProfile);
      
      console.log('🎉 NGO login complete! User should now be redirected to NGO dashboard');
      
      // Navigate NGO user to NGO dashboard
      setTimeout(() => {
        console.log('🏢 Redirecting NGO user to NGO dashboard');
        router.replace('/(ngo)/dashboard');
      }, 100);
      
      return true;
    } catch (error: any) {
      console.error('❌ NGO login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [saveUserToStorage]);

  // Optimized Government login
  const governmentLogin = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      console.log('🏛️ Attempting Government login for:', email);
      
      setIsLoading(true);
      const userProfile = await firebaseSignIn(email, password);
      
      // Check if user has Government role
      if (userProfile.role !== 'government') {
        throw new Error('Access denied. Government privileges required.');
      }
      
      console.log('✅ Government login successful, user profile:', userProfile);
      
      // Save user to local storage and set state
      await saveUserToStorage(userProfile);
      setUser(userProfile);
      
      console.log('🎉 Government login complete! User should now be redirected to Government dashboard');
      
      // Navigate Government user to Government dashboard
      setTimeout(() => {
        console.log('🏛️ Redirecting Government user to Government dashboard');
        router.replace('/(government)/dashboard');
      }, 100);
      
      return true;
    } catch (error: any) {
      console.error('❌ Government login error:', error);
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
    ngoLogin,
    governmentLogin,
    updateProfile,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
} 