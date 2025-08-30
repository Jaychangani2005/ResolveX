// sample-database-operations.js - Sample script for database operations
// This file demonstrates how to add data to different collections in the Mangrove Watch database

import { initializeApp } from "firebase/app";
import { 
  getFirestore, 
  doc, 
  setDoc, 
  addDoc, 
  collection, 
  updateDoc, 
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp,
  GeoPoint
} from "firebase/firestore";

// 🔹 Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyB17SgQcBAJr1ZdNxHlyyWVu-2KO54xRCU",
  authDomain: "resolvex-cb01e.firebaseapp.com",
  projectId: "resolvex-cb01e",
  storageBucket: "resolvex-cb01e.firebasestorage.app",
  messagingSenderId: "83940149141",
  appId: "1:83940149141:web:604675dcea46450925589c",
  measurementId: "G-RE3EZ6F13Q"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ============================================================================
// 1. ADDING A NEW USER
// ============================================================================

async function addNewUser() {
  try {
    const newUser = {
      id: "user_" + Date.now(), // Generate unique ID
      email: "john.doe@example.com",
      name: "John Doe",
      role: "coastal_communities",
      points: 0,
      badge: "Newcomer",
      badgeEmoji: "🌱",
      createdAt: new Date(),
      lastActive: new Date(),
      isActive: true,
      permissions: [
        "submit_reports",
        "view_own_reports",
        "view_leaderboard",
        "view_community_reports"
      ],
      profileImage: "",
      phoneNumber: "+919876543210",
      location: {
        city: "Mumbai",
        state: "Maharashtra",
        country: "India"
      },
      preferences: {
        notifications: true,
        emailUpdates: true,
        language: "en"
      }
    };

    // Add user to users collection
    const userRef = doc(db, "users", newUser.id);
    await setDoc(userRef, newUser);
    
    console.log("✅ User added successfully:", newUser.id);
    return newUser.id;
  } catch (error) {
    console.error("❌ Error adding user:", error);
    throw error;
  }
}

// ============================================================================
// 2. ADDING A NEW INCIDENT REPORT
// ============================================================================

async function addNewIncidentReport(userId) {
  try {
    const newIncident = {
      userId: userId,
      userEmail: "john.doe@example.com",
      userName: "John Doe",
      photoUrl: "https://example.com/photos/mangrove-incident-1.jpg",
      location: {
        latitude: 19.0760,
        longitude: 72.8777,
        address: "Mangrove Forest Reserve",
        city: "Mumbai",
        state: "Maharashtra",
        country: "India",
        fullAddress: "Mangrove Forest Reserve, Mumbai, Maharashtra, India"
      },
      description: "Illegal construction activity observed in mangrove area. Concrete structures being built without proper permits. This threatens the natural ecosystem and coastal protection.",
      status: "pending",
      aiValidated: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      severity: "high",
      category: "construction",
      estimatedArea: 500, // square meters
      mangroveSpecies: ["Rhizophora mucronata", "Avicennia marina"]
    };

    // Add incident to incidents collection
    const incidentRef = await addDoc(collection(db, "incidents"), newIncident);
    
    console.log("✅ Incident report added successfully:", incidentRef.id);
    return incidentRef.id;
  } catch (error) {
    console.error("❌ Error adding incident:", error);
    throw error;
  }
}

// ============================================================================
// 3. ADDING USER ACTIVITY
// ============================================================================

async function addUserActivity(userId, incidentId) {
  try {
    const newActivity = {
      userId: userId,
      activityType: "report_submitted",
      description: "Submitted a new mangrove incident report",
      pointsEarned: 50,
      timestamp: new Date(),
      metadata: {
        incidentId: incidentId,
        location: "Mumbai, Maharashtra",
        device: "Mobile App"
      }
    };

    // Add activity to user_activities collection
    const activityRef = await addDoc(collection(db, "user_activities"), newActivity);
    
    console.log("✅ User activity added successfully:", activityRef.id);
    return activityRef.id;
  } catch (error) {
    console.error("❌ Error adding user activity:", error);
    throw error;
  }
}

