# Feature List - Mobile Character Interface

## What's New (Based on Your Proof of Concept)

I've integrated all the features from your HTML proof of concept into the React app!

---

## ✅ Implemented Features

### 1. **Dice Rolling System**
- d20 attack rolls with modifiers
- Damage dice (1d8+6, 2d6+8, 1d10+7, etc.)
- Critical hit mechanics (doubles damage dice)
- Critical fail handling
- Formatted roll display showing:
  - Attack roll breakdown
  - Individual dice results
  - Total damage with formula

**Files:**
- `src/utils/dice.js` - All dice rolling logic
- Reusable functions: `rollD20()`, `rollDamage()`, `rollAttack()`

### 2. **HP Tracking with Visual Feedback**
- Real-time HP display
- Color-coded health states:
  - 🟢 Green (>60% HP)
  - 🟠 Orange (25-60% HP)
  - 🔴 Red with pulse animation (<25% HP)

### 3. **Scene/Mode Switching**
- Portrait Mode (contemplative, character-focused)
- Battle Mode (combat-ready, action scenes)
- Different backgrounds for each mode
- Mood indicator changes with scene
- Scene-specific narration

### 4. **Combat Abilities**

#### **Sword Strike** ⚔️
- Attack: +9 modifier
- Damage: 1d8+6 (2d8+6 on crit)
- Narration based on roll quality

#### **Divine Fury** 🔥
- Attack: +8 modifier
- Damage: 2d6+8 (4d6+8 on crit)
- Auto-switches to Battle mode on critical hit
- Divine-themed narration

#### **Spear Thrust** 🗡️
- Attack: +10 modifier (highest!)
- Damage: 1d10+7 (2d10+7 on crit)
- Precision-focused narration

#### **Shield Wall** 🛡️
- Defensive action
- Calculates AC bonus from roll
- Protective narration

### 5. **Story/Quest Actions**

#### **Tell Story** 📖
- Different stories for Portrait vs Battle mode
- Character reflection and backstory

#### **Current Quest** 🗺️
- Context-aware quest description
- Changes based on current scene

### 6. **Dynamic Narration**
- Contextual descriptions based on roll results:
  - **Critical (nat 20):** Epic success narration
  - **Fail (nat 1):** Humorous/humble failure text
  - **High roll (18+):** Strong success description
  - **Mid roll (12-17):** Solid execution
  - **Low roll (<12):** Basic action description

### 7. **Chat Interface**
- Auto-scrolling to latest message
- Player vs Character message styling
- Mood indicators for each message
- Multi-line text support (for roll breakdowns)
- Icon changes based on current scene

### 8. **Visual Design**
- Full-screen mobile layout
- Image section with scene transitions
- Transparent stat overlays
- Gradient backgrounds (brown for portrait, red for battle)
- Smooth animations and transitions

---

## 🔄 How It Syncs with Your Node Server

### Currently Implemented:
- ✅ All dice rolling happens client-side (instant feedback)
- ✅ Results are displayed immediately
- ✅ Scene switching handled in React

### Ready for API Integration:
The app is ready to send combat data to your Node server at `api.characterfoundry.io`:

```javascript
// When ability is used:
POST https://api.characterfoundry.io/api/abilities/use
{
  "characterId": "achilles",
  "abilityName": "Sword Strike",
  "roll": {
    "attack": 23,
    "damage": 14,
    "isCrit": true
  },
  "context": {
    "mode": "battle",
    "currentHP": 104
  }
}
```

Your Node server can:
- Log combat actions
- Update character state
- Trigger AI responses based on rolls
- Synchronize with Discord bot
- Track statistics

---

## 📊 Data Flow

```
User clicks "Sword Strike"
    ↓
Roll dice client-side (instant)
    ↓
Display result immediately
    ↓
Send to API (background) ←→ Your Node Server
    ↓                              ↓
Update character state       AI generates response
    ↓                              ↓
Sync with Discord            Update database
```

---

## 🎯 Integration Points for Your Dev

### 1. **Character Loading** (`CharacterCard.jsx:20`)
```javascript
// TODO: Load character data from api.characterfoundry.io
const response = await fetch('https://api.characterfoundry.io/api/characters/achilles')
const character = await response.json()
```

