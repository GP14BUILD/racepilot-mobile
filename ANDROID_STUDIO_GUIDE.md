# Building RacePilot Mobile in Android Studio

This guide will help you build and run the RacePilot mobile app in Android Studio.

## Prerequisites

1. **Android Studio** (latest version recommended)
   - Download from: https://developer.android.com/studio
   - **Includes JDK** - No need to install Java separately!

2. **Android SDK** installed with Android Studio:
   - Android SDK Platform 34 (or as specified in build.gradle)
   - Android SDK Build-Tools
   - Android Emulator (if testing on emulator)

3. **Node.js** and npm installed
   - Already installed (used to run the app)

**Note**: You do NOT need to install Java or configure JAVA_HOME separately. Android Studio includes its own JDK and will use it automatically.

## Project Setup

The native Android project has already been generated in the `android/` folder using `expo prebuild`.

### Project Structure
```
racepilot-mobile/
├── android/                    # Native Android project (generated)
│   ├── app/
│   │   ├── src/main/
│   │   │   ├── AndroidManifest.xml
│   │   │   ├── java/           # Kotlin/Java source files
│   │   │   └── res/            # Android resources
│   │   └── build.gradle        # App-level Gradle config
│   ├── gradle/                 # Gradle wrapper
│   ├── build.gradle            # Project-level Gradle config
│   └── settings.gradle         # Gradle settings
├── App.tsx                     # React Native app code
├── package.json
└── .env                        # Environment variables
```

## Opening in Android Studio

### Method 1: Open Existing Project (Recommended)

1. Launch **Android Studio**
2. Click **"Open"** or **"Open an Existing Project"**
3. Navigate to: `c:\Users\donne\Documents\racepilot\racepilot-mobile\android`
4. Click **"OK"**
5. Wait for Gradle to sync (this may take a few minutes on first open)

### Method 2: From Terminal

```bash
cd c:\Users\donne\Documents\racepilot\racepilot-mobile\android
studio .
```

## First-Time Setup in Android Studio

### 1. Gradle Sync
- Android Studio will automatically sync Gradle when you open the project
- If it doesn't, click **File → Sync Project with Gradle Files**
- Wait for sync to complete (check bottom status bar)

### 2. SDK Configuration
- If prompted, install any missing SDK components
- Go to **File → Project Structure → SDK Location**
- Verify Android SDK location is set correctly

### 3. Configure Android Emulator (if needed)
1. Go to **Tools → Device Manager**
2. Click **"Create Device"**
3. Select a device (e.g., Pixel 5)
4. Select a system image (e.g., Android 13 / API 33)
5. Click **"Finish"**

## Building and Running

### Run on Emulator

1. **Start the Metro bundler** in a separate terminal:
   ```bash
   cd c:\Users\donne\Documents\racepilot\racepilot-mobile
   npx expo start
   ```

2. In Android Studio:
   - Select your emulator from the device dropdown
   - Click the **Run** button (green play icon) or press `Shift + F10`

### Run on Physical Device

1. **Enable Developer Options** on your Android device:
   - Go to Settings → About Phone
   - Tap "Build Number" 7 times

2. **Enable USB Debugging**:
   - Go to Settings → Developer Options
   - Enable "USB Debugging"

3. **Connect device** via USB

4. **Start Metro bundler**:
   ```bash
   cd c:\Users\donne\Documents\racepilot\racepilot-mobile
   npx expo start
   ```

5. In Android Studio:
   - Your device should appear in the device dropdown
   - Click **Run**

### Alternative: Build from Command Line

If you prefer the command line, you can use:

```bash
cd c:\Users\donne\Documents\racepilot\racepilot-mobile

# Start Metro bundler in background
npx expo start &

# Run on Android (will build and install)
npx expo run:android
```

## Building APK for Testing

### Debug APK

In Android Studio:
1. Go to **Build → Build Bundle(s) / APK(s) → Build APK(s)**
2. Wait for build to complete
3. APK will be at: `android/app/build/outputs/apk/debug/app-debug.apk`

Or via terminal:
```bash
cd android
./gradlew assembleDebug
```

### Release APK (Not Production-Ready)

**Warning**: The current release build uses the debug keystore. For production, you need to generate a proper signing key.

```bash
cd android
./gradlew assembleRelease
```

Output: `android/app/build/outputs/apk/release/app-release.apk`

## Important Configuration Details

### Permissions
All required permissions are configured in [AndroidManifest.xml](android/app/src/main/AndroidManifest.xml):
- Location (foreground and background)
- Bluetooth (scan and connect)
- Internet access
- Foreground service

