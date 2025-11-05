# Integrating Dynamic Abilities

## How to Update CharacterCard to Use Dynamic Abilities

### Step 1: Update Character Data Loading

In `src/components/CharacterCard.jsx`, update the `loadCharacter` function:

```javascript
// BEFORE (Demo data):
const demoCharacters = {
  achilles: {
    name: 'Achilles',
    hp: { current: 104, max: 104 },
    ac: 18,
    portrait: '🛡️',
    abilities: [
      { icon: '⚔️', name: 'Sword Strike' },  // Simple objects
      { icon: '🔥', name: 'Divine Fury' }
    ]
  }
}

// AFTER (API call with full ability data):
const response = await fetch(`https://api.characterfoundry.io/api/characters/${characterId}?include=abilities`)
const data = await response.json()

// data.abilities will now be:
[
  {
    abilityId: "65fc5af6a30f45caa99ddd36",
    category: "spell",
    equipped: true,
    uses: { current: 3, max: 5 },
    details: {
      name: "Cure Wounds",
      shortDescription: "Heal wounds",
      longDescription: "Casting Time: 1 action\nRange: Touch...",
      school: "Abjuration",
      level: "1st",
      castingTime: "1 action",
      range: "Touch",
      components: "V, S",
      duration: "Instantaneous",
      damageFormula: "1d8 + spellcasting modifier"
    }
  },
  {
    abilityId: "65fc5af7a30f45caa99ddd37",
    category: "attack",
    equipped: true,
    uses: { current: null, max: null },
    details: {
      name: "Sword Strike",
      shortDescription: "A powerful melee attack",
      attackBonus: 9,
      damageFormula: "1d8+6",
      damageType: "slashing"
    }
  }
]
```

### Step 2: Import AbilityCard Component

```javascript
import AbilityCard from './AbilityCard'
```

### Step 3: Update Ability Rendering

Replace the quick-actions div:

```javascript
// BEFORE:
<div className="quick-actions">
  {character.abilities.map((ability, index) => (
    <button
      key={index}
      className="action-btn"
      onClick={() => handleAbilityClick(ability)}
    >
      {ability.icon} {ability.name}
    </button>
  ))}
</div>

// AFTER:
<div className="quick-actions">
  {character.abilities && character.abilities.length > 0 ? (
    character.abilities.map((ability, index) => (
      <AbilityCard
        key={ability.abilityId || index}
        ability={ability}
        onUse={handleAbilityUse}
        character={character}
        mode={mode}
      />
    ))
  ) : (
    <div className="no-abilities">
      <p>No abilities equipped</p>
    </div>
  )}
</div>
```

### Step 4: Update handleAbilityClick to handleAbilityUse

```javascript
const handleAbilityUse = async (ability) => {
  // Parse damage formula from ability details
  const details = ability.details

  // For attacks with defined mechanics
  if (ability.category === 'attack' && details.attackBonus && details.damageFormula) {
    // Parse formula like "1d8+6" into {count: 1, sides: 8, bonus: 6}
    const damageData = parseDamageFormula(details.damageFormula)

    const result = rollAttack({
      modifier: details.attackBonus,
      damageCount: damageData.count,
      damageSides: damageData.sides,
      damageBonus: damageData.bonus
    })

    let responseText = `${details.icon || '⚔️'} **${details.name}**: Attack ${result.attack.total} (d20: ${result.attack.d20}+${result.attack.modifier})`

    if (result.attack.isCrit) {
      responseText += ' **CRITICAL HIT!**'
    }

    if (result.damage) {
      responseText += `\n💥 **Damage**: ${result.damage.total} (${result.damage.formula}) [${result.damage.rolls.join(', ')}]`
    }

    responseText += '\n\n' + getNarration(details.name, result)

    addMessage(responseText, 'character', 'Focused')

    // Update ability uses if limited
    if (ability.uses && ability.uses.max !== null) {
      await updateAbilityUses(character.id, ability.abilityId, ability.uses.current - 1)
    }

    // Send to API
    await useAbility(character.id, ability.abilityId, {
      roll: result,
      mode: mode,
      currentHP: currentHP
    })
  }
  // For spells
  else if (ability.category === 'spell') {
    const spellText = `✨ **${details.name}**\n\n${details.shortDescription || details.longDescription}`
    addMessage(spellText, 'character', 'Casting')

    // Decrement spell slot
    if (ability.uses && ability.uses.max !== null) {
      await updateAbilityUses(character.id, ability.abilityId, ability.uses.current - 1)
    }

    // TODO: Send to API for AI response
    // const response = await sendMessage(character.id, `Cast ${details.name}`, messages)
  }
  // For story/quest actions (no rolls)
  else if (['Tell Story', 'Current Quest'].includes(details.name)) {
    const storyText = details.longDescription || details.shortDescription
    addMessage(storyText, 'character', mood)
  }
}

