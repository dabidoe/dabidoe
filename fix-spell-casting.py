#!/usr/bin/env python3
"""
Fix spell picker levels and cantrip casting
"""

with open('/home/user/dabidoe/test-enhanced-features.html', 'r') as f:
    content = f.read()

print("Fixing spell picker and cantrip casting...")

# 1. Add level 6-9 filters to spell picker
old_filters = '''          <button class="spell-picker-filter" data-level="5" onclick="filterByLevel('5')">5th</button>
        </div>
      </div>'''

new_filters = '''          <button class="spell-picker-filter" data-level="5" onclick="filterByLevel('5')">5th</button>
          <button class="spell-picker-filter" data-level="6" onclick="filterByLevel('6')">6th</button>
          <button class="spell-picker-filter" data-level="7" onclick="filterByLevel('7')">7th</button>
          <button class="spell-picker-filter" data-level="8" onclick="filterByLevel('8')">8th</button>
          <button class="spell-picker-filter" data-level="9" onclick="filterByLevel('9')">9th</button>
        </div>
      </div>'''

content = content.replace(old_filters, new_filters)
print("✓ Added levels 6-9 to spell picker")

# 2. Find and fix castSpellFromModal to allow cantrips and add battle log
# First, let me find the function
cast_start = content.find('function castSpellFromModal() {')
if cast_start > 0:
    # Find the end of the function
    cast_end = content.find('\n    function ', cast_start + 1)
    old_cast_function = content[cast_start:cast_end]

    # Replace with improved version
    new_cast_function = '''function castSpellFromModal() {
      if (!currentModalSpell) return;

      const spell = currentModalSpell;
      const level = currentModalSpellLevel;
      const isCantrip = level === '0';

      // Cantrips don't need spell slots
      if (!isCantrip) {
        // Check if spell slot available
        if (!currentCharacter.spellSlots?.[level] || currentCharacter.spellSlots[level].current <= 0) {
          alert(`No ${level}${getOrdinalSuffix(level)} level spell slots available!`);
          return;
        }

        // Check if spell is prepared
        if (!spell.prepared) {
          alert(`${spell.name} is not prepared!`);
          return;
        }

        // Use spell slot
        currentCharacter.spellSlots[level].current--;
        updateSpellSlotsDisplay();
      }

      // Roll spell (if applicable)
      let resultText = `✨ ${spell.name}`;

      if (spell.attackRoll || spell.damage) {
        // Attack spell
        if (spell.attackRoll) {
          const d20 = Math.floor(Math.random() * 20) + 1;
          const spellAttackBonus = currentCharacter.computed?.spellAttackBonus || 7;
          const total = d20 + spellAttackBonus;
          const isCrit = d20 === 20;
          const isFail = d20 === 1;

          resultText += ` | Attack: ${total} (d20: ${d20}+${spellAttackBonus})`;
          if (isCrit) resultText += ' **CRITICAL HIT!**';
          if (isFail) resultText += ' (Critical Miss)';
        }

        // Damage
        if (spell.damage) {
          const damageMatch = spell.damage.match(/(\\d+)d(\\d+)([+-]\\d+)?/);
          if (damageMatch) {
            const numDice = parseInt(damageMatch[1]);
            const diceType = parseInt(damageMatch[2]);
            const modifier = damageMatch[3] ? parseInt(damageMatch[3]) : 0;

            let damageTotal = 0;
            let rolls = [];
            for (let i = 0; i < numDice; i++) {
              const roll = Math.floor(Math.random() * diceType) + 1;
              rolls.push(roll);
              damageTotal += roll;
            }
            damageTotal += modifier;

            resultText += ` | Damage: ${damageTotal} (${spell.damage}) [${rolls.join(', ')}]`;
          }
        }
      } else if (spell.save) {
        // Save spell
        const saveDC = currentCharacter.computed?.spellSaveDC || 15;
        resultText += ` | ${spell.save} DC ${saveDC}`;
      }

      // Add to battle log
      addBattleLog(`${spell.icon || '✨'} ${resultText}`);

      // Show in modal feedback
      if (!isCantrip) {
        alert(`Cast ${spell.name}! (${currentCharacter.spellSlots[level].current} ${level}${getOrdinalSuffix(level)} level slots remaining)`);
      } else {
        alert(`Cast ${spell.name}!`);
      }

      // Update displays
      updateSpellsTab();
      updateSpellSlotsDisplay();

      // Close modal
      closeSpellModal();
    }

    function getOrdinalSuffix(num) {
      const j = num % 10;
      const k = num % 100;
      if (j == 1 && k != 11) return 'st';
      if (j == 2 && k != 12) return 'nd';
      if (j == 3 && k != 13) return 'rd';
      return 'th';
    }
'''

    content = content[:cast_start] + new_cast_function + content[cast_end:]
    print("✓ Rewrote castSpellFromModal with cantrip support and battle log")
else:
    print("⚠ Could not find castSpellFromModal function")

# Write the fixed content
with open('/home/user/dabidoe/test-enhanced-features.html', 'w') as f:
    f.write(content)

print("\n=== SPELL FIXES COMPLETE ===")
print("✅ Spell picker now shows levels 0-9")
print("✅ Cantrips cast without using spell slots")
print("✅ Spell casting outputs to battle log with rolls")
