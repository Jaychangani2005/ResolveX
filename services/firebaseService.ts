import {
    createUserWithEmailAndPassword,
    User as FirebaseUser,
    signInWithEmailAndPassword,
    signOut
} from 'firebase/auth';
import {
    addDoc,
    collection,
    doc,
    getDoc,
    getDocs,
    limit,
    orderBy,
    query,
    serverTimestamp,
    setDoc,
    updateDoc,
    where
} from 'firebase/firestore';
import { IncidentReport, User, UserRole } from '../types/user';
import { auth, db } from './firebaseConfig';
import { notificationService } from './notificationService';
import { uploadPhotoToStorage } from './photoUploadService';

// Define missing types locally
interface LocationInfo {
  latitude: number;
  longitude: number;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  fullAddress?: string;
  street?: string;
  postalCode?: string;
}

interface CommunityStats {
  totalUsers: number;
  totalIncidents: number;
  totalPoints: number;
  averagePointsPerUser: number;
}

interface AdminStats {
  totalUsers: number;
  adminUsers: number;
  regularUsers: number;
  totalIncidents: number;
  pendingIncidents: number;
  resolvedIncidents: number;
  totalPoints: number;
  averagePointsPerUser: number;
}

interface LeaderboardEntry {
  id: string;
  userId: string;
  name: string;
  points: number;
  badge: string;
  badgeEmoji: string;
  lastActive: Date;
}

// Phone number validation and formatting
export const validatePhoneNumber = (phoneNumber: string): boolean => {
  // Remove all non-digit characters
  const cleaned = phoneNumber.replace(/\D/g, '');
  
  // Check if it's a valid phone number (7-15 digits)
  if (cleaned.length < 7 || cleaned.length > 15) {
    return false;
  }
  
  // Additional validation for common patterns
  const phoneRegex = /^[\+]?[1-9][\d]{6,14}$/;
  return phoneRegex.test(cleaned);
};

export const formatPhoneNumber = (phoneNumber: string): string => {
  // Remove all non-digit characters
  const cleaned = phoneNumber.replace(/\D/g, '');
  
  // Format based on length and country code
  if (cleaned.length === 10) {
    return `+1${cleaned}`; // US/Canada format
  } else if (cleaned.length === 11 && cleaned.startsWith('1')) {
    return `+${cleaned}`; // US/Canada with country code
  } else if (cleaned.length === 12 && cleaned.startsWith('91')) {
    return `+${cleaned}`; // India format
  } else if (cleaned.length >= 7 && cleaned.length <= 15) {
    return `+${cleaned}`; // International format
  }
  
  return phoneNumber; // Return as is if can't format
};

// Check if phone number already exists
export const checkPhoneNumberExists = async (phoneNumber: string): Promise<boolean> => {
  try {
    const formattedNumber = formatPhoneNumber(phoneNumber);
    
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('phoneNumber', '==', formattedNumber));
    const querySnapshot = await getDocs(q);
    
    return !querySnapshot.empty;
  } catch (error) {
    console.error('Error checking phone number:', error);
    return false;
  }
};

