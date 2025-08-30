# Users Collection Setup for Mangrove Watch

## Overview
This document describes the updated authentication system that uses a centralized `users` collection in Firestore for all user management, authentication, and authorization.

## Collection Structure

### Users Collection (`users`)
All user data is stored in the `users` collection with the following structure:

```typescript
interface User {
  id: string;                    // Firebase Auth UID
  email: string;                 // User's email address
  name: string;                  // Full name
  role: 'user' | 'admin' | 'super_user' | 'ngo';  // User role
  points: number;                // Points earned
  badge: string;                 // Current badge
  badgeEmoji: string;            // Badge emoji
  createdAt: Date;               // Account creation date
  lastActive: Date;              // Last activity timestamp
  isActive: boolean;             // Account status
  permissions: string[];         // Array of permissions
  profileImage?: string;         // Optional profile image URL
  phoneNumber?: string;          // Optional phone number
  location?: {                   // Optional location data
    city?: string;
    state?: string;
    country?: string;
  };
  preferences?: {                 // Optional user preferences
    notifications: boolean;
    emailUpdates: boolean;
    language: string;
  };
}
```

## User Roles and Permissions

### Normal User (`user`)
- **Permissions**: `['submit_reports', 'view_own_reports', 'view_leaderboard']`
- **Badge**: Guardian 🌱
- **Access**: Basic app features, incident reporting

### Admin User (`admin`)
- **Permissions**: `['manage_users', 'view_reports', 'approve_reports', 'manage_leaderboard', 'view_analytics']`
- **Badge**: Admin 🛡️
- **Access**: User management, report approval, analytics

### Super User (`super_user`)
- **Permissions**: `['manage_users', 'manage_admins', 'view_reports', 'approve_reports', 'reject_reports', 'manage_leaderboard', 'view_analytics', 'system_settings', 'delete_users', 'ban_users']`
- **Badge**: Super Admin 👑
- **Access**: Full system access, admin management

### NGO User (`ngo`)
- **Permissions**: `['view_incident_pictures', 'view_incident_descriptions', 'view_user_names', 'view_ai_validation_status', 'view_incident_reports']`
- **Badge**: NGO Partner 🌿
- **Access**: View all incident reports with user details and AI validation status

## Authentication Flow

### 1. User Registration
```typescript
// Creates Firebase Auth user + Firestore profile in users collection
const user = await firebaseSignUp(email, password, name);
```

### 2. User Login
```typescript
// Authenticates with Firebase Auth + loads profile from users collection
const user = await firebaseSignIn(email, password);
```

### 3. Admin Login
```typescript
// Authenticates with Firebase Auth + verifies admin role from users collection
const admin = await adminSignIn(email, password);
```

### 4. Profile Updates
```typescript
// Updates user profile in users collection
await updateUserProfile(userId, updates);
```

## Security Rules

### Users Collection
- Users can read/write their own profile
- Admins can read all user profiles
- Only super users can delete users

### Incidents Collection
- Users can create and read their own reports
- Admins can read and update all reports
- Only admins can delete reports

### User Activities Collection
- Users can read their own activities
- Admins can read all activities
- All authenticated users can create activities

## Data Consistency

### Transaction Usage
- User creation uses transactions to ensure both profile and activity log are created
- Profile updates are atomic operations

### Error Handling
- Comprehensive error handling for Firebase Auth and Firestore operations
- Retry logic for Firestore reads
- Graceful fallbacks for non-critical operations

## Migration Notes

### From Previous System
- All existing user data should be migrated to the `users` collection
- User IDs should match Firebase Auth UIDs
- Role-based permissions should be properly set

### Data Validation
- All user data is validated before storage
- Required fields are enforced
- Optional fields have sensible defaults

## Usage Examples

### Creating a New User
```typescript
import { firebaseSignUp } from '@/services/firebaseService';

const newUser = await firebaseSignUp('user@example.com', 'password123', 'John Doe');
console.log('User created:', newUser.id);
```

### Admin Authentication
```typescript
import { adminSignIn } from '@/services/firebaseService';

const admin = await adminSignIn('admin@example.com', 'adminpass');
console.log('Admin role:', admin.role);
```

### Profile Management
```typescript
import { updateUserProfile, getUserProfile } from '@/services/firebaseService';

// Update profile
await updateUserProfile(userId, { 
  name: 'New Name',
  preferences: { notifications: false }
});

// Get profile
const profile = await getUserProfile(userId);
```

## Best Practices

### 1. Always Use Users Collection
- Never store user data outside the `users` collection
- Use Firebase Auth UID as the document ID
- Maintain data consistency across collections

### 2. Role-Based Access Control
- Check user roles before allowing operations
- Use permissions array for fine-grained control
- Implement proper authorization checks

### 3. Error Handling
- Handle Firebase Auth errors gracefully
- Provide user-friendly error messages
- Log errors for debugging

### 4. Performance
- Use indexes for frequently queried fields
- Implement pagination for large datasets
- Cache user profiles when appropriate

## Troubleshooting

### Common Issues

1. **User Profile Not Found**
   - Check if user document exists in `users` collection
   - Verify Firebase Auth UID matches document ID
   - Ensure Firestore rules allow access

2. **Permission Denied**
   - Verify user role and permissions
   - Check Firestore security rules
   - Ensure user is authenticated

3. **Data Inconsistency**
   - Use transactions for critical operations
   - Implement proper error handling
   - Validate data before storage

### Debug Logging
The system includes comprehensive logging for all operations:
- User creation, authentication, and updates
- Role verification and permission checks
- Error conditions and fallbacks

## Future Enhancements

### Planned Features
- User profile image uploads
- Advanced permission system
- User activity analytics
- Bulk user operations for admins
- User invitation system

### Scalability Considerations
- Implement user search with Algolia
- Add caching layer for frequently accessed data
- Consider user data archiving for inactive accounts
- Implement rate limiting for API calls 