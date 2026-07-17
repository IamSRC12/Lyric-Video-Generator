# 🐳 Docker Whisper Setup Guide - Step by Step

## ⚠️ Current Issue
**Error**: "Failed to sync: Failed to fetch"
**Cause**: Docker Whisper API is not running or not accessible

## ✅ Solution - Complete Setup

### Step 1: Check if Docker is Installed

Open PowerShell and run:
```powershell
docker --version
```

**Expected Output**: `Docker version 20.x.x` or similar

**If you get an error**: Docker is not installed. Download from: https://www.docker.com/products/docker-desktop

---

### Step 2: Navigate to Docker Directory

```powershell
cd "a:\Antigravity\Project Universe\Lyric-Video-Generator\docker"
```

---

### Step 3: Start Docker Whisper

```powershell
docker-compose up -d
```

**What this does**:
- `-d` = runs in background (detached mode)
- Builds the Whisper container
- Starts the API server on port 5000

**Expected Output**:
```
Creating network "docker_default" with the default driver
Building whisper-api
...
Creating whisper-api ... done
```

**⏱️ First Time**: Takes 5-10 minutes to download and build
**After First Time**: Starts in 5-10 seconds

---

### Step 4: Verify Docker is Running

```powershell
docker ps
```

**Expected Output**:
```
CONTAINER ID   IMAGE          COMMAND                  STATUS         PORTS                    NAMES
abc123def456   whisper-api    "python whisper-api.py"  Up 2 minutes   0.0.0.0:5000->5000/tcp   whisper-api
```

**Look for**:
- ✅ Container named `whisper-api`
- ✅ Status: `Up X minutes`
- ✅ Ports: `0.0.0.0:5000->5000/tcp`

---

### Step 5: Test the API

```powershell
curl http://localhost:5000/health
```

**Expected Output**:
```json
{"status":"healthy","model":"base"}
```

**If this works**: ✅ Docker Whisper is ready!

---

### Step 6: Use in the App

1. Open `index.html` in browser
2. Select **"Local Docker (Unlimited free)"** from API Provider dropdown
3. API key section should disappear (not needed for Docker)
4. Upload audio and click "AI Sync & Analyze"

---

## 🔧 Troubleshooting

### Issue 1: "docker: command not found"
**Solution**: Install Docker Desktop
- Download: https://www.docker.com/products/docker-desktop
- Install and restart computer
- Start Docker Desktop application

### Issue 2: "Cannot connect to Docker daemon"
**Solution**: Start Docker Desktop
- Open Docker Desktop application
- Wait for it to fully start (whale icon in system tray)
- Try again

### Issue 3: "Port 5000 is already in use"
**Solution**: Change the port
1. Edit `docker-compose.yml`
2. Change `"5000:5000"` to `"5001:5000"`
3. Update `groq-service.js` line with local URL to use port 5001

### Issue 4: Container builds but API doesn't respond
**Solution**: Check container logs
```powershell
docker logs whisper-api
```

Look for errors and share them for help.

### Issue 5: "Failed to fetch" in browser
**Solution**: Check if API is accessible
1. Open browser
2. Go to: http://localhost:5000/health
3. Should see: `{"status":"healthy","model":"base"}`
4. If not, Docker isn't running properly

---

## 🎯 Quick Commands Reference

### Start Docker Whisper
```powershell
cd "a:\Antigravity\Project Universe\Lyric-Video-Generator\docker"
docker-compose up -d
```

### Stop Docker Whisper
```powershell
docker-compose down
```

### Restart Docker Whisper
```powershell
docker-compose restart
```

### View Logs
```powershell
docker logs whisper-api
```

### Check Status
```powershell
docker ps
```

### Test API
```powershell
curl http://localhost:5000/health
```

---

## 🚀 Alternative: Use Cloud API Instead

If Docker is too complex, use a cloud API instead:

### **Recommended: AssemblyAI** (100 hours/month FREE)

1. Go to: https://www.assemblyai.com/dashboard/signup
2. Sign up (free)
3. Copy your API key
4. In the app:
   - Select **"AssemblyAI (100 hours/month free)"**
   - Paste your API key
   - Click "AI Sync & Analyze"

**Pros**:
- ✅ No Docker needed
- ✅ Faster than local
- ✅ 100 hours/month free
- ✅ Very accurate

**Cons**:
- ❌ Requires internet
- ❌ Limited to 100 hours/month

---

## 📊 What to Do Now?

### Option A: Fix Docker (Recommended for unlimited use)
1. Install Docker Desktop if not installed
2. Start Docker Desktop
3. Run: `docker-compose up -d`
4. Test: `curl http://localhost:5000/health`
5. Use the app

### Option B: Use Cloud API (Easier, faster)
1. Sign up for AssemblyAI (free)
2. Get API key
3. Select AssemblyAI in app
4. Start creating videos

---

**Which option would you like to try?** 🤔

I can help you with either:
- 🐳 Setting up Docker Whisper
- ☁️ Getting AssemblyAI API key
