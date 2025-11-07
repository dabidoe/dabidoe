# Enhanced Character Schema with Multi-Image Support

This document defines the enhanced character schema supporting multiple image types, state-based conversations, and expanded stats.

## Character Data Structure

```javascript
{
  // Basic Info
  id: "char_abc123",
  name: "Aelindra Moonwhisper",
  type: "Elven Ranger",
  description: "A skilled ranger from the Silverwood forests",
  class: "Ranger",
  subclass: "Hunter",
  background: "Outlander",
  level: 8,
  experiencePoints: 34000,

  // Core Stats (D&D 5e)
  stats: {
    str: 12,  // Strength
    dex: 18,  // Dexterity (primary)
    con: 14,  // Constitution
    int: 13,  // Intelligence
    wis: 16,  // Wisdom (secondary)
    cha: 10   // Charisma
  },

  // Computed Stats
  computed: {
    proficiencyBonus: 3,
    initiative: 4,      // DEX modifier
    speed: 30,
    passivePerception: 16,
    spellSaveDC: 14,
    spellAttackBonus: 6
  },

  // Health & Defense
  hp: {
    current: 58,
    max: 68,
    temp: 0
  },
  ac: 16,
  savingThrows: {
    str: 4,   // Proficient
    dex: 7,   // Proficient
    con: 2,
    int: 1,
    wis: 6,
    cha: 0
  },

  // Skills (with proficiency/expertise)
  skills: {
    acrobatics: { value: 7, proficiency: "proficient" },
    animalHandling: { value: 6, proficiency: "proficient" },
    athletics: { value: 1, proficiency: "none" },
    stealth: { value: 10, proficiency: "expertise" },
    survival: { value: 9, proficiency: "expertise" },
    perception: { value: 6, proficiency: "proficient" },
    investigation: { value: 4, proficiency: "proficient" },
    // ... all D&D skills
  },

  // Resources
  resources: {
    hitDice: {
      current: 6,
      max: 8,
      type: "d10"
    },
    spellSlots: {
      1: { current: 4, max: 4 },
      2: { current: 3, max: 3 },
      3: { current: 2, max: 2 }
    },
    ki: null,  // For monks
    rages: null,  // For barbarians
    sorceryPoints: null,
    // Custom resources
    custom: [
      {
        name: "Hunter's Mark Uses",
        current: 3,
        max: 3,
        resetOn: "long_rest"
      }
    ]
  },

  // Conditions & Status Effects
  conditions: [],  // ["poisoned", "blessed", "hasted"]
  exhaustion: 0,   // 0-6

  // Inventory
  inventory: {
    equipped: {
      weapon: { name: "Longbow +1", damage: "1d8+5", properties: ["range", "two-handed"] },
      armor: { name: "Studded Leather", ac: 12 },
      offhand: null,
      accessories: [
        { slot: "ring1", name: "Ring of Protection", bonus: "+1 AC" },
        { slot: "ring2", name: null }
      ]
    },
    items: [
      { name: "Arrow", quantity: 40, weight: 0.05 },
      { name: "Healing Potion", quantity: 3, effect: "2d4+2 HP" },
      { name: "Rope (50ft)", quantity: 1, weight: 10 }
    ],
    gold: 245,
    carrying: 85,  // lbs
    capacity: 180  // STR * 15
  },

  // Abilities & Spells
  abilities: [
    {
      id: "hunters_mark",
      name: "Hunter's Mark",
      icon: "🎯",
      type: "spell",
      level: 1,
      school: "divination",
      castingTime: "1 bonus action",
      range: "90 feet",
      duration: "1 hour (concentration)",
      description: "Mark a target. Extra 1d6 damage per hit.",
      damage: "1d6",
      damageType: "same as weapon",
      cooldown: 0,
      usesResource: "spellSlots.1",
      // AI-generated images
      images: {
        icon: "https://im.runware.ai/.../hunters-mark-icon.jpg",
        cast: "https://im.runware.ai/.../hunters-mark-cast.jpg",
        effect: "https://im.runware.ai/.../hunters-mark-effect.jpg"
      }
    },
    {
      id: "multiattack",
      name: "Multiattack",
      icon: "⚔️",
      type: "feature",
      description: "Make two attacks with your weapon",
      cooldown: 0,
      images: {
        icon: "⚔️",  // Emoji fallback
        action: null
      }
    }
  ],

  // Personality & Roleplay
  personality: {
    traits: ["Independent", "Observant", "Cautious"],
    ideals: ["Freedom", "Nature", "Self-reliance"],
    bonds: ["Protector of the Silverwood", "Lost sister"],
    flaws: ["Distrusts cities", "Vengeful against poachers"],
    alignment: "Neutral Good"
  },

  // Backstory & Lore
  backstory: {
    summary: "Raised in the Silverwood forests after her village was destroyed...",
    background: "Outlander",
    faction: "Emerald Enclave",
    allies: ["Thorin Oakenshield", "Silvanus the Druid"],
    enemies: ["Malakar the Poacher King"]
  },

  // MULTI-IMAGE SUPPORT
  images: {
    // Standard character portraits
    portraits: {
      standard: {
        url: "https://im.runware.ai/.../standard-portrait.jpg",
        seed: 123456789,
        generatedAt: "2024-01-21T10:30:00Z",
        prompt: "High quality fantasy art portrait of Aelindra..."
      },
      battle: {
        url: "https://im.runware.ai/.../battle-portrait.jpg",
        seed: 987654321,
        generatedAt: "2024-01-21T10:35:00Z",
        prompt: "Action pose of Aelindra drawing her bow in combat..."
      },
      injured: {
        url: "https://im.runware.ai/.../injured-portrait.jpg",
        seed: 456789123,
        prompt: "Aelindra wounded and exhausted..."
      },
      triumphant: {
        url: null  // Not generated yet
      }
    },

    // Canvas/Scene images for conversations
    canvas: {
      forest: {
        url: "https://im.runware.ai/.../forest-scene.jpg",
        prompt: "Silverwood forest at dawn, mystical atmosphere...",
        type: "image"
      },
      campfire: {
        url: "https://im.runware.ai/.../campfire-scene.jpg",
        prompt: "Aelindra at a campfire under stars...",
        type: "image"
      },
      combat: {
        url: "https://im.runware.ai/.../combat-scene.mp4",
        thumbnailUrl: "https://im.runware.ai/.../combat-scene-thumb.jpg",
        prompt: "Dramatic battle scene in the Silverwood...",
        type: "video"
      }
    },

    // Thumbnail for gallery view
    thumbnail: "https://im.runware.ai/.../standard-portrait.jpg",

    // Emoji fallback
    emoji: "🏹"
  },

  // STATE-BASED CONVERSATIONS
  conversationStates: {
    // Default state
    default: {
      mood: "calm",
      greeting: "You find me studying tracks in the forest...",
      systemPrompt: "You are Aelindra, a skilled elven ranger. You are calm and observant.",
      activePortrait: "standard",
      activeCanvas: "forest"
    },

    // Battle state
    battle: {
      mood: "focused",
      greeting: "Enemy sighted! Ready your weapons!",
      systemPrompt: "You are Aelindra in combat. You are tactical and fierce.",
      activePortrait: "battle",
      activeCanvas: "combat"
    },

    // Injured state
    injured: {
      mood: "pained",
      greeting: "*winces* I've seen better days...",
      systemPrompt: "You are Aelindra, wounded and in pain but still determined.",
      activePortrait: "injured",
      activeCanvas: null
    },

    // Angry state
    angry: {
      mood: "furious",
      greeting: "Those poachers will pay for what they've done!",
      systemPrompt: "You are Aelindra, filled with righteous anger.",
      activePortrait: "battle",
      activeCanvas: null
    },

    // Custom states (user can create)
    "victory_celebration": {
      mood: "triumphant",
      greeting: "We did it! The forest is safe once more!",
      systemPrompt: "You are Aelindra celebrating a hard-won victory.",
      activePortrait: "triumphant",
      activeCanvas: "campfire"
    }
  },

  // Current conversation context
  currentState: "default",

  // Conversation history
  conversations: [
    {
      id: "conv_001",
      state: "default",
      title: "Meeting in the Forest",
      hook: "You stumble upon Aelindra tracking a mysterious creature...",
      messages: [
        { type: "character", text: "...", timestamp: "..." },
        { type: "player", text: "...", timestamp: "..." }
      ],
      createdAt: "2024-01-21T09:00:00Z",
      lastMessageAt: "2024-01-21T09:15:00Z"
    },
    {
      id: "conv_002",
      state: "battle",
      title: "Ambushed by Goblins",
      hook: "A goblin warband surrounds you both!",
      messages: [],
      createdAt: "2024-01-21T10:00:00Z"
    }
  ],

  // Metadata
  created_at: "2024-01-15T10:30:00Z",
  updated_at: "2024-01-21T14:22:00Z",
  lastPlayedAt: "2024-01-21T14:22:00Z",
  playTime: 12400  // seconds
}
```

