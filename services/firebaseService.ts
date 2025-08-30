import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  collection, 
  query, 
  orderBy, 
  limit, 
  getDocs,
  addDoc,
  serverTimestamp,
  where,
  writeBatch,
  runTransaction
} from 'firebase/firestore';
import { db } from '../firebase';

export interface User {
  id: string;
  email: string;
  password: string; // Store hashed password in Firestore
  name: string;
  role: 'user' | 'admin' | 'super_user';
  points: number;
  badge: string;
  badgeEmoji: string;
  createdAt: Date;
  lastActive: Date;
  isActive: boolean;
  permissions: string[];
  profileImage?: string;
  phoneNumber?: string;
  location?: {
    city?: string;
    state?: string;
    country?: string;
  };
  preferences?: {
    notifications: boolean;
    emailUpdates: boolean;
    language: string;
  };
}

export interface IncidentReport {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  photoUrl: string;
  location: {
    latitude: number;
    longitude: number;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    fullAddress?: string;
  };
  description: string;
  status: 'pending' | 'reviewed' | 'resolved';
  createdAt: Date;
  updatedAt: Date;
}

export interface LeaderboardEntry {
  id: string;
  userId: string;
  name: string;
  points: number;
  badge: string;
  badgeEmoji: string;
  lastActive: Date;
}

// Simple password hashing function (for production, use a proper hashing library)
const hashPassword = (password: string): string => {
  // This is a simple hash - in production, use bcrypt or similar
  return btoa(password + 'mangrove-watch-salt');
};

// Simple password verification
const verifyPassword = (password: string, hashedPassword: string): boolean => {
  return hashPassword(password) === hashedPassword;
};

// User registration using only Firestore
export const firebaseSignUp = async (
  email: string, 
  password: string, 
  name: string
): Promise<User> => {
  try {
    console.log('📝 Starting user signup process for:', email);
    
    // Check if user already exists
    const usersRef = collection(db, 'users');
    const emailQuery = query(usersRef, where('email', '==', email));
    const emailSnapshot = await getDocs(emailQuery);
    
    if (!emailSnapshot.empty) {
      throw new Error('This email is already registered. Please sign in instead.');
    }
    
    // Create user document ID (you can use email hash or generate UUID)
    const userId = btoa(email).replace(/[^a-zA-Z0-9]/g, '');
    
    // Create comprehensive user profile in Firestore users collection
    const userProfile: Omit<User, 'id'> = {
      email: email.trim(),
      password: hashPassword(password),
      name: name.trim(),
      role: 'user',
      points: 0,
      badge: 'Guardian',
      badgeEmoji: '🌱',
      createdAt: new Date(),
      lastActive: new Date(),
      isActive: true,
      permissions: ['submit_reports', 'view_own_reports', 'view_leaderboard'],
      profileImage: '',
      phoneNumber: '',
      location: {
        city: '',
        state: '',
        country: ''
      },
      preferences: {
        notifications: true,
        emailUpdates: true,
        language: 'en'
      }
    };
    
    // Use a transaction to ensure data consistency in users collection
    await runTransaction(db, async (transaction) => {
      const userRef = doc(db, 'users', userId);
      
      // Check if user document already exists
      const userDoc = await transaction.get(userRef);
      if (userDoc.exists()) {
        throw new Error('User profile already exists');
      }
      
      // Create user profile in users collection
      transaction.set(userRef, userProfile);
      
      // Create user activity log entry
      const activityRef = doc(collection(db, 'user_activities'));
      transaction.set(activityRef, {
        userId: userId,
        action: 'user_created',
        timestamp: serverTimestamp(),
        details: {
          email: email.trim(),
          name: name.trim()
        }
      });
      
      console.log('✅ User profile and activity log created in transaction');
    });
    
    console.log('✅ User created successfully in users collection:', userId);
    
    return {
      id: userId,
      ...userProfile,
    };
  } catch (error: any) {
    console.error('❌ Signup error:', error);
    
    if (error.message.includes('already registered')) {
      throw new Error('This email is already registered. Please sign in instead.');
    } else if (error.message.includes('already exists')) {
      throw new Error('User profile already exists. Please try again.');
    } else {
      throw new Error(error.message || 'Signup failed. Please try again.');
    }
  }
};

