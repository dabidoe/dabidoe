# D&D 5e Character Manager

**Ultra-cheap, mobile-first D&D 5e character management with AI-powered narratives.**

Built with React 18, Node.js, Gemini Flash 2.0, MongoDB, and Bunny CDN.

---

## ✨ Features

### Complete D&D 5e SRD Implementation

- **Interactive Stats**: Tap any ability score, skill, or saving throw to roll with AI narratives
- **Combat Tracker**: Full battle management with HP, attacks, damage, and turn tracking
- **Spell System**: Cast spells with slot management, damage rolls, and spell level tracking
- **Rest System**: Short and long rests with hit dice healing and resource recovery
- **Class Abilities**: Track and use abilities with usage limits and cooldowns
- **Mobile-First**: 44px touch targets, bottom sheets, swipeable tabs, smooth animations

### AI-Powered Narratives

Every action generates cinematic descriptions via Gemini Flash 2.0:

```
🎲 Roll: 18 for Perception
📖 Narrative: "Your keen elven eyes catch the glint of a hidden trap!"

⚔️ Attack: Critical Hit!
📖 Narrative: "Your sword crashes down in a devastating arc, finding the gap in their armor!"

😴 Long Rest
📖 Narrative: "You wake refreshed as morning sun filters through the trees, wounds healed and magic restored."
```

---

## 🚀 Quick Start (5 Minutes)

### Prerequisites

- Node.js 18+
- MongoDB Atlas account (free tier)
- Gemini API key (free)

### 1. Clone and Install

```bash
git clone <repo-url>
cd clean-structure
npm install
cd client && npm install
```

### 2. Configure Environment

Create `server/.env`:

```env
PORT=3000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/dnd5e
GEMINI_API_KEY=your-gemini-api-key
BUNNY_API_KEY=your-bunny-cdn-key (optional)
BUNNY_STORAGE_ZONE=your-storage-zone (optional)
RUNWARE_API_KEY=your-runware-key (optional)
```

Create `client/.env`:

```env
VITE_API_URL=http://localhost:3000/api
```

### 3. Start Development Servers

**Terminal 1 (Server):**
```bash
npm run dev
```

**Terminal 2 (Client):**
```bash
cd client && npm run dev
```

**Open**: http://localhost:5173

---

## 📱 Components

### InteractiveStats

Interactive character stats with tap-to-roll functionality.

```jsx
import InteractiveStats from './components/character/InteractiveStats';

<InteractiveStats
  character={character}
  onRoll={(rollData) => console.log(rollData)}
  onUpdateCharacter={(updates) => saveCharacter(updates)}
/>
```

**Features:**
- Tap ability scores to roll checks/saves
- Tap skills to roll skill checks
- Tap saving throws to roll saves
- Shows proficiency bonuses
- Mobile-optimized bottom sheet UI

### BattleMode

Full combat tracker with turn management.

```jsx
import BattleMode from './components/combat/BattleMode';

<BattleMode
  character={character}
  onAttack={handleAttack}
  onDamage={handleDamage}
  onHeal={handleHeal}
  onRoll={handleRoll}
  onUpdateCharacter={updateCharacter}
/>
```

**Features:**
- Quick actions: Melee, Ranged, Cantrip, Initiative
- HP controls: Take damage, Heal
- Combat log with turn tracking
- Cantrip picker modal
- AI-generated attack narratives

### SpellLibrary

Browse and cast spells with slot management.

```jsx
import SpellLibrary from './components/spells/SpellLibrary';

<SpellLibrary
  character={character}
  onCastSpell={handleCastSpell}
  onPrepareSpell={handlePrepareSpell}
  onRoll={handleRoll}
/>
```

**Features:**
- Swipeable spell level tabs (cantrips → 9th level)
- Visual spell slot tracking
- Cast/prepare spells
- Spell details with damage, range, duration
- Auto-calculates spell save DC

### RestSystem

Short and long rest management.

```jsx
import RestSystem from './components/character/RestSystem';

<RestSystem
  character={character}
  onRest={handleRest}
  onRoll={handleRoll}
  onUpdateCharacter={updateCharacter}
/>
```