// Firebase sign in
export const firebaseSignIn = async (email: string, password: string): Promise<User> => {
  try {
    console.log('🔐 Firebase sign in started for:', email);
    
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;
    
    console.log('🔐 Firebase authentication successful, fetching user profile...');
    console.log('🔐 User UID:', firebaseUser.uid);
    
    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
    
    if (!userDoc.exists()) {
      console.warn('⚠️ User document not found in Firestore for UID:', firebaseUser.uid);
      console.log('🔄 Attempting to recover user profile...');
      
      // Try to recover by creating a basic user profile
      try {
        const recoveredUserData: Omit<User, 'id'> = {
          email: firebaseUser.email || email,
          name: firebaseUser.displayName || email.split('@')[0] || 'User',
          role: 'coastal_communities',
          points: 0,
          badge: 'Newcomer',
          badgeEmoji: '🌱',
          createdAt: new Date(),
          lastActive: new Date(),
          isActive: true,
          permissions: ['submit_reports', 'view_own_reports', 'view_leaderboard', 'view_community_reports'],
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
        
        await setDoc(doc(db, 'users', firebaseUser.uid), recoveredUserData);
        console.log('✅ User profile recovered successfully');
        
        return {
          id: firebaseUser.uid,
          ...recoveredUserData
        };
      } catch (recoveryError) {
        console.error('❌ Failed to recover user profile:', recoveryError);
        throw new Error('User profile not found and recovery failed');
      }
    }
    
    const userData = userDoc.data() as User;
    const user: User = {
      id: firebaseUser.uid,
      ...userData
    };
    
    console.log('✅ Firebase sign in successful for:', email);
    console.log('📝 User profile:', user);
    return user;
  } catch (error: any) {
    console.error('❌ Firebase sign in failed:', error);
    
    // Provide more specific error messages
    if (error.code === 'auth/user-not-found') {
      throw new Error('No account found with this email address. Please sign up first.');
    } else if (error.code === 'auth/wrong-password') {
      throw new Error('Incorrect password. Please try again.');
    } else if (error.code === 'auth/invalid-email') {
      throw new Error('Invalid email address format.');
    } else if (error.code === 'auth/too-many-requests') {
      throw new Error('Too many failed login attempts. Please try again later.');
    } else if (error.code === 'auth/network-request-failed') {
      throw new Error('Network error. Please check your internet connection.');
    } else {
      throw new Error(error.message || 'Login failed. Please try again.');
    }
  }
};

// Firebase sign up with phone number validation
export const firebaseSignUp = async (
  email: string, 
  password: string, 
  name: string, 
  phoneNumber: string
): Promise<User> => {
  try {
    console.log('📝 Firebase sign up started for:', email);
    
    // Phone number is now mandatory
    if (!phoneNumber || phoneNumber.trim().length === 0) {
      throw new Error('Phone number is required for signup. Please enter a valid phone number.');
    }
    
    // Validate phone number format
    if (!validatePhoneNumber(phoneNumber)) {
      throw new Error('Invalid phone number format. Please enter a valid phone number.');
    }
    
    const formattedNumber = formatPhoneNumber(phoneNumber);
    const phoneExists = await checkPhoneNumberExists(formattedNumber);
    
    if (phoneExists) {
      throw new Error('This phone number is already registered. Please use a different number or try logging in.');
    }
    
    console.log('✅ Phone number validated and formatted:', formattedNumber);
    
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;
    
    console.log('📝 Firebase user created with UID:', firebaseUser.uid);
    
    const userData: Omit<User, 'id'> = {
      email: email.toLowerCase(),
      name: name.trim(),
      role: 'coastal_communities',
      points: 0,
      badge: 'Newcomer',
      badgeEmoji: '🌱',
      createdAt: new Date(),
      lastActive: new Date(),
      isActive: true,
      permissions: ['submit_reports', 'view_own_reports', 'view_leaderboard', 'view_community_reports'],
      profileImage: '', // Default empty profile image
      phoneNumber: formatPhoneNumber(phoneNumber),
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
    
    // Create user document with Firebase Auth UID as document ID
    // This ensures the document ID matches what login will look for
    await setDoc(doc(db, 'users', firebaseUser.uid), userData);
    
    const newUser: User = {
      id: firebaseUser.uid, // Use Firebase Auth UID as the ID
      ...userData
    };
    
    console.log('✅ Firebase sign up successful for:', email);
    console.log('📝 User document created with UID:', firebaseUser.uid);
    if (phoneNumber) {
      console.log('📱 Phone number saved:', userData.phoneNumber);
    }
    return newUser;
  } catch (error: any) {
    console.error('❌ Firebase sign up failed:', error);
    
    // Provide more specific error messages
    if (error.code === 'auth/email-already-in-use') {
      throw new Error('An account with this email already exists. Please try logging in instead.');
    } else if (error.code === 'auth/invalid-email') {
      throw new Error('Invalid email address format.');
    } else if (error.code === 'auth/weak-password') {
      throw new Error('Password is too weak. Please choose a stronger password.');
    } else if (error.code === 'auth/network-request-failed') {
      throw new Error('Network error. Please check your internet connection.');
    } else if (error.message.includes('phone number')) {
      throw error; // Re-throw phone number validation errors
    } else {
      throw new Error(error.message || 'Sign up failed. Please try again.');
    }
  }
};

// Update user phone number
export const updateUserPhoneNumber = async (userId: string, phoneNumber: string): Promise<void> => {
  try {
    console.log('📱 Updating phone number for user:', userId);
    
    // Validate phone number
    if (!validatePhoneNumber(phoneNumber)) {
      throw new Error('Invalid phone number format. Please enter a valid phone number.');
    }
    
    const formattedNumber = formatPhoneNumber(phoneNumber);
    
    // Check if phone number already exists (excluding current user)
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('phoneNumber', '==', formattedNumber));
    const querySnapshot = await getDocs(q);
    
    // Check if any other user has this phone number
    const phoneExists = querySnapshot.docs.some(doc => doc.id !== userId);
    
    if (phoneExists) {
      throw new Error('This phone number is already registered by another user.');
    }
    
    // Update the user's phone number
    await updateDoc(doc(db, 'users', userId), {
      phoneNumber: formattedNumber,
      updatedAt: new Date()
    });
    
    console.log('✅ Phone number updated successfully:', formattedNumber);
  } catch (error: any) {
    console.error('❌ Phone number update failed:', error);
    throw error;
  }
};

// Get user by phone number
export const getUserByPhoneNumber = async (phoneNumber: string): Promise<User | null> => {
  try {
    const formattedNumber = formatPhoneNumber(phoneNumber);
    
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('phoneNumber', '==', formattedNumber));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const userDoc = querySnapshot.docs[0];
      return {
        id: userDoc.id,
        ...userDoc.data()
      } as User;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting user by phone number:', error);
    return null;
  }
};

