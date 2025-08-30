import {
    createUserWithEmailAndPassword,
    User as FirebaseUser,
    signInWithEmailAndPassword,
    signOut
} from 'firebase/auth';
import {
    addDoc,
    collection,
    deleteDoc,
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
          name: firebaseUser.displayName || 'User',
          role: 'user',
          points: 0,
          badge: 'Newcomer',
          badgeEmoji: '🌱',
          createdAt: new Date(),
          lastActive: new Date(),
          isActive: true,
          permissions: ['submit_reports', 'view_own_reports', 'view_leaderboard'],
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
        
        const recoveredUser: User = {
          id: firebaseUser.uid,
          ...recoveredUserData
        };
        
        console.log('✅ User profile recovered successfully');
        return recoveredUser;
      } catch (recoveryError) {
        console.error('❌ Failed to recover user profile:', recoveryError);
        throw new Error('User profile not found and recovery failed. Please contact support.');
      }
    }
    
    const userData = userDoc.data() as User;
    console.log('✅ User profile found:', userData);
    console.log('✅ Firebase sign in successful for:', email);
    
    return userData;
  } catch (error: any) {
    console.error('❌ Firebase sign in failed:', error);
    throw error;
  }
};

// Firebase sign up
export const firebaseSignUp = async (email: string, password: string, name: string): Promise<User> => {
  try {
    console.log('📝 Firebase sign up started for:', email);
    
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;
    
    console.log('📝 Firebase user created with UID:', firebaseUser.uid);
    
    const userData: Omit<User, 'id'> = {
      email: email.toLowerCase(),
      name: name.trim(),
      role: 'user',
      points: 0,
      badge: 'Newcomer',
      badgeEmoji: '🌱',
      createdAt: new Date(),
      lastActive: new Date(),
      isActive: true,
      permissions: ['submit_reports', 'view_own_reports', 'view_leaderboard'],
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
    return newUser;
  } catch (error: any) {
    console.error('❌ Firebase sign up failed:', error);
    throw error;
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
    
    if (userProfile.role !== 'admin' && userProfile.role !== 'super_user') {
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

// Submit incident report
export const submitIncidentReport = async (
  userId: string,
  userEmail: string,
  userName: string,
  photoUrl: string,
  location: LocationInfo,
  description: string
): Promise<string> => {
  try {
    console.log('📝 Submitting incident report for user:', userId);
    console.log('📍 LOCATION DATA RECEIVED:');
    console.log(`   Latitude: ${location.latitude}`);
    console.log(`   Longitude: ${location.longitude}`);
    
    if (!location.latitude || !location.longitude) {
      throw new Error('Invalid location coordinates. Latitude and longitude are required.');
    }
    
    const incidentData: Omit<IncidentReport, 'id' | 'createdAt' | 'updatedAt'> = {
      userId,
      userEmail,
      userName,
      photoUrl,
      location,
      description,
      status: 'pending',
    };
    
    console.log('📊 INCIDENT DATA PREPARED FOR FIRESTORE:', incidentData);
    
    const incidentRef = await addDoc(collection(db, 'incidents'), {
      ...incidentData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    
    console.log('✅ Incident report submitted successfully to Firestore:', incidentRef.id);
    
    return incidentRef.id;
  } catch (error: any) {
    console.error('❌ Incident report submission failed:', error);
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
      if (userData.role === 'admin' || userData.role === 'super_user') {
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
  role: 'admin' | 'super_user' | 'ngo'
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
      badge: role === 'ngo' ? 'NGO Partner' : 'Admin',
      badgeEmoji: role === 'super_user' ? '👑' : role === 'ngo' ? '🌿' : '🛡️',
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
        : role === 'ngo'
        ? [
            'view_incident_pictures',
            'view_incident_descriptions',
            'view_user_names',
            'view_ai_validation_status',
            'view_incident_reports'
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
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
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

// Helper function to migrate existing users (run this once to fix existing data)
export const migrateExistingUsers = async (): Promise<void> => {
  try {
    console.log('🔄 Starting user migration...');
    
    // Get all existing users
    const usersSnapshot = await getDocs(collection(db, 'users'));
    let migratedCount = 0;
    
    for (const userDoc of usersSnapshot.docs) {
      const userData = userDoc.data();
      const docId = userDoc.id;
      
      // Check if this is an auto-generated ID (not a Firebase Auth UID)
      if (docId.length === 20 && !docId.includes('@')) {
        console.log(`🔄 Migrating user: ${userData.email} (${docId})`);
        
        try {
          // Try to find the user by email in Firebase Auth
          // Note: This is a simplified approach - in production you might want to handle this differently
          
          // For now, we'll create a new document with the correct structure
          // and mark the old one for deletion
          const newUserData = {
            ...userData,
            migratedFrom: docId,
            migratedAt: new Date()
          };
          
          // Create new document with email as ID (temporary solution)
          const emailKey = userData.email.replace(/[.@]/g, '_');
          await setDoc(doc(db, 'users', emailKey), newUserData);
          
          // Mark old document for deletion
          await updateDoc(doc(db, 'users', docId), {
            _deleted: true,
            _deletedAt: new Date(),
            _migratedTo: emailKey
          });
          
          migratedCount++;
          console.log(`✅ Migrated user: ${userData.email}`);
        } catch (error) {
          console.error(`❌ Failed to migrate user ${userData.email}:`, error);
        }
      }
    }
    
    console.log(`✅ Migration complete! Migrated ${migratedCount} users.`);
    console.log('⚠️  Note: Old documents are marked for deletion. You may want to clean them up manually.');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
};

// Function to clean up deleted/migrated users
export const cleanupDeletedUsers = async (): Promise<void> => {
  try {
    console.log('🧹 Cleaning up deleted users...');
    
    const usersSnapshot = await getDocs(collection(db, 'users'));
    let deletedCount = 0;
    
    for (const userDoc of usersSnapshot.docs) {
      const userData = userDoc.data();
      
      if (userData._deleted) {
        console.log(`🗑️  Deleting migrated user: ${userData.email}`);
        await deleteDoc(doc(db, 'users', userDoc.id));
        deletedCount++;
      }
    }
    
    console.log(`✅ Cleanup complete! Deleted ${deletedCount} migrated users.`);
  } catch (error) {
    console.error('❌ Cleanup failed:', error);
    throw error;
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
      role: 'ngo',
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
        'view_incident_reports'
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