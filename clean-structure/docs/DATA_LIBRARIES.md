# D&D 5e Data Libraries

This guide explains the D&D 5e data libraries and how to use them.

---

## 📚 What We Have

### 1. Spells Library (`data/spells-srd.json`)
**Size**: 594KB  
**Contents**: ~300 spells from D&D 5e SRD

All official spells including:
- Cantrips (0-level)
- 1st through 9th level spells
- Classes each spell is available to
- Components, range, duration
- Full descriptions

### 2. Items Library (`data/items-srd.json`)
**Contents**: 20+ essential items

- **Weapons**: Longsword, Shortsword, Greatsword, Dagger, Longbow, Shortbow
- **Armor**: Leather Armor, Chain Mail
- **Shields**: Standard Shield
- **Potions**: Healing, Greater Healing
- **Magic Items**: +1 weapons, Ring of Protection, Cloak of Protection, Bag of Holding
- **Adventuring Gear**: Rope, Torches, Rations, Bedroll, Backpack

### 3. Class Features (`data/class-features.json`)
**Contents**: Abilities for 8 classes

- **Fighter**: Second Wind, Fighting Style, Action Surge
- **Barbarian**: Rage, Unarmored Defense
- **Rogue**: Sneak Attack, Cunning Action
- **Wizard**: Arcane Recovery
- **Cleric**: Channel Divinity (Turn Undead)
- **Paladin**: Lay on Hands, Divine Smite
- **Ranger**: Favored Enemy
- **Monk**: Martial Arts, Ki, Flurry of Blows
- **Warlock**: Eldritch Blast

---

## 🔧 Data Loader Utility

The `shared/data-loader.js` utility automatically populates characters with:

### Functions

```javascript
import { 
  getSpellsForClass,
  getStartingEquipment,
  getClassAbilities,
  populateCharacterData 
} from '../shared/data-loader.js';

// Get all spells for a class
const wizardSpells = getSpellsForClass('wizard', 5);
// Returns: [{ id, name, level, school, damage, description, ... }]

// Get cantrips only
const cantrips = getCantripsForClass('wizard');

// Get starting equipment for a class
const equipment = getStartingEquipment('fighter');
// Returns: Longsword, Shield, Chain Mail, Potion, Backpack, etc.

// Get class abilities for current level
const abilities = getClassAbilities('barbarian', 3);
// Returns: Rage, Unarmored Defense, etc.

// Populate entire character (all-in-one)
const character = populateCharacterData({
  name: "Thorin",
  class: "Fighter",
  level: 3
});
// Adds: spells, equipment, abilities, currency
```

---

## 🎯 How It Works in the App

### Character Creation Flow

```
1. User creates character via AI
   ↓
2. AI generates: name, race, class, stats, background
   ↓
3. populateCharacterData() runs automatically
   ↓
4. Character now has:
   ✅ Spells (if spellcaster)
   ✅ Starting equipment (auto-equipped)
   ✅ Class abilities (level-appropriate)
   ✅ Starting gold
```

### Result

When user opens character:
- **SpellLibrary** shows actual spells (Fireball, Magic Missile, etc.)
- **InventoryManager** shows actual items (Longsword, Potion, etc.)
- **EquipmentSlots** shows equipped gear with AC calculation
- **AbilityLibrary** shows class features (Rage, Second Wind, etc.)

---

## 📊 Example: Level 5 Wizard

When a Level 5 Wizard is created:

**Spells Added:**
```javascript
{
  cantrips: ["Fire Bolt", "Mage Hand", "Prestidigitation"],
  level1: ["Magic Missile", "Shield", "Detect Magic"],
  level2: ["Misty Step", "Scorching Ray"],
  level3: ["Fireball", "Counterspell"]
}
// Total: ~30 spells available
```