### Package Name
- Application ID: `com.racepilot.mobile`
- Defined in: `android/app/build.gradle` line 92

### Backend API URL
- Configured in: `.env`
- Default: `EXPO_PUBLIC_API_URL=http://127.0.0.1:8000`

**For Android Emulator**: Change to `http://10.0.2.2:8000`
**For Physical Device**: Change to your computer's local IP (e.g., `http://192.168.1.100:8000`)

## Troubleshooting

### Gradle Sync Fails

1. **Clear Gradle cache**:
   ```bash
   cd android
   ./gradlew clean
   ```

2. **Invalidate Android Studio caches**:
   - File → Invalidate Caches → Invalidate and Restart

3. **Check Gradle version**:
   - Make sure you have the correct Gradle version
   - Check `android/gradle/wrapper/gradle-wrapper.properties`

### Metro Bundler Issues

```bash
# Clear Metro cache
npx expo start -c

# Or clear node modules
cd racepilot-mobile
rm -rf node_modules
npm install
```

### App Crashes on Launch

1. **Check Logcat** in Android Studio (View → Tool Windows → Logcat)
2. **Verify backend is running**:
   ```bash
   cd racepilot-backend
   uvicorn app.main:app --reload
   ```
3. **Check .env file** has correct API URL

### Bluetooth Not Working in Emulator

- Bluetooth Low Energy (BLE) is **not supported in Android emulators**
- You **must test Bluetooth features on a physical device**
- GPS/Location can be simulated in emulator

### Build Errors

1. **Clean build**:
   ```bash
   cd android
   ./gradlew clean
   ./gradlew assembleDebug
   ```

2. **Delete build folders**:
   ```bash
   rm -rf android/app/build
   rm -rf android/build
   ```

3. **Sync Gradle again** in Android Studio

## Debugging in Android Studio

### Enable Debugging

1. Run the app on device/emulator
2. In Android Studio: **Run → Attach Debugger to Android Process**
3. Select your app process

### View Logs

- **Logcat**: View → Tool Windows → Logcat
- Filter by package: `com.racepilot.mobile`
- Or use `npx react-native log-android` in terminal

### React Native Debugger

1. Shake the device or press `Ctrl+M` (emulator) to open dev menu
2. Select "Debug"
3. Chrome DevTools will open at http://localhost:8081/debugger-ui

## Building for Production

For production builds, you need to:

1. **Generate a release keystore**:
   ```bash
   keytool -genkeypair -v -storetype PKCS12 -keystore racepilot-release.keystore -alias racepilot -keyalg RSA -keysize 2048 -validity 10000
   ```

2. **Update `android/app/build.gradle`**:
   ```gradle
   signingConfigs {
       release {
           storeFile file('racepilot-release.keystore')
           storePassword 'your-password'
           keyAlias 'racepilot'
           keyPassword 'your-password'
       }
   }
   ```

3. **Build release APK**:
   ```bash
   cd android
   ./gradlew assembleRelease
   ```

4. **Or build AAB for Google Play**:
   ```bash
   cd android
   ./gradlew bundleRelease
   ```

**Note**: Consider using [Expo Application Services (EAS)](https://expo.dev/eas) for easier production builds and distribution.

## Useful Commands

```bash
# Start Metro bundler
npx expo start

# Run on Android
npx expo run:android

# Clean and rebuild
cd android && ./gradlew clean && ./gradlew assembleDebug

# Check for build errors
cd android && ./gradlew build --stacktrace

# List connected devices
adb devices

# Install APK manually
adb install android/app/build/outputs/apk/debug/app-debug.apk

# View app logs
adb logcat | grep "com.racepilot.mobile"

# Uninstall app
adb uninstall com.racepilot.mobile
```

## Updating Native Code

If you make changes to `app.json` or add new native dependencies:

1. **Regenerate native projects**:
   ```bash
   npx expo prebuild --clean
   ```

2. **Reopen in Android Studio** and sync Gradle

## Resources

- [Expo Documentation](https://docs.expo.dev)
- [React Native Documentation](https://reactnative.dev)
- [Android Developer Guide](https://developer.android.com)
- [Gradle Build Tool](https://gradle.org)

## Need Help?

- Check the main [README.md](README.md) for app-specific documentation
- Review backend setup: [../racepilot-backend/README.md](../racepilot-backend/README.md)
- Expo troubleshooting: https://docs.expo.dev/troubleshooting/overview/
