# Mobile Chat-First Design

## The Real Vision

**Not this:** Complex wizard with forms and tabs
**This:** Simple prompt → Beautiful character → Chat to use it

---

## User Flow (Mobile-First)

### 1. Landing Screen

```
┌──────────────────────────┐
│     Character Foundry    │
│      ⚔️ (animated)       │
├──────────────────────────┤
│                          │
│   [+ New Character]      │
│                          │
│   Recent Characters:     │
│   ┌────────────────┐    │
│   │ 🛡️ Achilles    │◄─┐│
│   │ Lvl 20 Fighter │  ││
│   └────────────────┘    │
│                          │
│   ┌────────────────┐    │
│   │ 🧙 Merlin      │    │
│   │ Lvl 15 Wizard  │    │
│   └────────────────┘    │
│                          │
└──────────────────────────┘
         │
         │ Tap [+ New Character]
         ↓
```

---

### 2. Character Creation (Simple!)

```
┌──────────────────────────┐
│  Create Your Character   │
├──────────────────────────┤
│                          │
│  Choose how to create:   │
│                          │
│  ┌────────────────────┐ │
│  │  ✏️ Describe       │ │
│  │  Type freely...    │ │
│  └────────────────────┘ │
│                          │
│  ┌────────────────────┐ │
│  │  ⚡ Quick Pick     │ │
│  │  Answer questions  │ │
│  └────────────────────┘ │
│                          │
│  [← Back]                │
└──────────────────────────┘
```

---

### 2A. Describe (Freeform Prompt)

```
┌──────────────────────────┐
│  Describe Your Character │
├──────────────────────────┤
│                          │
│  Tell me about your      │
│  character:              │
│                          │
│  ┌────────────────────┐ │
│  │ "A Drow paladin   │ │
│  │ exiled from the   │ │
│  │ Underdark, now    │ │
│  │ serving Tyr..."   │ │
│  │                   │ │
│  │ [Character typing]│ │
│  └────────────────────┘ │
│                          │
│  Examples:               │
│  • "Level 10 elf wizard" │
│  • "Gruff dwarf fighter" │
│  • "Charismatic bard"    │
│                          │
│  [🎨 Generate Character] │
│  [← Back]                │
└──────────────────────────┘
         │
         │ Tap Generate
         ↓
    [Loading 2-3 seconds]
         ↓
```

---

### 2B. Quick Pick (Guided)

```
┌──────────────────────────┐
│  Quick Character Creator │
├──────────────────────────┤
│                          │
│  What's their name?      │
│  [Sebastienne________]   │
│                          │
│  Race?                   │
│  [Dark Elf ▼]           │
│  ├─ Human               │
│  ├─ Elf                 │
│  ├─ Dark Elf  ✓         │
│  ├─ Dwarf               │
│  └─ ...                 │
│                          │
│  Class?                  │
│  [Paladin ▼]            │
│                          │
│  Level?                  │
│  [●────────────] 15      │
│   1              20      │
│                          │
│  [🎨 Generate]           │
│  [← Back]                │
└──────────────────────────┘
```

---

### 3. Character Generated!

```
┌──────────────────────────┐
│  Sebastienne Nightbloom  │
│  Lvl 15 Paladin          │
├──────────────────────────┤
│                          │
│  ┌────────────────────┐ │
│  │                    │ │
│  │   [AI Generated    │ │
│  │    Character       │ │
│  │    Portrait]       │ │
│  │                    │ │
│  └────────────────────┘ │
│                          │
│  HP: 123/123  AC: 20     │
│  Initiative: +1          │
│                          │
│  Your Drow Paladin is    │
│  ready! She's stoic,     │
│  protective, and haunted │
│  by her past...          │
│                          │
│  [💬 Start Adventure]    │
│  [📋 View Full Stats]    │
│  [← Back to Home]        │
└──────────────────────────┘
```

---

