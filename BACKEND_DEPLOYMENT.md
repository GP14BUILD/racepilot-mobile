# Backend Deployment Guide for RacePilot

**IMPORTANT**: Before publishing to Play Store, you MUST deploy your backend to a cloud server!

---

## Why You Need This

The RacePilot mobile app sends GPS and telemetry data to a backend server. Currently, your backend runs on your local PC (`http://192.168.4.103:8000`), which only works on your WiFi network.

**For Play Store users**, you need to:
1. Deploy backend to a cloud server with public access
2. Use HTTPS (not HTTP) - required for production
3. Update mobile app's `.env` with production URL
4. Rebuild AAB with production configuration

---

## Architecture Overview

```
┌─────────────────┐
│  User's Phone   │
│  (RacePilot)    │
└────────┬────────┘
         │ HTTPS
         │ Internet
         ↓
┌─────────────────────────┐
│   Cloud Server          │
│   (Your Backend)        │
│                         │
│   FastAPI + uvicorn     │
│   PostgreSQL/SQLite     │
│   Port 8000             │
└─────────────────────────┘
         │
         ↓
┌─────────────────────────┐
│   Database              │
│   (Session Data)        │
└─────────────────────────┘
```

**Key Point**: Users connect to YOUR backend server. They don't run their own backend.

---

## Deployment Options

### Option 1: DigitalOcean (Recommended - Easiest)

**Cost**: $4-6/month for basic droplet

**Why DigitalOcean?**
- Simple setup
- One-click apps
- Good documentation
- Affordable
- Built-in SSL/HTTPS

**Steps**:

1. **Create Account**
   - Go to https://www.digitalocean.com
   - Sign up (credit card required)
   - Get $200 free credit for 60 days

2. **Create Droplet**
   - Click "Create" → "Droplets"
   - Choose: **Ubuntu 22.04 LTS**
   - Plan: Basic - $6/month (1GB RAM)
   - Datacenter: Choose closest to your users
   - Authentication: SSH keys (recommended) or password
   - Click "Create Droplet"

3. **Connect to Server**
   ```powershell
   ssh root@your_droplet_ip
   ```

4. **Install Dependencies**
   ```bash
   # Update system
   apt update && apt upgrade -y

   # Install Python
   apt install python3 python3-pip python3-venv -y

   # Install git
   apt install git -y
   ```

5. **Upload Your Backend**
   ```bash
   # Clone your repo (if using git)
   git clone https://github.com/yourusername/racepilot-backend.git
   cd racepilot-backend

   # Or upload files manually with SCP:
   # From your PC:
   # scp -r C:\Users\donne\Documents\racepilot\racepilot-backend root@your_droplet_ip:/root/
   ```

6. **Set Up Backend**
   ```bash
   cd racepilot-backend

   # Create virtual environment
   python3 -m venv .venv
   source .venv/bin/activate

   # Install dependencies
   pip install -r requirements.txt
   ```

7. **Run Backend (Test)**
   ```bash
   uvicorn app.main:app --host 0.0.0.0 --port 8000
   ```

   Test: Visit `http://your_droplet_ip:8000/docs`

8. **Set Up as Service (Auto-start)**

   Create service file:
   ```bash
   nano /etc/systemd/system/racepilot.service
   ```

   Add this content:
   ```ini
   [Unit]
   Description=RacePilot Backend
   After=network.target

   [Service]
   Type=simple
   User=root
   WorkingDirectory=/root/racepilot-backend
   Environment="PATH=/root/racepilot-backend/.venv/bin"
   ExecStart=/root/racepilot-backend/.venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000
   Restart=always

   [Install]
   WantedBy=multi-user.target
   ```

   Enable and start:
   ```bash
   systemctl daemon-reload
   systemctl enable racepilot
   systemctl start racepilot
   systemctl status racepilot
   ```

9. **Set Up HTTPS with SSL**

   Install Nginx and Certbot:
   ```bash
   apt install nginx certbot python3-certbot-nginx -y
   ```

   Configure Nginx:
   ```bash
   nano /etc/nginx/sites-available/racepilot
   ```

   Add:
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       location / {
           proxy_pass http://localhost:8000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }
   }
   ```

   Enable site:
   ```bash
   ln -s /etc/nginx/sites-available/racepilot /etc/nginx/sites-enabled/
   nginx -t
   systemctl restart nginx
   ```

   Get SSL certificate (requires domain):
   ```bash
   certbot --nginx -d your-domain.com
   ```

10. **Done!**
    - Your backend is at: `https://your-domain.com`
    - Update mobile app's `.env` with this URL
    - Rebuild AAB for Play Store

