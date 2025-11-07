# Enhanced Features Implementation Guide

This guide covers the implementation of advanced features including multi-image characters, state-based conversations, dice roll overlays, and enhanced UI components.

## Overview

**New Features:**
- ✅ Multi-image character system (portraits, battle, canvas)
- ✅ State-based conversations with dynamic character moods
- ✅ Dice roll overlay with animations
- ✅ Expanded character stats (full D&D 5e support)
- ✅ Enhanced chat interface with 3 modes (Conversation, Battle, Skills)
- ✅ AI-generated ability images
- ✅ Video generation for dramatic scenes

**Cost per Character (Full Setup):**
- Standard portrait: $0.003
- Battle portrait: $0.003
- 2-3 Canvas scenes: $0.006-0.009
- 10 Ability images: $0.03
- **Total: ~$0.08 per fully-featured character**

## Architecture

### 1. Multi-Image Character Schema

Characters now support multiple image types stored in a structured format:

```javascript
character = {
  // ... existing fields ...
  images: {
    portraits: {
      standard: { url, seed, prompt, generatedAt },
      battle: { url, seed, prompt, generatedAt },
      injured: { url, seed, prompt, generatedAt },
      triumphant: { url, seed, prompt, generatedAt }
    },
    canvas: {
      forest: { url, seed, scene, type: 'image' },
      campfire: { url, seed, scene, type: 'image' },
      combat: { url, thumbnailUrl, scene, type: 'video' }
    },
    emoji: "🏹",
    thumbnail: "url-to-standard-portrait"
  },
  conversationStates: {
    default: { mood, greeting, systemPrompt, activePortrait, activeCanvas },
    battle: { mood, greeting, systemPrompt, activePortrait, activeCanvas },
    angry: { mood, greeting, systemPrompt, activePortrait, activeCanvas }
  }
}
```

Full schema: See `CHARACTER_SCHEMA.md`

### 2. State-Based Conversation System

Characters have multiple conversation states that change their behavior:

- **Default**: Normal conversation
- **Battle**: Combat-focused, tactical responses
- **Injured**: Wounded, desperate tone
- **Angry**: Aggressive, emotional responses
- **Custom States**: Users can create any state (e.g., "victory_celebration", "mourning")

Each state defines:
- Active portrait to display
- Active canvas scene
- Character mood
- System prompt for AI personality

### 3. Backend Services

#### CharacterImageGenerator Service

Located: `server/services/characterImageGenerator.js`

**Methods:**
- `generateCharacterImages(character, progressCallback)` - Generate all standard images
- `generatePortrait(character, type)` - Generate specific portrait type
- `generateCanvas(character, sceneName)` - Generate scene image
- `generateAbilityImage(character, ability)` - Generate ability cast image
- `generateCanvasVideo(character, sceneName)` - Generate dramatic scene video

**Example:**
```javascript
import CharacterImageGenerator from './services/characterImageGenerator.js';

const generator = new CharacterImageGenerator(runwareService);

// Generate all images for a character
const images = await generator.generateCharacterImages(character, (progress) => {
  console.log(`${progress.progress}% - ${progress.message}`);
});

// Generate specific portrait
const battlePortrait = await generator.generatePortrait(character, 'battle');

// Generate scene
const forestScene = await generator.generateCanvas(character, 'forest');

// Generate ability image
const spellImage = await generator.generateAbilityImage(character, ability);
```

## React Components

### 1. CharacterImageTabs

**Location:** `src/components/images/CharacterImageTabs.jsx`

Displays character images with tabs for different types.

**Props:**
- `character` - Character object
- `currentState` - Current conversation state (optional)

**Features:**
- Portrait tab with type selector (standard, battle, injured, etc.)
- Battle tab with HP overlay
- Canvas tab with scene selector
- Video support for canvas scenes
- State indicator

**Usage:**
```jsx
import CharacterImageTabs from './components/images/CharacterImageTabs';

function CharacterView({ character }) {
  const [currentState, setCurrentState] = useState('default');

  return (
    <CharacterImageTabs
      character={character}
      currentState={currentState}
    />
  );
}
```

### 2. DiceRollOverlay

**Location:** `src/components/dice/DiceRollOverlay.jsx`

