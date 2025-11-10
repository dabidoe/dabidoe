#!/usr/bin/env python3
"""
Add more debugging for character menu
"""

with open('/home/user/dabidoe/test-enhanced-features.html', 'r') as f:
    content = f.read()

print("Adding character menu debugging...")

# Find populateCharacterMenu and enhance it
old_populate = '''    function populateCharacterMenu() {
      const list = document.getElementById('characterList');
      console.log('Populating character menu with', characters.length, 'characters');
      if (!list) {
        console.error('characterList element not found!');
        return;
      }
      list.innerHTML = characters.map((char, index) => `'''

new_populate = '''    function populateCharacterMenu() {
      const list = document.getElementById('characterList');
      console.log('=== POPULATING CHARACTER MENU ===');
      console.log('Characters array length:', characters.length);
      console.log('Characters:', characters.map(c => c.name));

      if (!list) {
        console.error('ERROR: characterList element not found!');
        return;
      }

      console.log('characterList element found');

      const html = characters.map((char, index) => `'''

content = content.replace(old_populate, new_populate)

# Also need to close the map and log the HTML
old_join = '''      `).join('');
    }'''

new_join = '''      `).join('');

      console.log('Generated HTML length:', html.length);
      console.log('First 200 chars:', html.substring(0, 200));
      list.innerHTML = html;
      console.log('Character menu populated successfully');
      console.log('=================================');
    }'''

content = content.replace(old_join, new_join)

print("✓ Enhanced populateCharacterMenu debugging")

# Write the fixed content
with open('/home/user/dabidoe/test-enhanced-features.html', 'w') as f:
    f.write(content)

print("\n=== CHARACTER MENU DEBUGGING ENHANCED ===")
print("Now reload and check console for detailed menu debugging")
