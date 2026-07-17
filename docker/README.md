# 🐳 Local Whisper API with Docker

Run Whisper transcription **completely free and unlimited** on your own computer!

## Quick Start

### Option 1: Docker Compose (Easiest)

```bash
cd docker
docker-compose up -d
```

That's it! The API will be running at `http://localhost:5000`

### Option 2: Docker Build

```bash
cd docker
docker build -t whisper-api .
docker run -p 5000:5000 -e MODEL_SIZE=base whisper-api
```

## Model Sizes

Choose based on your needs:

| Model  | Speed | Accuracy | RAM Usage |
|--------|-------|----------|-----------|
| tiny   | ⚡⚡⚡  | ⭐       | ~1 GB     |
| base   | ⚡⚡   | ⭐⭐     | ~1 GB     |
| small  | ⚡    | ⭐⭐⭐   | ~2 GB     |
| medium | 🐌    | ⭐⭐⭐⭐ | ~5 GB     |
| large  | 🐌🐌  | ⭐⭐⭐⭐⭐| ~10 GB    |

**Recommended**: `base` for good balance of speed and accuracy

To change model:
```bash
docker-compose down
# Edit docker-compose.yml, change MODEL_SIZE
docker-compose up -d
```

## Configure the Web App

1. Open `index.html` in the Lyric Video Generator
2. Find the API URL setting (or I'll add it)
3. Set to: `http://localhost:5000`
4. Leave API key empty (not needed for local)

## API Endpoints

### Health Check
```bash
curl http://localhost:5000/health
```

### Transcribe
```bash
curl -X POST http://localhost:5000/v1/audio/transcriptions \
  -F "file=@audio.mp3" \
  -F "language=en"
```

## Benefits

✅ **Completely Free** - No API costs  
✅ **Unlimited** - No rate limits  
✅ **Private** - Your audio never leaves your computer  
✅ **Fast** - No network latency  
✅ **Offline** - Works without internet  

## Requirements

- Docker Desktop installed
- At least 2GB RAM (4GB recommended)
- 2GB disk space for models

## Troubleshooting

### Port already in use
```bash
# Change port in docker-compose.yml
ports:
  - "5001:5000"  # Use 5001 instead
```

### Out of memory
Use a smaller model:
```yaml
environment:
  - MODEL_SIZE=tiny
```

### Slow transcription
- Use GPU version (requires NVIDIA GPU + nvidia-docker)
- Use smaller model
- Reduce audio file size

## GPU Support (Optional)

For much faster transcription with NVIDIA GPU:

```yaml
services:
  whisper-api:
    runtime: nvidia
    environment:
      - MODEL_SIZE=medium
      - CUDA_VISIBLE_DEVICES=0
```

Requires: NVIDIA GPU + nvidia-docker

---

**Ready to use!** Start the Docker container and your apps will have unlimited free transcription! 🚀
