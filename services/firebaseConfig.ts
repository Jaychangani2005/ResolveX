import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// 🔥 IMPORTANT: Replace these placeholder values with your actual Firebase configuration
// You can find these values in your Firebase Console:
// 1. Go to https://console.firebase.google.com/
// 2. Select your project
// 3. Click on the gear icon (⚙️) next to "Project Overview"
// 4. Select "Project settings"
// 5. Scroll down to "Your apps" section
// 6. Copy the config values

const firebaseConfig = {
  apiKey: "AIzaSyB17SgQcBAJr1ZdNxHlyyWVu-2KO54xRCU",
  authDomain: "resolvex-cb01e.firebaseapp.com",
  databaseURL: "https://resolvex-cb01e-default-rtdb.firebaseio.com",
  projectId: "resolvex-cb01e",
  storageBucket: "resolvex-cb01e.firebasestorage.app",
  messagingSenderId: "83940149141",
  appId: "1:83940149141:web:604675dcea46450925589c",
  measurementId: "G-RE3EZ6F13Q"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Export the app instance
export default app;

// 📝 SETUP INSTRUCTIONS:
// 
// 1. Create a Firebase project at https://console.firebase.google.com/
// 2. Enable Authentication (Email/Password)
// 3. Enable Firestore Database
// 4. Enable Storage (if you plan to upload photos)
// 5. Copy your config values from Project Settings
// 6. Replace the placeholder values above
// 7. Make sure your Firebase project has the correct security rules
//
// 🔒 SECURITY RULES EXAMPLE:
// Firestore rules should allow authenticated users to read/write their own data
// Storage rules should allow authenticated users to upload photos
//
// Example Firestore rules:
// rules_version = '2';
// service cloud.firestore {
//   match /databases/{database}/documents {
//     match /users/{userId} {
//       allow read, write: if request.auth != null && request.auth.uid == userId;
//     }
//     match /incidents/{incidentId} {
//       allow read, write: if request.auth != null;
//     }
//   }
// } 