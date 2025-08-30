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
- **Permissions**: Expo Image Picker, Expo Location
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

## Project Structure

```
mangrove-watch/
├── app/                    # Main app screens
│   ├── (tabs)/           # Tab navigation
│   ├── report-incident.tsx # Incident reporting screen
│   └── leaderboard.tsx   # Community leaderboard
├── components/            # Reusable UI components
│   ├── ActionButton.tsx  # Main action buttons
│   ├── PhotoCapture.tsx  # Photo capture/upload
│   ├── LocationCapture.tsx # GPS location capture
│   ├── LeaderboardItem.tsx # Leaderboard entries
│   └── FormInput.tsx     # Form input styling
├── config/                # Firebase configuration
│   └── firebase.ts       # Firebase initialization
├── contexts/              # React contexts
│   └── AuthContext.tsx   # Authentication state management
├── services/              # Firebase services
│   ├── firebaseService.ts # Database and auth operations
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

## Future Enhancements

- **Real-time Updates**: Live incident reporting and notifications
- **Offline Support**: Work without internet connection
- **Data Visualization**: Charts and maps for incident tracking
- **Community Features**: User profiles and social interactions
- **Push Notifications**: Alerts for new incidents or achievements

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For questions or support, please open an issue in the repository or contact the development team.

---

**Together, we can protect our precious mangrove ecosystems! 🌱🌊**