// Helper to parse damage formulas
const parseDamageFormula = (formula) => {
  // Parse "1d8+6" or "2d6+8"
  const match = formula.match(/(\d+)d(\d+)([+-]\d+)?/)
  if (match) {
    return {
      count: parseInt(match[1]),
      sides: parseInt(match[2]),
      bonus: match[3] ? parseInt(match[3]) : 0
    }
  }
  return { count: 1, sides: 6, bonus: 0 }
}

// API call to update uses
const updateAbilityUses = async (characterId, abilityId, newCurrent) => {
  // TODO: Implement API call
  // await fetch(`https://api.characterfoundry.io/api/characters/${characterId}/abilities/${abilityId}/uses`, {
  //   method: 'PATCH',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ current: newCurrent })
  // })

  // Update local state
  setCharacter(prev => ({
    ...prev,
    abilities: prev.abilities.map(a =>
      a.abilityId === abilityId
        ? { ...a, uses: { ...a.uses, current: newCurrent } }
        : a
    )
  }))
}
```

---

## Full Example: Updated CharacterCard Component

Here's how the abilities section should look:

```jsx
// In CharacterCard.jsx

import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { rollAttack, rollD20, getNarration } from '../utils/dice'
import { getCharacter, useAbility, sendMessage } from '../services/api'
import AbilityCard from './AbilityCard'
import './CharacterCard.css'

function CharacterCard() {
  // ... existing state ...
  const [abilities, setAbilities] = useState([])

  // Load character with abilities
  useEffect(() => {
    const loadCharacter = async () => {
      try {
        // TODO: Replace with your API
        const data = await getCharacter(characterId, { include: 'abilities' })

        setCharacter(data)
        setAbilities(data.abilities || [])
        setCurrentHP(data.hp.current)
        setMessages([data.initialMessage])
        setLoading(false)
      } catch (error) {
        console.error('Error loading character:', error)
        setLoading(false)
      }
    }

    loadCharacter()
  }, [characterId])

  // Handle ability use
  const handleAbilityUse = async (ability) => {
    // ... implementation from above ...
  }

  // ... rest of component ...

  return (
    <div className="character-card">
      {/* ... header and image section ... */}

      <div className="chat-section">
        {/* ... chat messages ... */}

        <div className="quick-actions">
          {abilities.length > 0 ? (
            abilities
              .filter(a => a.equipped) // Only show equipped abilities
              .map((ability) => (
                <AbilityCard
                  key={ability.abilityId}
                  ability={ability}
                  onUse={handleAbilityUse}
                  character={character}
                  mode={mode}
                />
              ))
          ) : (
            <div className="no-abilities">No abilities equipped</div>
          )}
        </div>

        {/* ... chat input ... */}
      </div>
    </div>
  )
}

export default CharacterCard
```

---

## API Service Update

Add to `src/services/api.js`:

```javascript
/**
 * Get character with abilities populated
 * @param {string} characterId
 * @param {Object} options - { include: 'abilities' }
 * @returns {Promise<Object>}
 */
