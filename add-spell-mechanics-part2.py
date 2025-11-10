#!/usr/bin/env python3
"""
Part 2: Update auto-populate to use subclass and add delete functionality
"""

# Read the file
with open('test-enhanced-features.html', 'r') as f:
    content = f.read()

# STEP 1: Replace autoPopulateSpells function to use subclass
old_auto_populate = content.find('    function autoPopulateSpells(character) {')
if old_auto_populate != -1:
    # Find the end of the function
    func_end = content.find('\n    }\n', old_auto_populate)
    func_end = content.find('\n    }\n', func_end + 1)  # Get the closing brace

    new_auto_populate = '''    function autoPopulateSpells(character) {
      const spellcasters = ['bard', 'cleric', 'druid', 'sorcerer', 'warlock', 'wizard'];
      const halfcasters = ['paladin', 'ranger'];
      const charClass = character.class.toLowerCase();

      if (!spellcasters.includes(charClass) && !halfcasters.includes(charClass)) {
        return; // No spells for non-casters
      }

      // Determine casting type
      const preparedCasters = ['cleric', 'druid', 'paladin'];
      const knownCasters = ['bard', 'sorcerer', 'warlock', 'ranger'];

      character.castingType = preparedCasters.includes(charClass) ? 'prepared' : 'known';

      // Initialize spells object
      character.spells = {};

      const level = character.level;
      const subclass = character.subclass;

      // Get subclass-themed spells if available
      const subclassSpellList = subclassSpells[subclass] || null;

      // Add cantrips
      const cantripCount = spellcasters.includes(charClass) ? Math.min(4, 2 + Math.floor(level / 4)) : 0;
      if (cantripCount > 0) {
        character.spells['0'] = [];

        if (subclassSpellList && subclassSpellList.cantrips) {
          // Add subclass-themed cantrips
          subclassSpellList.cantrips.slice(0, cantripCount).forEach(cantripId => {
            const spellDef = spellDefinitions[cantripId];
            if (spellDef) {
              character.spells['0'].push({
                id: cantripId,
                name: spellDef.name,
                icon: spellDef.icon,
                damage: spellDef.damage,
                description: spellDef.description,
                school: spellDef.school,
                castingTime: spellDef.castingTime,
                range: spellDef.range,
                components: spellDef.components,
                duration: spellDef.duration,
                concentration: spellDef.concentration,
                attackRoll: spellDef.attackRoll,
                save: spellDef.save
              });
            }
          });
        }
      }

      // Add leveled spells based on class
      const maxSpellLevel = halfcasters.includes(charClass) ? Math.min(5, Math.ceil(level / 4)) : Math.min(9, Math.ceil(level / 2));

      for (let spellLevel = 1; spellLevel <= maxSpellLevel; spellLevel++) {
        character.spells[spellLevel.toString()] = [];

        // Number of spells to add depends on casting type
        let spellsToAdd = 2;
        if (charClass === 'wizard') {
          // Wizards learn 2 per level
          spellsToAdd = Math.min(6, 2 + Math.floor(level / 2));
        } else if (knownCasters.includes(charClass)) {
          // Known casters have limited spells
          spellsToAdd = 2;
        } else if (preparedCasters.includes(charClass)) {
          // Prepared casters have access to more
          spellsToAdd = 3;
        }

        // Add subclass-themed spells
        if (subclassSpellList && subclassSpellList[spellLevel]) {
          const spellIds = subclassSpellList[spellLevel].slice(0, spellsToAdd);

          spellIds.forEach(spellId => {
            const spellDef = spellDefinitions[spellId];
            if (spellDef) {
              character.spells[spellLevel.toString()].push({
                id: spellId,
                name: spellDef.name,
                icon: spellDef.icon,
                damage: spellDef.damage,
                description: spellDef.description,
                school: spellDef.school,
                castingTime: spellDef.castingTime,
                range: spellDef.range,
                components: spellDef.components,
                duration: spellDef.duration,
                concentration: spellDef.concentration,
                attackRoll: spellDef.attackRoll,
                save: spellDef.save,
                prepared: preparedCasters.includes(charClass) ? true : false // Prepared casters auto-prepare
              });
            }
          });
        }
      }
    }'''

    if 'character.castingType' not in content:
        content = content[:old_auto_populate] + new_auto_populate + content[func_end + 6:]
        print("✅ Updated autoPopulateSpells to use subclass themes")

