# Character Foundry

A mobile-first React web application for creating and interacting with AI-powered RPG characters. Built with Vite and React Router.

---

## 🚀 For Developers - Integration Docs

**Ready to connect to your existing Node server, Discord bot, and APIs?**

- **[INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md)** - Complete integration instructions
- **[API_CONTRACT.md](./API_CONTRACT.md)** - API endpoint specifications and data formats
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Deploy to m.characterfoundry.io or app stores

**TL;DR for dev team:**
1. Set `REACT_APP_API_URL` in `.env`
2. Update 3 locations marked with `TODO` in the code
3. Configure CORS on your Node server
4. Deploy

---

## Features

### Mobile Landing Page (m.characterfoundry.io)
- **Loading Screen** - Animated forge-themed loading experience
- **Create with Prompt** - Generate custom characters from text descriptions
- **Browse Gallery** - Explore pre-made characters
- **More Info** - Learn about Character Foundry features

### Character Interaction
- Interactive character cards with stats (HP, AC)
- Portrait and Battle mode views
- AI-powered character dialogue with mood indicators
- Character ability buttons with interactive feedback
- Real-time chat interface
- Node.js backend integration ready

### UI/UX
- Mobile-first responsive design
- Beautiful gradient themes with smooth animations
- Navigation between pages with React Router
- Loading states and error handling

## How to View the App

### Option 1: Development Server (Recommended)

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```

3. **Open in browser:**
   - The terminal will show you a URL (usually `http://localhost:5173`)
   - Open this URL in your web browser
   - You'll see the loading screen, then the landing page

### Option 2: Production Build

1. **Build the app:**
   ```bash
   npm run build
   ```

2. **Preview the build:**
   ```bash
   npm run preview
   ```

3. **Open in browser:**
   - The terminal will show you a preview URL
   - Open this URL in your web browser

### Option 3: Mobile App Wrapper

To wrap this React app as a mobile app, you can use:
- **Capacitor** (recommended for iOS/Android)
- **Cordova**
- **React Native WebView**

See [Capacitor Documentation](https://capacitorjs.com/docs) for wrapping instructions.

## Connecting to Your Node Server

### 1. Configure Environment Variables

Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Edit `.env` and set your Node server URL:
```
REACT_APP_API_URL=http://localhost:3001/api
```

### 2. Update API Integration

The app uses the API service at `src/services/api.js`. Currently, it uses demo data with TODO comments showing where to integrate your Node server:

**Character loading:** `src/components/CharacterCard.jsx:17-19`
**Chat messages:** `src/components/CharacterCard.jsx:77-87`
**Character creation:** `src/components/LandingPage.jsx:11-15`

### 3. Expected API Endpoints

Your Node server should implement these endpoints:

```
GET    /api/characters          - Get all characters
GET    /api/characters/:id      - Get character by ID
POST   /api/characters/create   - Create character from prompt
POST   /api/chat                - Send chat message
POST   /api/abilities/use       - Use character ability
PATCH  /api/characters/:id/stats - Update character stats
```

See `src/services/api.js` for detailed API function signatures.

## Project Structure

```
src/
  components/
    LoadingScreen.jsx         - Animated loading screen
    LandingPage.jsx          - Mobile-first landing page
    BrowsePage.jsx           - Character gallery/browse page
    CharacterCard.jsx        - Character interaction interface
    *.css                    - Component-specific styles
  services/
    api.js                   - Node.js backend API service
  App.jsx                    - Main app with routing
  main.jsx                   - Application entry point
  index.css                  - Global styles
```

## Routes

- `/` - Landing page (create character, browse, info)
- `/browse` - Character gallery
- `/character/:characterId` - Individual character interaction

## Tech Stack

- React 18
- React Router 6
- Vite 6
- CSS3 with modern gradients and animations
- Node.js backend (API ready)

## Development Tips

### Testing on Mobile

1. Find your local IP address:
   ```bash
   # On Mac/Linux:
   ifconfig | grep "inet "

   # On Windows:
   ipconfig
   ```

2. Start dev server with host flag:
   ```bash
   npm run dev -- --host
   ```

3. Access from mobile device:
   ```
   http://YOUR_IP_ADDRESS:5173
   ```

### Customizing Characters

Edit the demo character data in:
- `src/components/CharacterCard.jsx` (lines 22-42)
- `src/components/BrowsePage.jsx` (lines 8-17)

Replace with API calls when your Node server is ready.

## Next Steps

1. ✅ React app with loading screen and landing page
2. ✅ Navigation and routing
3. ✅ API service structure
4. 🔲 Connect to Node.js backend
5. 🔲 Implement character creation API
6. 🔲 Add authentication
7. 🔲 Wrap as mobile app with Capacitor
8. 🔲 Deploy to production

## License

All rights reserved.
