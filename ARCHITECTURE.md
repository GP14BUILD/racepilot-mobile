# RacePilot Architecture Overview

Simple explanation of how RacePilot works.

---

## System Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                    THE COMPLETE SYSTEM                        │
└──────────────────────────────────────────────────────────────┘

┌─────────────────┐
│   User's Phone  │  ← Download from Play Store
│                 │
│   RacePilot App │  ← GPS tracking + Wind sensor
└────────┬────────┘
         │
         │ HTTPS (Internet)
         │ Sends GPS data every second
         ↓
┌─────────────────────────┐
│   Cloud Server          │  ← YOU deploy and host this!
│   (Your Backend)        │     ($5-7/month)
│                         │
│   • FastAPI             │
│   • Receives GPS data   │
│   • Stores in database  │
└────────┬────────────────┘
         │
         │ Stores data
         ↓
┌─────────────────────────┐
│   Database              │
│   • Session records     │
│   • GPS track points    │
│   • Wind data           │
│   • User info           │
└─────────────────────────┘
```

---

## How It Works

### 1. User Downloads App

```
Google Play Store
    ↓
User's Phone
    ↓
RacePilot Installed
```

**What they see**: App on their phone

---

### 2. User Starts Sailing Session

```
User taps "START SESSION"
    ↓
App requests GPS location
    ↓
Phone's GPS tracks position every second
    ↓
Optional: Connect Bluetooth wind sensor
```

**What happens**: Phone records GPS coordinates, speed, heading

---

### 3. Data Flows to Your Backend

```
Phone collects 10 GPS points (or 5 seconds worth)
    ↓
App sends batch to YOUR cloud server via HTTPS
    ↓
Backend receives data via API endpoint
    ↓
Backend stores in database
    ↓
Repeat every 5 seconds while sailing
```

**Key Point**: All users connect to YOUR backend server (not their own!)

---

### 4. User Stops Session

```
User taps "STOP SESSION"
    ↓
App sends final batch of data
    ↓
Session marked complete in database
    ↓
Data available for analysis (future feature)
```

---

## What YOU Need to Provide

### For Testing (Current Setup)

✅ **Mobile app** - Built and working
✅ **Backend on your PC** - Running at `http://192.168.4.103:8000`
✅ **Local network** - Phone and PC on same WiFi

**Works for**: Testing only (your network only)

---

### For Play Store (Production)

⚠️ **YOU MUST DEPLOY**:

1. **Backend to Cloud Server**
   - DigitalOcean, AWS, Heroku, Railway, etc.
   - Cost: ~$5-7/month
   - Accessible from anywhere (public internet)
   - HTTPS required (secure connection)

2. **Database**
   - SQLite (simple, included)
   - Or PostgreSQL (recommended for production)

3. **Domain (Optional but Recommended)**
   - Example: `api.racepilot.com`
   - Cost: ~$10-15/year
   - Makes URLs cleaner and professional

**Works for**: Anyone, anywhere with internet

---

## Data Flow Example

### User Journey

```
8:00 AM - User opens RacePilot app
    ↓
8:01 AM - Taps "START SESSION"
    ↓
        GPS: 37.7749°N, 122.4194°W, Speed: 0 knots
    ↓
8:02 AM - Starts sailing
    ↓
        GPS: 37.7750°N, 122.4195°W, Speed: 5.2 knots
        → Sent to YOUR server: https://api.racepilot.com
    ↓
8:03 AM - Sailing continues
    ↓
        GPS: 37.7752°N, 122.4197°W, Speed: 6.1 knots
        → Sent to YOUR server
    ↓
... Every second for entire race ...
    ↓
10:00 AM - Taps "STOP SESSION"
    ↓
        Final batch sent to YOUR server
        ↓
    Session complete! 7,200 data points stored.
```

---

## Backend Hosting Options

### Option 1: Railway.app (Easiest)
- **Cost**: $5/month
- **Setup**: 15 minutes
- **Difficulty**: Very Easy
- **HTTPS**: Automatic
- **Best for**: Beginners

### Option 2: DigitalOcean
- **Cost**: $6/month
- **Setup**: 1 hour
- **Difficulty**: Medium
- **HTTPS**: Manual setup
- **Best for**: Good value

### Option 3: AWS/Google Cloud
- **Cost**: $5-10/month
- **Setup**: 2 hours
- **Difficulty**: Medium-Hard
- **HTTPS**: Manual setup
- **Best for**: Scalability

### Option 4: Heroku
- **Cost**: $7/month
- **Setup**: 30 minutes
- **Difficulty**: Easy
- **HTTPS**: Automatic
- **Best for**: Simplicity

**See [BACKEND_DEPLOYMENT.md](BACKEND_DEPLOYMENT.md) for detailed guides!**

---

## URL Configuration

### Current (Testing)
```
Mobile App .env:
EXPO_PUBLIC_API_URL=http://192.168.4.103:8000

Works on: Your WiFi only
```

### Production (Play Store)
```
Mobile App .env:
EXPO_PUBLIC_API_URL=https://api.racepilot.com

Works on: Anywhere with internet
```

**Important**: You must rebuild the AAB after changing the URL!

---

## Security

### HTTPS is Required

```
❌ http://your-server.com     → Not secure, Play Store won't allow
✅ https://your-server.com    → Secure, required for production
```

