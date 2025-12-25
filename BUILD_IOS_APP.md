# RacePilot iOS App - Build & Deploy Guide

## Prerequisites

### 1. Apple Developer Account
- **Cost:** $99/year
- **Sign up:** https://developer.apple.com/programs/enroll/
- **Required for:** TestFlight testing and App Store submission

### 2. Install EAS CLI (if not already installed)
```bash
npm install -g eas-cli
```

### 3. Login to Expo
```bash
eas login
```

---

## Building the iOS App

### Option 1: Build for TestFlight (Recommended First Step)

TestFlight allows you to test the app on real iPhones before publishing to the App Store.

```bash
cd racepilot-mobile
eas build --platform ios --profile production
```

**What happens:**
1. EAS builds your app in the cloud (no Mac required!)
2. You'll be prompted to set up iOS credentials
3. EAS will create/manage certificates and provisioning profiles
4. Build takes 10-20 minutes
5. You get a download link for the `.ipa` file

### Option 2: Build for Local Testing
```bash
eas build --platform ios --profile development
```

---

## Submitting to App Store

### Step 1: Create App in App Store Connect

1. Go to https://appstoreconnect.apple.com
2. Click "My Apps" → "+" → "New App"
3. Fill in:
   - **Platform:** iOS
   - **Name:** RacePilot
   - **Primary Language:** English (UK)
   - **Bundle ID:** `com.racepilot.mobile` (already configured)
   - **SKU:** racepilot-mobile

### Step 2: Submit Build to App Store Connect
```bash
eas submit --platform ios --latest
```

Or upload manually:
1. Download the `.ipa` from the EAS build
2. Use Transporter app (Mac) or Application Loader
3. Upload to App Store Connect

### Step 3: Configure App Store Listing

In App Store Connect, configure:

#### App Information
- **Subtitle:** Professional GPS Sailing Analytics
- **Category:** Sports
- **Secondary Category:** Navigation
- **Content Rights:** "Contains Third-Party Content" (maps)

#### Privacy Policy
```
https://race-pilot.app/privacy
```

#### Support URL
```
https://race-pilot.app
```

#### Marketing URL
```
https://race-pilot.app
```

#### App Description
```
RacePilot transforms your iPhone into a professional sailing race analyzer.

REAL-TIME GPS TRACKING
• 10Hz GPS precision tracks every tack, gybe, and mark rounding
• Live speed, heading, and course data
• Automatic session recording

PERFORMANCE ANALYTICS
• AI-powered maneuver detection
• Personalized coaching insights
• Fleet comparison with club mates
• Detailed race replay and analysis

HARDWARE INTEGRATION
• Connect Garmin Glo 2 GPS for maximum precision
• Bluetooth wind sensor support (coming soon)
• Works with phone GPS or external devices

PROFESSIONAL FEATURES
• Export sessions for detailed web analysis
• Share sessions with coaches and teammates
• Club-based fleet comparison
• Race replay on web dashboard

Perfect for dinghy racing, keelboat racing, and training sessions.

Join sailing clubs worldwide using RacePilot for performance analysis.
```

#### Keywords
```
sailing, racing, gps, yacht, dinghy, navigation, tracking, analytics, sports
```

#### Screenshots Required
- 6.7" Display (iPhone 14 Pro Max): at least 3 screenshots
- 5.5" Display (iPhone 8 Plus): at least 3 screenshots

**Recommendation:** Create screenshots showing:
1. Live tracking screen with GPS data
2. Course setup screen
3. Session history/dashboard
4. Race replay/analytics

### Step 4: App Review Information

#### Demo Account Credentials
Provide test credentials for App Review:
```
Email: reviewer@race-pilot.app
Password: ReviewTest123!
Club Code: DEMO
```

**Note:** Make sure to create this demo account before submission!

#### Age Rating
- **Violence:** None
- **Realistic Violence:** None
- **Profanity or Crude Humor:** None
- **Mature/Suggestive Themes:** None
- **Horror/Fear Themes:** None
- **Medical/Treatment Information:** None
- **Alcohol, Tobacco, or Drug Use:** None
- **Gambling:** None
- **Sexual Content or Nudity:** None
- **Unrestricted Web Access:** No
- **Gambling & Contests:** No

