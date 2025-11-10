#!/usr/bin/env python3
"""
Comprehensive fixes for test-enhanced-features.html
"""

with open('/home/user/dabidoe/test-enhanced-features.html', 'r') as f:
    content = f.read()

print("Starting fixes...")

# 1. Remove Help button from battle mode
old_help_button = '''              <button class="action-btn" onclick="quickAction('help')">🤝 Help</button>'''
content = content.replace(old_help_button, '')
print("✓ Removed Help button from battle mode")

# 2. Add HP editor at top of battle mode
hp_editor_html = '''          <div id="battleMode" style="display: none;">
            <!-- HP Editor for Battle Mode -->
            <div style="background: var(--surface-color); border: 2px solid var(--border-color); border-radius: 8px; padding: 15px; margin-bottom: 15px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <strong style="color: var(--text-primary);">Hit Points</strong>
                <button onclick="editBattleHP()" style="padding: 6px 12px; background: var(--accent-color); border: none; border-radius: 6px; color: white; font-size: 0.85rem; cursor: pointer; font-weight: 600;">✏️ Edit HP</button>
              </div>
              <div class="hp-bar" style="height: 30px; margin-bottom: 10px;">
                <div class="hp-fill" id="battleHpFill" style="width: 85%"></div>
                <div class="hp-text" id="battleHpText" style="line-height: 30px;">58 / 68</div>
              </div>
            </div>

'''

# Replace the opening of battleMode
old_battle_start = '''          <!-- Battle Mode -->
          <div id="battleMode" style="display: none;">
            <div class="turn-tracker">'''

new_battle_start = '''          <!-- Battle Mode -->
''' + hp_editor_html + '''            <div class="turn-tracker">'''

content = content.replace(old_battle_start, new_battle_start)
print("✓ Added HP editor to battle mode")

# 3. Add editBattleHP function
edit_battle_hp_func = '''
    function editBattleHP() {
      const current = currentCharacter.hp.current;
      const max = currentCharacter.hp.max;

      const newCurrent = prompt(`Edit Current HP (max: ${max}):`, current);
      if (newCurrent === null) return; // Cancelled

      const newCurrentNum = parseInt(newCurrent);
      if (isNaN(newCurrentNum) || newCurrentNum < 0) {
        alert('Please enter a valid number');
        return;
      }

      // Update HP
      currentCharacter.hp.current = Math.min(newCurrentNum, max);
      updateCharacterDisplay();
      addBattleLog(`${currentCharacter.name}'s HP updated to ${currentCharacter.hp.current}/${max}`);
    }
'''

# Insert after editHeaderHP
insert_pos = content.find('    function changeLocation() {')
if insert_pos > 0:
    content = content[:insert_pos] + edit_battle_hp_func + '\n' + content[insert_pos:]
    print("✓ Added editBattleHP() function")

# 4. Fix spell display - ensure CSS exists for spell cards
spell_css_check = '.spell-card {'
if spell_css_check not in content:
    # Add spell card CSS before </style>
    spell_css = '''
    /* Spell Cards */
    .spell-level-section {
      margin-bottom: 20px;
    }

    .spell-level-header {
      font-size: 1rem;
      font-weight: 700;
      color: var(--accent-color);
      margin-bottom: 10px;
      padding-bottom: 5px;
      border-bottom: 2px solid var(--border-color);
    }

    .spell-card {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 15px;
      background: var(--surface-color);
      border: 2px solid var(--border-color);
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s ease;
      margin-bottom: 8px;
    }

    .spell-card:hover {
      border-color: var(--accent-color);
      background: var(--hover-color);
      transform: translateY(-1px);
    }

    .spell-card.prepared {
      border-color: var(--accent-color);
      background: linear-gradient(135deg, var(--surface-color) 0%, rgba(74, 144, 226, 0.1) 100%);
    }

    .spell-icon {
      font-size: 1.5rem;
      min-width: 30px;
      text-align: center;
    }

    .spell-name {
      flex: 1;
      font-weight: 500;
      color: var(--text-primary);
    }

    .spell-check {
      color: var(--accent-color);
      font-size: 1.2rem;
      font-weight: bold;
    }

'''
    style_end = content.find('  </style>')
    if style_end > 0:
        content = content[:style_end] + spell_css + content[style_end:]
        print("✓ Added spell card CSS")
else:
    print("✓ Spell card CSS already exists")

# 5. Update the updateCharacterDisplay function to update battle HP bar
# Find the HP update section and add battle HP update
old_hp_update = '''      // Update Header HP Bar
      const hpPercentage = (currentCharacter.hp.current / currentCharacter.hp.max) * 100;
      const headerHpFill = document.getElementById('headerHpFill');
      const headerHpText = document.getElementById('headerHpText');

      if (headerHpFill) {
        headerHpFill.style.width = `${hpPercentage}%`;'''

new_hp_update = '''      // Update Header HP Bar
      const hpPercentage = (currentCharacter.hp.current / currentCharacter.hp.max) * 100;
      const headerHpFill = document.getElementById('headerHpFill');
      const headerHpText = document.getElementById('headerHpText');

      if (headerHpFill) {
        headerHpFill.style.width = `${hpPercentage}%`;'''

# Then add battle HP update after
battle_hp_update = '''

      // Update Battle HP Bar
      const battleHpFill = document.getElementById('battleHpFill');
      const battleHpText = document.getElementById('battleHpText');
      if (battleHpFill) {
        battleHpFill.style.width = `${hpPercentage}%`;
        battleHpFill.classList.remove('high', 'medium', 'low');
        if (hpPercentage > 66) battleHpFill.classList.add('high');
        else if (hpPercentage > 33) battleHpFill.classList.add('medium');
        else battleHpFill.classList.add('low');
      }
      if (battleHpText) {
        battleHpText.textContent = `${currentCharacter.hp.current} / ${currentCharacter.hp.max}`;
      }'''

# Find where to insert this
header_hp_section = content.find('      // Update Header HP Bar')
if header_hp_section > 0:
    # Find the end of the header HP section (look for the closing brace of the if statement)
    next_section_start = content.find('      // Update portrait', header_hp_section)
    if next_section_start > 0:
        content = content[:next_section_start] + battle_hp_update + '\n' + content[next_section_start:]
        print("✓ Added battle HP bar update to updateCharacterDisplay()")

# Write the fixed content
with open('/home/user/dabidoe/test-enhanced-features.html', 'w') as f:
    f.write(content)

print("\n=== All fixes applied! ===")
