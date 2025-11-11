# Migration from Old Repo to Clean Structure

This document explains what changed and how to move forward.

---

## What Was Done

### ✅ Kept (The Good Stuff)

**Frontend (`client/`):**
- ✅ All React components from `src/`
- ✅ Complete component library (17 components)
- ✅ Routing, state management, UI
- ✅ Package.json with dependencies
- ✅ Vite config, ESLint, Prettier

**Backend (`server/`):**
- ✅ Express API structure
- ✅ WebSocket support
- ✅ Runware integration
- ✅ Character routes foundation

**Data:**
- ✅ Sample spells and items JSON
- ✅ Test data for development

**Configuration:**
- ✅ .env.example files
- ✅ .gitignore
- ✅ Core configs

### ❌ Removed (The Cruft)

- ❌ **37 Python scripts** (one-off migrations/fixes)
- ❌ **4 HTML test files** (including 323KB test-enhanced-features.html)
- ❌ **20+ markdown docs** (kept only essential ones)
- ❌ Unused dependencies
- ❌ Legacy code and experiments

### 🆕 Added (New Integrations)

**New Services:**
- ✨ `server/src/services/gemini.js` - Gemini Flash 2.0 integration (cheap AI)
- ✨ `server/src/services/mongodb.js` - MongoDB persistence
- ✨ `server/src/services/bunny.js` - Bunny CDN file uploads
- ✨ Updated `server/index.js` - Integrated all services

**New Documentation:**
- 📚 `docs/SETUP.md` - Detailed setup instructions
- 📚 `docs/DEPLOY.md` - Production deployment guide
- 📚 `README.md` - Clean, focused overview

**Deployment Configs:**
- ⚙️ `client/vercel.json` - Vercel deployment
- ⚙️ `server/vercel.json` - API deployment
- ⚙️ `render.yaml` - Render deployment (alternative)

---

## File Mapping

### Old Structure → New Structure

```
OLD REPO                          NEW CLEAN REPO
─────────────────────────────────────────────────────────
src/                        →     client/src/
server/                     →     server/src/
package.json                →     client/package.json
server/package.json         →     server/package.json
data/                       →     data/
.env.example                →     server/.env.example
README.md                   →     README.md (rewritten)

test-enhanced-features.html → ❌ REMOVED (too big, monolithic)
*.py (37 files)            → ❌ REMOVED (migration scripts)
test-*.html                → ❌ REMOVED (dev tests)
20+ .md docs               → ❌ REMOVED (kept essential only)
```

---

## Features Extracted from test-enhanced-features.html

The test HTML file had many features inline. Here's the status:

### ✅ Already in React App

- Character display with portrait
- HP/AC stats
- Ability buttons
- Chat interface
- Dice rolling overlay
- Character creation flow
- Browse/gallery page
- Expanded stats view

**Components:**
- `CharacterCard.jsx` - Main character view
- `EnhancedChatInterface.jsx` - 3-mode chat (Conversation, Battle, Skills)
- `DiceRollOverlay.jsx` - Animated dice rolls
- `ExpandedStats.jsx` - Full D&D stats
- `CharacterImageTabs.jsx` - Multi-image display
- `CharacterCreation.jsx` - Creation flow
- `AbilityCard.jsx`, `AbilityIcon.jsx` - Ability UI

### 🔄 Needs API Integration

These React components exist but need backend hookup:

1. **Character Creation** → Connect to `POST /api/characters/create`
2. **Chat Interface** → Connect to `POST /api/characters/:id/chat`
3. **Ability Usage** → Connect to `POST /api/characters/:id/ability`
4. **Stats Updates** → Connect to `PATCH /api/characters/:id/stats`

### ⚡ New Backend Features

Already implemented in new clean repo:

- **Gemini AI conversations** - Character personality responses
- **MongoDB persistence** - Save/load characters
- **Bunny CDN uploads** - Image hosting
- **Ability narratives** - AI-generated action descriptions

---

## How to Transition

### Option 1: Replace Old Repo (Recommended)

```bash
# Backup old repo
cd /path/to/dabidoe
mv * ../dabidoe-backup/
mv .* ../dabidoe-backup/

# Move clean structure in
mv ../dabidoe/clean-structure/* .
mv ../dabidoe/clean-structure/.* .

# Clean up
rm -rf ../dabidoe-backup/node_modules
rm -rf ../dabidoe-backup/server/node_modules
```

### Option 2: New Repository

```bash
# Create new repo
cd /path/to/clean-structure
git init
git add .
git commit -m "feat: clean repo structure with Gemini + MongoDB + Bunny CDN"

# Push to new remote
git remote add origin <your-new-repo-url>
git push -u origin main
```

### Option 3: Keep Both (Side by Side)

```bash
# Just work in clean-structure/
cd clean-structure
npm install  # in both client/ and server/
```

---

## Next Steps for Your Dev

### 1. Setup (30 minutes)

