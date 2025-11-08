# Publishing RacePilot to Google Play Store

Complete guide to publishing your app on the Google Play Store.

## ⚠️ CRITICAL REQUIREMENT: Deploy Backend First!

**STOP!** Before you can publish to Play Store, you MUST deploy your backend to the cloud!

### Why?
RacePilot sends GPS data to a backend server. Currently, your backend runs on your PC (`http://192.168.4.103:8000`), which only works on your local WiFi.

**Play Store users need**:
- Backend accessible from anywhere (public internet)
- HTTPS (not HTTP) - required for production
- 24/7 availability

### Quick Solution
Deploy backend to cloud (~$5-6/month):
- **Railway.app** - Easiest, $5/month, automatic HTTPS
- **DigitalOcean** - Good value, $6/month
- **Heroku** - Very easy, $7/month

**See [BACKEND_DEPLOYMENT.md](BACKEND_DEPLOYMENT.md) for complete deployment guide.**

---

## Overview

To publish on Google Play, you need:
- **Backend deployed to cloud** (CRITICAL - see above!)
- **Google Play Console account** ($25 one-time fee)
- **AAB file** (Android App Bundle) - required by Google Play
- **App listing materials** (screenshots, descriptions, icons)
- **Privacy policy** (required for apps that collect data)
- **Signed release build** (already configured!)

**Timeline**: First-time approval typically takes 1-3 days.

**Total Cost**: $25 (Play Console) + $5-7/month (backend hosting)

---

## Part 1: Build Your AAB for Google Play

### Step 1: Update Your App for Production

Before building, update the API URL to your production server:

1. Open `.env` in the `racepilot-mobile` folder
2. Change the URL to your production backend:
   ```
   EXPO_PUBLIC_API_URL=https://your-production-api.com
   ```
3. Save the file

**Important**: You need to deploy your backend to a cloud server (AWS, Google Cloud, Azure, DigitalOcean, etc.) before publishing.

### Step 2: Build the AAB File

Google Play requires AAB (Android App Bundle) format instead of APK.

**Option A: Using Android Studio (Recommended)**

1. Open Android Studio
2. Open the `android` folder in your project
3. Wait for Gradle sync to complete
4. Click **Build** → **Generate Signed Bundle / APK**
5. Select **Android App Bundle**
6. Click **Next**

7. **Keystore Configuration**:
   - If you already have a keystore:
     - Click **Choose existing...**
     - Browse to: `android/app/racepilot-release.keystore`
     - Key store password: `racepilot123`
     - Key alias: `racepilot-key`
     - Key password: `racepilot123`

   - If you need to create one:
     - Click **Create new...**
     - Fill in your details
     - **SAVE THE PASSWORD!** You'll need it for all future updates

8. Click **Next**
9. Select **release** build variant
10. Click **Finish**

11. Wait 3-5 minutes for the build

12. Find your AAB at:
    ```
    android/app/build/outputs/bundle/release/app-release.aab
    ```

**Option B: Using Command Line**

```bash
cd android
gradlew bundleRelease
```

Output: `android/app/build/outputs/bundle/release/app-release.aab`

---

## Part 2: Set Up Google Play Console

### Step 1: Create Developer Account

1. Go to: https://play.google.com/console/signup
2. Sign in with your Google account
3. Accept the Developer Distribution Agreement
4. Pay the $25 one-time registration fee
5. Complete your account details

### Step 2: Create Your App

1. Click **Create app**
2. Fill in the details:
   - **App name**: RacePilot
   - **Default language**: English (United States)
   - **App or game**: App
   - **Free or paid**: Free (or Paid if you plan to charge)
3. Accept declarations
4. Click **Create app**

---

## Part 3: Complete Your App Listing

### Dashboard Setup

You'll see a dashboard with tasks to complete. Work through each section:

### 1. App Access

Specify if your app requires login:
- **All functionality is available without special access** (if public)
- OR provide test credentials if login is required

### 2. Ads

Declare if your app contains ads:
- Click **No, my app does not contain ads** (unless you added ads)

### 3. Content Rating

Get your app rated:
1. Click **Start questionnaire**
2. Enter your email
3. Select category: **Utility, Productivity, Communication, or Other**
4. Answer questions honestly:
   - Violence? No
   - Sexual content? No
   - Language? No
   - Controlled substances? No
   - Does app share user location? **Yes** (GPS tracking)
   - Can users interact? No (unless you added social features)
5. Submit questionnaire
6. Get your rating certificate

### 4. Target Audience

1. **Target age group**:
   - Select: **18 and over** (sailing/racing app)
2. **App designed for children**: No

### 5. News App

- Select **No, it's not a news app**

### 6. COVID-19 Contact Tracing & Status

- Select **No**

