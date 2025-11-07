# Integration Strategy: Frontend → Existing Backend

## Current Architecture

### What EXISTS (Your Real System)

```
┌─────────────────────────────────────────┐
│   app.characterfoundry.io (Node)       │
│                                         │
│  ┌───────────────────────────────┐    │
│  │   Multiple AI Agents          │    │
│  │   - Character Generator       │    │
│  │   - Image Generator           │    │
│  │   - Conversation Handler      │    │
│  │   - Stat Calculator           │    │
│  └───────────────────────────────┘    │
│                                         │
│  ┌───────────────────────────────┐    │
│  │   Discord Bot Integration     │    │
│  └───────────────────────────────┘    │
│                                         │
│  ┌───────────────────────────────┐    │
│  │   MongoDB Database            │    │
│  │   - Characters Collection     │    │
│  │   - Images Collection         │    │
│  │   - Conversations             │    │
│  └───────────────────────────────┘    │
└─────────────────────────────────────────┘
```

### What's MISSING (This React App)

```
┌─────────────────────────────────────────┐
│   m.characterfoundry.io (React)         │
│                                         │
│  ❌ No connection to real backend      │
│  ❌ Uses demo data only                │
│  ❌ No image display                   │
│  ❌ No character creator UI            │
│  ❌ No JSON schema integration         │
└─────────────────────────────────────────┘
```

---

## The Integration Plan

### Phase 1: Connect to Real Backend ✅

**Update API endpoints:**

Current (broken):
```javascript
const API_BASE_URL = 'http://localhost:3001/api'
```

Should be:
```javascript
const API_BASE_URL = 'https://app.characterfoundry.io/api'
```

**Add authentication:**
Your backend likely requires auth tokens.

---

## Your Character JSON Schema

Based on what you showed me, characters have:

### Core Identity
- `characterName`, `gender`, `voice`, `personality`, `mood`
- `backstory` (long, rich text)
- `behavior` (AI instructions)

### D&D Stats
- `race`, `class`, `subclass`, `level`, `ac`
- `stats` (Str, Dex, Con, Int, Wis, Cha)
- `saving_throws`
- `combat_data` (AC, Initiative, Speed, HP, Proficiency, Attacks)

### Abilities & Skills
- `traits` (Fey Ancestry, Darkvision, etc.)
- `abilities` (Lay on Hands, Divine Smite, etc.)
- `skills` (Athletics, Persuasion, etc.)

### Metadata
- `labels` (8 key-value pairs)
- `additional_details` (6 key-value pairs)

### Image Generation
- Prompt: "Create a full-body illustration..."
- Output: Image URL or base64

---

## What We Need to Build

### 1. Character Creator UI (Priority 1)

**The problem:** Users need an easy way to create characters matching your JSON schema.

**The solution:** Multi-step wizard

```
Step 1: Basic Info
┌────────────────────────────────┐
│ Character Name: [_________]    │
│ Race: [▼ Select]               │
│ Class: [▼ Select]              │
│ Level: [1-20 slider]           │
│ Gender: [▼ Select]             │
│                                │
│ [Next: Appearance →]           │
└────────────────────────────────┘

Step 2: Generate Image
┌────────────────────────────────┐
│ Describe your character:       │
│ [Text area with prompt guide]  │
│                                │
│ [🎨 Generate Image]            │
│                                │
│ Preview: [Generated image]     │
│                                │
│ [← Back] [Next: Stats →]      │
└────────────────────────────────┘

Step 3: Stats & Abilities
┌────────────────────────────────┐
│ Stats (Auto-calculated):       │
│ STR: 18 (+4) [Adjust?]        │
│ DEX: 12 (+1) [Adjust?]        │
│ ...                            │
│                                │
│ Abilities (Level 15):          │
│ [✓] Divine Smite               │
│ [✓] Lay on Hands               │
│ ...                            │
│                                │
│ [← Back] [Next: Personality →]│
└────────────────────────────────┘

Step 4: AI Personality
┌────────────────────────────────┐
│ Personality: [Stoic ▼]         │
│ Voice: [Whisper ▼]             │
│ Mood: [Resolute ▼]             │
│                                │
│ Backstory:                     │
│ [Rich text editor]             │
│                                │
│ Behavior Instructions:         │
│ [Text area with guide]         │
│                                │
│ [← Back] [Create Character →] │
└────────────────────────────────┘
```

