# 🗺️ Solo Play Adventure System

## Overview

The Adventure System provides an interactive choose-your-own-adventure experience where players make meaningful choices that affect the narrative. It combines dialogue trees, skill checks, combat encounters, and character personality to create engaging solo play sessions.

## Features

### ✅ Core Capabilities

- **Dialogue Trees**: Branch storylines based on player choices
- **Skill Checks**: Roll dice for stealth, persuasion, investigation, etc.
- **Combat Encounters**: Seamlessly trigger combat with enemies
- **Character Responses**: Your character comments on the adventure with their personality
- **Multiple Endings**: Success, defeat, or tactical retreat outcomes
- **Rewards System**: Track treasure and achievements
- **Progress Tracking**: See how many choices made and rolls performed

### 🎮 Node Types

1. **Narrative Nodes**: Story moments that auto-advance
2. **Choice Nodes**: Present 2-4 options for the player
3. **Skill Check Nodes**: Require dice rolls (success/failure branches)
4. **Combat Nodes**: Trigger combat encounters (victory/defeat branches)
5. **End Nodes**: Conclusion with rewards and outcomes

## Example Adventure: "The Mysterious Grove"

```
You stand at the edge of an ancient grove...
↓
What do you do?
├─ Sneak closer (Stealth check DC 12)
│  ├─ Success: Spot 3 goblins, ambush opportunity
│  └─ Failure: Detected! Combat begins
├─ Draw weapon and prepare for combat
│  └─ Goblins rush at you! Combat begins
├─ Call out to whoever is there
│  └─ Goblins emerge, combat or persuasion choice
└─ Retreat and observe
   └─ See goblins, follow or explore options
```

## Creating New Adventures

### 1. Define Adventure Structure

```javascript
export const myAdventure = {
  id: 'unique-id',
  title: 'Adventure Title',
  startNode: 'first-node-id',
  nodes: {
    // Define all nodes here
  }
}
```

### 2. Create Nodes

**Narrative Node:**
```javascript
'node-id': {
  type: ADVENTURE_TYPES.NARRATIVE,
  text: "Story text describing what happens...",
  characterResponse: "What your character says",
  nextNode: 'next-node-id'
}
```

**Choice Node:**
```javascript
'node-id': {
  type: ADVENTURE_TYPES.CHOICE,
  text: "What do you do?",
  choices: [
    {
      id: 'choice-1',
      text: "Option 1 description",
      icon: '⚔️',
      nextNode: 'where-this-leads'
    }
  ]
}
```

**Skill Check Node:**
```javascript
'node-id': {
  type: ADVENTURE_TYPES.SKILL_CHECK,
  skill: 'stealth', // or 'persuasion', 'investigation', etc.
  dc: 12, // Difficulty Class
  text: "What you're attempting...",
  characterResponse: "Character's encouragement",
  successNode: 'if-you-succeed',
  failureNode: 'if-you-fail'
}
```

**Combat Node:**
```javascript
'node-id': {
  type: ADVENTURE_TYPES.COMBAT,
  text: "Combat begins!",
  characterResponse: "Character's battle cry",
  enemies: [
    { name: 'Goblin', hp: 12, ac: 13 }
  ],
  hasAdvantage: false, // Set true for ambush
  victoryNode: 'if-you-win',
  defeatNode: 'if-you-lose'
}
```

**End Node:**
```javascript
'node-id': {
  type: ADVENTURE_TYPES.END,
  text: "How the adventure concludes...",
  characterResponse: "Character's final words",
  endType: 'success', // or 'defeat', 'retreat'
  message: 'Optional continuation message',
  rewards: ['Gold coins', 'Magic item']
}
```

### 3. Register Adventure

Add to `getAvailableAdventures()` in `adventure-trees.js`:

```javascript
export function getAvailableAdventures() {
  return [
    {
      id: 'my-adventure',
      title: 'My Adventure Title',
      description: 'Brief description',
      difficulty: 'Easy', // or 'Medium', 'Hard'
      estimatedTime: '10-15 minutes',
      adventure: myAdventure
    }
  ]
}
```

## Integration with API

When connected to the API, adventures can be enhanced with:

### Dynamic Character Responses
```javascript
// Instead of hardcoded responses:
characterResponse: "Generic response"

// Fetch from API based on character personality:
characterResponse: await api.getCharacterResponse(characterId, nodeContext)
```

### Adaptive Difficulty
```javascript
// Adjust DC based on character level and API difficulty settings
dc: character.level >= 5 ? 15 : 12
```

