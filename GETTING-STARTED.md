# RacePilot Mobile - Complete Beginner's Guide

This guide will walk you through everything step-by-step, from scratch.

## 📋 What You'll Need

1. **A Windows PC** (what you're using now)
2. **An Android phone** (for testing)
3. **Android Studio** (free download)
4. **About 30 minutes**

---

## 🎯 Part 1: Install Android Studio (One Time Setup)

### Step 1: Download Android Studio

1. Open your web browser
2. Go to: https://developer.android.com/studio
3. Click the big **"Download Android Studio"** button
4. Wait for the download (about 1 GB)

### Step 2: Install Android Studio

1. Find the downloaded file (usually in Downloads folder)
2. Double-click `android-studio-*.exe`
3. Click **"Next"** through all the screens
4. Accept all default options
5. Click **"Install"**
6. Wait 10-15 minutes for installation
7. Click **"Finish"**

### Step 3: First Launch Setup

1. Android Studio will open automatically
2. Click **"Next"** on the welcome screen
3. Choose **"Standard"** installation
4. Click **"Next"** and then **"Finish"**
5. Wait for components to download (5-10 minutes)
6. When done, you'll see "Welcome to Android Studio"

**✅ Android Studio is now ready!**

---

## 🏗️ Part 2: Build Your App

### Step 4: Open the RacePilot Project

1. In Android Studio, click **"Open"**
2. Navigate to:
   ```
   C:\Users\donne\Documents\racepilot\racepilot-mobile\android
   ```
3. Click the **"android"** folder
4. Click **"OK"**

### Step 5: Wait for Gradle Sync

You'll see a progress bar at the bottom saying "Gradle sync in progress..."

⏰ **Wait 2-5 minutes** for this to complete.

When it's done, you'll see "Gradle sync finished" at the bottom.

**✅ Project is loaded!**

### Step 6: Build the APK

1. At the top menu, click **Build**
2. Click **Build Bundle(s) / APK(s)**
3. Click **Build APK(s)**

You'll see a progress indicator at the bottom.

⏰ **Wait 3-5 minutes** for the build to complete.

When done, you'll see a notification in the bottom-right:
```
APK(s) generated successfully
```

### Step 7: Find Your APK

1. Click **"locate"** in the notification bubble

OR

1. Open File Explorer
2. Go to:
   ```
   C:\Users\donne\Documents\racepilot\racepilot-mobile\android\app\build\outputs\apk\release
   ```

You'll see a file named: **`app-release.apk`**

**✅ Your app is built!**

---

## 📱 Part 3: Install on Your Phone

### Step 8A: Install via USB Cable

#### Connect Your Phone

1. Connect your phone to your PC with a USB cable
2. On your phone, tap the notification that appears
3. Select **"File Transfer"** or **"MTP"**

#### Copy the APK

1. Open File Explorer on your PC
2. You should see your phone listed on the left
3. Open your phone's storage
4. Copy **`app-release.apk`** to your phone's Downloads folder

#### Install on Phone

1. On your phone, open **Files** or **My Files** app
2. Navigate to **Downloads**
3. Tap **`app-release.apk`**
4. You'll see: "For security, your phone is not allowed to install unknown apps"
5. Tap **"Settings"**
6. Toggle **"Allow from this source"** to ON
7. Press the back button
8. Tap **`app-release.apk`** again
9. Tap **"Install"**
10. Wait a few seconds
11. Tap **"Open"**

**✅ App is installed!**

### Step 8B: Install via Cloud (Alternative)

#### Upload to Cloud

1. Upload **`app-release.apk`** to Google Drive, Dropbox, or OneDrive
2. Right-click the file and select **"Get shareable link"**
3. Copy the link

#### Download on Phone

1. On your phone, open the link in your browser
2. Download the APK
3. Follow steps 3-11 from "Install on Phone" above

**✅ App is installed!**

---

## 🚀 Part 4: Use the App

### Step 9: Start the Backend Server

Before using the app, you need the backend server running.

1. Open **PowerShell** on your PC
2. Copy and paste this command:
   ```powershell
   cd C:\Users\donne\Documents\racepilot\racepilot-backend; .venv\Scripts\Activate.ps1; uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```
3. Press **Enter**

You should see:
```
INFO:     Uvicorn running on http://0.0.0.0:8000
```

**Keep this window open!** The app needs it running.

### Step 10: Update the App for Your Network

**IMPORTANT**: The app needs to know your computer's IP address.

#### Find Your IP Address

1. Open **Command Prompt** (search "cmd" in Start menu)
2. Type: `ipconfig`
3. Press **Enter**
4. Look for **"IPv4 Address"**
5. It will be something like: `192.168.1.100`
6. **Write this down!**

#### Update the App (Before Building)

If you want to build the app for a specific network:

1. Open File Explorer
2. Go to: `C:\Users\donne\Documents\racepilot\racepilot-mobile`
3. Right-click `.env` and select **"Edit with Notepad"**
4. Change the IP address to match yours:
   ```
   EXPO_PUBLIC_API_URL=http://YOUR_IP_HERE:8000
   ```
   Example:
   ```
   EXPO_PUBLIC_API_URL=http://192.168.1.100:8000
   ```
5. Save and close

**Then rebuild the APK** (go back to Step 6)

### Step 11: Use the App

**Make sure:**
- ✅ Backend server is running on your PC
- ✅ Phone and PC are on the same WiFi network
- ✅ App has the correct IP address in the `.env` file

**Now on your phone:**

1. Open **RacePilot** app
2. Tap **"START SESSION"**
3. Grant **location permissions** when asked
4. Grant **Bluetooth permissions** when asked
5. You should see GPS coordinates appear!
6. Walk around and watch the data update

**✅ It works!**

---

## 📤 Part 5: Share with Others

### Give the APK to Friends

**Option 1: Direct Copy**
- Copy `app-release.apk` to their phone
- They follow Step 8 to install

**Option 2: Cloud Link**
- Upload APK to Google Drive
- Share the link
- They download and install

**⚠️ Important:**
- The APK has **your IP address** hardcoded
- It will only work on **your WiFi network**
- For others to use it, they need:
  - Access to the backend server
  - The right IP address in the app

### For Public Release

To make an app that works anywhere:

1. **Deploy your backend** to a cloud server (AWS, Google Cloud, etc.)
2. **Update .env** with the public URL:
   ```
   EXPO_PUBLIC_API_URL=https://your-server.com
   ```
3. **Rebuild the APK**
4. Now anyone can use it anywhere!

---

## 🆘 Troubleshooting

### "Gradle sync failed"

**Solution:**
1. In Android Studio: **File → Invalidate Caches**
2. Check **"Clear downloaded shared indexes"**
3. Click **"Invalidate and Restart"**

### "Build failed"

**Solution:**
1. In Android Studio: **Build → Clean Project**
2. Wait for it to finish
3. Then: **Build → Build APK(s)** again

### "App won't install on phone"

**Solution:**
1. Settings → Security → Enable "Unknown sources"
2. Or Settings → Apps → Special access → Install unknown apps
3. Enable for your file manager app

### "Network request failed" in app

**Solution:**
1. Check backend server is running
2. Check phone and PC are on same WiFi
3. Check IP address in `.env` is correct
4. Try accessing `http://YOUR_IP:8000/docs` in phone's browser

### "Can't find Android folder"

**Solution:**
You need to run this first:
```bash
cd C:\Users\donne\Documents\racepilot\racepilot-mobile
npx expo prebuild
```

---

## ✅ Quick Reference

### To build APK:
1. Open Android Studio
2. Open the `android` folder
3. Build → Build Bundle(s) / APK(s) → Build APK(s)
4. Find APK in: `android\app\build\outputs\apk\release\app-release.apk`

### To start backend:
```powershell
cd C:\Users\donne\Documents\racepilot\racepilot-backend
.venv\Scripts\Activate.ps1
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### To find your IP:
```cmd
ipconfig
```
Look for "IPv4 Address"

---

## 🎓 What You've Learned

✅ How to install Android Studio
✅ How to open an Android project
✅ How to build an APK
✅ How to install apps on Android
✅ How to configure networking
✅ How to share your app

**Congratulations!** You've built and deployed a mobile app! 🎉

---

## 📚 Next Steps

- Read [DISTRIBUTION.md](DISTRIBUTION.md) for Google Play Store publishing
- Read [ANDROID_STUDIO_GUIDE.md](ANDROID_STUDIO_GUIDE.md) for advanced Android Studio tips
- Read [README.md](README.md) for app features and development

## 💡 Need Help?

- Check the troubleshooting section above
- All documentation is in the `racepilot-mobile` folder
- The app is working - you saw it running with Expo Go!