### 2. **Ability Usage** (`CharacterCard.jsx:154`)
```javascript
// TODO: Send ability use to API
import { useAbility } from '../services/api'
await useAbility(characterId, ability.name, {
  roll: result,
  mode: mode,
  currentHP: currentHP
})
```

### 3. **Chat Messages** (`CharacterCard.jsx:177`)
```javascript
// TODO: Get AI response from your server
import { sendMessage } from '../services/api'
const response = await sendMessage(characterId, inputMessage, messages)
addMessage(response.text, 'character', response.mood)
```

---

## 🎮 User Experience

### Example Combat Flow:

1. **User taps "Divine Fury"**
2. **Instant dice roll:**
   ```
   🔥 Divine Fury: Attack 24 (d20: 18+6)
   💥 Damage: 18 (2d6+8) [5, 5]

   Controlled fury channels through will forged by decades of war.
   ```
3. **Result displayed immediately**
4. **HP updates if needed**
5. **Scene changes on crit**
6. **Data sent to your server in background**

---

## 💪 Why This Approach?

### Instant Feedback
- No waiting for server response
- Feels like a native game app
- Smooth, responsive UI

### Flexible Integration
- Works offline (for testing)
- Node server handles persistence
- Can add server-side validation later
- AI can respond to combat narratively

### Mobile-Optimized
- Full-screen interface
- Touch-friendly buttons
- No unnecessary scrolling
- Clear visual hierarchy

---

## 📱 Mobile-Specific Optimizations

- Fills entire viewport (no wasted space)
- 45% chat / 55% visual split
- Large, tappable buttons
- Auto-scroll on new messages
- Scene switcher in corner (easy thumb reach)
- Responsive text sizing

---

## 🚀 Next Steps for Full Integration

1. **Set API URL:**
   ```bash
   cp .env.example .env
   # Edit to: REACT_APP_API_URL=https://api.characterfoundry.io/api
   ```

2. **Uncomment API calls** (3 locations marked with TODO)

3. **Add these endpoints to your Node server:**
   - `POST /api/abilities/use` - Log combat actions
   - `GET /api/characters/:id` - Load character data
   - `POST /api/chat` - AI character responses
   - `PATCH /api/characters/:id/stats` - Update HP/state

4. **Test locally:**
   ```bash
   npm run dev
   # Go to http://localhost:5173/character/achilles
   ```

5. **Deploy to m.characterfoundry.io**

---

## 🎲 Example API Payloads

### Ability Use:
```json
{
  "characterId": "achilles",
  "abilityName": "Sword Strike",
  "roll": {
    "attack": { "total": 21, "d20": 12, "modifier": 9 },
    "damage": { "total": 11, "rolls": [5], "formula": "1d8+6" },
    "isCrit": false,
    "isFail": false
  },
  "narration": "Masterful technique honed by eight decades of combat.",
  "context": {
    "mode": "portrait",
    "currentHP": 104,
    "mood": "Contemplative"
  }
}
```

### Expected Response:
```json
{
  "success": true,
  "characterResponse": {
    "text": "A satisfying strike. My blade remembers the weight of battle.",
    "mood": "Satisfied",
    "hpChange": 0
  }
}
```

---

## 🔧 Customization

### Adding New Abilities:
Edit `CharacterCard.jsx:89-96`:
```javascript
const abilityData = {
  'Sword Strike': { modifier: 9, damageCount: 1, damageSides: 8, damageBonus: 6, icon: '⚔️' },
  'New Ability': { modifier: 10, damageCount: 3, damageSides: 6, damageBonus: 10, icon: '💫' }
}
```

### Changing HP Thresholds:
Edit `CharacterCard.jsx:70-75`

### Custom Narration:
Edit `src/utils/dice.js:117-150`

---

## 📖 Documentation References

- **INTEGRATION_GUIDE.md** - Full integration walkthrough
- **API_CONTRACT.md** - API endpoint specifications
- **DEPLOYMENT.md** - Deployment strategies
- **QUICK_START.md** - 30-minute setup guide

All features match your proof of concept and are ready for your Node server integration!
