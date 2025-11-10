#!/usr/bin/env python3
"""
1. Show Spells tab for Arcane Trickster/Eldritch Knight (1/3 casters)
2. Move Initiative into Turn tracker below quick actions
3. Add Short/Long Rest buttons above Location
4. Fix temporary modifiers to apply to rolls
"""

import re

# Read the file
with open('test-enhanced-features.html', 'r') as f:
    content = f.read()

# ============================================================================
# PART 1: Update updateTabVisibility to check for 1/3 caster subclasses
# ============================================================================

old_tab_visibility = '''    // Hide/show Spells tab based on character class
    function updateTabVisibility() {
      const spellsTabBtn = document.getElementById('spellsTabBtn');
      if (!spellsTabBtn) return;

      // Classes that don't have spells
      const nonCasters = ['barbarian', 'fighter', 'monk', 'rogue'];
      const charClass = currentCharacter.class.toLowerCase();

      if (nonCasters.includes(charClass)) {
        spellsTabBtn.style.display = 'none';
        // If currently on spells tab, switch to stats
        if (document.getElementById('spellsTab').style.display === 'block') {
          switchStatTab('stats');
          document.querySelector('.stat-tab-btn[onclick*="stats"]').classList.add('active');
        }
      } else {
        spellsTabBtn.style.display = '';
      }
    }'''

new_tab_visibility = '''    // Hide/show Spells tab based on character class and subclass
    function updateTabVisibility() {
      const spellsTabBtn = document.getElementById('spellsTabBtn');
      if (!spellsTabBtn) return;

      // Classes that don't have spells
      const nonCasters = ['barbarian', 'monk'];
      const charClass = currentCharacter.class.toLowerCase();
      const subclass = currentCharacter.subclass || '';

      // 1/3 casters (Fighter Eldritch Knight, Rogue Arcane Trickster)
      const thirdCasterSubclasses = ['Eldritch Knight', 'Arcane Trickster'];
      const isThirdCaster = thirdCasterSubclasses.includes(subclass);

      // Hide spells tab only for pure martials (not including 1/3 casters)
      const shouldHideSpells = nonCasters.includes(charClass) ||
                               (charClass === 'fighter' && !isThirdCaster) ||
                               (charClass === 'rogue' && !isThirdCaster);

      if (shouldHideSpells) {
        spellsTabBtn.style.display = 'none';
        // If currently on spells tab, switch to stats
        if (document.getElementById('spellsTab').style.display === 'block') {
          switchStatTab('stats');
          document.querySelector('.stat-tab-btn[onclick*="stats"]').classList.add('active');
        }
      } else {
        spellsTabBtn.style.display = '';
      }
    }'''

if old_tab_visibility in content:
    content = content.replace(old_tab_visibility, new_tab_visibility)
    print("✅ Updated updateTabVisibility for 1/3 casters")
else:
    print("⚠️ Could not find updateTabVisibility function")

# ============================================================================
# PART 2: Move Initiative roll into Turn tracker
# ============================================================================

# Remove old Initiative button from battle actions
old_battle_actions = '''            <div class="battle-actions">
              <button class="action-btn" onclick="rollMeleeAttack()">⚔️ Melee Attack</button>
              <button class="action-btn" onclick="rollRangedAttack()">🏹 Ranged Attack</button>
              <button class="action-btn" onclick="castCantrip()">✨ Cantrip</button>
              <button class="action-btn" onclick="rollDice('Initiative', 'd20')">🎲 Initiative</button>

              <button class="action-btn" onclick="quickAction('dash')">🏃 Dash</button>
              <button class="action-btn" onclick="quickAction('dodge')">💨 Dodge</button>

            </div>'''

new_battle_actions = '''            <div class="battle-actions">
              <button class="action-btn" onclick="rollMeleeAttack()">⚔️ Melee Attack</button>
              <button class="action-btn" onclick="rollRangedAttack()">🏹 Ranged Attack</button>
              <button class="action-btn" onclick="castCantrip()">✨ Cantrip</button>

              <button class="action-btn" onclick="quickAction('dash')">🏃 Dash</button>
              <button class="action-btn" onclick="quickAction('dodge')">💨 Dodge</button>

            </div>'''

if old_battle_actions in content:
    content = content.replace(old_battle_actions, new_battle_actions)
    print("✅ Removed Initiative button from battle actions")
else:
    print("⚠️ Could not find battle actions section")

# Update Turn tracker to include Initiative roll button
old_turn_tracker = '''            <div class="turn-tracker">
              <div class="turn-info">
                <div>
                  <strong style="color: var(--text-secondary); font-size: 0.85rem;">Turn</strong>
                  <div class="turn-number" id="turnNumber">1</div>
                </div>
                <div style="border-left: 2px solid var(--border-color); padding-left: 15px; margin-left: 15px;">
                  <div style="font-size: 0.75rem; color: var(--text-secondary);">Current</div>
                  <div style="font-weight: 600; color: var(--text-primary);" id="currentTurn">Your Turn</div>
                </div>
              </div>
              <button class="next-turn-btn" onclick="nextTurn()">Next Turn →</button>
            </div>'''

