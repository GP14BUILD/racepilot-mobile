# Google Play Store Submission Checklist

Quick checklist for publishing RacePilot to Google Play Store.

## Before You Start

### Prerequisites
- [ ] Have a Google account
- [ ] Have $25 for Play Console registration (one-time fee)
- [ ] **CRITICAL**: Backend server deployed to production (with HTTPS)
  - See [BACKEND_DEPLOYMENT.md](BACKEND_DEPLOYMENT.md) for complete guide
  - Recommended: Railway.app ($5/month) or DigitalOcean ($6/month)
  - Your backend must be publicly accessible with HTTPS
  - Users connect to YOUR backend server (not their own)
- [ ] Production backend URL ready (e.g., `https://api.racepilot.com`)

## Build Preparation

### 1. Update Configuration
- [ ] Update `.env` with production backend URL:
  ```
  EXPO_PUBLIC_API_URL=https://your-production-server.com
  ```
- [ ] Update `app.json` version if needed:
  ```json
  "version": "1.0.0",
  "android": {
    "versionCode": 1
  }
  ```

### 2. Build AAB File
- [ ] Run `build-aab.bat` OR use Android Studio
- [ ] Verify AAB created at: `android\app\build\outputs\bundle\release\app-release.aab`
- [ ] **BACKUP keystore file**: `android\app\racepilot-release.keystore`
- [ ] **SAVE keystore password**: `racepilot123` (change for production!)

## Google Play Console Setup

### 3. Developer Account
- [ ] Go to https://play.google.com/console/signup
- [ ] Pay $25 registration fee
- [ ] Complete account profile
- [ ] Accept Developer Distribution Agreement

### 4. Create App
- [ ] Click "Create app"
- [ ] App name: **RacePilot**
- [ ] Language: English (United States)
- [ ] Type: App
- [ ] Free or paid: **Free**

## App Listing Content

### 5. Store Listing Graphics
- [ ] App icon (512x512 px)
- [ ] Feature graphic (1024x500 px)
- [ ] Screenshots (minimum 2, recommended 4-8):
  - [ ] Main screen with START SESSION button
  - [ ] Active session with GPS data
  - [ ] Session list/history
  - [ ] Bluetooth connection screen
- [ ] Optional: Promo video (YouTube link)

### 6. Store Listing Text
- [ ] Short description (80 chars max)
- [ ] Full description (explain features)
- [ ] Contact email
- [ ] Optional: Website, phone

## App Content

### 7. Privacy Policy
- [ ] Write privacy policy (see PLAY_STORE_GUIDE.md for template)
- [ ] Host policy online (GitHub Pages, your website, Google Drive)
- [ ] Add privacy policy URL to Play Console

### 8. Data Safety Form
- [ ] Complete data safety questionnaire
- [ ] Declare location data collection
- [ ] Declare device ID collection
- [ ] Specify: Data encrypted in transit (if using HTTPS)
- [ ] Specify: Users can request deletion

### 9. Content Rating
- [ ] Start questionnaire
- [ ] Select category: Utility/Productivity
- [ ] Answer all questions
- [ ] Submit and get rating certificate

### 10. Target Audience
- [ ] Target age: **18 and over**
- [ ] Not designed for children: **No**

### 11. Additional Declarations
- [ ] Ads: **No** (unless you added ads)
- [ ] News app: **No**
- [ ] COVID-19 app: **No**

### 12. App Access
- [ ] Specify if login required
- [ ] Provide test credentials if applicable

### 13. App Category
- [ ] Category: **Sports** or **Maps & Navigation**
- [ ] Tags: sailing, racing, GPS, tracking

## Upload and Review

### 14. Create Production Release
- [ ] Go to Production → Create new release
- [ ] Upload AAB file
- [ ] Wait for processing (5-15 minutes)
- [ ] Add release name: "1.0.0 - Initial Release"
- [ ] Add release notes (what's new)

### 15. Review and Submit
- [ ] Review all sections (Play Console dashboard)
- [ ] Fix any warnings or errors
- [ ] Click "Start rollout to Production"
- [ ] Wait for Google review (1-3 days)

### 16. Monitor Status
- [ ] Check email for review updates
- [ ] Check Play Console for status
- [ ] Fix any issues if rejected
- [ ] Celebrate when approved! 🎉

## After Publishing

### 17. Post-Launch
- [ ] Verify app is live: https://play.google.com/store/apps/details?id=com.racepilot.mobile
- [ ] Share Play Store link
- [ ] Monitor reviews and ratings
- [ ] Check crash reports
- [ ] Respond to user feedback

## For Updates

When releasing updates:
- [ ] Increment version in `app.json`:
  ```json
  "version": "1.0.1",  // User-facing version
  "android": {
    "versionCode": 2   // Must increment by 1 each time
  }
  ```
- [ ] Rebuild AAB: `npx expo prebuild --clean` then `build-aab.bat`
- [ ] Create new release in Play Console
- [ ] Upload new AAB
- [ ] Add release notes
- [ ] Submit (faster approval for updates)

## Important Reminders

### Security
- **NEVER lose your keystore file** - you can't update the app without it!
- **BACKUP** `android\app\racepilot-release.keystore` to cloud storage
- **SAVE** keystore password in password manager
- Consider changing default password `racepilot123` to something secure

### Production Backend
- Must use **HTTPS** (not HTTP) for production
- Deploy to: AWS, Google Cloud, Azure, DigitalOcean, Heroku, etc.
- Test thoroughly before publishing

### Testing
- Test app with production backend before submitting
- Consider using Closed Testing track first
- Add test users to catch issues before public release

## Quick Commands

### Build AAB for Play Store
```bash
.\build-aab.bat
```

### Find your AAB
```
android\app\build\outputs\bundle\release\app-release.aab
```

### Update version (in app.json)
```json
"version": "1.0.1",
"android": {
  "versionCode": 2
}
```

### Rebuild after changes
```bash
npx expo prebuild --clean
.\build-aab.bat
```

## Costs

- Google Play Console: **$25** (one-time)
- Backend hosting: **$5-20/month**
- App icon design: **$0-50** (DIY or Fiverr)
- Domain (optional): **$10-15/year**

**Total to publish**: ~$25 + monthly hosting

## Resources

- **Full guide**: See [PLAY_STORE_GUIDE.md](PLAY_STORE_GUIDE.md)
- **Play Console**: https://play.google.com/console
- **Play Console Help**: https://support.google.com/googleplay/android-developer
- **Privacy Policy Generator**: https://www.privacypolicygenerator.info/

## Status Tracking

Current status:
- [ ] APK built for testing
- [ ] AAB built for Play Store
- [ ] Play Console account created
- [ ] App created in Play Console
- [ ] Store listing completed
- [ ] Privacy policy published
- [ ] AAB uploaded
- [ ] Submitted for review
- [ ] App approved
- [ ] App live on Play Store

---

**Next Step**: See [PLAY_STORE_GUIDE.md](PLAY_STORE_GUIDE.md) for detailed instructions on each step.
