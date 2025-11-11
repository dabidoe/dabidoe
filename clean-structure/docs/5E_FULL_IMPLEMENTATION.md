# Complete D&D 5e Implementation Guide

**Goal:** Recreate all functionality from `test-enhanced-features.html` in a mobile-first React app connected to Gemini AI, MongoDB, and Bunny CDN.

---

## 📊 What We've Built So Far

### ✅ Clean Repository Structure
```
clean-structure/
├── client/               # React PWA
├── server/               # Node + Gemini + MongoDB + Bunny
├── shared/               # Character schemas
└── docs/                 # This guide!
```

### ✅ Backend Services (Already Created)
1. **Gemini AI Service** (`server/src/services/gemini.js`)
   - Character generation from prompts
   - AI conversations with personality
   - Ability narratives
   - Image prompt enhancement

2. **MongoDB Service** (`server/src/services/mongodb.js`)
   - Full character CRUD
   - Conversation history
   - Stats persistence

3. **Bunny CDN Service** (`server/src/services/bunny.js`)
   - Image uploads
   - File management

### ✅ 5e Foundation Components (Already in React)
1. **ExpandedStats.jsx** - Display all stats (not interactive yet)
2. **EnhancedChatInterface.jsx** - Chat with characters
3. **DiceRollOverlay.jsx** - Animated dice display
4. **CharacterImageTabs.jsx** - Multi-image support

### ✅ New 5e Utilities (Just Created!)
1. **Character Schema** (`shared/character-5e-schema.js`)
   - Complete D&D 5e data structure
   - Short/long rest functions
   - Auto-calculation helpers

2. **5e Mechanics** (`client/src/utils/5e-mechanics.js`)
   - Dice rolling (`rollDice`, `rollAttack`, `rollSkillCheck`)
   - Ability modifiers
   - Proficiency calculations
   - Spell slot management
   - Damage/healing
   - All core 5e formulas

3. **SpellLibrary Component** (`client/src/components/spells/SpellLibrary.jsx`)
   - Mobile-first spell browser
   - Spell slot tracking
   - Cast spells with auto-rolls
   - Prepare/unprepare spells
   - Touch-optimized UI

---

## 🎯 Full 5e Functionality (From test HTML)

### What test-enhanced-features.html Does

**Character Mechanics:**
- ✅ 6 ability scores with modifiers
- ✅ 18 skills with proficiency/expertise
- ✅ 6 saving throws
- ✅ HP tracking (current/max/temp)
- ✅ AC and initiative
- ✅ Proficiency bonus calculation

**Interactive Rolling:**
- ⚠️ Click skill → roll d20 + skill bonus
- ⚠️ Click save → roll d20 + save bonus
- ⚠️ Melee/ranged attack buttons
- ⚠️ Initiative roller
- ⚠️ Custom dice (d4-d100)

**Spell System:**
- ✅ Spell library by level (0-9)
- ✅ Spell slot tracking with dots
- ⚠️ Click spell → cast → consume slot → roll
- ✅ Prepared vs known spells
- ✅ Spell details modal

**Combat Features:**
- ⚠️ Battle mode with combat log
- ⚠️ Turn tracking
- ⚠️ Take damage / heal buttons
- ⚠️ Temporary HP
- ⚠️ Conditions (poisoned, blessed, etc.)

**Rest System:**
- ⚠️ Short rest (heal hit dice, warlock slots)
- ⚠️ Long rest (full restore, clear modifiers)

**Abilities:**
- ⚠️ Class ability library
- ⚠️ Click ability → use → roll damage
- ⚠️ Uses per rest tracking

**Temporary Modifiers:**
- ⚠️ Add buff/debuff (+1d4, -2, etc.)
- ⚠️ Apply to all rolls
- ⚠️ Clear on long rest

**Character States:**
- ✅ Mood selector (battle, injured, etc.)
- ✅ Affects AI responses

**Legend:**
- ✅ = Already built
- ⚠️ = Needs to be built

---

## 🛠️ Components We Need to Build

### 1. **InteractiveStats.jsx** (HIGH PRIORITY)
**Purpose:** Make stats clickable for rolling

