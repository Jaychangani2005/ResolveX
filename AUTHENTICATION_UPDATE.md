# Authentication System Update - Users Collection

## Overview
The authentication system has been updated to use a centralized `users` collection in Firestore for all user management, authentication, and authorization. This provides better security, consistency, and scalability.

## What Changed

### 1. Centralized User Management
- **Before**: User data was scattered across multiple collections
- **After**: All user data is now stored in the `users` collection
- **Benefit**: Consistent data structure, easier management, better security

### 2. Enhanced Security Rules
- **Before**: Basic Firestore rules with limited access control
- **After**: Comprehensive role-based access control with proper permissions
- **Benefit**: Users can only access their own data, admins have appropriate access

### 3. Improved User Interface
- **Before**: Basic user profile with limited fields
- **After**: Comprehensive user profile with preferences, location, and activity tracking
- **Benefit**: Better user experience, more customization options

## Key Features

### User Roles
- **Normal User**: Can submit reports, view leaderboard
- **Admin**: Can manage users, approve reports, view analytics
- **Super User**: Full system access, can manage admins

### User Profile Fields
- Basic info: name, email, role
- Points and badges system
- Location preferences
- Notification settings
- Activity tracking

### Security Features
- Role-based access control
- User data isolation
- Admin-only operations
- Activity logging

## Files Updated

### Core Authentication
- `contexts/AuthContext.tsx` - Authentication context
- `services/firebaseService.ts` - Firebase service functions
- `types/user.ts` - User type definitions

### Security
- `firestore.rules` - Firestore security rules
- `firestore.indexes.json` - Database indexes

### Documentation
- `USERS_COLLECTION_SETUP.md` - Detailed setup guide
- `AUTHENTICATION_UPDATE.md` - This file

### Migration
- `scripts/migrate-to-users-collection.js` - Migration script

## How to Use

### 1. User Registration
```typescript
import { firebaseSignUp } from '@/services/firebaseService';

const user = await firebaseSignUp('user@example.com', 'password123', 'John Doe');
```

### 2. User Login
```typescript
import { firebaseSignIn } from '@/services/firebaseService';

const user = await firebaseSignIn('user@example.com', 'password123');
```

### 3. Admin Login
```typescript
import { adminSignIn } from '@/services/firebaseService';

const admin = await adminSignIn('admin@example.com', 'adminpass');
```

### 4. Profile Updates
```typescript
import { updateUserProfile } from '@/services/firebaseService';

await updateUserProfile(userId, { 
  name: 'New Name',
  preferences: { notifications: false }
});
```

## Migration Guide

### Step 1: Update Firestore Rules
Deploy the new security rules to enable the users collection:

```bash
firebase deploy --only firestore:rules
```

### Step 2: Run Migration Script
Use the migration script to move existing user data:

```bash
node scripts/migrate-to-users-collection.js
```

### Step 3: Test Authentication
Verify that login, registration, and admin access work correctly.

### Step 4: Update Existing Code
Ensure all components use the new authentication system.

## Security Considerations

### Data Access
- Users can only access their own profile
- Admins can view all user profiles
- Super users have full access

### Authentication
- Firebase Auth handles user authentication
- Firestore rules enforce data access
- Role-based permissions control operations

### Activity Logging
- All user actions are logged
- Admin operations are tracked
- Audit trail for compliance

## Best Practices

### 1. Always Use Users Collection
- Store all user data in the `users` collection
- Use Firebase Auth UID as document ID
- Maintain data consistency

### 2. Role-Based Access
- Check user roles before operations
- Use permissions array for fine control
- Implement proper authorization

### 3. Error Handling
- Handle authentication errors gracefully
- Provide user-friendly messages
- Log errors for debugging

### 4. Performance
- Use indexes for queries
- Implement pagination
- Cache user profiles when appropriate

## Troubleshooting

### Common Issues

1. **User Profile Not Found**
   - Check if user exists in `users` collection
   - Verify Firebase Auth UID matches
   - Check Firestore security rules

2. **Permission Denied**
   - Verify user role and permissions
   - Check Firestore security rules
   - Ensure user is authenticated

3. **Migration Errors**
   - Run migration script with proper credentials
   - Check for existing data conflicts
   - Verify collection names

### Debug Logging
The system includes comprehensive logging:
- User operations (create, read, update)
- Authentication events
- Error conditions
- Security violations

## Future Enhancements

### Planned Features
- User profile image uploads
- Advanced permission system
- User activity analytics
- Bulk user operations
- User invitation system

### Scalability
- User search with Algolia
- Caching layer
- Data archiving
- Rate limiting

## Support

For issues or questions:
1. Check the documentation files
2. Review error logs
3. Test with sample data
4. Contact development team

## Version History

- **v2.0.0**: Initial users collection implementation
- **v2.1.0**: Enhanced security rules
- **v2.2.0**: Comprehensive user profiles
- **v2.3.0**: Activity logging and analytics

---

**Note**: This update maintains backward compatibility while providing significant improvements in security, performance, and user experience. 