# STEP 2: Add delete spell function
last_script_close = content.rfind('  </script>')
if last_script_close != -1:
    delete_function = '''
    // Delete spell function (for known casters)
    function deleteSpell(spellId, level) {
      if (!currentCharacter.spells || !currentCharacter.spells[level]) return;

      // Check if this is a known caster (can delete spells)
      const knownCasters = ['bard', 'sorcerer', 'warlock', 'ranger'];
      const charClass = currentCharacter.class.toLowerCase();

      if (!knownCasters.includes(charClass)) {
        alert('This character uses prepared spells. Use the prepare/unprepare system instead!');
        return;
      }

      // Confirm deletion
      const spell = currentCharacter.spells[level].find(s => s.id === spellId);
      if (!spell) return;

      if (!confirm(`Remove ${spell.name} from known spells?\\n\\nYou can add it back from the spell picker.`)) {
        return;
      }

      // Remove spell
      currentCharacter.spells[level] = currentCharacter.spells[level].filter(s => s.id !== spellId);

      // Update display
      updateSpellsTab();
      addBattleLog(`📖 ${currentCharacter.name} forgot ${spell.name}`);
    }

'''

    if 'function deleteSpell' not in content:
        content = content[:last_script_close] + delete_function + content[last_script_close:]
        print("✅ Added deleteSpell function")

# STEP 3: Update updateSpellsTab to show delete button for known casters
# Find the spell card rendering in updateSpellsTab
update_spells_tab = content.find('function updateSpellsTab() {')
if update_spells_tab != -1:
    # Find where spell cards are rendered
    spell_card_pattern = 'html += `\n            <div class="spell-card'
    spell_card_pos = content.find(spell_card_pattern, update_spells_tab)

    if spell_card_pos != -1:
        # Find the closing of that spell-card div
        card_end = content.find('</div>\n          `;', spell_card_pos)

        if card_end != -1:
            # Check if delete button doesn't exist
            if 'deleteSpell' not in content[spell_card_pos:card_end]:
                # Add delete button before the closing div
                delete_button = '''
              ${currentCharacter.castingType === 'known' && level !== '0' ?
                `<button onclick="event.stopPropagation(); deleteSpell('${spell.id}', ${level})"
                        style="position: absolute; top: 5px; right: 5px; background: var(--background-color); border: 2px solid var(--border-color); border-radius: 4px; padding: 3px 8px; font-size: 0.75rem; cursor: pointer; color: var(--text-secondary);"
                        title="Remove spell">
                  ✕
                </button>` : ''}'''

                content = content[:card_end] + delete_button + content[card_end:]
                print("✅ Added delete button to spell cards")

# STEP 4: Add info about casting type to spell tab header
spells_tab_header = content.find('<div id="spellsTab"')
if spells_tab_header != -1:
    # Find the spellSlotsDisplay div
    spell_slots_div = content.find('<div class="spell-slots-overview" id="spellSlotsDisplay">', spells_tab_header)

    if spell_slots_div != -1:
        # Add casting type info before spell slots
        casting_info = '''
            <div id="castingTypeInfo" style="padding: 10px; margin-bottom: 10px; background: var(--background-color); border: 2px solid var(--border-color); border-radius: 6px; font-size: 0.85rem;">
              <!-- Will show casting type info -->
            </div>

            '''

        if 'castingTypeInfo' not in content:
            content = content[:spell_slots_div] + casting_info + content[spell_slots_div:]
            print("✅ Added casting type info placeholder")

# STEP 5: Update updateSpellsTab to show casting type info
update_spell_slots = content.find('function updateSpellSlotsDisplay() {')
if update_spell_slots != -1:
    # Find the first line of the function (after the opening brace)
    first_line = content.find('{', update_spell_slots) + 1

    casting_type_display = '''
      // Update casting type info
      const castingInfoEl = document.getElementById('castingTypeInfo');
      if (castingInfoEl && currentCharacter.castingType) {
        const castingDescriptions = {
          'prepared': '📚 Prepared Caster: You can prepare spells each day. Toggle ✓ to prepare/unprepare.',
          'known': '📖 Known Caster: You know a limited number of spells permanently. Click ✕ to forget a spell.'
        };
        castingInfoEl.innerHTML = `<div style="color: var(--text-secondary);">${castingDescriptions[currentCharacter.castingType] || ''}</div>`;
      }

'''

    if 'castingTypeInfo' not in content[update_spell_slots:update_spell_slots+1000]:
        content = content[:first_line] + casting_type_display + content[first_line:]
        print("✅ Added casting type display logic")

# Write the file
with open('test-enhanced-features.html', 'w') as f:
    f.write(content)

print("\n🎉 Part 2 complete!")
print("\nFeatures added:")
print("  - Subclass-based spell selection (Life Cleric gets healing spells, etc.)")
print("  - Casting type system (prepared vs known)")
print("  - Delete spell button (✕) for known casters")
print("  - Casting type info displays at top of spells tab")
print("  - Prepared casters can't delete (use prepare/unprepare)")
print("  - Known casters get ✕ button to remove spells")
