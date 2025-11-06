# D&D 5e Data Import Guide

## Overview

This system imports the complete D&D 5e spell and item library from 5etools and converts it to your database schema format.

**What You Get:**
- ~500+ official D&D spells
- ~2000+ official D&D items
- All properly formatted for your schema
- Ready to use in your character system

---

## Quick Start

### Step 1: Install Dependencies

```bash
cd scripts
npm install
```

### Step 2: Import Data from 5etools

```bash
# Import all spells and items
npm run import:all

# Or import individually:
npm run import:spells
npm run import:items
```

**This creates:**
- `data/spells-seed.json` - All D&D spells
- `data/items-seed.json` - All D&D items

### Step 3: Seed Your Database

```bash
# Set your MongoDB connection
export MONGODB_URI="mongodb://localhost:27017/characterfoundry"

# Seed database
npm run seed:all

# Or seed individually:
npm run seed:spells
npm run seed:items
```

### Step 4: Done!

Your database now has the full D&D library. Characters can be assigned any spell or item.

---

## What Gets Imported

### Spells (Example: "Cure Wounds")

```json
{
  "_id": ObjectId("..."),
  "name": "Cure Wounds",
  "shortDescription": "A creature you touch regains hit points...",
  "longDescription": "Casting Time: 1 action\nRange: Touch\nComponents: V, S\nDuration: Instantaneous\n\nA creature you touch regains a number of hit points equal to 1d8 + your spellcasting ability modifier...",

  "school": "Evocation",
  "level": "1st",
  "castingTime": "1 action",
  "range": "Touch",
  "components": "V, S",
  "duration": "Instantaneous",

  "attackBonus": null,
  "damageFormula": "1d8",
  "savingThrow": null,

  "userId": "system",
  "guid": "9e3f09c6-e827-4703-b3da-8134b2df627a",
  "createdAt": ISODate("2025-01-15T10:00:00Z"),
  "updatedAt": ISODate("2025-01-15T10:00:00Z"),
  "iconLayers": [["default_evocation_icon"]],
  "tokens": 1,
  "source": "PHB",
  "page": 230
}
```

### Items (Example: "Longsword")

```json
{
  "_id": ObjectId("..."),
  "name": "Longsword",
  "shortDescription": "A versatile martial weapon",
  "longDescription": "Versatile (1d10)\nProperties: Versatile",

  "type": "Weapon",
  "rarity": "Common",
  "itemSlot": "Weapon",
  "damage": "1d8",
  "armor": "",

  "userId": "system",
  "guid": "f169bfb9-49c1-4965-adc0-06ba18b810c3",
  "createdAt": ISODate("2025-01-15T10:00:00Z"),
  "updatedAt": ISODate("2025-01-15T10:00:00Z"),
  "iconLayers": [["default_weapon_icon"]],
  "tokens": 1,
  "source": "PHB",
  "page": 149,

  "value": 1500,
  "weight": 3,
  "properties": ["versatile"]
}
```

---

## Schema Mapping

### How 5etools Data Maps to Your Schema

#### Spells
| 5etools Field | Your Field | Example |
|--------------|------------|---------|
| `spell.name` | `name` | "Cure Wounds" |
| `spell.school` | `school` | "Evocation" |
| `spell.level` | `level` | "1st", "Cantrip" |
| `spell.time[0]` | `castingTime` | "1 action" |
| `spell.range` | `range` | "Touch", "60 feet" |
| `spell.components` | `components` | "V, S, M (bat guano)" |
| `spell.duration` | `duration` | "Instantaneous" |
| `spell.entries` | `longDescription` | Full spell text |

#### Items
| 5etools Field | Your Field | Example |
|--------------|------------|---------|
| `item.name` | `name` | "Longsword" |
| `item.type` | `type` | "Weapon", "Armor" |
| `item.rarity` | `rarity` | "Common", "Rare" |
| `item.dmg1` | `damage` | "1d8" |
| `item.ac` | `armor` | "18" |
| `item.entries` | `longDescription` | Full item description |

---

## Collections Structure

### Option 1: Unified Collection (Recommended)

Store everything in one `abilities` collection:

```javascript
// abilities collection
{
  _id: ObjectId("..."),
  name: "Cure Wounds",
  category: "spell",  // "spell", "item", "attack", "feature"
  // ... rest of fields
}
```

**Pros:**
- Simple to manage
- Easy to query "all character abilities"
- Consistent API

### Option 2: Separate Collections

```javascript
// spells collection
{ _id, name, school, level, ... }

// items collection
{ _id, name, type, rarity, ... }

// attacks collection (custom)
{ _id, name, attackBonus, damageFormula, ... }
```

**Pros:**
- Clear separation
- Type-specific indexes

---

## Customization

### Add Custom User ID

Import with a specific user ID:

```bash
node import-dnd-data.js --type=spells --userId=64385ed5a8745f6614169bcd
```

### Filter by Source Book

Edit `import-dnd-data.js` to filter:

```javascript
const spells = spellData.spell
  .filter(spell => spell.source === 'PHB') // Only Player's Handbook
  .map(spell => convertSpell(spell, userId))
```

### Add Custom Fields

In `convertSpell()` or `convertItem()`, add:

