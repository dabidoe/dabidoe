#!/usr/bin/env python3
"""
Fix: Add fallback spells when subclass not found or not selected
"""

import re

# Read the file
with open('test-enhanced-features.html', 'r') as f:
    content = f.read()

# Find the autoPopulateSpells function
func_start = content.find('    function autoPopulateSpells(character) {')
if func_start == -1:
    print("❌ Could not find autoPopulateSpells function")
    exit(1)

# Find the end of the function (matching braces)
search_pos = func_start
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

if func_end == -1:
    print("❌ Could not find end of autoPopulateSpells function")
    exit(1)

# New autoPopulateSpells function with fallback spells
new_function = '''    function autoPopulateSpells(character) {
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
      let subclassSpellList = subclassSpells[subclass] || null;

      // Fallback: Use generic class-based spells if subclass not found
      const classDefaultSpells = {
        wizard: {
          cantrips: ['fire_bolt', 'mage_hand'],
          1: ['magic_missile', 'shield', 'detect_magic'],
          2: ['misty_step', 'scorching_ray'],
          3: ['fireball', 'counterspell'],
          4: ['greater_invisibility', 'ice_storm'],
          5: ['cone_of_cold', 'wall_of_force']
        },
        cleric: {
          cantrips: ['sacred_flame', 'guidance', 'light'],
          1: ['cure_wounds', 'bless', 'healing_word'],
          2: ['prayer_of_healing', 'spiritual_weapon'],
          3: ['mass_healing_word', 'spirit_guardians'],
          4: ['death_ward', 'guardian_of_faith'],
          5: ['mass_cure_wounds', 'flame_strike']
        },
        druid: {
          cantrips: ['produce_flame', 'shillelagh'],
          1: ['cure_wounds', 'entangle', 'goodberry'],
          2: ['moonbeam', 'pass_without_trace'],
          3: ['call_lightning', 'conjure_animals'],
          4: ['ice_storm', 'polymorph'],
          5: ['cone_of_cold', 'tree_stride']
        },
        sorcerer: {
          cantrips: ['fire_bolt', 'mage_hand'],
          1: ['magic_missile', 'shield'],
          2: ['misty_step', 'scorching_ray'],
          3: ['fireball', 'counterspell'],
          4: ['greater_invisibility', 'ice_storm'],
          5: ['cone_of_cold']
        },
        warlock: {
          cantrips: ['eldritch_blast', 'mage_hand'],
          1: ['hex', 'armor_of_agathys'],
          2: ['misty_step', 'hold_person'],
          3: ['counterspell', 'hunger_of_hadar'],
          4: ['dimension_door', 'banishment'],
          5: ['cone_of_cold', 'hold_monster']
        },
        bard: {
          cantrips: ['vicious_mockery', 'mage_hand'],
          1: ['cure_wounds', 'healing_word'],
          2: ['misty_step', 'hold_person'],
          3: ['counterspell', 'mass_healing_word'],
          4: ['greater_invisibility', 'dimension_door'],
          5: ['mass_cure_wounds', 'hold_monster']
        },
        paladin: {
          1: ['cure_wounds', 'shield_of_faith'],
          2: ['prayer_of_healing', 'aid'],
          3: ['revivify', 'mass_healing_word'],
          4: ['death_ward', 'aura_of_purity'],
          5: ['mass_cure_wounds']
        },
        ranger: {
          1: ['cure_wounds', 'hunters_mark'],
          2: ['pass_without_trace', 'spike_growth'],
          3: ['conjure_animals', 'lightning_arrow'],
          4: ['conjure_woodland_beings', 'freedom_of_movement'],
          5: ['swift_quiver', 'tree_stride']
        }
      };

      // If no subclass spells, use class defaults
      if (!subclassSpellList) {
        subclassSpellList = classDefaultSpells[charClass] || null;
      }

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

# Replace the function
content = content[:func_start] + new_function + content[func_end + 1:]

# Write the file
with open('test-enhanced-features.html', 'w') as f:
    f.write(content)

print("✅ Added fallback spells to autoPopulateSpells function")
print("\n🎉 Fix complete!")
print("New characters without a subclass will now get generic class-based spells")
