#!/usr/bin/env python3
"""
Add JavaScript functions for ability picker
"""

# Read the file
with open('test-enhanced-features.html', 'r') as f:
    content = f.read()

# Find the last script closing tag to add functions
last_script_close = content.rfind('  </script>')
if last_script_close != -1:
    js_functions = '''
    // Ability Picker Functions
    function openAbilityPicker() {
      document.getElementById('abilityPickerOverlay').classList.add('show');
      // Auto-select current character's class
      const classFilter = document.getElementById('abilityClassFilter');
      classFilter.value = currentCharacter.class.toLowerCase();
      filterAbilities();
    }

    function closeAbilityPicker(event) {
      if (event && event.target !== event.currentTarget) return;
      document.getElementById('abilityPickerOverlay').classList.remove('show');
      document.getElementById('abilityPickerSearch').value = '';
      document.getElementById('abilityClassFilter').value = 'all';
    }

    function filterAbilities() {
      const searchTerm = document.getElementById('abilityPickerSearch').value.toLowerCase();
      const classFilter = document.getElementById('abilityClassFilter').value;
      const body = document.getElementById('abilityPickerBody');

      if (classFilter === 'all') {
        body.innerHTML = '<div class="spell-picker-empty" style="padding: 40px; text-align: center; color: var(--text-secondary);">Select a class to view abilities</div>';
        return;
      }

      const abilities = abilityDatabase[classFilter] || [];
      const filtered = abilities.filter(ability =>
        ability.name.toLowerCase().includes(searchTerm) ||
        ability.description.toLowerCase().includes(searchTerm)
      );

      if (filtered.length === 0) {
        body.innerHTML = '<div class="spell-picker-empty" style="padding: 40px; text-align: center; color: var(--text-secondary);">No abilities found</div>';
        return;
      }

      let html = '<div class="spell-picker-list">';
      filtered.forEach(ability => {
        const alreadyHas = currentCharacter.abilities?.some(a => a.id === ability.id);
        html += `
          <div class="spell-picker-item">
            <div class="spell-picker-item-info">
              <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 5px;">
                <span style="font-size: 1.5rem;">${ability.icon}</span>
                <div>
                  <div class="spell-picker-item-name">${ability.name}</div>
                  ${ability.damage ? `<div style="color: var(--battle-color); font-size: 0.85rem; font-weight: 600;">${ability.damage}</div>` : ''}
                </div>
              </div>
              <div style="color: var(--text-secondary); font-size: 0.85rem; margin-top: 5px;">${ability.description}</div>
            </div>
            <button class="spell-picker-item-add"
                    onclick="addAbilityToCharacter('${ability.id}', '${classFilter}')"
                    ${alreadyHas ? 'disabled' : ''}>
              ${alreadyHas ? '✓ Added' : '+ Add'}
            </button>
          </div>
        `;
      });
      html += '</div>';
      body.innerHTML = html;
    }

    function addAbilityToCharacter(abilityId, classFilter) {
      const ability = abilityDatabase[classFilter]?.find(a => a.id === abilityId);
      if (!ability) return;

      // Check if already has ability
      if (currentCharacter.abilities?.some(a => a.id === ability.id)) {
        alert('You already have this ability!');
        return;
      }

      // Initialize abilities array if needed
      if (!currentCharacter.abilities) {
        currentCharacter.abilities = [];
      }

      // Add ability
      currentCharacter.abilities.push({
        id: ability.id,
        name: ability.name,
        icon: ability.icon,
        damage: ability.damage,
        description: ability.description
      });

      // Update display
      updateAbilitiesTab();
      addBattleLog(`⚔️ ${currentCharacter.name} learned ${ability.name}!`);

      // Refresh picker to update button states
      filterAbilities();
    }

    // Custom Ability Creator Functions
    function openCustomAbilityCreator() {
      document.getElementById('customAbilityOverlay').classList.add('show');
      // Clear form
      document.getElementById('customAbilityName').value = '';
      document.getElementById('customAbilityIcon').value = '⚔️';
      document.getElementById('customAbilityDamage').value = '';
      document.getElementById('customAbilityDesc').value = '';
    }

    function closeCustomAbilityCreator(event) {
      if (event && event.target !== event.currentTarget) return;
      document.getElementById('customAbilityOverlay').classList.remove('show');
    }

    function addCustomAbility() {
      const name = document.getElementById('customAbilityName').value.trim();
      const icon = document.getElementById('customAbilityIcon').value.trim() || '⚔️';
      const damage = document.getElementById('customAbilityDamage').value.trim() || null;
      const description = document.getElementById('customAbilityDesc').value.trim();

      if (!name) {
        alert('Please enter an ability name!');
        return;
      }

      if (!description) {
        alert('Please enter a description!');
        return;
      }

      // Generate unique ID
      const id = name.toLowerCase().replace(/\\s+/g, '_').replace(/[^a-z0-9_]/g, '');

      // Check if already has ability with this ID
      if (currentCharacter.abilities?.some(a => a.id === id)) {
        alert('You already have an ability with this name!');
        return;
      }

      // Initialize abilities array if needed
      if (!currentCharacter.abilities) {
        currentCharacter.abilities = [];
      }

      // Add custom ability
      currentCharacter.abilities.push({
        id: id,
        name: name,
        icon: icon,
        damage: damage,
        description: description
      });

      // Update display
      updateAbilitiesTab();
      addBattleLog(`✨ ${currentCharacter.name} created custom ability: ${name}!`);

      // Close modals
      closeCustomAbilityCreator();
      closeAbilityPicker();

      alert(`✨ ${name} added successfully!`);
    }

'''

    if 'function openAbilityPicker' not in content:
        content = content[:last_script_close] + js_functions + content[last_script_close:]
        print("✅ Added JavaScript functions for ability picker")

# Write the file
with open('test-enhanced-features.html', 'w') as f:
    f.write(content)

print("\n🎉 Ability picker system complete!")
print("\nFeatures:")
print("  - + Add Ability button in Abilities tab")
print("  - Ability picker with 60+ common D&D abilities")
print("  - Class filter auto-selects current character's class")
print("  - Search filter for finding specific abilities")
print("  - Custom ability creator for unique abilities")
print("  - Abilities include: Flurry of Blows, Sneak Attack, Rage, etc.")
