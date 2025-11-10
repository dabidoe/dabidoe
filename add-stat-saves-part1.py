#!/usr/bin/env python3
"""
Part 1: Remove Save button and add clickable stat saves
"""

# Read the file
with open('test-enhanced-features.html', 'r') as f:
    content = f.read()

# STEP 1: Remove Save button from battle menu
old_save_button = '<button class="action-btn" onclick="rollDice(\'Save\', \'d20\')">🛡️ Save</button>'
if old_save_button in content:
    content = content.replace(old_save_button, '')
    print("✅ Removed Save button from battle menu")

# STEP 2: Make stat blocks clickable for saving throws
# Find the stat blocks and add onclick handlers
stats = ['str', 'dex', 'con', 'int', 'wis', 'cha']

for stat in stats:
    # Make stat-block clickable
    old_stat_block = f'<div class="stat-block">\n                <div class="stat-name">{stat.upper()}</div>'
    new_stat_block = f'<div class="stat-block" onclick="rollSavingThrow(\'{stat}\')" style="cursor: pointer; transition: all 0.2s;" onmouseover="this.style.transform=\'scale(1.05)\'" onmouseout="this.style.transform=\'scale(1)\'">\n                <div class="stat-name">{stat.upper()} 🎲</div>'

    if old_stat_block in content:
        content = content.replace(old_stat_block, new_stat_block)
        print(f"✅ Made {stat.upper()} stat clickable for saves")

# STEP 3: Add rollSavingThrow function
# Find where to add the function (before closing script tag)
last_script_close = content.rfind('  </script>')
if last_script_close != -1:
    roll_save_function = '''
    // Saving Throw Roll Function
    function rollSavingThrow(stat) {
      const statNames = {
        str: 'Strength',
        dex: 'Dexterity',
        con: 'Constitution',
        int: 'Intelligence',
        wis: 'Wisdom',
        cha: 'Charisma'
      };

      const statValue = currentCharacter.stats[stat];
      const modifier = Math.floor((statValue - 10) / 2);
      const d20 = Math.floor(Math.random() * 20) + 1;
      const total = d20 + modifier;

      const statName = statNames[stat];
      const modifierText = modifier >= 0 ? `+${modifier}` : modifier;

      let result = `🎲 ${statName} Save: ${total}`;
      result += ` (d20: ${d20} ${modifierText})`;

      if (d20 === 20) {
        result += ' **CRITICAL SUCCESS!**';
      } else if (d20 === 1) {
        result += ' (Critical Failure)';
      }

      addBattleLog(result);

      // Show dice roll animation
      showDiceRoll(`${statName} Save`, 'd20', d20, total, modifier);
    }

'''

    if 'function rollSavingThrow' not in content:
        content = content[:last_script_close] + roll_save_function + content[last_script_close:]
        print("✅ Added rollSavingThrow function")

# Write the file
with open('test-enhanced-features.html', 'w') as f:
    f.write(content)

print("\n✅ Part 1 complete!")
print("  - Removed Save button from battle menu")
print("  - Made all 6 stats clickable for saving throws")
print("  - Added dice icon (🎲) to stat names")
print("  - Hover effect on stats")
print("  - Saving throws log to battle with d20 + modifier")
