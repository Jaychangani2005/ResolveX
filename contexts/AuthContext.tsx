import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { router } from 'expo-router';
import { 
  firebaseSignIn, 
  firebaseSignUp, 
  firebaseSignOut, 
  onAuthStateChange,
  getCurrentUser,
  getUserProfile,
  adminSignIn,
  User 
} from '@/services/firebaseService';



interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<boolean>;
  adminLogin: (email: string, password: string) => Promise<boolean>;
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

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Listen for Firebase auth state changes
    const unsubscribe = onAuthStateChange(async (firebaseUser) => {
      console.log('🔄 Auth state changed:', firebaseUser ? 'User logged in' : 'No user');
      
               if (firebaseUser) {
           try {
             // Get user profile from Firestore
             const userProfile = await getUserProfile(firebaseUser.uid);
             if (userProfile) {
               console.log('✅ User profile loaded, setting user state');
               setUser(userProfile);
               
               // Navigate based on user role
               if (userProfile.role === 'admin' || userProfile.role === 'super_user') {
                 router.replace('/(admin)/dashboard');
               } else {
                 router.replace('/(tabs)/');
               }
             }
        } catch (error) {
          console.error('❌ Error loading user profile:', error);
          // If profile loading fails, sign out the user
          await firebaseSignOut();
          setUser(null);
        }
      } else {
        console.log('🔓 No user, clearing state');
        setUser(null);
        // Only navigate to login if we're not already there
        if (router.canGoBack()) {
          router.replace('/login');
        }
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log('🔐 Attempting login for:', email);
      const userProfile = await firebaseSignIn(email, password);
      console.log('✅ Login successful, user profile:', userProfile);
      
      // Set user state - this will trigger the useEffect and navigation
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
      
      // Set user state - this will trigger the useEffect and navigation
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
      
      // Set user state - this will trigger the useEffect and navigation
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
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    login,
    logout,
    signup,
    adminLogin,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
} 