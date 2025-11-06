# Icon System for D&D Abilities

## Problem

5etools doesn't provide image files - just data. We need icons for ~2500+ spells and items.

## Solution

Multi-tier icon system with automatic fallbacks:

---

## 🎨 Icon Options

### Option 1: Emoji Icons (Default)
**Pros:**
- ✅ Works immediately, no setup
- ✅ No external dependencies
- ✅ Mobile-friendly
- ✅ Lightweight

**Example:**
```
🔥 Fireball
🛡️ Shield
⚔️ Longsword
🧪 Potion of Healing
```

### Option 2: Game-Icons.net API (Recommended)
**Pros:**
- ✅ Free, no API key needed
- ✅ 4000+ high-quality SVG icons
- ✅ Customizable colors
- ✅ Professional look

**Example:**
```
https://game-icons.net/icons/FF5722/000000/1x1/lorc/fire-bolt.svg
```

**Preview:** https://game-icons.net

### Option 3: Custom Upload System
**Pros:**
- ✅ Full control over branding
- ✅ Can use official D&D art (if licensed)
- ✅ Consistent with your design

**Requires:**
- Icon server/CDN
- Upload interface
- Image processing

---

## 🚀 Quick Start

### Current Implementation

The system is already set up with emoji + game-icons.net:

```javascript
// In AbilityCard.jsx
import AbilityIcon from './AbilityIcon'

<AbilityIcon
  ability={ability}
  size="medium"
  format="auto"  // auto, emoji, or image
/>
```

**Format Options:**
- `auto` - Tries game-icons, falls back to emoji
- `emoji` - Always uses emoji
- `image` - Tries image URL, falls back to emoji

---

## 🎯 How It Works

### Icon Selection Priority:

```
1. Check iconLayers for custom URL
   ↓ (if not found)
2. Generate game-icons.net URL
   ↓ (if load fails)
3. Fall back to emoji
```

### Spell Icons

Mapped by school:

| School | Emoji | Game Icon | Color |
|--------|-------|-----------|-------|
| Abjuration | 🛡️ | shield-reflect | Green |
| Conjuration | 🌀 | swirl-ring | Purple |
| Divination | 🔮 | crystal-ball | Blue |
| Enchantment | ✨ | sparkles | Pink |
| Evocation | 🔥 | fire-bolt | Red |
| Illusion | 👁️ | eye-target | Cyan |
| Necromancy | 💀 | death-skull | Gray |
| Transmutation | ⚗️ | potion-ball | Orange |

### Item Icons

Mapped by type:

| Type | Emoji | Game Icon | Rarity Color |
|------|-------|-----------|--------------|
| Weapon | ⚔️ | crossed-swords | By rarity |
| Armor | 🛡️ | chest-armor | By rarity |
| Potion | 🧪 | potion | By rarity |
| Ring | 💍 | ring | By rarity |
| Wondrous | ✨ | magic-swirl | By rarity |

---

## 📦 What's Included

### Files Created:

```
src/utils/icons.js           - Icon logic and mappings
src/components/AbilityIcon.jsx  - Display component
src/components/AbilityIcon.css  - Styling with rarity effects
```

### Features:

✅ **Emoji fallbacks** for all spell schools and item types
✅ **Game-icons.net integration** (4000+ free icons)
✅ **Color-coded by school/rarity**
✅ **Rarity glow effects** (legendary items pulse!)
✅ **Automatic error handling** (falls back gracefully)
✅ **Size variants** (small, medium, large)
✅ **Hover animations**
✅ **Loading states**

---

## 🎨 Visual Examples

### Emoji Mode:
```
🔥 Fireball (3rd level)
🛡️ Shield (1st level)
⚔️ Longsword
💍 Ring of Protection [Legendary Glow!]
```

### Game-Icons Mode:
- Professional SVG icons
- Color-coded by school/rarity
- Scalable to any size

### Badge Mode:
```
[AJU] Abjuration (green badge)
[EVO] Evocation (red badge)
[WPN] Weapon (gray badge)
```

---

## 🔧 Customization

### Change Default Format

In `AbilityIcon.jsx`:
```javascript
<AbilityIcon
  ability={ability}
  format="game-icons"  // Force game-icons
/>
```

### Add Custom Icon Mappings

In `src/utils/icons.js`:
```javascript
export const SPELL_SCHOOL_ICONS = {
  'Abjuration': 'shield-reflect',
  'YourCustomSchool': 'your-icon-name'
}
```

### Use Your Own Icon Server

