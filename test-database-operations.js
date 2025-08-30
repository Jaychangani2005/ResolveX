// test-database-operations.js - Test script for database operations
// Run this file to test the database operations

import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, query, where, limit } from "firebase/firestore";

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
// TEST FUNCTIONS
// ============================================================================

// Test 1: Check if database is accessible
async function testDatabaseConnection() {
  try {
    console.log("🔌 Testing database connection...");
    
    // Try to read from a collection
    const usersQuery = query(collection(db, "users"), limit(1));
    const usersSnapshot = await getDocs(usersQuery);
    
    console.log("✅ Database connection successful!");
    console.log(`📊 Found ${usersSnapshot.size} users in database`);
    
    return true;
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    return false;
  }
}

// Test 2: Check existing data
async function checkExistingData() {
  try {
    console.log("\n📊 Checking existing data...");
    
    // Check users collection
    const usersQuery = query(collection(db, "users"), limit(5));
    const usersSnapshot = await getDocs(usersQuery);
    console.log(`👥 Users: ${usersSnapshot.size} found`);
    
    // Check incidents collection
    const incidentsQuery = query(collection(db, "incidents"), limit(5));
    const incidentsSnapshot = await getDocs(incidentsQuery);
    console.log(`🚨 Incidents: ${incidentsSnapshot.size} found`);
    
    // Check leaderboard collection
    const leaderboardQuery = query(collection(db, "leaderboard"), limit(5));
    const leaderboardSnapshot = await getDocs(leaderboardQuery);
    console.log(`🏆 Leaderboard: ${leaderboardSnapshot.size} found`);
    
    // Check user_activities collection
    const activitiesQuery = query(collection(db, "user_activities"), limit(5));
    const activitiesSnapshot = await getDocs(activitiesQuery);
    console.log(`📱 Activities: ${activitiesSnapshot.size} found`);
    
    return {
      users: usersSnapshot.size,
      incidents: incidentsSnapshot.size,
      leaderboard: leaderboardSnapshot.size,
      activities: activitiesSnapshot.size
    };
  } catch (error) {
    console.error("❌ Error checking existing data:", error);
    return null;
  }
}

// Test 3: Add a simple test user
async function addTestUser() {
  try {
    console.log("\n👤 Adding test user...");
    
    const testUser = {
      id: "test_user_" + Date.now(),
      email: "test.user@example.com",
      name: "Test User",
      role: "coastal_communities",
      points: 100,
      badge: "Tester",
      badgeEmoji: "🧪",
      createdAt: new Date(),
      lastActive: new Date(),
      isActive: true,
      permissions: ["submit_reports", "view_own_reports"],
      profileImage: "",
      phoneNumber: "+919876543299",
      location: {
        city: "Test City",
        state: "Test State",
        country: "Test Country"
      },
      preferences: {
        notifications: true,
        emailUpdates: false,
        language: "en"
      }
    };
    
    // Import the function from the sample file
    const { addNewUser } = await import('./sample-database-operations.js');
    
    // Add the test user
    const userId = await addNewUser();
    console.log("✅ Test user added successfully:", userId);
    
    return userId;
  } catch (error) {
    console.error("❌ Error adding test user:", error);
    return null;
  }
}

// Test 4: Query test data
async function queryTestData() {
  try {
    console.log("\n🔍 Querying test data...");
    
    // Query for test users
    const testUsersQuery = query(
      collection(db, "users"),
      where("name", "==", "Test User"),
      limit(5)
    );
    
    const testUsersSnapshot = await getDocs(testUsersQuery);
    console.log(`🧪 Found ${testUsersSnapshot.size} test users`);
    
    // Show test user details
    testUsersSnapshot.forEach((doc) => {
      const userData = doc.data();
      console.log(`   - ${userData.name} (${userData.email}) - ${userData.role}`);
    });
    
    return testUsersSnapshot.size;
  } catch (error) {
    console.error("❌ Error querying test data:", error);
    return 0;
  }
}

// Test 5: Clean up test data (optional)
async function cleanupTestData() {
  try {
    console.log("\n🧹 Cleaning up test data...");
    
    // Find test users
    const testUsersQuery = query(
      collection(db, "users"),
      where("name", "==", "Test User"),
      limit(10)
    );
    
    const testUsersSnapshot = await getDocs(testUsersQuery);
    console.log(`🗑️ Found ${testUsersSnapshot.size} test users to clean up`);
    
    // Note: In a real application, you might want to delete test data
    // For now, we'll just mark them as inactive
    console.log("ℹ️ Test users marked for cleanup (not deleted in demo)");
    
    return testUsersSnapshot.size;
  } catch (error) {
    console.error("❌ Error cleaning up test data:", error);
    return 0;
  }
}

// ============================================================================
// MAIN TEST EXECUTION
// ============================================================================

async function runAllTests() {
  try {
    console.log("🧪 Mangrove Watch Database Test Suite");
    console.log("=====================================");
    
    // Test 1: Database connection
    const connectionSuccess = await testDatabaseConnection();
    if (!connectionSuccess) {
      console.error("💥 Cannot proceed without database connection");
      return;
    }
    
    // Test 2: Check existing data
    const existingData = await checkExistingData();
    console.log("\n📈 Database Summary:", existingData);
    
    // Test 3: Add test user
    const testUserId = await addTestUser();
    
    // Test 4: Query test data
    if (testUserId) {
      await queryTestData();
    }
    
    // Test 5: Cleanup (optional)
    await cleanupTestData();
    
    console.log("\n🎉 All tests completed successfully!");
    console.log("\n💡 Next steps:");
    console.log("   1. Check your Firebase console to see the new data");
    console.log("   2. Run the sample-database-operations.js for more examples");
    console.log("   3. Modify the test data as needed for your application");
    
  } catch (error) {
    console.error("💥 Test suite failed:", error);
  }
}

// ============================================================================
// QUICK TEST FUNCTIONS
// ============================================================================

// Quick test for specific functionality
async function quickTest() {
  try {
    console.log("⚡ Running quick test...");
    
    // Test database connection
    await testDatabaseConnection();
    
    // Check existing data
    await checkExistingData();
    
    console.log("✅ Quick test completed!");
    
  } catch (error) {
    console.error("❌ Quick test failed:", error);
  }
}

// Export test functions
export {
  testDatabaseConnection,
  checkExistingData,
  addTestUser,
  queryTestData,
  cleanupTestData,
  runAllTests,
  quickTest
};

// Run tests if this file is executed directly
if (typeof window === 'undefined') {
  // Check command line arguments
  const args = process.argv.slice(2);
  
  if (args.includes('--quick')) {
    quickTest();
  } else {
    runAllTests();
  }
}