### 7. Data Safety

This is CRITICAL for apps that collect location data.

1. Click **Start**
2. **Does your app collect data?**: Yes
3. **Data types collected**:
   - Location: **Precise location** (GPS coordinates)
   - Device or other IDs: **Device ID** (for sessions)

4. **Data usage**:
   - App functionality
   - Analytics

5. **Data sharing**:
   - No, data is not shared with third parties (unless you are)

6. **Data security**:
   - Is data encrypted in transit? **Yes** (if using HTTPS)
   - Can users request data deletion? **Yes** (you should implement this)
   - Privacy policy required: **Yes**

7. Save and submit

### 8. Privacy Policy

**You MUST have a privacy policy** for location tracking.

**Quick Solution - Generate One**:

1. Use a free generator:
   - https://www.privacypolicygenerator.info/
   - https://app-privacy-policy-generator.nisrulz.com/
   - https://www.freeprivacypolicy.com/

2. Fill in:
   - App name: RacePilot
   - Website: (your website or GitHub repo)
   - Data collected: Location, device IDs
   - Purpose: GPS tracking for sailing race analysis
   - Data storage: (your backend server location)

3. Generate and download the policy

4. Host it somewhere:
   - GitHub Pages (free)
   - Your website
   - Google Drive (make it public)

5. Paste the URL into Play Console

**Example Privacy Policy Content**:
```
RacePilot Privacy Policy

This app collects GPS location data to provide sailing race tracking
and analysis. Location data is sent to our servers for processing and
storage. Users can request data deletion by contacting [your email].

We do not share data with third parties. Data is encrypted in transit
using HTTPS. We store data for [timeframe] or until deletion is requested.

For questions, contact: [your email]
```

### 9. App Category

- **Category**: Sports or Maps & Navigation
- **Tags**: sailing, racing, GPS, tracking, navigation

### 10. Store Listing

#### App Details
- **App name**: RacePilot
- **Short description** (80 chars max):
  ```
  GPS tracking and telemetry for sailing races with Bluetooth wind sensor support
  ```
- **Full description** (4000 chars max):
  ```
  RacePilot is your sailing race companion that turns your phone into a
  professional race tracking system.

  FEATURES:
  • Real-time GPS tracking with high precision
  • Bluetooth wind sensor integration
  • Live telemetry streaming
  • Background location tracking during races
  • Session management and replay
  • Race analytics and performance metrics

  REQUIREMENTS:
  • Android phone with GPS
  • Bluetooth wind sensor (optional but recommended)
  • Internet connection for data sync

  Perfect for sailors who want to:
  - Track race performance
  - Analyze sailing data
  - Review past races
  - Improve racing skills

  Start your session, grant permissions, and let RacePilot capture every
  moment of your race!
  ```

#### Graphics

You need to create:

1. **App Icon** (512 x 512 px)
   - Already in your project: `android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png`
   - You may want to design a better one
   - Use Canva, Figma, or hire a designer on Fiverr ($5-20)

2. **Feature Graphic** (1024 x 500 px)
   - Banner image shown in Play Store
   - Should show app name and key features
   - Create in Canva: https://www.canva.com/

3. **Screenshots** (at least 2, max 8)
   - Take screenshots from your app:
     - Main screen with "START SESSION" button
     - Active session showing GPS data
     - Session list view
     - Bluetooth connection screen

   - Requirements:
     - JPEG or PNG
     - Minimum dimension: 320px
     - Maximum dimension: 3840px
     - Aspect ratio between 16:9 and 9:16

   - Take them on your phone, then transfer to PC:
     - Connect phone via USB
     - Open phone in File Explorer
     - Copy screenshots from Phone/DCIM/Screenshots

4. **Video** (optional but recommended)
   - YouTube link showing app in action
   - 30 seconds to 2 minutes
   - Screen record your app and upload to YouTube

#### Contact Details
- **Email**: (your email for user support)
- **Phone**: (optional)
- **Website**: (optional - GitHub repo works)

---

## Part 4: Upload Your App

### Step 1: Create a Release

1. In Play Console, click **Production** (left sidebar)
2. Click **Create new release**

### Step 2: Upload Your AAB

1. Click **Upload**
2. Select your `app-release.aab` file
3. Wait for upload to complete
4. Google will analyze your app (takes 1-2 minutes)

### Step 3: Release Details

1. **Release name**:
   ```
   1.0.0 - Initial Release
   ```

