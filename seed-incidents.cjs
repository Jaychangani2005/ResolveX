// seed-incidents.cjs - Seed file for adding incident reports (CommonJS version)
const { initializeApp } = require("firebase/app");
const { doc, getFirestore, serverTimestamp, setDoc, collection, addDoc } = require("firebase/firestore");

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

// Sample user data for the reports
const sampleUsers = [
  { id: "user001", name: "Priya Sharma", email: "priya.sharma@email.com" },
  { id: "user002", name: "Rajesh Kumar", email: "rajesh.kumar@email.com" },
  { id: "user003", name: "Anita Patel", email: "anita.patel@email.com" },
  { id: "user004", name: "Suresh Verma", email: "suresh.verma@email.com" },
  { id: "user005", name: "Meera Singh", email: "meera.singh@email.com" },
  { id: "user006", name: "Vikram Malhotra", email: "vikram.malhotra@email.com" },
  { id: "user007", name: "Kavita Reddy", email: "kavita.reddy@email.com" },
  { id: "user008", name: "Arun Joshi", email: "arun.joshi@email.com" },
  { id: "user009", name: "Sunita Iyer", email: "sunita.iyer@email.com" },
  { id: "user010", name: "Mohan Gupta", email: "mohan.gupta@email.com" }
];

// Sample incident reports data
const incidentReports = [
  {
    description: "Illegal mangrove cutting observed near the creek bank. Multiple trees have been felled for construction purposes. This area is critical for coastal protection.",
    latitude: 22.5726,
    longitude: 88.3639,
    location: {
      address: "Near Diamond Harbour Road",
      city: "Kolkata",
      state: "West Bengal",
      country: "India",
      fullAddress: "Near Diamond Harbour Road, Kolkata, West Bengal, India"
    },
    status: "pending",
    aiValidated: true,
    user: "user001",
    userEmail: "priya.sharma@email.com",
    userName: "Priya Sharma"
  },
  {
    description: "Plastic waste dumping in mangrove area. Large amounts of single-use plastics and packaging materials found scattered throughout the mangrove forest.",
    latitude: 19.0760,
    longitude: 72.8777,
    location: {
      address: "Mangrove Forest Reserve",
      city: "Mumbai",
      state: "Maharashtra",
      country: "India",
      fullAddress: "Mangrove Forest Reserve, Mumbai, Maharashtra, India"
    },
    status: "pending",
    aiValidated: false,
    user: "user002",
    userEmail: "rajesh.kumar@email.com",
    userName: "Rajesh Kumar"
  },
  {
    description: "Oil spill detected in mangrove creek. Dark patches of oil visible on water surface, affecting mangrove roots and marine life. Immediate action required.",
    latitude: 12.9716,
    longitude: 77.5946,
    location: {
      address: "Mangrove Creek Area",
      city: "Bangalore",
      state: "Karnataka",
      country: "India",
      fullAddress: "Mangrove Creek Area, Bangalore, Karnataka, India"
    },
    status: "pending",
    aiValidated: true,
    user: "user003",
    userEmail: "anita.patel@email.com",
    userName: "Anita Patel"
  },
  {
    description: "Construction debris found in mangrove area. Concrete blocks, steel rods, and construction waste dumped illegally, blocking natural water flow.",
    latitude: 17.3850,
    longitude: 78.4867,
    location: {
      address: "Coastal Mangrove Zone",
      city: "Hyderabad",
      state: "Telangana",
      country: "India",
      fullAddress: "Coastal Mangrove Zone, Hyderabad, Telangana, India"
    },
    status: "pending",
    aiValidated: true,
    user: "user004",
    userEmail: "suresh.verma@email.com",
    userName: "Suresh Verma"
  },
  {
    description: "Mangrove saplings damaged by grazing animals. Fencing broken, allowing cattle to enter and destroy newly planted mangrove saplings.",
    latitude: 23.0225,
    longitude: 72.5714,
    location: {
      address: "Mangrove Restoration Site",
      city: "Ahmedabad",
      state: "Gujarat",
      country: "India",
      fullAddress: "Mangrove Restoration Site, Ahmedabad, Gujarat, India"
    },
    status: "pending",
    aiValidated: false,
    user: "user005",
    userEmail: "meera.singh@email.com",
    userName: "Meera Singh"
  },
  {
    description: "Industrial effluent discharge into mangrove waters. Chemical-laden water flowing into mangrove area, causing water discoloration and fish kills.",
    latitude: 13.0827,
    longitude: 80.2707,
    location: {
      address: "Industrial Zone Mangrove",
      city: "Chennai",
      state: "Tamil Nadu",
      country: "India",
      fullAddress: "Industrial Zone Mangrove, Chennai, Tamil Nadu, India"
    },
    status: "pending",
    aiValidated: true,
    user: "user006",
    userEmail: "vikram.malhotra@email.com",
    userName: "Vikram Malhotra"
  },
  {
    description: "Mangrove area being converted to aquaculture ponds. Large-scale excavation and pond construction destroying natural mangrove habitat.",
    latitude: 20.5937,
    longitude: 78.9629,
    location: {
      address: "Coastal Aquaculture Zone",
      city: "Nagpur",
      state: "Maharashtra",
      country: "India",
      fullAddress: "Coastal Aquaculture Zone, Nagpur, Maharashtra, India"
    },
    status: "pending",
    aiValidated: true,
    user: "user007",
    userEmail: "kavita.reddy@email.com",
    userName: "Kavita Reddy"
  },
  {
    description: "Mangrove forest fire outbreak. Smoke visible from distance, multiple trees affected. Fire appears to be spreading rapidly due to dry conditions.",
    latitude: 26.8467,
    longitude: 80.9462,
    location: {
      address: "Mangrove Forest Reserve",
      city: "Lucknow",
      state: "Uttar Pradesh",
      country: "India",
      fullAddress: "Mangrove Forest Reserve, Lucknow, Uttar Pradesh, India"
    },
    status: "pending",
    aiValidated: false,
    user: "user008",
    userEmail: "arun.joshi@email.com",
    userName: "Arun Joshi"
  },
  {
    description: "Mangrove area being used as illegal waste disposal site. Household waste, medical waste, and electronic waste dumped in large quantities.",
    latitude: 25.2048,
    longitude: 55.2708,
    location: {
      address: "Coastal Waste Dump",
      city: "Dubai",
      state: "Dubai",
      country: "UAE",
      fullAddress: "Coastal Waste Dump, Dubai, UAE"
    },
    status: "pending",
    aiValidated: true,
    user: "user009",
    userEmail: "sunita.iyer@email.com",
    userName: "Sunita Iyer"
  },
  {
    description: "Mangrove area affected by invasive species. Non-native plants spreading rapidly, outcompeting native mangrove species and reducing biodiversity.",
    latitude: 28.6139,
    longitude: 77.2090,
    location: {
      address: "Mangrove Biodiversity Zone",
      city: "New Delhi",
      state: "Delhi",
      country: "India",
      fullAddress: "Mangrove Biodiversity Zone, New Delhi, Delhi, India"
    },
    status: "pending",
    aiValidated: true,
    user: "user010",
    userEmail: "mohan.gupta@email.com",
    userName: "Mohan Gupta"
  }
];

