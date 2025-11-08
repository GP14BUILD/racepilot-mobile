# Railway Deployment - Step by Step

You've connected Railway to GitHub! Now let's deploy your backend.

---

## Step 1: Push Backend to GitHub (If Not Already)

First, make sure your backend code is on GitHub.

```bash
cd C:\Users\donne\Documents\racepilot\racepilot-backend

# Initialize git if needed
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - RacePilot Backend"

# Create GitHub repo (via GitHub website or CLI)
# Then push:
git remote add origin https://github.com/YOUR_USERNAME/racepilot-backend.git
git branch -M main
git push -u origin main
```

---

## Step 2: Deploy on Railway

### A. Go to Railway Dashboard
1. Visit: https://railway.app/dashboard
2. Click **"New Project"**

### B. Deploy from GitHub
1. Click **"Deploy from GitHub repo"**
2. Select **"racepilot-backend"** from the list
3. Click on it

### C. Railway Auto-Deploys
Railway will:
- Detect Python automatically
- Install dependencies from `requirements.txt`
- Try to start your app

---

## Step 3: Configure Start Command

Railway needs to know how to start your FastAPI app.

### A. Add Procfile

Create a file called `Procfile` (no extension) in your backend folder:

```
web: uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

### B. Or Configure in Railway Dashboard

1. In Railway dashboard, click your deployment
2. Go to **Settings**
3. Find **"Start Command"**
4. Enter:
   ```
   uvicorn app.main:app --host 0.0.0.0 --port $PORT
   ```
5. Click **Save**

---

## Step 4: Get Your URL

### A. Generate Domain
1. In Railway dashboard, click your deployment
2. Go to **Settings** tab
3. Scroll to **"Domains"** section
4. Click **"Generate Domain"**
5. You'll get something like:
   ```
   https://racepilot-backend-production-xxxx.up.railway.app
   ```

### B. Copy This URL
You'll need it for your mobile app!

---

## Step 5: Test Your Backend

### Check API Docs
Visit: `https://your-railway-url.up.railway.app/docs`

You should see the FastAPI interactive documentation!

### Test Endpoints
Try creating a test user, boat, and session through the docs interface.

---

## Step 6: Update Mobile App

### A. Update .env
```bash
cd C:\Users\donne\Documents\racepilot\racepilot-mobile
```

Edit `.env`:
```
EXPO_PUBLIC_API_URL=https://your-railway-url.up.railway.app
```

### B. Rebuild Native Code
```bash
npx expo prebuild --clean
```

### C. Build AAB for Play Store
```bash
.\build-aab.bat
```

---

## Step 7: Test End-to-End

### A. Build Test APK
```bash
.\build-apk-fixed.bat
```

### B. Install on Phone
Transfer and install the APK on your phone.

### C. Test Session
1. Open RacePilot
2. Tap "START SESSION"
3. Grant permissions
4. Wait for GPS lock
5. Walk around
6. Check Railway logs to see data coming in!

### D. View Railway Logs
In Railway dashboard:
1. Click your deployment
2. Go to **"Observability"** tab
3. See real-time logs of API requests

---

## Troubleshooting

### Deployment Failed

**Check Build Logs**:
1. Railway dashboard → Your project
2. Click on deployment
3. View **"Deploy Logs"**

**Common Issues**:

1. **Missing dependencies**
   - Make sure `requirements.txt` is complete
   - Include: `fastapi`, `uvicorn`, `pydantic`, `sqlalchemy`

2. **Wrong Python version**
   - Add `runtime.txt` to specify version:
     ```
     python-3.11
     ```

3. **Port binding**
   - Make sure you use `$PORT` environment variable
   - Railway assigns the port dynamically

### Can't Access API

**Check**:
1. Domain is generated in Railway settings
2. HTTPS (not HTTP) in URL
3. Visit `/docs` endpoint first to verify it's up

### Database Issues

**SQLite Location**:
Railway uses ephemeral storage. For production, you might want PostgreSQL.

**Add Railway PostgreSQL**:
1. In Railway dashboard
2. Click **"New"** → **"Database"** → **"PostgreSQL"**
3. Railway auto-connects it to your app
4. Update your backend code to use `DATABASE_URL` environment variable

---

## Environment Variables (Optional)

If your backend needs environment variables:

1. Railway dashboard → Your project
2. Go to **"Variables"** tab
3. Add variables:
   - `DATABASE_URL` (if using PostgreSQL)
   - `SECRET_KEY` (for JWT tokens)
   - Any other secrets

---

## Custom Domain (Optional)

Want `api.racepilot.com` instead of Railway's URL?

### A. Buy Domain
Get a domain from Namecheap, Google Domains, etc. (~$10/year)

### B. Add to Railway
1. Railway dashboard → Your project
2. Settings → Domains
3. Click **"Custom Domain"**
4. Enter: `api.racepilot.com`

### C. Update DNS
Railway will show you DNS records to add:
- Type: CNAME
- Name: api
- Value: your-railway-project.railway.app

### D. Wait for DNS
Takes 5-60 minutes for DNS to propagate.

### E. HTTPS Automatic
Railway automatically provisions SSL certificate!

---

## Monitoring Your Backend

### Railway Dashboard Shows:
- **CPU usage**
- **Memory usage**
- **Request count**
- **Response times**
- **Deployment history**
- **Real-time logs**

### View Logs:
```
Railway dashboard → Observability → Logs
```

See all API requests as they happen!

---

## Updating Your Backend

When you make code changes:

```bash
cd racepilot-backend
git add .
git commit -m "Update: description of changes"
git push
```

Railway automatically:
1. Detects the push
2. Rebuilds your app
3. Deploys the new version
4. Zero downtime!

---

## Costs

Railway pricing:
- **$5/month** for Hobby plan
- Includes:
  - 500 hours runtime
  - 100GB egress
  - HTTPS
  - Custom domains

Perfect for RacePilot!

---

## Success Checklist

- [ ] Backend code pushed to GitHub
- [ ] Railway connected to GitHub
- [ ] Deployed from GitHub repo
- [ ] Procfile or Start Command configured
- [ ] Domain generated
- [ ] API accessible at `/docs`
- [ ] Mobile app `.env` updated with Railway URL
- [ ] AAB built with production URL
- [ ] Tested end-to-end (phone → Railway)
- [ ] Logs showing API requests

---

## Your URLs

**Railway Backend**: `https://_____________________.up.railway.app`

**API Docs**: `https://_____________________.up.railway.app/docs`

**Mobile App Config**:
```
EXPO_PUBLIC_API_URL=https://_____________________.up.railway.app
```

Fill these in once deployed!

---

## Next Steps After Deployment

1. Test thoroughly with mobile app
2. Build AAB for Play Store
3. Follow PLAY_STORE_GUIDE.md
4. Publish to Google Play!

---

## Need Help?

- **Railway Docs**: https://docs.railway.app/
- **Railway Discord**: https://discord.gg/railway
- **FastAPI Deployment**: https://fastapi.tiangolo.com/deployment/

---

**You're almost there!** Once backend is deployed, you're ready for Play Store! 🚀
