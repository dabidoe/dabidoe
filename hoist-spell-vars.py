#!/usr/bin/env python3
"""
Fix all uninitialized spell variables
"""

with open('/home/user/dabidoe/test-enhanced-features.html', 'r') as f:
    content = f.read()

print("Fixing uninitialized spell variables...")

# Find and remove these variable declarations from their current locations
variables_to_move = [
    ('let currentModalSpell = null;', 3130),
    ('let currentModalSpellLevel = null;', 3131),
    ('let allSpellsFromAPI = [];', 3309),
    ('let filteredSpells = [];', 3310),
    ("let currentLevelFilter = 'all';", 3311),
]

# Remove them from their current locations
for var_decl, _ in variables_to_move:
    # Remove including any surrounding whitespace/newlines
    content = content.replace(f'    {var_decl}', '', 1)
    print(f"✓ Removed: {var_decl}")

# Also remove the comment before allSpellsFromAPI
content = content.replace('    // Spell picker state\n', '', 1)

# Add all variables at the top with other declarations
insert_marker = 'let selectedCantrip = null;'
insert_pos = content.find(insert_marker)

if insert_pos > 0:
    eol_pos = content.find('\n', insert_pos)

    # Build the variables to insert
    vars_to_insert = '''
    // Spell modal state
    let currentModalSpell = null;
    let currentModalSpellLevel = null;
    // Spell picker state
    let allSpellsFromAPI = [];
    let filteredSpells = [];
    let currentLevelFilter = 'all';'''

    content = content[:eol_pos] + vars_to_insert + content[eol_pos:]
    print("✓ Added all spell variables at top")
else:
    print("⚠ Could not find insertion point")

# Write the fixed content
with open('/home/user/dabidoe/test-enhanced-features.html', 'w') as f:
    f.write(content)

print("\n=== SPELL VARIABLES HOISTED ===")
print("All spell-related variables now declared at top")
print("This should fix all 5 'uninitialized variable' errors")