// User sign in using only Firestore
export const firebaseSignIn = async (
  email: string, 
  password: string
): Promise<User> => {
  try {
    console.log('🔐 Starting sign in process for:', email);
    
    // Find user by email in users collection
    const usersRef = collection(db, 'users');
    const emailQuery = query(usersRef, where('email', '==', email));
    const emailSnapshot = await getDocs(emailQuery);
    
    if (emailSnapshot.empty) {
      throw new Error('No account found with this email. Please sign up first.');
    }
    
    const userDoc = emailSnapshot.docs[0];
    const userData = userDoc.data();
    
    // Verify password
    if (!verifyPassword(password, userData.password)) {
      throw new Error('Incorrect password. Please try again.');
    }
    
    // Check if user is active
    if (!userData.isActive) {
      throw new Error('Account is deactivated. Please contact support.');
    }
    
    console.log('✅ User authentication successful, updating last active time...');
    
    // Update last active time and create login activity log
    try {
      const batch = writeBatch(db);
      
      // Update last active time
      batch.update(doc(db, 'users', userDoc.id), {
        lastActive: new Date(),
      });
      
      // Create login activity log
      const activityRef = doc(collection(db, 'user_activities'));
      batch.set(activityRef, {
        userId: userDoc.id,
        action: 'user_login',
        timestamp: serverTimestamp(),
        details: {
          email: userData.email,
          loginMethod: 'email_password'
        }
      });
      
      await batch.commit();
      console.log('✅ User activity updated and login logged');
    } catch (updateError) {
      console.warn('⚠️ Could not update user activity:', updateError);
      // Don't fail the entire sign-in if this update fails
    }
    
    console.log('✅ User signed in successfully:', userData.email);
    
    return {
      id: userDoc.id,
      ...userData,
      createdAt: userData.createdAt.toDate(),
      lastActive: new Date(),
    } as User;
  } catch (error: any) {
    console.error('❌ Signin error:', error);
    
    if (error.message.includes('No account found')) {
      throw new Error('No account found with this email. Please sign up first.');
    } else if (error.message.includes('Incorrect password')) {
      throw new Error('Incorrect password. Please try again.');
    } else if (error.message.includes('deactivated')) {
      throw new Error('Account is deactivated. Please contact support.');
    } else {
      throw new Error(error.message || 'Sign in failed. Please try again.');
    }
  }
};

// Admin sign in using only Firestore
export const adminSignIn = async (
  email: string, 
  password: string
): Promise<User> => {
  try {
    console.log('🔐 Starting admin sign in process for:', email);
    
    // Find user by email in users collection
    const usersRef = collection(db, 'users');
    const emailQuery = query(usersRef, where('email', '==', email));
    const emailSnapshot = await getDocs(emailQuery);
    
    if (emailSnapshot.empty) {
      throw new Error('No admin account found with this email.');
    }
    
    const userDoc = emailSnapshot.docs[0];
    const userData = userDoc.data();
    
    // Verify password
    if (!verifyPassword(password, userData.password)) {
      throw new Error('Incorrect password. Please try again.');
    }
    
    // Verify admin role
    if (userData.role !== 'admin' && userData.role !== 'super_user') {
      throw new Error('Access denied. This account is not authorized as admin.');
    }
    
    // Check if user is active
    if (!userData.isActive) {
      throw new Error('Account is deactivated. Please contact system administrator.');
    }
    
    console.log('✅ Admin authentication successful, updating last active time...');
    
    // Update last active time
    try {
      await updateDoc(doc(db, 'users', userDoc.id), {
        lastActive: new Date(),
      });
      console.log('✅ Last active time updated');
    } catch (updateError) {
      console.warn('⚠️ Could not update last active time:', updateError);
    }
    
    console.log('✅ Admin signed in successfully:', userData.email);
    
    return {
      id: userDoc.id,
      ...userData,
      createdAt: userData.createdAt.toDate(),
      lastActive: new Date(),
    } as User;
  } catch (error: any) {
    console.error('❌ Admin signin error:', error);
    
    if (error.message.includes('No admin account')) {
      throw new Error('No admin account found with this email.');
    } else if (error.message.includes('Incorrect password')) {
      throw new Error('Incorrect password. Please try again.');
    } else if (error.message.includes('Access denied')) {
      throw new Error('Access denied. This account is not authorized as admin.');
    } else if (error.message.includes('deactivated')) {
      throw new Error('Account is deactivated. Please contact system administrator.');
    } else {
      throw new Error(error.message || 'Admin sign in failed. Please try again.');
    }
  }
};