**Result:** Rated 4+

---

## Testing Before Submission

### TestFlight Beta Testing

1. **Internal Testing (Apple Developer Team)**
   ```bash
   # After build completes, it appears in App Store Connect automatically
   ```
   - Go to App Store Connect → TestFlight
   - Add internal testers (up to 100)
   - Testers receive email with TestFlight link

2. **External Testing (Public Beta)**
   - Create External Test Group
   - Add up to 10,000 external testers
   - Requires Beta App Review (1-2 days)

### Invite Testers
Share TestFlight public link:
```
https://testflight.apple.com/join/YOURCODE
```

---

## Quick Commands Reference

```bash
# Build production iOS app
eas build --platform ios --profile production

# Build both iOS and Android
eas build --platform all --profile production

# Submit to App Store
eas submit --platform ios --latest

# Check build status
eas build:list

# View build logs
eas build:view <BUILD_ID>
```

---

## App Store Review Timeline

1. **Upload Build:** Instant
2. **Processing:** 10-30 minutes
3. **Waiting for Review:** 1-3 days
4. **In Review:** 1-24 hours
5. **Pending Release:** Instant (or scheduled)

**Total:** Usually 2-4 days for first submission

---

## App Store Optimization (ASO)

### App Icon Requirements
- 1024x1024 pixels
- PNG format
- No transparency
- No rounded corners (iOS adds them)

**Current icon:** `./assets/icon.png`

### App Preview Video (Optional but Recommended)
- 15-30 seconds
- Show key features
- Portrait orientation
- Formats: .mov, .m4v, .mp4

**Recommendation:** Use your YouTube Shorts video:
https://youtube.com/shorts/xu637xR6C9k

---

## Pricing

### Free with In-App Purchases

**Subscriptions to configure:**
1. **Pro Monthly** - £9.99/month
2. **Pro Annual** - £99.99/year (17% savings)
3. **Club Subscription** - £299.99/year

Configure in App Store Connect → Features → In-App Purchases

---

## Common Issues & Solutions

### Issue: "No valid signing identity found"
**Solution:** EAS handles this automatically. Just follow the prompts.

### Issue: "Missing provisioning profile"
**Solution:**
```bash
eas credentials
```
Select "iOS" → "Set up new credentials"

### Issue: Build fails
**Solution:** Check build logs:
```bash
eas build:list
eas build:view <BUILD_ID>
```

### Issue: App rejected for missing features
**Common reasons:**
- Missing demo account for reviewers
- App crashes on launch
- Privacy policy not accessible
- Missing required permissions descriptions

---

## Cost Summary

| Item | Cost | Frequency |
|------|------|-----------|
| Apple Developer Program | $99 | Annual |
| EAS Build (included in Expo) | Free | N/A |
| App Store hosting | Free | N/A |

**Total:** $99/year

---

## Next Steps After Approval

1. **Monitor Analytics:**
   - App Store Connect → Analytics
   - Track downloads, sessions, crashes

2. **Respond to Reviews:**
   - App Store Connect → Ratings and Reviews
   - Reply to user feedback

3. **Update App:**
   ```bash
   # Update version in app.json
   # Build new version
   eas build --platform ios --profile production

   # Submit update
   eas submit --platform ios --latest
   ```

4. **TestFlight Continuous Testing:**
   - Keep internal testers updated with each build
   - Get feedback before submitting to App Store

---

## Resources

- **Expo Documentation:** https://docs.expo.dev/
- **EAS Build:** https://docs.expo.dev/build/introduction/
- **App Store Connect:** https://appstoreconnect.apple.com
- **Apple Developer:** https://developer.apple.com
- **TestFlight:** https://testflight.apple.com

---

## Support

Need help?
- Expo Discord: https://chat.expo.dev
- Stack Overflow: tag `expo` or `react-native`
- Apple Developer Support: https://developer.apple.com/support/
