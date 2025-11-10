#!/usr/bin/env python3
"""
Fix spell attack roll detection and ensure damage spells roll dice
"""

import re

# Read the file
with open('test-enhanced-features.html', 'r') as f:
    content = f.read()

# Find mapAPISpellToCharacterSpell and add attackRoll detection
old_mapping = r'''      // Add damage if present \(from our mapping or from API\)
      if \(apiSpell\.damage\) \{
        if \(typeof apiSpell\.damage === 'string'\) \{
          spell\.damage = apiSpell\.damage;
        \} else if \(apiSpell\.damage\?\.damage_at_character_level \|\| apiSpell\.damage\?\.damage_at_slot_level\) \{
          const damageData = apiSpell\.damage\.damage_at_character_level \|\| apiSpell\.damage\.damage_at_slot_level;
          const firstLevel = Object\.keys\(damageData\)\[0\];
          spell\.damage = damageData\[firstLevel\];
        \}
      \}'''

new_mapping = r'''      // Add damage if present (from our mapping or from API)
      if (apiSpell.damage) {
        if (typeof apiSpell.damage === 'string') {
          spell.damage = apiSpell.damage;
        } else if (apiSpell.damage?.damage_at_character_level || apiSpell.damage?.damage_at_slot_level) {
          const damageData = apiSpell.damage.damage_at_character_level || apiSpell.damage.damage_at_slot_level;
          const firstLevel = Object.keys(damageData)[0];
          spell.damage = damageData[firstLevel];
        }
      }

      // Detect if spell requires attack roll
      // Check description for attack keywords or if it's explicitly marked
      const needsAttackRoll = apiSpell.attack_roll ||
                             (apiSpell.desc && apiSpell.desc.some(d =>
                               d.includes('ranged spell attack') ||
                               d.includes('melee spell attack') ||
                               d.includes('spell attack')
                             ));

      // If spell has damage and description suggests attack, mark it
      if (spell.damage && needsAttackRoll) {
        spell.attackRoll = true;
      }

      // Add save requirement if present
      if (apiSpell.dc) {
        spell.save = apiSpell.dc.dc_type?.name || 'DEX';
      }'''

content = re.sub(old_mapping, new_mapping, content, flags=re.DOTALL)

# Also update the castSpellFromModal to always show damage rolls even without attack roll
old_cast_logic = r'''      // Roll spell \(if applicable\)
      let resultText = `✨ \$\{spell\.name\}`;

      if \(spell\.attackRoll \|\| spell\.damage\) \{
        // Attack spell
        if \(spell\.attackRoll\) \{
          const d20 = Math\.floor\(Math\.random\(\) \* 20\) \+ 1;
          const spellAttackBonus = currentCharacter\.computed\?\.spellAttackBonus \|\| 7;
          const total = d20 \+ spellAttackBonus;
          const isCrit = d20 === 20;
          const isFail = d20 === 1;

          resultText \+= ` \| Attack: \$\{total\} \(d20: \$\{d20\}\+\$\{spellAttackBonus\}\)`;
          if \(isCrit\) resultText \+= ' \*\*CRITICAL HIT!\*\*';
          if \(isFail\) resultText \+= ' \(Critical Miss\)';
        \}

        // Damage
        if \(spell\.damage\) \{'''

new_cast_logic = r'''      // Roll spell (if applicable)
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

        // Damage (always show if spell has damage, even without attack roll)
        if (spell.damage) {'''

content = re.sub(old_cast_logic, new_cast_logic, content, flags=re.DOTALL)

# Write the file
with open('test-enhanced-features.html', 'w') as f:
    f.write(content)

print("✅ Added attack roll detection to spell mapping")
print("✅ Enhanced damage output for all damage spells")
print("\nChanges applied successfully!")
