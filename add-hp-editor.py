#!/usr/bin/env python3
"""
Add HP editor function if missing
"""

with open('/home/user/dabidoe/test-enhanced-features.html', 'r') as f:
    content = f.read()

# Check if editHeaderHP exists
if 'function editHeaderHP' not in content:
    # Add the function after useAbility
    edit_hp_function = '''
    function editHeaderHP() {
      const current = currentCharacter.hp.current;
      const max = currentCharacter.hp.max;

      const newCurrent = prompt(`Edit Current HP (max: ${max}):`, current);
      if (newCurrent === null) return; // Cancelled

      const newCurrentNum = parseInt(newCurrent);
      if (isNaN(newCurrentNum) || newCurrentNum < 0) {
        alert('Please enter a valid number');
        return;
      }

      // Update HP
      currentCharacter.hp.current = Math.min(newCurrentNum, max);
      updateCharacterDisplay();
      addBattleLog(`${currentCharacter.name}'s HP updated to ${currentCharacter.hp.current}/${max}`);
    }
'''

    # Insert after useAbility function
    insert_pos = content.find('    function changeLocation() {')
    if insert_pos > 0:
        content = content[:insert_pos] + edit_hp_function + '\n' + content[insert_pos:]
        print("✓ Added editHeaderHP() function")
    else:
        print("⚠ Could not find insertion point")
else:
    print("✓ editHeaderHP() function already exists")

# Check if statsLocked exists
if 'let statsLocked' not in content and 'var statsLocked' not in content:
    # Add statsLocked variable initialization
    stats_locked_init = 'let statsLocked = false;\n    '

    # Insert after currentCharacter initialization
    insert_pos = content.find('let currentCharacter = characters[0];')
    if insert_pos > 0:
        # Find end of line
        eol_pos = content.find('\n', insert_pos)
        content = content[:eol_pos + 1] + '    ' + stats_locked_init + content[eol_pos + 1:]
        print("✓ Added statsLocked variable")
    else:
        print("⚠ Could not find statsLocked insertion point")
else:
    print("✓ statsLocked variable already exists")

# Write the fixed content
with open('/home/user/dabidoe/test-enhanced-features.html', 'w') as f:
    f.write(content)

print("\nHP editor ready!")