Follow `docs/SETUP.md`:
1. Get API keys (Gemini, MongoDB, Bunny CDN)
2. Configure `.env` files
3. Install dependencies
4. Start dev servers

### 2. API Integration (2-3 hours)

Update React components to call new backend:

**In `client/src/services/api.js`:**
```javascript
// Replace mock data with real API calls
export async function createCharacter(prompt) {
  const response = await fetch(`${API_URL}/characters/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, generateImage: true })
  });
  return response.json();
}

export async function chatWithCharacter(characterId, message) {
  const response = await fetch(`${API_URL}/characters/${characterId}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message })
  });
  return response.json();
}

// ... etc
```

### 3. Test Locally (1 hour)

- Test character creation
- Test chat conversations
- Test image generation
- Test stat updates
- Test all UI components

### 4. Deploy (1 hour)

Follow `docs/DEPLOY.md`:
- Deploy backend to Render/Vercel
- Deploy frontend to Vercel
- Configure environment variables
- Test production

---

## What Your Dev Needs to Know

### Tech Stack

**Frontend:**
- React 18 + Vite
- React Router for navigation
- CSS3 with modern animations
- Mobile-first responsive design

**Backend:**
- Node.js + Express
- Gemini Flash 2.0 (AI conversations)
- MongoDB (data persistence)
- Bunny CDN (image hosting)
- Runware (image generation)
- WebSockets (real-time updates)

### Key Directories

```
client/
├── src/
│   ├── components/      ← React components (17 files)
│   ├── services/        ← API integration
│   └── utils/           ← Helper functions

server/
├── src/
│   ├── routes/          ← API endpoints
│   ├── services/        ← External integrations
│   │   ├── gemini.js    ← AI conversations
│   │   ├── mongodb.js   ← Database
│   │   ├── bunny.js     ← CDN uploads
│   │   └── runware.js   ← Image generation
│   └── middleware/      ← Express middleware
└── index.js             ← Server entry point
```

### API Endpoints

```
GET    /api/health                    # Health check
GET    /api/characters                # List characters
GET    /api/characters/:id            # Get character
POST   /api/characters/create         # Create from prompt
POST   /api/characters/:id/chat       # Chat with character
POST   /api/characters/:id/ability    # Use ability
PATCH  /api/characters/:id/stats      # Update stats
DELETE /api/characters/:id            # Delete character
```

### Environment Variables Needed

**Server:**
- `MONGODB_URI` - MongoDB connection string
- `GEMINI_API_KEY` - Google Gemini API key
- `BUNNY_API_KEY` - Bunny CDN storage password
- `BUNNY_STORAGE_ZONE` - Storage zone name
- `BUNNY_CDN_HOSTNAME` - Pull zone hostname
- `RUNWARE_API_KEY` - Runware API key (optional)

**Client:**
- `VITE_API_URL` - Backend API URL

---

## Testing the Clean Repo

### Quick Test

```bash
# Terminal 1: Start backend
cd server
npm install
npm run dev

# Terminal 2: Start frontend
cd client
npm install
npm run dev

# Terminal 3: Test API
curl http://localhost:3001/api/health
```

Expected: Server starts, frontend loads at http://localhost:5173

### Create Character Test

```bash
curl -X POST http://localhost:3001/api/characters/create \
  -H "Content-Type: application/json" \
  -d '{"prompt": "A brave elven ranger named Aria", "generateImage": true}'
```

Expected: Character JSON with stats, abilities, and image URL

---

## Cost Breakdown

### Development (Free)
- Local development: $0
- Testing: $0

### Production (Cheap)
- Vercel (hosting): $0/month (free tier)
- Render (API): $0/month (free tier, with cold starts)
- MongoDB Atlas: $0/month (free tier, 512MB)
- Bunny CDN: $1/month (1TB bandwidth)
- Gemini Flash: $0/month (free tier, then $0.075 per 1M tokens)
- Runware: ~$3 per 1000 characters (1 image each)

**Total: $1-5/month for thousands of users**

---

## Support

**Documentation:**
- `README.md` - Overview
- `docs/SETUP.md` - Detailed setup
- `docs/DEPLOY.md` - Deployment guide

**Code Comments:**
- All service files have detailed JSDoc comments
- Routes have clear descriptions
- Example usage in service files

**Need Help?**
- Check server console logs
- Check browser console
- Test API with curl
- Review MongoDB Atlas logs

---

## Summary

✅ **What You Have:**
- Clean, organized codebase
- Modern React app with all components
- Node backend with AI, database, and CDN integrations
- Complete documentation
- Deployment configs for $0 hosting
- Ready for your dev to start working

✅ **What Changed:**
- Removed 37 Python scripts and test HTML files
- Added Gemini AI integration (cheap conversations)
- Added MongoDB persistence
- Added Bunny CDN uploads
- Reorganized into clean client/server structure
- Professional documentation

✅ **Next Steps:**
- Follow SETUP.md to get running
- Connect React components to new API
- Deploy to production
- Start building features!

**Estimated time to working production: 4-6 hours**
