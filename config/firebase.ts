import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration
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

// Initialize Firestore
const db = getFirestore(app);

export { db };
export default app; 