Animated dice roll display that appears on screen.

**Props:**
- `rolls` - Array of roll objects

**Roll Object:**
```javascript
{
  type: 'Attack Roll',         // Display name
  diceType: 'd20',             // Dice type (d4, d6, d8, d10, d12, d20, d100)
  total: 18,                   // Result
  breakdown: '1d20+5 (13+5)',  // Optional calculation
  success: true,               // Optional success/fail
  critical: 'success'          // Optional 'success' or 'fail'
}
```

**Usage:**
```jsx
import DiceRollOverlay from './components/dice/DiceRollOverlay';

function Game() {
  const [rolls, setRolls] = useState([]);

  const rollDice = () => {
    setRolls([...rolls, {
      type: 'Initiative',
      diceType: 'd20',
      total: Math.floor(Math.random() * 20) + 1,
      critical: null
    }]);
  };

  return (
    <>
      <button onClick={rollDice}>Roll Initiative</button>
      <DiceRollOverlay rolls={rolls} />
    </>
  );
}
```

**Features:**
- Animated entrance/exit
- Critical success (green glow, star burst)
- Critical fail (red glow, shake animation)
- Auto-dismisses after 3 seconds
- Multiple rolls can display simultaneously

### 3. ExpandedStats

**Location:** `src/components/character/ExpandedStats.jsx`

Comprehensive D&D 5e character stats display.

**Props:**
- `character` - Character object with full stats

**Displays:**
- Ability scores with modifiers
- Computed stats (proficiency, initiative, speed, etc.)
- Saving throws (with proficiency indicators)
- Skills (with proficiency/expertise)
- Resources (hit dice, spell slots, custom)
- Conditions and exhaustion

**Usage:**
```jsx
import ExpandedStats from './components/character/ExpandedStats';

function CharacterSheet({ character }) {
  return (
    <div className="character-sheet">
      <h1>{character.name}</h1>
      <ExpandedStats character={character} />
    </div>
  );
}
```

### 4. EnhancedChatInterface

**Location:** `src/components/chat/EnhancedChatInterface.jsx`

Multi-mode chat interface with conversation, battle, and skills modes.

**Props:**
- `character` - Character object
- `onSendMessage(message, context)` - Send message handler
- `onUseAbility(characterId, abilityId)` - Use ability handler
- `onRoll(rollData)` - Dice roll handler (optional)

**Modes:**

1. **Conversation Mode**
   - Text-based chat
   - State selector (change character mood)
   - Message history with avatars
   - Typing indicator

2. **Battle Mode**
   - HP/AC display
   - Quick actions (Attack, Initiative, Save, Dash, Dodge, Help)
   - Combat abilities grid
   - Cooldown tracking

3. **Skills Mode**
   - Ability showcase cards
   - Large ability images
   - Detailed stats
   - Use ability button

**Usage:**
```jsx
import EnhancedChatInterface from './components/chat/EnhancedChatInterface';

function CharacterChat({ character }) {
  const [rolls, setRolls] = useState([]);

  const handleSendMessage = async (message, context) => {
    // Call API with context
    const response = await fetch('/api/chat', {
      method: 'POST',
      body: JSON.stringify({
        characterId: character.id,
        message,
        state: context.state,
        conversationHistory: context.conversationHistory
      })
    });
    return await response.json();
  };

  const handleUseAbility = async (characterId, abilityId) => {
    const response = await fetch('/api/abilities/use', {
      method: 'POST',
      body: JSON.stringify({ characterId, abilityId })
    });
    return await response.json();
  };

  const handleRoll = (rollData) => {
    setRolls([...rolls, rollData]);
  };

  return (
    <>
      <EnhancedChatInterface
        character={character}
        onSendMessage={handleSendMessage}
        onUseAbility={handleUseAbility}
        onRoll={handleRoll}
      />
      <DiceRollOverlay rolls={rolls} />
    </>
  );
}
```

## Implementation Steps

### Step 1: Update Character Creation

Add multi-image generation to character creation:

