# Character-Ability System Design

## Problem
- Abilities/spells are separate entities with unique IDs
- Not automatically tied to characters
- Need to "ADD" abilities to each character
- Characters need to "know" their spells, attacks, items

## Solution Options

---

## Option 1: Character References Array (Recommended)

### Database Schema

**Character Document:**
```javascript
{
  _id: ObjectId("..."),
  name: "Achilles",
  hp: { current: 104, max: 104 },
  ac: 18,

  // Array of ability references
  abilities: [
    {
      abilityId: ObjectId("65fc5af6a30f45caa99ddd36"), // References Ability._id
      category: "spell",                                // spell, attack, item, etc.
      equipped: true,                                   // Is it currently active/equipped?
      uses: { current: 3, max: 5 },                    // For limited-use abilities
      addedAt: ISODate("2025-01-15T10:00:00Z"),
      customNotes: "Favorite healing spell"            // Optional player notes
    },
    {
      abilityId: ObjectId("65fc5af7a30f45caa99ddd37"),
      category: "attack",
      equipped: true,
      uses: { current: null, max: null }               // Unlimited use
    }
  ],

  // Items inventory
  items: [
    {
      itemId: ObjectId("..."),
      quantity: 3,
      equipped: true
    }
  ],

  // Stats
  stats: {
    str: 20, dex: 16, con: 18,
    int: 12, wis: 14, cha: 16
  }
}
```

**Ability Document (Your Current Structure):**
```javascript
{
  _id: ObjectId("65fc5af6a30f45caa99ddd36"),
  name: "Cure Wounds",
  shortDescription: "",
  longDescription: "Casting Time: 1 action\nRange: Touch...",
  school: "Abjuration",
  level: "Cantrip",
  castingTime: "1 action",
  range: "Touch",
  components: "V, S",
  duration: "Instantaneous",
  iconLayers: [...],

  // D&D mechanics
  attackBonus: 9,           // For attacks
  damageFormula: "1d8+6",   // Damage dice
  savingThrow: {            // For spells
    ability: "CON",
    dc: 15
  },

  userId: "64385ed5a8745f6614169bcd",
  guid: "9e3f09c6-e827-4703-b3da-8134b2df627a",
  createdAt: ISODate("..."),
  updatedAt: ISODate("...")
}
```

### Pros:
✅ Characters explicitly know which abilities they have
✅ Can track uses (spell slots, daily abilities)
✅ Can have character-specific customization
✅ Easy to add/remove abilities
✅ Maintains ability reusability across characters

### Cons:
❌ Requires population/join to get full ability data
❌ Two-step query (get character, then get abilities)

---

## Option 2: Embedded Ability Data

**Not Recommended** - Would duplicate ability data in every character that has it. Updates to abilities wouldn't reflect in characters.

---

## Option 3: Junction Table (SQL-style)

**Not Recommended for MongoDB** - Better suited for SQL databases.

---

## Recommended Implementation

### API Endpoints Needed

#### 1. Get Character with Abilities
```
GET /api/characters/:id?include=abilities
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "achilles",
    "name": "Achilles",
    "hp": { "current": 104, "max": 104 },
    "ac": 18,
    "stats": {
      "str": 20,
      "dex": 16,
      "con": 18,
      "int": 12,
      "wis": 14,
      "cha": 16
    },
    "abilities": [
      {
        "abilityId": "65fc5af6a30f45caa99ddd36",
        "category": "spell",
        "equipped": true,
        "uses": { "current": 3, "max": 5 },

        // Populated ability data
        "details": {
          "name": "Cure Wounds",
          "shortDescription": "",
          "longDescription": "Casting Time: 1 action\nRange: Touch...",
          "school": "Abjuration",
          "level": "1st",
          "castingTime": "1 action",
          "range": "Touch",
          "components": "V, S",
          "duration": "Instantaneous",
          "iconLayers": [...],
          "damageFormula": "1d8 + spellcasting modifier"
        }
      },
      {
        "abilityId": "65fc5af7a30f45caa99ddd37",
        "category": "attack",
        "equipped": true,
        "uses": { "current": null, "max": null },
        "details": {
          "name": "Sword Strike",
          "shortDescription": "A powerful melee attack",
          "longDescription": "Strike with your bronze blade...",
          "attackBonus": 9,
          "damageFormula": "1d8+6",
          "damageType": "slashing",
          "iconLayers": [...]
        }
      }
    ]
  }
}
```

#### 2. Add Ability to Character
```
POST /api/characters/:id/abilities
```

