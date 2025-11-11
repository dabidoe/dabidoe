# D&D 5e Integration Example

This guide shows how all the D&D 5e components work together in a complete mobile-first application.

## Table of Contents

1. [Full Component Integration](#full-component-integration)
2. [API Integration](#api-integration)
3. [State Management](#state-management)
4. [Mobile UX Flow](#mobile-ux-flow)
5. [Example Use Cases](#example-use-cases)

---

## Full Component Integration

### Main Character Sheet Component

```jsx
import { useState } from 'react';
import InteractiveStats from './components/character/InteractiveStats';
import SpellLibrary from './components/spells/SpellLibrary';
import BattleMode from './components/combat/BattleMode';
import RestSystem from './components/character/RestSystem';
import AbilityLibrary from './components/abilities/AbilityLibrary';
import DiceRollerOverlay from './components/dice/DiceRollerOverlay';

function CharacterSheet({ characterId }) {
  const [character, setCharacter] = useState(null);
  const [activeTab, setActiveTab] = useState('stats'); // stats, spells, abilities, combat, rest
  const [rollAnimation, setRollAnimation] = useState(null);

  // Load character on mount
  useEffect(() => {
    fetch(`/api/characters/${characterId}`)
      .then(res => res.json())
      .then(data => setCharacter(data.data));
  }, [characterId]);

  // Handle dice roll animations
  const handleRoll = (rollData) => {
    setRollAnimation(rollData);
    // Animation will auto-clear after 3 seconds
    setTimeout(() => setRollAnimation(null), 3000);
  };

  // Update character state
  const updateCharacter = async (updates) => {
    const response = await fetch(`/api/characters/${characterId}/stats`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stats: updates })
    });
    const data = await response.json();
    setCharacter(data.data);
  };

  if (!character) return <div>Loading...</div>;

  return (
    <div className="character-sheet">
      {/* Header with HP/AC */}
      <header className="character-header">
        <h1>{character.name}</h1>
        <div className="quick-stats">
          <div className="hp-display">
            <span className="label">HP</span>
            <span className="value">{character.hp.current}/{character.hp.max}</span>
          </div>
          <div className="ac-display">
            <span className="label">AC</span>
            <span className="value">{character.ac}</span>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <nav className="tab-nav">
        <button
          className={activeTab === 'stats' ? 'active' : ''}
          onClick={() => setActiveTab('stats')}
        >
          📊 Stats
        </button>
        <button
          className={activeTab === 'combat' ? 'active' : ''}
          onClick={() => setActiveTab('combat')}
        >
          ⚔️ Combat
        </button>
        <button
          className={activeTab === 'spells' ? 'active' : ''}
          onClick={() => setActiveTab('spells')}
        >
          ✨ Spells
        </button>
        <button
          className={activeTab === 'abilities' ? 'active' : ''}
          onClick={() => setActiveTab('abilities')}
        >
          🌟 Abilities
        </button>
        <button
          className={activeTab === 'rest' ? 'active' : ''}
          onClick={() => setActiveTab('rest')}
        >
          😴 Rest
        </button>
      </nav>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'stats' && (
          <InteractiveStats
            character={character}
            onRoll={handleRoll}
            onUpdateCharacter={updateCharacter}
          />
        )}

        {activeTab === 'combat' && (
          <BattleMode
            character={character}
            onAttack={async (attackData) => {
              const res = await fetch(`/api/characters/${characterId}/attack`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(attackData)
              });
              const data = await res.json();
              handleRoll({
                type: `Attack`,
                total: data.data.attack.total,
                breakdown: data.data.attack.breakdown,
                narrative: data.data.narrative
              });
            }}
            onDamage={async (amount) => {
              const res = await fetch(`/api/characters/${characterId}/damage`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount })
              });
              const data = await res.json();
              setCharacter({ ...character, hp: data.data.hp });
            }}
            onHeal={async (amount) => {
              const res = await fetch(`/api/characters/${characterId}/heal`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount })
              });
              const data = await res.json();
              setCharacter({ ...character, hp: data.data.hp });
            }}
            onRoll={handleRoll}
            onUpdateCharacter={updateCharacter}
          />
        )}

        {activeTab === 'spells' && (
          <SpellLibrary
            character={character}
            onCastSpell={async (spell) => {
              // Handle spell casting
              handleRoll({
                type: `Cast ${spell.name}`,
                diceType: spell.damage?.formula || '',
                narrative: `${character.name} casts ${spell.name}!`
              });
            }}
            onPrepareSpell={(spellId) => {
              // Toggle spell preparation
            }}
            onRoll={handleRoll}
          />
        )}

        {activeTab === 'abilities' && (
          <AbilityLibrary
            character={character}
            onUseAbility={async ({ ability, result }) => {
              const res = await fetch(`/api/characters/${characterId}/use-ability`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ abilityId: ability.id })
              });
              const data = await res.json();
              handleRoll({
                type: ability.name,
                total: data.data.result.damage?.total,
                narrative: data.data.narrative
              });
            }}
            onRoll={handleRoll}
            onUpdateCharacter={updateCharacter}
          />
        )}

        {activeTab === 'rest' && (
          <RestSystem
            character={character}
            onRest={async (restType, options) => {
              const endpoint = restType === 'short' ? 'rest/short' : 'rest/long';
              const res = await fetch(`/api/characters/${characterId}/${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(options)
              });
              const data = await res.json();

              // Show rest narrative
              alert(data.data.narrative);

              // Refresh character
              const charRes = await fetch(`/api/characters/${characterId}`);
              const charData = await charRes.json();
              setCharacter(charData.data);
            }}
            onRoll={handleRoll}
            onUpdateCharacter={updateCharacter}
          />
        )}
      </div>

      {/* Dice Roller Overlay */}
      {rollAnimation && (
        <DiceRollerOverlay
          roll={rollAnimation}
          onComplete={() => setRollAnimation(null)}
        />
      )}
    </div>
  );
}

