# Library API Documentation

The Library API provides endpoints for browsing, searching, and sharing D&D 5e content including SRD templates and community-created items, spells, and characters.

## Key Features

- **Browse SRD Content** - Access 300+ official spells, 20+ items
- **Community Content** - Share and discover user-created content
- **Public Sharing** - Shareable links via GUID
- **Advanced Filtering** - Search by type, rarity, class, school, etc.
- **Clone to Character** - Add library items directly to character inventory

## Endpoints

### Items

#### Browse Items

```http
GET /api/library/items
```

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `type` | string | Filter by type: Weapon, Armor, Potion, etc. |
| `rarity` | string | Filter by rarity: Common, Uncommon, Rare, etc. |
| `template` | boolean | `true` for SRD only, `false` for community only |
| `public` | boolean | `true` for shareable content only |
| `userId` | string | Get specific user's items |
| `search` | string | Search by name or description |
| `limit` | number | Max results (default: 100) |
| `skip` | number | Pagination offset (default: 0) |

**Example Requests:**

```bash
# Browse all items
curl http://localhost:3001/api/library/items

# Browse SRD weapons only
curl http://localhost:3001/api/library/items?template=true&type=Weapon

# Search for healing potions
curl http://localhost:3001/api/library/items?search=healing

# Browse rare magic items
curl http://localhost:3001/api/library/items?rarity=Rare&type=Magic

# Get public community items
curl http://localhost:3001/api/library/items?template=false&public=true
```

**Response:**

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "name": "Longsword",
        "type": "Weapon",
        "rarity": "Common",
        "itemSlot": "MainHand",
        "damage": "1d8 slashing",
        "guid": "srd-longsword",
        "template": true,
        "public": true,
        "userId": null,
        "iconLayers": [],
        "createdAt": "2025-11-11T10:00:00.000Z"
      }
    ],
    "total": 43,
    "limit": 100,
    "skip": 0
  }
}
```

#### Get Item by GUID (Shareable Link)

```http
GET /api/library/items/:guid
```

**Example:**

```bash
curl http://localhost:3001/api/library/items/srd-longsword

# Or a community item
curl http://localhost:3001/api/library/items/cbd6dd03-6b7a-406b-8f60-dd05e393cee3
```

**Response:**

```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Longsword",
    "type": "Weapon",
    "rarity": "Common",
    "damage": "1d8 slashing",
    "guid": "srd-longsword",
    "template": true,
    "public": true
  }
}
```

**Error (Not Found or Not Public):**

```json
{
  "success": false,
  "error": {
    "message": "Item not found or not public"
  }
}
```

#### Clone Item to Character

```http
POST /api/library/items/:guid/clone
```

**Request Body:**

```json
{
  "characterId": "507f191e810c19729de860ea"
}
```

**Example:**

```bash
curl -X POST http://localhost:3001/api/library/items/srd-longsword/clone \
  -H "Content-Type: application/json" \
  -d '{"characterId": "507f191e810c19729de860ea"}'
```

**Response:**

```json
{
  "success": true,
  "data": {
    "item": {
      "name": "Longsword",
      "type": "Weapon",
      "damage": "1d8 slashing",
      "sourceGuid": "srd-longsword",
      "characterId": "507f191e810c19729de860ea",
      "equippedSlot": null,
      "quantity": 1
    },
    "message": "Longsword added to inventory"
  }
}
```

### Spells

#### Browse Spells

```http
GET /api/library/spells
```

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `school` | string | Filter by school: Evocation, Transmutation, etc. |
| `level` | string | Filter by level: "0" (cantrip), "1"-"9" |
| `category` | string | Filter by category: Damage, Healing, Utility, etc. |
| `class` | string | Filter by class: wizard, cleric, warlock, etc. |
| `template` | boolean | `true` for SRD only, `false` for community only |
| `public` | boolean | `true` for shareable content only |
| `userId` | string | Get specific user's spells |
| `search` | string | Search by name or description |
| `limit` | number | Max results (default: 100) |
| `skip` | number | Pagination offset (default: 0) |

**Example Requests:**

```bash
# Browse all spells
curl http://localhost:3001/api/library/spells

# Get wizard cantrips
curl http://localhost:3001/api/library/spells?class=wizard&level=0

# Search for fire spells
curl http://localhost:3001/api/library/spells?search=fire

# Browse healing spells
curl http://localhost:3001/api/library/spells?category=Healing