// Simple sign out (just clear local state)
export const firebaseSignOut = async (): Promise<void> => {
  try {
    console.log('🚪 User signing out');
    // Since we're not using Firebase Auth, just log the action
    // You'll need to handle local state clearing in your app
  } catch (error: any) {
    throw new Error(error.message);
  }
};

// Get current user from local storage or context (you'll implement this)
export const getCurrentUser = (): User | null => {
  // This should return the current user from your app's state management
  // You'll need to implement this based on how you store user session
  return null;
};

// Enhanced user profile management
export const updateUserProfile = async (
  userId: string,
  updates: Partial<Omit<User, 'id' | 'email' | 'role' | 'createdAt'>>
): Promise<void> => {
  try {
    console.log('📝 Updating user profile in users collection for:', userId);
    
    const userRef = doc(db, 'users', userId);
    
    // Verify user exists before updating
    const userDoc = await getDoc(userRef);
    if (!userDoc.exists()) {
      throw new Error('User not found in users collection');
    }
    
    // Update user profile
    await updateDoc(userRef, {
      ...updates,
      lastActive: new Date(),
    });
    
    console.log('✅ User profile updated successfully in users collection');
  } catch (error: any) {
    console.error('❌ Profile update error in users collection:', error);
    throw new Error(error.message || 'Failed to update profile');
  }
};

// Get user profile with enhanced error handling
export const getUserProfile = async (userId: string): Promise<User | null> => {
  try {
    console.log('🔍 Fetching user profile from users collection for:', userId);
    
    const userDoc = await getDoc(doc(db, 'users', userId));
    
    if (!userDoc.exists()) {
      console.log('⚠️ User profile not found in users collection for:', userId);
      return null;
    }
    
    const userData = userDoc.data();
    console.log('✅ User profile loaded successfully from users collection');
    
    return {
      id: userDoc.id,
      ...userData,
      createdAt: userData.createdAt.toDate(),
      lastActive: userData.lastActive.toDate(),
    } as User;
  } catch (error: any) {
    console.error('❌ Error loading user profile from users collection:', error);
    throw new Error('Failed to load user profile. Please try again.');
  }
};

// Get multiple users for admin purposes
export const getUsers = async (userLimit: number = 100): Promise<User[]> => {
  try {
    console.log('🔍 Fetching users list from users collection, limit:', userLimit);
    
    const usersQuery = query(
      collection(db, 'users'),
      orderBy('createdAt', 'desc'),
      limit(userLimit)
    );
    
    const querySnapshot = await getDocs(usersQuery);
    const users: User[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      users.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt.toDate(),
        lastActive: data.lastActive.toDate(),
      } as User);
    });
    
    console.log(`✅ Loaded ${users.length} users successfully from users collection`);
    return users;
  } catch (error: any) {
    console.error('❌ Error loading users from users collection:', error);
    throw new Error('Failed to load users. Please try again.');
  }
};

// Search users by name or email
export const searchUsers = async (searchTerm: string): Promise<User[]> => {
  try {
    console.log('🔍 Searching users in users collection for term:', searchTerm);
    
    // Note: Firestore doesn't support full-text search natively
    // This is a simple prefix search on name field
    // For production, consider using Algolia or similar service
    
    const usersQuery = query(
      collection(db, 'users'),
      where('name', '>=', searchTerm),
      where('name', '<=', searchTerm + '\uf8ff'),
      limit(20)
    );
    
    const querySnapshot = await getDocs(usersQuery);
    const users: User[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      users.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt.toDate(),
        lastActive: data.lastActive.toDate(),
      } as User);
    });
    
    console.log(`✅ Found ${users.length} users matching search term in users collection`);
    return users;
  } catch (error: any) {
    console.error('❌ Error searching users in users collection:', error);
    throw new Error('Failed to search users. Please try again.');
  }
};