**Features:**
- Click ability score → show options (save, check)
- Click skill → roll skill check with animation
- Click save → roll saving throw
- Display modifiers clearly
- Mobile touch targets (44px min)

**Location:** `client/src/components/character/InteractiveStats.jsx`

**Props:**
```jsx
<InteractiveStats
  character={character}
  onRoll={(rollData) => {/* Show dice animation */}}
  onUpdateCharacter={(updates) => {/* Save to DB */}}
/>
```

**Key Functions:**
- `handleSkillClick(skillName)` - Roll skill check
- `handleSaveClick(ability)` - Roll saving throw
- `handleAbilityClick(ability)` - Show mod + options

---

### 2. **BattleMode.jsx** (HIGH PRIORITY)
**Purpose:** Combat tracker with log

**Features:**
- Combat log (scrolling message feed)
- Turn counter ("Turn 5")
- Quick actions (Attack, Dodge, Dash, Help)
- Initiative button
- Take damage / Heal buttons
- HP editor (tap to change HP)

**Location:** `client/src/components/combat/BattleMode.jsx`

**State:**
```jsx
{
  turnNumber: 1,
  inCombat: true,
  battleLog: [
    { turn: 1, message: "Aelindra rolls initiative: 18", type: "initiative" },
    { turn: 1, message: "Aelindra attacks with bow: 24 to hit!", type: "attack" }
  ]
}
```

**Actions:**
- Melee Attack → d20 + STR → auto roll damage
- Ranged Attack → d20 + DEX → auto roll damage
- Cast Cantrip → select from list → roll
- Next Turn → increment counter

---

### 3. **RestSystem.jsx** (MEDIUM PRIORITY)
**Purpose:** Short and long rest functionality

**Features:**
- Short Rest button
  - Roll hit dice (d8 + CON) to heal
  - Restore warlock spell slots
  - Restore some class features
- Long Rest button
  - Restore all HP
  - Restore all spell slots
  - Restore all abilities
  - Clear temp modifiers
  - Reduce exhaustion by 1

**Location:** `client/src/components/character/RestSystem.jsx`

**API Integration:**
```javascript
// POST /api/characters/:id/rest
{
  type: 'short' | 'long',
  hitDiceUsed: 2 // For short rests
}
```

---

### 4. **AbilityLibrary.jsx** (MEDIUM PRIORITY)
**Purpose:** Browse and use class abilities

**Features:**
- Grid of ability cards
- Ability details modal (like spell details)
- "Use Ability" button
- Uses per rest tracking
- Cooldown display if applicable

**Location:** `client/src/components/abilities/AbilityLibrary.jsx`

**Abilities Data:**
```javascript
{
  id: 'sneak_attack',
  name: 'Sneak Attack',
  icon: '🗡️',
  damage: '4d6',
  description: 'Once per turn, deal extra damage...',
  usesPerRest: -1, // -1 = unlimited
  restType: 'none'
}
```

---

### 5. **TempModifiers.jsx** (LOW PRIORITY)
**Purpose:** Add/remove temporary buffs

**Features:**
- List of active modifiers
- "Add Modifier" button
- Form: name, value (+1d4, +2), duration
- Apply to all rolls
- Clear on long rest

**Location:** `client/src/components/character/TempModifiers.jsx`

**Example Modifiers:**
- Bless: +1d4 to attacks and saves
- Guidance: +1d4 to one ability check
- Poisoned: -2 to all rolls

---

### 6. **DiceRoller.jsx** (LOW PRIORITY)
**Purpose:** Manual dice rolling UI

**Features:**
- Buttons for d4, d6, d8, d10, d12, d20, d100
- Modifier input
- "Roll" button
- Show result with animation

**Location:** `client/src/components/dice/DiceRoller.jsx`

---

## 🔗 Backend API Endpoints Needed

### Character Actions

