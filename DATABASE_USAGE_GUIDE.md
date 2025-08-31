# Database Usage Guide - Mangrove Watch

## Overview
This guide explains how to use the database structure and sample operations for the Mangrove Watch application.

## Files Created

### 1. `DATABASE_STRUCTURE.md`
- Complete database schema documentation
- Collection definitions and field types
- Relationships and indexes
- Security rules and validation

### 2. `sample-database-operations.js`
- Comprehensive examples of database operations
- Functions for adding users, incidents, activities, etc.
- Complete workflow examples
- Query and batch operation examples

### 3. `test-database-operations.js`
- Test suite for database operations
- Connection testing
- Data validation
- Cleanup utilities

## Quick Start

### Prerequisites
1. Firebase project set up
2. Firestore database enabled
3. Node.js installed
4. Firebase SDK installed

### Installation
```bash
# Install Firebase SDK
npm install firebase

# Install other dependencies if needed
npm install
```

### Running the Examples

#### Option 1: Run the complete sample
```bash
node sample-database-operations.js
```

#### Option 2: Run the test suite
```bash
node test-database-operations.js
```

#### Option 3: Run quick test only
```bash
node test-database-operations.js --quick
```

## Database Operations Examples

### 1. Adding a New User

```javascript
import { addNewUser } from './sample-database-operations.js';

// Add a new user
const userId = await addNewUser();
console.log("New user created with ID:", userId);
```

### 2. Adding an Incident Report

```javascript
import { addNewIncidentReport } from './sample-database-operations.js';

// Add incident report for a user
const incidentId = await addNewIncidentReport(userId);
console.log("New incident reported with ID:", incidentId);
```

### 3. Complete Workflow

```javascript
import { completeWorkflowExample } from './sample-database-operations.js';

// Run the complete workflow
await completeWorkflowExample();
```

## Collection Structure

### Users Collection
```javascript
{
  id: "unique_user_id",
  email: "user@example.com",
  name: "User Name",
  role: "coastal_communities", // or other roles
  points: 0,
  badge: "Newcomer",
  badgeEmoji: "🌱",
  createdAt: new Date(),
  lastActive: new Date(),
  isActive: true,
  permissions: ["submit_reports", "view_own_reports"],
  profileImage: "",
  phoneNumber: "+919876543210",
  location: {
    city: "Mumbai",
    state: "Maharashtra",
    country: "India"
  },
  preferences: {
    notifications: true,
    emailUpdates: true,
    language: "en"
  }
}
```

### Incidents Collection
```javascript
{
  userId: "user_id_reference",
  userEmail: "user@example.com",
  userName: "User Name",
  photoUrl: "https://example.com/photo.jpg",
  location: {
    latitude: 19.0760,
    longitude: 72.8777,
    address: "Mangrove Forest Reserve",
    city: "Mumbai",
    state: "Maharashtra",
    country: "India",
    fullAddress: "Full address string"
  },
  description: "Detailed description of the incident",
  status: "pending", // pending, approved, rejected, resolved
  aiValidated: false,
  createdAt: new Date(),
  updatedAt: new Date(),
  severity: "high", // low, medium, high, critical
  category: "construction", // deforestation, pollution, construction, other
  estimatedArea: 500, // square meters
  mangroveSpecies: ["Rhizophora mucronata", "Avicennia marina"]
}
```

## Common Operations

### Creating Documents
```javascript
// Using setDoc (with custom ID)
const userRef = doc(db, "users", "custom_user_id");
await setDoc(userRef, userData);

// Using addDoc (auto-generated ID)
const incidentRef = await addDoc(collection(db, "incidents"), incidentData);
```

### Reading Documents
```javascript
// Get single document
const userDoc = await getDoc(doc(db, "users", userId));
if (userDoc.exists()) {
  const userData = userDoc.data();
  console.log("User:", userData.name);
}

// Query multiple documents
const pendingIncidents = query(
  collection(db, "incidents"),
  where("status", "==", "pending"),
  orderBy("createdAt", "desc")
);
const snapshot = await getDocs(pendingIncidents);
```

### Updating Documents
```javascript
const userRef = doc(db, "users", userId);
await updateDoc(userRef, {
  points: newPoints,
  lastActive: new Date()
});
```

### Deleting Documents
```javascript
const userRef = doc(db, "users", userId);
await deleteDoc(userRef);
```

## Query Examples

### Get Users by Role
```javascript
const ngoUsers = query(
  collection(db, "users"),
  where("role", "==", "conservation_ngos"),
  where("isActive", "==", true)
);
```

### Get Recent Incidents
```javascript
const recentIncidents = query(
  collection(db, "incidents"),
  orderBy("createdAt", "desc"),
  limit(10)
);
```

