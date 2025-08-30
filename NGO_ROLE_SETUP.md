# NGO Role Setup and Usage

## Overview

The NGO (Non-Governmental Organization) role has been added to the ResolveX app to allow NGO partners to view and analyze incident reports submitted by users. This role provides access to comprehensive incident data including user information, photos, descriptions, and AI validation status.

## Features

### 🔍 Incident Report Access
- **View All Reports**: NGO users can see all incident reports submitted by users
- **User Information**: Access to reporter names, emails, and user IDs
- **Photo Access**: View all incident photos submitted by users
- **Description Access**: Read detailed descriptions of incidents
- **AI Validation Status**: See whether images have been validated by AI

### 📊 Dashboard Features
- **Statistics Overview**: Total reports, AI validated count, resolved count
- **Real-time Updates**: Pull-to-refresh functionality
- **Detailed View**: Click on any report to see comprehensive details
- **Responsive Design**: Works on both mobile and tablet devices

## NGO User Permissions

### ✅ Allowed Actions
- View all incident reports
- See user names and contact information
- Access incident photos and descriptions
- View AI validation status
- Navigate to detailed report views
- Refresh data in real-time

### ❌ Restricted Actions
- Cannot submit new incident reports
- Cannot edit or delete existing reports
- Cannot approve or reject reports
- Cannot manage other users
- Cannot access admin features

## Technical Implementation

### User Role Structure
```typescript
interface NGOUser extends User {
  role: 'ngo';
  permissions: [
    'view_incident_pictures',
    'view_incident_descriptions',
    'view_user_names',
    'view_ai_validation_status',
    'view_incident_reports'
  ];
}
```

### Database Access
- **Collection**: `incidents`
- **Access Level**: Read-only access to all incident documents
- **Fields Available**: All incident fields including user data and AI validation

### Navigation Flow
1. NGO user logs in → Redirected to `/(ngo)/dashboard`
2. Dashboard shows all incident reports with statistics
3. Click on any report → Navigate to `/(ngo)/report-details/[id]`
4. Detailed view shows comprehensive report information

## Creating an NGO User

### Method 1: Using the Script
```bash
node scripts/create-ngo-user.js
```

This creates a test NGO user with:
- Email: `ngo@gmail.com`
- Password: `123456`
- Name: `NGO Partner`

### Method 2: Manual Creation
1. Use the admin interface to create a new user
2. Set the role to `'ngo'`
3. Assign the appropriate permissions

### Method 3: Database Direct Creation
```javascript
const ngoProfile = {
  id: userId,
  email: 'ngo@example.com',
  password: hashedPassword,
  name: 'NGO Partner',
  role: 'ngo',
  permissions: [
    'view_incident_pictures',
    'view_incident_descriptions',
    'view_user_names',
    'view_ai_validation_status',
    'view_incident_reports'
  ],
  badge: 'NGO Partner',
  badgeEmoji: '🌿'
};
```

## UI Components

### NGO Dashboard (`app/(ngo)/dashboard.tsx`)
- Displays all incident reports
- Shows statistics (total, AI validated, resolved)
- Pull-to-refresh functionality
- Clickable report cards

### Report Details (`app/(ngo)/report-details/[id].tsx`)
- Comprehensive report information
- User details section
- AI validation status
- Photo display
- Location information

### Incident Report Card (Enhanced)
- Shows AI validation status
- Clickable for NGO users
- Displays user information when `showUserInfo={true}`

## Security Considerations

### Access Control
- Only users with `role: 'ngo'` can access NGO routes
- Automatic redirect for unauthorized users
- Permission-based feature access

### Data Privacy
- NGO users can see user information (as required)
- No ability to modify or delete data
- Read-only access to incident reports

### Firestore Rules
```javascript
// NGO users can read all incidents
match /incidents/{incidentId} {
  allow read: if true; // NGO users have read access
}
```

## Testing the NGO Role

### 1. Create NGO User
```bash
node scripts/create-ngo-user.js
```

### 2. Login with NGO Credentials
- Email: `ngo@example.com`
- Password: `ngo123456`

### 3. Verify Access
- Should be redirected to NGO dashboard
- Should see all incident reports
- Should be able to click on reports for details
- Should see AI validation status

### 4. Test Permissions
- Try accessing admin routes (should be denied)
- Try submitting new reports (should not be available)
- Verify can see user information and photos

## Troubleshooting

### Common Issues

**Issue**: NGO user can't access dashboard
**Solution**: Check user role is set to `'ngo'` in database

**Issue**: No incidents showing
**Solution**: Verify incidents exist in `incidents` collection

**Issue**: Can't see AI validation status
**Solution**: Check if `aiValidated` field exists in incident documents

**Issue**: Navigation not working
**Solution**: Verify NGO layout file exists at `app/(ngo)/_layout.tsx`

### Debug Steps
1. Check user role in Firestore
2. Verify permissions array contains required permissions
3. Check console for any errors
4. Verify incident data structure
5. Test with different incident reports

## Future Enhancements

### Potential Features
- **Filtering**: Filter reports by status, date, location
- **Export**: Export report data to CSV/PDF
- **Analytics**: Advanced analytics and reporting
- **Notifications**: Get notified of new reports
- **Comments**: Add notes or comments to reports
- **Collaboration**: Share reports with other NGO users

### Integration Possibilities
- **API Access**: REST API for external integrations
- **Web Dashboard**: Web-based dashboard for desktop use
- **Data Export**: Integration with external reporting tools
- **GIS Integration**: Map-based visualization of incidents

## Support

For technical support or questions about the NGO role:
1. Check this documentation
2. Review the code comments
3. Test with the provided scripts
4. Contact the development team

---

**Note**: This role is specifically designed for NGO partners who need to monitor and analyze environmental incidents. The permissions are intentionally limited to read-only access to maintain data integrity and security.