**Implementation:**
```javascript
// New component: /src/components/CharacterCreator.jsx

import { useState } from 'react'

const STEPS = ['basic', 'image', 'stats', 'personality']

function CharacterCreator() {
  const [step, setStep] = useState(0)
  const [character, setCharacter] = useState({
    characterName: '',
    race: '',
    class: '',
    level: 1,
    // ... full schema
  })

  const handleGenerateImage = async () => {
    const response = await fetch('https://app.characterfoundry.io/api/generate-image', {
      method: 'POST',
      body: JSON.stringify({
        prompt: buildImagePrompt(character),
        aspectRatio: '1:1'
      })
    })
    const { imageUrl } = await response.json()
    setCharacter({ ...character, imageUrl })
  }

  const handleCreateCharacter = async () => {
    const response = await fetch('https://app.characterfoundry.io/api/characters', {
      method: 'POST',
      body: JSON.stringify(character)
    })
    // Handle success
  }

  return (
    <div className="character-creator">
      {/* Step-based UI */}
    </div>
  )
}
```

---

### 2. Image Display System (Priority 1)

**The problem:** Generated images need to be displayed beautifully.

**The solution:** Image gallery component

```javascript
// /src/components/CharacterImage.jsx

function CharacterImage({ imageUrl, characterName }) {
  return (
    <div className="character-image-frame">
      {/* Parchment border frame */}
      <div className="parchment-frame">
        <img
          src={imageUrl}
          alt={characterName}
          className="character-portrait"
        />
      </div>

      {/* Wax seal decoration */}
      <div className="wax-seal">
        <span className="seal-icon">🔱</span>
      </div>
    </div>
  )
}
```

**CSS (Aged Parchment Style):**
```css
.character-image-frame {
  position: relative;
  max-width: 600px;
  margin: 0 auto;
}

.parchment-frame {
  border: 8px solid var(--parchment-aged);
  border-image: url('parchment-border.svg') 30 round;
  box-shadow:
    0 4px 12px rgba(43, 37, 32, 0.3),
    inset 0 0 20px rgba(43, 37, 32, 0.1);
  padding: 16px;
  background: var(--parchment-light);
}

.character-portrait {
  width: 100%;
  height: auto;
  display: block;
  border-radius: 4px;
}

.wax-seal {
  position: absolute;
  bottom: -20px;
  right: 20px;
  width: 60px;
  height: 60px;
  background: var(--vermillion);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 8px rgba(0,0,0,0.3);
}

.seal-icon {
  font-size: 32px;
  filter: brightness(0.8);
}
```

---

### 3. Update API Service (Priority 2)

**Current API:**
```javascript
// /src/services/api.js

const API_BASE_URL = 'http://localhost:3001/api'
```

**Should be:**
```javascript
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://app.characterfoundry.io/api'

// Add authentication
const getAuthHeaders = () => {
  const token = localStorage.getItem('cf_token')
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  }
}

// New endpoints for your system

export const generateCharacterImage = async (prompt) => {
  return retryFetch(() =>
    apiFetch(`${API_BASE_URL}/generate-image`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        prompt,
        aspectRatio: '1:1'
      })
    })
  )
}

export const generateCharacterStats = async (basicInfo) => {
  return retryFetch(() =>
    apiFetch(`${API_BASE_URL}/generate-character`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(basicInfo)
    })
  )
}

export const saveCharacter = async (characterData) => {
  return retryFetch(() =>
    apiFetch(`${API_BASE_URL}/characters`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(characterData)
    })
  )
}

export const getCharacterWithImages = async (characterId) => {
  return retryFetch(() =>
    apiFetch(`${API_BASE_URL}/characters/${characterId}?include=images`)
  )
}
```

