#!/usr/bin/env python3
"""
Fix character menu by adding spells to Kael and making code more robust
"""

# Read the file
with open('test-enhanced-features.html', 'r') as f:
    content = f.read()

# Find Kael's abilities section and add spells after it
kael_abilities = content.find("id: 'kael',")
if kael_abilities != -1:
    # Find the abilities closing bracket
    abilities_end = content.find('],\n        states: {', kael_abilities)

    if abilities_end != -1:
        # Add spells object for Arcane Trickster (gets limited wizard spells)
        kael_spells = ''',
        spells: {
          0: [
            { id: 'mage_hand', name: 'Mage Hand', icon: '✋', damage: null, description: 'Invisible spectral hand for manipulation', school: 'Conjuration', castingTime: '1 action', range: '30 feet', components: 'V, S', duration: '1 minute' },
            { id: 'minor_illusion', name: 'Minor Illusion', icon: '👻', damage: null, description: 'Create sound or image illusion', school: 'Illusion', castingTime: '1 action', range: '30 feet', components: 'S, M', duration: '1 minute' }
          ],
          1: [
            { id: 'disguise_self', name: 'Disguise Self', prepared: true, icon: '🎭', damage: null, description: 'Change your appearance', school: 'Illusion', castingTime: '1 action', range: 'Self', components: 'V, S', duration: '1 hour' },
            { id: 'charm_person', name: 'Charm Person', prepared: true, icon: '💖', damage: null, description: 'Make humanoid friendly', school: 'Enchantment', castingTime: '1 action', range: '30 feet', components: 'V, S', duration: '1 hour', save: 'Wisdom' }
          ]
        }'''

        if '"spells": {' not in content[kael_abilities:abilities_end + 200]:
            content = content[:abilities_end + 1] + kael_spells + content[abilities_end + 1:]
            print("✅ Added spells object to Kael (Arcane Trickster)")

# Make updateSpellsTab more robust to handle missing spells
update_spells_pos = content.find('function updateSpellsTab() {')
if update_spells_pos != -1:
    # Find the check for spells
    check_pos = content.find('if (!currentCharacter.spells || Object.keys(currentCharacter.spells).length === 0) {', update_spells_pos)

    if check_pos == -1:
        # Need to add this check
        first_brace = content.find('{', content.find('function updateSpellsTab()'))
        insert_after = content.find('\n', first_brace) + 1

        robust_check = '''      // Check if element exists (tab might not be active)
      if (!spellsContent) return;

      // Check if character has spells
      if (!currentCharacter.spells || Object.keys(currentCharacter.spells).length === 0) {
        spellsContent.innerHTML = '<div style="color: var(--text-secondary); padding: 20px; text-align: center;">This character has no spells available.</div>';
        updateSpellSlotsDisplay();
        return;
      }

'''

        if '// Check if character has spells' not in content[update_spells_pos:update_spells_pos+500]:
            content = content[:insert_after] + robust_check + content[insert_after:]
            print("✅ Made updateSpellsTab more robust")

# Write the file
with open('test-enhanced-features.html', 'w') as f:
    f.write(content)

print("\n🎉 Character menu fixes applied!")
print("\nNow all 4 characters should display:")
print("  1. Aelindra (Ranger)")
print("  2. Theron (Paladin)")
print("  3. Malrik (Wizard)")
print("  4. Kael (Rogue/Arcane Trickster) - now with spells!")