## Image Generation Strategy

### On Character Creation
1. **Generate standard portrait** - Required, blocks creation
2. **Queue background generations**:
   - Battle portrait
   - Primary canvas scene (based on character background)
   - 3-5 key ability images

### On Demand
- State-specific portraits (injured, angry, etc.)
- Scene-specific canvas images
- Ability cast images

### Bulk Generation
- Background job processes queue
- Lower priority during off-peak hours
- Cache all generated images

## Cost Estimation

| Character Asset | Cost | Required? |
|----------------|------|-----------|
| Standard portrait | $0.003 | ✓ Yes |
| Battle portrait | $0.003 | Recommended |
| Injured portrait | $0.003 | Optional |
| 2-3 canvas scenes | $0.006-0.009 | Optional |
| Canvas video | $0.02 | Optional |
| 10 ability images | $0.03 | Optional |
| **Total (full)** | **~$0.08** | |
| **Total (minimal)** | **$0.006** | |

### Monthly Estimates

**Scenario 1: 1,000 users, 3 characters each**
- Minimal assets: $18/month
- Full assets: $240/month

**Scenario 2: 10,000 users, 5 characters each**
- Minimal assets: $150/month
- Full assets: $4,000/month

With smart caching and on-demand generation, you can optimize costs significantly.