async function seedIncidents() {
  try {
    console.log("🌱 Starting to seed incident reports...");
    
    // Add each incident report to the incidents collection
    for (let i = 0; i < incidentReports.length; i++) {
      const incident = incidentReports[i];
      
      // Create the incident document with auto-generated ID
      const docRef = await addDoc(collection(db, "incidents"), {
        ...incident,
        photoUrl: `https://dummy.com/mangrove-incident-${i + 1}.jpg`,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        reviewedBy: null,
        reviewedAt: null,
        adminNotes: null
      });
      
      console.log(`✅ Incident ${i + 1} added with ID: ${docRef.id}`);
      console.log(`   Description: ${incident.description.substring(0, 50)}...`);
      console.log(`   Location: ${incident.location.city}, ${incident.location.state}`);
      console.log(`   Status: ${incident.status}`);
      console.log(`   AI Validated: ${incident.aiValidated}`);
      console.log("   ---");
    }
    
    console.log(`\n🎉 Successfully seeded ${incidentReports.length} incident reports!`);
    console.log("📊 Reports added to 'incidents' collection");
    console.log("🔍 You can now view these reports in your NGO dashboard");
    
  } catch (error) {
    console.error("❌ Error seeding incidents:", error);
  }
}

// Also create a function to seed sample users if needed
async function seedUsers() {
  try {
    console.log("👥 Starting to seed sample users...");
    
    for (const user of sampleUsers) {
      await setDoc(doc(db, "users", user.id), {
        id: user.id,
        email: user.email,
        name: user.name,
        role: "user",
        points: Math.floor(Math.random() * 50) + 10,
        badge: "Mangrove Guardian",
        badgeEmoji: "🌿",
        createdAt: new Date(),
        lastActive: new Date(),
        isActive: true,
        permissions: ["submit_reports", "view_own_reports", "view_leaderboard"],
        location: {
          city: "",
          state: "",
          country: ""
        },
        preferences: {
          notifications: true,
          emailUpdates: true,
          language: "en"
        }
      });
      
      console.log(`✅ User added: ${user.name} (${user.email})`);
    }
    
    console.log("🎉 Sample users seeded successfully!");
    
  } catch (error) {
    console.error("❌ Error seeding users:", error);
  }
}

// Main seeding function
async function main() {
  console.log("🚀 Starting comprehensive seeding process...\n");
  
  // Seed users first
  await seedUsers();
  console.log("\n" + "=".repeat(50) + "\n");
  
  // Then seed incidents
  await seedIncidents();
  
  console.log("\n" + "=".repeat(50));
  console.log("🎯 Seeding process completed!");
  console.log("📱 You can now test your app with sample data");
}

// Run the seeding
main().catch(console.error);
