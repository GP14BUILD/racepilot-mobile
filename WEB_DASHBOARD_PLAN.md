# RacePilot Web Dashboard Plan

## What's Missing?

Currently you have:
- ✅ **Mobile App** - Sailors use this to record GPS data
- ✅ **Backend API** - Stores all the GPS data in database
- ❌ **Web Dashboard** - **NOT BUILT YET** - Needed for viewing on computer!

## What Coaches/Users Need:

A **website** (web application) where they can:
- 🗺️ View GPS tracks on an interactive map
- 📊 See all race sessions
- 🎯 View marks, start line, finish line
- 📈 Analyze performance (speed, tactics, wind)
- 👥 Compare multiple boats racing
- 📥 Export data (GPX, CSV)
- 🎬 Replay races with timeline

---

## Complete System Architecture

```
┌─────────────────┐
│   Sailor's      │
│   Phone         │  ← Mobile app records GPS
│   (RacePilot)   │
└────────┬────────┘
         │ HTTPS
         │ Sends GPS data
         ↓
┌─────────────────────────┐
│   Railway Backend       │  ← Stores everything
│   (FastAPI + Database)  │
│   https://racepilot-    │
│   backend-production    │
│   .up.railway.app       │
└─────────┬───────────────┘
          │
          │ HTTPS
          │ Fetches data
          ↓
┌─────────────────────────┐
│   Web Dashboard         │  ← NOT BUILT YET!
│   (React/Vue Website)   │
│                         │
│   Coach/Viewer opens    │
│   in web browser on     │
│   laptop/computer       │
│                         │
│   Shows:                │
│   • Map with tracks     │
│   • Session list        │
│   • Analytics           │
│   • Race replay         │
└─────────────────────────┘
```

---

## What You Need to Build

### Option 1: React Dashboard (Recommended)

**Tech Stack**:
- **React** (or Next.js)
- **Leaflet** or **Mapbox** - For interactive maps
- **Recharts** or **Chart.js** - For graphs
- **Tailwind CSS** - For styling

**Features**:
1. **Session List Page**
   - Show all sailing sessions
   - Filter by date, boat, user
   - Search functionality

2. **Session Detail Page**
   - Interactive map showing GPS track
   - Timeline slider to replay race
   - Speed graph over time
   - Wind data visualization
   - Stats: Average speed, max speed, distance

3. **Race Analysis Page**
   - Overlay multiple boats
   - Show marks and start/finish lines
   - Tactical analysis
   - Wind shifts visualization

4. **Export Features**
   - Download GPX file
   - Export CSV data
   - Generate race report PDF

### Option 2: Use Existing Tools

Instead of building from scratch, you could:
- Use **Grafana** - For data visualization
- Use **Traccar** - GPS tracking web interface
- Use **GPX Studio** - GPX file visualization
- Build simple map viewer with **Leaflet.js**

---

## Quick Start: Simple Web Dashboard

I can help you build a basic web dashboard. Here's what it would look like:

### 1. Create React App

```bash
npx create-react-app racepilot-dashboard
cd racepilot-dashboard
npm install leaflet react-leaflet axios recharts
```

### 2. Connect to Your Backend

```javascript
// Fetch sessions from Railway
const sessions = await axios.get('https://racepilot-backend-production.up.railway.app/sessions');

// Fetch track points for a session
const telemetry = await axios.get(`https://racepilot-backend-production.up.railway.app/sessions/${sessionId}/telemetry`);
```

### 3. Display on Map

```javascript
import { MapContainer, TileLayer, Polyline } from 'react-leaflet';

<MapContainer center={[37.7749, -122.4194]} zoom={13}>
  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
  <Polyline positions={trackPoints} color="blue" />
