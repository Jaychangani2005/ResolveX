# Firestore User Management System

## Overview

The Mangrove Watch app now features an enhanced Firestore-based user management system that provides comprehensive user authentication, profile management, and administrative controls.

## Features

### 🔐 Enhanced Authentication
- **Firebase Auth Integration**: Secure email/password authentication
- **Firestore Profile Storage**: User profiles stored in Firestore `users` collection
- **Role-Based Access Control**: User, Admin, and Super User roles
- **Permission System**: Granular permissions for different user types

### 👤 User Profile Management
- **Comprehensive Profiles**: Extended user data including location, preferences, and contact info
- **Real-time Updates**: Profile changes sync immediately across the app
- **Activity Logging**: Track user actions and login history
- **Badge System**: Gamified progression system with points and achievements

### 🛡️ Admin Controls
- **User Management**: View, search, and manage all users
- **Role Management**: Promote/demote users between roles
- **Account Control**: Activate/deactivate user accounts
- **Permission Management**: Control user access to features

## Database Structure

### Users Collection (`users`)
```typescript
interface User {
  id: string;                    // Firebase Auth UID
  email: string;                 // User's email address
  name: string;                  // Display name
  role: 'user' | 'admin' | 'super_user';
  points: number;                // Gamification points
  badge: string;                 // Current badge name
  badgeEmoji: string;            // Badge emoji
  createdAt: Date;               // Account creation date
  lastActive: Date;              // Last activity timestamp
  isActive: boolean;             // Account status
  permissions: string[];         // User permissions
  profileImage?: string;         // Profile picture URL
  phoneNumber?: string;          // Contact number
  location?: {                   // Location information
    city?: string;
    state?: string;
    country?: string;
  };
  preferences?: {                 // User preferences
    notifications: boolean;
    emailUpdates: boolean;
    language: string;
  };
}
```

### User Activities Collection (`user_activities`)
```typescript
interface UserActivity {
  userId: string;                // User ID
  action: string;                // Action performed
  timestamp: Timestamp;          // When action occurred
  details: {                     // Additional context
    email?: string;
    name?: string;
    loginMethod?: string;
  };
}
```

## API Functions

### Authentication
- `firebaseSignUp(email, password, name)`: Create new user account
- `firebaseSignIn(email, password)`: Authenticate existing user
- `adminSignIn(email, password)`: Admin-specific authentication
- `firebaseSignOut()`: Sign out current user

### User Management
- `getUserProfile(userId)`: Retrieve user profile
- `updateUserProfile(userId, updates)`: Update user information
- `getUsers(limit)`: Get list of users (admin only)
- `searchUsers(searchTerm)`: Search users by name/email
- `updateUserPoints(userId, points)`: Update user points and badges

### Admin Functions
- `createAdminUser(email, password, name, role)`: Create admin accounts
- `getAdminStats()`: Get system statistics
- `getCommunityStats()`: Get community metrics

## Usage Examples

### Creating a New User
```typescript
import { firebaseSignUp } from '@/services/firebaseService';

const newUser = await firebaseSignUp('user@example.com', 'password123', 'John Doe');
console.log('User created:', newUser.id);
```

### Updating User Profile
```typescript
import { useAuth } from '@/contexts/AuthContext';

const { updateProfile } = useAuth();

await updateProfile({
  name: 'New Name',
  phoneNumber: '+1234567890',
  location: {
    city: 'New York',
    state: 'NY',
    country: 'USA'
  }
});
```

### Admin User Management
```typescript
import { getUsers, updateUserProfile } from '@/services/firebaseService';

// Get all users
const users = await getUsers(100);

// Promote user to admin
await updateUserProfile(userId, {
  role: 'admin',
  permissions: ['manage_users', 'view_reports', 'approve_reports']
});
```

## Security Rules

### Firestore Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own profile
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      // Admins can read all users
      allow read: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'super_user'];
      
      // Super users can write to all users
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'super_user';
    }
    
    // User activities - users can read their own, admins can read all
    match /user_activities/{activityId} {
      allow read: if request.auth != null && 
        (resource.data.userId == request.auth.uid || 
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'super_user']);
    }
  }
}
```

## Components

### UserProfileManager
- **Location**: `components/UserProfileManager.tsx`
- **Purpose**: Allows users to edit their profile information
- **Features**: Form-based editing, preference toggles, real-time updates

### AdminUserManager
- **Location**: `components/AdminUserManager.tsx`
- **Purpose**: Admin interface for managing all users
- **Features**: User search, role management, account control

## Integration Points

### AuthContext
The `AuthContext` provides:
- User authentication state
- Profile update functions
- User refresh capabilities
- Role-based navigation

### Profile Page
Enhanced profile page includes:
- User statistics and achievements
- Profile management section
- Incident report history
- Quick actions

### Admin Dashboard
Admin dashboard features:
- System statistics
- User management interface
- Quick administrative actions
- System information

## Best Practices

### Data Consistency
- Use Firestore transactions for critical operations
- Implement retry logic for network failures
- Validate data before writing to Firestore

### Security
- Always verify user permissions before operations
- Use server-side validation for critical changes
- Implement proper error handling and logging

### Performance
- Implement pagination for large user lists
- Use Firestore indexes for complex queries
- Cache frequently accessed user data

## Troubleshooting

### Common Issues

1. **User Profile Not Found**
   - Check if user document exists in Firestore
   - Verify Firebase Auth UID matches Firestore document ID
   - Ensure proper error handling in authentication flow

2. **Permission Denied Errors**
   - Verify Firestore security rules
   - Check user role and permissions
   - Ensure proper authentication state

3. **Data Sync Issues**
   - Verify real-time listeners are properly set up
   - Check for network connectivity issues
   - Implement proper error recovery mechanisms

## Future Enhancements

- **Real-time Notifications**: Push notifications for user activities
- **Advanced Search**: Full-text search with Algolia integration
- **User Analytics**: Detailed user behavior tracking
- **Bulk Operations**: Batch user management operations
- **Audit Logging**: Comprehensive activity tracking
- **API Rate Limiting**: Prevent abuse of user management functions 