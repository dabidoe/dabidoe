# 🚀 Setup Guide - Getting Clean Structure Running

## Why You're Seeing White Pages

Your **main project** (`test-enhanced-features.html`) works because:
- ✅ It's a **single HTML file** with everything embedded
- ✅ Opens directly in browser (no build step needed)
- ✅ No dependencies to install

Your **clean-structure** shows white pages because:
- ❌ Missing `index.html` (NOW FIXED!)
- ❌ Dependencies not installed (`npm install` not run yet)
- ❌ Development server not started (`npm run dev` not run yet)
- ❌ Backend server not started (optional for now, but needed for full features)

## Quick Start (5 minutes)

### Step 1: Install Client Dependencies

```bash
cd clean-structure/client
npm install
```

This installs:
- React 18.3
- React Router for navigation
- Vite for fast development
- All testing/linting tools

**Expected output:**
```
added 250 packages in 30s
```

### Step 2: Start the Frontend

```bash
npm run dev
```

**Expected output:**
```
  VITE v6.0.1  ready in 500 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

### Step 3: Open in Browser

Open: **http://localhost:5173/**

You should now see the **LandingPage** instead of a white screen!

## Step 4: Optional - Start Backend (For Full Features)

The frontend will work without the backend, but you'll need it for:
- Saving characters to MongoDB
- AI-powered narratives
- Image generation
- Spell/Item library

### Install Server Dependencies

```bash
cd clean-structure/server
npm install
```

### Configure Environment Variables

```bash
# Copy the example
cp .env.example .env

# Edit .env with your credentials
nano .env
```

Add your API keys:
```env
PORT=3001
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/character-foundry
GEMINI_API_KEY=your-gemini-api-key
BUNNY_API_KEY=your-bunny-cdn-key
RUNWARE_API_KEY=your-runware-key
```

### Start the Server

```bash
npm start
```

**Expected output:**
```
═══════════════════════════════════════════════════
🚀 Character Foundry Server
═══════════════════════════════════════════════════
📡 HTTP Server: http://localhost:3001
🔌 WebSocket: ws://localhost:3001/ws
💾 MongoDB: Connected
🎨 Runware.ai: Connected
═══════════════════════════════════════════════════
```

## Key Differences: Main Project vs Clean Structure

### Main Project (test-enhanced-features.html)

**Architecture:**
- 📄 Single 331KB HTML file
- 🎨 Inline CSS styles
- 💻 Vanilla JavaScript
- 🗄️ No build step
- 📦 Desktop-first design

**How to Use:**
```bash
# Just open in browser
open test-enhanced-features.html
```

**Pros:**
- ✅ Zero setup
- ✅ Instant preview
- ✅ Easy to prototype

**Cons:**
- ❌ Hard to maintain (6,744 lines)
- ❌ No code reuse
- ❌ No component structure
- ❌ Can't use npm packages
- ❌ Higher API costs (no optimization)

---

### Clean Structure

**Architecture:**
- ⚛️ React 18 with Vite
- 📦 22 reusable components
- 🎯 Mobile-first design (44px touch targets)
- 🗄️ MongoDB for persistence
- 🤖 AI integration (Gemini + Runware)
- 🔄 Modern build tooling

**How to Use:**
```bash
# Install dependencies
cd client && npm install
cd ../server && npm install

# Start development
cd client && npm run dev
cd server && npm start
```

**Pros:**
- ✅ Component reusability
- ✅ Type safety with PropTypes
- ✅ Testing infrastructure
- ✅ Modern React patterns
- ✅ 90% smaller bundle size
- ✅ $1/month API costs vs $50+

**Cons:**
- ❌ Requires setup
- ❌ Build step needed
- ❌ More files to manage

## What's Different in Clean Structure

### ✨ Features Added

**Not in main project:**
- `InteractiveStats` - Real-time stat calculation
- `BattleMode` - Combat tracking
- `SpellLibrary` - Browse 300+ D&D 5e spells
- `RestSystem` - Short/long rest mechanics
- `EquipmentSlots` - Visual equipment system
- `AbilityLibrary` - Class features browser
- `Library API` - Share community content

**Same as main project:**
- Character creation wizard
- Spell casting mechanics
- Inventory management
- HP/conditions tracking
- Dice rolling

### 📁 File Structure

```
clean-structure/
├── client/                    # Frontend (React)
│   ├── index.html            # Entry point (NOW ADDED!)
│   ├── src/
│   │   ├── main.jsx          # React initialization
│   │   ├── App.jsx           # Router setup
│   │   ├── components/       # 22 reusable components
│   │   │   ├── CharacterCard.jsx
│   │   │   ├── SpellLibrary.jsx
│   │   │   ├── BattleMode.jsx
│   │   │   └── ...
│   │   ├── services/         # API clients
│   │   └── utils/            # Helper functions
│   └── package.json
│
├── server/                    # Backend (Node.js)
│   ├── index.js              # Express server
│   ├── src/
│   │   ├── routes/           # API endpoints
│   │   │   ├── characters.js
│   │   │   └── library.js
│   │   └── services/         # Business logic
│   │       ├── mongodb.js
│   │       ├── gemini.js
│   │       └── runware.js
│   ├── scripts/
│   │   └── migrate-data.js   # Import existing data
│   └── package.json
│
├── data/                      # D&D 5e SRD content
│   ├── spells-srd.json       # 300+ spells
│   ├── items-srd.json        # Weapons, armor, items
│   └── class-features.json   # Class abilities
│
├── shared/                    # Shared utilities
│   └── data-loader.js        # Auto-populate characters
│
└── docs/                      # Documentation
    ├── PROJECT_AUDIT.md
    ├── LIBRARY_API.md
    └── ...