// Firebase sign out
export const firebaseSignOut = async (): Promise<void> => {
  try {
    await signOut(auth);
    console.log('✅ Firebase sign out successful');
  } catch (error: any) {
    console.error('❌ Firebase sign out failed:', error);
    throw error;
  }
};

// Get current user
export const getCurrentUser = (): FirebaseUser | null => {
  return auth.currentUser;
};

// Get user profile
export const getUserProfile = async (userId: string): Promise<User | null> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      return userDoc.data() as User;
    }
    return null;
  } catch (error) {
    console.error('Error getting user profile:', error);
    return null;
  }
};

// Admin sign in
export const adminSignIn = async (email: string, password: string): Promise<User> => {
  try {
    console.log('🔐 Admin sign in started for:', email);
    
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;
    
    const userProfile = await getUserProfile(firebaseUser.uid);
    
    if (!userProfile) {
      throw new Error('User profile not found');
    }
    
    if (userProfile.role !== 'admin') {
      throw new Error('Access denied. Admin privileges required.');
    }
    
    console.log('✅ Admin sign in successful for:', email);
    return userProfile;
  } catch (error: any) {
    console.error('❌ Admin sign in failed:', error);
    throw error;
  }
};

// Update user profile
export const updateUserProfile = async (userId: string, updates: Partial<Omit<User, 'id' | 'email' | 'role' | 'createdAt'>>): Promise<void> => {
  try {
    console.log('📝 Updating user profile for:', userId);
    
    const updateData = {
      ...updates,
      updatedAt: new Date()
    };
    
    await updateDoc(doc(db, 'users', userId), updateData);
    
    console.log('✅ User profile updated successfully');
  } catch (error: any) {
    console.error('❌ Profile update failed:', error);
    throw error;
  }
};

// Generate unique report name
const generateReportName = (): string => {
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
  const date = new Date().toISOString().split('T')[0].replace(/-/g, '');
  return `REP_${date}_${timestamp}_${randomSuffix}`;
};

