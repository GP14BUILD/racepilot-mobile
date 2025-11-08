# Privacy Policy for RacePilot

**Last Updated**: [INSERT DATE]

## Introduction

RacePilot ("we", "our", or "us") is a sailing race tracking application that helps sailors track their performance using GPS and Bluetooth wind sensors. This Privacy Policy explains how we collect, use, and protect your information.

## Information We Collect

### 1. Location Data
- **What we collect**: GPS coordinates (latitude, longitude), speed, and heading
- **Why we collect it**: To track your sailing sessions and provide race analytics
- **How often**: Continuously while a session is active (approximately every second)
- **Background tracking**: We track location in the background to ensure uninterrupted session recording

### 2. Device Information
- **What we collect**: Device ID, Android version
- **Why we collect it**: To identify and associate sessions with your device
- **How we use it**: For session management and analytics

### 3. Bluetooth Data
- **What we collect**: Wind sensor data (wind speed and angle) via Bluetooth
- **Why we collect it**: To enhance sailing analytics with wind information
- **How we use it**: Combined with GPS data for race analysis

## How We Use Your Information

We use the collected information to:
- Track and record your sailing sessions
- Calculate sailing performance metrics (speed over ground, course over ground, etc.)
- Provide race analytics and historical session data
- Improve app functionality and user experience

## Data Storage and Security

### Storage
- Data is stored on our servers located in [INSERT YOUR SERVER LOCATION]
- We retain session data for [INSERT TIMEFRAME, e.g., "indefinitely" or "2 years"]
- Data is encrypted in transit using HTTPS/TLS

### Security Measures
- All data transmission uses industry-standard encryption (HTTPS)
- Server access is restricted and monitored
- We implement reasonable security measures to protect against unauthorized access

## Data Sharing

We DO NOT:
- Sell your data to third parties
- Share your location data with advertisers
- Use your data for purposes other than providing the RacePilot service

We MAY share data:
- If required by law or legal process
- To protect our rights or the safety of others
- With service providers who help us operate the app (under strict confidentiality agreements)

## Your Rights

You have the right to:
- **Access**: Request a copy of your data
- **Deletion**: Request deletion of your data at any time
- **Correction**: Request correction of inaccurate data
- **Opt-out**: Stop using the app to discontinue data collection

### Data Deletion Request

To request deletion of your data:
1. Email us at: [INSERT YOUR EMAIL]
2. Include your device ID (shown in the app settings)
3. We will delete your data within 30 days

## Children's Privacy

RacePilot is not intended for use by children under 18. We do not knowingly collect information from children. If you believe a child has provided us with personal information, please contact us.

## Changes to This Policy

We may update this Privacy Policy from time to time. We will notify you of any changes by:
- Updating the "Last Updated" date at the top of this policy
- Posting the new policy in the app and on our website

## Permissions Explained

### Android Permissions

- **ACCESS_FINE_LOCATION**: Required for GPS tracking
- **ACCESS_BACKGROUND_LOCATION**: Required to continue tracking during sailing sessions
- **BLUETOOTH_SCAN & BLUETOOTH_CONNECT**: Required to connect to wind sensors
- **INTERNET**: Required to send data to our servers
- **FOREGROUND_SERVICE**: Required to maintain tracking while app is minimized

### Why We Need These Permissions

RacePilot is a sailing tracking app. GPS tracking is the core functionality. We need background location permission to ensure your session isn't interrupted if you switch apps to check the time, read messages, or use other apps while sailing.

Bluetooth permissions are optional and only used if you choose to connect a wind sensor.

## Contact Us

If you have questions about this Privacy Policy or your data:

**Email**: [INSERT YOUR EMAIL]
**Website**: [INSERT YOUR WEBSITE]
**App**: RacePilot Mobile
**Developer**: [INSERT YOUR NAME/COMPANY]

## Technical Details

### Data Categories Collected
- Precise location (GPS coordinates)
- Device identifiers
- Wind sensor data (via Bluetooth)
- Session metadata (timestamps, user ID)

### Data Retention
- Active sessions: Stored indefinitely (or specify your retention period)
- You can request deletion at any time

### Third-Party Services
- We use [INSERT CLOUD PROVIDER, e.g., "AWS", "Google Cloud", "DigitalOcean"] for data storage
- We do not use third-party analytics or advertising services

### Cookies
- This app does not use cookies or similar tracking technologies

## Legal Basis for Processing (GDPR)

If you are in the European Union, our legal basis for processing your data is:
- **Consent**: You grant permission when you start a session and accept permissions
- **Legitimate Interest**: To provide the sailing tracking service you requested

You have the right to withdraw consent at any time by stopping use of the app and requesting data deletion.

## California Privacy Rights (CCPA)

If you are a California resident, you have additional rights:
- Right to know what personal information is collected
- Right to delete personal information
- Right to opt-out of sale of personal information (we do not sell your information)

To exercise these rights, contact us at [INSERT YOUR EMAIL].

---

**Summary**: RacePilot collects GPS location and Bluetooth wind sensor data to provide sailing session tracking and analytics. Data is encrypted in transit and stored securely. We don't sell or share your data with third parties. You can request deletion at any time.

---

## Instructions for Using This Template

1. **Fill in the placeholders**:
   - [INSERT DATE] - Today's date
   - [INSERT YOUR EMAIL] - Your support email
   - [INSERT YOUR SERVER LOCATION] - e.g., "United States (AWS US-East)"
   - [INSERT TIMEFRAME] - How long you keep data
   - [INSERT YOUR WEBSITE] - Your website or GitHub repo URL
   - [INSERT YOUR NAME/COMPANY] - Your name or company name

2. **Review and customize**:
   - Adjust retention periods to match your actual practices
   - Add any third-party services you use
   - Modify contact information
   - Ensure it accurately reflects your app's behavior

3. **Host the policy**:
   - GitHub Pages (free, easy)
   - Your website
   - Google Drive (set to public access)
   - Privacy policy hosting services

4. **Add the URL to Play Console**:
   - Copy the hosted URL
   - Paste into "Privacy policy" field in Play Console

5. **Update when needed**:
   - Change the "Last Updated" date
   - Keep users informed of changes

## Quick GitHub Pages Setup

To host this on GitHub Pages (free):

1. Create a new GitHub repository called "racepilot-privacy"
2. Upload this file as `README.md`
3. Go to Settings → Pages
4. Select branch: main, folder: / (root)
5. Save
6. Your policy will be at: `https://yourusername.github.io/racepilot-privacy/`

Use that URL in Play Console!