2. **Release notes** (what's new):
   ```
   Initial release of RacePilot!

   • GPS tracking for sailing races
   • Bluetooth wind sensor integration
   • Real-time telemetry streaming
   • Background location tracking
   • Session management
   ```

3. Click **Next**

### Step 4: Review Release

1. Review all details
2. Fix any warnings (if any)
3. Click **Start rollout to Production**

---

## Part 5: Wait for Review

### What Happens Now?

1. **Processing**: Google scans your app (15 minutes - 1 hour)
2. **Review**: Google team reviews your app (1-3 days typically)
3. **Published**: App goes live on Play Store!

### During Review

You'll receive emails about:
- Processing started
- Review in progress
- Approved and published (or rejection with reasons)

### Common Rejection Reasons

1. **Missing privacy policy** - Make sure it's linked
2. **Permissions not justified** - Explain why you need location
3. **Data safety issues** - Complete the data safety section accurately
4. **Crashes on testing** - Test thoroughly before submitting
5. **Missing screenshots** - Upload all required graphics

---

## Part 6: After Approval

### Your App is Live!

Find it at: `https://play.google.com/store/apps/details?id=com.racepilot.mobile`

### Share Your App

- Share the Play Store link
- Users can install directly from Play Store
- No APK files needed!

### Monitor Performance

In Play Console, you can track:
- Installs and uninstalls
- Ratings and reviews
- Crashes and ANRs (App Not Responding)
- User retention
- Revenue (if paid)

---

## Updating Your App

When you want to release an update:

### Step 1: Update Version

Edit `app.json`:
```json
{
  "expo": {
    "version": "1.0.1",
    "android": {
      "versionCode": 2
    }
  }
}
```

**Important**:
- `version`: User-facing version (1.0.1, 1.1.0, 2.0.0)
- `versionCode`: Must increment by 1 each release (1, 2, 3, 4...)

### Step 2: Rebuild

```bash
npx expo prebuild --clean
```

Then build new AAB in Android Studio.

### Step 3: Upload New Release

1. Go to Play Console → Production
2. Create new release
3. Upload new AAB
4. Add release notes explaining what changed
5. Submit for review

Updates typically get approved faster (few hours to 1 day).

---

## Important Notes

### Keystore Security

**CRITICAL**: Your keystore file is your app's identity!

- **BACKUP** your keystore file: `android/app/racepilot-release.keystore`
- **SAVE** your passwords somewhere safe
- If you lose it, you can NEVER update your app!
- Google cannot help if you lose your keystore

**Best Practice**:
- Keep keystore in secure cloud storage (Google Drive, OneDrive)
- Store passwords in password manager
- Consider using Google Play App Signing (Google manages your key)

### Production Backend

Before publishing, you MUST:
1. Deploy backend to cloud server
2. Use HTTPS (not HTTP) - required for production
3. Update `.env` with production URL
4. Test thoroughly with production backend

### Testing Before Release

Create a **Closed Testing** track first:
1. In Play Console: **Testing → Closed testing**
2. Upload your AAB
3. Add test users (email addresses)
4. Test users can install from Play Store before public release
5. Fix any issues
6. Then promote to Production

---

## Cost Summary

- **Google Play Developer Account**: $25 (one-time)
- **App Development**: Free (you built it!)
- **App Icon/Graphics**: $0-50 (DIY or Fiverr)
- **Backend Hosting**: $5-20/month (DigitalOcean, AWS, etc.)
- **Domain**: $10-15/year (optional)

**Total to get started**: $25 + hosting

---

## Checklist

Before submitting to Play Store:

- [ ] Backend deployed to production server
- [ ] HTTPS configured on backend
- [ ] `.env` updated with production URL
- [ ] AAB built with release keystore
- [ ] Keystore backed up safely
- [ ] Privacy policy written and hosted
- [ ] App icon designed (512x512)
- [ ] Feature graphic created (1024x500)
- [ ] Screenshots taken (at least 2)
- [ ] Store listing written
- [ ] Data safety form completed
- [ ] Content rating obtained
- [ ] App thoroughly tested
- [ ] Release notes written

---

## Need Help?

### Useful Resources

- **Play Console Help**: https://support.google.com/googleplay/android-developer
- **Play Store Policies**: https://play.google.com/about/developer-content-policy/
- **Android Developer Docs**: https://developer.android.com/distribute

### Common Issues

**"Unable to upload AAB"**
- Make sure you're uploading `.aab` not `.apk`
- Version code must be higher than previous releases

**"App not compatible with any devices"**
- Check `android/app/build.gradle` minSdkVersion
- Should be 21 or higher

**"Permissions policy violation"**
- Justify all permissions in privacy policy
- Only request permissions you actually use

---

## Next Steps

1. **Deploy your backend** to a cloud server
2. **Update .env** with production URL
3. **Build your AAB**
4. **Create graphics** (icon, feature graphic, screenshots)
5. **Write privacy policy**
6. **Create Play Console account**
7. **Submit your app**!

Good luck! Your app will be live on Google Play soon! 🚀