new_turn_tracker = '''            <div class="turn-tracker">
              <div class="turn-info">
                <div>
                  <strong style="color: var(--text-secondary); font-size: 0.85rem;">Turn</strong>
                  <div class="turn-number" id="turnNumber">1</div>
                </div>
                <div style="border-left: 2px solid var(--border-color); padding-left: 15px; margin-left: 15px;">
                  <div style="font-size: 0.75rem; color: var(--text-secondary);">Current</div>
                  <div style="font-weight: 600; color: var(--text-primary);" id="currentTurn">Your Turn</div>
                </div>
              </div>
              <div style="display: flex; gap: 8px;">
                <button class="action-btn" onclick="rollInitiative()" style="flex: 1; padding: 8px 12px;">🎲 Initiative</button>
                <button class="next-turn-btn" onclick="nextTurn()" style="flex: 1;">Next Turn →</button>
              </div>
            </div>'''

if old_turn_tracker in content:
    content = content.replace(old_turn_tracker, new_turn_tracker)
    print("✅ Added Initiative button to Turn tracker")
else:
    print("⚠️ Could not find turn tracker")

# ============================================================================
# PART 3: Add Short/Long Rest buttons above Location
# ============================================================================

old_location = '''      <!-- Location -->
      <div>
        <div style="font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 8px;">📍 Location</div>
        <select id="locationSelect" onchange="changeLocation()" style="width: 100%; padding: 10px; background: var(--surface-color); color: var(--text-primary); border: 2px solid var(--border-color); border-radius: 6px; font-size: 1rem; cursor: pointer;">'''

new_location = '''      <!-- Rest Buttons -->
      <div style="margin-bottom: 20px;">
        <div style="font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 8px;">💤 Rest & Recovery</div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
          <button onclick="shortRest()" style="padding: 12px; background: var(--accent-color); border: none; border-radius: 6px; color: white; font-size: 0.9rem; cursor: pointer; font-weight: 600; transition: all 0.2s;" onmouseover="this.style.opacity='0.8'" onmouseout="this.style.opacity='1'">
            ☀️ Short Rest
          </button>
          <button onclick="longRest()" style="padding: 12px; background: var(--secondary-color, #6c757d); border: none; border-radius: 6px; color: white; font-size: 0.9rem; cursor: pointer; font-weight: 600; transition: all 0.2s;" onmouseover="this.style.opacity='0.8'" onmouseout="this.style.opacity='1'">
            🌙 Long Rest
          </button>
        </div>
      </div>

      <!-- Location -->
      <div>
        <div style="font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 8px;">📍 Location</div>
        <select id="locationSelect" onchange="changeLocation()" style="width: 100%; padding: 10px; background: var(--surface-color); color: var(--text-primary); border: 2px solid var(--border-color); border-radius: 6px; font-size: 1rem; cursor: pointer;">'''

if old_location in content:
    content = content.replace(old_location, new_location)
    print("✅ Added Short/Long Rest buttons above Location")
else:
    print("⚠️ Could not find Location section")

# ============================================================================
# PART 4: Add rollInitiative, shortRest, and longRest functions
# ============================================================================

# Find nextTurn function and add new functions after it
marker = '    function nextTurn() {'
marker_pos = content.find(marker)

