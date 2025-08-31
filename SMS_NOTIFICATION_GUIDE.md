# SMS Notification Guide

## Overview

The SMS notification feature automatically sends SMS messages to a configured phone number whenever a user submits an incident report. This ensures that administrators or authorities are immediately notified of new incidents.

## Features

- ✅ **Automatic SMS notifications** when incident reports are submitted
- ✅ **Configurable admin phone number** 
- ✅ **Enable/disable functionality**
- ✅ **Rich incident details** including location, description, and reporter info
- ✅ **Error handling** - SMS failures don't break incident submission
- ✅ **Phone number validation**

## Configuration

### 1. Set Admin Phone Number

Update the admin phone number in `services/firebaseService.ts`:

```typescript
const SMS_CONFIG = {
  // Change this to your actual phone number
  ADMIN_PHONE_NUMBER: '+1234567890', // Replace with real number
  ENABLE_SMS_NOTIFICATIONS: true,
  MAX_DESCRIPTION_LENGTH: 100
};
```

### 2. Enable/Disable SMS Notifications

You can programmatically enable or disable SMS notifications:

```typescript
import { setSMSNotificationsEnabled } from '@/services/firebaseService';

// Disable SMS notifications
setSMSNotificationsEnabled(false);

// Enable SMS notifications
setSMSNotificationsEnabled(true);
```

### 3. Update Admin Phone Number Dynamically

```typescript
import { updateAdminPhoneNumber } from '@/services/firebaseService';

// Update to a new phone number
updateAdminPhoneNumber('+9876543210');
```

### 4. Get Current Configuration

```typescript
import { getSMSConfig } from '@/services/firebaseService';

const config = getSMSConfig();
console.log('Current SMS config:', config);
// Output: { adminPhoneNumber: '+1234567890', enabled: true, maxDescriptionLength: 100 }
```

## SMS Message Format

When an incident is submitted, the following SMS is sent:

```
🚨 NEW INCIDENT REPORT

Report ID: INCIDENT_20241201_001
Reporter: John Doe
Location: 12.971600, 77.594600
Address: Bangalore, Karnataka, India
Description: Mangrove destruction detected in the area. Multiple trees have been cut down...

Please review and take necessary action.
```

## How It Works

1. **User submits incident report** via the app
2. **Report is saved** to Firebase Firestore
3. **Photo is uploaded** to Firebase Storage
4. **Points are awarded** to the user
5. **SMS notification is sent** to the configured admin phone number
6. **Success/failure is logged** to console

## Error Handling

- If SMS fails, the incident submission still succeeds
- SMS errors are logged but don't break the main flow
- Phone number validation prevents invalid numbers
- SMS availability is checked before attempting to send

## Testing

### 1. Run the Test Script

```bash
node test-sms-notification.js
```

### 2. Test on Real Device

1. Update the admin phone number with a real number
2. Test on a physical device (not simulator)
3. Submit an incident report
4. Check console logs for SMS status
5. Verify SMS is received on the admin phone

### 3. Test SMS Service

```typescript
import { SMSService } from '@/services/smsService';

// Check if SMS is available
const isAvailable = await SMSService.isAvailable();
console.log('SMS Available:', isAvailable);

// Test sending SMS
const result = await SMSService.sendSMSToMultiple(
  ['+1234567890'], 
  'Test message'
);
console.log('SMS Result:', result);
```

## Requirements

### Device Requirements
- Physical device (SMS doesn't work in simulators)
- SMS capability enabled
- Valid phone number configured

### App Permissions
- SMS permissions (handled by expo-sms)
- Location permissions (for incident location)

## Troubleshooting

### SMS Not Sending
1. Check if SMS is available: `SMSService.isAvailable()`
2. Verify phone number format
3. Ensure you're testing on a real device
4. Check console logs for error messages

### Invalid Phone Number
- Use international format: `+1234567890`
- Remove spaces, dashes, and parentheses
- Ensure number starts with country code

### SMS Disabled
- Check `SMS_CONFIG.ENABLE_SMS_NOTIFICATIONS`
- Use `setSMSNotificationsEnabled(true)` to enable

## Security Considerations

- Store admin phone number securely in production
- Consider using environment variables
- Validate phone numbers before sending
- Log SMS activities for audit purposes

## Future Enhancements

- [ ] Multiple admin phone numbers
- [ ] Customizable SMS templates
- [ ] SMS delivery confirmation
- [ ] Rate limiting for SMS
- [ ] Integration with webhook notifications
- [ ] SMS history tracking

## Support

For issues with SMS notifications:
1. Check console logs for error messages
2. Verify device SMS capability
3. Test with a known working phone number
4. Ensure proper permissions are granted
