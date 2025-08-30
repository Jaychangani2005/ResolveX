import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser,
  UserCredential
} from 'firebase/auth';
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
  where
} from 'firebase/firestore';
import { auth, db } from '../firebase';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin' | 'super_user';
  points: number;
  badge: string;
  badgeEmoji: string;
  createdAt: Date;
  lastActive: Date;
  isActive: boolean;
  permissions: string[];
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

// Authentication functions
export const firebaseSignUp = async (
  email: string, 
  password: string, 
  name: string
): Promise<User> => {
  try {
    const userCredential: UserCredential = await createUserWithEmailAndPassword(
      auth, 
      email, 
      password
    );
    
    const user = userCredential.user;
    
    // Create user profile in Firestore
    const userProfile: Omit<User, 'id'> = {
      email: user.email!,
      name: name.trim(),
      role: 'user',
      points: 0,
      badge: 'Guardian',
      badgeEmoji: '🌱',
      createdAt: new Date(),
      lastActive: new Date(),
      isActive: true,
      permissions: ['submit_reports', 'view_own_reports', 'view_leaderboard'],
    };
    
    await setDoc(doc(db, 'users', user.uid), userProfile);
    
    console.log('✅ User created successfully:', user.uid);
    
    return {
      id: user.uid,
      ...userProfile,
    };
  } catch (error: any) {
    console.error('❌ Signup error:', error);
    
    // Handle specific Firebase auth errors
    if (error.code === 'auth/email-already-in-use') {
      throw new Error('This email is already registered. Please sign in instead.');
    } else if (error.code === 'auth/weak-password') {
      throw new Error('Password should be at least 6 characters long.');
    } else if (error.code === 'auth/invalid-email') {
      throw new Error('Please enter a valid email address.');
    } else {
      throw new Error(error.message || 'Signup failed. Please try again.');
    }
  }
};

export const firebaseSignIn = async (
  email: string, 
  password: string
): Promise<User> => {
  try {
    console.log('🔐 Starting sign in process for:', email);
    
    const userCredential: UserCredential = await signInWithEmailAndPassword(
      auth, 
      email, 
      password
    );
    
    const user = userCredential.user;
    console.log('✅ Firebase auth successful, getting user profile...');
    
    // Get user profile from Firestore with retry logic
    let userDoc;
    let retryCount = 0;
    const maxRetries = 3;
    
    while (retryCount < maxRetries) {
      try {
        userDoc = await getDoc(doc(db, 'users', user.uid));
        break;
      } catch (firestoreError: any) {
        retryCount++;
        console.warn(`⚠️ Firestore read attempt ${retryCount} failed:`, firestoreError);
        if (retryCount >= maxRetries) {
          throw new Error('Unable to load user profile. Please try again.');
        }
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
      }
    }
    
    if (!userDoc || !userDoc.exists()) {
      throw new Error('User profile not found');
    }
    
    const userData = userDoc.data();
    console.log('✅ User profile loaded successfully');
    
    // Update last active time with retry logic
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        lastActive: new Date(),
      });
      console.log('✅ Last active time updated');
    } catch (updateError) {
      console.warn('⚠️ Could not update last active time:', updateError);
      // Don't fail the entire sign-in if this update fails
    }
    
    console.log('✅ User signed in successfully:', user.email);
    
    return {
      id: user.uid,
      ...userData,
      createdAt: userData.createdAt.toDate(),
      lastActive: new Date(),
    } as User;
  } catch (error: any) {
    console.error('❌ Signin error:', error);
    
    // Handle specific Firebase auth errors
    if (error.code === 'auth/user-not-found') {
      throw new Error('No account found with this email. Please sign up first.');
    } else if (error.code === 'auth/wrong-password') {
      throw new Error('Incorrect password. Please try again.');
    } else if (error.code === 'auth/invalid-email') {
      throw new Error('Please enter a valid email address.');
    } else if (error.code === 'auth/too-many-requests') {
      throw new Error('Too many failed attempts. Please try again later.');
    } else if (error.code === 'auth/network-request-failed') {
      throw new Error('Network error. Please check your connection and try again.');
    } else {
      throw new Error(error.message || 'Sign in failed. Please try again.');
    }
  }
};

export const firebaseSignOut = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error: any) {
    throw new Error(error.message);
  }
};

