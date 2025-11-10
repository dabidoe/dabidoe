#!/usr/bin/env python3
"""
Insert battle HP sync after header HP
"""

with open('/home/user/dabidoe/test-enhanced-features.html', 'r') as f:
    lines = f.readlines()

# Find the line with "Update HP bar color based on percentage" or after the headerHpFill section
insert_line = None
for i, line in enumerate(lines):
    if 'headerHpFill.classList.add' in line and 'medium' in line:
        # This is the last line of header HP styling, insert after the closing brace
        # Look for the next closing brace
        for j in range(i+1, min(i+10, len(lines))):
            if lines[j].strip() == '}':
                insert_line = j + 1
                break
        break

if insert_line:
    battle_hp_code = '''
      // Update Battle HP Bar
      const battleHpFill = document.getElementById('battleHpFill');
      const battleHpText = document.getElementById('battleHpText');
      if (battleHpFill && battleHpText) {
        battleHpFill.style.width = hpPercent + '%';
        battleHpFill.classList.remove('high', 'medium', 'low');
        if (hpPercent > 66) battleHpFill.classList.add('high');
        else if (hpPercent > 33) battleHpFill.classList.add('medium');
        else battleHpFill.classList.add('low');
        battleHpText.textContent = `${currentCharacter.hp.current} / ${currentCharacter.hp.max}`;
      }

'''
    lines.insert(insert_line, battle_hp_code)
    print(f"✓ Inserted battle HP sync at line {insert_line}")
else:
    print("⚠ Could not find insertion point")

# Write back
with open('/home/user/dabidoe/test-enhanced-features.html', 'w') as f:
    f.writelines(lines)

print("Done!")
