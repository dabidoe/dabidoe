# Detailed Setup Guide

Complete step-by-step setup for Character Foundry.

---

## Prerequisites

- Node.js 18+ installed
- Git installed
- Text editor (VS Code recommended)
- Terminal/command line access

---

## 1. Clone and Setup

```bash
# Clone the repository
git clone <your-repo-url>
cd character-foundry

# Install all dependencies
cd client && npm install && cd ..
cd server && npm install && cd ..
```

---

## 2. Get API Keys

### Gemini AI (Required, Free)

1. Visit https://aistudio.google.com/apikey
2. Sign in with Google account
3. Click "Create API Key"
4. Copy the key (starts with `AIza...`)
5. Save for `.env` setup

**Free Tier Limits:**
- 15 requests per minute
- 1 million tokens per day
- More than enough for development and small production

### MongoDB (Required, Free)

1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up for free account
3. Create new project: "CharacterFoundry"
4. Build a cluster:
   - Choose "M0 FREE" tier
   - Select cloud provider (AWS recommended)
   - Choose region closest to you
   - Cluster Name: "CharacterFoundryCluster"
5. Create database user:
   - Database Access → Add New User
   - Authentication: Password
   - Username: `cfadmin`
   - Generate secure password
   - User Privileges: "Read and write to any database"
6. Whitelist IP address:
   - Network Access → Add IP Address
   - Add Current IP Address
   - Or use `0.0.0.0/0` for development (⚠️ production should restrict this)
7. Get connection string:
   - Clusters → Connect → Connect your application
   - Driver: Node.js, Version: 6.0 or later
   - Copy connection string: `mongodb+srv://cfadmin:<password>@...`
   - Replace `<password>` with your database user password

### Bunny CDN (Required for Images, $1/month)

1. Sign up at https://bunny.net
2. Create Storage Zone:
   - Storage → Add Storage Zone
   - Name: `character-foundry-assets`
   - Region: Choose closest to your users (Falkenstein, DE is good for Europe/US)
   - Replication: No (to stay cheap)
3. Get Storage API Key:
   - Account → API → FTP & API Access
   - Copy "Password" (this is your API key)
4. Create Pull Zone (CDN):
   - CDN → Add Pull Zone
   - Type: Storage
   - Origin: Select your storage zone
   - CDN Hostname: `cf-assets.b-cdn.net` (example)
5. Note your Pull Zone URL for `.env`

### Runware (Optional, Pay-as-you-go)

1. Go to https://runware.ai
2. Sign up and verify email
3. Billing → Add credits ($10 minimum)
4. API Keys → Create New Key
5. Copy API key for `.env`

**Pricing:**
- Images: ~$0.003 per 512x768 portrait
- 1000 characters = ~$3

---

## 3. Configure Environment Variables

### Server Environment

Create `server/.env`:

```bash
cd server
cp .env.example .env
```

Edit `server/.env`:

```env
# Server
PORT=3001
NODE_ENV=development

# MongoDB (replace with your connection string)
MONGODB_URI=mongodb+srv://cfadmin:YOUR_PASSWORD@cluster.mongodb.net/character-foundry?retryWrites=true&w=majority

# Gemini AI (replace with your key)
GEMINI_API_KEY=AIzaSyC-YOUR-ACTUAL-KEY-HERE

# Bunny CDN (replace with your credentials)
BUNNY_API_KEY=your-bunny-storage-password-here
BUNNY_STORAGE_ZONE=character-foundry-assets
BUNNY_CDN_HOSTNAME=cf-assets.b-cdn.net
BUNNY_REGION=de

# Runware (optional)
RUNWARE_API_KEY=your_runware_key_here

# CORS (add your production domain later)
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

### Client Environment

Create `client/.env`:

```bash
cd ../client
cp .env.example .env
```

Edit `client/.env`:

```env
# API URL (development)
VITE_API_URL=http://localhost:3001/api

