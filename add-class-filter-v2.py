#!/usr/bin/env python3
"""
Fix character menu display and add class filter to spell picker
"""

# Read the file
with open('test-enhanced-features.html', 'r') as f:
    content = f.read()

# PART 1: Add class filter variable near other spell picker variables
if "let currentClassFilter = 'all';" not in content:
    old_vars = "    let currentLevelFilter = 'all';"
    new_vars = "    let currentLevelFilter = 'all';\n    let currentClassFilter = 'all';"
    content = content.replace(old_vars, new_vars)
    print("✅ Added currentClassFilter variable")

# PART 2: Add class filter dropdown HTML
search_input_pos = content.find('<input type="text" id="spellPickerSearch"')
if search_input_pos != -1:
    # Find the closing div
    closing_div = content.find('</div>', search_input_pos)
    closing_div = content.find('</div>', closing_div + 1) + 6

    # Insert class filter dropdown after search div
    class_dropdown = '''
        <div style="padding: 10px 15px 0 15px;">
          <select id="spellClassFilter" onchange="filterByClass(this.value)" style="width: 100%; padding: 8px; background: var(--background-color); color: var(--text-primary); border: 2px solid var(--border-color); border-radius: 6px; font-size: 0.9rem;">
            <option value="all">All Classes</option>
            <option value="bard">Bard</option>
            <option value="cleric">Cleric</option>
            <option value="druid">Druid</option>
            <option value="paladin">Paladin</option>
            <option value="ranger">Ranger</option>
            <option value="sorcerer">Sorcerer</option>
            <option value="warlock">Warlock</option>
            <option value="wizard">Wizard</option>
          </select>
        </div>
'''

    if 'id="spellClassFilter"' not in content:
        content = content[:closing_div] + class_dropdown + content[closing_div:]
        print("✅ Added class filter dropdown to spell picker")

# PART 3: Add filterByClass function
if 'function filterByClass(' not in content:
    filter_picker_pos = content.find('    function filterPickerSpells() {')

    new_function = '''    function filterByClass(classFilter) {
      currentClassFilter = classFilter;
      filterPickerSpells();
    }

    '''

    content = content[:filter_picker_pos] + new_function + content[filter_picker_pos:]
    print("✅ Added filterByClass() function")

# PART 4: Update filterPickerSpells to include class filtering
old_filter_function = content.find('    function filterPickerSpells() {')
if old_filter_function != -1:
    filter_end = content.find('      renderPickerSpells(filteredSpells);', old_filter_function)

    if filter_end != -1:
        # Replace the filter logic
        new_filter_logic = '''    function filterPickerSpells() {
      const searchTerm = document.getElementById('spellPickerSearch').value.toLowerCase();

      filteredSpells = allSpellsFromAPI.filter(spell => {
        const matchesSearch = spell.name.toLowerCase().includes(searchTerm) ||
                            (spell.school?.name || '').toLowerCase().includes(searchTerm);
        const matchesLevel = currentLevelFilter === 'all' || spell.level === parseInt(currentLevelFilter);
        const matchesClass = currentClassFilter === 'all' ||
                            (spell.classes && spell.classes.some(c => c.toLowerCase() === currentClassFilter));

        return matchesSearch && matchesLevel && matchesClass;
      });

      '''

        if 'matchesClass' not in content:
            content = content[:old_filter_function] + new_filter_logic + content[filter_end:]
            print("✅ Updated filterPickerSpells() to include class filtering")

# PART 5: Update closeSpellPicker to reset class filter
close_picker_pos = content.find("document.getElementById('spellPickerSearch').value = '';", content.find('function closeSpellPicker'))
if close_picker_pos != -1 and "spellClassFilter" not in content[close_picker_pos:close_picker_pos+500]:
    next_line_pos = content.find('\n', close_picker_pos) + 1
    class_reset = "      document.getElementById('spellClassFilter').value = 'all';\n      currentClassFilter = 'all';\n"
    content = content[:next_line_pos] + class_reset + content[next_line_pos:]
    print("✅ Updated closeSpellPicker() to reset class filter")

# PART 6: Update spell mapping to include classes
fallback_map_pos = content.find('allSpellsFromAPI = fallbackSpells.map(spell => ({')
if fallback_map_pos != -1:
    # Find ritual line and add classes after it
    ritual_line = content.find('ritual: spell.ritual', fallback_map_pos)
    if ritual_line != -1 and 'classes: spell.classes' not in content[fallback_map_pos:fallback_map_pos+1000]:
        next_newline = content.find('\n', ritual_line)
        content = content[:next_newline] + ',\n          classes: spell.classes || []' + content[next_newline:]
        print("✅ Updated spell mapping to include classes array")

# Write the file
with open('test-enhanced-features.html', 'w') as f:
    f.write(content)

print("\n🎉 All changes applied successfully!")
print("\nFeatures added:")
print("  - Class filter dropdown in spell picker")
print("  - Filter spells by D&D class (Bard, Cleric, Druid, etc.)")
print("  - Combines with existing level and search filters")
