import { initializeApp } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/db';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Example Firebase configuration
// Replace these values with your actual Firebase project configuration
const firebaseConfig = {
  apiKey: "your-api-key-here",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "your-sender-id-here",
  appId: "your-app-id-here"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth with AsyncStorage persistence
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

// Initialize Firestore
const db = getFirestore(app);

export { auth, db };
export default app;

// Instructions:
// 1. Copy this file to firebase.ts
// 2. Replace the placeholder values with your actual Firebase configuration
// 3. Get your config from Firebase Console > Project Settings > Your Apps
// 4. Make sure to enable Email/Password authentication in Firebase Console
// 5. Set up Firestore database with proper security rules 