# RacePilot Mobile App

React Native/Expo mobile application for tracking sailing sessions with GPS and Bluetooth wind sensor integration.

## Features

- **GPS Tracking**: High-precision location tracking with background support
- **Bluetooth Wind Sensor**: Connect to marine wind instruments via Bluetooth Low Energy
- **Session Management**: Start/stop sailing sessions with automatic telemetry streaming
- **Telemetry Batching**: Efficient data batching and streaming to backend API
- **Real-time Display**: Live GPS coordinates, speed, heading, and wind data

## Setup

### Prerequisites

- Node.js 16+ and npm
- Expo CLI
- iOS Simulator (Mac) or Android emulator/device
- RacePilot backend running at http://127.0.0.1:8000

### Installation

```bash
cd racepilot-mobile
npm install
```

### Configuration

The `.env` file is already configured with:
```
EXPO_PUBLIC_API_URL=http://127.0.0.1:8000
```

Update this if your backend is running on a different URL.

## Running the App

### Start Expo Development Server

```bash
npx expo start
```

This will open the Expo Developer Tools in your browser.

### Run on iOS

```bash
npx expo start --ios
```

Or press `i` in the Expo Developer Tools.

### Run on Android

```bash
npx expo start --android
```

Or press `a` in the Expo Developer Tools.

### Run on Web

```bash
npx expo start --web
```

Note: Bluetooth features won't work on web.

## Testing

1. **Start the Backend**
   ```bash
   cd ../racepilot-backend
   uvicorn app.main:app --reload
   ```

2. **Start the Mobile App**
   ```bash
   cd ../racepilot-mobile
   npx expo start
   ```

3. **Test GPS Tracking**
   - Open the app on your device/emulator
   - Tap "Start Session"
   - Grant location permissions
   - Walk or drive around to generate GPS data
   - Watch telemetry stats update in real-time

4. **Test Bluetooth Wind Sensor**
   - Tap "Scan for Devices" in the Wind Sensor section
   - Select your wind sensor from the list
   - View live wind data (AWS, AWA, TWS, TWA)

   Note: For MVP, wind data is simulated. To connect a real sensor, you'll need to update the `monitorWindSensor()` function in App.tsx with your sensor's BLE service and characteristic UUIDs.

5. **Verify Backend Data**
   - Open http://127.0.0.1:8000/docs
   - Check `/sessions` endpoint to see your session
   - Check telemetry data is being ingested via `/telemetry/ingest`

## Project Structure

```
racepilot-mobile/
├── App.tsx              # Main app with GPS, BLE, and telemetry logic
├── types.ts             # TypeScript types matching backend API
├── app.json             # Expo config with permissions
├── .env                 # Environment variables
├── package.json         # Dependencies
└── README.md           # This file
```

## Key Components

### GPS Tracking
- Uses `expo-location` for foreground and background tracking
- Tracks at 1-second intervals or 1-meter distance changes
- Converts speed from m/s to knots for sailing

### Bluetooth Wind Sensor
- Uses `react-native-ble-plx` for BLE connectivity
- Scans for devices with "wind" in their name
- Currently simulates wind data (customize for your sensor)

### Telemetry Batching
- Buffers up to 10 track points
- Flushes every 5 seconds or when buffer is full
- Automatic retry on network failure

### Session Management
- Creates sessions via backend API
- Tracks session ID and stats
- Graceful shutdown with final data flush

## Customization

### Backend URL
Edit `.env` to change the backend URL:
```
EXPO_PUBLIC_API_URL=http://your-backend-url:8000
```

### Telemetry Settings
Edit `App.tsx` constants:
```typescript
const BATCH_SIZE = 10;        // Points per batch
const BATCH_INTERVAL = 5000;  // Milliseconds
```

### Wind Sensor Integration
Update `monitorWindSensor()` in `App.tsx` with your sensor's UUIDs:
```typescript
// Example for NMEA wind sensor
const SERVICE_UUID = '0000xxxx-0000-1000-8000-00805f9b34fb';
const CHARACTERISTIC_UUID = '0000xxxx-0000-1000-8000-00805f9b34fb';

device.monitorCharacteristicForService(
  SERVICE_UUID,
  CHARACTERISTIC_UUID,
  (error, characteristic) => {
    // Parse wind data from characteristic.value
  }
);
```

