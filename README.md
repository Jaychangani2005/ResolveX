# 🌱 Community Mangrove Watch

A mobile application built with Expo for monitoring and protecting mangrove ecosystems through community engagement.

## Features

### 🔐 Authentication System
- **User Registration**: Create new accounts with email and name
- **User Login**: Secure authentication with email/password
- **Profile Management**: Personal user profiles with achievements
- **Session Persistence**: Automatic login state management

### 🏠 Home Screen
- **Beautiful Gradient Design**: Modern UI with nature-inspired colors
- **Personalized Welcome**: User-specific greetings and stats
- **Floating Elements**: Subtle animated background elements
- **Quick Statistics**: Community impact metrics
- **Action Buttons**: Easy navigation to main features

### 📸 Report Incident
- **Enhanced Photo Capture**: Improved camera and gallery integration
- **GPS Location**: Auto-capture current location coordinates
- **Rich Form Inputs**: Beautiful form styling with validation
- **Form Validation**: Ensures all required fields are completed
- **Submit**: Send reports with success confirmation

### 📱 SMS Messaging System
- **Comprehensive SMS Functionality**: Full-featured messaging system for stakeholder communication
- **Multi-Tab Interface**: 
  - **Compose Tab**: Create and send messages with advanced features
  - **History Tab**: View SMS history with success/failure tracking
  - **Templates Tab**: Browse and use pre-built message templates
- **Contact Management**: 
  - Access device contacts with permission handling
  - Search contacts by name, organization, or job title
  - Select multiple contacts for group messaging
  - Manual phone number input for direct messaging
- **Message Templates**: 10 pre-built templates for different scenarios:
  - 🚨 **Urgent Messages**: Emergency response, urgent incident reports
  - 📸 **Report Messages**: Report submissions, conservation updates
  - ❓ **Inquiry Messages**: General inquiries, volunteer interest, meeting requests
  - 📝 **General Messages**: Follow-up requests, community alerts
- **Location Integration**: 
  - Toggle to include current GPS coordinates in messages
  - Automatic location capture and formatting
  - Location-based incident reporting templates
- **SMS History**: 
  - Track all sent messages with timestamps
  - Success/failure status indicators
  - Recipient information and failed number tracking
  - Clear history functionality
- **Advanced Features**:
  - Phone number validation and formatting
  - Multi-recipient support
  - Error handling and retry mechanisms
  - Loading states and user feedback
- **Quick SMS Component**: Reusable SMS component for integration in other screens

### 🏆 Leaderboard
- **Top Contributors**: Ranked list with beautiful card design
- **Points System**: Visual progress tracking
- **Badge System**: 
  - 🌱 **Guardian**: 1000+ points
  - 🌳 **Protector**: 2000+ points
  - 👑 **Master**: 2000+ points (max level)
- **Community Statistics**: Real-time metrics and achievements

### 👤 User Profile
- **Personal Dashboard**: User stats and achievements
- **Progress Tracking**: Visual progress bars to next badge
- **Achievement History**: Recent accomplishments and milestones
- **Quick Actions**: Easy access to main features
- **Logout Functionality**: Secure session management

## Design Features

- **Beautiful Gradients**: Linear gradient backgrounds with nature-inspired colors
- **Modern UI**: Clean, minimal design with enhanced shadows and borders
- **Floating Elements**: Subtle animated background elements for visual appeal
- **Enhanced Components**: Improved buttons, inputs, and cards with better styling
- **Responsive Layout**: Adapts to different screen sizes and orientations
- **Dark/Light Mode**: Automatic theme switching based on system preferences
- **Accessibility**: Clear icons, intuitive navigation, and proper contrast
- **Smooth Animations**: Subtle animations and transitions for better UX

## Tech Stack

- **Framework**: Expo (React Native)
- **Navigation**: Expo Router with authentication flow
- **State Management**: React Context for authentication
- **Backend**: Firebase Authentication & Firestore Database
- **Storage**: AsyncStorage for user session persistence
- **UI Enhancements**: Expo Linear Gradient for beautiful backgrounds
- **Permissions**: Expo Image Picker, Expo Location, Expo SMS, Expo Contacts
- **Styling**: React Native StyleSheet with enhanced shadows and borders
- **TypeScript**: Full type safety throughout the application
- **Animations**: React Native Animated API for smooth transitions

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- Expo CLI
- iOS Simulator or Android Emulator (or physical device with Expo Go)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd mangrove-watch
```

2. **Set up Firebase** (Required for authentication and database)
   - Follow the [Firebase Setup Guide](./FIREBASE_SETUP.md)
   - Update `config/firebase.ts` with your Firebase configuration

3. Install dependencies:
```bash
npm install
```

4. Start the development server:
```bash
npm start
```

4. Run on your preferred platform:
```bash
# iOS
npm run ios

# Android
npm run android