// Submit incident report
export const submitIncidentReport = async (
  userId: string,
  userEmail: string,
  userName: string,
  photoUri: string,
  location: LocationInfo,
  description: string,
  onPhotoUploadProgress?: (progress: { bytesTransferred: number; totalBytes: number; percentage: number }) => void
): Promise<string> => {
  try {
    console.log('📝 Submitting incident report for user:', userId);
    console.log('📍 LOCATION DATA RECEIVED:');
    console.log(`   Latitude: ${location.latitude}`);
    console.log(`   Longitude: ${location.longitude}`);
    
    if (!location.latitude || !location.longitude) {
      throw new Error('Invalid location coordinates. Latitude and longitude are required.');
    }

    if (!photoUri || photoUri.trim() === '') {
      throw new Error('Photo is required for incident report submission.');
    }

    if (!description || description.trim().length < 10) {
      throw new Error('Description must be at least 10 characters long.');
    }
    
    // Generate unique report name
    const reportName = generateReportName();
    console.log('🏷️ Generated unique report name:', reportName);
    
    // First, create the incident document with custom ID
    const incidentData: Omit<IncidentReport, 'id' | 'createdAt' | 'updatedAt'> = {
      userId,
      userEmail,
      userName,
      photoUrl: '', // Will be updated after photo upload
      location,
      description: description.trim(),
      status: 'pending',
    };
    
    console.log('📊 INCIDENT DATA PREPARED FOR FIRESTORE:', incidentData);
    
    // Use setDoc with custom ID instead of addDoc for auto-generated ID
    await setDoc(doc(db, 'incidents', reportName), {
      ...incidentData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    
    const incidentId = reportName;
    console.log('✅ Incident document created with custom ID:', incidentId);
    
    // Now upload the photo to Firebase Storage with progress tracking
    console.log('📸 Starting photo upload process...');
    
    let photoUploadResult;
    if (onPhotoUploadProgress) {
      // Upload with progress tracking
      photoUploadResult = await uploadPhotoToStorage(
        photoUri, 
        userId, 
        incidentId, 
        onPhotoUploadProgress
      );
    } else {
      // Upload without progress tracking
      photoUploadResult = await uploadPhotoToStorage(photoUri, userId, incidentId);
    }
    
    // Update the incident document with the photo URL and additional metadata
    await updateDoc(doc(db, 'incidents', incidentId), {
      photoUrl: photoUploadResult.downloadURL,
      photoMetadata: {
        fileName: photoUploadResult.fileName,
        size: photoUploadResult.size,
        contentType: photoUploadResult.contentType,
        uploadedAt: photoUploadResult.metadata.uploadedAt
      },
      updatedAt: serverTimestamp(),
    });
    
    console.log('✅ Photo uploaded and incident report completed successfully');
    console.log(`   Photo URL: ${photoUploadResult.downloadURL}`);
    console.log(`   Photo size: ${photoUploadResult.size} bytes`);
    console.log(`   Photo type: ${photoUploadResult.contentType}`);
    console.log(`   File name: ${photoUploadResult.fileName}`);
    
    // Award points to user for successful submission
    try {
      await awardPointsToUser(userId, 50, 'incident_report_submitted');
      console.log('🎉 Awarded 50 points to user for incident report submission');
    } catch (pointsError) {
      console.warn('⚠️ Failed to award points to user:', pointsError);
      // Don't fail the incident submission if points awarding fails
    }
    
    return incidentId;
  } catch (error: any) {
    console.error('❌ Incident report submission failed:', error);
    
    // Provide more specific error messages
    if (error.message.includes('Photo size')) {
      throw new Error('Photo file is too large. Please use a photo smaller than 10MB.');
    } else if (error.message.includes('Failed to fetch photo')) {
      throw new Error('Failed to process photo. Please try taking a new photo.');
    } else if (error.message.includes('Upload failed')) {
      throw new Error('Failed to upload photo. Please check your internet connection and try again.');
    } else if (error.message.includes('Invalid location')) {
      throw new Error('Location data is invalid. Please ensure GPS is enabled and try again.');
    } else if (error.message.includes('Description must be')) {
      throw new Error('Please provide a detailed description (at least 10 characters).');
    } else if (error.message.includes('Photo is required')) {
      throw new Error('Please take or select a photo before submitting the report.');
    }
    
    throw error;
  }
};

// Get community stats
export const getCommunityStats = async (): Promise<CommunityStats> => {
  try {
    console.log('📊 Fetching community stats...');
    
    const [usersSnapshot, incidentsSnapshot] = await Promise.all([
      getDocs(collection(db, 'users')),
      getDocs(collection(db, 'incidents'))
    ]);
    
    const totalUsers = usersSnapshot.size;
    const totalIncidents = incidentsSnapshot.size;
    
    let totalPoints = 0;
    usersSnapshot.forEach((doc) => {
      const userData = doc.data();
      totalPoints += userData.points || 0;
    });
    
    const stats: CommunityStats = {
      totalUsers,
      totalIncidents,
      totalPoints,
      averagePointsPerUser: totalUsers > 0 ? Math.round(totalPoints / totalUsers) : 0
    };
    
    console.log('✅ Community stats fetched successfully:', stats);
    return stats;
  } catch (error: any) {
    console.error('❌ Error fetching community stats:', error);
    throw error;
  }
};

// Get admin stats
export const getAdminStats = async (): Promise<AdminStats> => {
  try {
    console.log('📊 Fetching admin stats...');
    
    const [usersSnapshot, incidentsSnapshot] = await Promise.all([
      getDocs(collection(db, 'users')),
      getDocs(collection(db, 'incidents'))
    ]);
    
    const totalUsers = usersSnapshot.size;
    const totalIncidents = incidentsSnapshot.size;
    
    let adminUsers = 0;
    let regularUsers = 0;
    let totalPoints = 0;
    
    usersSnapshot.forEach((doc) => {
      const userData = doc.data();
          if (userData.role === 'admin') {
      adminUsers++;
    } else {
      regularUsers++;
    }
      totalPoints += userData.points || 0;
    });
    
    let pendingIncidents = 0;
    let resolvedIncidents = 0;
    
    incidentsSnapshot.forEach((doc) => {
      const incidentData = doc.data();
      if (incidentData.status === 'pending') {
        pendingIncidents++;
      } else if (incidentData.status === 'resolved') {
        resolvedIncidents++;
      }
    });
    
    const stats: AdminStats = {
      totalUsers,
      adminUsers,
      regularUsers,
      totalIncidents,
      pendingIncidents,
      resolvedIncidents,
      totalPoints,
      averagePointsPerUser: totalUsers > 0 ? Math.round(totalPoints / totalUsers) : 0
    };
    
    console.log('✅ Admin stats fetched successfully:', stats);
    return stats;
  } catch (error: any) {
    console.error('❌ Error fetching admin stats:', error);
    throw error;
  }
};

// Function to create admin user (for super users only) - using only Firestore
export const createAdminUser = async (
  email: string,
  password: string,
  name: string,
  role: 'admin' | 'conservation_ngos' | 'government_forestry' | 'researchers'
): Promise<User> => {
  try {
    console.log('👑 Creating admin user:', email);
    
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;
    
    console.log('👑 Firebase admin user created with UID:', firebaseUser.uid);
    
    const adminUserData: Omit<User, 'id'> = {
      email: email.toLowerCase(),
      name: name.trim(),
      role: role,
      points: 0,
      badge: role === 'admin' ? 'Admin' : role === 'conservation_ngos' ? 'NGO Partner' : role === 'government_forestry' ? 'Forestry Official' : 'Researcher',
      badgeEmoji: role === 'admin' ? '🛡️' : role === 'conservation_ngos' ? '🌿' : role === 'government_forestry' ? '🌳' : '🔬',
      createdAt: new Date(),
      lastActive: new Date(),
      isActive: true,
      permissions: role === 'admin'
        ? [
            'manage_users',
            'view_reports',
            'approve_reports',
            'manage_leaderboard',
            'view_analytics',
            'system_settings'
          ]
        : role === 'conservation_ngos'
        ? [
            'view_incident_pictures',
            'view_incident_descriptions',
            'view_user_names',
            'view_ai_validation_status',
            'view_incident_reports',
            'view_analytics',
            'submit_reports'
          ]
        : role === 'government_forestry'
        ? [
            'view_incident_pictures',
            'view_incident_descriptions',
            'view_user_names',
            'view_ai_validation_status',
            'view_incident_reports',
            'view_analytics',
            'approve_reports',
            'manage_reports',
            'submit_reports'
          ]
        : [
            'view_incident_pictures',
            'view_incident_descriptions',
            'view_user_names',
            'view_ai_validation_status',
            'view_incident_reports',
            'view_analytics',
            'export_data',
            'submit_reports',
            'view_research_data'
          ],
      profileImage: '', // Default empty profile image
      phoneNumber: '', // Default empty phone number for admin users
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
    
    // Create admin user document with Firebase Auth UID as document ID
    await setDoc(doc(db, 'users', firebaseUser.uid), adminUserData);
    
    const newAdminUser: User = {
      id: firebaseUser.uid, // Use Firebase Auth UID as the ID
      ...adminUserData
    };
    
    console.log('✅ Admin user created successfully:', email);
    console.log('📝 Admin user document created with UID:', firebaseUser.uid);
    return newAdminUser;
  } catch (error: any) {
    console.error('❌ Admin user creation failed:', error);
    throw error;
  }
};

// Get users
export const getUsers = async (limitCount: number = 50): Promise<User[]> => {
  try {
    console.log('👥 Fetching users with limit:', limitCount);
    
    const usersQuery = query(
      collection(db, 'users'),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    
    const usersSnapshot = await getDocs(usersQuery);
    const users: User[] = [];
    
    usersSnapshot.forEach((doc) => {
      const userData = doc.data() as User;
      users.push({
        ...userData,
        id: doc.id
      });
    });
    
    console.log(`✅ Fetched ${users.length} users successfully`);
    return users;
  } catch (error: any) {
    console.error('❌ Error fetching users:', error);
    throw error;
  }
};

// Get user incidents
export const getUserIncidents = async (userId: string, limitCount: number = 20): Promise<IncidentReport[]> => {
  try {
    console.log('📋 Fetching incidents for user:', userId);
    
    const incidentsQuery = query(
      collection(db, 'incidents'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    
    const incidentsSnapshot = await getDocs(incidentsQuery);
    const incidents: IncidentReport[] = [];
    
    incidentsSnapshot.forEach((doc) => {
      const incidentData = doc.data() as IncidentReport;
      incidents.push({
        ...incidentData,
        id: doc.id
      });
    });
    
    console.log(`✅ Fetched ${incidents.length} incidents for user ${userId}`);
    return incidents;
  } catch (error: any) {
    console.error('❌ Error fetching user incidents:', error);
    throw error;
  }
};

// Function to get all incidents for admin users
export const getIncidents = async (limitCount: number = 100): Promise<IncidentReport[]> => {
  try {
    console.log('📊 Fetching all incidents for admin view...');
    
    const incidentsQuery = query(
      collection(db, 'incidents'),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(incidentsQuery);
    const incidents: IncidentReport[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      incidents.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt ? data.createdAt.toDate() : new Date(),
        updatedAt: data.updatedAt ? data.updatedAt.toDate() : new Date(),
        aiValidated: data.aiValidated || false, // Default to false if not set
      } as IncidentReport);
    });
    
    console.log(`✅ Found ${incidents.length} incidents for admin view`);
    return incidents;
  } catch (error: any) {
    console.error('❌ Error fetching incidents for admin:', error);
    throw new Error(error.message);
  }
};

// Function to get all incidents for NGO users
export const getAllIncidentsForNGO = async (): Promise<IncidentReport[]> => {
  try {
    console.log('🌿 Fetching all incidents for NGO view...');
    
    const incidentsQuery = query(
      collection(db, 'incidents'),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(incidentsQuery);
    const incidents: IncidentReport[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      incidents.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt ? data.createdAt.toDate() : new Date(),
        updatedAt: data.updatedAt ? data.updatedAt.toDate() : new Date(),
        aiValidated: data.aiValidated || false, // Default to false if not set
      } as IncidentReport);
    });
    
    console.log(`✅ Found ${incidents.length} incidents for NGO view`);
    return incidents;
  } catch (error: any) {
    console.error('❌ Error fetching incidents for NGO:', error);
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
        lastActive: data.lastActive ? data.lastActive.toDate() : new Date(),
      } as LeaderboardEntry);
    });
    
    console.log('✅ Leaderboard loaded from users collection');
    
    return leaderboard;
  } catch (error: any) {
    console.error('❌ Error loading leaderboard from users collection:', error);
    throw new Error(error.message);
  }
};