### Persistent Progress
```javascript
// Save adventure state to API
await api.saveAdventureProgress(characterId, adventureId, currentNodeId)

// Resume later
const savedState = await api.getAdventureProgress(characterId, adventureId)
```

### AI-Generated Content
```javascript
// Generate dynamic narrative based on choices
const narrative = await api.generateNarrative(context, previousChoices)
```

## UI Components

### AdventureMode.jsx
Main component that renders adventure nodes and handles player interactions.

**Key Features:**
- Auto-scrolling narrative
- Animated transitions
- Dice rolling with visual feedback
- Character portrait integration
- Progress tracking

### Adventure Selection
List of available adventures with:
- Title and description
- Difficulty rating
- Estimated time
- Visual card design

## Mobile Optimizations

- Touch-friendly choice buttons
- Swipe-friendly navigation
- Compact layouts for small screens
- Auto-scrolling for long content
- Responsive font sizes

## Best Practices

### Writing Good Adventures

1. **Start Strong**: Hook players immediately
2. **Meaningful Choices**: Each option should feel distinct
3. **Character Voice**: Let character personality shine through
4. **Balance**: Mix narrative, choices, checks, and combat
5. **Consequences**: Choices should matter to the story
6. **Multiple Paths**: Allow different approaches (stealth, combat, diplomacy)
7. **Satisfying Endings**: Provide closure regardless of outcome

### Skill Check Guidelines

- **Easy (DC 10)**: Most characters can do this
- **Medium (DC 15)**: Requires some skill
- **Hard (DC 20)**: Only skilled characters succeed
- **Very Hard (DC 25)**: Nearly impossible without expertise

### Combat Balance

- **Solo Play**: 1-3 weak enemies
- **Consider Level**: Scale enemy HP/AC to character level
- **Advantage**: Reward clever play (ambush, preparation)
- **Escape Options**: Allow tactical retreats

## Example Character Response Styles

**Achilles (Warrior)**:
- Battle-focused, confident, tactical
- "Stand your ground and fight!"
- Respects courage, despises cowardice

**Gandalf (Wizard)**:
- Wise, mystical, patient
- "Patience, my friend. All will become clear."
- Values knowledge and careful planning

**Aragorn (Ranger)**:
- Practical, experienced, leadership
- "We make for the hidden paths."
- Balances caution with action

## Future Enhancements

### Planned Features
- [ ] Save/load adventure progress
- [ ] Multiple concurrent adventures
- [ ] Adventure branching based on previous completions
- [ ] Character progression from adventures
- [ ] Multiplayer adventure options
- [ ] User-created adventures (with moderation)
- [ ] Achievement system
- [ ] Leaderboards for speedruns

### API Integration Wishlist
- AI-generated adventures
- Dynamic difficulty adjustment
- Character personality-driven responses
- Voice narration (TTS)
- Seasonal/event adventures
- Community adventure sharing

## Technical Details

### File Structure
```
src/
├── data/
│   └── adventure-trees.js       # Adventure definitions
├── components/
│   ├── AdventureMode.jsx        # Main adventure renderer
│   ├── AdventureMode.css        # Adventure styling
│   ├── CharacterModes.jsx       # Mode switcher
│   └── CharacterCard.jsx        # Integration point
```

### State Management
- `currentNodeId`: Tracks position in adventure tree
- `adventureHistory`: Stores path taken
- `lastSkillCheck`: Caches last roll result
- `selectedAdventure`: Active adventure object

### Performance
- Lazy loading of adventure data
- Memoized node lookups
- Optimized animations
- Efficient re-renders

## Testing Adventures

1. **Playtest All Paths**: Test every branch
2. **Check Dead Ends**: Ensure no orphaned nodes
3. **Validate IDs**: All nextNode IDs must exist
4. **Test Skill Checks**: Verify DC appropriate for difficulty
5. **Combat Balance**: Ensure enemies aren't too strong/weak
6. **Character Responses**: Check all personality lines fit
7. **Mobile Testing**: Verify on small screens

## Contributing

To add new adventures:

1. Create adventure tree in `adventure-trees.js`
2. Follow existing structure and naming conventions
3. Test thoroughly on desktop and mobile
4. Ensure character responses fit existing personalities
5. Add to available adventures list
6. Document any new node types or features

## License

Part of the Dabidoe RPG App. All adventures are original content.

---

**Happy Adventuring!** 🗺️⚔️🎲
