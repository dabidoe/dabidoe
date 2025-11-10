#!/usr/bin/env python3
"""
Add 'Auto-Add More Spells' button to Spells tab
"""

# Read the file
with open('test-enhanced-features.html', 'r') as f:
    content = f.read()

# Find the "+ Add Spell" button and add our new button next to it
old_button = '''              <button onclick="openSpellPicker()" style="padding: 6px 12px; background: var(--accent-color); border: none; border-radius: 6px; color: white; font-size: 0.85rem; cursor: pointer; font-weight: 600;">
                + Add Spell
              </button>'''

new_buttons = '''              <button onclick="openSpellPicker()" style="padding: 6px 12px; background: var(--accent-color); border: none; border-radius: 6px; color: white; font-size: 0.85rem; cursor: pointer; font-weight: 600;">
                + Add Spell
              </button>
              <button onclick="autoAddMoreSpells()" style="padding: 6px 12px; background: var(--secondary-color, #6c757d); border: none; border-radius: 6px; color: white; font-size: 0.85rem; cursor: pointer; font-weight: 600; margin-left: 8px;">
                🔄 Auto-Add More
              </button>'''

if old_button in content:
    content = content.replace(old_button, new_buttons)
    print("✅ Added 'Auto-Add More' button to Spells tab")
else:
    print("⚠️ Could not find Add Spell button")

# Now add the autoAddMoreSpells function
# Find a good place to add it - after the deleteSpell function
insert_marker = '    function deleteSpell(spellId, level) {'
marker_pos = content.find(insert_marker)

if marker_pos != -1:
    # Find the end of deleteSpell function
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
        # Add the new function after deleteSpell
        new_function = '''

    // Auto-add more spells from the database
    function autoAddMoreSpells() {
      const spellcasters = ['bard', 'cleric', 'druid', 'sorcerer', 'warlock', 'wizard'];
      const halfcasters = ['paladin', 'ranger'];
      const charClass = currentCharacter.class.toLowerCase();

      if (!spellcasters.includes(charClass) && !halfcasters.includes(charClass)) {
        alert('⚠️ This character is not a spellcaster!');
        return;
      }

      if (!currentCharacter.spells) {
        currentCharacter.spells = {};
      }

      // Expanded spell database with more variety
      const expandedSpellDatabase = {
        0: ['fire_bolt', 'ray_of_frost', 'shocking_grasp', 'chill_touch', 'poison_spray', 'mage_hand', 'prestidigitation', 'minor_illusion', 'sacred_flame', 'guidance', 'light', 'thaumaturgy', 'vicious_mockery', 'eldritch_blast', 'blade_ward', 'true_strike', 'produce_flame', 'shillelagh', 'thorn_whip'],
        1: ['magic_missile', 'shield', 'detect_magic', 'burning_hands', 'thunderwave', 'cure_wounds', 'bless', 'healing_word', 'hex', 'armor_of_agathys', 'entangle', 'goodberry', 'hunters_mark', 'shield_of_faith', 'inflict_wounds', 'sanctuary'],
        2: ['scorching_ray', 'shatter', 'misty_step', 'hold_person', 'prayer_of_healing', 'lesser_restoration', 'spiritual_weapon', 'moonbeam', 'pass_without_trace', 'spike_growth', 'aid', 'silence', 'locate_object'],
        3: ['fireball', 'lightning_bolt', 'counterspell', 'mass_healing_word', 'revivify', 'beacon_of_hope', 'call_lightning', 'conjure_animals', 'lightning_arrow', 'spirit_guardians', 'dispel_magic', 'hunger_of_hadar'],
        4: ['ice_storm', 'wall_of_fire', 'greater_invisibility', 'death_ward', 'guardian_of_faith', 'polymorph', 'conjure_woodland_beings', 'freedom_of_movement', 'dimension_door', 'banishment', 'aura_of_purity'],
        5: ['cone_of_cold', 'wall_of_force', 'mass_cure_wounds', 'raise_dead', 'flame_strike', 'tree_stride', 'swift_quiver', 'hold_monster', 'cloudkill', 'scrying']
      };

      let spellsAdded = 0;
      const preparedCasters = ['cleric', 'druid', 'paladin'];
      const level = currentCharacter.level;
      const maxSpellLevel = halfcasters.includes(charClass) ? Math.min(5, Math.ceil(level / 4)) : Math.min(9, Math.ceil(level / 2));

      // For each spell level the character has access to
      for (let spellLevel = 0; spellLevel <= maxSpellLevel; spellLevel++) {
        const levelKey = spellLevel.toString();

        // Initialize if needed
        if (!currentCharacter.spells[levelKey]) {
          currentCharacter.spells[levelKey] = [];
        }

        // Get current spell IDs to avoid duplicates
        const currentSpellIds = currentCharacter.spells[levelKey].map(s => s.id);

        // Get available spells for this level
        const availableSpells = expandedSpellDatabase[spellLevel] || [];

        // Filter out spells already known
        const newSpells = availableSpells.filter(spellId => !currentSpellIds.includes(spellId));

        // Add 2-3 new spells per level
        const spellsToAdd = spellLevel === 0 ? 2 : Math.min(3, newSpells.length);

        for (let i = 0; i < spellsToAdd && i < newSpells.length; i++) {
          const spellId = newSpells[i];
          const spellDef = spellDefinitions[spellId];

          if (spellDef) {
            currentCharacter.spells[levelKey].push({
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
              prepared: preparedCasters.includes(charClass) ? true : false
            });
            spellsAdded++;
          }
        }
      }

      if (spellsAdded > 0) {
        updateSpellsTab();
        addBattleLog(`📚 ${currentCharacter.name} learned ${spellsAdded} new spell${spellsAdded > 1 ? 's' : ''}!`);
        alert(`✨ Added ${spellsAdded} new spell${spellsAdded > 1 ? 's' : ''} to your spellbook!`);
      } else {
        alert('📖 No new spells available! You already know all available spells for your level, or use the Spell Picker to add custom spells.');
      }
    }'''

        content = content[:func_end + 1] + new_function + content[func_end + 1:]
        print("✅ Added autoAddMoreSpells function")
    else:
        print("⚠️ Could not find end of deleteSpell function")
else:
    print("⚠️ Could not find deleteSpell function")

# Write the file
with open('test-enhanced-features.html', 'w') as f:
    f.write(content)

print("\n🎉 Complete!")
print("Added 'Auto-Add More' button that will add 2-3 additional spells per level")
