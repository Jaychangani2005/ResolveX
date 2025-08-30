# SMS Functionality Guide

## Overview

The Mangrove Watch app now includes comprehensive SMS functionality that allows users to send text messages to NGOs, government officials, and other stakeholders involved in mangrove conservation efforts.

## Features

### 📱 Core SMS Capabilities
- **Direct SMS Sending**: Send messages directly from the app to selected contacts
- **Contact Management**: Access and manage your device contacts
- **Message Templates**: Pre-built message templates for common scenarios
- **Multi-Recipient Support**: Send the same message to multiple contacts simultaneously

### 👥 Contact Features
- **Contact Search**: Search contacts by name, organization, or job title
- **Organization Filtering**: Filter contacts by organization type (NGO, Government, etc.)
- **Contact Details**: View contact information including organization and job title
- **Phone Number Validation**: Automatic phone number format validation

### 📝 Message Templates
The app includes several pre-built message templates:

#### 🚨 Urgent Messages
- **Emergency Response**: For immediate assistance requests
- **Urgent Incident Report**: For critical mangrove destruction reports

#### 📸 Report Messages
- **Report Submission**: Notify about new incident reports
- **Conservation Update**: Share conservation progress updates

#### ❓ Inquiry Messages
- **General Inquiry**: General questions about conservation efforts
- **Volunteer Interest**: Express interest in volunteering
- **Meeting Request**: Request meetings to discuss strategies

#### 📝 General Messages
- **Follow-up Request**: Check on previous report status

## How to Use

### 1. Accessing SMS Functionality

#### From Main Navigation
- Navigate to the **SMS** tab in the main bottom navigation
- This is available to all user types

#### From Dashboards
- **NGO Dashboard**: SMS button in the header
- **Government Dashboard**: SMS button in the header

### 2. Sending an SMS

1. **Compose Message**
   - Type your message in the text input area
   - Use the **Templates** button to select pre-built messages
   - Customize the message as needed

2. **Select Recipients**
   - Tap **Select Contacts** to choose recipients
   - Search for specific contacts using the search bar
   - Select multiple contacts if needed
   - View selected contacts as chips below the message area

3. **Send Message**
   - Tap **Send SMS** button
   - The app will send the message to all selected contacts
   - You'll receive confirmation of successful sends

### 3. Using Message Templates

1. Tap the **📋 Templates** button
2. Browse available templates by category
3. Tap on a template to automatically fill the message area
4. Customize the template content if needed
5. Select recipients and send

### 4. Managing Contacts

1. **Loading Contacts**
   - Grant contacts permission when prompted
   - The app automatically loads your device contacts
   - Pull to refresh to reload contacts

2. **Searching Contacts**
   - Use the search bar to find specific contacts
   - Search by name, organization, or job title
   - Results update in real-time

3. **Contact Selection**
   - Tap contacts to select/deselect them
   - Selected contacts appear as chips
   - Remove contacts by tapping the X on the chip

## User Roles and Permissions

### Coastal Communities Users
- Can send SMS to NGOs and government officials
- Access to all message templates
- Full contact management capabilities

### NGO Users
- Can send SMS to government officials and other NGOs
- Access to professional message templates
- Quick access from NGO dashboard

### Government Officials
- Can send SMS to NGOs and other government departments
- Access to official communication templates
- Quick access from government dashboard

### Researchers
- Can send SMS to all stakeholder types
- Access to research-related templates
- Full messaging capabilities

## Technical Implementation

### Dependencies
- `expo-sms`: Core SMS functionality
- `expo-contacts`: Contact access and management

### Service Architecture
- **SMSService**: Centralized SMS operations
- **Contact Management**: Contact loading, filtering, and validation
- **Message Templates**: Pre-built message system
- **Error Handling**: Comprehensive error management

### Security Features
- **Permission Management**: Explicit user consent for contacts
- **Phone Validation**: Input validation for phone numbers
- **Error Logging**: Secure error handling and logging

## Best Practices

### Message Composition
- Keep messages concise and clear
- Use appropriate templates for different scenarios
- Include relevant context (location, incident details)
- Use professional language for official communications

### Contact Management
- Regularly update your contact list
- Organize contacts with proper organization names
- Use job titles for better identification
- Verify phone numbers before sending

### Emergency Communications
- Use urgent templates for critical situations
- Include specific location details
- Provide clear action items
- Follow up if no response received

## Troubleshooting

### Common Issues

#### SMS Not Sending
- Check device SMS capability
- Verify phone number format
- Ensure message content is not empty
- Check network connectivity

#### Contacts Not Loading
- Grant contacts permission
- Check device contacts app
- Restart the app
- Clear app cache if needed

#### Permission Denied
- Go to device settings
- Enable contacts permission for Mangrove Watch
- Restart the app after permission change

### Error Messages

#### "SMS functionality not available"
- Device doesn't support SMS
- Use alternative communication methods

#### "Contacts permission denied"
- Grant permission in device settings
- Restart app after permission change

#### "Failed to send SMS"
- Check phone number format
- Verify network connectivity
- Try sending to fewer recipients

## Future Enhancements

### Planned Features
- **SMS History**: Track sent messages
- **Scheduled Messages**: Send messages at specific times
- **Group Messaging**: Create contact groups
- **Message Analytics**: Track message delivery rates
- **Integration**: Connect with incident reporting system

### Advanced Capabilities
- **Auto-location**: Include GPS coordinates in messages
- **Photo Attachments**: Send incident photos via MMS
- **Voice Messages**: Convert text to voice messages
- **Multi-language Support**: Support for local languages

## Support

For technical support or questions about SMS functionality:
- Check the app's help section
- Contact your organization's IT support
- Report issues through the app's feedback system

---

**Note**: SMS functionality requires device SMS capabilities and may incur standard messaging charges from your mobile carrier.