export const getCharacter = async (characterId, options = {}) => {
  const params = new URLSearchParams()
  if (options.include) {
    params.append('include', options.include)
  }

  const url = `${API_BASE_URL}/characters/${characterId}?${params}`
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`Failed to fetch character: ${response.statusText}`)
  }

  const result = await response.json()
  return result.data
}

/**
 * Update ability uses (after using a spell/attack)
 * @param {string} characterId
 * @param {string} abilityId
 * @param {number} newCurrent - New current uses
 * @returns {Promise<Object>}
 */
export const updateAbilityUses = async (characterId, abilityId, newCurrent) => {
  const response = await fetch(
    `${API_BASE_URL}/characters/${characterId}/abilities/${abilityId}/uses`,
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ current: newCurrent })
    }
  )

  if (!response.ok) {
    throw new Error(`Failed to update ability uses: ${response.statusText}`)
  }

  return await response.json()
}

/**
 * Add ability to character
 * @param {string} characterId
 * @param {string} abilityId
 * @param {Object} options - { category, equipped, uses }
 * @returns {Promise<Object>}
 */
export const addAbilityToCharacter = async (characterId, abilityId, options = {}) => {
  const response = await fetch(
    `${API_BASE_URL}/characters/${characterId}/abilities`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        abilityId,
        category: options.category || 'ability',
        equipped: options.equipped !== false,
        uses: options.uses || { max: null }
      })
    }
  )

  if (!response.ok) {
    throw new Error(`Failed to add ability: ${response.statusText}`)
  }

  return await response.json()
}

/**
 * Get all available abilities (for browsing/adding)
 * @param {Object} filters - { category, level, school }
 * @returns {Promise<Array>}
 */
export const getAllAbilities = async (filters = {}) => {
  const params = new URLSearchParams(filters)
  const response = await fetch(`${API_BASE_URL}/abilities?${params}`)

  if (!response.ok) {
    throw new Error(`Failed to fetch abilities: ${response.statusText}`)
  }

  const result = await response.json()
  return result.data
}
```

---

## Benefits of This Approach

✅ **Dynamic Abilities**: Characters can have any abilities from your database
✅ **Full D&D Info**: Shows casting time, range, components, etc.
✅ **Usage Tracking**: Automatically tracks spell slots, daily uses
✅ **Expandable Details**: Users can click ⓘ to see full description
✅ **Shareable**: Abilities have unique IDs, can be shared between characters
✅ **Customizable**: Each character can have different use counts, notes
✅ **API-Ready**: Just uncomment the TODO sections

---

## Testing Locally

### Mock Data Format:

```javascript
// For testing without API, use this in CharacterCard:
const demoCharacters = {
  achilles: {
    name: 'Achilles',
    hp: { current: 104, max: 104 },
    ac: 18,
    abilities: [
      {
        abilityId: "mock-ability-1",
        category: "attack",
        equipped: true,
        uses: { current: null, max: null },
        details: {
          name: "Sword Strike",
          shortDescription: "A powerful melee attack",
          longDescription: "Strike with your bronze blade, honed by decades of combat.",
          attackBonus: 9,
          damageFormula: "1d8+6",
          damageType: "slashing"
        }
      },
      {
        abilityId: "mock-ability-2",
        category: "spell",
        equipped: true,
        uses: { current: 3, max: 5 },
        details: {
          name: "Cure Wounds",
          shortDescription: "Heal wounds",
          longDescription: "Casting Time: 1 action\nRange: Touch\nComponents: V, S\nDuration: Instantaneous",
          school: "Abjuration",
          level: "1st",
          castingTime: "1 action",
          range: "Touch",
          components: "V, S",
          duration: "Instantaneous"
        }
      }
    ]
  }
}
```

---

## Next Steps

1. ✅ Update `CharacterCard.jsx` to use `AbilityCard` component
2. ✅ Add ability data to your character responses
3. ✅ Implement the API endpoints in your Node server
4. ✅ Test with a few abilities
5. ✅ Add ability management UI (add/remove abilities)

See `CHARACTER_ABILITY_SYSTEM.md` for backend implementation details!