**Request:**
```json
{
  "abilityId": "65fc5af6a30f45caa99ddd36",
  "category": "spell",
  "equipped": true,
  "uses": { "max": 5 }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Ability added to character",
  "data": {
    "abilityId": "65fc5af6a30f45caa99ddd36",
    "category": "spell",
    "equipped": true,
    "uses": { "current": 5, "max": 5 }
  }
}
```

#### 3. Remove Ability from Character
```
DELETE /api/characters/:id/abilities/:abilityId
```

#### 4. Update Ability Uses (After casting/using)
```
PATCH /api/characters/:id/abilities/:abilityId/uses
```

**Request:**
```json
{
  "current": 2  // Spent one use
}
```

#### 5. Browse All Abilities (For adding to character)
```
GET /api/abilities?category=spell&level=1
```

---

## Backend Implementation (Node.js)

### MongoDB Query with Population

```javascript
// In your Node server
const getCharacterWithAbilities = async (characterId) => {
  const character = await Character.findById(characterId)

  if (!character) {
    throw new Error('Character not found')
  }

  // Populate abilities
  const populatedAbilities = await Promise.all(
    character.abilities.map(async (charAbility) => {
      const abilityDetails = await Ability.findById(charAbility.abilityId)

      return {
        ...charAbility.toObject(),
        details: abilityDetails
      }
    })
  )

  return {
    ...character.toObject(),
    abilities: populatedAbilities
  }
}
```

### Using Mongoose Population (Cleaner)

**Character Schema:**
```javascript
const characterAbilitySchema = new mongoose.Schema({
  abilityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ability',
    required: true
  },
  category: {
    type: String,
    enum: ['spell', 'attack', 'item', 'feature'],
    required: true
  },
  equipped: {
    type: Boolean,
    default: true
  },
  uses: {
    current: Number,
    max: Number
  }
})

const characterSchema = new mongoose.Schema({
  name: String,
  hp: {
    current: Number,
    max: Number
  },
  ac: Number,
  abilities: [characterAbilitySchema],
  stats: {
    str: Number,
    dex: Number,
    con: Number,
    int: Number,
    wis: Number,
    cha: Number
  }
})

// Query with population
Character.findById(id)
  .populate('abilities.abilityId')
  .exec()
```

---

## Migration Strategy

### Step 1: Update Existing Characters
```javascript
// Add abilities array to existing characters
db.characters.updateMany(
  { abilities: { $exists: false } },
  {
    $set: {
      abilities: []
    }
  }
)
```

### Step 2: Migrate Hardcoded Abilities
```javascript
// If Achilles currently has hardcoded abilities, convert them:
const achillesSwordStrike = await Ability.findOne({ name: "Sword Strike" })

await Character.updateOne(
  { name: "Achilles" },
  {
    $push: {
      abilities: {
        abilityId: achillesSwordStrike._id,
        category: "attack",
        equipped: true,
        uses: { current: null, max: null }
      }
    }
  }
)
```

---

## Usage Tracking

### When ability is used:
```javascript
// Decrement uses
await Character.updateOne(
  {
    _id: characterId,
    "abilities.abilityId": abilityId
  },
  {
    $inc: { "abilities.$.uses.current": -1 }
  }
)
```

### On long rest:
```javascript
// Restore all ability uses
await Character.updateOne(
  { _id: characterId },
  {
    $set: {
      "abilities.$[].uses.current": "$abilities.$[].uses.max"
    }
  }
)
```

---

## Frontend Considerations

### Loading State
- Show "Loading abilities..." when fetching
- Display partial character data, then populate abilities

### Caching
- Cache ability details in React state
- Don't re-fetch unchanged ability data

### Real-time Updates
- WebSocket notification when ability uses change
- Sync across devices if character is open multiple places

---

## Scalability Notes

### For Large Ability Collections:
- Paginate abilities if character has 50+
- Lazy load ability details (show name/icon, load details on click)
- Cache frequently used abilities client-side

### For Shared Abilities:
- Multiple characters can reference same ability
- Update ability once, reflects in all characters
- Track who created ability vs who uses it

---

## Summary

**Recommended Approach:**
1. Add `abilities: []` array to Character schema
2. Each entry has `abilityId` reference + metadata (uses, equipped)
3. Populate ability details when fetching character
4. API endpoints for add/remove/update abilities
5. React app displays full ability details from populated data

**Benefits:**
- Characters explicitly know their abilities
- Track uses (spell slots, cooldowns)
- Abilities remain reusable across characters
- Easy to add/remove abilities
- Supports character-specific customization

Next: Would you like me to implement the React components to display and manage these dynamic abilities?
