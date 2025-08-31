// reset-database.cjs - Reset Firebase database with correct structure (CommonJS version)
const { initializeApp } = require("firebase/app");
const { doc, getFirestore, serverTimestamp, setDoc, deleteDoc, collection, getDocs } = require("firebase/firestore");

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

// Init Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function resetDatabase() {
  try {
    console.log("🗑️ Starting database reset...");
    
    // Clear existing data
    console.log("🧹 Clearing existing collections...");
    
    // Clear incidents collection
    const incidentsSnapshot = await getDocs(collection(db, "incidents"));
    for (const doc of incidentsSnapshot.docs) {
      await deleteDoc(doc.ref);
      console.log(`🗑️ Deleted incident: ${doc.id}`);
    }
    
    // Clear users collection (be careful with this in production!)
    const usersSnapshot = await getDocs(collection(db, "users"));
    for (const doc of usersSnapshot.docs) {
      await deleteDoc(doc.ref);
      console.log(`🗑️ Deleted user: ${doc.id}`);
    }
    
    // Clear reports collection if it exists
    try {
      const reportsSnapshot = await getDocs(collection(db, "reports"));
      for (const doc of reportsSnapshot.docs) {
        await deleteDoc(doc.ref);
        console.log(`🗑️ Deleted report: ${doc.id}`);
      }
    } catch (error) {
      console.log("ℹ️ Reports collection doesn't exist or already cleared");
    }
    
    console.log("✅ Database cleared successfully!");
    
    // Now seed with correct structure
    console.log("🌱 Seeding database with correct structure...");
    
    // Generate unique report names
    const generateReportName = () => {
      const timestamp = Date.now();
      const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
      const date = new Date().toISOString().split('T')[0].replace(/-/g, '');
      return `REP_${date}_${timestamp}_${randomSuffix}`;
    };
    
    // Create users with correct structure
    await setDoc(doc(db, "users", "user123"), {
      name: "User123",
      email: "user123@example.com",
      role: "coastal_communities",
      points: 20,
      badge: "Guardian",
      badgeEmoji: "🌱",
      createdAt: new Date(),
      lastActive: new Date(),
      isActive: true,
      permissions: ["submit_reports", "view_own_reports", "view_leaderboard", "view_community_reports"],
      location: {
        city: "Kolkata",
        state: "West Bengal",
        country: "India"
      },
      preferences: {
        notifications: true,
        emailUpdates: true,
        language: "en"
      }
    });
    
    await setDoc(doc(db, "users", "user456"), {
      name: "User456",
      email: "user456@example.com",
      role: "conservation_ngos",
      points: 10,
      badge: "Watcher",
      badgeEmoji: "🌿",
      createdAt: new Date(),
      lastActive: new Date(),
      isActive: true,
      permissions: ["view_incident_pictures", "view_incident_descriptions", "view_user_names", "view_ai_validation_status", "view_incident_reports", "view_analytics", "submit_reports"],
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
    });
    
    // Create incidents with correct structure and unique names
    const report1Name = generateReportName();
    await setDoc(doc(db, "incidents", report1Name), {
      userId: "user123",
      userEmail: "user123@example.com",
      userName: "User123",
      photoUrl: "https://dummy.com/cutting1.jpg",
      location: {
        latitude: 22.5726,
        longitude: 88.3639,
        address: "Near Creek Area",
        city: "Kolkata",
        state: "West Bengal",
        country: "India",
        fullAddress: "Near Creek Area, Kolkata, West Bengal, India"
      },
      description: "Illegal mangrove cutting near creek",
      status: "pending",
      aiValidated: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    const report2Name = generateReportName();
    await setDoc(doc(db, "incidents", report2Name), {
      userId: "user456",
      userEmail: "user456@example.com",
      userName: "User456",
      photoUrl: "https://dummy.com/dumping1.jpg",
      location: {
        latitude: 19.076,
        longitude: 72.8777,
        address: "Mangrove Area",
        city: "Mumbai",
        state: "Maharashtra",
        country: "India",
        fullAddress: "Mangrove Area, Mumbai, Maharashtra, India"
      },
      description: "Plastic dumping in mangrove area",
      status: "pending",
      aiValidated: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    console.log("✅ Database reset and seeded successfully!");
    console.log("📊 Created 2 incidents in 'incidents' collection:");
    console.log(`   - ${report1Name}: Illegal mangrove cutting near creek`);
    console.log(`   - ${report2Name}: Plastic dumping in mangrove area`);
    console.log("👥 Created 2 users in 'users' collection");
    console.log("🔍 Your Firebase console should now show the correct structure");
    
  } catch (error) {
    console.error("❌ Error resetting database:", error);
  }
}

// Run the reset
resetDatabase();
