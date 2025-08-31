# 📱 Phone Number Features

## Overview

The ResolveX app now includes comprehensive phone number functionality with validation, duplicate prevention, and integration with the SMS system. Each user can have one unique phone number associated with their account.

## Features

### 🔐 **Phone Number in User Registration**
- **Optional Field**: Phone number is optional during signup
- **Real-time Validation**: Validates phone number format as user types
- **Duplicate Prevention**: Prevents multiple users from using the same phone number
- **Automatic Formatting**: Formats phone numbers to international standard

### 📝 **Phone Number Validation**
- **Format Validation**: Supports international phone number formats
- **Length Validation**: Accepts 7-15 digit phone numbers
- **Country Code Support**: Automatically handles country codes
- **Real-time Feedback**: Shows validation status with visual indicators

### 👤 **Profile Management**
- **Edit Phone Number**: Users can update their phone number in profile
- **Remove Phone Number**: Users can remove their phone number (set to undefined)
- **Validation on Update**: Ensures phone number is valid when updating
- **Duplicate Check**: Prevents using phone numbers already registered by other users

### 📱 **SMS Integration**
- **SMS Functionality**: Phone numbers are used for SMS messaging
- **Contact Management**: Phone numbers appear in contact lists
- **Quick SMS**: Users can send SMS to their own number for testing

## Technical Implementation

### **Phone Number Validation**

```typescript
// Validation function
export const validatePhoneNumber = (phoneNumber: string): boolean => {
  const cleaned = phoneNumber.replace(/\D/g, '');
  
  if (cleaned.length < 7 || cleaned.length > 15) {
    return false;
  }
  
  const phoneRegex = /^[\+]?[1-9][\d]{6,14}$/;
  return phoneRegex.test(cleaned);
};
```

### **Phone Number Formatting**

```typescript
// Formatting function
export const formatPhoneNumber = (phoneNumber: string): string => {
  const cleaned = phoneNumber.replace(/\D/g, '');
  
  if (cleaned.length === 10) {
    return `+1${cleaned}`; // US/Canada format
  } else if (cleaned.length === 11 && cleaned.startsWith('1')) {
    return `+${cleaned}`; // US/Canada with country code
  } else if (cleaned.length === 12 && cleaned.startsWith('91')) {
    return `+${cleaned}`; // India format
  } else if (cleaned.length >= 7 && cleaned.length <= 15) {
    return `+${cleaned}`; // International format
  }
  
  return phoneNumber;
};
```

### **Duplicate Prevention**

```typescript
// Check if phone number already exists
export const checkPhoneNumberExists = async (phoneNumber: string): Promise<boolean> => {
  const formattedNumber = formatPhoneNumber(phoneNumber);
  
  const usersRef = collection(db, 'users');
  const q = query(usersRef, where('phoneNumber', '==', formattedNumber));
  const querySnapshot = await getDocs(q);
  
  return !querySnapshot.empty;
};
```

## User Interface

### **Signup Screen**
- **Phone Number Input**: Optional field with validation
- **Real-time Validation**: Shows ✓ or ✗ as user types
- **Error Messages**: Clear feedback for invalid numbers
- **Success Indicators**: Visual confirmation of valid numbers

### **Profile Screen**
- **Phone Number Display**: Shows current phone number
- **Edit Mode**: Allows updating phone number
- **Validation**: Real-time validation during editing
- **Remove Option**: Can clear phone number field

### **SMS Screen**
- **Contact Integration**: Phone numbers appear in contact lists
- **Manual Input**: Can enter phone numbers directly
- **Validation**: Validates phone numbers before sending

## Database Schema

### **User Document Structure**
```typescript
interface User {
  id: string;
  email: string;
  name: string;
  phoneNumber?: string; // Optional phone number field
  role: UserRole;
  points: number;
  badge: string;
  badgeEmoji: string;
  createdAt: Date;
  lastActive: Date;
  isActive: boolean;
  permissions: string[];
  location?: {
    city?: string;
    state?: string;
    country?: string;
  };
  preferences?: {
    notifications: boolean;
    emailUpdates: boolean;
    language: string;
  };
}
```

### **Firestore Indexes**
```json
{
  "collectionGroup": "users",
  "queryScope": "COLLECTION",
  "fields": [
    {
      "fieldPath": "phoneNumber",
      "order": "ASCENDING"
    }
  ]
}
```

## API Functions