---

### 4. Character Sheet Display (Priority 2)

**The problem:** Your JSON has TONS of data - stats, abilities, traits, skills, etc.

**The solution:** Tabbed character sheet

```javascript
// /src/components/CharacterSheet.jsx

function CharacterSheet({ character }) {
  const [tab, setTab] = useState('overview')

  return (
    <div className="character-sheet-scroll">
      {/* Header with image */}
      <div className="sheet-header">
        <CharacterImage
          imageUrl={character.imageUrl}
          characterName={character.characterName}
        />
        <h1>{character.characterName}</h1>
        <p className="subtitle">
          {character.labels['Class - Subclass & Level']}
        </p>
      </div>

      {/* Tabs */}
      <div className="sheet-tabs">
        <button
          onClick={() => setTab('overview')}
          className={tab === 'overview' ? 'active' : ''}
        >
          Overview
        </button>
        <button
          onClick={() => setTab('combat')}
          className={tab === 'combat' ? 'active' : ''}
        >
          Combat
        </button>
        <button
          onClick={() => setTab('abilities')}
          className={tab === 'abilities' ? 'active' : ''}
        >
          Abilities
        </button>
        <button
          onClick={() => setTab('personality')}
          className={tab === 'personality' ? 'active' : ''}
        >
          Personality
        </button>
      </div>

      {/* Tab content */}
      <div className="sheet-content">
        {tab === 'overview' && (
          <OverviewTab character={character} />
        )}
        {tab === 'combat' && (
          <CombatTab character={character} />
        )}
        {tab === 'abilities' && (
          <AbilitiesTab character={character} />
        )}
        {tab === 'personality' && (
          <PersonalityTab character={character} />
        )}
      </div>
    </div>
  )
}
```

**Overview Tab:**
```javascript
function OverviewTab({ character }) {
  return (
    <div className="overview-tab">
      {/* Stats Grid */}
      <section className="stats-section">
        <h3>Ability Scores</h3>
        <div className="stats-grid">
          {Object.entries(character.stats).map(([stat, value]) => (
            <div key={stat} className="stat-box">
              <div className="stat-label">{stat}</div>
              <div className="stat-value">{value}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Labels (8 key-value pairs) */}
      <section className="labels-section">
        <h3>Character Details</h3>
        {Object.entries(character.labels).map(([key, value]) => (
          <div key={key} className="detail-row">
            <span className="detail-label">{key}:</span>
            <span className="detail-value">{value}</span>
          </div>
        ))}
      </section>

      {/* Backstory */}
      <section className="backstory-section">
        <h3>Backstory</h3>
        <div className="parchment-text">
          {character.backstory}
        </div>
      </section>
    </div>
  )
}
```

**Combat Tab:**
```javascript
function CombatTab({ character }) {
  return (
    <div className="combat-tab">
      {/* Combat Data (6 entries) */}
      <section className="combat-stats">
        <h3>Combat Statistics</h3>
        <div className="combat-grid">
          {Object.entries(character.combat_data).map(([key, value]) => (
            <div key={key} className="combat-stat">
              <div className="stat-label">{key}</div>
              <div className="stat-value">{value}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Saving Throws */}
      <section className="saves-section">
        <h3>Saving Throws</h3>
        <div className="saves-grid">
          {Object.entries(character.saving_throws).map(([save, bonus]) => (
            <div key={save} className="save-item">
              <span className="save-label">{save}</span>
              <span className="save-bonus">{bonus}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Skills */}
      <section className="skills-section">
        <h3>Skills</h3>
        <div className="skills-list">
          {Object.entries(character.skills).map(([skill, bonus]) => (
            <div key={skill} className="skill-item">
              <span className="skill-name">
                {skill.endsWith('*') ? `★ ${skill.replace('*', '')}` : skill}
              </span>
              <span className="skill-bonus">{bonus}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
```

