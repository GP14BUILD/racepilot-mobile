# RacePilot User Guide

Complete guide for sailors using the RacePilot app.

---

## Getting Started

### Step 1: Download the App

1. Open **Google Play Store** on your Android phone
2. Search for **"RacePilot"**
3. Tap **Install**
4. Wait for download to complete
5. Tap **Open**

---

## First Time Setup

### Step 2: Grant Permissions

When you open RacePilot for the first time, you'll be asked for permissions:

#### Location Permission
1. Tap **"START SESSION"**
2. You'll see: "RacePilot wants to access your location"
3. Tap **"While using the app"** or **"Allow"**
4. Then you'll see: "Allow RacePilot to access location in the background?"
5. Tap **"Allow all the time"** (required for continuous tracking during races)

**Why we need this**: RacePilot tracks your GPS position during sailing sessions. Background permission ensures tracking continues even if you check messages or use other apps while sailing.

#### Bluetooth Permission (Optional)
1. If you have a Bluetooth wind sensor, tap **"Scan for Devices"**
2. You'll see: "RacePilot wants to use Bluetooth"
3. Tap **"Allow"**

**Why we need this**: To connect to your Bluetooth wind sensor for wind speed and angle data.

---

## Using RacePilot

### Step 3: Start Your First Session

1. **Make sure you're outdoors** (GPS needs clear sky view)
2. Tap the big **"START SESSION"** button
3. Wait a few seconds for GPS to lock on
4. You should see your GPS coordinates appear

### What You'll See

**GPS Data Section:**
- **Latitude**: Your north-south position
- **Longitude**: Your east-west position
- **Speed (SOG)**: Speed Over Ground in knots
- **Heading (COG)**: Course Over Ground in degrees
- **Heading (HDG)**: Compass heading in degrees

**Wind Data Section (if connected):**
- **AWS**: Apparent Wind Speed
- **AWA**: Apparent Wind Angle
- **TWS**: True Wind Speed (calculated)
- **TWA**: True Wind Angle (calculated)

**Telemetry Stats:**
- **Points Sent**: Number of GPS positions recorded
- **Batches Sent**: Number of data transmissions to server

### Step 4: During Your Sailing Session

**What happens automatically:**
- RacePilot records your GPS position every second
- All data is sent to the cloud for analysis
- Tracking continues even if you minimize the app
- Battery efficient background tracking

**What you can do:**
- Check your current speed and heading
- Monitor wind conditions (if sensor connected)
- See how many data points have been recorded

**Tips:**
- Keep your phone secure (waterproof case recommended)
- Phone can be in your pocket or bag
- Tracking continues as long as session is active
- Data is saved automatically

### Step 5: Stop Your Session

When you finish sailing:
1. Tap **"STOP SESSION"**
2. Your data is saved automatically
3. You can view your session on the dashboard (coming soon)

---

## Connecting a Bluetooth Wind Sensor

### What You Need
- A Bluetooth-enabled marine wind sensor
- Examples: B&G Wireless Wind, Calypso Ultrasonic, or compatible NMEA wind instruments

### How to Connect

