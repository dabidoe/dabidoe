#!/usr/bin/env python3
"""
Fix z-index layering so spell detail modal appears above spell picker modal
"""

import re

# Read the file
with open('test-enhanced-features.html', 'r') as f:
    content = f.read()

# Add new CSS class for spell picker overlay with lower z-index
css_insert_position = content.find('    /* Spell detail modal */')

new_picker_css = '''    /* Spell picker modal - lower z-index so detail modal appears on top */
    .spell-picker-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.85);
      z-index: 9000;
      display: none;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }

    .spell-picker-overlay.show {
      display: flex;
    }

    '''

content = content[:css_insert_position] + new_picker_css + content[css_insert_position:]

# Update the spell detail modal z-index to be higher than picker
old_detail_modal_z = 'z-index: 10000;'
new_detail_modal_z = 'z-index: 10100;'

content = content.replace(
    '    .spell-modal-overlay {\n      position: fixed;\n      top: 0;\n      left: 0;\n      right: 0;\n      bottom: 0;\n      background: rgba(0, 0, 0, 0.85);\n      z-index: 10000;',
    '    .spell-modal-overlay {\n      position: fixed;\n      top: 0;\n      left: 0;\n      right: 0;\n      bottom: 0;\n      background: rgba(0, 0, 0, 0.85);\n      z-index: 10100;'
)

# Update the HTML to use spell-picker-overlay class
old_picker_html = '<div class="spell-modal-overlay" id="spellPickerOverlay" onclick="closeSpellPicker(event)">'
new_picker_html = '<div class="spell-picker-overlay" id="spellPickerOverlay" onclick="closeSpellPicker(event)">'

content = content.replace(old_picker_html, new_picker_html)

# Write the file
with open('test-enhanced-features.html', 'w') as f:
    f.write(content)

print("✅ Created spell-picker-overlay class with z-index: 9000")
print("✅ Updated spell-modal-overlay (detail modal) to z-index: 10100")
print("✅ Spell detail modal will now appear on top of spell picker!")