## Database Schema

### MongoDB Example

```javascript
// Characters collection
{
  _id: ObjectId("..."),
  userId: ObjectId("..."),  // Owner
  name: "Aelindra Moonwhisper",
  // ... all fields above ...

  // Indexes
  indexes: {
    "userId": 1,
    "name": 1,
    "created_at": -1
  }
}

// Images collection (separate for caching)
{
  _id: ObjectId("..."),
  characterId: ObjectId("..."),
  type: "portrait",  // portrait, canvas, ability
  subtype: "battle",  // standard, battle, injured, etc.
  url: "https://im.runware.ai/.../image.jpg",
  seed: 123456789,
  prompt: "...",
  model: "runware:100@1",
  generatedAt: "2024-01-21T10:30:00Z",
  cost: 0.003
}

// Conversation collection
{
  _id: ObjectId("..."),
  characterId: ObjectId("..."),
  userId: ObjectId("..."),
  state: "default",
  title: "Meeting in the Forest",
  hook: "You stumble upon...",
  messages: [],
  createdAt: "2024-01-21T09:00:00Z"
}
```

## API Endpoints

### Image Management

```
POST   /api/characters/:id/images/portrait/:type
  Generate a specific portrait type (standard, battle, injured)

POST   /api/characters/:id/images/canvas
  Generate a scene/canvas image

POST   /api/characters/:id/abilities/:abilityId/image
  Generate ability cast image

GET    /api/characters/:id/images
  Get all images for character

DELETE /api/characters/:id/images/:imageId
  Delete/regenerate an image
```

### Conversation States

```
POST   /api/characters/:id/states
  Create a custom conversation state

PUT    /api/characters/:id/state/:stateName
  Switch to a conversation state

GET    /api/characters/:id/conversations
  Get conversation history

POST   /api/conversations
  Start a new conversation with hook
```

## Implementation Priority

1. ✅ **Phase 1** (Done): Basic Runware integration
2. 🔄 **Phase 2** (Now): Multi-image schema + backend routes
3. 📋 **Phase 3**: State-based conversations
4. 📋 **Phase 4**: Enhanced UI (tabs, dice overlay, expanded stats)
5. 📋 **Phase 5**: Batch generation queue
6. 📋 **Phase 6**: Video support for canvas scenes

Ready to implement Phase 2?