```javascript
return {
  name: spell.name,
  // ... existing fields ...

  // Custom additions
  isHomebrew: false,
  tags: ['official', 'phb'],
  prerequisites: spell.prerequisites || null
}
```

---

## Advanced Usage

### Import Additional Sources

5etools has multiple source books:

```javascript
const DATA_SOURCES = {
  spells_phb: 'https://raw.githubusercontent.com/5etools-mirror-1/5etools-mirror-1.github.io/master/data/spells/spells-phb.json',
  spells_xge: 'https://raw.githubusercontent.com/5etools-mirror-1/5etools-mirror-1.github.io/master/data/spells/spells-xge.json',
  spells_tce: 'https://raw.githubusercontent.com/5etools-mirror-1/5etools-mirror-1.github.io/master/data/spells/spells-tce.json',
  items: 'https://raw.githubusercontent.com/5etools-mirror-1/5etools-mirror-1.github.io/master/data/items.json',
  items_dmg: 'https://raw.githubusercontent.com/5etools-mirror-1/5etools-mirror-1.github.io/master/data/items-dmg.json'
}
```

### Update Existing Data

To refresh data without duplicates:

```javascript
// In seed-database.js
const result = await collection.updateMany(
  { source: 'PHB' },
  { $set: { updatedAt: new Date() } }
)
```

### Export for Review

Preview before importing:

```bash
node import-dnd-data.js --type=spells
# Review data/spells-seed.json
# Then seed when ready:
node seed-database.js --collection=spells
```

---

## Troubleshooting

### Error: Cannot find module 'mongodb'

```bash
cd scripts
npm install
```

### Error: Connection refused

Check MongoDB is running:
```bash
# Start MongoDB
mongod

# Or if using Docker:
docker start mongodb
```

### Error: Duplicate key error

The seed script skips duplicates automatically. If you need to force reimport:

```javascript
// In seed-database.js, add:
await collection.deleteMany({ source: 'PHB' })
// Then run seed again
```

### Data seems wrong

Validate the source:
1. Check `data/spells-seed.json`
2. Review conversion logic in `convertSpell()`
3. Test with a single spell first

---

## Integration with Your App

### API Endpoint

Create endpoint to browse spells:

```javascript
// GET /api/abilities?category=spell&level=1&school=Evocation
app.get('/api/abilities', async (req, res) => {
  const { category, level, school } = req.query

  const filter = {}
  if (category) filter.category = category
  if (level) filter.level = level
  if (school) filter.school = school

  const abilities = await db.collection('abilities')
    .find(filter)
    .limit(100)
    .toArray()

  res.json({ success: true, data: abilities })
})
```

### Add to Character

```javascript
// POST /api/characters/:id/abilities
app.post('/api/characters/:id/abilities', async (req, res) => {
  const { abilityId } = req.body

  // Verify ability exists
  const ability = await db.collection('abilities').findOne({ _id: ObjectId(abilityId) })
  if (!ability) {
    return res.status(404).json({ error: 'Ability not found' })
  }

  // Add to character
  await db.collection('characters').updateOne(
    { _id: ObjectId(req.params.id) },
    {
      $push: {
        abilities: {
          abilityId: ability._id,
          category: ability.category || 'spell',
          equipped: true,
          uses: { current: 5, max: 5 } // Based on spell level/character
        }
      }
    }
  )

  res.json({ success: true })
})
```

---

## Full Workflow Example

```bash
# 1. Install
cd scripts
npm install

# 2. Import from 5etools
npm run import:all

# 3. Review data (optional)
cat data/spells-seed.json | grep "Cure Wounds" -A 20

# 4. Configure MongoDB
export MONGODB_URI="mongodb://localhost:27017/characterfoundry"

# 5. Seed database
npm run seed:all

# 6. Verify in MongoDB
mongo characterfoundry
db.abilities.count()  // Should show ~2500+ documents
db.abilities.findOne({ name: "Cure Wounds" })

# 7. Use in your app!
```

---

## Data Sources

### 5etools GitHub Repository
- **Spells**: https://github.com/5etools-mirror-1/5etools-mirror-1.github.io/tree/master/data/spells
- **Items**: https://github.com/5etools-mirror-1/5etools-mirror-1.github.io/tree/master/data

### Alternative: D&D Beyond API

If you prefer D&D Beyond, you can use their API (requires authentication):

```javascript
// Example D&D Beyond fetch
const response = await fetch('https://www.dndbeyond.com/api/spells', {
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN'
  }
})
```

Note: D&D Beyond API is private and requires special access.

---

## License & Legal

**Important:** D&D content is copyrighted by Wizards of the Coast. This import tool is for:
- Personal use
- Educational purposes
- Development/testing

Do not redistribute the imported data commercially without proper licensing.

---

## Summary

✅ **Scripts Created:**
- `import-dnd-data.js` - Fetches and converts 5etools data
- `seed-database.js` - Imports into MongoDB
- `package.json` - NPM scripts for easy use

✅ **What You Get:**
- 500+ D&D 5e spells
- 2000+ D&D 5e items
- Perfect schema match
- Ready for character assignment

✅ **Time to Import:**
- Download: ~2 minutes
- Seed database: ~10 seconds
- Total: < 5 minutes

**Next:** Run `npm run full-import` and you're done! 🎉