In `src/utils/icons.js`:
```javascript
export function parseIconLayers(iconLayers, ability) {
  if (iconLayers && iconLayers[0][0]) {
    const iconId = iconLayers[0][0]
    // Point to your CDN
    return `https://cdn.characterfoundry.io/icons/${iconId}.png`
  }
  // ... fallbacks
}
```

---

## 📊 Performance

### Emoji Icons:
- **Size:** 0 bytes (Unicode characters)
- **Load time:** Instant
- **Requests:** 0
- **Best for:** MVP, mobile, quick prototypes

### Game-Icons.net:
- **Size:** ~2-5 KB per icon (SVG)
- **Load time:** <100ms
- **Requests:** 1 per unique icon
- **Best for:** Production, professional look
- **CDN:** Fast global delivery

### Custom Upload:
- **Size:** Depends on your images
- **Load time:** Depends on your CDN
- **Requests:** 1 per icon
- **Best for:** Branded experience

---

## 🚀 Upgrading to Custom Images

### Step 1: Set up Icon Server

```javascript
// In your Node server
app.get('/icons/:id', async (req, res) => {
  const icon = await db.collection('icons').findOne({ _id: req.params.id })
  if (icon && icon.imageData) {
    res.contentType('image/png')
    res.send(Buffer.from(icon.imageData, 'base64'))
  } else {
    res.status(404).send('Icon not found')
  }
})
```

### Step 2: Upload Interface

```javascript
// Admin panel to upload icons
POST /api/abilities/:id/icon
Content-Type: multipart/form-data

{
  image: <file>
}
```

### Step 3: Update iconLayers

```javascript
// Store icon ID in iconLayers
await db.collection('abilities').updateOne(
  { _id: abilityId },
  { $set: { iconLayers: [[newIconId]] } }
)
```

### Step 4: Icons Load Automatically

The `AbilityIcon` component already checks iconLayers first!

---

## 🎯 Recommended Approach

### Phase 1: Launch (Use Now)
✅ Emoji + game-icons.net
- Zero setup
- Professional look
- Fast performance

### Phase 2: Custom Branding (Later)
- Add icon upload system
- Gradually replace with custom art
- Keep emoji fallbacks

### Phase 3: Full Custom (Optional)
- Licensed D&D artwork (if available)
- Custom illustrations
- Animated icons

---

## 🔍 Testing

### Test All Icon Modes:

```javascript
// In your browser console
import { getSpellIcon, getItemIcon } from './utils/icons'

// Test spell icon
getSpellIcon({ school: 'Evocation' }, 'emoji')      // 🔥
getSpellIcon({ school: 'Evocation' }, 'game-icons') // SVG URL

// Test item icon
getItemIcon({ type: 'Weapon', rarity: 'Legendary' }, 'emoji') // ⚔️
```

### Visual Testing:

1. Go to `/character/achilles`
2. Abilities should show icons
3. Hover for animations
4. Legendary items should glow!

---

## 💡 Pro Tips

### Caching

Game-icons.net URLs are cacheable:
```javascript
// Add to service worker
self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('game-icons.net')) {
    event.respondWith(
      caches.match(event.request)
        .then(response => response || fetch(event.request))
    )
  }
})
```

### Preload Critical Icons

```html
<!-- In index.html -->
<link rel="preload" as="image"
      href="https://game-icons.net/icons/FF5722/000000/1x1/lorc/fire-bolt.svg">
```

### Lazy Loading

Icons load lazily by default (browser behavior), but you can optimize:

```javascript
<img
  src={iconUrl}
  loading="lazy"
  decoding="async"
/>
```

---

## 🎨 Game-Icons.net Gallery

Browse 4000+ icons: https://game-icons.net

**Popular Categories:**
- Magic: sparkles, magic-swirl, fire-bolt, ice-bolt
- Weapons: sword, axe, bow, dagger, mace
- Armor: helmet, chest-armor, boots, gloves
- Items: potion, scroll, book, ring, amulet
- Monsters: dragon, skeleton, demon, ghost

**URL Format:**
```
https://game-icons.net/icons/[COLOR]/000000/1x1/[AUTHOR]/[ICON-NAME].svg

COLOR: Hex color without #
AUTHOR: lorc, delapouite, various-artists, etc.
ICON-NAME: fire-bolt, potion, sword, etc.
```

---

## 📈 Icon Stats

### Current Implementation:

- **8 Spell School Emojis** ✅
- **12 Item Type Emojis** ✅
- **4000+ Game Icons** ✅
- **Color-coded by school/rarity** ✅
- **Animated legendary items** ✅
- **Automatic fallbacks** ✅

### Coverage:

- **Spells:** 100% covered (emoji + game-icons)
- **Items:** 100% covered (emoji + game-icons)
- **Custom icons:** Ready for upload

---

## Summary

✅ **No images needed to start**
- Emoji works immediately
- Game-icons.net for professional look
- Custom upload ready for later

✅ **Multiple options:**
1. Emoji (instant)
2. Game-icons.net (free, professional)
3. Custom upload (full control)

✅ **Already implemented:**
- Icon component ready
- Fallback system working
- Rarity effects included
- All files committed

**Recommendation:** Launch with emoji + game-icons.net, add custom images later as needed!