**Features:**
- Short rest with hit dice spending
- Long rest with full recovery
- Hit dice selector with +/- controls
- Healing estimation
- Warlock pact magic restoration
- AI-generated rest narratives

### AbilityLibrary

Browse and use class abilities.

```jsx
import AbilityLibrary from './components/abilities/AbilityLibrary';

<AbilityLibrary
  character={character}
  onUseAbility={handleUseAbility}
  onRoll={handleRoll}
  onUpdateCharacter={updateCharacter}
/>
```

**Features:**
- Filter by action type (Action, Bonus, Reaction, Passive)
- Usage tracking (uses per rest)
- Attack/damage rolls for abilities
- Ability details modal
- AI-generated ability narratives

---

## 🔌 API Endpoints

### Character Management

```bash
# Get character
GET /api/characters/:id

# Create character from AI prompt
POST /api/characters/create
{
  "prompt": "A brave elven ranger who protects the forest",
  "generateImage": true
}

# Update character stats
PATCH /api/characters/:id/stats
{
  "stats": { "str": 16, "dex": 14, ... }
}
```

### Dice Rolling

```bash
# Roll skill check
POST /api/characters/:id/roll/skill
{
  "skillName": "athletics",
  "advantage": false,
  "disadvantage": false
}

# Roll saving throw
POST /api/characters/:id/roll/save
{
  "ability": "dex",
  "advantage": false
}
```

### Combat

```bash
# Attack
POST /api/characters/:id/attack
{
  "attackType": "melee",
  "weaponName": "Longsword",
  "attackBonus": 5,
  "damageFormula": "1d8+3",
  "advantage": false
}

# Take damage
PATCH /api/characters/:id/damage
{
  "amount": 12,
  "damageType": "slashing"
}

# Heal
PATCH /api/characters/:id/heal
{
  "amount": 10
}
```

### Rest & Recovery

```bash
# Short rest
POST /api/characters/:id/rest/short
{
  "hitDiceToUse": 2
}

# Long rest
POST /api/characters/:id/rest/long
```

### Abilities

```bash
# Use class ability
POST /api/characters/:id/use-ability
{
  "abilityId": "rage-abc123"
}
```

---

## 🏗️ Project Structure

```
clean-structure/
├── client/                      # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── character/      # Character components
│   │   │   │   ├── InteractiveStats.jsx
│   │   │   │   └── RestSystem.jsx
│   │   │   ├── spells/         # Spell components
│   │   │   │   └── SpellLibrary.jsx
│   │   │   ├── combat/         # Combat components
│   │   │   │   └── BattleMode.jsx
│   │   │   └── abilities/      # Ability components
│   │   │       └── AbilityLibrary.jsx
│   │   ├── utils/
│   │   │   └── 5e-mechanics.js # D&D 5e formulas
│   │   └── services/
│   │       └── api.js          # API service layer
│   └── package.json
├── server/                      # Node.js backend
│   ├── src/
│   │   ├── routes/
│   │   │   └── characters.js   # Character API routes
│   │   ├── services/
│   │   │   ├── gemini.js       # Gemini AI integration
│   │   │   ├── mongodb.js      # MongoDB service
│   │   │   ├── bunny.js        # Bunny CDN service
│   │   │   └── runware.js      # Image generation
│   │   └── index.js            # Server entry
│   └── package.json
├── shared/
│   └── character-5e-schema.js  # Character data model
└── docs/
    ├── TESTING_GUIDE.md        # Testing instructions
    ├── INTEGRATION_EXAMPLE.md  # Full integration guide
    └── 5E_FULL_IMPLEMENTATION.md # Complete roadmap
```

---

## 💰 Cost Breakdown

**For 1000 active users:**

| Service | Usage | Cost |
|---------|-------|------|
| Gemini Flash 2.0 | 200K API calls | **$0** (Free tier: 1M tokens/day) |
| MongoDB Atlas | 1000 characters | **$0** (Free tier: 512MB) |
| Bunny CDN | Image hosting | **$1** |
| Railway/Vercel | Server hosting | **$0** (Free tier) |
| **Total** | | **$1/month** |

