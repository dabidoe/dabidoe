#!/usr/bin/env python3
"""
Add classes property to main spell fetch (not just fallback)
"""

# Read the file
with open('test-enhanced-features.html', 'r') as f:
    content = f.read()

# Find the main spell mapping from successful fetch
main_map_pos = content.find('allSpellsFromAPI = spells.map(spell => ({')
if main_map_pos != -1:
    # Find the dc line
    dc_line = content.find('dc: extractSaveFromDescription(spell.description)', main_map_pos)

    if dc_line != -1:
        # Check if classes already exists
        map_end = content.find('}));', dc_line)

        if 'classes:' not in content[main_map_pos:map_end]:
            # Add classes after dc line
            line_end = content.find('\n', dc_line)

            classes_line = ',\n          classes: spell.classes || []'

            content = content[:line_end] + classes_line + content[line_end:]
            print("✅ Added classes to main spell mapping from server")
        else:
            print("ℹ️  Classes already in main spell mapping")

# Write the file
with open('test-enhanced-features.html', 'w') as f:
    f.write(content)

print("\n✅ Spell class filter should now work with full database!")