// Function to create NGO user
export const createNGOUser = async (email: string, password: string, name: string): Promise<User> => {
  try {
    console.log('🏢 Creating NGO user:', email);
    
    // Create Firebase Auth user
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;
    
    console.log('🏢 Firebase user created with UID:', firebaseUser.uid);
    
    const ngoUserData: Omit<User, 'id'> = {
      email: email.toLowerCase(),
      name: name.trim(),
      role: 'conservation_ngos',
      points: 0,
      badge: 'NGO Partner',
      badgeEmoji: '🌿',
      createdAt: new Date(),
      lastActive: new Date(),
      isActive: true,
      permissions: [
        'view_incident_pictures',
        'view_incident_descriptions',
        'view_user_names',
        'view_ai_validation_status',
        'view_incident_reports',
        'view_analytics',
        'submit_reports'
      ],
      profileImage: '', // Default empty profile image
      phoneNumber: '', // Default empty phone number for NGO users
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
    
    // Create NGO user document with Firebase Auth UID as document ID
    await setDoc(doc(db, 'users', firebaseUser.uid), ngoUserData);
    
    const newNGOUser: User = {
      id: firebaseUser.uid,
      ...ngoUserData
    };
    
    console.log('✅ NGO user created successfully:', email);
    return newNGOUser;
  } catch (error: any) {
    console.error('❌ Failed to create NGO user:', error);
    throw error;
  }
};

// Function to create government user
export const createGovernmentUser = async (email: string, password: string, name: string): Promise<User> => {
  try {
    console.log('🏛️ Creating government user:', email);
    
    // Create Firebase Auth user
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;
    
    console.log('🏛️ Firebase user created with UID:', firebaseUser.uid);
    
    const governmentUserData: Omit<User, 'id'> = {
      email: email.toLowerCase(),
      name: name.trim(),
      role: 'government',
      points: 0,
      badge: 'Government Official',
      badgeEmoji: '🏛️',
      createdAt: new Date(),
      lastActive: new Date(),
      isActive: true,
      permissions: [
        'view_incident_pictures',
        'view_incident_descriptions',
        'view_user_names',
        'view_ai_validation_status',
        'view_incident_reports',
        'view_analytics',
        'export_data',
        'view_admin_notes'
      ],
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
    
    // Create government user document with Firebase Auth UID as document ID
    await setDoc(doc(db, 'users', firebaseUser.uid), governmentUserData);
    
    const newGovernmentUser: User = {
      id: firebaseUser.uid,
      ...governmentUserData
    };
    
    console.log('✅ Government user created successfully:', email);
    return newGovernmentUser;
  } catch (error: any) {
    console.error('❌ Failed to create government user:', error);
    throw error;
  }
};

// Function to get government dashboard stats
export const getGovernmentStats = async (): Promise<any> => {
  try {
    console.log('🏛️ Fetching government dashboard stats...');
    
    const [usersSnapshot, incidentsSnapshot] = await Promise.all([
      getDocs(collection(db, 'users')),
      getDocs(collection(db, 'incidents'))
    ]);
    
    const totalUsers = usersSnapshot.size;
    const totalReports = incidentsSnapshot.size;
    
    let activeUsers = 0;
    let totalPoints = 0;
    let recentReports = 0; // Reports from last 24 hours
    let weeklyUsers = 0; // New users this week
    
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    usersSnapshot.forEach((doc) => {
      const userData = doc.data();
      if (userData.isActive) {
        activeUsers++;
      }
      totalPoints += userData.points || 0;
      
      // Check for new users this week
      if (userData.createdAt && userData.createdAt.toDate && userData.createdAt.toDate() > oneWeekAgo) {
        weeklyUsers++;
      }
    });
    
    incidentsSnapshot.forEach((doc) => {
      const incidentData = doc.data();
      
      // Check for recent reports (last 24 hours)
      if (incidentData.createdAt && incidentData.createdAt.toDate && incidentData.createdAt.toDate() > oneDayAgo) {
        recentReports++;
      }
    });
    
    const stats = {
      totalUsers,
      totalReports,
      activeUsers,
      totalPoints,
      recentReports,
      weeklyUsers,
      mangroveAreas: 8, // Static for now, could be made dynamic
      averagePointsPerUser: totalUsers > 0 ? Math.round(totalPoints / totalUsers) : 0
    };
    
    console.log('✅ Government stats fetched successfully:', stats);
    return stats;
  } catch (error: any) {
    console.error('❌ Error fetching government stats:', error);
    throw error;
  }
};

// Function to get recent activity for government dashboard
export const getGovernmentRecentActivity = async (): Promise<any[]> => {
  try {
    console.log('🏛️ Fetching recent activity for government dashboard...');
    
    const [recentIncidents, recentUsers] = await Promise.all([
      getDocs(query(
        collection(db, 'incidents'),
        orderBy('createdAt', 'desc'),
        limit(5)
      )),
      getDocs(query(
        collection(db, 'users'),
        orderBy('createdAt', 'desc'),
        limit(5)
      ))
    ]);
    
    const activities: any[] = [];
    
    // Add recent incident activities
    recentIncidents.forEach((doc) => {
      const incidentData = doc.data();
      activities.push({
        type: 'incident',
        action: 'New incident report submitted',
        details: `Report by ${incidentData.userName || 'Anonymous'}`,
        timestamp: incidentData.createdAt?.toDate() || new Date(),
        status: incidentData.status
      });
    });
    
    // Add recent user activities
    recentUsers.forEach((doc) => {
      const userData = doc.data();
      activities.push({
        type: 'user',
        action: 'New user registered',
        details: `${userData.name} (${userData.role})`,
        timestamp: userData.createdAt?.toDate() || new Date(),
        role: userData.role
      });
    });
    
    // Sort by timestamp and return top 10
    const sortedActivities = activities
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 10);
    
    console.log('✅ Recent activity fetched successfully');
    return sortedActivities;
  } catch (error: any) {
    console.error('❌ Error fetching recent activity:', error);
    throw error;
  }
};

// Function to update user role (admin only)
export const updateUserRole = async (userId: string, newRole: UserRole): Promise<void> => {
  try {
    console.log(`🔄 Updating user role for ${userId} to ${newRole}`);
    
    // Update the user's role in Firestore
    await updateDoc(doc(db, 'users', userId), {
      role: newRole,
      updatedAt: new Date()
    });
    
    console.log(`✅ User role updated successfully to ${newRole}`);
  } catch (error: any) {
    console.error('❌ Failed to update user role:', error);
    throw error;
  }
};

// Function to fix generic user names
export const fixGenericUserName = async (userId: string): Promise<void> => {
  try {
    console.log(`🔧 Fixing generic user name for ${userId}`);
    
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (!userDoc.exists()) {
      throw new Error('User not found');
    }
    
    const userData = userDoc.data() as User;
    
    // Check if user has a generic name
    if (userData.name === 'User' || userData.name === 'user') {
      const emailPrefix = userData.email.split('@')[0];
      const newName = emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1);
      
      await updateDoc(doc(db, 'users', userId), {
        name: newName,
        updatedAt: new Date()
      });
      
      console.log(`✅ User name updated from "${userData.name}" to "${newName}"`);
    } else {
      console.log(`ℹ️ User name "${userData.name}" is already personalized`);
    }
  } catch (error: any) {
    console.error('❌ Failed to fix generic user name:', error);
    throw error;
  }
};

