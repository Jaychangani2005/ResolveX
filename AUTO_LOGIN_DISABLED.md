# Auto-Login Disabled

## Overview
Auto-login functionality has been disabled in the Mangrove Watch app. Users must now sign up and login manually each time they open the app.

## Changes Made

### 1. AuthContext.tsx
- **Disabled auto-login**: Removed the `loadUserFromStorage` function that automatically restored user sessions from local storage
- **Modified useEffect**: Changed from loading user data to simply initializing auth state without auto-login
- **Updated comments**: Added clear documentation that auto-login is disabled

### 2. Splash Screen (splash.tsx)
- **Removed user dependency**: No longer checks for existing user to auto-navigate
- **Simplified routing**: Always redirects to login page after splash animation
- **Updated comments**: Clear indication that auto-login is disabled

## Current Behavior

### Before (Auto-login enabled):
- App automatically restored user sessions from local storage
- Users could bypass login if they had previously signed up
- App would auto-navigate to appropriate dashboard based on user role

### After (Auto-login disabled):
- App starts fresh each time with no user session
- Users must manually login with email/password each time
- No automatic session restoration
- Splash screen always redirects to login page

## Benefits

1. **Security**: Users cannot access the app without proper authentication
2. **Control**: Only users who explicitly sign up and login can access the app
3. **Fresh sessions**: Each app launch requires fresh authentication
4. **No bypass**: Users cannot accidentally access the app without going through proper signup/login flow

## Technical Details

- Local storage functions (`saveUserToStorage`, `clearUserFromStorage`) are still available for normal login/signup sessions
- User state management remains intact for active sessions
- Only the automatic restoration of sessions on app startup is disabled
- Login and signup flows work exactly the same as before

## User Experience

- **First time users**: Must sign up to create an account
- **Returning users**: Must login with email/password each time
- **Session management**: Users stay logged in during the same app session
- **App restart**: Requires fresh login

## Files Modified

1. `contexts/AuthContext.tsx` - Disabled auto-login logic
2. `app/splash.tsx` - Simplified routing to always go to login
3. `AUTO_LOGIN_DISABLED.md` - This documentation file

## Testing

To verify auto-login is disabled:
1. Sign up or login to the app
2. Close the app completely
3. Reopen the app
4. Verify you are redirected to login page instead of auto-logging in
5. Verify you must enter credentials again to access the app
