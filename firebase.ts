// Firebase Configuration for Mangrove Watch App
// This file contains all Firebase services and configuration

import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

// Firebase configuration object
// Your actual Firebase project configuration
const firebaseConfig = {
  apiKey: "AIzaSyB17SgQcBAJr1ZdNxHlyyWVu-2KO54xRCU",
  authDomain: "resolvex-cb01e.firebaseapp.com",
  projectId: "resolvex-cb01e",
  storageBucket: "resolvex-cb01e.firebasestorage.app",
  messagingSenderId: "83940149141",
  appId: "1:83940149141:web:604675dcea46450925589c",
  measurementId: "G-RE3EZ6F13Q"
};

// Validate configuration
if (firebaseConfig.apiKey && firebaseConfig.apiKey !== "your-api-key-here") {
  console.log('✅ Firebase configuration loaded successfully');
  console.log(`📱 Project: ${firebaseConfig.projectId}`);
  console.log(`🔑 Auth Domain: ${firebaseConfig.authDomain}`);
} else {
  console.error('❌ Firebase configuration is missing or invalid');
}

// Initialize Firebase app
const app = initializeApp(firebaseConfig);

// Initialize Firebase services with error handling
const db = getFirestore(app);
const storage = getStorage(app);

// Initialize Analytics (only in web environment)
let analytics = null;
if (typeof window !== 'undefined') {
  try {
    analytics = getAnalytics(app);
  } catch (error: any) {
    console.log('Analytics not available:', error.message);
  }
}

// Export all Firebase services
export { db, storage, analytics };
export default app;

// Configuration validation function
export const validateFirebaseConfig = () => {
  const requiredFields = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'];
  const missingFields = requiredFields.filter(field => !firebaseConfig[field as keyof typeof firebaseConfig] || firebaseConfig[field as keyof typeof firebaseConfig].includes('your-'));
  
  if (missingFields.length > 0) {
    console.error('❌ Firebase configuration incomplete. Missing or invalid fields:', missingFields);
    return false;
  }
  
  console.log('✅ Firebase configuration validated successfully');
  return true;
};

// Initialize and validate on import
validateFirebaseConfig(); 