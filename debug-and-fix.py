#!/usr/bin/env python3
"""
Fix character menu and spell display
"""

with open('/home/user/dabidoe/test-enhanced-features.html', 'r') as f:
    content = f.read()

print("Fixing character menu and spells...")

# 1. Add debugging to populateCharacterMenu
old_populate = '''    function populateCharacterMenu() {
      const list = document.getElementById('characterList');
      list.innerHTML = characters.map((char, index) => `'''

new_populate = '''    function populateCharacterMenu() {
      const list = document.getElementById('characterList');
      console.log('Populating character menu with', characters.length, 'characters');
      if (!list) {
        console.error('characterList element not found!');
        return;
      }
      list.innerHTML = characters.map((char, index) => `'''

content = content.replace(old_populate, new_populate)
print("✓ Added debug logging to populateCharacterMenu")

# 2. Add debugging to updateSpellsTab to see what's happening
old_spells_debug = '''      // Debug: log spells
      console.log('Rendering spells for', currentCharacter.name, currentCharacter.spells);'''

new_spells_debug = '''      // Debug: log spells
      console.log('=== SPELL DEBUG ===');
      console.log('Character:', currentCharacter.name);
      console.log('Has spells object:', !!currentCharacter.spells);
      console.log('Spell keys:', Object.keys(currentCharacter.spells || {}));
      console.log('Spells:', currentCharacter.spells);
      console.log('===================');'''

content = content.replace(old_spells_debug, new_spells_debug)
print("✓ Enhanced spell debugging")

# 3. Add a manual test button to check if JS is working at all
# Find the initialization section and add a console log
old_init = '''    // Initialize
    updateCharacterDisplay();
    populateCharacterMenu();
    updateSpellsTab();
    updateAbilitiesTab();'''

new_init = '''    // Initialize
    console.log('=== INITIALIZING PAGE ===');
    console.log('Total characters:', characters.length);
    console.log('Current character:', currentCharacter.name);
    console.log('Current character has spells:', !!currentCharacter.spells);
    updateCharacterDisplay();
    populateCharacterMenu();
    updateSpellsTab();
    updateAbilitiesTab();
    console.log('=== INITIALIZATION COMPLETE ===');'''

content = content.replace(old_init, new_init)
print("✓ Added initialization debugging")

# 4. Verify selectCharacterFromMenu updates spells
old_select = '''    function selectCharacterFromMenu(index) {
      // Validate index
      if (index < 0 || index >= characters.length) {
        console.error('Invalid character index:', index);
        return;
      }

      // Update current character
      currentCharacter = characters[index];
      currentState = 'default';
      turnNumber = 1;

      // Update all displays
      updateCharacterDisplay();
      updateMessages();'''

new_select = '''    function selectCharacterFromMenu(index) {
      // Validate index
      if (index < 0 || index >= characters.length) {
        console.error('Invalid character index:', index);
        return;
      }

      console.log('Switching to character:', characters[index].name);

      // Update current character
      currentCharacter = characters[index];
      currentState = 'default';
      turnNumber = 1;

      // Update all displays
      updateCharacterDisplay();
      updateMessages();

      // IMPORTANT: Update spells and abilities tabs
      updateSpellsTab();
      updateAbilitiesTab();

      console.log('Character switched successfully');'''

content = content.replace(old_select, new_select)
print("✓ Added spell/ability refresh on character switch")

# Write the fixed content
with open('/home/user/dabidoe/test-enhanced-features.html', 'w') as f:
    f.write(content)

print("\n=== Fixes applied! ===")
print("Now check browser console for debug messages")