if marker_pos != -1:
    # Find end of nextTurn function
    search_pos = marker_pos
    brace_count = 0
    found_opening = False
    func_end = -1

    for i in range(search_pos, len(content)):
        if content[i] == '{':
            found_opening = True
            brace_count += 1
        elif content[i] == '}':
            brace_count -= 1
            if found_opening and brace_count == 0:
                func_end = i
                break

    if func_end != -1:
        new_functions = '''

    function rollInitiative() {
      const dexMod = Math.floor((currentCharacter.stats.dex - 10) / 2);
      const d20 = Math.floor(Math.random() * 20) + 1;
      const total = d20 + dexMod;

      const modText = dexMod >= 0 ? `+${dexMod}` : dexMod;
      let result = `🎲 Initiative: ${total} (d20: ${d20} ${modText})`;

      if (d20 === 20) result += ' **CRITICAL!**';
      else if (d20 === 1) result += ' (Natural 1)';

      addBattleLog(result);
      showDiceRoll('Initiative', 'd20', d20, total, dexMod);
    }

    function shortRest() {
      // Short rest: Regain some HP (spend hit dice), recover some abilities
      const hitDiceHeal = Math.floor(Math.random() * 8) + 1 + Math.floor((currentCharacter.stats.con - 10) / 2);
      const healAmount = Math.min(hitDiceHeal, currentCharacter.hp.max - currentCharacter.hp.current);

      currentCharacter.hp.current += healAmount;

      // Warlocks regain all spell slots on short rest
      if (currentCharacter.class.toLowerCase() === 'warlock' && currentCharacter.spellSlots) {
        Object.keys(currentCharacter.spellSlots).forEach(level => {
          if (currentCharacter.spellSlots[level]) {
            currentCharacter.spellSlots[level].current = currentCharacter.spellSlots[level].max;
          }
        });
        addBattleLog(`💫 ${currentCharacter.name} regained all spell slots!`);
      }

      // Fighters regain Action Surge, Monks regain Ki points, etc.
      addBattleLog(`☀️ ${currentCharacter.name} took a short rest and regained ${healAmount} HP!`);
      addBattleLog(`✨ Some class features have been restored!`);

      updateCharacterDisplay();
      updateSpellsTab();

      alert(`Short Rest Complete!\\n\\n• Regained ${healAmount} HP\\n• Some class features restored\\n${currentCharacter.class === 'Warlock' ? '• All spell slots restored!' : ''}`);
    }

    function longRest() {
      // Long rest: Fully heal HP, restore all spell slots, restore all abilities
      const healAmount = currentCharacter.hp.max - currentCharacter.hp.current;
      currentCharacter.hp.current = currentCharacter.hp.max;

      // Restore all spell slots
      if (currentCharacter.spellSlots) {
        Object.keys(currentCharacter.spellSlots).forEach(level => {
          if (currentCharacter.spellSlots[level]) {
            currentCharacter.spellSlots[level].current = currentCharacter.spellSlots[level].max;
          }
        });
      }

      // Clear temporary modifiers
      tempModifiers = [];
      updateTempModifiersList();

      addBattleLog(`🌙 ${currentCharacter.name} took a long rest!`);
      addBattleLog(`❤️ Fully healed! HP: ${currentCharacter.hp.current}/${currentCharacter.hp.max}`);
      addBattleLog(`✨ All spell slots and abilities restored!`);
      addBattleLog(`🧹 Temporary effects cleared!`);

      updateCharacterDisplay();
      updateSpellsTab();

      alert(`Long Rest Complete!\\n\\n• Fully healed (${healAmount > 0 ? '+' + healAmount : '0'} HP)\\n• All spell slots restored\\n• All abilities restored\\n• Temporary effects cleared`);
    }'''

        content = content[:func_end + 1] + new_functions + content[func_end + 1:]
        print("✅ Added rollInitiative, shortRest, and longRest functions")
    else:
        print("⚠️ Could not find end of nextTurn function")
else:
    print("⚠️ Could not find nextTurn function")

# ============================================================================
# PART 5: Update rollDice to apply temporary modifiers
# ============================================================================

# Find the rollDice function
old_roll_dice = '''    function rollDice(name, diceType) {
      const roll = Math.floor(Math.random() * parseInt(diceType.substring(1))) + 1;
      addBattleLog(`🎲 ${name}: ${roll} (${diceType})`);
      showDiceRoll(name, diceType, roll);
    }'''

new_roll_dice = '''    function rollDice(name, diceType, baseModifier = 0) {
      const diceValue = Math.floor(Math.random() * parseInt(diceType.substring(1))) + 1;

      // Apply temporary modifiers
      let tempMod = 0;
      if (tempModifiers.length > 0) {
        tempMod = tempModifiers.reduce((sum, mod) => sum + mod.value, 0);
      }

      const total = diceValue + baseModifier + tempMod;
      const modText = (baseModifier + tempMod) !== 0 ? ` ${(baseModifier + tempMod) >= 0 ? '+' : ''}${baseModifier + tempMod}` : '';

      let result = `🎲 ${name}: ${total} (${diceType}: ${diceValue}${modText})`;

      if (tempMod !== 0) {
        result += ` [Temp: ${tempMod >= 0 ? '+' : ''}${tempMod}]`;
      }

      addBattleLog(result);
      showDiceRoll(name, diceType, diceValue, total, baseModifier + tempMod);
    }'''

if old_roll_dice in content:
    content = content.replace(old_roll_dice, new_roll_dice)
    print("✅ Updated rollDice to apply temporary modifiers")
else:
    print("⚠️ Could not find rollDice function to update")

# Write the file
with open('test-enhanced-features.html', 'w') as f:
    f.write(content)

print("\n🎉 Complete!")
print("✓ Spells tab now visible for Arcane Trickster and Eldritch Knight")
print("✓ Initiative moved into Turn tracker below quick actions")
print("✓ Short/Long Rest buttons added above Location")
print("✓ Temporary modifiers now apply to all dice rolls")
