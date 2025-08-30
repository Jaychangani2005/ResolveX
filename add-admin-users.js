// add-admin-users.js - Script to add admin users to the database
import { initializeApp } from "firebase/app";
import { doc, getFirestore, setDoc } from "firebase/firestore";

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

// Admin users data
const adminUsers = {
  "admin_super": {
    "name": "Super Admin",
    "email": "superadmin@resolvex.com",
    "role": "admin",
    "points": 1000,
    "badge": "Super Admin",
    "badgeEmoji": "👑",
    "createdAt": new Date(),
    "lastActive": new Date(),
    "isActive": true,
    "permissions": [
      "manage_users",
      "manage_admins",
      "view_reports",
      "approve_reports",
      "reject_reports",
      "manage_leaderboard",
      "view_analytics",
      "system_settings",
      "delete_users",
      "ban_users",
      "manage_roles",
      "view_all_data"
    ],
    "profileImage": "",
    "phoneNumber": "+919876543213",
    "location": {
      "city": "System",
      "state": "Admin",
      "country": "Global"
    },
    "preferences": {
      "notifications": true,
      "emailUpdates": true,
      "language": "en"
    }
  },
  "admin_forestry": {
    "name": "Forestry Department Admin",
    "email": "forestry.admin@resolvex.com",
    "role": "government_forestry",
    "points": 500,
    "badge": "Forestry Director",
    "badgeEmoji": "🌳",
    "createdAt": new Date(),
    "lastActive": new Date(),
    "isActive": true,
    "permissions": [
      "view_incident_pictures",
      "view_incident_descriptions",
      "view_user_names",
      "view_ai_validation_status",
      "view_incident_reports",
      "view_analytics",
      "approve_reports",
      "manage_reports",
      "submit_reports",
      "manage_forestry_users",
      "view_forestry_data"
    ],
    "profileImage": "",
    "phoneNumber": "+919876543214",
    "location": {
      "city": "Delhi",
      "state": "Delhi",
      "country": "India"
    },
    "preferences": {
      "notifications": true,
      "emailUpdates": true,
      "language": "en"
    }
  },
  "admin_ngo": {
    "name": "NGO Coordinator",
    "email": "ngo.coordinator@resolvex.com",
    "role": "conservation_ngos",
    "points": 300,
    "badge": "NGO Leader",
    "badgeEmoji": "🌿",
    "createdAt": new Date(),
    "lastActive": new Date(),
    "isActive": true,
    "permissions": [
      "view_incident_pictures",
      "view_incident_descriptions",
      "view_user_names",
      "view_ai_validation_status",
      "view_incident_reports",
      "view_analytics",
      "submit_reports",
      "manage_ngo_users",
      "view_ngo_data",
      "export_reports"
    ],
    "profileImage": "",
    "phoneNumber": "+919876543215",
    "location": {
      "city": "Mumbai",
      "state": "Maharashtra",
      "country": "India"
    },
    "preferences": {
      "notifications": true,
      "emailUpdates": true,
      "language": "en"
    }
  },
  "admin_research": {
    "name": "Research Director",
    "email": "research.director@resolvex.com",
    "role": "researchers",
    "points": 400,
    "badge": "Research Lead",
    "badgeEmoji": "🔬",
    "createdAt": new Date(),
    "lastActive": new Date(),
    "isActive": true,
    "permissions": [
      "view_incident_pictures",
      "view_incident_descriptions",
      "view_user_names",
      "view_ai_validation_status",
      "view_incident_reports",
      "view_analytics",
      "export_data",
      "submit_reports",
      "view_research_data",
      "manage_research_users",
      "access_advanced_analytics"
    ],
    "profileImage": "",
    "phoneNumber": "+919876543216",
    "location": {
      "city": "Bangalore",
      "state": "Karnataka",
      "country": "India"
    },
    "preferences": {
      "notifications": true,
      "emailUpdates": true,
      "language": "en"
    }
  }
};

async function addAdminUsers() {
  try {
    console.log("👑 Starting to add admin users...");
    
    // Add each admin user
    for (const [userId, userData] of Object.entries(adminUsers)) {
      console.log(`📝 Adding admin user: ${userData.name} (${userData.role})`);
      
      await setDoc(doc(db, "users", userId), userData);
      
      console.log(`✅ Added admin user: ${userData.name}`);
      console.log(`   Role: ${userData.role}`);
      console.log(`   Badge: ${userData.badge} ${userData.badgeEmoji}`);
      console.log(`   Permissions: ${userData.permissions.length} permissions`);
      console.log("   ---");
    }
    
    console.log("🎉 Successfully added all admin users!");
    console.log("📊 Admin users added:");
    console.log("   👑 Super Admin - Full system access");
    console.log("   🌳 Forestry Admin - Government forestry access");
    console.log("   🌿 NGO Admin - NGO organization access");
    console.log("   🔬 Research Admin - Research institution access");
    console.log("");
    console.log("🔐 These users can now access admin features in your app");
    console.log("📧 Update the email addresses in the script to match your actual admin users");
    
  } catch (error) {
    console.error("❌ Error adding admin users:", error);
  }
}

// Run the function
addAdminUsers();
