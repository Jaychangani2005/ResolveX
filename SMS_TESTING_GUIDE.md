# 📱 SMS Testing Guide

## How to Test SMS Functionality

### 🚀 **Step 1: Access SMS Tab**
1. Open the ResolveX app on your device
2. Navigate to the **SMS** tab in the bottom navigation
3. You should see the SMS interface with three tabs: **Compose**, **History**, and **Templates**

### 📱 **Step 2: Test Basic SMS Features**

#### **A. Check SMS Availability**
- The app will automatically check if SMS is available on your device
- If SMS is not available, you'll see an error message
- **Expected**: Should show SMS interface if device supports SMS

#### **B. Test Contact Permissions**
1. Tap **"Select Contacts"** button
2. Grant contacts permission when prompted
3. **Expected**: Should show your device contacts
4. **If Error**: Check device settings → Apps → ResolveX → Permissions

#### **C. Test Message Templates**
1. Tap **"Templates"** button
2. Browse through the 10 available templates
3. Tap any template to auto-fill the message
4. **Expected**: Message area should populate with template content

### 🔧 **Step 3: Test SMS Sending**

#### **Option A: Test with Your Own Number**
1. In the **Compose** tab, tap **"Add"** under Manual Phone Numbers
2. Enter your own phone number
3. Type a test message: "Testing SMS functionality from ResolveX app"
4. Tap **"Send SMS"**
5. **Expected**: Should open your device's SMS app with the message

#### **Option B: Test with Contacts**
1. Tap **"Select Contacts"**
2. Choose a contact from your device
3. Type a test message
4. Tap **"Send SMS"**
5. **Expected**: Should open SMS app with recipient and message

### 📍 **Step 4: Test Location Integration**
1. Toggle **"Include current location"** switch
2. Type a message
3. Send to a test number
4. **Expected**: Message should include GPS coordinates

### 📋 **Step 5: Test SMS History**
1. Send a test SMS
2. Go to **History** tab
3. **Expected**: Should see the sent message with timestamp and status

## 🧪 **Testing Checklist**

### ✅ **Basic Functionality**
- [ ] SMS tab loads without errors
- [ ] Three tabs are visible: Compose, History, Templates
- [ ] Contact picker opens and shows device contacts
- [ ] Message templates load and can be selected
- [ ] Manual phone number input works

### ✅ **SMS Sending**
- [ ] Can compose messages
- [ ] Can select contacts
- [ ] Can enter manual phone numbers
- [ ] Send button is enabled when message and recipients are provided
- [ ] SMS app opens when sending

### ✅ **Advanced Features**
- [ ] Location toggle works
- [ ] GPS coordinates are included in messages when enabled
- [ ] SMS history tracks sent messages
- [ ] Success/failure status is shown in history
- [ ] Clear history function works

### ✅ **Error Handling**
- [ ] Shows error if no message entered
- [ ] Shows error if no recipients selected
- [ ] Shows error if SMS not available on device
- [ ] Shows error if contacts permission denied

## 🐛 **Common Issues and Solutions**

### **Issue: SMS Tab Not Visible**
**Solution**: Check if the SMS tab is properly configured in the navigation

### **Issue: Contacts Not Loading**
**Solution**: 
1. Go to device settings
2. Apps → ResolveX → Permissions
3. Enable Contacts permission
4. Restart the app

### **Issue: SMS Not Sending**
**Solution**:
1. Check if device has SMS capability
2. Verify phone number format
3. Check network connectivity
4. Ensure SMS app is working on device

### **Issue: Location Not Working**
**Solution**:
1. Enable location permissions
2. Check if GPS is enabled
3. Ensure location services are working

## 📊 **Expected Behavior**

### **Successful SMS Test**
```
✅ SMS tab loads
✅ Contact picker works
✅ Templates load
✅ Message composition works
✅ Send button enables
✅ SMS app opens
✅ History shows sent message
```

### **Error Scenarios**
```
❌ No SMS capability: Shows error message
❌ No contacts permission: Shows permission request
❌ No message: Send button disabled
❌ No recipients: Send button disabled
❌ Invalid phone number: Shows validation error
```

## 🔍 **Debug Information**

### **Check Console Logs**
Look for these log messages:
- `SMS functionality available: true/false`
- `Contacts loaded: [number] contacts`
- `SMS sent successfully to [number]`
- `SMS failed: [error message]`

### **Test on Different Devices**
- **Physical Device**: Best for testing actual SMS functionality
- **Simulator**: Limited SMS testing (may not work)
- **Emulator**: Limited SMS testing (may not work)

## 📱 **Quick Test Commands**

### **Test SMS Service**
```javascript
// In browser console or React Native debugger
import { SMSService } from '@/services/smsService';

// Check SMS availability
SMSService.isAvailable().then(available => {
  console.log('SMS Available:', available);
});

// Test phone validation
console.log('Valid number:', SMSService.validatePhoneNumber('+1234567890'));
```

### **Test Contact Loading**
```javascript
// Test contact loading
SMSService.loadContacts().then(contacts => {
  console.log('Contacts loaded:', contacts.length);
}).catch(error => {
  console.log('Contact error:', error);
});
```

## 🎯 **Success Indicators**

Your SMS functionality is working correctly if:

1. ✅ **SMS Tab**: Loads without errors
2. ✅ **Contact Picker**: Shows device contacts
3. ✅ **Templates**: 10 templates are available
4. ✅ **Message Composition**: Can type and edit messages
5. ✅ **Location Toggle**: Can enable/disable location
6. ✅ **Send Function**: Opens SMS app with message
7. ✅ **History**: Tracks sent messages
8. ✅ **Error Handling**: Shows appropriate error messages

## 🚨 **Important Notes**

- **SMS Charges**: Sending SMS may incur charges from your mobile carrier
- **Permissions**: App requires SMS and Contacts permissions
- **Device Support**: SMS functionality requires device SMS capability
- **Testing**: Best tested on physical devices, not simulators

---

**If all tests pass, your SMS functionality is working perfectly! 🎉**