```javascript
// POST /api/characters/create
router.post('/create', async (req, res) => {
  const { prompt, options = {} } = req.body;

  // Create basic character
  const character = createCharacterFromPrompt(prompt);

  // Generate images
  const imageGenerator = new CharacterImageGenerator(req.app.locals.runware);

  const images = await imageGenerator.generateCharacterImages(
    character,
    (progress) => {
      // Send progress via WebSocket or SSE
      wsClient.send(JSON.stringify({
        type: 'character_creation_progress',
        progress: progress.progress,
        message: progress.message
      }));
    }
  );

  character.images = images;

  // Save to database
  await saveCharacter(character);

  res.json({ success: true, data: character });
});
```

### Step 2: Add State Management

Implement conversation state switching:

```javascript
// POST /api/characters/:id/state
router.post('/:id/state', async (req, res) => {
  const { state } = req.body;
  const character = await getCharacter(req.params.id);

  // Check if state exists
  if (!character.conversationStates[state]) {
    return res.status(404).json({
      success: false,
      error: { message: 'State not found' }
    });
  }

  // Update current state
  character.currentState = state;
  await saveCharacter(character);

  res.json({
    success: true,
    data: {
      state,
      config: character.conversationStates[state]
    }
  });
});
```

### Step 3: Integrate Dice Rolling

Add dice roll endpoint:

```javascript
// POST /api/roll
router.post('/roll', (req, res) => {
  const { type, dice, modifier = 0 } = req.body;

  // Parse dice (e.g., "2d6+3")
  const [count, sides] = dice.split('d');
  let total = modifier;

  for (let i = 0; i < parseInt(count); i++) {
    total += Math.floor(Math.random() * parseInt(sides)) + 1;
  }

  const isCritical = sides === '20' && (total === 20 || total === 1);

  res.json({
    success: true,
    data: {
      type,
      diceType: `d${sides}`,
      total,
      breakdown: `${count}d${sides}+${modifier}`,
      critical: isCritical ? (total === 20 ? 'success' : 'fail') : null
    }
  });
});
```

### Step 4: Complete Character View

Combine all components:

```jsx
import CharacterImageTabs from './components/images/CharacterImageTabs';
import ExpandedStats from './components/character/ExpandedStats';
import EnhancedChatInterface from './components/chat/EnhancedChatInterface';
import DiceRollOverlay from './components/dice/DiceRollOverlay';

function CharacterView({ characterId }) {
  const [character, setCharacter] = useState(null);
  const [currentState, setCurrentState] = useState('default');
  const [rolls, setRolls] = useState([]);

  useEffect(() => {
    fetchCharacter(characterId).then(setCharacter);
  }, [characterId]);

  if (!character) return <div>Loading...</div>;

  return (
    <div className="character-view">
      {/* Left: Images & Stats */}
      <div className="character-sidebar">
        <CharacterImageTabs
          character={character}
          currentState={currentState}
        />
        <ExpandedStats character={character} />
      </div>

      {/* Right: Chat Interface */}
      <div className="character-main">
        <EnhancedChatInterface
          character={character}
          onSendMessage={handleSendMessage}
          onUseAbility={handleUseAbility}
          onRoll={(rollData) => setRolls([...rolls, rollData])}
        />
      </div>

      {/* Overlay */}
      <DiceRollOverlay rolls={rolls} />
    </div>
  );
}
```

## Advanced Features

### Creating Custom States

Allow users to create custom conversation states:

```jsx
function CreateStateModal({ character, onSave }) {
  const [stateName, setStateName] = useState('');
  const [mood, setMood] = useState('');
  const [greeting, setGreeting] = useState('');

  const handleSave = async () => {
    const newState = {
      mood,
      greeting,
      systemPrompt: `You are ${character.name} in a ${mood} mood.`,
      activePortrait: 'standard',
      activeCanvas: null
    };

    await fetch(`/api/characters/${character.id}/states`, {
      method: 'POST',
      body: JSON.stringify({ name: stateName, config: newState })
    });

    onSave();
  };

  return (
    <div className="create-state-modal">
      <h3>Create Custom State</h3>
      <input
        placeholder="State name (e.g., 'celebrating')"
        value={stateName}
        onChange={(e) => setStateName(e.target.value)}
      />
      <input
        placeholder="Mood (e.g., 'joyful')"
        value={mood}
        onChange={(e) => setMood(e.target.value)}
      />
      <textarea
        placeholder="Greeting message..."
        value={greeting}
        onChange={(e) => setGreeting(e.target.value)}
      />
      <button onClick={handleSave}>Create State</button>
    </div>
  );
}
```