---

### Option 2: AWS (Amazon Web Services)

**Cost**: ~$5-10/month (free tier available for 12 months)

**Best for**: Scalability, professional deployment

**Steps Overview**:
1. Create AWS account
2. Launch EC2 instance (t2.micro for free tier)
3. Configure security groups (port 8000, 80, 443)
4. Follow similar setup steps as DigitalOcean
5. Use AWS Certificate Manager for SSL
6. Use Elastic IP for static IP address

**Detailed Guide**: https://aws.amazon.com/getting-started/hands-on/deploy-python-application/

---

### Option 3: Google Cloud Platform

**Cost**: ~$5-10/month (free tier available)

**Steps Overview**:
1. Create GCP account
2. Create Compute Engine VM
3. Follow similar setup as DigitalOcean
4. Use Google Cloud Load Balancer for SSL

**Detailed Guide**: https://cloud.google.com/python/docs/getting-started/tutorial-app

---

### Option 4: Heroku (Easiest but Pricier)

**Cost**: $7/month minimum (no free tier anymore)

**Why Heroku?**
- Easiest deployment (git push)
- Automatic HTTPS
- No server management
- Good for beginners

**Steps**:

1. **Install Heroku CLI**
   Download from: https://devcenter.heroku.com/articles/heroku-cli

2. **Login**
   ```bash
   heroku login
   ```

3. **Prepare Your Backend**

   Create `Procfile` in backend folder:
   ```
   web: uvicorn app.main:app --host 0.0.0.0 --port $PORT
   ```

   Create `runtime.txt`:
   ```
   python-3.11
   ```

4. **Deploy**
   ```bash
   cd racepilot-backend
   git init
   heroku create racepilot-backend
   git add .
   git commit -m "Initial commit"
   git push heroku main
   ```

5. **Done!**
   - Your backend is at: `https://racepilot-backend.herokuapp.com`
   - Automatic HTTPS included!

---

### Option 5: Railway (Modern, Easy)

**Cost**: $5/month

**Why Railway?**
- Very easy deployment
- Automatic HTTPS
- GitHub integration
- Modern interface

**Steps**:

1. Go to https://railway.app
2. Sign up with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your backend repository
5. Railway auto-detects Python and deploys
6. Get your URL: `https://racepilot-backend.railway.app`

---

## Getting a Domain Name (Optional but Recommended)

Instead of using IP addresses or random URLs, get a custom domain:

**Where to Buy**:
- Namecheap: ~$10/year
- Google Domains: ~$12/year
- GoDaddy: ~$15/year

**Example**: `api.racepilot.com`

**Configure DNS**:
1. Buy domain
2. Add A record pointing to your server IP
3. Use domain in SSL setup
4. Update mobile app with: `https://api.racepilot.com`

---

## Update Mobile App Configuration

After deploying backend:

1. **Update .env**
   ```bash
   cd racepilot-mobile
   ```

   Edit `.env`:
   ```
   EXPO_PUBLIC_API_URL=https://your-domain.com
   ```

   Or:
   ```
   EXPO_PUBLIC_API_URL=https://your-droplet-ip.com
   ```

2. **Rebuild Native Project**
   ```bash
   npx expo prebuild --clean
   ```

3. **Build AAB for Play Store**
   ```bash
   .\build-aab.bat
   ```

4. **Test Before Publishing**
   - Install APK on phone
   - Start session
   - Verify data reaches production backend
   - Check backend at: `https://your-domain.com/docs`

---

## Database Considerations

### SQLite (Current Setup)
- File-based database
- Works fine for single server
- No setup needed
- Limited scalability

### PostgreSQL (Recommended for Production)
- More robust
- Better performance
- Scalable
- Required for some cloud platforms

**To Switch to PostgreSQL**:

1. Install on server:
   ```bash
   apt install postgresql postgresql-contrib -y
   ```