---

### 5. Easy Character Creation Flow (Priority 3)

**The problem:** Your JSON is complex - users shouldn't see it.

**The solution:** Smart defaults + guided flow

```javascript
// /src/utils/character-builder.js

export const buildCharacterFromBasics = (basicInfo) => {
  // User provides:
  // - Name
  // - Race
  // - Class
  // - Level
  // - Brief description

  // AI generates:
  // - Stats (based on class)
  // - Abilities (based on class + level)
  // - Skills (based on class + background)
  // - Traits (based on race)
  // - Full backstory (from brief description)
  // - Behavior instructions

  return {
    characterName: basicInfo.name,
    race: basicInfo.race,
    class: basicInfo.class,
    level: basicInfo.level,

    // AI-generated via your backend
    stats: generateStats(basicInfo.class, basicInfo.level),
    abilities: generateAbilities(basicInfo.class, basicInfo.level),
    traits: generateTraits(basicInfo.race, basicInfo.class),
    backstory: generateBackstory(basicInfo.description),
    behavior: generateBehavior(basicInfo.personality),

    // Calculated
    combat_data: calculateCombatData(basicInfo),
    saving_throws: calculateSaves(basicInfo),

    // ... rest of schema
  }
}
```

**User Experience:**
```
User fills out 5 fields:
  1. Name: "Sebastienne"
  2. Race: "Dark Elf"
  3. Class: "Paladin"
  4. Level: 15
  5. Description: "Exiled Drow noble who became a knight"

↓ Click "Generate Character" ↓

Your backend AI agents:
  1. Generate stats (STR 18, CHA 20, etc.)
  2. Pick appropriate abilities (Divine Smite, Lay on Hands)
  3. Write full backstory
  4. Create behavior instructions
  5. Generate character image
  6. Return complete JSON

↓ User reviews ↓

User can tweak:
  - Adjust stats
  - Pick different abilities
  - Edit backstory
  - Regenerate image

↓ Click "Save Character" ↓

Done! Character ready to use.
```

---

## Implementation Priority

### Week 1: Basic Integration
1. ✅ Update API base URL
2. ✅ Add authentication
3. ✅ Test connection to your backend
4. ✅ Display characters from real database

### Week 2: Character Creator
1. ✅ Build multi-step wizard UI
2. ✅ Integrate image generation
3. ✅ Connect to character generation endpoint
4. ✅ Handle JSON schema properly

### Week 3: Character Display
1. ✅ Build tabbed character sheet
2. ✅ Display all JSON fields beautifully
3. ✅ Add image gallery
4. ✅ Apply parchment aesthetic

### Week 4: Polish
1. ✅ Add loading states
2. ✅ Error handling
3. ✅ Responsive design
4. ✅ Performance optimization

---

## Questions for You

1. **Authentication:** How does your backend handle auth? JWT? Session cookies?

2. **API Endpoints:** Do these exist?
   - `POST /api/generate-image` (image generation)
   - `POST /api/generate-character` (AI character creation)
   - `GET /api/characters/:id` (get character)
   - `POST /api/characters` (save character)

3. **Image Generation:** What service? DALL-E? Midjourney? Stable Diffusion?

4. **Character Generation:** Is it fully automated? Or does user provide inputs?

5. **Discord Bot:** Should web app sync with Discord data?

---

## Next Step

Should I:
1. **Build the character creator UI** (wizard for your JSON schema)
2. **Update API integration** (connect to app.characterfoundry.io)
3. **Create image display system** (show generated images)
4. **All of the above** (full integration)

Which is most urgent?