# Get 3rd level evocation spells
curl http://localhost:3001/api/library/spells?school=Evocation&level=3
```

**Response:**

```json
{
  "success": true,
  "data": {
    "spells": [
      {
        "_id": "507f1f77bcf86cd799439012",
        "name": "Fireball",
        "school": "Evocation",
        "level": "3",
        "castingTime": "1 action",
        "range": "150 feet",
        "components": "V, S, M",
        "duration": "Instantaneous",
        "damage": {
          "formula": "8d6",
          "type": "fire"
        },
        "savingThrow": {
          "ability": "DEX"
        },
        "classes": ["wizard", "sorcerer"],
        "guid": "srd-fireball",
        "template": true,
        "public": true,
        "iconLayers": []
      }
    ],
    "total": 312,
    "limit": 100,
    "skip": 0
  }
}
```

#### Get Spell by GUID

```http
GET /api/library/spells/:guid
```

**Example:**

```bash
curl http://localhost:3001/api/library/spells/srd-fireball
```

### Statistics

#### Get Library Statistics

```http
GET /api/library/stats
```

**Example:**

```bash
curl http://localhost:3001/api/library/stats
```

**Response:**

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

## Content Types

### Template vs Community Content

**SRD Templates** (template: true):
- Official D&D 5e content
- Always public
- No custom images
- userId is null
- GUID format: `srd-{item-name}`

**Community Content** (template: false):
- User-created items/spells
- Can be public or private
- May have custom iconLayers
- userId identifies creator
- GUID format: UUID

### Item Types

- `Weapon` - Swords, bows, daggers, etc.
- `Armor` - Light, medium, heavy armor
- `Shield` - Defensive equipment
- `Potion` - Consumable potions
- `Scroll` - Magic scrolls
- `Ring` - Magic rings
- `Jewelry` - Amulets, necklaces
- `Equipment` - Adventuring gear
- `Tool` - Tools and kits
- `Treasure` - Valuable items

### Item Rarities

- `Common` - Standard equipment
- `Uncommon` - Minor magic items
- `Rare` - Significant magic items
- `Very Rare` - Powerful magic items
- `Legendary` - Legendary artifacts

### Spell Schools

- `Abjuration` - Protective magic
- `Conjuration` - Summoning and teleportation
- `Divination` - Information and knowledge
- `Enchantment` - Mind-affecting magic
- `Evocation` - Energy and damage
- `Illusion` - Deception and trickery
- `Necromancy` - Death and undeath
- `Transmutation` - Transformation

### Spell Levels

- `0` - Cantrips (unlimited use)
- `1` - 1st level spells
- `2` - 2nd level spells
- ...
- `9` - 9th level spells (most powerful)

## Integration Examples

### Frontend: Browse and Add Item

```javascript
// Browse library items
async function browseItems(filters = {}) {
  const params = new URLSearchParams(filters);
  const response = await fetch(`/api/library/items?${params}`);
  const data = await response.json();
  return data.data.items;
}

// Clone item to character inventory
async function addItemToCharacter(itemGuid, characterId) {
  const response = await fetch(`/api/library/items/${itemGuid}/clone`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ characterId })
  });
  const data = await response.json();
  return data.data.item;
}

// Usage
const weapons = await browseItems({ type: 'Weapon', template: true });
const addedItem = await addItemToCharacter('srd-longsword', characterId);
```

### Frontend: Spell Library Browser

```javascript
// Get wizard spells by level
async function getWizardSpells(level) {
  const response = await fetch(
    `/api/library/spells?class=wizard&level=${level}&template=true`
  );
  const data = await response.json();
  return data.data.spells;
}

// Search spells
async function searchSpells(query) {
  const response = await fetch(
    `/api/library/spells?search=${encodeURIComponent(query)}`
  );
  const data = await response.json();
  return data.data.spells;
}
```

### Public Shareable Links

```javascript
// Generate shareable link
function getShareableLink(type, guid) {
  const baseUrl = 'https://yourdomain.com';
  return `${baseUrl}/library/${type}/${guid}`;
}

// Example: Share a custom magic item
const shareUrl = getShareableLink('items', 'cbd6dd03-6b7a-406b-8f60-dd05e393cee3');
// https://yourdomain.com/library/items/cbd6dd03-6b7a-406b-8f60-dd05e393cee3

// On the frontend, fetch the shared item
async function viewSharedItem(guid) {
  const response = await fetch(`/api/library/items/${guid}`);
  const data = await response.json();

  if (data.success) {
    // Display the item
    console.log('Shared item:', data.data);
  } else {
    // Item not found or not public
    console.error('Cannot view item');
  }
}
```

## Error Handling

All endpoints return consistent error format:

```json
{
  "success": false,
  "error": {
    "message": "Error description"
  }
}
```

**Common Error Codes:**

- `503` - Database not available
- `404` - Item/spell not found or not public
- `500` - Server error

## Rate Limiting

Currently no rate limiting is implemented. Consider adding rate limiting for production:

```javascript
import rateLimit from 'express-rate-limit';

const libraryLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/library', libraryLimiter, libraryRoutes);
```

## Security Notes

1. **Public Access** - Only items/spells marked `public: true` are accessible via GUID
2. **User Filtering** - The `userId` filter is available for authenticated requests
3. **Clone Validation** - Clone endpoint should verify character ownership (add authentication)
4. **Input Validation** - All query parameters are validated and sanitized

## Future Enhancements

Potential additions to the Library API:

- [ ] User authentication for private content
- [ ] Like/favorite system for popular items
- [ ] Usage statistics (views, clones)
- [ ] Comments and ratings
- [ ] Collections/tags for organizing content
- [ ] Version history for items/spells
- [ ] Import/export functionality
- [ ] Community moderation tools