# For production, change to:
# VITE_API_URL=https://your-api-domain.com/api
```

---

## 4. Test Database Connection

```bash
cd server
node -e "
import('mongodb').then(({ MongoClient }) => {
  const client = new MongoClient('YOUR_MONGODB_URI');
  client.connect()
    .then(() => {
      console.log('✓ MongoDB connected successfully');
      client.close();
    })
    .catch(err => {
      console.error('✗ MongoDB connection failed:', err.message);
    });
});
"
```

---

## 5. Start Development Servers

### Terminal 1: Backend Server

```bash
cd server
npm run dev
```

Expected output:
```
🔧 Initializing services...
✓ Gemini AI ready
✓ MongoDB connected
✓ MongoDB indexes created
✓ Bunny CDN ready
═══════════════════════════════════════════════════
🚀 Character Foundry Server
═══════════════════════════════════════════════════
📡 HTTP Server: http://localhost:3001
🔌 WebSocket: ws://localhost:3001/ws
🎮 Ready to serve characters
═══════════════════════════════════════════════════
```

### Terminal 2: Frontend App

```bash
cd client
npm run dev
```

Expected output:
```
  VITE v6.0.1  ready in 523 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h to show help
```

---

## 6. Verify Setup

### Test Health Endpoint

```bash
curl http://localhost:3001/api/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2025-11-11T13:00:00.000Z",
  "services": {
    "gemini": "connected",
    "mongodb": "connected",
    "bunny": "connected",
    "runware": "connected"
  },
  "stats": {
    "totalCharacters": 0,
    "charactersLast24h": 0
  }
}
```

### Test Character Creation

```bash
curl -X POST http://localhost:3001/api/characters/create \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "A wise elven wizard named Elara, with silver hair and mystical blue robes",
    "generateImage": true
  }'
```

This should:
1. Generate character stats with Gemini AI
2. Create character portrait with Runware
3. Upload image to Bunny CDN
4. Save to MongoDB
5. Return complete character JSON

### Test Frontend

1. Open http://localhost:5173 in browser
2. Should see landing page
3. Try creating a character
4. Check browser console for errors

---

## 7. Troubleshooting

### "Services not available" errors

**Problem:** API returns 503 errors

**Solution:**
1. Check `.env` file exists in `server/`
2. Verify all API keys are correct
3. Test each service individually:

```bash
# Test MongoDB
npm run test-db

# Test Gemini
npm run test-gemini

# Test Bunny
npm run test-bunny
```

### MongoDB connection timeout

**Problem:** "MongoServerSelectionError"

**Solutions:**
1. Verify connection string is correct
2. Check IP is whitelisted in MongoDB Atlas
3. Try using `0.0.0.0/0` temporarily for testing
4. Ensure no firewall blocking port 27017

### Gemini API errors

**Problem:** 429 Too Many Requests

**Solution:** You've exceeded free tier rate limits (15 RPM)
- Wait 1 minute between requests during testing
- Consider upgrading to paid tier for production

**Problem:** 400 Invalid API Key

**Solution:**
1. Regenerate API key in Google AI Studio
2. Ensure no extra spaces in `.env`
3. Restart server after changing `.env`

### Images not generating

**Problem:** Characters created without images

**Solutions:**
1. Check Runware API key is valid and has credits
2. Verify Bunny CDN credentials
3. Images are optional - app works without them
4. Set `generateImage: false` in requests to skip images

### CORS errors in browser

**Problem:** "Access-Control-Allow-Origin" error

**Solution:**
1. Add client URL to `ALLOWED_ORIGINS` in `server/.env`
2. Restart server
3. Clear browser cache

---

## 8. Next Steps

✅ Development environment running
📋 TODO: Update React components to use new API
📋 TODO: Add authentication system
📋 TODO: Deploy to production
📋 TODO: Set up CI/CD pipeline

---

## Need Help?

- Check server logs in terminal
- Inspect browser console (F12)
- Review API responses with `curl -v`
- Check MongoDB Atlas logs
- Verify all API keys are active

**All set? Start building!** 🚀