### 4. Main Interface (Chat-First!)

```
┌──────────────────────────┐
│ ← Sebastienne      [⚙️]  │
├──────────────────────────┤
│ ┌──────────────────────┐│
│ │   Character Card     ││
│ │   [Minimized]        ││
│ │   Lvl 15 • HP 123/123││
│ │   [Tap to expand]    ││
│ └──────────────────────┘│
├──────────────────────────┤
│                          │
│  💬 Chat with Character  │
│                          │
│  Sebastienne:            │
│  "Greetings. I stand     │
│   ready to fight for     │
│   those who cannot."     │
│                          │
│  You:                    │
│  "Roll for initiative"   │
│                          │
│  Sebastienne:            │
│  🎲 Initiative: 14       │
│  (d20: 13 + 1)           │
│  "I move swiftly."       │
│                          │
├──────────────────────────┤
│ [Type message...    ] 📤│
│                          │
│ Quick Actions:           │
│ [⚔️ Attack]              │
│ [🛡️ Defend]              │
│ [🎲 Roll]                │
│ [✨ Spell]               │
└──────────────────────────┘
```

---

## Key Design Principles

### 1. Mobile-First
- **Thumb-friendly** - Big buttons at bottom
- **Scrollable** - Everything fits small screens
- **Fast** - No complex forms
- **One-handed** - Can use while holding character sheet

### 2. Chat is the Interface
**Not this:**
- Click "Attack" button
- Choose target from dropdown
- Select modifier
- Confirm roll

**This:**
- Type: "Attack the goblin"
- Character: "🎲 Attack: 18 (d20: 15+3) 💥 Damage: 12 (2d6+3)"

### 3. Character Card is Reference
- Shows at top (minimized)
- Tap to expand and see full stats
- Quickly check HP, AC, abilities
- But don't need it for every action

### 4. Natural Language
**Player types naturally:**
- "Roll initiative"
- "Cast bless on the party"
- "Use divine smite"
- "What's my AC?"
- "Tell me about my backstory"

**Character responds:**
- Performs action
- Shows results (dice rolls, damage)
- Adds personality ("By Tyr's grace!")
- Tracks state (uses, HP, spell slots)

---

## Chat Command Examples

### Rolling Stats
```
You: "Roll initiative"
Character: 🎲 Initiative: 14 (d20: 13 + 1)
           "I move swiftly into position."

You: "Roll perception"
Character: 🎲 Perception: 18 (d20: 11 + 7)
           "I notice hidden details in the shadows."

You: "Roll a strength check"
Character: 🎲 Strength: 22 (d20: 18 + 4)
           "My divine strength prevails!"
```

### Using Abilities
```
You: "Use Lay on Hands on myself"
Character: ✨ Lay on Hands
           Restored 15 HP → 95/123 HP
           65 HP remaining in pool (75 → 60)
           "Tyr's light mends my wounds."

You: "Cast Divine Smite"
Character: ⚔️ Divine Smite (2nd level slot)
           +2d8 radiant damage
           Spell Slots: 3rd: 3/3, 2nd: 2/3, 1st: 4/4
           "Holy wrath strikes the enemy!"

You: "Use my reaction for Shield Wall"
Character: 🛡️ Shield Wall (Reaction used)
           AC +2 until next turn → AC 22
           "My shield forms an impenetrable barrier."
```

### Checking Status
```
You: "What's my HP?"
Character: HP: 95/123 (77%)
           Status: Lightly wounded
           "I can continue fighting."

You: "Show my spell slots"
Character: 📜 Spell Slots:
           • 1st Level: 4/4 ●●●●
           • 2nd Level: 2/3 ●●○
           • 3rd Level: 3/3 ●●●
           • 4th Level: 2/2 ●●

You: "What abilities do I have?"
Character: ⚔️ Combat:
           • Divine Smite
           • Lay on Hands (60/75 HP)

           🛡️ Defense:
           • Shield Wall
           • Aura of Protection

           [Tap ability to see details]
```