### Generating Ability Images

Generate images for abilities:

```javascript
// POST /api/abilities/:id/generate-image
router.post('/abilities/:id/generate-image', async (req, res) => {
  const { characterId, abilityId } = req.body;

  const character = await getCharacter(characterId);
  const ability = character.abilities.find(a => a.id === abilityId);

  const imageGenerator = new CharacterImageGenerator(req.app.locals.runware);
  const abilityImage = await imageGenerator.generateAbilityImage(character, ability);

  // Update ability with image
  ability.images = ability.images || {};
  ability.images.cast = abilityImage.url;

  await saveCharacter(character);

  res.json({ success: true, data: abilityImage });
});
```

### Video Canvas Scenes

Generate dramatic video scenes:

```jsx
function GenerateVideoButton({ character, sceneName }) {
  const [generating, setGenerating] = useState(false);

  const handleGenerate = async () => {
    setGenerating(true);

    const response = await fetch(`/api/characters/${character.id}/video`, {
      method: 'POST',
      body: JSON.stringify({ sceneName })
    });

    const { data } = await response.json();

    // Update character canvas with video
    character.images.canvas[sceneName] = data;

    setGenerating(false);
  };

  return (
    <button onClick={handleGenerate} disabled={generating}>
      {generating ? 'Generating Video...' : '🎬 Generate Video'}
    </button>
  );
}
```

## Cost Management

### Budget-Friendly Approach

1. **Essential Only** ($0.006/character):
   - Standard portrait: $0.003
   - Battle portrait: $0.003

2. **Standard** ($0.02/character):
   - Standard + Battle portraits
   - 1 Canvas scene
   - 5 Key ability images

3. **Premium** ($0.08/character):
   - All portrait types
   - 3 Canvas scenes + 1 video
   - All ability images

### Caching Strategy

```javascript
// Check cache before generating
async function getOrGeneratePortrait(character, type) {
  // Check if already generated
  if (character.images?.portraits?.[type]) {
    return character.images.portraits[type];
  }

  // Generate new
  const imageGenerator = new CharacterImageGenerator(runware);
  const portrait = await imageGenerator.generatePortrait(character, type);

  // Cache
  character.images = character.images || {};
  character.images.portraits = character.images.portraits || {};
  character.images.portraits[type] = portrait;

  await saveCharacter(character);

  return portrait;
}
```

## Styling Customization

All components use CSS variables for easy theming:

```css
:root {
  --surface-color: #1a1a1a;
  --background-color: #0f0f0f;
  --border-color: #333;
  --accent-color: #4a90e2;
  --accent-hover: #357abd;
  --text-primary: #fff;
  --text-secondary: #888;
  --hover-color: #252525;
}
```

## Testing

### Test Dice Roll Overlay

```jsx
function TestDiceRolls() {
  const [rolls, setRolls] = useState([]);

  const testRolls = [
    { type: 'Attack Roll', diceType: 'd20', total: 20, critical: 'success' },
    { type: 'Damage', diceType: 'd8', total: 7, breakdown: '1d8+3 (4+3)' },
    { type: 'Saving Throw', diceType: 'd20', total: 1, critical: 'fail' }
  ];

  return (
    <>
      <button onClick={() => setRolls([...rolls, testRolls[rolls.length % 3]])}>
        Test Roll
      </button>
      <DiceRollOverlay rolls={rolls} />
    </>
  );
}
```

## Next Steps

1. ✅ Multi-image system implemented
2. ✅ State-based conversations implemented
3. ✅ All UI components created
4. 📋 TODO: Integrate with Claude AI for dynamic responses
5. 📋 TODO: Add MongoDB for persistence
6. 📋 TODO: Implement CDN upload for generated assets
7. 📋 TODO: Add real-time multiplayer support

## Support

For questions or issues:
- Backend: `server/README.md`
- Runware API: `server/EXAMPLE_USAGE.md`
- Character Schema: `CHARACTER_SCHEMA.md`

Total Implementation Time: ~4-6 hours
Cost per 1000 characters (full features): ~$80
