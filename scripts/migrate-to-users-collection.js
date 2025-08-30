#!/usr/bin/env node

/**
 * Migration Script: Migrate to Users Collection
 * 
 * This script helps migrate existing user data to the new centralized users collection.
 * Run this script after updating your Firestore security rules.
 */

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Initialize Firebase Admin SDK
// Make sure to have your service account key file
const serviceAccount = require('../path/to/your/serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://your-project-id.firebaseio.com'
});

const db = admin.firestore();

/**
 * Migrate existing users to the new users collection
 */
async function migrateUsers() {
  console.log('🚀 Starting user migration to users collection...');
  
  try {
    // Get all existing users from any old collections
    // Modify these collection names based on your existing structure
    const oldCollections = ['old_users', 'user_profiles', 'accounts'];
    
    for (const collectionName of oldCollections) {
      console.log(`📋 Checking collection: ${collectionName}`);
      
      try {
        const snapshot = await db.collection(collectionName).get();
        
        if (snapshot.empty) {
          console.log(`   ⚠️  Collection ${collectionName} is empty or doesn't exist`);
          continue;
        }
        
        console.log(`   📊 Found ${snapshot.size} documents in ${collectionName}`);
        
        // Process each document
        const batch = db.batch();
        let migratedCount = 0;
        
        for (const doc of snapshot.docs) {
          const userData = doc.data();
          
          // Check if user already exists in users collection
          const existingUser = await db.collection('users').doc(doc.id).get();
          
          if (existingUser.exists) {
            console.log(`   ⚠️  User ${doc.id} already exists in users collection, skipping...`);
            continue;
          }
          
          // Transform old data to new format
          const newUserData = transformUserData(userData, doc.id);
          
          if (newUserData) {
            // Add to batch for users collection
            const userRef = db.collection('users').doc(doc.id);
            batch.set(userRef, newUserData);
            
            // Create activity log entry
            const activityRef = db.collection('user_activities').doc();
            batch.set(activityRef, {
              userId: doc.id,
              action: 'user_migrated',
              timestamp: admin.firestore.FieldValue.serverTimestamp(),
              details: {
                fromCollection: collectionName,
                originalData: userData
              }
            });
            
            migratedCount++;
          }
        }
        
        // Commit the batch
        if (migratedCount > 0) {
          await batch.commit();
          console.log(`   ✅ Successfully migrated ${migratedCount} users from ${collectionName}`);
        } else {
          console.log(`   ℹ️  No users migrated from ${collectionName}`);
        }
        
      } catch (error) {
        console.error(`   ❌ Error processing collection ${collectionName}:`, error.message);
      }
    }
    
    console.log('🎉 User migration completed!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

/**
 * Transform old user data to new format
 */
function transformUserData(oldData, userId) {
  try {
    // Basic validation
    if (!oldData.email || !oldData.name) {
      console.log(`   ⚠️  Skipping user ${userId}: missing required fields`);
      return null;
    }
    
    // Transform to new format
    const newData = {
      id: userId,
      email: oldData.email,
      name: oldData.name,
      role: oldData.role || 'user',
      points: oldData.points || 0,
      badge: oldData.badge || 'Guardian',
      badgeEmoji: oldData.badgeEmoji || '🌱',
      createdAt: oldData.createdAt || new Date(),
      lastActive: oldData.lastActive || new Date(),
      isActive: oldData.isActive !== false, // Default to true
      permissions: oldData.permissions || getDefaultPermissions(oldData.role || 'user'),
      profileImage: oldData.profileImage || oldData.avatar || '',
      phoneNumber: oldData.phoneNumber || oldData.phone || '',
      location: {
        city: oldData.city || oldData.location?.city || '',
        state: oldData.state || oldData.location?.state || '',
        country: oldData.country || oldData.location?.country || ''
      },
      preferences: {
        notifications: oldData.notifications !== false,
        emailUpdates: oldData.emailUpdates !== false,
        language: oldData.language || 'en'
      }
    };
    
    return newData;
    
  } catch (error) {
    console.error(`   ❌ Error transforming user ${userId}:`, error.message);
    return null;
  }
}

/**
 * Get default permissions based on user role
 */
function getDefaultPermissions(role) {
  switch (role) {
    case 'admin':
      return [
        'manage_users',
        'view_reports',
        'approve_reports',
        'manage_leaderboard',
        'view_analytics'
      ];
    case 'super_user':
      return [
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
      ];
    case 'ngo':
      return [
        'view_incident_pictures',
        'view_incident_descriptions',
        'view_user_names',
        'view_ai_validation_status',
        'view_incident_reports'
      ];
    default:
      return [
        'submit_reports',
        'view_own_reports',
        'view_leaderboard'
      ];
  }
}

/**
 * Create sample admin user
 */
async function createSampleAdmin() {
  console.log('👑 Creating sample admin user...');
  
  try {
    const adminData = {
      email: 'admin@mangrovewatch.com',
      name: 'System Administrator',
      role: 'super_user',
      points: 0,
      badge: 'Super Admin',
      badgeEmoji: '👑',
      createdAt: new Date(),
      lastActive: new Date(),
      isActive: true,
      permissions: [
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
    
    // Note: You'll need to create the Firebase Auth user separately
    // This just creates the Firestore profile
    const adminRef = db.collection('users').doc('sample-admin-id');
    await adminRef.set(adminData);
    
    console.log('✅ Sample admin user created');
    console.log('⚠️  Remember to create the Firebase Auth user with the same UID');
    
  } catch (error) {
    console.error('❌ Error creating sample admin:', error.message);
  }
}

/**
 * Verify migration results
 */
async function verifyMigration() {
  console.log('🔍 Verifying migration results...');
  
  try {
    const usersSnapshot = await db.collection('users').get();
    const activitiesSnapshot = await db.collection('user_activities').get();
    
    console.log(`📊 Users collection: ${usersSnapshot.size} documents`);
    console.log(`📊 User activities collection: ${activitiesSnapshot.size} documents`);
    
    // Show sample users
    if (!usersSnapshot.empty) {
      console.log('\n📋 Sample users:');
      usersSnapshot.docs.slice(0, 3).forEach(doc => {
        const data = doc.data();
        console.log(`   - ${data.name} (${data.email}) - Role: ${data.role}`);
      });
    }
    
    console.log('\n✅ Migration verification completed');
    
  } catch (error) {
    console.error('❌ Verification failed:', error.message);
  }
}

/**
 * Main execution
 */
async function main() {
  console.log('🔄 Mangrove Watch - Users Collection Migration');
  console.log('==============================================\n');
  
  // Check command line arguments
  const args = process.argv.slice(2);
  
  if (args.includes('--verify-only')) {
    await verifyMigration();
  } else if (args.includes('--create-admin')) {
    await createSampleAdmin();
  } else {
    // Full migration
    await migrateUsers();
    await verifyMigration();
  }
  
  console.log('\n🎯 Migration script completed successfully!');
  process.exit(0);
}

// Run the script
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Script execution failed:', error);
    process.exit(1);
  });
}

module.exports = {
  migrateUsers,
  createSampleAdmin,
  verifyMigration
}; 