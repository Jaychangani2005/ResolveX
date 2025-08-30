// add-all-users.js - Script to add all user types with password "123456"
import { initializeApp } from "firebase/app";
import { doc, getFirestore, setDoc } from "firebase/firestore";
import { createUserWithEmailAndPassword, getAuth } from "firebase/auth";

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
const auth = getAuth(app);

// All users data with password "123456"
const allUsers = {
  // Coastal Community Users
  "user_coastal_1": {
    "name": "Coastal User 1",
    "email": "coastal1@resolvex.com",
    "password": "123456",
    "role": "coastal_communities",
    "points": 50,
    "badge": "Coastal Guardian",
    "badgeEmoji": "🌱",
    "createdAt": new Date(),
    "lastActive": new Date(),
    "isActive": true,
    "permissions": ["submit_reports", "view_own_reports", "view_leaderboard", "view_community_reports"],
    "profileImage": "",
    "phoneNumber": "+919876543220",
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
  "user_coastal_2": {
    "name": "Coastal User 2",
    "email": "coastal2@resolvex.com",
    "password": "123456",
    "role": "coastal_communities",
    "points": 75,
    "badge": "Mangrove Protector",
    "badgeEmoji": "🌿",
    "createdAt": new Date(),
    "lastActive": new Date(),
    "isActive": true,
    "permissions": ["submit_reports", "view_own_reports", "view_leaderboard", "view_community_reports"],
    "profileImage": "",
    "phoneNumber": "+919876543221",
    "location": {
      "city": "Chennai",
      "state": "Tamil Nadu",
      "country": "India"
    },
    "preferences": {
      "notifications": true,
      "emailUpdates": true,
      "language": "en"
    }
  },

  // NGO Users
  "user_ngo_1": {
    "name": "NGO Coordinator 1",
    "email": "ngo1@resolvex.com",
    "password": "123456",
    "role": "conservation_ngos",
    "points": 200,
    "badge": "NGO Partner",
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
      "submit_reports"
    ],
    "profileImage": "",
    "phoneNumber": "+919876543222",
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
  },
  "user_ngo_2": {
    "name": "NGO Coordinator 2",
    "email": "ngo2@resolvex.com",
    "password": "123456",
    "role": "conservation_ngos",
    "points": 150,
    "badge": "Conservation Leader",
    "badgeEmoji": "🌱",
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
      "submit_reports"
    ],
    "profileImage": "",
    "phoneNumber": "+919876543223",
    "location": {
      "city": "Hyderabad",
      "state": "Telangana",
      "country": "India"
    },
    "preferences": {
      "notifications": true,
      "emailUpdates": true,
      "language": "en"
    }
  },

  // Government Forestry Users
  "user_forestry_1": {
    "name": "Forestry Officer 1",
    "email": "forestry1@resolvex.com",
    "password": "123456",
    "role": "government_forestry",
    "points": 300,
    "badge": "Forestry Official",
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
      "submit_reports"
    ],
    "profileImage": "",
    "phoneNumber": "+919876543224",
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
  "user_forestry_2": {
    "name": "Forestry Officer 2",
    "email": "forestry2@resolvex.com",
    "password": "123456",
    "role": "government_forestry",
    "points": 250,
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
      "submit_reports"
    ],
    "profileImage": "",
    "phoneNumber": "+919876543225",
    "location": {
      "city": "Kolkata",
      "state": "West Bengal",
      "country": "India"
    },
    "preferences": {
      "notifications": true,
      "emailUpdates": true,
      "language": "en"
    }
  },

  // Researcher Users
  "user_research_1": {
    "name": "Research Scientist 1",
    "email": "research1@resolvex.com",
    "password": "123456",
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
      "view_research_data"
    ],
    "profileImage": "",
    "phoneNumber": "+919876543226",
    "location": {
      "city": "Pune",
      "state": "Maharashtra",
      "country": "India"
    },
    "preferences": {
      "notifications": true,
      "emailUpdates": true,
      "language": "en"
    }
  },
  "user_research_2": {
    "name": "Research Scientist 2",
    "email": "research2@resolvex.com",
    "password": "123456",
    "role": "researchers",
    "points": 350,
    "badge": "Data Analyst",
    "badgeEmoji": "📊",
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
      "view_research_data"
    ],
    "profileImage": "",
    "phoneNumber": "+919876543227",
    "location": {
      "city": "Ahmedabad",
      "state": "Gujarat",
      "country": "India"
    },
    "preferences": {
      "notifications": true,
      "emailUpdates": true,
      "language": "en"
    }
  },

  // Admin Users
  "user_admin_1": {
    "name": "Super Admin",
    "email": "admin@resolvex.com",
    "password": "123456",
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
    "phoneNumber": "+919876543228",
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
  "user_admin_2": {
    "name": "System Admin",
    "email": "system@resolvex.com",
    "password": "123456",
    "role": "admin",
    "points": 800,
    "badge": "System Admin",
    "badgeEmoji": "🛡️",
    "createdAt": new Date(),
    "lastActive": new Date(),
    "isActive": true,
    "permissions": [
      "manage_users",
      "view_reports",
      "approve_reports",
      "manage_leaderboard",
      "view_analytics",
      "system_settings"
    ],
    "profileImage": "",
    "phoneNumber": "+919876543229",
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
  }
};

async function addAllUsers() {
  try {
    console.log("👥 Starting to add all users with password '123456'...");
    
    // Add each user
    for (const [userId, userData] of Object.entries(allUsers)) {
      console.log(`📝 Adding user: ${userData.name} (${userData.role})`);
      
      try {
        // Create Firebase Auth user
        const userCredential = await createUserWithEmailAndPassword(
          auth, 
          userData.email, 
          userData.password
        );
        
        console.log(`✅ Firebase Auth user created: ${userData.email}`);
        
        // Remove password from userData before saving to Firestore
        const { password, ...userDataForFirestore } = userData;
        
        // Create user document in Firestore
        await setDoc(doc(db, "users", userCredential.user.uid), {
          ...userDataForFirestore,
          id: userCredential.user.uid // Use Firebase Auth UID as document ID
        });
        
        console.log(`✅ User document created in Firestore: ${userData.name}`);
        console.log(`   Role: ${userData.role}`);
        console.log(`   Badge: ${userData.badge} ${userData.badgeEmoji}`);
        console.log(`   Permissions: ${userData.permissions.length} permissions`);
        console.log(`   Email: ${userData.email}`);
        console.log(`   Password: ${userData.password}`);
        console.log("   ---");
        
      } catch (error) {
        console.error(`❌ Failed to create user ${userData.name}:`, error);
        if (error.code === 'auth/email-already-in-use') {
          console.log(`   ⚠️ User ${userData.email} already exists, skipping...`);
        }
      }
    }
    
    console.log("🎉 Successfully added all users!");
    console.log("📊 Users added by role:");
    console.log("   🌱 Coastal Communities: 2 users");
    console.log("   🌿 NGO Coordinators: 2 users");
    console.log("   🌳 Forestry Officers: 2 users");
    console.log("   🔬 Research Scientists: 2 users");
    console.log("   👑 Admin Users: 2 users");
    console.log("");
    console.log("🔐 All users have password: 123456");
    console.log("📧 Update the email addresses in the script to match your actual users");
    
  } catch (error) {
    console.error("❌ Error adding users:", error);
  }
}

// Run the function
addAllUsers();
