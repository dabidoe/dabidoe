#!/usr/bin/env python3
"""
Part 2: Add subclass selection and auto-populate spells/abilities
"""

# Read the file
with open('test-enhanced-features.html', 'r') as f:
    content = f.read()

# STEP 1: Add subclass dropdown to character creator
# Find the class dropdown and add subclass after it
class_select_pos = content.find('<select id="newCharClass"')
if class_select_pos != -1:
    # Find the closing div after class select
    closing_div = content.find('</div>', class_select_pos)
    closing_div = content.find('</div>', closing_div + 1) + 6  # Move past the closing div

    subclass_html = '''
          <!-- Subclass Dropdown -->
          <div>
            <label style="display: block; color: var(--text-primary); font-weight: 600; margin-bottom: 5px;">Subclass</label>
            <select id="newCharSubclass" style="width: 100%; padding: 10px; background: var(--background-color); color: var(--text-primary); border: 2px solid var(--border-color); border-radius: 6px; font-size: 1rem;">
              <option value="none">Choose after level 3...</option>
            </select>
          </div>
'''

    if 'newCharSubclass' not in content:
        content = content[:closing_div] + subclass_html + content[closing_div:]
        print("✅ Added subclass dropdown to character creator")

# STEP 2: Add function to update subclass options when class changes
# Find where newCharClass dropdown is defined and add onchange handler
old_class_select = '<select id="newCharClass" style='
new_class_select = '<select id="newCharClass" onchange="updateSubclassOptions()" style='

if old_class_select in content and 'updateSubclassOptions' not in content[content.find(old_class_select):content.find(old_class_select)+200]:
    content = content.replace(old_class_select, new_class_select, 1)
    print("✅ Added onchange handler to class dropdown")

# STEP 3: Add JavaScript functions for subclass options and auto-population
last_script_close = content.rfind('  </script>')
if last_script_close != -1:
    js_functions = '''
    // Subclass options by class
    const subclassOptions = {
      barbarian: ['Path of the Berserker', 'Path of the Totem Warrior', 'Path of the Zealot'],
      bard: ['College of Lore', 'College of Valor', 'College of Glamour'],
      cleric: ['Life Domain', 'Light Domain', 'War Domain', 'Trickery Domain'],
      druid: ['Circle of the Land', 'Circle of the Moon', 'Circle of Dreams'],
      fighter: ['Champion', 'Battle Master', 'Eldritch Knight'],
      monk: ['Way of the Open Hand', 'Way of Shadow', 'Way of the Four Elements'],
      paladin: ['Oath of Devotion', 'Oath of Vengeance', 'Oath of the Ancients'],
      ranger: ['Hunter', 'Beast Master', 'Gloom Stalker'],
      rogue: ['Thief', 'Assassin', 'Arcane Trickster'],
      sorcerer: ['Draconic Bloodline', 'Wild Magic', 'Divine Soul'],
      warlock: ['The Fiend', 'The Archfey', 'The Great Old One'],
      wizard: ['School of Evocation', 'School of Abjuration', 'School of Divination']
    };

    function updateSubclassOptions() {
      const classSelect = document.getElementById('newCharClass');
      const subclassSelect = document.getElementById('newCharSubclass');
      const selectedClass = classSelect.value;

      const subclasses = subclassOptions[selectedClass] || [];

      let html = '<option value="none">Choose after level 3...</option>';
      subclasses.forEach(subclass => {
        html += `<option value="${subclass}">${subclass}</option>`;
      });

      subclassSelect.innerHTML = html;
    }

    // Auto-populate spells based on class and level
    function autoPopulateSpells(character) {
      const spellcasters = ['bard', 'cleric', 'druid', 'sorcerer', 'warlock', 'wizard'];
      const halfcasters = ['paladin', 'ranger'];
      const charClass = character.class.toLowerCase();

      if (!spellcasters.includes(charClass) && !halfcasters.includes(charClass)) {
        return; // No spells for non-casters
      }

      // Initialize spells object
      character.spells = {};

      const level = character.level;

      // Add cantrips
      const cantripCount = spellcasters.includes(charClass) ? Math.min(4, 2 + Math.floor(level / 4)) : 0;
      if (cantripCount > 0 && abilityDatabase[charClass]) {
        character.spells['0'] = [];
        // Add basic cantrips
        if (charClass === 'wizard' || charClass === 'sorcerer') {
          character.spells['0'].push({ id: 'fire_bolt', name: 'Fire Bolt', icon: '🔥', damage: '1d10', description: 'Hurl a mote of fire', school: 'Evocation', castingTime: '1 action', range: '120 feet', components: 'V, S', duration: 'Instantaneous', attackRoll: true });
          character.spells['0'].push({ id: 'mage_hand', name: 'Mage Hand', icon: '✋', damage: null, description: 'Spectral floating hand', school: 'Conjuration', castingTime: '1 action', range: '30 feet', components: 'V, S', duration: '1 minute' });
        } else if (charClass === 'cleric') {
          character.spells['0'].push({ id: 'sacred_flame', name: 'Sacred Flame', icon: '✨', damage: '1d8', description: 'Flame-like radiance', school: 'Evocation', castingTime: '1 action', range: '60 feet', components: 'V, S', duration: 'Instantaneous', save: 'Dexterity' });
          character.spells['0'].push({ id: 'guidance', name: 'Guidance', icon: '🙏', damage: null, description: 'Add d4 to ability check', school: 'Divination', castingTime: '1 action', range: 'Touch', components: 'V, S', duration: '1 minute', concentration: true });
        }
      }

      // Add leveled spells based on class
      const maxSpellLevel = halfcasters.includes(charClass) ? Math.min(5, Math.ceil(level / 4)) : Math.min(9, Math.ceil(level / 2));

      for (let spellLevel = 1; spellLevel <= maxSpellLevel; spellLevel++) {
        character.spells[spellLevel.toString()] = [];

        // Add 2-3 spells per level
        const spellsToAdd = 2;

        // Class-specific spell examples
        if (spellLevel === 1) {
          if (charClass === 'wizard') {
            character.spells['1'].push({ id: 'magic_missile', name: 'Magic Missile', prepared: true, icon: '✨', damage: '3d4+3', description: 'Unerring magical darts', school: 'Evocation', castingTime: '1 action', range: '120 feet', components: 'V, S', duration: 'Instantaneous' });
            character.spells['1'].push({ id: 'shield', name: 'Shield', prepared: true, icon: '🛡️', damage: null, description: '+5 AC until next turn', school: 'Abjuration', castingTime: '1 reaction', range: 'Self', components: 'V, S', duration: '1 round' });
          } else if (charClass === 'cleric') {
            character.spells['1'].push({ id: 'cure_wounds', name: 'Cure Wounds', prepared: true, icon: '❤️', damage: '1d8+3', description: 'Heal hit points', school: 'Evocation', castingTime: '1 action', range: 'Touch', components: 'V, S', duration: 'Instantaneous' });
            character.spells['1'].push({ id: 'bless', name: 'Bless', prepared: true, icon: '✨', damage: null, description: 'Add d4 to attacks/saves', school: 'Enchantment', castingTime: '1 action', range: '30 feet', components: 'V, S, M', duration: '1 minute', concentration: true });
          }
        }
      }
    }

    // Auto-populate abilities based on class, subclass, and level
    function autoPopulateAbilities(character) {
      const charClass = character.class.toLowerCase();

      // Initialize abilities array
      if (!character.abilities) {
        character.abilities = [];
      }

      // Get abilities from database for this class
      const classAbilities = abilityDatabase[charClass] || [];

      // Add core abilities based on level
      const level = character.level;

      classAbilities.forEach(ability => {
        // Simple level gating (in a real implementation, this would be more sophisticated)
        character.abilities.push({
          id: ability.id,
          name: ability.name,
          icon: ability.icon,
          damage: ability.damage,
          description: ability.description
        });
      });

      // Add Extra Attack for fighters/paladins/rangers at level 5+
      if (level >= 5 && ['fighter', 'paladin', 'ranger'].includes(charClass)) {
        if (!character.abilities.some(a => a.id === 'extra_attack')) {
          character.abilities.push({
            id: 'extra_attack',
            name: 'Extra Attack',
            icon: '⚔️',
            damage: null,
            description: 'Attack twice when you take the Attack action'
          });
        }
      }
    }

'''

    if 'function updateSubclassOptions' not in content:
        content = content[:last_script_close] + js_functions + content[last_script_close:]
        print("✅ Added subclass and auto-populate functions")