// Get all incidents for admin view
export const getIncidents = async (limitCount: number = 100): Promise<IncidentReport[]> => {
  try {
    console.log('📋 Fetching all incidents for admin view...');
    
    const incidentsQuery = query(
      collection(db, 'incidents'),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(incidentsQuery);
    const incidents: IncidentReport[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      incidents.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
        aiValidated: data.aiValidated || false,
      } as IncidentReport);
    });
    
    console.log(`✅ Found ${incidents.length} incidents for admin view`);
    return incidents;
  } catch (error: any) {
    console.error('❌ Error fetching incidents for admin:', error);
    throw new Error(error.message);
  }
};

// Update incident status
export const updateIncidentStatus = async (incidentId: string, status: string, rejectionReason?: string): Promise<void> => {
  try {
    console.log(`📝 Updating incident ${incidentId} status to ${status}`);
    
    const updateData: any = {
      status,
      updatedAt: new Date()
    };
    
    if (status === 'rejected' && rejectionReason) {
      updateData.adminNotes = rejectionReason;
    }
    
    await updateDoc(doc(db, 'incidents', incidentId), updateData);
    
    console.log(`✅ Incident status updated successfully to ${status}`);
  } catch (error: any) {
    console.error('❌ Error updating incident status:', error);
    throw error;
  }
};