### Personality & Story
```
You: "Tell me about yourself"
Character: "I am Sebastienne Nightbloom, once of
           House Nightbloom in Menzoberranzan.
           I was exiled for showing mercy to
           surface dwellers..."
           [Full backstory expands]

You: "What would you do in this situation?"
Character: "My oath compels me to protect the
           innocent. I would challenge their
           leader to single combat, sparing
           the followers if possible."
           [Answers in character]

You: "How do you feel about elves?"
Character: "Surface elves? They fear me at first,
           seeing only my dark skin. But those
           who give me a chance find a sister
           in arms."
```

---

## UI Components Breakdown

### Top Bar (Always Visible)
```
┌──────────────────────────┐
│ ← [Name]           [⚙️]  │
└──────────────────────────┘
```
- Back button (to character list)
- Character name (tap to expand card)
- Settings (change portrait, edit stats)

### Character Card (Collapsible)
```
┌──────────────────────────┐
│ [Portrait]  HP: 123/123  │
│ Lvl 15     AC: 20        │
│ [Tap to expand] ▼        │
└──────────────────────────┘
```

**Expanded:**
```
┌──────────────────────────┐
│        [Portrait]         │
│  Sebastienne Nightbloom   │
│  Lvl 15 Paladin           │
├──────────────────────────┤
│ HP: 123/123  ████████████│
│ AC: 20   Initiative: +1   │
│ Speed: 30ft  Prof: +5     │
├──────────────────────────┤
│ Stats:                    │
│ STR 18(+4)  INT 10(+0)   │
│ DEX 12(+1)  WIS 14(+2)   │
│ CON 16(+3)  CHA 20(+5)   │
├──────────────────────────┤
│ [View Full Sheet] [Tap to minimize] │
└──────────────────────────┘
```

### Chat Area (Main Interface)
```
┌──────────────────────────┐
│                          │
│  [Scrollable messages]   │
│                          │
│  Character messages      │
│  have portrait on left   │
│                          │
│       Your messages      │
│       are on right       │
│                          │
└──────────────────────────┘
```

### Input Area (Bottom)
```
┌──────────────────────────┐
│ [Type message...    ] 📤│
│                          │
│ Quick Actions:           │
│ [⚔️] [🛡️] [🎲] [✨]     │
└──────────────────────────┘
```

**Quick Actions expand:**
```
┌──────────────────────────┐
│ ⚔️ Attack Actions:       │
│ • Longsword Attack        │
│ • Divine Smite            │
│ • Smite + Attack          │
└──────────────────────────┘
```

---

## Technical Implementation

### Character Creation API

```javascript
// /src/services/api.js

export const createCharacter = async (input) => {
  // input can be:
  // { type: 'prompt', text: "Drow paladin exiled..." }
  // OR
  // { type: 'quick', name: "Sebastienne", race: "Dark Elf", class: "Paladin", level: 15 }

  return retryFetch(() =>
    apiFetch(`${API_BASE_URL}/characters/create`, {
      method: 'POST',
      body: JSON.stringify(input)
    })
  )
}

// Returns:
// {
//   character: { ...full JSON schema... },
//   imageUrl: "https://...",
//   greeting: "Greetings. I stand ready..."
// }
```

### Chat Message API

```javascript
export const sendCharacterMessage = async (characterId, message, context) => {
  // context includes:
  // - current HP
  // - active conditions
  // - used spell slots
  // - conversation history (last 10 messages)

  return retryFetch(() =>
    apiFetch(`${API_BASE_URL}/characters/${characterId}/chat`, {
      method: 'POST',
      body: JSON.stringify({
        message,
        context
      })
    })
  )
}

// Returns:
// {
//   response: "I move swiftly into position.",
//   action: {
//     type: "roll",
//     roll: "initiative",
//     result: { d20: 13, modifier: 1, total: 14 }
//   },
//   stateChanges: {
//     // If HP changed, spell slots used, etc.
//   }
// }
```

