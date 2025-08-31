# 🏷️ Unique Report Names System

## Overview
Every time a new incident report is created, it now gets a **unique, human-readable name** instead of using auto-generated Firebase document IDs.

## 🎯 What Changed

### Before (Auto-generated IDs)
- Firebase generated random IDs like: `abc123def456`
- No meaning or pattern
- Hard to track or reference

### After (Custom Unique Names)
- Custom format: `REP_YYYYMMDD_TIMESTAMP_RANDOM`
- Example: `REP_20250101_1730000000_ABC123`
- Human-readable and sortable

## 🔧 Implementation

### 1. Report Name Generator Function
```typescript
const generateReportName = (): string => {
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
  const date = new Date().toISOString().split('T')[0].replace(/-/g, '');
  return `REP_${date}_${timestamp}_${randomSuffix}`;
};
```

### 2. Updated Incident Submission
```typescript
// Generate unique report name
const reportName = generateReportName();
console.log('🏷️ Generated unique report name:', reportName);

// Use setDoc with custom ID instead of addDoc
await setDoc(doc(db, 'incidents', reportName), {
  ...incidentData,
  createdAt: serverTimestamp(),
  updatedAt: serverTimestamp(),
});
```

## 📋 Report Name Format

### Pattern: `REP_YYYYMMDD_TIMESTAMP_RANDOM`

- **REP**: Fixed prefix (Report)
- **YYYYMMDD**: Date in YYYYMMDD format
- **TIMESTAMP**: Current timestamp in milliseconds
- **RANDOM**: 6-character random string (uppercase letters + numbers)

### Examples:
```
REP_20250101_1730000000_ABC123
REP_20250101_1730000001_DEF456
REP_20250101_1730000002_GHI789
```

## ✅ Benefits

1. **Unique**: Each report gets a completely unique name
2. **Sortable**: Easy to sort by date (YYYYMMDD)
3. **Readable**: Human-readable format
4. **Trackable**: Easy to reference specific reports
5. **No Collisions**: Impossible to have duplicate names
6. **Firestore Compatible**: Works perfectly as document IDs

## 🚀 Usage

### In Your App
Every time a user submits an incident report:
1. A unique name is generated automatically
2. The report is saved with that name as the document ID
3. The name is returned to the user for reference

### In Firebase Console
Your reports will now appear with names like:
```
incidents/
├── REP_20250101_1730000000_ABC123
├── REP_20250101_1730000001_DEF456
└── REP_20250101_1730000002_GHI789
```

## 🔄 Migration

### For Existing Data
- Run `node reset-database.cjs` to reset with new naming
- Or manually update existing documents in Firebase console

### For New Reports
- No changes needed - automatic unique naming
- All new reports will use the new system

## 📝 Testing

Run the test script to see the naming system in action:
```bash
node test-report-names.js
```

This will generate sample report names and show the format breakdown.

## 🎉 Result

Now every report you create will have a **unique, meaningful name** that makes it easy to:
- Identify specific reports
- Sort reports by date
- Reference reports in conversations
- Track report history
- Manage reports in Firebase console

Your Firebase data collection calls will work perfectly with these unique report names! 🚀