### Get User's Incidents
```javascript
const userIncidents = query(
  collection(db, "incidents"),
  where("userId", "==", userId),
  orderBy("createdAt", "desc")
);
```

## Error Handling

### Best Practices
```javascript
try {
  const result = await databaseOperation();
  console.log("Success:", result);
} catch (error) {
  console.error("Database error:", error);
  
  // Handle specific error types
  if (error.code === 'permission-denied') {
    console.log("Permission denied - check security rules");
  } else if (error.code === 'not-found') {
    console.log("Document not found");
  }
}
```

### Common Error Codes
- `permission-denied`: Security rules blocked the operation
- `not-found`: Document or collection doesn't exist
- `already-exists`: Document with that ID already exists
- `invalid-argument`: Invalid data or query parameters

## Security Rules

### Basic Rules
```javascript
// Allow users to read/write their own data
match /users/{userId} {
  allow read, write: if request.auth != null && request.auth.uid == userId;
}

// Allow admins to read all data
match /users/{userId} {
  allow read: if request.auth != null && 
    get(/databases/$(db.name)/documents/users/$(request.auth.uid)).data.role == 'admin';
}
```

### Role-Based Access
```javascript
// Allow NGO users to view incidents
match /incidents/{incidentId} {
  allow read: if request.auth != null && 
    get(/databases/$(db.name)/documents/users/$(request.auth.uid)).data.role in ['conservation_ngos', 'government_forestry', 'researchers'];
}
```

## Performance Optimization

### Indexes
- Create composite indexes for complex queries
- Use single-field indexes for simple filters
- Monitor query performance in Firebase console

### Pagination
```javascript
// Use limit() for pagination
const firstPage = query(
  collection(db, "incidents"),
  orderBy("createdAt", "desc"),
  limit(20)
);

// Use startAfter() for next page
const nextPage = query(
  collection(db, "incidents"),
  orderBy("createdAt", "desc"),
  startAfter(lastDocument),
  limit(20)
);
```

### Batch Operations
```javascript
import { writeBatch } from "firebase/firestore";

const batch = writeBatch(db);

// Add multiple operations
batch.set(doc(db, "users", "user1"), user1Data);
batch.set(doc(db, "users", "user2"), user2Data);
batch.update(doc(db, "users", "user3"), { points: 100 });

// Commit all operations
await batch.commit();
```

## Testing

### Run Tests
```bash
# Full test suite
node test-database-operations.js

# Quick test only
node test-database-operations.js --quick
```

### Test Output
```
🧪 Mangrove Watch Database Test Suite
=====================================
🔌 Testing database connection...
✅ Database connection successful!
📊 Found 5 users in database

📊 Checking existing data...
👥 Users: 5 found
🚨 Incidents: 12 found
🏆 Leaderboard: 5 found
📱 Activities: 8 found

👤 Adding test user...
✅ Test user added successfully: user_1234567890

🔍 Querying test data...
🧪 Found 1 test users
   - Test User (test.user@example.com) - coastal_communities

🧹 Cleaning up test data...
🗑️ Found 1 test users to clean up
ℹ️ Test users marked for cleanup (not deleted in demo)

🎉 All tests completed successfully!
```

## Troubleshooting

### Common Issues

1. **Permission Denied**
   - Check Firestore security rules
   - Verify user authentication
   - Ensure proper role permissions

2. **Document Not Found**
   - Verify document ID exists
   - Check collection name spelling
   - Ensure proper path structure

3. **Query Errors**
   - Create required indexes
   - Check query syntax
   - Verify field names and types

4. **Connection Issues**
   - Verify Firebase config
   - Check internet connection
   - Ensure Firebase project is active

### Debug Mode
```javascript
// Enable debug logging
import { connectFirestoreEmulator } from "firebase/firestore";

if (process.env.NODE_ENV === 'development') {
  connectFirestoreEmulator(db, 'localhost', 8080);
}
```

## Next Steps

1. **Customize the Examples**
   - Modify data structures for your needs
   - Add your own business logic
   - Implement proper error handling

2. **Set Up Security Rules**
   - Configure Firestore security rules
   - Implement role-based access control
   - Test security thoroughly

3. **Add Validation**
   - Implement data validation
   - Add business rule checks
   - Set up data sanitization

4. **Monitor Performance**
   - Set up Firebase monitoring
   - Optimize queries and indexes
   - Implement caching strategies

## Support

For issues or questions:
1. Check Firebase documentation
2. Review security rules
3. Test with simple operations first
4. Use Firebase console for debugging

## Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Documentation](https://firebase.google.com/docs/firestore)
- [Firebase Security Rules](https://firebase.google.com/docs/rules)
- [Firebase Performance](https://firebase.google.com/docs/firestore/query-data/indexing)