// Admin authentication function
export const adminSignIn = async (
  email: string, 
  password: string
): Promise<User> => {
  try {
    console.log('🔐 Starting admin sign in process for:', email);
    
    const userCredential: UserCredential = await signInWithEmailAndPassword(
      auth, 
      email, 
      password
    );
    
    const user = userCredential.user;
    console.log('✅ Firebase auth successful, getting admin profile...');
    
    // Get user profile from Firestore
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    
    if (!userDoc || !userDoc.exists()) {
      throw new Error('Admin profile not found');
    }
    
    const userData = userDoc.data();
    console.log('✅ Admin profile loaded successfully');
    
    // Verify admin role
    if (userData.role !== 'admin' && userData.role !== 'super_user') {
      throw new Error('Access denied. This account is not authorized as admin.');
    }
    
    // Check if user is active
    if (!userData.isActive) {
      throw new Error('Account is deactivated. Please contact system administrator.');
    }
    
    // Update last active time
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        lastActive: new Date(),
      });
      console.log('✅ Last active time updated');
    } catch (updateError) {
      console.warn('⚠️ Could not update last active time:', updateError);
    }
    
    console.log('✅ Admin signed in successfully:', user.email);
    
    return {
      id: user.uid,
      ...userData,
      createdAt: userData.createdAt.toDate(),
      lastActive: new Date(),
    } as User;
  } catch (error: any) {
    console.error('❌ Admin signin error:', error);
    
    // Handle specific Firebase auth errors
    if (error.code === 'auth/user-not-found') {
      throw new Error('No admin account found with this email.');
    } else if (error.code === 'auth/wrong-password') {
      throw new Error('Incorrect password. Please try again.');
    } else if (error.code === 'auth/invalid-email') {
      throw new Error('Please enter a valid email address.');
    } else if (error.code === 'auth/too-many-requests') {
      throw new Error('Too many failed attempts. Please try again later.');
    } else if (error.code === 'auth/network-request-failed') {
      throw new Error('Network error. Please check your connection and try again.');
    } else {
      throw new Error(error.message || 'Admin sign in failed. Please try again.');
    }
  }
};

export const getCurrentUser = (): FirebaseUser | null => {
  return auth.currentUser;
};

export const onAuthStateChange = (callback: (user: FirebaseUser | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

// User management functions
export const getUserProfile = async (userId: string): Promise<User | null> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    
    if (!userDoc.exists()) {
      return null;
    }
    
    const userData = userDoc.data();
    
    return {
      id: userDoc.id,
      ...userData,
      createdAt: userData.createdAt.toDate(),
      lastActive: userData.lastActive.toDate(),
    } as User;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const updateUserPoints = async (
  userId: string, 
  points: number
): Promise<void> => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      throw new Error('User not found');
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
  } catch (error: any) {
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
export const getLeaderboard = async (limit: number = 50): Promise<LeaderboardEntry[]> => {
  try {
    const usersQuery = query(
      collection(db, 'users'),
      orderBy('points', 'desc'),
      limit(limit)
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
    
    return leaderboard;
  } catch (error: any) {
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
    
    return {
      totalUsers: usersSnapshot.size,
      totalIncidents: incidentsSnapshot.size,
      totalPoints,
    };
  } catch (error: any) {
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
    throw new Error(error.message);
  }
};

// Function to create admin user (for super users only)
export const createAdminUser = async (
  email: string,
  password: string,
  name: string,
  role: 'admin' | 'super_user'
): Promise<User> => {
  try {
    console.log('🔐 Creating admin user:', email, 'Role:', role);
    
    const userCredential: UserCredential = await createUserWithEmailAndPassword(
      auth, 
      email, 
      password
    );
    
    const user = userCredential.user;
    
    // Create admin profile in Firestore
    const adminProfile: Omit<User, 'id'> = {
      email: user.email!,
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
    };
    
    await setDoc(doc(db, 'users', user.uid), adminProfile);
    
    console.log('✅ Admin user created successfully:', user.uid);
    
    return {
      id: user.uid,
      ...adminProfile,
    };
  } catch (error: any) {
    console.error('❌ Admin user creation error:', error);
    
    // Handle specific Firebase auth errors
    if (error.code === 'auth/email-already-in-use') {
      throw new Error('This email is already registered.');
    } else if (error.code === 'auth/weak-password') {
      throw new Error('Password should be at least 6 characters long.');
    } else if (error.code === 'auth/invalid-email') {
      throw new Error('Please enter a valid email address.');
    } else {
      throw new Error(error.message || 'Admin user creation failed. Please try again.');
    }
  }
}; 