### Why HTTPS?
- Encrypts GPS data in transit
- Required by Google Play policies
- User trust and safety
- Industry standard

**All deployment options in BACKEND_DEPLOYMENT.md include HTTPS setup!**

---

## Costs Breakdown

### One-Time Costs
- **Google Play Developer**: $25
- **Domain name** (optional): $10-15
- **Total**: $25-40

### Monthly Costs
- **Backend hosting**: $5-7/month
- **Total**: $5-7/month

### Total First Year
- One-time: $25-40
- Monthly: $60-84 (12 months × $5-7)
- **Grand Total**: $85-124/year

---

## Scaling Considerations

### Small Scale (100 users)
- Basic hosting ($5/month) is fine
- SQLite database works
- Single server sufficient

### Medium Scale (1,000 users)
- Upgrade hosting ($10-20/month)
- Use PostgreSQL database
- Consider load balancer

### Large Scale (10,000+ users)
- Professional cloud (AWS/GCP)
- Multiple servers
- Database clustering
- CDN for static assets
- Cost: $100+/month

**Start small, scale as needed!**

---

## What Users DON'T Need

Users who download from Play Store DO NOT need:
- ❌ Their own backend server
- ❌ Database setup
- ❌ Technical knowledge
- ❌ Command line tools
- ❌ Development environment

Users ONLY need:
- ✅ Android phone
- ✅ GPS enabled
- ✅ Internet connection
- ✅ The app (from Play Store)

**Everything else is YOUR responsibility as the app publisher!**

---

## Deployment Workflow

### Step-by-Step

```
1. Deploy Backend to Cloud
   └─ See BACKEND_DEPLOYMENT.md
   └─ Get URL: https://your-domain.com
   └─ Test: Visit https://your-domain.com/docs

2. Update Mobile App
   └─ Edit .env with production URL
   └─ Run: npx expo prebuild --clean

3. Build AAB
   └─ Run: .\build-aab.bat
   └─ Output: android\app\build\outputs\bundle\release\app-release.aab

4. Test Production Build
   └─ Install APK on phone
   └─ Start session
   └─ Verify data reaches production backend

5. Publish to Play Store
   └─ Follow PLAY_STORE_GUIDE.md
   └─ Upload AAB
   └─ Wait for approval (1-3 days)

6. App Goes Live!
   └─ Users download from Play Store
   └─ They connect to YOUR backend
   └─ Data flows to YOUR server
   └─ You can monitor and analyze
```

---

## API Endpoints (Backend)

Your backend provides these endpoints:

```
POST /users              → Create user
POST /boats              → Register boat
POST /sessions           → Start session
POST /telemetry/ingest   → Receive GPS data (used by mobile app)
GET  /sessions/{id}      → Get session details
GET  /docs               → API documentation
```

**Mobile app primarily uses**: `/telemetry/ingest` endpoint

---

## Future Enhancements

### Planned Features
- **Web Dashboard** - View sessions on map (you'll need to build this)
- **Race Analytics** - Performance metrics and graphs
- **Multi-user** - Racing against friends
- **Offline Mode** - Store data locally, sync later
- **iOS App** - iPhone support

### What This Means for Architecture
- Web dashboard needs separate hosting (can be same server)
- More database load (scale hosting as needed)
- More API endpoints (backend updates)

---

## Monitoring Your Backend

Once deployed, you should monitor:

### Server Health
- Uptime (should be 24/7)
- CPU usage
- Memory usage
- Disk space

### Application Metrics
- Number of active sessions
- Data points received per hour
- API response times
- Error rates

### User Analytics
- Daily active users
- Sessions per day
- Average session duration
- Popular sailing locations

**Most cloud providers include basic monitoring dashboards!**

---

## Quick Reference

### I'm a user who downloaded the app
- Just install and use!
- No setup needed
- App connects to the developer's backend
- See [QUICK_START.md](QUICK_START.md)

### I'm the developer publishing the app
- Deploy backend to cloud (MUST DO!)
- Update `.env` with production URL
- Build AAB with production config
- Publish to Play Store
- Pay for backend hosting (~$5/month)
- See [BACKEND_DEPLOYMENT.md](BACKEND_DEPLOYMENT.md)

---

## Summary

```
┌─────────────────────────────────────────────────┐
│              HOW IT ALL FITS TOGETHER            │
├─────────────────────────────────────────────────┤
│                                                  │
│  YOU deploy:                                     │
│    • Backend to cloud server                     │
│    • Database                                    │
│    • HTTPS configuration                         │
│    • Cost: ~$5-7/month                          │
│                                                  │
│  YOU build and publish:                          │
│    • Mobile app AAB                              │
│    • Upload to Play Store                        │
│    • Cost: $25 one-time                         │
│                                                  │
│  USERS download:                                 │
│    • App from Play Store (free)                  │
│    • No additional setup                         │
│    • Connect to YOUR backend                     │
│                                                  │
│  DATA FLOWS:                                     │
│    User's Phone → YOUR Cloud Server → Database  │
│                                                  │
└─────────────────────────────────────────────────┘
```

**Bottom Line**: Users use the app, you provide the infrastructure!

---

**Next Steps**: See [BACKEND_DEPLOYMENT.md](BACKEND_DEPLOYMENT.md) to deploy your backend to the cloud!