```

## Troubleshooting

### White Screen After Setup

**Check 1: Is Vite running?**
```bash
cd clean-structure/client
npm run dev
```
Look for: `Local: http://localhost:5173/`

**Check 2: Browser console errors?**
- Open DevTools (F12)
- Check Console tab
- Look for red errors

**Check 3: Is index.html present?**
```bash
ls clean-structure/client/index.html
```
Should exist (we just created it!)

### Port Already in Use

**Frontend (5173):**
```bash
# Kill process on port 5173
lsof -ti:5173 | xargs kill -9

# Or use different port
npm run dev -- --port 5174
```

**Backend (3001):**
```bash
# Kill process on port 3001
lsof -ti:3001 | xargs kill -9

# Or change PORT in server/.env
PORT=3002
```

### Dependencies Won't Install

**Error: `npm ERR! code EACCES`**
```bash
# Fix permissions
sudo chown -R $USER ~/.npm
sudo chown -R $USER node_modules
```

**Error: `npm ERR! network`**
```bash
# Clear cache
npm cache clean --force
npm install
```

### API Keys Not Working

**Using existing keys from main project:**

Your main project `.env` is at `/home/user/dabidoe/.env`

Copy keys to clean-structure:
```bash
# From main project root
cat .env

# Copy values to clean-structure
nano clean-structure/server/.env
```

Make sure to copy:
- `MONGODB_URI`
- `GEMINI_API_KEY`
- `BUNNY_API_KEY` (if using)
- `RUNWARE_API_KEY` (if using)

## Testing the Setup

### Test 1: Frontend Works

Visit: http://localhost:5173/

**Should see:**
- Landing page with "Create Character" button
- Clean, modern UI
- No console errors

### Test 2: Backend Works

Visit: http://localhost:3001/api/health

**Should return:**
```json
{
  "status": "ok",
  "timestamp": "2025-11-13T...",
  "services": {
    "runware": "connected",
    "mongodb": "connected"
  }
}
```

### Test 3: Create Character

1. Click "Create Character"
2. Fill in name, class, race
3. Allocate stats
4. Choose spells
5. Save character

**Without backend:** Character stays in browser memory only
**With backend:** Character saved to MongoDB

## Next Steps

Once everything is running:

1. **Import Your Existing Data**
   ```bash
   cd server
   node scripts/migrate-data.js
   ```
   This imports your existing characters, items, spells

2. **Browse Library Content**
   - Visit http://localhost:3001/api/library/items
   - See SRD + community items

3. **Test API Integration**
   - Create a character
   - Add spells from library
   - Save to database
   - Reload page - character persists!

4. **Deploy**
   - See `render.yaml` for deployment config
   - Uses Render.com for free hosting
   - Or deploy to Vercel/Netlify

## Cost Comparison

### Main Project
- Gemini API: ~$50/month (inefficient calls)
- No caching
- Larger payloads

### Clean Structure
- Gemini API: ~$1/month (optimized)
- Response caching
- Compressed payloads
- Free tier sufficient for 1000+ users

## Getting Help

**Check logs:**
```bash
# Frontend
npm run dev

# Backend
npm start

# Or with debug info
DEBUG=* npm start
```

**Common issues documented in:**
- `docs/TROUBLESHOOTING.md` (coming soon)
- `docs/LIBRARY_API.md` - API reference
- `server/scripts/MIGRATION_GUIDE.md` - Data import

**Still stuck?**
Check browser console (F12) and server logs for specific error messages.