```javascript
// Roll skill check
POST /api/characters/:id/roll/skill
{
  skillName: 'perception',
  advantage: false,
  disadvantage: false
}
Response: {
  roll: 15,
  modifier: 5,
  total: 20,
  breakdown: "15 + 5 = 20",
  narrative: "Aelindra scans the area carefully..." // AI-generated
}

// Roll saving throw
POST /api/characters/:id/roll/save
{
  ability: 'dex',
  advantage: false,
  disadvantage: false
}

// Roll attack
POST /api/characters/:id/roll/attack
{
  type: 'melee' | 'ranged',
  weaponDamage: '1d8+3'
}

// Cast spell
POST /api/characters/:id/cast-spell
{
  spellId: 'fireball',
  upcasted: false,
  target: 'goblin'
}
Response: {
  spell: 'Fireball',
  damage: 28,
  damageType: 'fire',
  saveDC: 15,
  saveType: 'DEX',
  narrative: "Aelindra hurls a bead of fire that explodes..." // AI
}

// Use ability
POST /api/characters/:id/use-ability
{
  abilityId: 'sneak_attack',
  target: 'bandit'
}

// Take damage
PATCH /api/characters/:id/damage
{
  amount: 15,
  type: 'slashing'
}

// Heal
PATCH /api/characters/:id/heal
{
  amount: 12,
  source: 'Cure Wounds'
}

// Rest
POST /api/characters/:id/rest
{
  type: 'short' | 'long',
  hitDiceUsed: 2
}

// Add temp modifier
POST /api/characters/:id/modifiers
{
  name: 'Bless',
  value: '+1d4',
  appliesTo: 'attack,save',
  duration: '1 minute'
}
```

---

## 🤖 AI Integration (Gemini Narratives)

Every roll, spell cast, and ability use gets an AI-generated narrative:

**Examples:**

**Skill Check:**
```javascript
// User rolls Perception: 18
Gemini generates:
"Aelindra's keen elven eyes catch a glint of metal beneath the leaves—a hidden trap!"
```

**Spell Cast:**
```javascript
// Fireball hits for 28 damage
Gemini generates:
"Aelindra channels arcane energy, launching a blazing sphere that erupts in a 20-foot inferno, scorching everything in its path!"
```

**Attack:**
```javascript
// Melee attack crits for 16 damage
Gemini generates:
"With a fierce battle cry, Theron brings his greatsword down in a devastating arc, finding a gap in the goblin's armor!"
```

**Implementation:**
```javascript
// In server/src/services/gemini.js
async generateActionNarrative({ characterName, actionType, actionName, result, target }) {
  const prompt = `${characterName} performs ${actionName} on ${target}.

RESULT: ${result}

Generate a dramatic, cinematic 1-sentence description. Be vivid and action-focused.`;

  const narrative = await this.model.generateContent(prompt);
  return narrative.response.text().trim();
}
```

---

## 📱 Mobile-First Approach

### Design Principles

1. **Touch Targets:** 44px minimum (Apple/Google guidelines)
2. **Bottom Sheets:** Modals slide up from bottom (thumb-friendly)
3. **Swipeable Tabs:** Horizontal scroll for spell levels, ability categories
4. **Large Buttons:** Easy to tap, with active states (scale down on press)
5. **Sticky Headers:** Keep context visible while scrolling
6. **No Hover States:** Everything works with tap
7. **Gesture Support:** Swipe to dismiss modals

### Example: Mobile Spell Casting Flow

```
1. User taps "Spells" tab
   └─> Spell library opens with level tabs

2. User swipes through levels (0, 1st, 2nd, etc.)
   └─> Tabs scroll horizontally

3. User taps "Fireball" card
   └─> Bottom sheet slides up with spell details

4. User taps "Cast Spell" button (56px height)
   └─> Spell slot consumed
   └─> Dice animation plays
   └─> Damage calculated
   └─> AI narrative appears in chat
   └─> Sheet dismisses

5. User sees result in chat:
   "🔥 Fireball: 28 fire damage (8d6 = 28)
   Aelindra channels arcane energy..."
```

### CSS Best Practices

```css
/* Touch-friendly button */
.action-btn {
  min-height: 44px;
  min-width: 44px;
  padding: 12px 20px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.1s ease;
}

.action-btn:active {
  transform: scale(0.95);
}

/* Bottom sheet modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.8);
  display: flex;
  align-items: flex-end;
}

.modal-sheet {
  background: var(--surface-color);
  border-radius: 24px 24px 0 0;
  max-height: 85vh;
  animation: slideUp 0.3s ease;
}

/* Swipeable tabs */
.tabs-container {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}

.tabs-container::-webkit-scrollbar {
  display: none;
}
```

