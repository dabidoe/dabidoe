#!/usr/bin/env python3
"""
Fix character menu display and add class filter to spell picker
"""

import re

# Read the file
with open('test-enhanced-features.html', 'r') as f:
    content = f.read()

# PART 1: Fix character menu - ensure it has spells: false for rogue
# Check if rogue character has spells defined
if '"spells": {' not in content[content.find("id: 'theron'"):content.find('}\\n    ];')]:
    print("⚠️  Rogue character missing spells object - this might cause issues")

# PART 2: Add class filter to spell picker
# Find the spell picker filters section and add class dropdown after search
old_picker_header = r'''        <div class="spell-picker-search">
          <input type="text" id="spellPickerSearch" placeholder="Search spells\.\.\." oninput="filterPickerSpells\(\)">
        </div>

        <div class="spell-picker-filters">'''

new_picker_header = r'''        <div class="spell-picker-search">
          <input type="text" id="spellPickerSearch" placeholder="Search spells..." oninput="filterPickerSpells()">
        </div>

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

        <div class="spell-picker-filters">'''

content = re.sub(old_picker_header, new_picker_header, content, flags=re.DOTALL)

# Add class filter variable near other spell picker variables
old_vars = "    let currentLevelFilter = 'all';"
new_vars = "    let currentLevelFilter = 'all';\n    let currentClassFilter = 'all';"
content = content.replace(old_vars, new_vars)

# Add filterByClass function after filterByLevel
filter_by_level_end = content.find('    function filterPickerSpells() {')

new_filter_by_class = '''    function filterByClass(classFilter) {
      currentClassFilter = classFilter;
      filterPickerSpells();
    }

    '''

content = content[:filter_by_level_end] + new_filter_by_class + content[filter_by_level_end:]

# Update filterPickerSpells to include class filtering
old_filter = r'''    function filterPickerSpells\(\) \{
      const searchTerm = document\.getElementById\('spellPickerSearch'\)\.value\.toLowerCase\(\);

      filteredSpells = allSpellsFromAPI\.filter\(spell => \{
        const matchesSearch = spell\.name\.toLowerCase\(\)\.includes\(searchTerm\) \|\|
                            \(spell\.school\?\.name \|\| ''\)\.toLowerCase\(\)\.includes\(searchTerm\);
        const matchesLevel = currentLevelFilter === 'all' \|\| spell\.level === parseInt\(currentLevelFilter\);

        return matchesSearch && matchesLevel;
      \}\);'''

new_filter = r'''    function filterPickerSpells() {
      const searchTerm = document.getElementById('spellPickerSearch').value.toLowerCase();

      filteredSpells = allSpellsFromAPI.filter(spell => {
        const matchesSearch = spell.name.toLowerCase().includes(searchTerm) ||
                            (spell.school?.name || '').toLowerCase().includes(searchTerm);
        const matchesLevel = currentLevelFilter === 'all' || spell.level === parseInt(currentLevelFilter);
        const matchesClass = currentClassFilter === 'all' ||
                            (spell.classes && spell.classes.some(c => c.toLowerCase() === currentClassFilter));

        return matchesSearch && matchesLevel && matchesClass;
      });'''

content = re.sub(old_filter, new_filter, content, flags=re.DOTALL)

# Update closeSpellPicker to reset class filter
old_close_picker = r'''    function closeSpellPicker\(event\) \{
      if \(event && event\.target !== event\.currentTarget\) return;
      document\.getElementById\('spellPickerOverlay'\)\.classList\.remove\('show'\);
      // Reset filters
      document\.getElementById\('spellPickerSearch'\)\.value = '';
      currentLevelFilter = 'all';
      document\.querySelectorAll\('\.spell-picker-filter'\)\.forEach\(btn => \{
        btn\.classList\.toggle\('active', btn\.dataset\.level === 'all'\);
      \}\);
    \}'''

new_close_picker = r'''    function closeSpellPicker(event) {
      if (event && event.target !== event.currentTarget) return;
      document.getElementById('spellPickerOverlay').classList.remove('show');
      // Reset filters
      document.getElementById('spellPickerSearch').value = '';
      document.getElementById('spellClassFilter').value = 'all';
      currentLevelFilter = 'all';
      currentClassFilter = 'all';
      document.querySelectorAll('.spell-picker-filter').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.level === 'all');
      });
    }'''

content = re.sub(old_close_picker, new_close_picker, content, flags=re.DOTALL)

# Update the spell mapping to include classes array
old_spell_map = r'''        allSpellsFromAPI = fallbackSpells\.map\(spell => \(\{
          index: spell\.name\.toLowerCase\(\)\.replace\(/\\s\+/g, '-'\)\.replace\(/\[\^\\w-\]/g, ''\),
          name: spell\.name,
          level: spell\.level === 'cantrip' \? 0 : parseInt\(spell\.level\),
          school: \{ name: spell\.school \},
          desc: \[spell\.description\],
          casting_time: spell\.casting_time,
          range: spell\.range,
          components: spell\.components\.raw,
          duration: spell\.duration,
          concentration: spell\.duration\.includes\('Concentration'\),
          ritual: spell\.ritual
        \}\)\);'''

new_spell_map = r'''        allSpellsFromAPI = fallbackSpells.map(spell => ({
          index: spell.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, ''),
          name: spell.name,
          level: spell.level === 'cantrip' ? 0 : parseInt(spell.level),
          school: { name: spell.school },
          desc: [spell.description],
          casting_time: spell.casting_time,
          range: spell.range,
          components: spell.components.raw,
          duration: spell.duration,
          concentration: spell.duration.includes('Concentration'),
          ritual: spell.ritual,
          classes: spell.classes || []
        }));'''

content = re.sub(old_spell_map, new_spell_map, content, flags=re.DOTALL)

# Write the file
with open('test-enhanced-features.html', 'w') as f:
    f.write(content)

print("✅ Added class filter dropdown to spell picker")
print("✅ Added currentClassFilter variable")
print("✅ Added filterByClass() function")
print("✅ Updated filterPickerSpells() to include class filtering")
print("✅ Updated closeSpellPicker() to reset class filter")
print("✅ Updated spell mapping to include classes array")
print("\nChanges applied successfully!")
