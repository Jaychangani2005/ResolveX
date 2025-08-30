// seed.js
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, serverTimestamp } from "firebase/firestore";

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

async function seed() {
  // Reports
  await setDoc(doc(db, "reports", "report1"), {
    description: "Illegal mangrove cutting near creek",
    latitude: 22.5726,
    longitude: 88.3639,
    imageUrl: "https://dummy.com/cutting1.jpg",
    user: "user123",
    createdAt: serverTimestamp(),
    isValid: true
  });

  await setDoc(doc(db, "reports", "report2"), {
    description: "Plastic dumping in mangrove area",
    latitude: 19.076,
    longitude: 72.8777,
    imageUrl: "https://dummy.com/dumping1.jpg",
    user: "user456",
    createdAt: serverTimestamp(),
    isValid: false
  });

  // Users
  await setDoc(doc(db, "users", "user123"), {
    name: "User123",
    email: "user123@example.com",
    password: "pass123",  // ⚠️ for demo only
    role: "citizen",
    points: 20,
    badges: ["Guardian"],
    reportsCount: 1
  });

  await setDoc(doc(db, "users", "user456"), {
    name: "User456",
    email: "user456@example.com",
    password: "pass456",
    role: "ngo",
    points: 10,
    badges: ["Watcher"],
    reportsCount: 1
  });

  await setDoc(doc(db, "users", "user789"), {
    name: "User789",
    email: "user789@example.com",
    password: "pass789",
    role: "authority",
    points: 0,
    badges: [],
    reportsCount: 0
  });

  console.log("✅ Users and Reports seeded with email, password, and role!");
}

seed();
