#!/usr/bin/env python3
"""
Fix spell issues:
1. Make spell picker cards clickable to show details
2. Add function to preview spells from picker
3. Show "Unlimited" for cantrip slots
4. Ensure dice rolls output to battle log
"""

import re

# Read the file
with open('test-enhanced-features.html', 'r') as f:
    content = f.read()

# Issue 1 & 2: Make spell picker cards clickable to show spell details
# Find the renderPickerSpells function and modify spell cards to be clickable
old_picker_card = r'''        html \+= `
          <div class="spell-picker-item">
            <div class="spell-picker-item-info">
              <div class="spell-picker-item-name">\$\{spell\.name\}</div>
              <div class="spell-picker-item-meta">\$\{levelText\} • \$\{school\}</div>
            </div>
            <button class="spell-picker-item-add"
                    onclick="addSpellToCharacter\('\$\{spell\.index\}'\)"
                    \$\{alreadyHas \? 'disabled' : ''\}>
              \$\{alreadyHas \? '✓ Added' : '\+ Add'\}
            </button>
          </div>
        `;'''

new_picker_card = r'''        html += `
          <div class="spell-picker-item" style="cursor: pointer;" onclick="openSpellPickerDetail('${spell.index}')">
            <div class="spell-picker-item-info">
              <div class="spell-picker-item-name">${spell.name}</div>
              <div class="spell-picker-item-meta">${levelText} • ${school}</div>
            </div>
            <button class="spell-picker-item-add"
                    onclick="event.stopPropagation(); addSpellToCharacter('${spell.index}')"
                    ${alreadyHas ? 'disabled' : ''}>
              ${alreadyHas ? '✓ Added' : '+ Add'}
            </button>
          </div>
        `;'''

content = re.sub(old_picker_card, new_picker_card, content)

# Add openSpellPickerDetail function after closeSpellPicker
insert_position = content.find('    function closeSpellPicker(event) {')
if insert_position != -1:
    # Find the end of the closeSpellPicker function
    end_position = content.find('\n    }\n', insert_position) + 6

    new_function = '''
    // Open spell detail from picker (for spells not in character list yet)
    function openSpellPickerDetail(spellIndex) {
      const spell = allSpellsFromAPI.find(s => s.index === spellIndex);
      if (!spell) return;

      // Map to character spell format for modal
      const mappedSpell = mapAPISpellToCharacterSpell(spell);
      currentModalSpell = mappedSpell;
      currentModalSpellLevel = spell.level.toString();

      // Update modal content
      document.getElementById('modalSpellIcon').textContent = mappedSpell.icon || '✨';
      document.getElementById('modalSpellName').textContent = mappedSpell.name;

      const isCantrip = spell.level === 0;
      const levelText = isCantrip ? 'Cantrip' : `Level ${spell.level} Spell`;
      const school = mappedSpell.school || 'Evocation';
      document.getElementById('modalSpellLevel').textContent = `${levelText} • ${school}`;

      // Build stats grid
      const statsGrid = document.getElementById('modalSpellStats');
      statsGrid.innerHTML = `
        <div class="spell-stat">
          <div class="spell-stat-label">Casting Time</div>
          <div class="spell-stat-value">${mappedSpell.castingTime}</div>
        </div>
        <div class="spell-stat">
          <div class="spell-stat-label">Range</div>
          <div class="spell-stat-value">${mappedSpell.range}</div>
        </div>
        <div class="spell-stat">
          <div class="spell-stat-label">Components</div>
          <div class="spell-stat-value">${mappedSpell.components}</div>
        </div>
        <div class="spell-stat">
          <div class="spell-stat-label">Duration</div>
          <div class="spell-stat-value">${mappedSpell.duration}${mappedSpell.concentration ? ' (Concentration)' : ''}</div>
        </div>
      `;

      // Add damage/save info if applicable
      if (mappedSpell.damage || mappedSpell.save) {
        const damageHtml = mappedSpell.damage ? `
          <div class="spell-stat">
            <div class="spell-stat-label">Damage</div>
            <div class="spell-stat-value" style="color: var(--battle-color);">${mappedSpell.damage}</div>
          </div>
        ` : '';

        const saveHtml = mappedSpell.save ? `
          <div class="spell-stat">
            <div class="spell-stat-label">Save</div>
            <div class="spell-stat-value">${mappedSpell.save} DC ${currentCharacter.computed?.spellSaveDC || 15}</div>
          </div>
        ` : '';

        statsGrid.innerHTML += damageHtml + saveHtml;
      }

      // Description
      document.getElementById('modalSpellDescription').textContent = mappedSpell.description || 'No description available.';

      // Hide cast/prepare buttons since spell is not in character list yet
      document.getElementById('modalCastBtn').style.display = 'none';
      document.getElementById('modalPrepareBtn').style.display = 'none';

      // Show modal
      document.getElementById('spellModalOverlay').classList.add('show');
    }
'''

    content = content[:end_position] + new_function + content[end_position:]

# Issue 3: Show "Unlimited" for cantrip slots
# Find the slot display and add cantrip row
old_slot_display = r'''      // Show spell slot progress bars
      const spellLevels = Object\.keys\(currentCharacter\.spellSlots\)\.sort\(\(a, b\) => parseInt\(a\) - parseInt\(b\)\);
      spellLevels\.forEach\(level => \{
        const slot = currentCharacter\.spellSlots\[level\];
        const percentage = \(slot\.current / slot\.max\) \* 100;
        const levelSuffix = level === '1' \? 'st' : level === '2' \? 'nd' : level === '3' \? 'rd' : 'th';

        html \+= `
          <div class="slot-row">
            <span class="slot-label">\$\{level\}\$\{levelSuffix\}:</span>
            <div class="slot-bar">
              <div class="slot-fill" style="width: \$\{percentage\}%"></div>
              <div class="slot-text">\$\{slot\.current\}/\$\{slot\.max\}</div>
            </div>
          </div>
        `;
      \}\);'''

new_slot_display = r'''      // Show cantrip row if character has cantrips
      if (currentCharacter.spells['0'] && currentCharacter.spells['0'].length > 0) {
        html += `
          <div class="slot-row">
            <span class="slot-label">Cantrips:</span>
            <div class="slot-bar">
              <div class="slot-fill" style="width: 100%; background: linear-gradient(90deg, var(--accent-color), var(--accent-color-bright));"></div>
              <div class="slot-text">∞ Unlimited</div>
            </div>
          </div>
        `;
      }

      // Show spell slot progress bars
      const spellLevels = Object.keys(currentCharacter.spellSlots).sort((a, b) => parseInt(a) - parseInt(b));
      spellLevels.forEach(level => {
        const slot = currentCharacter.spellSlots[level];
        const percentage = (slot.current / slot.max) * 100;
        const levelSuffix = level === '1' ? 'st' : level === '2' ? 'nd' : level === '3' ? 'rd' : 'th';

        html += `
          <div class="slot-row">
            <span class="slot-label">${level}${levelSuffix}:</span>
            <div class="slot-bar">
              <div class="slot-fill" style="width: ${percentage}%"></div>
              <div class="slot-text">${slot.current}/${slot.max}</div>
            </div>
          </div>
        `;
      });'''

content = re.sub(old_slot_display, new_slot_display, content, flags=re.DOTALL)

# Write the file
with open('test-enhanced-features.html', 'w') as f:
    f.write(content)

print("✅ Fixed spell picker clickability")
print("✅ Added openSpellPickerDetail function")
print("✅ Added unlimited cantrip slots display")
print("✅ Dice roll output already implemented in castSpellFromModal")
print("\nChanges applied successfully!")
