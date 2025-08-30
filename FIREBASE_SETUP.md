# Firebase Setup Guide for Mangrove Watch App

This guide will help you set up Firebase for authentication and database functionality in your Mangrove Watch app.

## Prerequisites

- A Google account
- Node.js and npm installed
- Expo CLI installed

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter a project name (e.g., "mangrove-watch")
4. Choose whether to enable Google Analytics (optional)
5. Click "Create project"

## Step 2: Enable Authentication

1. In your Firebase project, go to "Authentication" in the left sidebar
2. Click "Get started"
3. Go to the "Sign-in method" tab
4. Enable "Email/Password" authentication:
   - Click on "Email/Password"
   - Toggle "Enable"
   - Click "Save"

## Step 3: Create Firestore Database

1. In your Firebase project, go to "Firestore Database" in the left sidebar
2. Click "Create database"
3. Choose "Start in test mode" (for development)
4. Select a location closest to your users
5. Click "Done"

## Step 4: Set Up Firestore Security Rules

1. In Firestore Database, go to the "Rules" tab
2. Replace the default rules with the following:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read and write their own profile
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Users can read all user profiles (for leaderboard)
    match /users/{userId} {
      allow read: if request.auth != null;
    }
    
    // Users can create incident reports
    match /incidents/{incidentId} {
      allow create: if request.auth != null;
      allow read: if request.auth != null;
      allow update: if request.auth != null && 
        request.auth.uid == resource.data.userId;
    }
  }
}
```

3. Click "Publish"

## Step 5: Get Firebase Configuration

1. In your Firebase project, click the gear icon (⚙️) next to "Project Overview"
2. Select "Project settings"
3. Scroll down to "Your apps" section
4. Click the web icon (</>)
5. Register your app with a nickname (e.g., "mangrove-watch-web")
6. Copy the configuration object

## Step 6: Update Firebase Config

1. Open `config/firebase.ts` in your project
2. Replace the placeholder values with your actual Firebase configuration:

```typescript
const firebaseConfig = {
  apiKey: "your-actual-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-actual-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "your-actual-sender-id",
  appId: "your-actual-app-id"
};
```

## Step 7: Install Dependencies

Make sure you have the required Firebase packages:

```bash
npm install firebase
```

## Step 8: Test the Setup

1. Start your Expo development server:
   ```bash
   npm start
   ```

2. Try to create a new account or sign in
3. Check the Firebase Console to see if users are being created
4. Try submitting an incident report
5. Check if data appears in Firestore

## Firebase Console Features

### Authentication
- View all registered users
- Monitor sign-in attempts
- Manage user accounts

### Firestore Database
- View collections: `users`, `incidents`
- Monitor real-time data
- Export data for analysis

### Analytics (Optional)
- Track user engagement
- Monitor app performance
- Understand user behavior

## Security Considerations

### Development Mode
- Firestore starts in test mode
- Anyone can read/write to your database
- Only use for development and testing

### Production Mode
- Update Firestore rules to restrict access
- Implement proper user authentication
- Add data validation

## Troubleshooting

### Common Issues

1. **Authentication Errors**
   - Check if Email/Password auth is enabled
   - Verify Firebase config is correct
   - Check console for error messages

2. **Database Permission Errors**
   - Verify Firestore rules are published
   - Check if user is authenticated
   - Ensure proper data structure

3. **Network Errors**
   - Check internet connection
   - Verify Firebase project location
   - Check if app is blocked by firewall

### Debug Mode

Enable debug logging by adding this to your Firebase config:

```typescript
if (__DEV__) {
  console.log('Firebase config:', firebaseConfig);
}
```

## Next Steps

1. **Firebase Storage**: Add image upload functionality
2. **Push Notifications**: Implement real-time alerts
3. **Analytics**: Track user engagement and app performance
4. **Backup**: Set up automated data backups
5. **Monitoring**: Set up error tracking and performance monitoring

## Support

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase Console](https://console.firebase.google.com/)
- [Firebase Community](https://firebase.google.com/community)

## Security Best Practices

1. **Never expose API keys in client-side code** (use environment variables)
2. **Implement proper user authentication**
3. **Validate all data before storing**
4. **Use Firestore security rules**
5. **Regularly review and update security settings**
6. **Monitor authentication attempts**
7. **Implement rate limiting for API calls**

## Environment Variables (Recommended)

Create a `.env` file in your project root:

```env
FIREBASE_API_KEY=your-api-key
FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_STORAGE_BUCKET=your-project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your-sender-id
FIREBASE_APP_ID=your-app-id
```

Then update your Firebase config to use these environment variables.

---

**Note**: This setup guide is for development purposes. For production deployment, ensure you follow Firebase security best practices and implement proper error handling and validation. 