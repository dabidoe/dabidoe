# Data Migration Guide

This guide explains how to migrate your existing D&D 5e character data (items, spells, characters) along with SRD content to the clean-structure database.

## What Gets Migrated

The migration script (`migrate-data.js`) will import:

1. **Existing Items** - All your custom items with:
   - Custom images (iconLayers)
   - Shareable links (guid)
   - User ownership (userId)
   - Public/private flags
   - All custom fields

2. **SRD Items** - 20+ official D&D 5e items:
   - Weapons (longsword, dagger, longbow, etc.)
   - Armor (leather, chain mail, shield)
   - Magic items (Ring of Protection, Bag of Holding)
   - Potions and gear

3. **Existing Spells** - All your custom spells with:
   - Custom images (iconLayers)
   - Shareable links (guid)
   - All spell properties

4. **SRD Spells** - 300+ official D&D 5e spells:
   - All spell schools (Evocation, Transmutation, etc.)
   - All spell levels (cantrips through 9th level)
   - Class associations (wizard, cleric, etc.)

5. **Characters** - All existing characters with:
   - Shareable links (guid)
   - Full character data preserved

## Schema Differences

The migration automatically adapts between schema formats:

### Items Schema Mapping

**Your Schema** → **Clean Structure**
- Flat structure preserved
- `itemSlot` → stays as is
- `damage: "1d8 slashing"` → stays as is
- `armor: "AC 16"` → stays as is

**SRD Items** → **Your Schema**
```javascript
{
  weapon: { damage: "1d8", damageType: "slashing" }
}
→
{
  damage: "1d8 slashing"
}
```

### Template vs Community Content

The migration distinguishes between SRD templates and user-created content:

**SRD Templates:**
```javascript
{
  name: "Longsword",
  userId: null,      // No owner
  template: true,    // Is template
  public: true,      // Available to all
  iconLayers: [],    // No custom image
  guid: "srd-longsword"
}
```

**Your Custom Content:**
```javascript
{
  name: "Cloak of Vengeful Shadows",
  userId: "684fab1436dea965427b151c",  // Your ID
  template: false,                      // User creation
  public: true,                         // Shareable
  iconLayers: [...],                    // Your custom image!
  guid: "cbd6dd03-6b7a-406b-8f60-dd05e393cee3"
}
```

## Prerequisites

Before running the migration:

1. **Environment Variables** - Ensure your `server/.env` file has:
   ```env
   # Your production database
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/character-foundry

   # Optional: If migrating from a different database
   OLD_MONGODB_URI=mongodb+srv://username:password@old-cluster.mongodb.net/old-database
   ```

2. **Backup** - Always backup your existing database before migrating:
   ```bash
   mongodump --uri="your-mongodb-uri" --out=./backup
   ```

## Running the Migration

### Option 1: Migrate from Same Database (Skip if Empty)

If your old and new databases are the same, the script will skip existing records:

```bash
cd clean-structure/server
node scripts/migrate-data.js
```

### Option 2: Migrate from Different Database

If you have an existing database you want to import from:

1. **Edit `.env` file:**
   ```env
   OLD_MONGODB_URI=mongodb+srv://user:pass@old-cluster.net/old-db
   MONGODB_URI=mongodb+srv://user:pass@new-cluster.net/character-foundry
   ```

2. **Run migration:**
   ```bash
   cd clean-structure/server
   node scripts/migrate-data.js
   ```

### Option 3: Fresh Start (SRD Only)

If you want to start fresh with just SRD content:

1. Skip the migration script
2. Start the server - MongoDB will be initialized
3. Manually import SRD data via the `/api/library` routes

## Migration Output

The script will show progress:

