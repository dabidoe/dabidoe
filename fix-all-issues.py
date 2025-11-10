#!/usr/bin/env python3
"""
Fix all three issues:
1. Add null check to updateAbilities
2. Debug and fix character menu
3. Fix class filter to work with spell data
"""

# Read the file
with open('test-enhanced-features.html', 'r') as f:
    content = f.read()

# FIX 1: Add null check to updateAbilities
update_abilities_pos = content.find('    function updateAbilities() {')
if update_abilities_pos != -1:
    # Find the line that gets abilitiesGrid
    abilities_grid_line = content.find('const abilitiesGrid = document.getElementById', update_abilities_pos)
    if abilities_grid_line != -1:
        next_line = content.find('\n', abilities_grid_line) + 1

        # Add null check
        null_check = '''      if (!abilitiesGrid) return; // Element doesn't exist in current view

'''

        if '!abilitiesGrid' not in content[abilities_grid_line:abilities_grid_line+200]:
            content = content[:next_line] + null_check + content[next_line:]
            print("✅ Added null check to updateAbilities()")

# FIX 2: Debug character menu - add more detailed logging
populate_menu_pos = content.find('function populateCharacterMenu() {')
if populate_menu_pos != -1:
    # Find where we set list.innerHTML
    list_inner = content.find('list.innerHTML = html;', populate_menu_pos)
    if list_inner != -1:
        next_line = content.find('\n', list_inner) + 1

        # Add debugging after setting innerHTML
        debug_code = '''
      // Debug: Check if innerHTML was actually set
      console.log('After setting innerHTML, list.innerHTML length:', list.innerHTML.length);
      console.log('list element:', list);
      console.log('list children count:', list.children.length);
'''

        if 'After setting innerHTML' not in content:
            content = content[:next_line] + debug_code + content[next_line:]
            print("✅ Added character menu debugging")

# FIX 3: Fix class filter - the issue is that the full spell database has 'classes' as array,
# but we need to ensure it's always checked correctly
# Find the filterPickerSpells function and ensure classes check is correct
filter_picker_pos = content.find('const matchesClass = currentClassFilter')
if filter_picker_pos != -1:
    # Find the whole matchesClass line
    line_end = content.find(';', filter_picker_pos)
    old_matches_class = content[filter_picker_pos:line_end]

    # More robust class matching
    new_matches_class = '''const matchesClass = currentClassFilter === 'all' ||
                            (spell.classes && Array.isArray(spell.classes) &&
                             spell.classes.some(c => typeof c === 'string' && c.toLowerCase() === currentClassFilter))'''

    if 'Array.isArray(spell.classes)' not in content:
        content = content[:filter_picker_pos] + new_matches_class + content[line_end:]
        print("✅ Fixed class filter matching logic")

# Also ensure the main spell fetch properly includes classes
fetch_pos = content.find("allSpellsFromAPI = spells.map")
if fetch_pos != -1:
    # Find if classes is included
    map_end = content.find('});', fetch_pos)
    if 'classes:' not in content[fetch_pos:map_end]:
        # Find the line before the closing
        before_close = content.rfind('\n', fetch_pos, map_end)
        content = content[:before_close] + ',\n          classes: spell.classes || []' + content[before_close:]
        print("✅ Added classes to main spell mapping")

# Write the file
with open('test-enhanced-features.html', 'w') as f:
    f.write(content)

print("\n🎉 All fixes applied!")
print("\nFixed issues:")
print("  1. updateAbilities null error - added element check")
print("  2. Character menu - enhanced debugging")
print("  3. Class filter - fixed array matching logic")
