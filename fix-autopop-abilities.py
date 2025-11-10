#!/usr/bin/env python3
"""
Fix: Re-add autoPopulateAbilities function that was accidentally deleted
"""

# Read the file
with open('test-enhanced-features.html', 'r') as f:
    content = f.read()

# Find where to add the function (after autoPopulateSpells function)
# Look for the closing of autoPopulateSpells
auto_populate_spells = content.find('    function autoPopulateSpells(character) {')
if auto_populate_spells != -1:
    # Find the end of autoPopulateSpells function
    # This function ends with:     }
    # We need to find the correct closing brace
    search_pos = auto_populate_spells
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
        # Add the autoPopulateAbilities function right after autoPopulateSpells
        insert_pos = func_end + 1

        auto_pop_abilities = '''

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
    }'''

        # Check if function doesn't already exist
        if 'function autoPopulateAbilities' not in content:
            content = content[:insert_pos] + auto_pop_abilities + content[insert_pos:]
            print("✅ Re-added autoPopulateAbilities function")
        else:
            print("⚠️ autoPopulateAbilities already exists")

# Write the file
with open('test-enhanced-features.html', 'w') as f:
    f.write(content)

print("\n🎉 Fix complete!")
print("autoPopulateAbilities function has been restored")
