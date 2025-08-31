// test-database-operations.js - Test script to verify database operations
const { initializeApp } = require("firebase/app");
const { getFirestore, collection, getDocs, query, orderBy, limit } = require("firebase/firestore");

// Firebase config
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

async function testDatabaseOperations() {
  try {
    console.log("🔍 Testing database operations...");
    
    // Test 1: Check if incidents collection exists and has data
    console.log("\n📋 Testing incidents collection...");
    const incidentsQuery = query(
      collection(db, 'incidents'),
      orderBy('createdAt', 'desc'),
      limit(10)
    );
    
    const incidentsSnapshot = await getDocs(incidentsQuery);
    console.log(`✅ Found ${incidentsSnapshot.size} incidents in collection`);
    
    if (incidentsSnapshot.size > 0) {
      console.log("\n📊 Sample incident data:");
      incidentsSnapshot.forEach((doc, index) => {
        const data = doc.data();
        console.log(`\nIncident ${index + 1} (ID: ${doc.id}):`);
        console.log(`  Description: ${data.description?.substring(0, 50)}...`);
        console.log(`  Status: ${data.status}`);
        console.log(`  User: ${data.userName || data.user || 'Unknown'}`);
        console.log(`  Created: ${data.createdAt?.toDate?.() || data.createdAt}`);
        console.log(`  AI Validated: ${data.aiValidated}`);
      });
    } else {
      console.log("❌ No incidents found in collection");
    }
    
    // Test 2: Check if users collection exists and has data
    console.log("\n👥 Testing users collection...");
    const usersQuery = query(
      collection(db, 'users'),
      limit(5)
    );
    
    const usersSnapshot = await getDocs(usersQuery);
    console.log(`✅ Found ${usersSnapshot.size} users in collection`);
    
    if (usersSnapshot.size > 0) {
      console.log("\n👤 Sample user data:");
      usersSnapshot.forEach((doc, index) => {
        const data = doc.data();
        console.log(`\nUser ${index + 1} (ID: ${doc.id}):`);
        console.log(`  Name: ${data.name}`);
        console.log(`  Email: ${data.email}`);
        console.log(`  Role: ${data.role}`);
        console.log(`  Badge: ${data.badge}`);
      });
    } else {
      console.log("❌ No users found in collection");
    }
    
    console.log("\n🎯 Database test completed!");
    
  } catch (error) {
    console.error("❌ Error testing database operations:", error);
  }
}

// Run the test
testDatabaseOperations().catch(console.error);