**Equipment Added:**
```javascript
{
  weapons: ["Dagger"],
  armor: [],  // Wizards don't wear armor
  gear: ["Backpack", "Bedroll", "Rations", "Rope", "Torch"],
  consumables: ["Potion of Healing"]
}
```

**Abilities Added:**
```javascript
[
  {
    name: "Arcane Recovery",
    actionType: "action",
    uses: { current: 1, max: 1, per: "long rest" }
  }
]
```

**Currency Added:**
```javascript
{ cp: 0, sp: 0, gp: 100, pp: 0 }
```

---

## 🎨 Component Integration

### SpellLibrary
```jsx
<SpellLibrary character={character} />
```
- Shows `character.spellcasting.spells` (populated by data-loader)
- Filters by level (Cantrips → 9th)
- Shows spell slots: 4/4, 3/3, 3/3, 2/2
- Tap spell → Cast → Roll damage → AI narrative

### InventoryManager
```jsx
<InventoryManager character={character} />
```
- Shows `character.inventory` (populated by data-loader)
- Filter: All, Weapons, Armor, Consumables, Gear
- Sort: Name, Weight, Value, Rarity
- Tap item → Equip/Use/Drop

### EquipmentSlots
```jsx
<EquipmentSlots character={character} />
```
- Shows equipped items from `character.inventory`
- Calculates AC automatically
- Tap slot → Unequip

### AbilityLibrary
```jsx
<AbilityLibrary character={character} />
```
- Shows `character.abilities` (populated by data-loader)
- Filter: Action, Bonus, Reaction, Passive
- Shows uses: 2/2, 1/3
- Tap ability → Use → AI narrative

---

## 🔄 Adding More Data

### To Add More Spells
Edit `data/spells-srd.json`:
```json
{
  "name": "New Spell",
  "level": "3",
  "school": "evocation",
  "classes": ["wizard", "sorcerer"],
  "description": "..."
}
```

### To Add More Items
Edit `data/items-srd.json`:
```json
{
  "id": "flaming-sword",
  "name": "Flaming Sword",
  "category": "weapon",
  "rarity": "rare",
  "weapon": {
    "damage": "1d8",
    "damageType": "slashing"
  },
  "magic": {
    "bonus": 1,
    "effects": [
      {
        "name": "Flame Blade",
        "description": "Deals an extra 1d6 fire damage"
      }
    ]
  }
}
```

### To Add More Abilities
Edit `data/class-features.json`:
```json
"fighter": [
  {
    "level": 5,
    "id": "extra-attack",
    "name": "Extra Attack",
    "description": "You can attack twice when you take the Attack action",
    "actionType": "passive",
    "category": "combat"
  }
]
```

---

## 🚀 Next Steps

1. **Monster Library**: Add `monsters-srd.json` for combat encounters
2. **Feats**: Add `feats-srd.json` for character customization
3. **Conditions**: Add `conditions-srd.json` for status effects
4. **Races**: Add racial traits and abilities
5. **Backgrounds**: Add background features

---

## 📖 API Integration

The data loader can be used server-side during character creation:

```javascript
// server/src/routes/characters.js

import { populateCharacterData } from '../../shared/data-loader.js';

router.post('/characters/create', async (req, res) => {
  // 1. AI generates base character
  const character = await gemini.generateCharacter(req.body.prompt);
  
  // 2. Populate with D&D data
  const populatedCharacter = populateCharacterData(character);
  
  // 3. Save to MongoDB
  const saved = await mongodb.createCharacter(populatedCharacter);
  
  res.json(saved);
});
```

---

## ✅ Benefits

**Before (Empty Components):**
- SpellLibrary: "No spells yet"
- InventoryManager: "Empty inventory"
- AbilityLibrary: "No abilities yet"

**After (With Data Libraries):**
- SpellLibrary: 30+ spells ready to cast
- InventoryManager: Full adventuring kit
- AbilityLibrary: All class features unlocked
- EquipmentSlots: Gear equipped with AC calculated

**The app is now immediately useful!** 🎉
