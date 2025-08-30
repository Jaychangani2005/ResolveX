import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Your Firebase configuration
// Replace these values with your actual Firebase project configuration
// Get these values from Firebase Console > Project Settings > Your Apps
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};

// Validate configuration
if (firebaseConfig.apiKey === "your-api-key") {
  throw new Error(`
    Firebase configuration not set up!
    
    Please:
    1. Follow the Firebase Setup Guide in FIREBASE_SETUP.md
    2. Copy config/firebase.example.ts to config/firebase.ts
    3. Replace the placeholder values with your actual Firebase configuration
    
    Get your config from: https://console.firebase.google.com/
  `);
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);

export { db };
export default app; 