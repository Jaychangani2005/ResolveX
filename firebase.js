// Firebase Configuration for Mangrove Watch App
// This file contains all Firebase services and configuration

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, doc, addDoc, updateDoc, deleteDoc, getDoc, query } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
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
let auth;
try {
  auth = getAuth(app);
  console.log('✅ Firebase Auth initialized successfully');
} catch (error) {
  console.error('❌ Firebase Auth initialization failed:', error);
  throw error;
}

const db = getFirestore(app);
const storage = getStorage(app);

// Initialize Analytics (only in web environment)
let analytics = null;
if (typeof window !== 'undefined') {
  try {
    analytics = getAnalytics(app);
  } catch (error) {
    console.log('Analytics not available:', error.message);
  }
}

// Export all Firebase services
export { auth, db, storage, analytics };
export default app;

// Firebase service functions for common operations
export const firebaseService = {
  // Authentication helpers
  auth: {
    signIn: (email, password) => auth.signInWithEmailAndPassword(email, password),
    signUp: (email, password) => auth.createUserWithEmailAndPassword(email, password),
    signOut: () => auth.signOut(),
    getCurrentUser: () => auth.currentUser,
    onAuthStateChanged: (callback) => auth.onAuthStateChanged(callback)
  },
  
  // Firestore helpers (using v9 syntax)
  firestore: {
    collection: (collectionName) => collection(db, collectionName),
    doc: (collectionName, docId) => doc(db, collectionName, docId),
    add: (collectionName, data) => addDoc(collection(db, collectionName), data),
    update: (collectionName, docId, data) => updateDoc(doc(db, collectionName, docId), data),
    delete: (collectionName, docId) => deleteDoc(doc(db, collectionName, docId)),
    get: (collectionName, docId) => getDoc(doc(db, collectionName, docId)),
    query: (collectionName, ...queryConstraints) => query(collection(db, collectionName), ...queryConstraints)
  },
  
  // Storage helpers
  storage: {
    ref: (path) => ref(storage, path),
    upload: (path, file) => uploadBytes(ref(storage, path), file),
    download: (path) => getDownloadURL(ref(storage, path)),
    delete: (path) => deleteObject(ref(storage, path))
  }
};

// Configuration validation function
export const validateFirebaseConfig = () => {
  const requiredFields = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'];
  const missingFields = requiredFields.filter(field => !firebaseConfig[field] || firebaseConfig[field].includes('your-'));
  
  if (missingFields.length > 0) {
    console.error('❌ Firebase configuration incomplete. Missing or invalid fields:', missingFields);
    return false;
  }
  
  console.log('✅ Firebase configuration validated successfully');
  return true;
};

// Initialize and validate on import
validateFirebaseConfig(); 