**Scaling:**
- 10K users: ~$5/month
- 100K users: ~$50/month (mainly CDN costs)
- Gemini stays free up to 1M tokens/day (~500K actions)

---

## 🧪 Testing

See `docs/TESTING_GUIDE.md` for complete testing instructions.

**Quick Test:**

```bash
# Test character creation
curl -X POST http://localhost:3000/api/characters/create \
  -H "Content-Type: application/json" \
  -d '{"prompt": "A brave human fighter"}'

# Test skill roll
curl -X POST http://localhost:3000/api/characters/{id}/roll/skill \
  -H "Content-Type: application/json" \
  -d '{"skillName": "athletics"}'
```

---

## 📖 Documentation

- **[Testing Guide](docs/TESTING_GUIDE.md)** - Setup, testing, troubleshooting
- **[Integration Example](docs/INTEGRATION_EXAMPLE.md)** - Complete app integration
- **[Full Implementation](docs/5E_FULL_IMPLEMENTATION.md)** - 6-week roadmap
- **[Character Schema](shared/character-5e-schema.js)** - Data structure reference

---

## 🎯 Roadmap

### Phase 1: Core Mechanics ✅
- [x] Character stats and skills
- [x] Dice rolling with advantage/disadvantage
- [x] Skill checks and saving throws
- [x] AI-powered narratives

### Phase 2: Combat ✅
- [x] Attack rolls with critical hits
- [x] Damage and healing
- [x] HP management with temp HP
- [x] Combat tracker with turns

### Phase 3: Spells ✅
- [x] Spell library with filtering
- [x] Spell slot management
- [x] Spell casting with damage
- [x] Prepared spells

### Phase 4: Rest & Abilities ✅
- [x] Short rest with hit dice
- [x] Long rest with full recovery
- [x] Class abilities with usage tracking
- [x] Ability damage/attack rolls

### Phase 5: Advanced Features (Next)
- [ ] Inventory management
- [ ] Equipment with bonuses
- [ ] Conditions and status effects
- [ ] Death saves
- [ ] Level up system

### Phase 6: Social & Deployment
- [ ] Party view (see all party members)
- [ ] Character sharing
- [ ] PWA offline support
- [ ] Mobile app (React Native)
- [ ] Production deployment

---

## 🛠️ Tech Stack

- **Frontend**: React 18 + Vite
- **Backend**: Node.js + Express
- **Database**: MongoDB Atlas
- **AI**: Google Gemini Flash 2.0
- **CDN**: Bunny CDN
- **Images**: Runware (optional)
- **Hosting**: Railway/Vercel

---

## 🤝 Contributing

1. Fork the repo
2. Create feature branch: `git checkout -b feature/my-feature`
3. Commit changes: `git commit -m 'feat: add my feature'`
4. Push to branch: `git push origin feature/my-feature`
5. Open Pull Request

---

## 📄 License

MIT License - See LICENSE file

---

## 💬 Support

- **Issues**: https://github.com/your-repo/issues
- **Docs**: See `docs/` directory

---

## 🎲 Example Usage

```javascript
import { CharacterProvider, useCharacter } from './contexts/CharacterContext';

function App() {
  return (
    <CharacterProvider characterId="abc123">
      <CharacterSheet />
    </CharacterProvider>
  );
}

function CharacterSheet() {
  const { character, rollSkill, attack, shortRest } = useCharacter();

  return (
    <div>
      <h1>{character.name}</h1>

      {/* Roll Perception check */}
      <button onClick={() => rollSkill('perception')}>
        👁️ Roll Perception
      </button>

      {/* Attack with longsword */}
      <button onClick={() => attack({
        weaponName: 'Longsword',
        attackBonus: 5,
        damageFormula: '1d8+3'
      })}>
        ⚔️ Attack
      </button>

      {/* Take short rest */}
      <button onClick={() => shortRest(2)}>
        😴 Short Rest (2 hit dice)
      </button>
    </div>
  );
}
```

---

**Built with ❤️ for D&D players who want mobile-first, AI-enhanced character management at $1/month.**
