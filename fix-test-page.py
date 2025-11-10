#!/usr/bin/env python3
"""
Fix issues in test-enhanced-features.html
"""

with open('/home/user/dabidoe/test-enhanced-features.html', 'r') as f:
    content = f.read()

# 1. Add text-overflow and word-wrap handling for spell and character names
# Find the .spell-name style (or add it)
spell_name_css = """    .spell-name {
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
"""

# 2. Add word-wrap for character names
character_name_css = """    .character-item-name {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
"""

# 3. Add initialization for updateSpellsTab and updateAbilitiesTab on load
init_fix = """    // Initialize
    updateCharacterDisplay();
    populateCharacterMenu();
    updateSpellsTab();
    updateAbilitiesTab();"""

content = content.replace(
    """    // Initialize
    updateCharacterDisplay();
    populateCharacterMenu();""",
    init_fix
)

# 4. Add CSS for overflow text protection before the closing </style> tag
# Find a good place to insert - right before </style>
style_end_pos = content.find('  </style>')
if style_end_pos > 0:
    # Insert our CSS fixes
    additional_css = """
    /* Text overflow fixes */
    .spell-card {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px;
      background: var(--surface-color);
      border: 2px solid var(--border-color);
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s ease;
      margin-bottom: 8px;
      overflow: hidden;
    }

    .spell-name {
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .character-item-name {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      max-width: 150px;
    }

    .modal-spell-name, .spell-modal-name {
      word-wrap: break-word;
      overflow-wrap: break-word;
    }

    /* Ensure tabs don't overflow */
    .stat-tabs {
      flex-wrap: wrap;
    }

"""
    content = content[:style_end_pos] + additional_css + content[style_end_pos:]

# Write the fixed content
with open('/home/user/dabidoe/test-enhanced-features.html', 'w') as f:
    f.write(content)

print("Fixed test-enhanced-features.html:")
print("✓ Added text overflow protection")
print("✓ Added initialization for spell and ability tabs")
print("✓ Fixed CSS for character and spell names")