## Permissions

### iOS
- Location (always, when in use)
- Bluetooth
- Background location updates

### Android
- Fine location
- Background location
- Bluetooth scan/connect (Android 12+)
- Foreground service
- Internet access

All permissions are configured in [app.json](app.json:15-63).

## Troubleshooting

### Location Not Working
- Check permissions in device settings
- On iOS simulator, use Debug → Location → Custom Location
- On Android emulator, use Extended Controls → Location

### Bluetooth Not Scanning
- Ensure Bluetooth is enabled on device
- Grant Bluetooth permissions
- Check device supports BLE
- For Android 12+, ensure BLUETOOTH_SCAN permission granted

### Backend Connection Failed
- Verify backend is running at the configured URL
- For Android emulator, use `10.0.2.2:8000` instead of `127.0.0.1:8000`
- For iOS simulator, use `localhost:8000` or your Mac's IP
- For physical device, use your computer's local IP (e.g., `192.168.1.100:8000`)

### App Won't Start
```bash
# Clear Expo cache
npx expo start -c

# Reinstall dependencies
rm -rf node_modules
npm install
```

## Next Steps

- [ ] Implement real wind sensor BLE integration
- [ ] Add offline data storage with AsyncStorage
- [ ] Implement race timer and start line features
- [ ] Add tactical analytics display
- [ ] Improve UI/UX with navigation
- [ ] Add user authentication
- [ ] Build production iOS/Android apps

## Building for Production

### For Testing (Standalone APK)

Build a standalone APK that works without Expo Go:

```bash
.\build-apk-fixed.bat
```

Output: `android\app\build\outputs\apk\release\app-release.apk`

See [GETTING-STARTED.md](GETTING-STARTED.md) for complete beginner instructions.

### For Google Play Store (AAB)

Build an Android App Bundle for Play Store submission:

```bash
.\build-aab.bat
```

Output: `android\app\build\outputs\bundle\release\app-release.aab`

See [PLAY_STORE_GUIDE.md](PLAY_STORE_GUIDE.md) for complete publishing instructions.

### Using EAS Build (Alternative)

Cloud-based builds with Expo Application Services:

```bash
npm install -g eas-cli
eas build --platform android
eas build --platform ios
```

Requires EAS account. See: https://docs.expo.dev/build/introduction/

## Documentation

### For End Users
- **[QUICK_START.md](QUICK_START.md)** - 3-minute quick start guide for sailors
- **[USER_GUIDE.md](USER_GUIDE.md)** - Complete user manual with troubleshooting

### For Developers & Builders
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - System architecture and how everything works together
- **[GETTING-STARTED.md](GETTING-STARTED.md)** - Complete beginner's guide for building and installing the app
- **[ANDROID_STUDIO_GUIDE.md](ANDROID_STUDIO_GUIDE.md)** - Detailed Android Studio instructions
- **[DISTRIBUTION.md](DISTRIBUTION.md)** - Building APKs for distribution

### For Publishing
- **[BACKEND_DEPLOYMENT.md](BACKEND_DEPLOYMENT.md)** - Deploy backend to cloud (REQUIRED for Play Store!)
- **[PLAY_STORE_CHECKLIST.md](PLAY_STORE_CHECKLIST.md)** - Quick checklist for Play Store submission
- **[PLAY_STORE_GUIDE.md](PLAY_STORE_GUIDE.md)** - Complete publishing guide
- **[PRIVACY_POLICY_TEMPLATE.md](PRIVACY_POLICY_TEMPLATE.md)** - Privacy policy template

### Navigation
- **[DOCUMENTATION_INDEX.md](DOCUMENTATION_INDEX.md)** - Complete documentation index and navigation guide

## Support

For issues or questions, check:
- Backend README: `../racepilot-backend/README.md`
- Expo docs: https://docs.expo.dev
- React Native BLE: https://github.com/dotintent/react-native-ble-plx