// ============================================================================
// 4. UPDATING USER POINTS
// ============================================================================

async function updateUserPoints(userId, pointsToAdd) {
  try {
    const userRef = doc(db, "users", userId);
    
    // Get current user data
    const userDoc = await getDoc(userRef);
    if (!userDoc.exists()) {
      throw new Error("User not found");
    }
    
    const currentPoints = userDoc.data().points || 0;
    const newPoints = currentPoints + pointsToAdd;
    
    // Update user points
    await updateDoc(userRef, {
      points: newPoints,
      lastActive: new Date()
    });
    
    console.log("✅ User points updated successfully. New total:", newPoints);
    return newPoints;
  } catch (error) {
    console.error("❌ Error updating user points:", error);
    throw error;
  }
}

// ============================================================================
// 5. ADDING LEADERBOARD ENTRY
// ============================================================================

async function addLeaderboardEntry(userId, userName, points) {
  try {
    const leaderboardEntry = {
      userId: userId,
      userName: userName,
      points: points,
      rank: 0, // Will be calculated later
      badge: "Newcomer",
      reportsSubmitted: 1,
      reportsApproved: 0,
      lastUpdated: new Date(),
      monthlyPoints: points,
      yearlyPoints: points
    };

    // Add to leaderboard collection
    const leaderboardRef = await addDoc(collection(db, "leaderboard"), leaderboardEntry);
    
    console.log("✅ Leaderboard entry added successfully:", leaderboardRef.id);
    return leaderboardRef.id;
  } catch (error) {
    console.error("❌ Error adding leaderboard entry:", error);
    throw error;
  }
}

// ============================================================================
// 6. ADDING NOTIFICATION
// ============================================================================

async function addNotification(userId, title, message, type = "info") {
  try {
    const newNotification = {
      userId: userId,
      title: title,
      message: message,
      type: type,
      isRead: false,
      createdAt: new Date(),
      actionUrl: null,
      metadata: {}
    };

    // Add notification to notifications collection
    const notificationRef = await addDoc(collection(db, "notifications"), newNotification);
    
    console.log("✅ Notification added successfully:", notificationRef.id);
    return notificationRef.id;
  } catch (error) {
    console.error("❌ Error adding notification:", error);
    throw error;
  }
}

// ============================================================================
// 7. ADDING SYSTEM SETTING
// ============================================================================

async function addSystemSetting(key, value, category, description, isPublic = false) {
  try {
    const newSetting = {
      key: key,
      value: value,
      category: category,
      description: description,
      isPublic: isPublic,
      updatedAt: new Date(),
      updatedBy: "system"
    };

    // Add setting to settings collection
    const settingRef = await addDoc(collection(db, "settings"), newSetting);
    
    console.log("✅ System setting added successfully:", settingRef.id);
    return settingRef.id;
  } catch (error) {
    console.error("❌ Error adding system setting:", error);
    throw error;
  }
}

// ============================================================================
// 8. COMPLETE WORKFLOW EXAMPLE
// ============================================================================

async function completeWorkflowExample() {
  try {
    console.log("🚀 Starting complete workflow example...");
    
    // Step 1: Add new user
    const userId = await addNewUser();
    
    // Step 2: Add incident report
    const incidentId = await addNewIncidentReport(userId);
    
    // Step 3: Add user activity
    await addUserActivity(userId, incidentId);
    
    // Step 4: Update user points
    const newPoints = await updateUserPoints(userId, 50);
    
    // Step 5: Add leaderboard entry
    await addLeaderboardEntry(userId, "John Doe", newPoints);
    
    // Step 6: Add notification
    await addNotification(
      userId, 
      "Report Submitted Successfully!", 
      "Your mangrove incident report has been submitted and is under review. You earned 50 points!",
      "success"
    );
    
    // Step 7: Add system setting
    await addSystemSetting(
      "max_photo_size",
      10485760, // 10MB in bytes
      "file_upload",
      "Maximum allowed photo size for incident reports",
      true
    );
    
    console.log("🎉 Complete workflow executed successfully!");
    
  } catch (error) {
    console.error("💥 Workflow failed:", error);
  }
}

