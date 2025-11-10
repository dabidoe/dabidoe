#!/usr/bin/env python3
"""
Fix cantrip system:
1. Auto-select first cantrip when character loads
2. Update battle button to show selected cantrip name
3. Change slot display to show "Unlimited" for cantrips
"""

# Read the file
with open('test-enhanced-features.html', 'r') as f:
    content = f.read()

# FIX 1: Auto-select first cantrip in updateCharacterDisplay
update_char_display = content.find('function updateCharacterDisplay() {')
if update_char_display != -1:
    # Find the end of the function (look for next function definition)
    func_end = content.find('\n      updateSkillsDisplay();', update_char_display)

    if func_end != -1:
        # Add auto-select logic before updateSkillsDisplay
        auto_select_code = '''
      // Auto-select first cantrip for battle mode
      if (currentCharacter.spells && currentCharacter.spells['0'] && currentCharacter.spells['0'].length > 0) {
        selectedCantrip = currentCharacter.spells['0'][0];
        updateCantripButton();
      } else {
        selectedCantrip = null;
        updateCantripButton();
      }
'''

        if 'Auto-select first cantrip' not in content:
            content = content[:func_end] + auto_select_code + content[func_end:]
            print("✅ Added auto-select first cantrip logic")

# FIX 2: Add updateCantripButton function
cast_cantrip_func = content.find('    function castCantrip() {')
if cast_cantrip_func != -1 and 'function updateCantripButton()' not in content:
    # Add function before castCantrip
    update_button_func = '''    function updateCantripButton() {
      const cantripBtn = document.querySelector('.action-btn[onclick="castCantrip()"]');
      if (!cantripBtn) return;

      if (selectedCantrip) {
        cantripBtn.textContent = `${selectedCantrip.icon || '✨'} ${selectedCantrip.name}`;
      } else {
        cantripBtn.textContent = '✨ Cantrip';
      }
    }

    '''

    content = content[:cast_cantrip_func] + update_button_func + content[cast_cantrip_func:]
    print("✅ Added updateCantripButton() function")

# FIX 3: Update openSpellDetail to show "Unlimited" for cantrips in modal
# Find the Cast button text for cantrips
cast_cantrip_text = content.find("castBtn.textContent = '✨ Cast Cantrip';")
if cast_cantrip_text != -1:
    # Replace with better text
    old_text = "castBtn.textContent = '✨ Cast Cantrip';"
    new_text = "castBtn.textContent = '✨ Cast (∞ Unlimited)';"

    content = content.replace(old_text, new_text, 1)
    print("✅ Changed cantrip button to show 'Unlimited'")

# FIX 4: Update castCantrip to also update button after casting
cast_cantrip_end = content.find('    function castCantrip() {')
if cast_cantrip_end != -1:
    # Find where we add battle log for successful cast
    battle_log_pos = content.find('addBattleLog(`${spellIcon} ${currentCharacter.name} casts ${spellName}!`);', cast_cantrip_end)

    if battle_log_pos != -1:
        # Just after this line, we're good - the rest of the function handles the casting
        pass  # Function already handles casting properly

# FIX 5: Add ability to click cantrip in spell tab to select it for battle
# Find where spell cards are rendered in updateSpellsTab
update_spells_tab = content.find('function updateSpellsTab() {')
if update_spells_tab != -1:
    # Find where cantrip cards are rendered
    cantrip_card = content.find('onclick="openSpellDetail', update_spells_tab)

    if cantrip_card != -1:
        # We need to add a way to select cantrips for battle
        # Let's add a function to handle cantrip selection
        select_cantrip_func_pos = content.find('    function updateCantripButton()')

        if select_cantrip_func_pos != -1:
            # Add selectCantripForBattle function after updateCantripButton
            func_end = content.find('\n    }', select_cantrip_func_pos) + 6

            new_func = '''
    function selectCantripForBattle(spellId) {
      const cantrip = currentCharacter.spells['0']?.find(s => s.id === spellId);
      if (cantrip) {
        selectedCantrip = cantrip;
        updateCantripButton();
        addBattleLog(`✨ Equipped ${cantrip.name} for battle!`);
        updateSpellsTab(); // Refresh to show selection
      }
    }
'''

            if 'function selectCantripForBattle' not in content:
                content = content[:func_end] + new_func + content[func_end:]
                print("✅ Added selectCantripForBattle() function")

# Write the file
with open('test-enhanced-features.html', 'w') as f:
    f.write(content)

print("\n🎉 Cantrip system improvements applied!")
print("\nChanges:")
print("  1. Auto-selects first cantrip on character load")
print("  2. Battle button shows selected cantrip name")
print("  3. Cast button shows '∞ Unlimited' for cantrips")
print("  4. Added function to select different cantrip for battle")
