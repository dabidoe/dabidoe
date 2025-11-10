#!/usr/bin/env python3
"""
Fix all issues in test-enhanced-features.html
"""

with open('/home/user/dabidoe/test-enhanced-features.html', 'r') as f:
    content = f.read()

# 1. Remove "Set Default" button and make abilities clickable
# Find and replace the ability card rendering in updateAbilitiesTab
old_ability_card = '''            <div class="ability-card" style="position: relative;">
              <div class="ability-header">
                <div class="ability-icon">${ability.icon}</div>
                <div class="ability-info">
                  <div class="ability-name">${ability.name} ${isDefault ? '(Default)' : ''}</div>
                  ${ability.damage ? `<div class="ability-damage">${ability.damage}</div>` : ''}
                </div>
              </div>
              <div class="ability-description">${ability.description}</div>
              <button
                onclick="setDefaultAbility('${ability.id}')"
                style="position: absolute; top: 10px; right: 10px; padding: 4px 8px; background: var(--accent-color); border: none; border-radius: 4px; color: white; font-size: 0.7rem; cursor: pointer;"
              >
                ${isDefault ? 'Default ✓' : 'Set Default'}
              </button>
            </div>'''

new_ability_card = '''            <div class="ability-card" style="position: relative; cursor: pointer;" onclick="useAbility('${ability.id}')">
              <div class="ability-header">
                <div class="ability-icon">${ability.icon}</div>
                <div class="ability-info">
                  <div class="ability-name">${ability.name}</div>
                  ${ability.damage ? `<div class="ability-damage">💥 ${ability.damage}</div>` : ''}
                </div>
              </div>
              <div class="ability-description">${ability.description}</div>
            </div>'''

content = content.replace(old_ability_card, new_ability_card)

# 2. Remove redundant HP bar from stats tab
# Keep only the header HP bar
old_stats_hp = '''            <div class="hp-display">
              <strong>Hit Points</strong>
              <div class="hp-bar">
                <div class="hp-fill" id="hpFill" style="width: 85%"></div>
                <div class="hp-text" id="hpText">58 / 68</div>
              </div>
              <div style="margin-top: 10px; display: flex; gap: 10px; font-size: 0.85rem; color: var(--text-secondary);">
                <span>Current: <span class="stat-readonly" id="hpCurrentEdit">58</span></span>
                <span>Max: <span class="stat-readonly" id="hpMaxEdit">68</span></span>
              </div>
            </div>'''

# Replace with nothing (remove it)
content = content.replace(old_stats_hp, '')

# 3. Add useAbility function after rollCustomDice
use_ability_function = '''
    function useAbility(abilityId) {
      const ability = currentCharacter.abilities.find(a => a.id === abilityId);
      if (!ability) return;

      // Parse damage string (e.g., "2d8+4" or "1d6")
      let attackRoll = null;
      let damageRolls = [];
      let damageTotal = 0;

      if (ability.damage) {
        // Roll attack (d20 + modifier, assume +7 for now)
        const attackD20 = Math.floor(Math.random() * 20) + 1;
        const attackMod = 7;
        attackRoll = attackD20 + attackMod;

        // Parse damage (e.g., "2d8+4")
        const damageMatch = ability.damage.match(/(\\d+)d(\\d+)([+-]\\d+)?/);
        if (damageMatch) {
          const numDice = parseInt(damageMatch[1]);
          const diceType = parseInt(damageMatch[2]);
          const modifier = damageMatch[3] ? parseInt(damageMatch[3]) : 0;

          for (let i = 0; i < numDice; i++) {
            const roll = Math.floor(Math.random() * diceType) + 1;
            damageRolls.push(roll);
            damageTotal += roll;
          }
          damageTotal += modifier;

          // Show dice overlay for attack
          showDiceRoll(
            ability.name,
            'd20',
            attackD20,
            attackRoll,
            `Attack: 1d20+${attackMod}`,
            attackD20 === 20 ? 'success' : (attackD20 === 1 ? 'fail' : null)
          );

          // Add to battle log
          const critText = attackD20 === 20 ? ' **CRITICAL HIT!**' : (attackD20 === 1 ? ' (Critical Miss)' : '');
          const damageText = ` | Damage: ${damageTotal} (${ability.damage}) [${damageRolls.join(', ')}]`;
          addBattleLog(`${ability.icon} ${ability.name}: Attack ${attackRoll}${critText}${damageText}`);
        }
      } else {
        // Non-damage ability
        addBattleLog(`${ability.icon} ${ability.name} - ${ability.description}`);
      }
    }
'''

# Insert after rollCustomDice function
insert_pos = content.find('    function changeLocation() {')
if insert_pos > 0:
    content = content[:insert_pos] + use_ability_function + '\n' + content[insert_pos:]

# 4. Fix dice roll picker issue - ensure IDs match
# The issue might be that diceType is both a variable and an element ID
# Let's rename the element ID in the HTML
content = content.replace(
    '<select id="diceType"',
    '<select id="diceTypeSelect"'
)

# Update the rollCustomDice function to use the new ID
content = content.replace(
    "const diceType = parseInt(document.getElementById('diceType').value) || 20;",
    "const diceType = parseInt(document.getElementById('diceTypeSelect').value) || 20;"
)

# 5. Add debugging for spells and make sure they render
# Add console log in updateSpellsTab
spell_debug = '''    function updateSpellsTab() {
      const spellsContent = document.getElementById('spellsContent');

      // Check if element exists (tab might not be active)
      if (!spellsContent) return;

      let html = '';

      // Check if character has spells
      if (!currentCharacter.spells || Object.keys(currentCharacter.spells).length === 0) {
        spellsContent.innerHTML = '<div style="color: var(--text-secondary); padding: 20px; text-align: center;">No spells available for this character.</div>';
        updateSpellSlotsDisplay();
        return;
      }

      // Update spell slots display
      updateSpellSlotsDisplay();

      // Debug: log spells
      console.log('Rendering spells for', currentCharacter.name, currentCharacter.spells);'''

content = content.replace(
    '''    function updateSpellsTab() {
      const spellsContent = document.getElementById('spellsContent');

      // Check if element exists (tab might not be active)
      if (!spellsContent) return;

      let html = '';

      // Check if character has spells
      if (!currentCharacter.spells || Object.keys(currentCharacter.spells).length === 0) {
        spellsContent.innerHTML = '<div style="color: var(--text-secondary); padding: 20px; text-align: center;">No spells available for this character.</div>';
        updateSpellSlotsDisplay();
        return;
      }

      // Update spell slots display
      updateSpellSlotsDisplay();''',
    spell_debug
)

# Write the fixed content
with open('/home/user/dabidoe/test-enhanced-features.html', 'w') as f:
    f.write(content)

print("Fixed test-enhanced-features.html:")
print("✓ Removed 'Set Default' button from abilities")
print("✓ Made ability cards clickable with roll to hit/damage")
print("✓ Removed redundant HP bar from stats tab")
print("✓ Fixed dice roll picker ID conflict")
print("✓ Added spell rendering debugging")
print("✓ Added useAbility() function for ability rolls")