export default CharacterSheet;
```

---

## API Integration

### API Service Layer

Create a centralized API service for all character actions:

```javascript
// client/src/services/api.js

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

class CharacterAPI {
  // Get character
  async getCharacter(characterId) {
    const res = await fetch(`${API_BASE}/characters/${characterId}`);
    return res.json();
  }

  // Roll skill check
  async rollSkill(characterId, skillName, options = {}) {
    const res = await fetch(`${API_BASE}/characters/${characterId}/roll/skill`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ skillName, ...options })
    });
    return res.json();
  }

  // Roll saving throw
  async rollSave(characterId, ability, options = {}) {
    const res = await fetch(`${API_BASE}/characters/${characterId}/roll/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ability, ...options })
    });
    return res.json();
  }

  // Attack
  async attack(characterId, attackData) {
    const res = await fetch(`${API_BASE}/characters/${characterId}/attack`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(attackData)
    });
    return res.json();
  }

  // Take damage
  async takeDamage(characterId, amount, damageType = 'untyped') {
    const res = await fetch(`${API_BASE}/characters/${characterId}/damage`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, damageType })
    });
    return res.json();
  }

  // Heal
  async heal(characterId, amount) {
    const res = await fetch(`${API_BASE}/characters/${characterId}/heal`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount })
    });
    return res.json();
  }

  // Use ability
  async useAbility(characterId, abilityId) {
    const res = await fetch(`${API_BASE}/characters/${characterId}/use-ability`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ abilityId })
    });
    return res.json();
  }

  // Short rest
  async shortRest(characterId, hitDiceToUse = 0) {
    const res = await fetch(`${API_BASE}/characters/${characterId}/rest/short`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hitDiceToUse })
    });
    return res.json();
  }

  // Long rest
  async longRest(characterId) {
    const res = await fetch(`${API_BASE}/characters/${characterId}/rest/long`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    return res.json();
  }

  // Update stats
  async updateStats(characterId, stats) {
    const res = await fetch(`${API_BASE}/characters/${characterId}/stats`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stats })
    });
    return res.json();
  }
}

export default new CharacterAPI();
```

### Using the API Service

```javascript
import api from '../services/api';

// Roll a skill check with advantage
const result = await api.rollSkill('character-id', 'athletics', { advantage: true });
console.log(result.data.narrative); // AI-generated narrative

// Attack with longsword
const attackResult = await api.attack('character-id', {
  attackType: 'melee',
  weaponName: 'Longsword',
  attackBonus: 5,
  damageFormula: '1d8+3',
  advantage: false
});

// Take short rest
const restResult = await api.shortRest('character-id', 2); // Spend 2 hit dice
console.log(restResult.data.healing.total); // Total HP healed
```

---

## State Management

### Using React Context for Character State

```javascript
// client/src/contexts/CharacterContext.jsx

import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const CharacterContext = createContext();

export function CharacterProvider({ characterId, children }) {
  const [character, setCharacter] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCharacter();
  }, [characterId]);

  const loadCharacter = async () => {
    setLoading(true);
    const result = await api.getCharacter(characterId);
    setCharacter(result.data);
    setLoading(false);
  };

  const rollSkill = async (skillName, options) => {
    const result = await api.rollSkill(characterId, skillName, options);
    return result.data;
  };

  const attack = async (attackData) => {
    const result = await api.attack(characterId, attackData);
    return result.data;
  };

  const takeDamage = async (amount, damageType) => {
    const result = await api.takeDamage(characterId, amount, damageType);
    setCharacter({ ...character, hp: result.data.hp });
    return result.data;
  };

  const heal = async (amount) => {
    const result = await api.heal(characterId, amount);
    setCharacter({ ...character, hp: result.data.hp });
    return result.data;
  };

  const shortRest = async (hitDiceToUse) => {
    const result = await api.shortRest(characterId, hitDiceToUse);
    await loadCharacter(); // Refresh full character
    return result.data;
  };

  const longRest = async () => {
    const result = await api.longRest(characterId);
    await loadCharacter(); // Refresh full character
    return result.data;
  };

  const value = {
    character,
    loading,
    rollSkill,
    attack,
    takeDamage,
    heal,
    shortRest,
    longRest,
    refreshCharacter: loadCharacter
  };

  return (
    <CharacterContext.Provider value={value}>
      {children}
    </CharacterContext.Provider>
  );
}

export function useCharacter() {
  const context = useContext(CharacterContext);
  if (!context) {
    throw new Error('useCharacter must be used within CharacterProvider');
  }
  return context;
}
```

### Using the Context

```javascript
import { CharacterProvider, useCharacter } from './contexts/CharacterContext';

function App() {
  return (
    <CharacterProvider characterId="abc123">
      <CharacterSheet />
    </CharacterProvider>
  );
}

function CharacterSheet() {
  const { character, rollSkill, takeDamage } = useCharacter();

  const handleSkillClick = async (skillName) => {
    const result = await rollSkill(skillName);
    alert(result.narrative);
  };

  return (
    <InteractiveStats
      character={character}
      onRoll={handleSkillClick}
    />
  );
}
```

---

## Mobile UX Flow

### Complete Combat Encounter

```
1. Player opens BattleMode tab
2. Taps "Roll Initiative" → Dice animation shows d20 result
3. AI narrative: "Your character springs into action!"
4. Turn counter starts at 1

5. Player taps "Melee Attack"
6. Attack roll: 18 + 5 = 23
7. Damage roll: 1d8+3 = 8
8. AI narrative: "Your sword crashes down in a devastating arc!"

9. Enemy turn - Player taps "Take Damage"
10. Enters 12 damage
11. HP updates: 45 → 33

12. Player's turn - Taps "Cast Spell"
13. Opens SpellLibrary modal
14. Selects "Cure Wounds" (1st level)
15. Rolls 1d8+4 = 9 healing
16. HP updates: 33 → 42
17. Spell slot consumed: 4/4 → 3/4

18. Combat ends - Player taps "Rest" tab
19. Selects "Short Rest"
20. Spends 2 hit dice: 1d8+2 = 7, 1d8+2 = 5
21. HP heals: 42 → 54 (max)
22. AI narrative: "You catch your breath and bind your wounds..."
```

### Spell Management Flow

```
1. Player opens SpellLibrary
2. Swipes tabs left/right to browse spell levels
3. Sees "2/4" spell slots for level 1
4. Taps "Fireball" (3rd level)
5. Bottom sheet slides up with spell details
6. Shows: "8d6 fire damage, 20ft radius, DEX save DC 15"
7. Taps "Cast Spell"
8. Rolls 8d6 = 28 damage
9. Dice animation shows each d6 rolling
10. AI narrative: "Flames erupt in a massive explosion!"
11. Spell slot consumed: 3/3 → 2/3
```

---

## Example Use Cases

### Use Case 1: Combat with Advantage

```javascript
// Character has advantage on attack due to flanking

const result = await api.attack(characterId, {
  attackType: 'melee',
  weaponName: 'Greataxe',
  attackBonus: 7,
  damageFormula: '1d12+5',
  advantage: true
});

// API Response:
{
  success: true,
  data: {
    attack: {
      roll: 19,
      bonus: 7,
      total: 26,
      breakdown: "ADV(12, 19) = 19 + 7 = 26",
      isCriticalHit: false,
      isCriticalMiss: false
    },
    damage: {
      normal: 14,
      critical: null,
      formula: "1d12+5"
    },
    narrative: "With your ally flanking the enemy, your greataxe cleaves through armor with devastating precision!"
  }
}
```

### Use Case 2: Taking Damage with Temp HP

```javascript
// Character has 10 temp HP and 45/50 regular HP
// Takes 15 damage

await api.takeDamage(characterId, 15);

// Result:
// Temp HP absorbs 10 damage: 10 → 0
// Regular HP takes remaining 5: 45 → 40
// Character HP is now 40/50 with 0 temp HP
```

### Use Case 3: Long Rest Recovery

```javascript
// Character before rest:
// HP: 23/50
// Hit Dice: 2/5 (d8)
// Spell Slots: 1st: 0/4, 2nd: 1/3, 3rd: 0/3
// Exhaustion: 1 level

const result = await api.longRest(characterId);

// Character after rest:
// HP: 50/50 (fully restored)
// Hit Dice: 4/5 (recovered half, rounded down: 2.5 → 2)
// Spell Slots: 1st: 4/4, 2nd: 3/3, 3rd: 3/3 (all restored)
// Exhaustion: 0 levels (reduced by 1)

console.log(result.narrative);
// "You wake refreshed as the morning sun filters through the trees, your wounds healed and magic restored."
```

### Use Case 4: Using Class Ability

```javascript
// Barbarian using Rage ability (2 uses per long rest)

const result = await api.useAbility(characterId, 'rage-ability-id');

// API Response:
{
  success: true,
  data: {
    ability: "Rage",
    result: {
      // No damage/attack for Rage, it's a buff
    },
    narrative: "Raw fury surges through your veins as you unleash a primal roar, your muscles rippling with supernatural power!"
  }
}

// Character now has:
// - Rage active (bonus damage, resistance)
// - Rage uses: 1/2 remaining
```

---

## Performance Optimization

### Lazy Load Components

```javascript
import { lazy, Suspense } from 'react';

const BattleMode = lazy(() => import('./components/combat/BattleMode'));
const SpellLibrary = lazy(() => import('./components/spells/SpellLibrary'));

function CharacterSheet() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      {activeTab === 'combat' && <BattleMode {...props} />}
      {activeTab === 'spells' && <SpellLibrary {...props} />}
    </Suspense>
  );
}
```

### Optimistic Updates

```javascript
// Update UI immediately, then sync with server

const takeDamage = async (amount) => {
  // Optimistic update
  const newHP = Math.max(0, character.hp.current - amount);
  setCharacter({ ...character, hp: { ...character.hp, current: newHP } });

  // Sync with server
  try {
    await api.takeDamage(characterId, amount);
  } catch (error) {
    // Revert on error
    setCharacter(previousCharacter);
    alert('Failed to update HP');
  }
};
```

---

## Next Steps

1. **Add PWA Support**: Install `vite-plugin-pwa` for offline functionality
2. **Add Animations**: Use Framer Motion for dice roll animations
3. **Add Sound Effects**: Dice rolls, spell casts, combat hits
4. **Add Dark Mode**: Toggle between light/dark themes
5. **Add Character List**: Browse multiple characters
6. **Add Party View**: See all party members' stats

---

## Mobile Testing Checklist

- [ ] All buttons are 44px minimum (Apple/Google guidelines)
- [ ] Bottom sheets slide smoothly on iOS Safari
- [ ] Touch targets don't overlap
- [ ] Modals dismiss on overlay tap
- [ ] Swipe gestures work on spell tabs
- [ ] Dice animations run at 60fps
- [ ] Network errors show user-friendly messages
- [ ] Forms validate before API calls
- [ ] Loading states show during API requests
- [ ] Success/error feedback is clear

---

## Cost Estimate (1000 Users)

**Monthly API Calls:**
- Character loads: 30,000 (30/user/month)
- Skill/Save rolls: 100,000 (100/user/month)
- Combat actions: 50,000 (50/user/month)
- Rest/Ability use: 20,000 (20/user/month)

**Total: 200,000 API calls/month**

**Costs:**
- Gemini Flash 2.0: FREE (1M tokens/day, ~50 chars/narrative = 20 tokens)
- MongoDB Atlas: FREE (512MB, ~1000 characters)
- Bunny CDN: $1/month (image hosting)
- Railway/Vercel: FREE tier (server hosting)

**Total Monthly Cost: $1** 🎉

---

## Support

For issues or questions, see:
- `docs/TESTING_GUIDE.md` - Testing and troubleshooting
- `docs/5E_FULL_IMPLEMENTATION.md` - Complete feature roadmap
- `shared/character-5e-schema.js` - Character data structure
