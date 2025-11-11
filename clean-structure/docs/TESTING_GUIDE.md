# Quick Testing Guide - Interactive Stats

**Test what we've built so far before continuing!**

---

## 🎯 What You're Testing

- ✅ InteractiveStats component with clickable skills/saves
- ✅ Dice rolling with 5e mechanics
- ✅ AI-generated narratives via Gemini
- ✅ Mobile-first touch UI

---

## 🚀 Setup (5 minutes)

### 1. Install Dependencies

```bash
cd clean-structure

# Install client dependencies
cd client
npm install

# Install server dependencies
cd ../server
npm install
```

### 2. Configure Environment

**Server `.env`:**
```bash
cd server
cp .env.example .env
```

Edit `server/.env`:
```env
GEMINI_API_KEY=your_gemini_key  # Get from https://aistudio.google.com/apikey
MONGODB_URI=your_mongodb_uri     # Optional for now - can test without DB
PORT=3001
```

**Client `.env`:**
```bash
cd ../client
cp .env.example .env
```

Edit `client/.env`:
```env
VITE_API_URL=http://localhost:3001/api
```

### 3. Start Servers

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```

Expected output:
```
✓ Gemini AI ready
🚀 Character Foundry Server
📡 HTTP Server: http://localhost:3001
```

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev
```

Expected output:
```
➜  Local:   http://localhost:5173/
```

---

## 🧪 Test Scenarios

### Test 1: View InteractiveStats Component

1. Open browser: `http://localhost:5173`
2. Navigate to character view
3. You should see:
   - 6 ability score blocks (STR, DEX, CON, INT, WIS, CHA)
   - Skills organized by ability
   - Saving throws grid
   - Combat stats

**Expected:** All stats displayed, "Tap to roll" hint visible

---

### Test 2: Roll a Skill Check

1. **Tap any skill** (e.g., "Perception")
2. Watch for:
   - Dice animation appears
   - Roll result shows (e.g., "18")
   - Breakdown shows (e.g., "15 + 3 = 18")

3. **Check browser console** (F12):
   ```javascript
   {
     type: "Perception Check",
     diceType: "d20",
     total: 18,
     breakdown: "15 + 3 = 18"
   }
   ```

**Expected:** Dice rolls, animation plays, result calculated correctly

---

### Test 3: AI Narrative (with Gemini API)

**If you have Gemini API key configured:**

1. Tap a skill
2. Backend calls Gemini
3. AI generates narrative like:
   ```
   "Aelindra's keen elven eyes catch the faint outline
    of a concealed door in the stone wall!"
   ```

**Check in Network tab (F12):**
- POST request to `/api/characters/:id/roll/skill`
- Response includes `narrative` field

**Expected:** AI-generated story appears with roll

**Without Gemini:** Falls back to basic message like "Rolled 18 for Perception"

---

### Test 4: Saving Throw

1. Tap any saving throw (e.g., DEX save)
2. Watch dice animation
3. Result shows with modifier

**Expected:** Save rolls with proficiency bonus if proficient

---

### Test 5: Ability Score Menu

1. Tap an ability score block (e.g., STR)
2. Bottom sheet slides up
3. Shows:
   - Ability score value
   - Modifier
   - "Roll Saving Throw" button
   - "Roll Ability Check" button
   - Related skills

4. Tap "Roll Saving Throw"
5. Sheet dismisses, dice animation plays

**Expected:** Modal opens, buttons work, dismisses after action

---

### Test 6: Mobile Touch Testing

**On desktop:**
1. Open DevTools (F12)
2. Toggle device toolbar (Ctrl+Shift+M)
3. Select iPhone or Android device
4. Test touch interactions:
   - Tap skills
   - Tap abilities
   - Swipe to dismiss modals

**On actual phone:**
```bash
# Find your IP
ifconfig | grep "inet "  # Mac/Linux
ipconfig                 # Windows

# Start with host flag
npm run dev -- --host

# Access from phone
http://YOUR_IP:5173
```

**Expected:** All touch targets 44px+, easy to tap

---

## 🐛 Troubleshooting

### Issue: "AI service not available"

**Solution:**
- Check `GEMINI_API_KEY` in `server/.env`
- Verify API key is valid at https://aistudio.google.com/apikey
- Check server console for errors

### Issue: "Character not found"

**Solution:**
- You need a test character in the system
- Either:
  1. Create one via API: `POST /api/characters/create`
  2. Or update component to use demo data

### Issue: Dice animation not showing

**Check:**
1. Is `DiceRollOverlay` component imported?
2. Is `onRoll` prop passed correctly?
3. Console shows roll data?

### Issue: Skills not clickable

**Check:**
1. Character has `skills` object
2. Skills have `ability` and `proficiency` fields
3. `stats` object has ability scores

---

## 📋 Quick API Tests (Using curl)

### Test Skill Roll Endpoint

```bash
# Replace :id with actual character ID
curl -X POST http://localhost:3001/api/characters/:id/roll/skill \
  -H "Content-Type: application/json" \
  -d '{
    "skillName": "perception",
    "advantage": false,
    "disadvantage": false
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "skill": "Perception",
    "roll": 15,
    "modifier": 3,
    "total": 18,
    "breakdown": "15 + 3 = 18",
    "narrative": "Aelindra scans the area with practiced ease...",
    "isCriticalSuccess": false,
    "isCriticalFailure": false
  }
}
```

### Test Saving Throw Endpoint

```bash
curl -X POST http://localhost:3001/api/characters/:id/roll/save \
  -H "Content-Type: application/json" \
  -d '{
    "ability": "dex",
    "advantage": false,
    "disadvantage": false
  }'
```

---

## ✅ Success Checklist

Before moving on, verify:

- [ ] Both servers running (frontend + backend)
- [ ] Can see InteractiveStats component
- [ ] Skills are clickable and roll dice
- [ ] Dice animation appears
- [ ] Roll results show correct math
- [ ] (Optional) AI narratives generate with Gemini
- [ ] Saving throws work
- [ ] Ability score menu opens and works
- [ ] Touch targets feel good on mobile
- [ ] No console errors

---

## 🎉 When Ready

**Once everything works, tell me and I'll build:**

1. **BattleMode** - Combat tracker with attacks/damage
2. **RestSystem** - Short/long rest with healing
3. **AbilityLibrary** - Class abilities browser
4. **More API endpoints** - Combat, rest, abilities
5. **Integration** - Connect everything together

**Estimated time to complete all: 2-3 more hours**

---

## 💡 Pro Tips

### Quick Character for Testing

Create a test character:
```javascript
const testCharacter = {
  id: 'test123',
  name: 'Test Hero',
  level: 5,
  stats: { str: 14, dex: 16, con: 13, int: 10, wis: 12, cha: 8 },
  skills: {
    perception: { ability: 'wis', proficiency: 1, value: 4 },
    stealth: { ability: 'dex', proficiency: 2, value: 9 },
    athletics: { ability: 'str', proficiency: 0, value: 2 }
  },
  savingThrows: {
    str: { proficient: false },
    dex: { proficient: true },
    con: { proficient: false },
    int: { proficient: false },
    wis: { proficient: true },
    cha: { proficient: false }
  },
  proficiencyBonus: 3,
  ac: 15
};
```

### Watch Console for Errors

Keep browser console open (F12) to see:
- API calls
- Roll results
- Any errors

### Test on Real Mobile Device

The real test is on a phone:
- Touch targets should be easy to hit
- Animations should be smooth
- Bottom sheets should slide nicely
- No lag when tapping

---

**Ready to test? Start with Terminal 1 (server), then Terminal 2 (client), then open http://localhost:5173** 🚀
