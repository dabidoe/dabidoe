# Quick Start for Your Dev Team

## What This Repo Contains

A complete mobile-first React app with:
- ✅ Loading screen
- ✅ Landing page (create/browse/info)
- ✅ Character chat interface
- ✅ Navigation/routing
- ✅ API service layer (ready to connect)

## 3 Simple Steps to Integration

### Step 1: Environment Setup (2 minutes)

```bash
# Clone and install
git clone [this-repo]
cd dabidoe
npm install

# Create .env file
cp .env.example .env

# Edit .env
REACT_APP_API_URL=http://localhost:3001/api
```

### Step 2: Connect Your APIs (15 minutes)

**Only 3 files need updating:**

#### File 1: `src/components/CharacterCard.jsx`

**Line 17-19** - Load character data:
```javascript
// REPLACE THIS:
const demoCharacters = { ... }

// WITH YOUR API:
import { getCharacter } from '../services/api'
const character = await getCharacter(characterId)
```

**Line 77-87** - Send chat messages:
```javascript
// UNCOMMENT AND USE:
import { sendMessage } from '../services/api'
const response = await sendMessage(characterId, inputMessage, messages)
```

#### File 2: `src/components/LandingPage.jsx`

**Line 11-15** - Create character from prompt:
```javascript
// REPLACE THIS:
navigate('/character/achilles')

// WITH YOUR API:
import { createCharacter } from '../services/api'
const newChar = await createCharacter(prompt)
navigate(`/character/${newChar.id}`)
```

#### File 3: `src/components/BrowsePage.jsx`

**Line 8-17** - Load character list:
```javascript
// REPLACE THIS:
const characters = [ ... demo data ... ]

// WITH YOUR API:
import { getAllCharacters } from '../services/api'
const characters = await getAllCharacters()
```

**That's it!** All API functions are already written in `src/services/api.js`

### Step 3: Test Locally (5 minutes)

```bash
# Start your Node server
cd /path/to/your/node-server
npm start  # or however you start it

# In another terminal, start React app
cd /path/to/this-repo
npm run dev

# Open browser
# Go to http://localhost:5173
```

---

## What Your Node Server Needs

### Required Endpoints

Your existing Node server should provide:

```
GET  /api/characters          → List of characters
GET  /api/characters/:id      → Single character
POST /api/characters/create   → Create from prompt
POST /api/chat                → Send message, get response
```

**See [API_CONTRACT.md](./API_CONTRACT.md) for exact request/response formats**

### CORS Configuration

Add to your Node server:

```javascript
const cors = require('cors')

app.use(cors({
  origin: ['http://localhost:5173', 'https://m.characterfoundry.io'],
  credentials: true
}))
```

---

## Expected Data Formats

### Character Object
```javascript
{
  id: "achilles",
  name: "Achilles",
  portrait: "🛡️",
  hp: { current: 104, max: 104 },
  ac: 18,
  abilities: [
    { icon: "⚔️", name: "Sword Strike" }
  ],
  initialMessage: {
    type: "character",
    mood: "Contemplative",
    text: "Greetings..."
  }
}
```

### Chat Response
```javascript
{
  type: "character",
  mood: "Happy",
  text: "The character's response..."
}
```

**Full specs in [API_CONTRACT.md](./API_CONTRACT.md)**

---

## Testing Checklist

After integration:

```bash
# 1. Test character loading
# Go to: http://localhost:5173/character/achilles
# Should show character with real data from your API

# 2. Test chat
# Type a message in the chat box
# Should send to your API and get response

# 3. Test character creation
# Go to: http://localhost:5173
# Enter prompt, click Create
# Should call your API and create character

# 4. Test browse
# Go to: http://localhost:5173/browse
# Should show list of characters from your API
```

---

## Deployment

When ready to deploy:

### Option A: Mobile Subdomain
```bash
npm run build
# Deploy dist/ to m.characterfoundry.io
```

### Option B: Mobile App
```bash
npm install @capacitor/core @capacitor/cli
npx cap init "Character Foundry" "io.characterfoundry.app"
npx cap add ios
npx cap add android
npm run build
npx cap sync
```

**Full deployment guide: [DEPLOYMENT.md](./DEPLOYMENT.md)**

---

## Common Issues

### Issue: API calls fail with CORS error
**Fix:** Add CORS configuration to your Node server (see above)

### Issue: Character not loading
**Check:**
- Is your Node server running?
- Is the API URL correct in `.env`?
- Does the character ID exist in your database?

### Issue: "Cannot find module" errors
**Fix:** `npm install`

### Issue: Environment variables not working
**Fix:**
- Restart dev server after editing `.env`
- Make sure variable starts with `REACT_APP_`

---

## File Structure Overview

```
src/
├── components/
│   ├── LoadingScreen.jsx      ← Shown on app start
│   ├── LandingPage.jsx        ← Home page (TODO here)
│   ├── BrowsePage.jsx          ← Gallery (TODO here)
│   └── CharacterCard.jsx       ← Chat interface (TODO here)
├── services/
│   └── api.js                  ← All API functions (ready to use)
└── App.jsx                     ← Router setup

Only need to edit 3 components!
```

---

## Questions to Answer Before Integration

1. **Authentication:**
   - Do users need to log in?
   - JWT? Session cookies? OAuth?

2. **Character IDs:**
   - What format? (UUID, ObjectId, slug?)

3. **Data Format:**
   - Does your character object match the expected format?
   - Need any field transformations?

4. **Rate Limiting:**
   - Should we limit character creation?
   - Chat message throttling?

5. **Discord Integration:**
   - Does mobile app need direct Discord access?
   - Or only through your Node API?

---

## Success Criteria

You'll know it's working when:

✅ Loading screen shows on app start
✅ Landing page loads without errors
✅ Character list loads from your API
✅ Clicking a character shows real data
✅ Chat messages send to your API and get responses
✅ Character creation works with your AI
✅ Navigation works between all pages

---

## Next Steps After Basic Integration

1. **Add authentication** if needed
2. **Add error boundaries** for better error handling
3. **Add loading states** on API calls
4. **Customize styling** to match your brand
5. **Add more character abilities**
6. **Integrate Discord features** if needed
7. **Set up analytics**
8. **Deploy to production**

---

## Support Files

- **Integration Guide:** [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md)
- **API Specification:** [API_CONTRACT.md](./API_CONTRACT.md)
- **Deployment Guide:** [DEPLOYMENT.md](./DEPLOYMENT.md)
- **Main README:** [README.md](./README.md)

---

## Time Estimate

- Basic integration: **30 minutes**
- Testing: **15 minutes**
- Deployment: **1-2 hours** (depending on platform)

**Total: ~2-3 hours to have mobile app live**

---

## Contact

If you get stuck, check:
1. Browser console for JavaScript errors
2. Network tab for failed API calls
3. Your Node server logs

The code is heavily commented with TODO markers where changes are needed!