// User management functions
export const updateUserPoints = async (
  userId: string, 
  points: number
): Promise<void> => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      throw new Error('User not found in users collection');
    }
    
    const userData = userDoc.data();
    const newPoints = userData.points + points;
    
    // Determine badge based on points
    let newBadge = userData.badge;
    let newBadgeEmoji = userData.badgeEmoji;
    
    if (newPoints >= 2000 && userData.badge !== 'Master') {
      newBadge = 'Master';
      newBadgeEmoji = '👑';
    } else if (newPoints >= 1000 && userData.badge !== 'Protector') {
      newBadge = 'Protector';
      newBadgeEmoji = '🌳';
    }
    
    await updateDoc(userRef, {
      points: newPoints,
      badge: newBadge,
      badgeEmoji: newBadgeEmoji,
      lastActive: new Date(),
    });
    
    console.log('✅ User points updated successfully in users collection');
  } catch (error: any) {
    console.error('❌ Error updating user points in users collection:', error);
    throw new Error(error.message);
  }
};

// Incident reporting functions
export const submitIncidentReport = async (
  userId: string,
  userEmail: string,
  userName: string,
  photoUrl: string,
  location: { 
    latitude: number; 
    longitude: number;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    fullAddress?: string;
  },
  description: string
): Promise<string> => {
  try {
    console.log('📝 Submitting incident report for user:', userId);
    
    const incidentData: Omit<IncidentReport, 'id' | 'createdAt' | 'updatedAt'> = {
      userId,
      userEmail,
      userName,
      photoUrl,
      location,
      description,
      status: 'pending',
    };
    
    // Add incident to Firestore
    const docRef = await addDoc(collection(db, 'incidents'), {
      ...incidentData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    
    console.log('✅ Incident report submitted successfully:', docRef.id);
    
    // Award points for submitting incident report
    try {
      await updateUserPoints(userId, 50);
      console.log('🎉 Points awarded successfully');
    } catch (pointsError) {
      console.warn('⚠️ Could not award points:', pointsError);
      // Don't fail the entire submission if points can't be awarded
    }
    
    return docRef.id;
  } catch (error: any) {
    console.error('❌ Incident report submission failed:', error);
    
    // Handle specific Firestore errors
    if (error.code === 'permission-denied') {
      throw new Error('Permission denied. Please check your account status.');
    } else if (error.code === 'unavailable') {
      throw new Error('Service temporarily unavailable. Please try again.');
    } else {
      throw new Error(error.message || 'Failed to submit incident report. Please try again.');
    }
  }
};

export const getUserIncidents = async (userId: string): Promise<IncidentReport[]> => {
  try {
    const incidentsQuery = query(
      collection(db, 'incidents'),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(incidentsQuery);
    const incidents: IncidentReport[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.userId === userId) {
        incidents.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate(),
        } as IncidentReport);
      }
    });
    
    return incidents;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

// Leaderboard functions
export const getLeaderboard = async (leaderboardLimit: number = 50): Promise<LeaderboardEntry[]> => {
  try {
    const usersQuery = query(
      collection(db, 'users'),
      orderBy('points', 'desc'),
      limit(leaderboardLimit)
    );
    
    const querySnapshot = await getDocs(usersQuery);
    const leaderboard: LeaderboardEntry[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      leaderboard.push({
        id: doc.id,
        userId: doc.id,
        name: data.name,
        points: data.points,
        badge: data.badge,
        badgeEmoji: data.badgeEmoji,
        lastActive: data.lastActive.toDate(),
      } as LeaderboardEntry);
    });
    
    console.log('✅ Leaderboard loaded from users collection');
    
    return leaderboard;
  } catch (error: any) {
    console.error('❌ Error loading leaderboard from users collection:', error);
    throw new Error(error.message);
  }
};

export const getCommunityStats = async (): Promise<{
  totalUsers: number;
  totalIncidents: number;
  totalPoints: number;
}> => {
  try {
    const usersSnapshot = await getDocs(collection(db, 'users'));
    const incidentsSnapshot = await getDocs(collection(db, 'incidents'));
    
    let totalPoints = 0;
    usersSnapshot.forEach((doc) => {
      totalPoints += doc.data().points || 0;
    });
    
    console.log('✅ Community stats loaded from users collection');
    
    return {
      totalUsers: usersSnapshot.size,
      totalIncidents: incidentsSnapshot.size,
      totalPoints,
    };
  } catch (error: any) {
    console.error('❌ Error loading community stats from users collection:', error);
    throw new Error(error.message);
  }
};

