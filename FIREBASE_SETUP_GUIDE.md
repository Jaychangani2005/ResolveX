# 🔥 Firebase Setup Guide

## 🚨 **Current Issue**
Your app is showing this error:
```
ERROR ❌ Firebase sign in failed: [FirebaseError: Firebase: Error (auth/api-key-not-valid.-please-pass-a-valid-api-key.).]
```

This means the Firebase configuration is not set up properly.

## 📋 **Step-by-Step Setup**

### **Step 1: Create Firebase Project**
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter project name: `mangrove-watch` (or your preferred name)
4. Choose whether to enable Google Analytics (optional)
5. Click "Create project"

### **Step 2: Enable Authentication**
1. In your Firebase project, click "Authentication" in the left sidebar
2. Click "Get started"
3. Click "Sign-in method" tab
4. Click "Email/Password"
5. Enable it and click "Save"

### **Step 3: Enable Firestore Database**
1. Click "Firestore Database" in the left sidebar
2. Click "Create database"
3. Choose "Start in test mode" (we'll update security rules later)
4. Choose a location close to your users
5. Click "Done"

### **Step 4: Enable Storage (Optional - for photo uploads)**
1. Click "Storage" in the left sidebar
2. Click "Get started"
3. Choose "Start in test mode"
4. Choose a location close to your users
5. Click "Done"

### **Step 5: Get Your Configuration**
1. Click the gear icon (⚙️) next to "Project Overview"
2. Select "Project settings"
3. Scroll down to "Your apps" section
4. Click the web icon (</>)
5. Register app with nickname: `mangrove-watch-web`
6. Copy the configuration object

### **Step 6: Update Your App Configuration**
Replace the placeholder values in `services/firebaseConfig.ts`:

```typescript
const firebaseConfig = {
  apiKey: "AIzaSyC...", // Your actual API key
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456789"
};
```

### **Step 7: Update Security Rules**

#### **Firestore Rules** (`firestore.rules`):
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Authenticated users can read/write incidents
    match /incidents/{incidentId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

#### **Storage Rules** (`storage.rules`):
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Authenticated users can upload photos
    match /photos/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## 🔧 **Alternative: Use Environment Variables**

Create a `.env` file in your project root:

```bash
# .env
FIREBASE_API_KEY=your_api_key_here
FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id
```

Then update `firebaseConfig.ts`:

```typescript
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
};
```

## 🧪 **Test Your Setup**

1. **Update the configuration** with your real Firebase values
2. **Restart your app** completely
3. **Try to sign up** with a new account
4. **Check the console** for any errors

## 📱 **Expected Behavior After Setup**

- ✅ No more "API key not valid" errors
- ✅ Users can sign up and sign in
- ✅ Data is stored in Firestore
- ✅ Photos can be uploaded (if Storage is enabled)
- ✅ Real-time updates work

## 🚨 **Common Issues & Solutions**

### **Issue: "API key not valid"**
- **Solution**: Make sure you copied the entire API key from Firebase Console

### **Issue: "Permission denied"**
- **Solution**: Update your Firestore security rules to allow authenticated users

### **Issue: "Project not found"**
- **Solution**: Check your `projectId` matches exactly what's in Firebase Console

### **Issue: "Authentication not enabled"**
- **Solution**: Enable Email/Password authentication in Firebase Console

## 🔒 **Security Best Practices**

1. **Never commit API keys** to public repositories
2. **Use environment variables** for sensitive data
3. **Set up proper security rules** before going to production
4. **Enable App Check** for additional security
5. **Monitor usage** in Firebase Console

## 📞 **Need Help?**

- **Firebase Documentation**: [https://firebase.google.com/docs](https://firebase.google.com/docs)
- **Firebase Support**: [https://firebase.google.com/support](https://firebase.google.com/support)
- **Stack Overflow**: Tag questions with `firebase` and `react-native`

---

## 🎯 **Quick Checklist**

- [ ] Created Firebase project
- [ ] Enabled Authentication (Email/Password)
- [ ] Enabled Firestore Database
- [ ] Enabled Storage (optional)
- [ ] Copied configuration values
- [ ] Updated `firebaseConfig.ts`
- [ ] Set up security rules
- [ ] Tested signup/login
- [ ] Verified data storage

Once you complete these steps, your app should work properly! 🚀 