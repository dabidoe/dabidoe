#!/usr/bin/env python3
"""
Fix: Hide cantrip button for classes that don't have cantrips (Paladin, Ranger, etc.)
"""

# Read the file
with open('test-enhanced-features.html', 'r') as f:
    content = f.read()

# ============================================================================
# PART 1: Update updateCantripButton to hide button for non-cantrip classes
# ============================================================================

old_update_cantrip = '''    function updateCantripButton() {
      const cantripBtn = document.querySelector('.action-btn[onclick="castCantrip()"]');
      if (!cantripBtn) return;

      if (selectedCantrip) {
        cantripBtn.textContent = `${selectedCantrip.icon || '✨'} ${selectedCantrip.name}`;
      } else {
        cantripBtn.textContent = '✨ Cantrip';
      }
    }'''

new_update_cantrip = '''    function updateCantripButton() {
      const cantripBtn = document.querySelector('.action-btn[onclick="castCantrip()"]');
      if (!cantripBtn) return;

      // Classes that get cantrips
      const cantripClasses = ['bard', 'cleric', 'druid', 'sorcerer', 'warlock', 'wizard'];
      const charClass = currentCharacter.class.toLowerCase();

      // Hide button for classes without cantrips
      if (!cantripClasses.includes(charClass)) {
        cantripBtn.style.display = 'none';
        return;
      }

      // Show button for cantrip classes
      cantripBtn.style.display = '';

      if (selectedCantrip) {
        cantripBtn.textContent = `${selectedCantrip.icon || '✨'} ${selectedCantrip.name}`;
      } else {
        cantripBtn.textContent = '✨ Cantrip';
      }
    }'''

if old_update_cantrip in content:
    content = content.replace(old_update_cantrip, new_update_cantrip)
    print("✅ Updated updateCantripButton to hide button for non-cantrip classes")
else:
    print("⚠️ Could not find updateCantripButton function")

# ============================================================================
# PART 2: Update auto-select cantrip logic to only run for cantrip classes
# ============================================================================

old_auto_select = '''      // Auto-select first cantrip for battle mode
      if (currentCharacter.spells && currentCharacter.spells['0'] && currentCharacter.spells['0'].length > 0) {
        selectedCantrip = currentCharacter.spells['0'][0];
        updateCantripButton();
      } else {
        selectedCantrip = null;
        updateCantripButton();
      }'''

new_auto_select = '''      // Auto-select first cantrip for battle mode (only for cantrip classes)
      const cantripClasses = ['bard', 'cleric', 'druid', 'sorcerer', 'warlock', 'wizard'];
      const charClass = currentCharacter.class.toLowerCase();

      if (cantripClasses.includes(charClass)) {
        if (currentCharacter.spells && currentCharacter.spells['0'] && currentCharacter.spells['0'].length > 0) {
          selectedCantrip = currentCharacter.spells['0'][0];
          updateCantripButton();
        } else {
          selectedCantrip = null;
          updateCantripButton();
        }
      } else {
        // Non-cantrip class - hide button
        selectedCantrip = null;
        updateCantripButton();
      }'''

if old_auto_select in content:
    content = content.replace(old_auto_select, new_auto_select)
    print("✅ Updated auto-select logic to only run for cantrip classes")
else:
    print("⚠️ Could not find auto-select cantrip logic")

# Write the file
with open('test-enhanced-features.html', 'w') as f:
    f.write(content)

print("\n🎉 Complete!")
print("Cantrip button will now hide for Paladin, Ranger, and other non-cantrip classes")
print("Only Bard, Cleric, Druid, Sorcerer, Warlock, and Wizard will see the cantrip button")