// ============================================================================
// 9. QUERY EXAMPLES
// ============================================================================

async function queryExamples() {
  try {
    console.log("🔍 Running query examples...");
    
    // Query 1: Get all pending incidents
    const pendingIncidentsQuery = query(
      collection(db, "incidents"),
      where("status", "==", "pending"),
      orderBy("createdAt", "desc")
    );
    
    const pendingIncidents = await getDocs(pendingIncidentsQuery);
    console.log(`📊 Found ${pendingIncidents.size} pending incidents`);
    
    // Query 2: Get top 10 users by points
    const topUsersQuery = query(
      collection(db, "leaderboard"),
      orderBy("points", "desc"),
      limit(10)
    );
    
    const topUsers = await getDocs(topUsersQuery);
    console.log(`🏆 Found ${topUsers.size} top users`);
    
    // Query 3: Get user's recent activities
    const userActivitiesQuery = query(
      collection(db, "user_activities"),
      where("userId", "==", "user_123"),
      orderBy("timestamp", "desc"),
      limit(5)
    );
    
    const userActivities = await getDocs(userActivitiesQuery);
    console.log(`📱 Found ${userActivities.size} recent activities for user`);
    
  } catch (error) {
    console.error("❌ Error in queries:", error);
  }
}

// ============================================================================
// 10. BATCH OPERATIONS EXAMPLE
// ============================================================================

async function batchOperationsExample() {
  try {
    console.log("📦 Running batch operations example...");
    
    // Add multiple users at once
    const users = [
      {
        id: "user_batch_1",
        email: "user1@example.com",
        name: "User One",
        role: "coastal_communities",
        points: 0,
        badge: "Newcomer",
        badgeEmoji: "🌱",
        createdAt: new Date(),
        lastActive: new Date(),
        isActive: true,
        permissions: ["submit_reports", "view_own_reports"],
        profileImage: "",
        phoneNumber: "+919876543211",
        location: { city: "Delhi", state: "Delhi", country: "India" },
        preferences: { notifications: true, emailUpdates: true, language: "en" }
      },
      {
        id: "user_batch_2",
        email: "user2@example.com",
        name: "User Two",
        role: "conservation_ngos",
        points: 0,
        badge: "Newcomer",
        badgeEmoji: "🌱",
        createdAt: new Date(),
        lastActive: new Date(),
        isActive: true,
        permissions: ["view_incident_pictures", "view_incident_descriptions"],
        profileImage: "",
        phoneNumber: "+919876543212",
        location: { city: "Chennai", state: "Tamil Nadu", country: "India" },
        preferences: { notifications: true, emailUpdates: true, language: "en" }
      }
    ];
    
    // Add users one by one (in a real app, you might use batch writes)
    for (const user of users) {
      const userRef = doc(db, "users", user.id);
      await setDoc(userRef, user);
      console.log(`✅ Added user: ${user.name}`);
    }
    
    console.log("🎉 Batch operations completed successfully!");
    
  } catch (error) {
    console.error("💥 Batch operations failed:", error);
  }
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

async function main() {
  try {
    console.log("🌟 Mangrove Watch Database Operations Sample");
    console.log("=============================================");
    
    // Run individual examples
    await completeWorkflowExample();
    
    // Run query examples
    await queryExamples();
    
    // Run batch operations
    await batchOperationsExample();
    
    console.log("\n✨ All examples completed successfully!");
    
  } catch (error) {
    console.error("💥 Main execution failed:", error);
  }
}

// Export functions for use in other modules
export {
  addNewUser,
  addNewIncidentReport,
  addUserActivity,
  updateUserPoints,
  addLeaderboardEntry,
  addNotification,
  addSystemSetting,
  completeWorkflowExample,
  queryExamples,
  batchOperationsExample
};

// Run main function if this file is executed directly
if (typeof window === 'undefined') {
  main();
}
