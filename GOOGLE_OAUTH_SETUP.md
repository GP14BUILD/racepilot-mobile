# Google OAuth Setup for RacePilot Mobile App

This guide explains how to configure Google Sign-in for the RacePilot mobile app.

## Overview

Google Sign-in has been implemented in the mobile app with the following features:
- Sign in with existing Google account
- Sign up with Google (requires club code for new users)
- Seamless integration with backend OAuth endpoint
- Password visibility toggle on login/registration forms
- Feedback screen with category selection
- Interactive onboarding walkthrough for new users

## Current Status

✅ **Web Dashboard**: Google Sign-in is fully configured and working
✅ **Mobile App Code**: Google OAuth code is implemented
⚠️ **Google Cloud Console**: Needs Android OAuth client configuration

## Setup Required

To enable Google Sign-in in the mobile app, you need to add an **Android OAuth 2.0 Client ID** in Google Cloud Console:

### Step 1: Get your app's SHA-1 certificate fingerprint

For development builds:
```bash
cd C:\rp\racepilot-mobile
eas credentials
# Select: Android → Production → Keystore → View
# Copy the SHA-1 fingerprint
```

For local debug builds:
```bash
cd android/app
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
# Copy the SHA-1 fingerprint
```

### Step 2: Create Android OAuth Client ID

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Select your project (same one with Client ID: `48572885130-9pofupt5pdodpr9kam3mt9f13eqvo53v`)
3. Click **Create Credentials** → **OAuth client ID**
4. Select **Android** as application type
5. Fill in:
   - **Name**: RacePilot Android
   - **Package name**: `com.racepilot.mobile` (from app.json)
   - **SHA-1 certificate fingerprint**: Paste the fingerprint from Step 1
6. Click **Create**
7. Copy the **Client ID** (format: `XXXXXXXX.apps.googleusercontent.com`)

### Step 3: Update LoginScreen.tsx

Open `C:\rp\racepilot-mobile\LoginScreen.tsx` and update line 48:

```typescript
const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
  clientId: '48572885130-9pofupt5pdodpr9kam3mt9f13eqvo53v.apps.googleusercontent.com',
  androidClientId: 'YOUR_ANDROID_CLIENT_ID.apps.googleusercontent.com', // Add this line
});
```

Replace `YOUR_ANDROID_CLIENT_ID` with the Android Client ID from Step 2.

### Step 4: Rebuild the app

After updating the Client ID:
```bash
cd C:\rp\racepilot-mobile
eas build --platform android --profile production
```

Or for local development:
```bash
npm run android
```

## Testing Google Sign-in

1. Open the app and tap "Sign in with Google" or "Sign up with Google"
2. Select your Google account
3. For new users: Enter club code when prompted
4. You should be signed in and see the main app screens

## How It Works

### For Existing Users (Login)
1. User taps "Sign in with Google"
2. Google OAuth flow opens in browser
3. User selects their Google account
4. App receives Google ID token
5. Backend validates token and returns existing user
6. User is logged in automatically

### For New Users (Registration)
1. User taps "Sign up with Google"
2. Google OAuth flow opens in browser
3. User selects their Google account
4. App receives Google ID token
5. Backend detects new user and requests club code
6. App shows club code modal
7. User enters club code
8. Backend creates new account with Google email/name
9. User is registered and logged in

## Implemented Features

### 1. Password Visibility Toggle ✅
- Eye icon button on password fields
- Works on both login and registration forms
- Same functionality as web dashboard

### 2. Google Sign-in ✅
- OAuth 2.0 integration with expo-auth-session
- Handles both login and registration
- Club code modal for new users
- Error handling and user feedback
- Needs Android Client ID from Google Cloud Console

### 3. Feedback Screen ✅
- New tab in bottom navigation with 💬 icon
- Category selection (General, Bug, Feature, Question, Complaint)
- Name, email, subject, message fields
- Sends to backend `/feedback` endpoint
- Success/error alerts

### 4. Onboarding Walkthrough ✅
- 4-step interactive tutorial
- Appears on first login
- Stored in AsyncStorage
- Skip button available
- Explains: Welcome, Live Tracking, Course Setup, Analytics

## Files Modified

- `LoginScreen.tsx` - Added password toggle and Google OAuth
- `App.tsx` - Added FeedbackScreen and onboarding
- `FeedbackScreen.tsx` - New file
- `OnboardingWalkthrough.tsx` - New file
- `package.json` - Added expo-auth-session, expo-web-browser
- `app.json` - Added scheme: "racepilot"

## Backend Compatibility

The mobile app uses the same backend endpoints as the web dashboard:
- `POST /auth/google-signin` - Handles both login and registration
- `POST /feedback` - Stores user feedback
- Backend is already deployed and configured on Railway

## Troubleshooting

**"Google Sign-in failed"**
- Ensure you've added the Android Client ID in LoginScreen.tsx
- Verify the package name matches: `com.racepilot.mobile`
- Check SHA-1 fingerprint is correct in Google Cloud Console

**"Club code required" appears for existing users**
- This means the email doesn't exist in database
- User should use regular registration or contact support

**OAuth redirect not working**
- Ensure `scheme: "racepilot"` is in app.json
- Rebuild the app after adding the scheme

## Next Steps

1. Get SHA-1 fingerprint from EAS credentials
2. Create Android OAuth Client ID in Google Cloud Console
3. Update LoginScreen.tsx with Android Client ID
4. Rebuild and test the app
5. Submit updated build to Google Play Store