```
🚀 Starting migration...

✅ Connected to databases

📦 Migrating items...
   Found 23 existing items
   ✅ Migrated 23 items

📦 Adding SRD items...
   ✅ Added 20 SRD items

✨ Migrating spells...
   Found 45 existing spells
   ✅ Migrated 45 spells

✨ Adding SRD spells...
   ✅ Added 312 SRD spells

👤 Migrating characters...
   Found 8 existing characters
   ✅ Migrated 8 characters

🎉 Migration complete!

Summary:
   Items: 23 existing + 20 SRD = 43 total
   Spells: 45 existing + 312 SRD = 357 total
   Characters: 8

✅ All data migrated successfully!
```

## After Migration

### 1. Verify Data

Check the database has all your data:

```bash
# Start the server
cd clean-structure/server
npm start

# In another terminal, test the API
curl http://localhost:3001/api/library/stats
```

Expected response:
```json
{
  "success": true,
  "data": {
    "items": {
      "total": 43,
      "srd": 20,
      "community": 23
    },
    "spells": {
      "total": 357,
      "srd": 312,
      "community": 45
    }
  }
}
```

### 2. Test Shareable Links

Your existing shareable links should still work:

```bash
# Test an item guid
curl http://localhost:3001/api/library/items/YOUR-GUID-HERE

# Test a spell guid
curl http://localhost:3001/api/library/spells/YOUR-GUID-HERE
```

### 3. Browse Library Content

```bash
# Browse all items
curl http://localhost:3001/api/library/items

# Browse SRD items only
curl http://localhost:3001/api/library/items?template=true

# Browse community items
curl http://localhost:3001/api/library/items?template=false&public=true

# Search for items
curl http://localhost:3001/api/library/items?search=sword

# Filter by type
curl http://localhost:3001/api/library/items?type=Weapon&rarity=Rare
```

## Troubleshooting

### Error: "MongoDB connection string is required"

Make sure your `.env` file has `MONGODB_URI` set:
```env
MONGODB_URI=mongodb+srv://...
```

### Error: "E11000 duplicate key error"

The migration tried to insert items that already exist. This happens if you run the migration twice. Options:

1. **Drop collections first** (⚠️ CAREFUL - This deletes data):
   ```javascript
   // Add to migrate-data.js before migrating:
   await newDb.collection('items').drop().catch(() => {});
   await newDb.collection('spells').drop().catch(() => {});
   await newDb.collection('characters').drop().catch(() => {});
   ```

2. **Skip duplicates** (Recommended):
   The script already handles this by default

### Migration Runs But No Data

Check that:
1. `OLD_MONGODB_URI` points to the correct database
2. Collections are named correctly (`items`, `spells`, `characters`)
3. You have data in the old database

### Custom Fields Not Preserved

If you have custom fields not listed in the migration script:

1. Open `migrate-data.js`
2. Find the `adaptedItems` or `adaptedSpells` section
3. Add your custom fields:
   ```javascript
   const adaptedItems = oldItems.map(item => ({
     ...item,  // This spreads ALL fields
     // Your additional mappings...
   }));
   ```

## Database Collections

After migration, you'll have these collections:

### `items` Collection
- SRD items (template: true)
- Your custom items (template: false)
- Fields: name, type, rarity, itemSlot, damage, armor, iconLayers, guid, userId, public

### `spells` Collection
- SRD spells (template: true)
- Your custom spells (template: false)
- Fields: name, school, level, castingTime, range, components, duration, iconLayers, guid, userId, public

### `characters` Collection
- All your characters
- Fields: name, class, level, inventory, spells, abilities, guid, userId

## Next Steps

After successful migration:

1. **Update Character Creation** - New characters can auto-populate from library
2. **Library Browser** - Build UI to browse SRD + community content
3. **Clone System** - Allow cloning public items to character inventory
4. **Image Generation** - Continue using iconLayers for custom images

## Support

If you encounter issues:

1. Check MongoDB connection strings
2. Verify database names match
3. Ensure collections exist in source database
4. Check migration script output for error messages
5. Make sure you have backup before trying fixes
