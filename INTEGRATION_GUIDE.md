# Integration Guide for Dev Team

## Overview

This React mobile app is ready to integrate with your existing Node server, Discord bot, and APIs. This document shows exactly what your dev needs to connect.

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│  MOBILE REACT APP (This Repo)                       │
│  - Loading screen                                    │
│  - Landing page (m.characterfoundry.io)             │
│  - Character chat interface                          │
│  - Browse/gallery                                    │
└─────────────────┬───────────────────────────────────┘
                  │
                  │ API Calls (src/services/api.js)
                  │
┌─────────────────▼───────────────────────────────────┐
│  YOUR EXISTING NODE SERVER                          │
│  - Character data & management                       │
│  - Chat/AI integration                               │
│  - Discord bot integration                           │
│  - External API connections                          │
└──────────────────────────────────────────────────────┘
```

---

## Integration Points

### 1. API Service Layer
**Location:** `src/services/api.js`

This file contains all API functions with:
- Function signatures
- Expected parameters
- Return types
- JSDoc comments

**Your dev needs to:**
- Review the API functions
- Map them to your existing Node endpoints
- Update the `API_BASE_URL` in `.env`

### 2. Component Integration Points

#### CharacterCard Component
**File:** `src/components/CharacterCard.jsx`

**Lines to update:**
- **17-19**: Character loading from API
- **77-87**: Chat message sending

```javascript
// Currently demo data
const demoCharacters = { ... }

// Replace with:
const response = await fetch(`${API_BASE_URL}/characters/${characterId}`)
const character = await response.json()
```

#### LandingPage Component
**File:** `src/components/LandingPage.jsx`

**Lines to update:**
- **11-15**: Character creation from prompt

```javascript
// Replace with API call:
const response = await createCharacter(prompt)
navigate(`/character/${response.id}`)
```

#### BrowsePage Component
**File:** `src/components/BrowsePage.jsx`

**Lines to update:**
- **8-17**: Character list loading

```javascript
// Replace with:
const characters = await getAllCharacters()
```

---

## API Contract Specification

See `API_CONTRACT.md` for detailed request/response formats.

---

## Environment Configuration

### Development Setup

1. **Create `.env` file:**
```bash
cp .env.example .env
```

2. **Configure API URL:**
```env
# Local development
REACT_APP_API_URL=http://localhost:3001/api

# Staging
REACT_APP_API_URL=https://staging-api.characterfoundry.io/api

# Production
REACT_APP_API_URL=https://api.characterfoundry.io/api
```

3. **Add any additional env vars your system needs:**
```env
REACT_APP_DISCORD_CLIENT_ID=your_client_id
REACT_APP_ANALYTICS_KEY=your_key
```

---

## CORS Configuration

Your Node server needs to allow requests from the React app:

```javascript
// In your Node server
app.use(cors({
  origin: [
    'http://localhost:5173',           // Dev
    'https://m.characterfoundry.io',   // Mobile production
    'https://characterfoundry.io'      // Main site
  ],
  credentials: true
}))
```

---

## Deployment Options

### Option 1: Separate Mobile Subdomain (Recommended)
- Deploy React app to: `m.characterfoundry.io`
- Keep existing site at: `characterfoundry.io`
- Users access mobile version directly

**Pros:**
- Clean separation
- Easy to maintain
- Mobile-optimized URL

### Option 2: Replace Existing Site
- Deploy React app to: `characterfoundry.io`
- Migrate all functionality into React

**Pros:**
- Single codebase
- Consistent experience

**Cons:**
- More migration work

### Option 3: Hybrid Approach
- Landing page: React app
- Character interactions: Existing site (iframe or redirect)
- Gradually migrate

**Pros:**
- Immediate mobile experience
- Incremental migration

---

## Mobile App Wrapper (Capacitor)

To wrap as iOS/Android app:

```bash
# Install Capacitor
npm install @capacitor/core @capacitor/cli @capacitor/ios @capacitor/android

# Initialize
npx cap init "Character Foundry" "io.characterfoundry.app"

# Add platforms
npx cap add ios
npx cap add android

# Build and sync
npm run build
npx cap sync

# Open in Xcode/Android Studio
npx cap open ios
npx cap open android
```

**Note:** Your dev will need to configure:
- App icons
- Splash screens
- Permissions (if needed)
- App store metadata

---

## Testing Checklist

- [ ] API connection successful
- [ ] Character loading works
- [ ] Chat messages send/receive
- [ ] Character creation from prompt
- [ ] Browse page loads characters
- [ ] Navigation works on all routes
- [ ] Mobile responsive on real devices
- [ ] Loading screen displays properly
- [ ] Error handling for failed API calls

---

## Next Steps for Dev

1. **Review API contract** (`API_CONTRACT.md`)
2. **Set up environment variables**
3. **Uncomment and update API calls** in the 3 locations mentioned above
4. **Test locally** with your Node server
5. **Configure CORS** on Node server
6. **Deploy** to staging environment
7. **Wrap with Capacitor** (if doing mobile app)
8. **Deploy** to production

---

## Questions for Your Dev

Before integration, dev should clarify:

1. **Authentication:** Does your system use JWT, sessions, OAuth? Where does auth happen?
2. **Character ID format:** UUID, MongoDB ObjectId, integer?
3. **Existing API structure:** RESTful, GraphQL, custom?
4. **Discord integration:** Does the mobile app need to interact with Discord directly, or only through your Node server?
5. **Data models:** What does your character object structure look like?

---

## Support

All integration points are marked with `TODO` comments in the code. Search for:
```bash
grep -r "TODO:" src/
```

This will show all places that need updating.
