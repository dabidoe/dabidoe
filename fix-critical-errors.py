#!/usr/bin/env python3
"""
Fix the two critical errors in test-enhanced-features.html
"""

with open('/home/user/dabidoe/test-enhanced-features.html', 'r') as f:
    content = f.read()

print("Fixing critical errors...")

# ERROR 1: Fix hpFill null reference (we removed this element from stats tab)
# Add null checks for these elements
old_hp_code = '''      // Update HP
      const hpPercent = (currentCharacter.hp.current / currentCharacter.hp.max) * 100;
      document.getElementById('hpFill').style.width = hpPercent + '%';
      document.getElementById('hpText').textContent = `${currentCharacter.hp.current} / ${currentCharacter.hp.max}`;
      document.getElementById('hpCurrentEdit').textContent = currentCharacter.hp.current;
      document.getElementById('hpMaxEdit').textContent = currentCharacter.hp.max;'''

new_hp_code = '''      // Update HP (stats tab - may not exist if removed)
      const hpPercent = (currentCharacter.hp.current / currentCharacter.hp.max) * 100;
      const hpFillEl = document.getElementById('hpFill');
      const hpTextEl = document.getElementById('hpText');
      const hpCurrentEditEl = document.getElementById('hpCurrentEdit');
      const hpMaxEditEl = document.getElementById('hpMaxEdit');

      if (hpFillEl) hpFillEl.style.width = hpPercent + '%';
      if (hpTextEl) hpTextEl.textContent = `${currentCharacter.hp.current} / ${currentCharacter.hp.max}`;
      if (hpCurrentEditEl) hpCurrentEditEl.textContent = currentCharacter.hp.current;
      if (hpMaxEditEl) hpMaxEditEl.textContent = currentCharacter.hp.max;'''

content = content.replace(old_hp_code, new_hp_code)
print("✓ Fixed hpFill null reference error")

# ERROR 2: Move selectedCantrip declaration before it's used
# Find where it's currently declared (around line 3905)
old_cantrip_declaration = '    let selectedCantrip = null;'

# Remove it from its current location
content = content.replace(old_cantrip_declaration, '', 1)

# Add it at the top with other variable declarations
# Find the line with "let currentCharacter = characters[0];"
insert_marker = 'let currentCharacter = characters[0];'
insert_pos = content.find(insert_marker)

if insert_pos > 0:
    # Find the end of that line
    eol_pos = content.find('\n', insert_pos)
    # Insert the variable declaration after currentCharacter
    content = content[:eol_pos] + '\n    let selectedCantrip = null;' + content[eol_pos:]
    print("✓ Moved selectedCantrip declaration to top")
else:
    print("⚠ Could not find insertion point for selectedCantrip")

# Write the fixed content
with open('/home/user/dabidoe/test-enhanced-features.html', 'w') as f:
    f.write(content)

print("\n=== CRITICAL ERRORS FIXED ===")
print("1. hpFill null reference - added null checks")
print("2. selectedCantrip uninitialized - moved declaration to top")
print("\nReload the page and check console!")