---

## 🗺️ Complete Implementation Roadmap

### Phase 1: Core Interactive Stats (Week 1)
**Goal:** Make character sheet interactive

**Tasks:**
1. Build `InteractiveStats.jsx`
   - Clickable ability scores
   - Clickable skills → roll checks
   - Clickable saves → roll saves
   - Display results with animation
2. Add backend endpoints:
   - `POST /api/characters/:id/roll/skill`
   - `POST /api/characters/:id/roll/save`
3. Integrate Gemini narratives for rolls
4. Test on mobile devices

**Deliverable:** Click any skill/save to roll with AI narration

---

### Phase 2: Combat System (Week 2)
**Goal:** Full battle mode

**Tasks:**
1. Build `BattleMode.jsx`
   - Combat log component
   - Turn tracker
   - Attack buttons (melee, ranged, cantrip)
   - Damage/heal buttons
2. Add backend endpoints:
   - `POST /api/characters/:id/roll/attack`
   - `PATCH /api/characters/:id/damage`
   - `PATCH /api/characters/:id/heal`
3. Initiative rolling
4. Combat narratives from Gemini

**Deliverable:** Full combat tracker with AI storytelling

---

### Phase 3: Spell System (Week 3)
**Goal:** Complete spell casting

**Tasks:**
1. Integrate `SpellLibrary.jsx` (already built!)
2. Add spell database
   - Fetch from D&D 5e API
   - Store in MongoDB
   - Cache in client
3. Backend endpoint:
   - `POST /api/characters/:id/cast-spell`
4. Spell slot consumption
5. Prepared spell management
6. Spell damage/save rolls
7. AI spell narratives

**Deliverable:** Cast any spell with full mechanics

---

### Phase 4: Abilities & Rest (Week 4)
**Goal:** Class abilities and rest system

**Tasks:**
1. Build `AbilityLibrary.jsx`
   - Ability browser
   - Use ability button
   - Track uses per rest
2. Build `RestSystem.jsx`
   - Short rest (hit dice, partial restore)
   - Long rest (full restore)
3. Backend endpoints:
   - `POST /api/characters/:id/use-ability`
   - `POST /api/characters/:id/rest`
4. Ability narratives from Gemini

**Deliverable:** Use abilities and rest mechanics

---

### Phase 5: Advanced Features (Week 5)
**Goal:** Polish and extras

**Tasks:**
1. Build `TempModifiers.jsx`
   - Add/remove buffs
   - Apply to rolls
2. Build `DiceRoller.jsx`
   - Manual dice rolling
3. Advantage/disadvantage system
4. Condition effects (visual only)
5. Character state persistence
6. Offline mode (PWA)

**Deliverable:** Full 5e experience, mobile-optimized

---

### Phase 6: Mobile App (Week 6)
**Goal:** Native mobile wrapper

**Tasks:**
1. Add Capacitor
   ```bash
   npm install @capacitor/core @capacitor/cli
   npx cap init
   npx cap add ios
   npx cap add android
   ```
2. Configure splash screen
3. Add app icons
4. Test on devices
5. Submit to App Store / Play Store

**Deliverable:** Native iOS/Android apps

---

## 📦 Complete File Structure

```
clean-structure/
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── character/
│   │   │   │   ├── ExpandedStats.jsx ✅ (display only)
│   │   │   │   ├── InteractiveStats.jsx ⚠️ (build this)
│   │   │   │   └── RestSystem.jsx ⚠️
│   │   │   ├── combat/
│   │   │   │   └── BattleMode.jsx ⚠️
│   │   │   ├── spells/
│   │   │   │   ├── SpellLibrary.jsx ✅ (just created!)
│   │   │   │   └── SpellLibrary.css ✅
│   │   │   ├── abilities/
│   │   │   │   └── AbilityLibrary.jsx ⚠️
│   │   │   ├── modifiers/
│   │   │   │   └── TempModifiers.jsx ⚠️
│   │   │   └── dice/
│   │   │       ├── DiceRollOverlay.jsx ✅
│   │   │       └── DiceRoller.jsx ⚠️
│   │   ├── utils/
│   │   │   ├── 5e-mechanics.js ✅ (just created!)
│   │   │   └── dice.js ✅ (existing)
│   │   └── services/
│   │       └── api.js (update with new endpoints)
│   └── package.json
│
├── server/
│   ├── src/
│   │   ├── services/
│   │   │   ├── gemini.js ✅
│   │   │   ├── mongodb.js ✅
│   │   │   ├── bunny.js ✅
│   │   │   └── runware.js ✅
│   │   └── routes/
│   │       └── characters.js (add 5e endpoints)
│   └── index.js ✅
│
└── shared/
    └── character-5e-schema.js ✅ (just created!)
```