1. **Turn on your wind sensor** (check it's in pairing mode)
2. In RacePilot, scroll to **"Wind Sensor"** section
3. Tap **"Scan for Devices"**
4. Wait for devices to appear
5. Tap your wind sensor in the list
6. Wait for "Connected" message
7. Wind data should start appearing

**Troubleshooting Wind Sensor:**
- Make sure sensor is powered on
- Sensor must be within 10 meters (30 feet)
- Some sensors need to be put in pairing mode (check manual)
- Try turning Bluetooth off and on in your phone settings

---

## Requirements

### What You Need
- **Android phone** (version 5.0 or higher)
- **GPS enabled** (in phone settings)
- **Internet connection** (WiFi or mobile data)
- **Clear sky view** for GPS accuracy
- **Bluetooth wind sensor** (optional but recommended)

### Battery Life
- GPS tracking uses battery
- Expect 4-6 hours of continuous tracking
- Recommend bringing a portable charger for long races
- Battery saver mode may affect GPS accuracy

---

## Understanding Your Data

### Speed Over Ground (SOG)
- Your actual speed through the water
- Measured in knots (nautical miles per hour)
- Updated every second

### Course Over Ground (COG)
- The direction you're actually moving
- 0° = North, 90° = East, 180° = South, 270° = West
- Different from heading if you're drifting

### Heading (HDG)
- The direction your boat is pointing
- Shows where bow is aimed
- May differ from COG due to current or leeway

### Wind Data
- **AWS (Apparent Wind Speed)**: Wind speed you feel on the boat
- **AWA (Apparent Wind Angle)**: Wind direction relative to boat
- **TWS (True Wind Speed)**: Actual wind speed (calculated)
- **TWA (True Wind Angle)**: True wind direction (calculated)

---

## Privacy and Data

### What We Track
- GPS coordinates during active sessions only
- Wind sensor data (if connected)
- Device ID to link your sessions

### What We Don't Track
- Your identity or personal information
- Your location when not in an active session
- Any data when app is not running

### Your Data Rights
- You can request your data at any time
- You can request deletion of your data
- See our Privacy Policy for details

---

## Troubleshooting

### "GPS Not Available" or No Coordinates

**Problem**: GPS not working

**Solutions**:
1. Make sure you're outdoors with clear sky view
2. Check Location is enabled in phone settings:
   - Settings → Location → Turn ON
3. Check RacePilot has location permission:
   - Settings → Apps → RacePilot → Permissions → Location → "Allow all the time"
4. Restart your phone
5. Wait 1-2 minutes for GPS to lock on (first time can be slow)

### "Network Request Failed"

**Problem**: Can't connect to server

**Solutions**:
1. Check you have internet connection (WiFi or mobile data)
2. Try turning WiFi off and on
3. Try switching between WiFi and mobile data
4. Check if other apps can access internet
5. Restart the app

### Bluetooth Not Finding Sensor

**Problem**: Can't see wind sensor

**Solutions**:
1. Make sure sensor is powered on
2. Check sensor is in pairing mode (check sensor manual)
3. Move closer to sensor (within 10m/30ft)
4. Turn Bluetooth off and on in phone settings
5. Restart the app
6. Check sensor battery

### Location Permission Denied

**Problem**: Accidentally denied location permission

**Solution**:
1. Go to phone Settings → Apps
2. Find RacePilot
3. Tap Permissions
4. Tap Location
5. Select "Allow all the time"
6. Restart the app

### App Stops Tracking in Background

**Problem**: Tracking stops when phone screen is off

**Solutions**:
1. Check battery saver is OFF during sailing:
   - Settings → Battery → Battery Saver → OFF
2. Allow RacePilot to run in background:
   - Settings → Apps → RacePilot → Battery → "Unrestricted"
3. Check Location permission is "Allow all the time" (not "While using")

### High Battery Drain

**Problem**: Battery draining too fast

**Tips**:
- GPS tracking uses battery - this is normal
- Reduce screen brightness
- Close other apps
- Bring a portable charger
- Consider airplane mode with GPS on (blocks calls/texts but saves battery)

---

## Tips for Best Results

### Before You Sail
- [ ] Charge your phone fully
- [ ] Enable location services
- [ ] Test GPS works (see coordinates appear)
- [ ] Connect wind sensor (if using)
- [ ] Bring portable charger
- [ ] Use waterproof case/bag

### During Sailing
- [ ] Start session before leaving dock
- [ ] Keep phone in waterproof case
- [ ] Phone can be in pocket or bag
- [ ] Check occasionally that tracking is active
- [ ] Don't force quit the app

### After Sailing
- [ ] Stop session when done
- [ ] Check data was recorded (see stats)
- [ ] Charge phone for next session

---

## Frequently Asked Questions

### Do I need internet during sailing?

**Yes**, RacePilot needs internet to send data to the server. You can use:
- Mobile data (recommended)
- WiFi (if available at marina)

Data usage is minimal (approximately 1-2 MB per hour).

### Can I use RacePilot offline?

**Not currently**. The app requires internet connection to save your session data. Offline mode is planned for future updates.

### Does RacePilot work on iPhone?

**Not yet**. Currently Android only. iPhone version is planned for the future.

### Do I need a wind sensor?

**No**, wind sensor is optional. RacePilot works great with just GPS for tracking your position, speed, and course. Wind sensor adds extra data for analysis.

### How accurate is the GPS?

GPS accuracy is typically 3-5 meters (10-15 feet) with clear sky view. Accuracy can be affected by:
- Tall buildings or mountains
- Heavy tree cover
- Indoor use (won't work)
- Weather conditions

### Will this work for dinghy racing?

**Yes!** RacePilot works for all types of sailing:
- Dinghy racing
- Keelboat racing
- Cruising
- Day sailing
- Regattas

### How much data does it use?

Very little! Approximately:
- 1-2 MB per hour of sailing
- 10-20 MB for a typical race day

### Can I see my past sessions?

**Coming soon!** Web dashboard is under development where you'll be able to:
- View all past sessions
- Replay your tracks on a map
- Compare performance across races
- Download your data

### Is my data private?

**Yes**. Your location is only tracked during active sessions. We don't sell or share your data. See our Privacy Policy for details.

### What if I have other apps open?

**No problem!** RacePilot continues tracking in the background. You can:
- Check messages
- Take photos
- Use other apps
- Turn off screen

Just don't force quit RacePilot!

### Why does it need "Allow all the time" permission?

Sailing sessions last hours. "Allow all the time" ensures tracking continues when:
- Screen is off
- Phone is in pocket
- You're using other apps
- You check messages or photos

This is essential for uninterrupted race tracking.

---

## Safety Reminders

### While Sailing
- Focus on sailing, not your phone
- Secure your phone properly
- Use waterproof protection
- RacePilot is for performance tracking, not navigation
- Always use proper navigation equipment
- Don't rely on app for safety

### Emergency
- In emergency, always call for help first
- Use VHF radio or phone call
- RacePilot is not a safety device
- Always follow proper safety procedures

---

## Getting Help

### Need Support?

**Email**: [INSERT YOUR SUPPORT EMAIL]
**Website**: [INSERT YOUR WEBSITE]

### Report a Bug

If something isn't working:
1. Note what you were doing when it happened
2. Check this troubleshooting guide first
3. Email us with:
   - Phone model
   - Android version
   - What happened
   - Screenshots if possible

### Feature Requests

Have an idea? We'd love to hear it! Email your suggestions to [INSERT YOUR SUPPORT EMAIL]

---

## Coming Soon

Features we're working on:
- [ ] Web dashboard to view past sessions
- [ ] Race replay on interactive map
- [ ] Performance analytics
- [ ] Compare races
- [ ] Export data (GPX, CSV)
- [ ] Start line timer
- [ ] Mark rounding tracker
- [ ] Wind shift detection
- [ ] Tactical recommendations
- [ ] Multi-boat tracking (racing against friends)

---

## Quick Reference

### Starting a Session
1. Open RacePilot
2. Tap "START SESSION"
3. Wait for GPS lock
4. Start sailing!

### Stopping a Session
1. Tap "STOP SESSION"
2. Data saved automatically
3. Done!

### Connecting Wind Sensor
1. Power on sensor
2. Tap "Scan for Devices"
3. Select your sensor
4. Wait for "Connected"

### Checking Permissions
Settings → Apps → RacePilot → Permissions → Location → "Allow all the time"

---

## Welcome Aboard!

Thank you for using RacePilot! We're excited to help you track your sailing performance and improve your racing.

**Fair winds and following seas!** ⛵

---

**App Version**: 1.0.0
**Last Updated**: [INSERT DATE]

For the latest updates and documentation, visit [INSERT YOUR WEBSITE]