### Mobile Chat Component

```javascript
// /src/components/MobileChat.jsx

function MobileChat({ character }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [cardExpanded, setCardExpanded] = useState(false)

  const handleSend = async () => {
    // Add user message
    setMessages([...messages, {
      type: 'user',
      text: input
    }])

    // Send to API
    const response = await sendCharacterMessage(
      character.id,
      input,
      getContext()
    )

    // Add character response
    setMessages([...messages, {
      type: 'character',
      text: response.response,
      action: response.action,
      stateChanges: response.stateChanges
    }])

    // Update character state
    if (response.stateChanges) {
      updateCharacterState(response.stateChanges)
    }

    setInput('')
  }

  return (
    <div className="mobile-chat">
      {/* Top bar */}
      <div className="top-bar">
        <button onClick={() => navigate('/characters')}>←</button>
        <h2>{character.characterName}</h2>
        <button>⚙️</button>
      </div>

      {/* Character card (collapsible) */}
      <div className={`character-card ${cardExpanded ? 'expanded' : ''}`}
           onClick={() => setCardExpanded(!cardExpanded)}>
        <CharacterCardMini character={character} expanded={cardExpanded} />
      </div>

      {/* Chat messages */}
      <div className="chat-messages">
        {messages.map((msg, i) => (
          <ChatMessage key={i} message={msg} character={character} />
        ))}
      </div>

      {/* Input area */}
      <div className="input-area">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Type message or command..."
        />
        <button onClick={handleSend}>📤</button>

        {/* Quick actions */}
        <QuickActions character={character} onAction={handleQuickAction} />
      </div>
    </div>
  )
}
```

---

## What Users Can Do via Chat

### Combat
- "Roll initiative"
- "Attack with my longsword"
- "Cast Divine Smite"
- "Use Shield Wall"
- "Take 15 damage"
- "Drink a healing potion"

### Skills & Checks
- "Roll perception"
- "Roll athletics"
- "Roll a wisdom save"
- "Roll stealth with advantage"

### Spells & Abilities
- "Cast Bless on the party"
- "Use Lay on Hands for 20 HP"
- "Activate Aura of Protection"
- "Use Channel Divinity"

### Information
- "What's my HP?"
- "Show spell slots"
- "What abilities do I have?"
- "Tell me my backstory"
- "What's my AC?"
- "Show my stats"

### Roleplay
- "How would you react to this?"
- "What's your opinion on..."
- "Tell me a story from your past"
- "What would you do?"

---

## Mobile-Specific Features

### Gestures
- **Swipe right** on message: Quick retry
- **Long press** message: Copy dice result
- **Pull down** to refresh character state
- **Swipe left** on character card: Minimize

### Notifications
- **HP critical** (<25%): Red border
- **Spell slot depleted**: Warning
- **Level up available**: Celebration animation

### Offline Mode
- Cache character data
- Queue messages
- Sync when online

### Share
- Screenshot conversation
- Export combat log
- Share character sheet

---

## This is WAY Better Because:

✅ **Simple creation** - Prompt OR quick picks, done in 30 seconds
✅ **Mobile-friendly** - Big buttons, scrollable, one-handed
✅ **Natural interaction** - Chat, not buttons and forms
✅ **Like Discord** - Same experience users already know
✅ **Fast** - No page loads, everything flows
✅ **Fun** - Conversational, not mechanical
✅ **Powerful** - All features accessible via chat

---

## Should I Build This?

This is the mobile chat-first version. Much simpler than the wizard I designed before.

Want me to:
1. **Build the character creation flow** (prompt OR quick pick)
2. **Build the mobile chat interface** (with quick actions)
3. **Both** (complete mobile experience)

This feels right, doesn't it? 📱💬