</MapContainer>
```

### 4. Deploy Dashboard

Deploy to:
- **Vercel** (free, automatic HTTPS)
- **Netlify** (free, automatic HTTPS)
- **Railway** (same place as backend)

---

## What Coaches Do:

1. **Sailor records race** on phone (RacePilot mobile app)
2. **Data automatically uploads** to Railway backend
3. **Coach opens website** on laptop: `https://racepilot-dashboard.vercel.app`
4. **Coach logs in** (you'll need to add authentication)
5. **Coach selects session** from list
6. **Map shows GPS track** with all data points
7. **Coach analyzes** speed, tactics, wind shifts
8. **Coach exports data** or shares replay

---

## Current Status

### What Works Now:
- ✅ Sailors can record GPS data on phone
- ✅ Data is stored in Railway backend
- ✅ Backend API has endpoints to fetch data

### What's Missing:
- ❌ Web interface to view the data
- ❌ Map visualization
- ❌ Session management UI
- ❌ Analytics and graphs
- ❌ User authentication/login

---

## Backend API Endpoints (Already Working!)

Your backend already provides these endpoints:

```
GET  /sessions              → List all sessions
GET  /sessions/{id}         → Get specific session
GET  /sessions/{id}/points  → Get GPS track points
POST /sessions              → Create new session
GET  /docs                  → API documentation
```

**Test it**: https://racepilot-backend-production.up.railway.app/docs

You can see all available endpoints and test them!

---

## Next Steps: Build the Dashboard

### Phase 1: Basic Viewer (1-2 days)
- [ ] Create React app
- [ ] Add map with Leaflet
- [ ] Fetch sessions from API
- [ ] Display track on map
- [ ] Show session details

### Phase 2: Analysis Tools (2-3 days)
- [ ] Timeline slider for replay
- [ ] Speed graphs
- [ ] Wind data visualization
- [ ] Stats calculations

### Phase 3: Multi-User (2-3 days)
- [ ] User authentication
- [ ] Coach accounts
- [ ] Share sessions
- [ ] Permissions

### Phase 4: Advanced Features (1 week)
- [ ] Multiple boat comparison
- [ ] Mark placement and rounding
- [ ] Start line analysis
- [ ] Tactical recommendations
- [ ] Export to PDF/GPX
- [ ] Race replay animation

---

## Quick Demo: View Data in Browser

**Right now**, coaches can view data using the API docs:

1. Go to: https://racepilot-backend-production.up.railway.app/docs
2. Click **GET /sessions** → "Try it out" → "Execute"
3. See all sessions
4. Copy a session ID
5. Click **GET /sessions/{id}/points**
6. Paste session ID → "Execute"
7. See all GPS coordinates!

**But this is just raw JSON data** - not user-friendly!

---

## Technology Recommendations

### For Maps:
- **Leaflet** (free, open source) ← Recommended
- **Mapbox** (beautiful, $5/month after free tier)
- **Google Maps** ($$$ expensive)

### For Graphs:
- **Recharts** (easy, React-based) ← Recommended
- **Chart.js** (popular, flexible)
- **D3.js** (powerful, complex)

### For UI:
- **Tailwind CSS** (modern, fast) ← Recommended
- **Material-UI** (professional, components)
- **Bootstrap** (classic, easy)

### For Hosting:
- **Vercel** (free, fast, automatic deployment) ← Recommended
- **Netlify** (free, similar to Vercel)
- **Railway** (same as backend, $5/month)

---

## Sample Architecture

```
User visits: https://racepilot-dashboard.vercel.app
    ↓
React app loads in browser
    ↓
Fetches data from: https://racepilot-backend-production.up.railway.app/sessions
    ↓
Displays on interactive map
    ↓
Coach analyzes race
```

---

## Want Me to Build It?

I can help you:

1. **Set up React dashboard** with map
2. **Connect to your Railway backend**
3. **Display GPS tracks** on interactive map
4. **Add basic analytics**
5. **Deploy to Vercel** (free)

This would take about 2-3 hours to build a basic version.

**Or** you can build it yourself following web tutorials for:
- React + Leaflet
- Connecting to REST API
- Deploying to Vercel

---

## Summary

**What coaches need**: A website to view race data on laptop

**What you have**: Mobile app + Backend with all the data

**What's missing**: Web dashboard (website) to visualize the data

**Solution**: Build a React web app that:
- Connects to your Railway backend
- Shows GPS tracks on a map
- Lets coaches analyze races

**Cost**: $0 (Vercel hosting is free for dashboards)

---

## Want to Start Now?

Let me know if you want me to:
1. ✅ Create a basic React dashboard starter
2. ✅ Set up map visualization
3. ✅ Connect to your Railway backend
4. ✅ Deploy to Vercel

Or you can hire a web developer to build it (cost: $500-2000 depending on features).

**The good news**: Your backend is ready! All the data is there. You just need a pretty interface to view it!
