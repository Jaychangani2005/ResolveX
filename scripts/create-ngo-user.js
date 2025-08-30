// create-ngo-user.js
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import crypto from 'crypto';

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

// Hash password function
function hashPassword(password) {
    return crypto.createHash('sha256').update(password).digest('hex');
}

async function createNGOUser() {
    try {
        console.log('🌿 Creating NGO user...');
        
        const email = 'ngo@example.com';
        const password = 'ngo123456';
        const name = 'NGO Partner';
        
        // Create user document ID
        const userId = btoa(email).replace(/[^a-zA-Z0-9]/g, '');
        
        // Create NGO profile
        const ngoProfile = {
            id: userId,
            email: email.trim(),
            password: hashPassword(password),
            name: name.trim(),
            role: 'ngo',
            points: 0,
            badge: 'NGO Partner',
            badgeEmoji: '🌿',
            createdAt: new Date(),
            lastActive: new Date(),
            isActive: true,
            permissions: [
                'view_incident_pictures',
                'view_incident_descriptions',
                'view_user_names',
                'view_ai_validation_status',
                'view_incident_reports'
            ],
            profileImage: '',
            phoneNumber: '',
            location: {
                city: '',
                state: '',
                country: ''
            },
            preferences: {
                notifications: true,
                emailUpdates: true,
                language: 'en'
            }
        };
        
        await setDoc(doc(db, 'users', userId), ngoProfile);
        
        console.log('✅ NGO user created successfully!');
        console.log('📧 Email:', email);
        console.log('🔑 Password:', password);
        console.log('🆔 User ID:', userId);
        console.log('🌿 Role: NGO Partner');
        console.log('📋 Permissions:', ngoProfile.permissions.join(', '));
        
    } catch (error) {
        console.error('❌ Error creating NGO user:', error);
    }
}

// Run the function
createNGOUser();
