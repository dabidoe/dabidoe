# Testing Your Character Foundry React App

## 🚀 The App is Running!

Your development server is now running at:

**👉 http://localhost:5173/**

Open this URL in your web browser to see the app in action!

---

## 📱 How to Navigate the App

### 1. **Landing Page** (`/`)
- **Text Prompt**: Type a character description (like "Achilles") and click Create
- **Browse Button**: Navigate to the character gallery (coming soon)
- **More Info**: Expandable section with app information

### 2. **Character Page** (`/character/achilles`)
- The app will automatically navigate here after creating a character
- Or go directly to: http://localhost:5173/character/achilles

### Character Interaction Features:

#### **Scene Switcher** (Top right)
- Toggle between "Portrait" and "Battle" scenes
- Changes the background gradient and mood

#### **Character Stats** (Top left)
- HP tracking with color states (green → orange → red)
- Armor Class (AC)
- Current scene indicator

#### **Mode Tabs** (In chat section)
Click to switch between three interaction modes:

**💬 Conversation Mode**
- Choose from dialogue options
- "Tell me about yourself"
- "What is your quest?"
- "Tell me a story from Troy"
- "I challenge you to battle!" (switches to battle mode)

**⚔️ Battle Mode**
- **Quick Action Macros** (2x2 grid):
  - ⚔️ Attack Roll
  - 🎲 Initiative
  - 🛡️ Saving Throw
  - 💚 Second Wind
- **Combat Abilities**: See all equipped abilities below macros
- Click any ability to use it (shows in chat with dice rolls)

**🎲 Skills Mode**
- All 18 D&D skills with emoji icons
- Skills show modifier (like "+7 (STR)" for Athletics)
- Proficient skills have a ★ star badge
- Click any skill to roll d20 + modifier
- Results appear in chat with flavor text

#### **Chat Messages**
- All actions and rolls appear here
- Scroll to see message history
- Character responses with mood indicators

#### **Text Input** (Bottom)
- Type custom messages to the character
- Press "Send" or hit Enter

---

## 🎮 Try These Actions:

1. **Roll an attack**:
   - Switch to Battle Mode (⚔️ tab)
   - Click "Attack Roll" macro
   - See the d20 roll result in chat

2. **Check a skill**:
   - Switch to Skills Mode (🎲 tab)
   - Click "Athletics" (💪)
   - See your d20+7 roll result

3. **Use an ability**:
   - In Battle Mode
   - Scroll down to abilities
   - Click "Sword Strike" or "Divine Fury"
   - See attack roll + damage in chat

4. **Have a conversation**:
   - Switch to Conversation Mode (💬 tab)
   - Click any dialogue option
   - Character responds in chat

5. **Change scenes**:
   - Click "Battle" in scene switcher (top right)
   - Background changes to red
   - Mood changes to "Battle Ready"

---

## 🛠️ Development Commands

### Start the development server:
```bash
npm run dev
```

### Build for production:
```bash
npm run build
```

### Preview production build:
```bash
npm run preview
```

### Stop the development server:
Press `Ctrl+C` in the terminal

---

## 📂 Key Files to Explore

### Components:
- `src/components/LandingPage.jsx` - Landing/home page
- `src/components/CharacterCard.jsx` - Main character interaction
- `src/components/CharacterModes.jsx` - Conversation/Battle/Skills modes
- `src/components/AbilityLibrary.jsx` - Ability browser (not yet integrated)
- `src/components/AbilityCard.jsx` - Individual ability display
- `src/components/AbilityIcon.jsx` - Icon system with fallbacks

### Utilities:
- `src/utils/dice.js` - D&D dice rolling system
- `src/utils/icons.js` - Icon generation (emoji, game-icons.net)

### Data Import:
- `scripts/import-dnd-data.js` - Import from 5etools
- `scripts/seed-database.js` - Seed MongoDB

### Styling:
- `src/index.css` - Global styles
- `src/components/*.css` - Component-specific styles

---

## 🔌 API Integration (TODO)

The app currently uses demo data. To connect to your Node.js API:

1. **Update API calls** in:
   - `CharacterCard.jsx` line 22: Load character data
   - `LandingPage.jsx` line 15: Create character from prompt
   - `AbilityLibrary.jsx` line 13: Load abilities from database

2. **API Base URL**: `api.characterfoundry.io`

3. **Example API integration**:
```javascript
// In CharacterCard.jsx
const response = await fetch(`https://api.characterfoundry.io/characters/${characterId}`)
const character = await response.json()
```

---

## 📱 Mobile Testing

The app is mobile-first! Test it on mobile:

1. Find your local IP address:
   ```bash
   npm run dev -- --host
   ```

2. Access from your phone:
   ```
   http://YOUR_IP:5173/
   ```

---

## 🎯 What's Working:

✅ Landing page with character creation prompt
✅ Character interaction with full D&D mechanics
✅ Dice rolling (d20, damage, crits, fails)
✅ HP tracking with color states
✅ Scene switching (Portrait/Battle)
✅ Three interaction modes (Conversation/Battle/Skills)
✅ All 18 D&D skills with proficiency
✅ Combat macros (Attack, Initiative, Saves, Healing)
✅ Ability system with expandable cards
✅ Chat message history
✅ Mobile-responsive design

---

## 🚧 Still Needs:

- Connect to your Node.js API
- Real character data from MongoDB
- Character gallery/browse page
- Ability Library integration (component exists, needs routing)
- Character creation from text prompt
- Real-time chat with AI/LLM integration

---

## 💡 Tips:

- Open browser DevTools (F12) to see any console errors
- The app uses React Router, so URL navigation works
- All dice rolls use proper D&D mechanics
- Character data structure matches your MongoDB schema
- Icon system has 3-tier fallback (custom → game-icons.net → emoji)

---

**Enjoy testing! 🎲⚔️**
