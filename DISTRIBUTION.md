# RacePilot - Building for Distribution

This guide shows how to build a standalone APK that users can install without Expo Go.

## Quick Build

Simply run:
```bash
build-apk.bat
```

This will:
1. Generate a signing key (first time only)
2. Build a release APK
3. Open the folder with your APK

## Manual Build Steps

### 1. Generate Signing Key (One Time)

```bash
cd android/app
keytool -genkeypair -v -storetype PKCS12 -keystore racepilot-release.keystore -alias racepilot-key -keyalg RSA -keysize 2048 -validity 10000
```

**Remember your password!** You'll need it every time you build.

### 2. Build Release APK

```bash
cd android
gradlew assembleRelease
```

Or in Android Studio:
- **Build → Generate Signed Bundle / APK**
- Select **APK**
- Choose the keystore you created
- Click **Build**

### 3. Find Your APK

The APK will be at:
```
android/app/build/outputs/apk/release/app-release.apk
```

## Installing on Phones

### Method 1: Direct Transfer
1. Copy `app-release.apk` to the phone (via USB, email, cloud storage, etc.)
2. On the phone, tap the APK file
3. Enable "Install from unknown sources" if prompted
4. Tap "Install"

### Method 2: QR Code
1. Upload the APK to a web server or cloud storage
2. Generate a QR code for the download link
3. Users scan the QR code and install

### Method 3: Google Play Store (Production)
For official release:
1. Sign up for [Google Play Console](https://play.google.com/console)
2. Create an app listing
3. Upload your APK or AAB (see below)
4. Submit for review

## Building AAB for Google Play

Google Play requires AAB (Android App Bundle) format:

```bash
cd android
gradlew bundleRelease
```

Output: `android/app/build/outputs/bundle/release/app-release.aab`

## Current Configuration

- **Package**: com.racepilot.mobile
- **Version**: 1.0.0
- **Signing**: racepilot-release.keystore
- **Permissions**: GPS, Bluetooth, Internet, Background Location

## Updating the App

When you make changes:

1. **Update version** in `app.json`:
   ```json
   "version": "1.0.1"
   ```

2. **Rebuild**:
   ```bash
   npx expo prebuild --clean
   build-apk.bat
   ```

3. **Distribute** the new APK

## Backend URL Configuration

The APK is currently configured to connect to:
```
http://192.168.4.103:8000
```

**For production**, update `.env` before building:
```
EXPO_PUBLIC_API_URL=https://your-production-api.com
```

Then rebuild the APK.

## Troubleshooting

### "Keystore not found"
Run the keytool command again to generate the keystore.

### "Build failed"
- Make sure Android Studio is installed
- Try cleaning: `cd android && gradlew clean`
- Check Java is accessible

### "Installation blocked"
On the phone:
- Settings → Security → Enable "Install from unknown sources"
- Or Settings → Apps → Special access → Install unknown apps

## Security Notes

**IMPORTANT**:
- **NEVER commit your keystore** to git
- **BACKUP your keystore** - you can't update the app without it!
- **Use environment variables** for passwords in production
- The default password `racepilot123` is for development only

## Next Steps

- [ ] Build your first release APK
- [ ] Test installation on a clean device
- [ ] Set up production backend API
- [ ] Update API URL for production
- [ ] Create Google Play listing
- [ ] Submit to Play Store

## Using EAS Build (Alternative)

For easier cloud builds:

```bash
npm install -g eas-cli
eas login
eas build --platform android
```

Benefits:
- Build in the cloud (no local setup needed)
- Automatic signing
- Direct Play Store submission
- Build for iOS too (requires Mac or EAS)

See: https://docs.expo.dev/build/introduction/
