#!/usr/bin/env python3
"""
Add battle HP bar sync to updateCharacterDisplay
"""

with open('/home/user/dabidoe/test-enhanced-features.html', 'r') as f:
    content = f.read()

# Find the HP update section in updateCharacterDisplay
# Look for the header HP section
marker = '      // Update Header HP Bar'
marker_pos = content.find(marker)

if marker_pos > 0:
    # Find the end of the header HP block (look for next comment or function)
    # We'll search for the next major comment
    next_comment_pos = content.find('      // Update portrait', marker_pos)

    if next_comment_pos > 0:
        # Insert battle HP update before the next comment
        battle_hp_code = '''
      // Update Battle HP Bar
      const battleHpFill = document.getElementById('battleHpFill');
      const battleHpText = document.getElementById('battleHpText');
      if (battleHpFill && battleHpText) {
        battleHpFill.style.width = `${hpPercentage}%`;
        battleHpFill.classList.remove('high', 'medium', 'low');
        if (hpPercentage > 66) battleHpFill.classList.add('high');
        else if (hpPercentage > 33) battleHpFill.classList.add('medium');
        else battleHpFill.classList.add('low');
        battleHpText.textContent = `${currentCharacter.hp.current} / ${currentCharacter.hp.max}`;
      }

'''
        content = content[:next_comment_pos] + battle_hp_code + content[next_comment_pos:]
        print("✓ Added battle HP bar sync to updateCharacterDisplay()")
    else:
        print("⚠ Could not find insertion point for battle HP sync")
else:
    print("⚠ Could not find header HP bar section")

# Write the fixed content
with open('/home/user/dabidoe/test-enhanced-features.html', 'w') as f:
    f.write(content)

print("Battle HP sync complete!")