# Web
npm run web
```

### Environment Setup

The app requires the following permissions:
- **Camera**: For taking photos
- **Photo Library**: For uploading existing photos
- **Location**: For GPS coordinate capture
- **SMS**: For sending text messages
- **Contacts**: For accessing device contacts

## Firebase Integration

The app uses Firebase for:
- **Authentication**: User registration, login, and session management
- **Database**: Firestore for storing user profiles, incident reports, and leaderboard data
- **Real-time Updates**: Live data synchronization across devices

### Key Features
- Secure user authentication with email/password
- Real-time leaderboard updates
- Incident report storage and retrieval
- User progress tracking and badge system
- Community statistics and analytics
- **Enhanced Location Services**: GPS coordinates with reverse geocoding for readable addresses
- **Location Display**: Shows city, state, country, and full address for each incident

### Database Collections
- `users`: User profiles, points, and badges
- `incidents`: Incident reports with photos, location (coordinates + address), and descriptions

## SMS Functionality Guide

### Overview
The SMS system provides comprehensive messaging capabilities for stakeholders involved in mangrove conservation efforts. Users can send messages to NGOs, government officials, and other community members.

### Core Features

#### 📱 SMS Tab Navigation
- **Compose Tab**: Main messaging interface with advanced features
- **History Tab**: View and manage SMS history
- **Templates Tab**: Browse and select message templates

#### 💬 Message Composition
- **Text Input**: Multi-line message composition with character count
- **Location Toggle**: Option to include current GPS coordinates
- **Manual Phone Numbers**: Direct input of phone numbers (comma-separated)
- **Contact Selection**: Choose from device contacts with search functionality

#### 👥 Contact Management
- **Device Contacts**: Access and search through phone contacts
- **Organization Filtering**: Filter contacts by NGO, Government, etc.
- **Contact Details**: View organization names and job titles
- **Multi-Selection**: Select multiple contacts for group messaging

#### 📝 Message Templates
Pre-built templates for common scenarios:
- **Emergency Response**: For urgent situations requiring immediate action
- **Incident Reports**: Notify about new mangrove destruction incidents
- **Conservation Updates**: Share progress on conservation efforts
- **Meeting Requests**: Schedule discussions about conservation strategies
- **Volunteer Coordination**: Organize community participation

#### 📋 SMS History
- **Message Tracking**: Complete history of sent messages
- **Status Indicators**: Success/failure status for each message
- **Recipient Information**: Track who received each message
- **Failed Numbers**: Identify numbers that failed to receive messages
- **Clear History**: Option to clear SMS history

#### 🔧 Advanced Features
- **Phone Validation**: Automatic phone number format validation
- **Multi-Country Support**: Enhanced formatting for different country codes
- **Error Handling**: Comprehensive error management and user feedback
- **Loading States**: Visual feedback during SMS operations
- **Permission Management**: Proper handling of SMS and contacts permissions

### Usage Examples

#### Sending an Emergency Alert
1. Navigate to SMS tab
2. Select "Emergency Response" template
3. Toggle location inclusion
4. Select relevant contacts (NGOs, government officials)
5. Send message with location coordinates

#### Reporting an Incident
1. Use "Urgent Incident Report" template
2. Add specific details about the incident
3. Include location for precise identification
4. Send to conservation authorities

#### Community Coordination
1. Use "Meeting Request" template
2. Customize with meeting details
3. Select community stakeholders
4. Send coordinated message

### Technical Implementation

#### Dependencies
- `expo-sms`: Core SMS functionality
- `expo-contacts`: Contact access and management
- `expo-location`: GPS coordinate capture

#### Service Architecture
- **SMSService**: Centralized SMS operations
- **Contact Management**: Contact loading, filtering, and validation
- **Message Templates**: Pre-built message system
- **History Tracking**: SMS history management
- **Location Integration**: GPS coordinate inclusion

#### Components
- **SMSMessaging**: Main SMS interface with tab navigation
- **SMSQuickSend**: Reusable component for quick SMS functionality
- **Contact Picker**: Modal for contact selection
- **Template Selector**: Template browsing and selection

### Security Features
- **Permission Management**: Explicit user consent for contacts and SMS
- **Phone Validation**: Input validation for phone numbers
- **Error Logging**: Secure error handling and logging
- **Data Privacy**: No SMS content stored on servers

## Project Structure

```
mangrove-watch/
├── app/                    # Main app screens
│   ├── (tabs)/           # Tab navigation
│   │   ├── sms.tsx       # SMS messaging screen
│   ├── report-incident.tsx # Incident reporting screen
│   └── leaderboard.tsx   # Community leaderboard
├── components/            # Reusable UI components
│   ├── ActionButton.tsx  # Main action buttons
│   ├── PhotoCapture.tsx  # Photo capture/upload
│   ├── LocationCapture.tsx # GPS location capture
│   ├── LeaderboardItem.tsx # Leaderboard entries
│   ├── SMSMessaging.tsx  # Main SMS interface
│   ├── SMSQuickSend.tsx  # Quick SMS component
│   └── FormInput.tsx     # Form input styling
├── config/                # Firebase configuration
│   └── firebase.ts       # Firebase initialization
├── contexts/              # React contexts
│   └── AuthContext.tsx   # Authentication state management
├── services/              # Firebase and SMS services
│   ├── firebaseService.ts # Database and auth operations
│   ├── smsService.ts     # SMS functionality and contact management
│   └── locationService.ts # GPS coordinates and reverse geocoding
├── constants/             # App constants and colors
└── hooks/                 # Custom React hooks
```

## Contributing

This is a community-driven project. Contributions are welcome!

### Development Guidelines
- Follow TypeScript best practices
- Maintain consistent styling with the design system
- Test on both iOS and Android platforms
- Ensure accessibility standards are met
- Test SMS functionality on physical devices

## Future Enhancements

- **Real-time Updates**: Live incident reporting and notifications
- **Offline Support**: Work without internet connection
- **Data Visualization**: Charts and maps for incident tracking
- **Community Features**: User profiles and social interactions
- **Push Notifications**: Alerts for new incidents or achievements
- **SMS Scheduling**: Schedule messages for later delivery
- **Group Messaging**: Create and manage contact groups
- **Message Analytics**: Track delivery rates and engagement
- **Multi-language Support**: Support for local languages in SMS templates

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For questions or support, please open an issue in the repository or contact the development team.

---

**Together, we can protect our precious mangrove ecosystems! 🌱🌊**
