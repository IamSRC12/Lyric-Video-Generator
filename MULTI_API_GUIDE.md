# 🎯 Multi-API Integration Guide

## ✅ What's New

Your Lyric Video Generator now supports **5 different API providers**! Choose the one that works best for you.

## 🔌 Available Providers

### 1. **Groq** (Default)
- ✅ **Free**
- ⚠️ Rate limit: 20 requests/minute
- 🔗 Get API key: https://console.groq.com
- **Best for**: Small projects, testing

### 2. **OpenRouter**
- 💰 **Paid**: $0.006/minute
- ✅ No rate limits
- 🔗 Get API key: https://openrouter.ai/keys
- **Best for**: When you need reliability and speed

### 3. **AssemblyAI**
- ✅ **Free**: 100 hours/month
- ✅ Very accurate
- 🔗 Get API key: https://www.assemblyai.com/dashboard/signup
- **Best for**: High-quality transcription needs

### 4. **Deepgram**
- ✅ **Free**: $200 credit (~45 hours)
- ✅ Fast and accurate
- 🔗 Get API key: https://console.deepgram.com/signup
- **Best for**: Real-time transcription

### 5. **Local Docker** (Recommended!)
- ✅ **Completely Free**
- ✅ **Unlimited**
- ✅ No API key needed
- ✅ Works offline
- **Best for**: Privacy, unlimited usage

## 🚀 How to Use

### Step 1: Choose Provider
Open the app and select your provider from the dropdown:
```
🔌 API Provider: [Groq ▼]
```

### Step 2: Enter API Key
- For cloud providers (Groq, OpenRouter, AssemblyAI, Deepgram): Enter your API key
- For Local Docker: No API key needed!

### Step 3: Upload & Process
Upload your audio files and click "AI Sync & Analyze"

## 🐳 Setting Up Local Docker (Recommended)

### Quick Start:
```bash
cd "a:\Antigravity\Project Universe\Lyric-Video-Generator\docker"
docker-compose up -d
```

### Check if Running:
```bash
docker ps
```

You should see `whisper-api` container running.

### Test the API:
```bash
curl http://localhost:5000/health
```

Should return: `{"status": "healthy", "model": "base"}`

## 💡 Which Provider Should I Use?

### For Free & Unlimited:
→ **Local Docker** (best option!)

### For Quick Testing:
→ **Groq** (free, but rate limited)

### For Best Free Tier:
→ **AssemblyAI** (100 hours/month free)

### For Production/Reliability:
→ **OpenRouter** or **Deepgram** (paid but reliable)

## 🔄 Switching Providers

You can switch providers anytime:
1. Select different provider from dropdown
2. Enter new API key (if needed)
3. Click "AI Sync & Analyze"

The app will automatically use the new provider!

## 📊 Cost Comparison

| Provider | Cost | Free Tier | Rate Limit |
|----------|------|-----------|------------|
| Groq | Free | ∞ | 20/min |
| OpenRouter | $0.006/min | $5-10 credits | None |
| AssemblyAI | Free | 100 hrs/month | None |
| Deepgram | Free | $200 credit | None |
| Local Docker | Free | ∞ | None |

## 🎯 Recommendations

**For Most Users**: Start with **Local Docker** - it's free, unlimited, and works great!

**If Docker is Too Complex**: Use **AssemblyAI** (100 hours/month free)

**For Testing**: Use **Groq** (free but slow due to rate limits)

**For Production**: Use **OpenRouter** or **Deepgram** (paid but reliable)

---

**Ready to use!** Just reload the page and select your preferred provider! 🚀