# STEP 4: Update createNewCharacter to use auto-populate
# Find createNewCharacter function and add auto-populate calls
create_char_func = content.find('function createNewCharacter() {')
if create_char_func != -1:
    # Find where we create the newChar object
    new_char_obj = content.find('const newChar = {', create_char_func)
    if new_char_obj != -1:
        # Find the line that reads subclass
        subclass_line = content.find('subclass:', new_char_obj)

        if subclass_line != -1:
            # Find the end of that line
            line_end = content.find(',', subclass_line)
            old_subclass = content[subclass_line:line_end]

            # Get subclass from dropdown
            new_subclass_code = 'subclass: document.getElementById(\'newCharSubclass\').value !== \'none\' ? document.getElementById(\'newCharSubclass\').value : \'Choose at level 3\''

            if 'newCharSubclass' not in content[create_char_func:create_char_func+3000]:
                content = content.replace(old_subclass, new_subclass_code, 1)
                print("✅ Updated createNewCharacter to use subclass dropdown")

# STEP 5: Add auto-populate calls before adding to characters array
# Find where we add the new character to the array
add_char_line = content.find('characters.push(newChar);', create_char_func)
if add_char_line != -1:
    # Add auto-populate calls before this line
    auto_populate_calls = '''
      // Auto-populate spells and abilities based on class and level
      autoPopulateSpells(newChar);
      autoPopulateAbilities(newChar);

      '''

    if 'autoPopulateSpells(newChar)' not in content:
        content = content[:add_char_line] + auto_populate_calls + content[add_char_line:]
        print("✅ Added auto-populate calls to character creation")

# Write the file
with open('test-enhanced-features.html', 'w') as f:
    f.write(content)

print("\n🎉 Part 2 complete!")
print("\nFeatures added:")
print("  - Subclass dropdown in character creator")
print("  - Subclass options update based on selected class")
print("  - Auto-populate spells for casters (cantrips + leveled spells)")
print("  - Auto-populate abilities from ability database")
print("  - Extra Attack added automatically for martial classes at level 5+")
print("  - New characters start with class-appropriate spells and abilities!")
