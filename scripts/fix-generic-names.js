const { initializeApp } = require('firebase/app');
const { getFirestore, doc, getDoc, updateDoc, collection, getDocs } = require('firebase/firestore');

// Firebase configuration (replace with your actual config)
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
const db = getFirestore(app);

async function fixGenericUserNames() {
  try {
    console.log('🔧 Starting to fix generic user names...');
    
    // Get all users
    const usersSnapshot = await getDocs(collection(db, 'users'));
    let fixedCount = 0;
    let totalUsers = 0;
    
    for (const userDoc of usersSnapshot.docs) {
      totalUsers++;
      const userData = userDoc.data();
      
      // Check if user has a generic name
      if (userData.name === 'User' || userData.name === 'user') {
        console.log(`🔧 Found user with generic name: ${userData.email}`);
        
        try {
          const emailPrefix = userData.email.split('@')[0];
          const newName = emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1);
          
          await updateDoc(doc(db, 'users', userDoc.id), {
            name: newName,
            updatedAt: new Date()
          });
          
          console.log(`✅ Updated user ${userData.email} from "${userData.name}" to "${newName}"`);
          fixedCount++;
        } catch (error) {
          console.error(`❌ Failed to update user ${userData.email}:`, error);
        }
      } else {
        console.log(`ℹ️ User ${userData.email} already has personalized name: "${userData.name}"`);
      }
    }
    
    console.log(`\n🎉 Generic name fix completed!`);
    console.log(`📊 Total users processed: ${totalUsers}`);
    console.log(`🔧 Users fixed: ${fixedCount}`);
    console.log(`✅ Users already personalized: ${totalUsers - fixedCount}`);
    
  } catch (error) {
    console.error('❌ Error fixing generic user names:', error);
  }
}

// Run the script
fixGenericUserNames()
  .then(() => {
    console.log('✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