---

## 🎯 Next Immediate Steps

**For your dev to start TODAY:**

1. **Read This Document** 📖
   - Understand full scope
   - Note what's built vs what needs building

2. **Set Up Local Environment** (30 min)
   - Follow `docs/SETUP.md`
   - Get API keys
   - Run client + server locally

3. **Build InteractiveStats Component** (2-3 hours)
   - Start with skill rolling
   - Use utilities from `5e-mechanics.js`
   - Connect to backend endpoint
   - Test with dice animation

4. **Add Backend Endpoints** (1-2 hours)
   - Add skill/save roll endpoints
   - Integrate Gemini narratives
   - Test with Postman/curl

5. **Deploy & Test** (1 hour)
   - Deploy to staging
   - Test on mobile device
   - Verify dice rolls work

**First Milestone:** Click a skill → see dice roll → get AI narrative (4-6 hours total)

---

## 💡 Pro Tips for Your Dev

### Use Test HTML as Reference
- Open `test-enhanced-features.html` in browser
- Inspect element to see UI structure
- Copy dice rolling logic patterns
- Match the UX feel

### Mobile Testing
```bash
# Run dev server with network access
npm run dev -- --host

# Access from phone
http://YOUR_IP:5173
```

### Quick Win Strategy
1. Build components one at a time
2. Test each on mobile immediately
3. Get feedback before next component
4. Don't optimize prematurely

### AI Integration Pattern
```javascript
// Every action follows this pattern:
1. User clicks button
2. Client calculates result using 5e-mechanics.js
3. Send to backend: POST /api/characters/:id/action
4. Backend uses Gemini to generate narrative
5. Return result + narrative to client
6. Show dice animation + narrative in chat
```

---

## 📊 Estimated Timelines

**Full 5e Implementation:**
- With dedicated dev: 4-6 weeks
- Part-time: 8-10 weeks
- With AI help (Cursor/Copilot): 3-4 weeks

**MVP (Phases 1-3):**
- 2-3 weeks to working spell casting & combat

**Mobile App:**
- Add 1 week for Capacitor setup & app store submission

---

## ✅ Success Criteria

**You'll know it's working when:**

1. ✅ Click skill → dice animation → AI narrative appears
2. ✅ Cast Fireball → spell slot consumed → damage rolled → epic description
3. ✅ Attack in battle → hit/miss → damage → add to combat log
4. ✅ Short rest → choose hit dice → heal → update character
5. ✅ Long rest → everything restored → temp buffs cleared
6. ✅ Works perfectly on iPhone/Android
7. ✅ Can "Add to Home Screen" as PWA
8. ✅ All data persists to MongoDB
9. ✅ AI makes every action feel cinematic

---

## 🆘 Support

**Stuck? Check:**
- This document (you're reading it!)
- `docs/SETUP.md` - Environment setup
- `docs/DEPLOY.md` - Production deployment
- `shared/character-5e-schema.js` - Data structure reference
- `client/src/utils/5e-mechanics.js` - Formulas reference
- `test-enhanced-features.html` - Original implementation

**Questions about:**
- D&D 5e mechanics → Reference Player's Handbook
- React components → Check existing components for patterns
- Backend integration → See existing API endpoints in `server/src/routes/characters.js`
- Mobile optimization → CSS in `SpellLibrary.css` shows patterns

---

**You have everything you need. Let's build an amazing D&D character app!** ⚔️🎲✨