### **Registration Functions**
- `firebaseSignUp(email, password, name, phoneNumber?)`: Create user with phone number
- `validatePhoneNumber(phoneNumber)`: Validate phone number format
- `formatPhoneNumber(phoneNumber)`: Format to international standard
- `checkPhoneNumberExists(phoneNumber)`: Check for duplicates

### **Profile Functions**
- `updateUserPhoneNumber(userId, phoneNumber)`: Update user's phone number
- `getUserByPhoneNumber(phoneNumber)`: Find user by phone number
- `updateUserProfile(userId, updates)`: Update profile including phone number

### **SMS Functions**
- `SMSService.sendSMSToMultiple(phoneNumbers, message)`: Send SMS to phone numbers
- `SMSService.sendSMSWithLocation(phoneNumbers, message, includeLocation)`: Send SMS with location

## Error Handling

### **Validation Errors**
- **Invalid Format**: "Invalid phone number format. Please enter a valid phone number."
- **Duplicate Number**: "This phone number is already registered. Please use a different number or try logging in."
- **Empty Field**: Phone number is optional, no error for empty field

### **Update Errors**
- **Already Exists**: "This phone number is already registered by another user."
- **Invalid Format**: "Invalid phone number format. Please enter a valid phone number or leave it empty."

## Security Features

### **Data Privacy**
- **Optional Field**: Phone numbers are not required
- **User Control**: Users can remove their phone number
- **Validation**: Prevents invalid data entry
- **Duplicate Prevention**: Ensures data integrity

### **Firestore Rules**
```javascript
// Example Firestore rules for phone number
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      // Validate phone number format
      allow create, update: if 
        request.auth != null && 
        request.auth.uid == userId &&
        (request.resource.data.phoneNumber == null || 
         request.resource.data.phoneNumber.matches('^\\+[1-9]\\d{6,14}$'));
    }
  }
}
```

## Usage Examples

### **Signup with Phone Number**
```typescript
// Sign up with phone number
const user = await firebaseSignUp(
  'user@example.com',
  'password123',
  'John Doe',
  '+1234567890'
);
```

### **Update Phone Number**
```typescript
// Update user's phone number
await updateUserPhoneNumber(userId, '+1987654321');
```

### **Find User by Phone Number**
```typescript
// Find user by phone number
const user = await getUserByPhoneNumber('+1234567890');
```

### **Send SMS to Phone Number**
```typescript
// Send SMS to phone number
const result = await SMSService.sendSMSToMultiple(
  ['+1234567890'],
  'Hello from ResolveX!'
);
```

## Testing

### **Phone Number Validation Tests**
```typescript
// Test valid phone numbers
validatePhoneNumber('+1234567890'); // true
validatePhoneNumber('1234567890'); // true
validatePhoneNumber('+919876543210'); // true

// Test invalid phone numbers
validatePhoneNumber('123'); // false (too short)
validatePhoneNumber('1234567890123456'); // false (too long)
validatePhoneNumber('abc123def'); // false (invalid characters)
```

### **Formatting Tests**
```typescript
// Test phone number formatting
formatPhoneNumber('1234567890'); // '+11234567890'
formatPhoneNumber('11234567890'); // '+11234567890'
formatPhoneNumber('919876543210'); // '+919876543210'
```

## Best Practices

### **For Users**
1. **Enter Valid Numbers**: Use proper country codes and formats
2. **Keep Updated**: Update phone number if it changes
3. **Privacy**: Phone number is optional, only provide if needed
4. **SMS Testing**: Use your own number to test SMS functionality

### **For Developers**
1. **Always Validate**: Validate phone numbers before saving
2. **Handle Duplicates**: Check for existing phone numbers
3. **Format Consistently**: Use international format for storage
4. **Error Handling**: Provide clear error messages
5. **Optional Field**: Don't require phone numbers

## Future Enhancements

### **Planned Features**
- **Phone Number Verification**: SMS verification for phone numbers
- **Multiple Numbers**: Support for multiple phone numbers per user
- **Country Detection**: Automatic country detection from phone number
- **Call Integration**: Direct calling functionality
- **WhatsApp Integration**: WhatsApp messaging support

### **Advanced Features**
- **Phone Number Portability**: Transfer phone numbers between accounts
- **Backup Numbers**: Secondary phone numbers for backup
- **Scheduled Messages**: Schedule SMS for later delivery
- **Message Templates**: Pre-built SMS templates with phone number variables

---

**Phone number functionality is now fully integrated into ResolveX! 📱✅**