// Admin statistics function
export const getAdminStats = async (): Promise<{
  totalUsers: number;
  totalReports: number;
  pendingReports: number;
  approvedReports: number;
  rejectedReports: number;
  totalAdmins: number;
  activeUsers: number;
}> => {
  try {
    const usersSnapshot = await getDocs(collection(db, 'users'));
    const incidentsSnapshot = await getDocs(collection(db, 'incidents'));
    
    let totalAdmins = 0;
    let activeUsers = 0;
    let totalPoints = 0;
    
    usersSnapshot.forEach((doc) => {
      const userData = doc.data();
      totalPoints += userData.points || 0;
      
      if (userData.role === 'admin' || userData.role === 'super_user') {
        totalAdmins++;
      }
      
      // Consider users active if they've been active in the last 7 days
      const lastActive = userData.lastActive?.toDate();
      if (lastActive && (new Date().getTime() - lastActive.getTime()) < 7 * 24 * 60 * 60 * 1000) {
        activeUsers++;
      }
    });
    
    let pendingReports = 0;
    let approvedReports = 0;
    let rejectedReports = 0;
    
    incidentsSnapshot.forEach((doc) => {
      const incidentData = doc.data();
      switch (incidentData.status) {
        case 'pending':
          pendingReports++;
          break;
        case 'approved':
          approvedReports++;
          break;
        case 'rejected':
          rejectedReports++;
          break;
      }
    });
    
    console.log('✅ Admin stats loaded from users collection');
    
    return {
      totalUsers: usersSnapshot.size,
      totalReports: incidentsSnapshot.size,
      pendingReports,
      approvedReports,
      rejectedReports,
      totalAdmins,
      activeUsers,
    };
  } catch (error: any) {
    console.error('❌ Error loading admin stats from users collection:', error);
    throw new Error(error.message);
  }
};

// Function to create admin user (for super users only) - using only Firestore
export const createAdminUser = async (
  email: string,
  password: string,
  name: string,
  role: 'admin' | 'super_user'
): Promise<User> => {
  try {
    console.log('🔐 Creating admin user:', email, 'Role:', role);
    
    // Check if user already exists
    const usersRef = collection(db, 'users');
    const emailQuery = query(usersRef, where('email', '==', email));
    const emailSnapshot = await getDocs(emailQuery);
    
    if (!emailSnapshot.empty) {
      throw new Error('This email is already registered.');
    }
    
    // Create user document ID
    const userId = btoa(email).replace(/[^a-zA-Z0-9]/g, '');
    
    // Create admin profile in users collection
    const adminProfile: Omit<User, 'id'> = {
      email: email.trim(),
      password: hashPassword(password),
      name: name.trim(),
      role: role,
      points: 0,
      badge: 'Admin',
      badgeEmoji: role === 'super_user' ? '👑' : '🛡️',
      createdAt: new Date(),
      lastActive: new Date(),
      isActive: true,
      permissions: role === 'super_user' 
        ? [
            'manage_users',
            'manage_admins',
            'view_reports',
            'approve_reports',
            'reject_reports',
            'manage_leaderboard',
            'view_analytics',
            'system_settings',
            'delete_users',
            'ban_users'
          ]
        : [
            'manage_users',
            'view_reports',
            'approve_reports',
            'manage_leaderboard',
            'view_analytics'
          ],
      profileImage: '',
      phoneNumber: '',
      location: {
        city: '',
        state: '',
        country: ''
      },
      preferences: {
        notifications: true,
        emailUpdates: true,
        language: 'en'
      }
    };
    
    await setDoc(doc(db, 'users', userId), adminProfile);
    
    console.log('✅ Admin user created successfully in users collection:', userId);
    
    return {
      id: userId,
      ...adminProfile,
    };
  } catch (error: any) {
    console.error('❌ Admin user creation error:', error);
    
    if (error.message.includes('already registered')) {
      throw new Error('This email is already registered.');
    } else {
      throw new Error(error.message || 'Admin user creation failed. Please try again.');
    }
  }
}; 