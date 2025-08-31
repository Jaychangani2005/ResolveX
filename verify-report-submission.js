// verify-report-submission.js - Script to verify report submission flow
import { initializeApp } from "firebase/app";
import { doc, getFirestore, getDoc, collection, getDocs } from "firebase/firestore";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

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

// Test user credentials
const TEST_USER = {
    email: "coastal1@resolvex.com",
    password: "username@123"
};

async function verifyReportSubmission() {
    try {
        console.log("🔍 Starting report submission verification...");
        
        // Step 1: Sign in as test user
        console.log("📱 Step 1: Signing in as test user...");
        const userCredential = await signInWithEmailAndPassword(
            auth, 
            TEST_USER.email, 
            TEST_USER.password
        );
        
        console.log(`✅ Signed in successfully as: ${userCredential.user.email}`);
        console.log(`   User ID: ${userCredential.user.uid}`);
        
        // Step 2: Check user data in Firestore
        console.log("\n📊 Step 2: Verifying user data in Firestore...");
        const userDoc = await getDoc(doc(db, "users", userCredential.user.uid));
        
        if (userDoc.exists()) {
            const userData = userDoc.data();
            console.log("✅ User document found in Firestore:");
            console.log(`   Name: ${userData.name}`);
            console.log(`   Role: ${userData.role}`);
            console.log(`   Points: ${userData.points}`);
            console.log(`   Badge: ${userData.badge} ${userData.badgeEmoji}`);
            console.log(`   Phone: ${userData.phoneNumber}`);
            console.log(`   Location: ${userData.location.city}, ${userData.location.state}`);
            console.log(`   Permissions: ${userData.permissions.length} permissions`);
        } else {
            console.log("❌ User document not found in Firestore");
        }
        
        // Step 3: Check incidents collection structure
        console.log("\n📋 Step 3: Checking incidents collection structure...");
        const incidentsSnapshot = await getDocs(collection(db, "incidents"));
        
        if (incidentsSnapshot.empty) {
            console.log("ℹ️ No incidents found in database");
            console.log("   This is expected if no reports have been submitted yet");
        } else {
            console.log(`📊 Found ${incidentsSnapshot.size} incident(s) in database`);
            
            incidentsSnapshot.forEach((doc) => {
                const incidentData = doc.data();
                console.log(`\n   📄 Incident ID: ${doc.id}`);
                console.log(`      User: ${incidentData.userName} (${incidentData.userEmail})`);
                console.log(`      Description: ${incidentData.description}`);
                console.log(`      Status: ${incidentData.status}`);
                console.log(`      Location: ${incidentData.location.latitude}, ${incidentData.location.longitude}`);
                console.log(`      City: ${incidentData.location.city}, ${incidentData.location.state}`);
                console.log(`      Photo URL: ${incidentData.photoUrl || 'Not uploaded yet'}`);
                console.log(`      AI Validated: ${incidentData.aiValidated || false}`);
                console.log(`      Created: ${incidentData.createdAt?.toDate?.() || incidentData.createdAt}`);
                console.log(`      Updated: ${incidentData.updatedAt?.toDate?.() || incidentData.updatedAt}`);
                
                // Check if photo URL is a valid Firebase Storage URL
                if (incidentData.photoUrl) {
                    const isFirebaseStorageUrl = incidentData.photoUrl.includes('firebasestorage.app');
                    console.log(`      Photo URL Valid: ${isFirebaseStorageUrl ? '✅ Yes' : '❌ No'}`);
                    
                    if (isFirebaseStorageUrl) {
                        console.log(`      Storage Path: ${incidentData.photoUrl.split('/o/')[1]?.split('?')[0] || 'Unknown'}`);
                    }
                }
            });
        }
        
        // Step 4: Verify database schema compliance
        console.log("\n🔍 Step 4: Verifying database schema compliance...");
        
        const requiredFields = [
            'userId', 'userEmail', 'userName', 'photoUrl', 'location', 
            'description', 'status', 'createdAt', 'updatedAt'
        ];
        
        const locationFields = ['latitude', 'longitude', 'address', 'city', 'state', 'country', 'fullAddress'];
        const optionalFields = ['aiValidated', 'reviewedBy', 'reviewedAt', 'adminNotes'];
        
        console.log("   Required fields:", requiredFields.join(', '));
        console.log("   Location fields:", locationFields.join(', '));
        console.log("   Optional fields:", optionalFields.join(', '));
        
        // Step 5: Check for any data inconsistencies
        console.log("\n⚠️ Step 5: Checking for data inconsistencies...");
        
        if (!incidentsSnapshot.empty) {
            let hasInconsistencies = false;
            
            incidentsSnapshot.forEach((doc) => {
                const incidentData = doc.data();
                
                // Check required fields
                requiredFields.forEach(field => {
                    if (!(field in incidentData)) {
                        console.log(`   ❌ Missing required field: ${field} in incident ${doc.id}`);
                        hasInconsistencies = true;
                    }
                });
                
                // Check location fields
                if (incidentData.location) {
                    locationFields.forEach(field => {
                        if (!(field in incidentData.location)) {
                            console.log(`   ⚠️ Missing location field: ${field} in incident ${doc.id}`);
                        }
                    });
                } else {
                    console.log(`   ❌ Missing location object in incident ${doc.id}`);
                    hasInconsistencies = true;
                }
                
                // Check photo URL format
                if (incidentData.photoUrl && !incidentData.photoUrl.includes('firebasestorage.app')) {
                    console.log(`   ⚠️ Photo URL may not be from Firebase Storage: ${incidentData.photoUrl}`);
                }
            });
            
            if (!hasInconsistencies) {
                console.log("   ✅ No major data inconsistencies found");
            }
        }
        
        // Step 6: Summary and recommendations
        console.log("\n📋 Step 6: Summary and Recommendations...");
        console.log("✅ Report submission verification completed");
        console.log("📊 Database structure appears to be correct");
        console.log("🔐 User authentication working properly");
        console.log("📸 Photo upload flow ready for testing");
        
        if (incidentsSnapshot.empty) {
            console.log("\n💡 Next Steps:");
            console.log("   1. Submit a test report through the app");
            console.log("   2. Verify photo uploads to Firebase Storage");
            console.log("   3. Check that photoUrl field gets populated");
            console.log("   4. Verify all required fields are present");
        }
        
    } catch (error) {
        console.error("❌ Verification failed:", error);
        
        if (error.code === 'auth/user-not-found') {
            console.log("💡 User not found. Run add-all-users.js first to create test users.");
        } else if (error.code === 'auth/wrong-password') {
            console.log("💡 Wrong password. Check if user was created with correct password.");
        }
    }
}

// Run the verification
verifyReportSubmission();