2. Create database:
   ```bash
   sudo -u postgres psql
   CREATE DATABASE racepilot;
   CREATE USER racepilot WITH PASSWORD 'yourpassword';
   GRANT ALL PRIVILEGES ON DATABASE racepilot TO racepilot;
   \q
   ```

3. Update backend connection string in your code

4. Run migrations:
   ```bash
   alembic upgrade head
   ```

---

## Security Considerations

### Environment Variables
Never hardcode secrets! Use environment variables:

```bash
# On server
export DATABASE_URL="postgresql://user:pass@localhost/racepilot"
export SECRET_KEY="your-secret-key"
```

### Firewall
Configure firewall to only allow necessary ports:
```bash
ufw allow 22    # SSH
ufw allow 80    # HTTP
ufw allow 443   # HTTPS
ufw enable
```

### HTTPS
Always use HTTPS in production! Required by:
- Google Play Store policies
- Modern security standards
- User trust

---

## Cost Summary

| Option | Monthly Cost | Setup Difficulty | HTTPS Included |
|--------|--------------|------------------|----------------|
| DigitalOcean | $6 | Medium | Manual setup |
| AWS EC2 | $5-10 | Medium-Hard | Manual setup |
| Google Cloud | $5-10 | Medium | Manual setup |
| Heroku | $7 | Very Easy | Yes |
| Railway | $5 | Very Easy | Yes |

**Recommendation**:
- **Beginners**: Heroku or Railway (easiest)
- **Budget-conscious**: DigitalOcean (best value)
- **Scalability**: AWS or Google Cloud

---

## Testing Your Deployment

1. **API Docs**
   Visit: `https://your-backend-url.com/docs`
   Should see FastAPI interactive documentation

2. **Create Test Session**
   Use the API docs to:
   - Create a test user
   - Create a test boat
   - Create a session
   - Send telemetry

3. **Test from Mobile App**
   - Update `.env` with production URL
   - Build and install APK
   - Start session
   - Verify data appears in backend

---

## Monitoring and Maintenance

### Check Backend Status
```bash
systemctl status racepilot
```

### View Logs
```bash
journalctl -u racepilot -f
```

### Restart Backend
```bash
systemctl restart racepilot
```

### Update Backend Code
```bash
cd racepilot-backend
git pull
systemctl restart racepilot
```

---

## Troubleshooting Deployment

### Backend Won't Start
1. Check logs: `journalctl -u racepilot -f`
2. Test manually: `uvicorn app.main:app --host 0.0.0.0 --port 8000`
3. Check Python dependencies installed
4. Verify database connection

### Can't Connect from Mobile App
1. Check backend is running: `systemctl status racepilot`
2. Test API: `curl https://your-domain.com/docs`
3. Verify firewall allows port 80/443
4. Check SSL certificate valid
5. Verify `.env` URL is correct in mobile app

### HTTPS Not Working
1. Check domain DNS points to server IP
2. Verify certbot ran successfully
3. Check Nginx configuration
4. Test: `certbot certificates`

---

## Quick Start Recommendation

**Easiest Path to Production**:

1. **Use Railway.app** ($5/month)
   - Sign up at https://railway.app
   - Connect GitHub repo
   - Deploy in 5 minutes
   - Get automatic HTTPS URL

2. **Update Mobile App**
   - Edit `.env` with Railway URL
   - Run `npx expo prebuild --clean`
   - Build AAB: `.\build-aab.bat`

3. **Test**
   - Install APK on phone
   - Start session
   - Verify data reaches Railway backend

4. **Publish to Play Store**
   - Follow PLAY_STORE_GUIDE.md
   - Submit AAB

**Total time**: ~1 hour
**Total cost**: $5/month

---

## Next Steps

1. Choose deployment platform
2. Deploy backend to cloud
3. Get HTTPS working
4. Update mobile app's `.env`
5. Rebuild AAB with production URL
6. Test thoroughly
7. Publish to Play Store!

---

## Need Help?

### Deployment Issues
- DigitalOcean: https://docs.digitalocean.com/
- Heroku: https://devcenter.heroku.com/
- Railway: https://docs.railway.app/

### FastAPI Deployment
- https://fastapi.tiangolo.com/deployment/

### Questions
Email: [INSERT YOUR EMAIL]

---

**Remember**: Without a deployed backend, your Play Store app won't work! Deploy first, then publish.