// Search users
export const searchUsers = async (searchTerm: string): Promise<User[]> => {
  try {
    console.log('🔍 Searching users with term:', searchTerm);
    
    const usersQuery = query(
      collection(db, 'users'),
      orderBy('name'),
      limit(50)
    );
    
    const usersSnapshot = await getDocs(usersQuery);
    const users: User[] = [];
    
    usersSnapshot.forEach((doc) => {
      const userData = doc.data() as User;
      if (userData.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          userData.email.toLowerCase().includes(searchTerm.toLowerCase())) {
        users.push({
          ...userData,
          id: doc.id
        });
      }
    });
    
    console.log(`✅ Found ${users.length} users matching search term`);
    return users;
  } catch (error: any) {
    console.error('❌ Error searching users:', error);
    throw error;
  }
};

// Award points to user
export const awardPointsToUser = async (userId: string, points: number, reason: string): Promise<void> => {
  try {
    console.log(`🎉 Awarding ${points} points to user ${userId} for: ${reason}`);
    
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      throw new Error('User not found');
    }
    
    const currentPoints = userDoc.data().points || 0;
    const newPoints = currentPoints + points;
    
    await updateDoc(userRef, {
      points: newPoints,
      lastActive: new Date()
    });
    
    console.log(`✅ User ${userId} now has ${newPoints} points (was ${currentPoints})`);
  } catch (error: any) {
    console.error('❌ Error awarding points to user:', error);
    throw error;
  }
};

// Update user password (placeholder - would need Firebase Auth admin SDK)
export const updateUserPassword = async (userId: string, newPassword: string): Promise<void> => {
  try {
    console.log(`🔐 Updating password for user ${userId}`);
    // This would require Firebase Auth admin SDK
    // For now, we'll just log the action
    console.log('⚠️ Password update requires Firebase Auth admin SDK');
    throw new Error('Password update not implemented - requires admin SDK');
  } catch (error: any) {
    console.error('❌ Error updating user password:', error);
    throw error;
  }
};
