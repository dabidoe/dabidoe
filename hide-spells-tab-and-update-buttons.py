#!/usr/bin/env python3
"""
1. Hide Spells tab for non-casters
2. Rename 'Auto-Add More' to 'Update'
3. Add Update button for inventory
"""

# Read the file
with open('test-enhanced-features.html', 'r') as f:
    content = f.read()

# ============================================================================
# PART 1: Update switchStatTab to hide Spells tab for non-casters
# ============================================================================

old_switch_tab = '''    function switchStatTab(tab) {
      // Remove active class from all tab buttons
      document.querySelectorAll('.stat-tab-btn').forEach(btn => {
        btn.classList.remove('active');
      });
      event.target.classList.add('active');

      // Show/hide appropriate tabs
      document.getElementById('statsTab').style.display = tab === 'stats' ? 'block' : 'none';
      document.getElementById('skillsTab').style.display = tab === 'skills' ? 'block' : 'none';
      document.getElementById('abilitiesTab').style.display = tab === 'abilities' ? 'block' : 'none';
      document.getElementById('spellsTab').style.display = tab === 'spells' ? 'block' : 'none';
      document.getElementById('inventoryTab').style.display = tab === 'inventory' ? 'block' : 'none';

      // Update content when switching tabs
      if (tab === 'inventory') {
        updateInventory();
      } else if (tab === 'abilities') {
        updateAbilitiesTab();
      } else if (tab === 'spells') {
        updateSpellsTab();
      }
    }'''

new_switch_tab = '''    function switchStatTab(tab) {
      // Remove active class from all tab buttons
      document.querySelectorAll('.stat-tab-btn').forEach(btn => {
        btn.classList.remove('active');
      });
      event.target.classList.add('active');

      // Show/hide appropriate tabs
      document.getElementById('statsTab').style.display = tab === 'stats' ? 'block' : 'none';
      document.getElementById('skillsTab').style.display = tab === 'skills' ? 'block' : 'none';
      document.getElementById('abilitiesTab').style.display = tab === 'abilities' ? 'block' : 'none';
      document.getElementById('spellsTab').style.display = tab === 'spells' ? 'block' : 'none';
      document.getElementById('inventoryTab').style.display = tab === 'inventory' ? 'block' : 'none';

      // Update content when switching tabs
      if (tab === 'inventory') {
        updateInventory();
      } else if (tab === 'abilities') {
        updateAbilitiesTab();
      } else if (tab === 'spells') {
        updateSpellsTab();
      }
    }

    // Hide/show Spells tab based on character class
    function updateTabVisibility() {
      const spellsTabBtn = document.getElementById('spellsTabBtn');
      if (!spellsTabBtn) return;

      // Classes that don't have spells
      const nonCasters = ['barbarian', 'fighter', 'monk', 'rogue'];
      const charClass = currentCharacter.class.toLowerCase();

      if (nonCasters.includes(charClass)) {
        spellsTabBtn.style.display = 'none';
        // If currently on spells tab, switch to stats
        if (document.getElementById('spellsTab').style.display === 'block') {
          switchStatTab('stats');
          document.querySelector('.stat-tab-btn[onclick*="stats"]').classList.add('active');
        }
      } else {
        spellsTabBtn.style.display = '';
      }
    }'''

if old_switch_tab in content:
    content = content.replace(old_switch_tab, new_switch_tab)
    print("✅ Added updateTabVisibility function")
else:
    print("⚠️ Could not find switchStatTab function")

# Also need to call updateTabVisibility when character changes
# Find updateCharacterDisplay and add the call
old_update_char = '''      // Auto-select first cantrip for battle mode (only for cantrip classes)
      const cantripClasses = ['bard', 'cleric', 'druid', 'sorcerer', 'warlock', 'wizard'];
      const charClass = currentCharacter.class.toLowerCase();

      if (cantripClasses.includes(charClass)) {
        if (currentCharacter.spells && currentCharacter.spells['0'] && currentCharacter.spells['0'].length > 0) {
          selectedCantrip = currentCharacter.spells['0'][0];
          updateCantripButton();
        } else {
          selectedCantrip = null;
          updateCantripButton();
        }
      } else {
        // Non-cantrip class - hide button
        selectedCantrip = null;
        updateCantripButton();
      }
    }'''

new_update_char = '''      // Auto-select first cantrip for battle mode (only for cantrip classes)
      const cantripClasses = ['bard', 'cleric', 'druid', 'sorcerer', 'warlock', 'wizard'];
      const charClass = currentCharacter.class.toLowerCase();

      if (cantripClasses.includes(charClass)) {
        if (currentCharacter.spells && currentCharacter.spells['0'] && currentCharacter.spells['0'].length > 0) {
          selectedCantrip = currentCharacter.spells['0'][0];
          updateCantripButton();
        } else {
          selectedCantrip = null;
          updateCantripButton();
        }
      } else {
        // Non-cantrip class - hide button
        selectedCantrip = null;
        updateCantripButton();
      }

      // Update tab visibility based on class
      updateTabVisibility();
    }'''

if old_update_char in content:
    content = content.replace(old_update_char, new_update_char)
    print("✅ Added updateTabVisibility call to updateCharacterDisplay")
else:
    print("⚠️ Could not add updateTabVisibility call")

# ============================================================================
# PART 2: Rename "Auto-Add More" to "Update"
# ============================================================================

# For Spells
content = content.replace('🔄 Auto-Add More', '🔄 Update')
content = content.replace('onclick="autoAddMoreSpells()"', 'onclick="updateSpells()"')
content = content.replace('function autoAddMoreSpells()', 'function updateSpells()')
print("✅ Renamed spells button to 'Update'")

# For Abilities
content = content.replace('onclick="autoAddMoreAbilities()"', 'onclick="updateAbilities()"')
content = content.replace('function autoAddMoreAbilities()', 'function updateAbilities()')
print("✅ Renamed abilities button to 'Update'")

# ============================================================================
# PART 3: Add Update button to Inventory tab
# ============================================================================

old_inventory_tab = '''          <!-- Inventory Tab -->
          <div id="inventoryTab" style="display: none;">
            <div id="inventoryGrid">
              <!-- Will be populated dynamically -->
            </div>
          </div>'''

new_inventory_tab = '''          <!-- Inventory Tab -->
          <div id="inventoryTab" style="display: none;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; padding: 0 5px;">
              <div style="font-size: 0.9rem; color: var(--text-secondary);">Equipment & Items</div>
              <button onclick="updateInventory_autoAdd()" style="padding: 6px 12px; background: var(--secondary-color, #6c757d); border: none; border-radius: 6px; color: white; font-size: 0.85rem; cursor: pointer; font-weight: 600;">
                🔄 Update
              </button>
            </div>
            <div id="inventoryGrid">
              <!-- Will be populated dynamically -->
            </div>
          </div>'''

if old_inventory_tab in content:
    content = content.replace(old_inventory_tab, new_inventory_tab)
    print("✅ Added Update button to Inventory tab")
else:
    print("⚠️ Could not find Inventory tab")

# ============================================================================
# PART 4: Add updateInventory_autoAdd function
# ============================================================================

# Find updateInventory function and add the auto-add function after it
marker = '    function updateInventory() {'
marker_pos = content.find(marker)

if marker_pos != -1:
    # Find end of updateInventory function
    search_pos = marker_pos
    brace_count = 0
    found_opening = False
    func_end = -1

    for i in range(search_pos, len(content)):
        if content[i] == '{':
            found_opening = True
            brace_count += 1
        elif content[i] == '}':
            brace_count -= 1
            if found_opening and brace_count == 0:
                func_end = i
                break

    if func_end != -1:
        new_function = '''

    // Auto-add class-appropriate items to inventory
    function updateInventory_autoAdd() {
      if (!currentCharacter.inventory) {
        currentCharacter.inventory = [];
      }

      const charClass = currentCharacter.class.toLowerCase();
      const level = currentCharacter.level;

      // Get current item IDs to avoid duplicates
      const currentItemIds = currentCharacter.inventory.map(item => item.id);

      // Class-appropriate item database
      const classItems = {
        barbarian: [
          { id: 'greataxe', name: 'Greataxe', type: 'weapon', equipped: false },
          { id: 'handaxe', name: 'Handaxe (x2)', type: 'weapon', equipped: false, quantity: 2 },
          { id: 'hide_armor', name: 'Hide Armor', type: 'armor', equipped: false },
          { id: 'explorers_pack', name: "Explorer's Pack", type: 'gear', equipped: false },
          { id: 'javelin', name: 'Javelin (x4)', type: 'weapon', equipped: false, quantity: 4 }
        ],
        fighter: [
          { id: 'longsword', name: 'Longsword', type: 'weapon', equipped: false },
          { id: 'shield', name: 'Shield', type: 'armor', equipped: false },
          { id: 'chain_mail', name: 'Chain Mail', type: 'armor', equipped: false },
          { id: 'crossbow_light', name: 'Light Crossbow', type: 'weapon', equipped: false },
          { id: 'crossbow_bolts', name: 'Crossbow Bolts (x20)', type: 'ammunition', equipped: false, quantity: 20 }
        ],
        monk: [
          { id: 'shortsword', name: 'Shortsword', type: 'weapon', equipped: false },
          { id: 'dart', name: 'Dart (x10)', type: 'weapon', equipped: false, quantity: 10 },
          { id: 'explorers_pack', name: "Explorer's Pack", type: 'gear', equipped: false }
        ],
        rogue: [
          { id: 'rapier', name: 'Rapier', type: 'weapon', equipped: false },
          { id: 'shortbow', name: 'Shortbow', type: 'weapon', equipped: false },
          { id: 'arrows', name: 'Arrows (x20)', type: 'ammunition', equipped: false, quantity: 20 },
          { id: 'leather_armor', name: 'Leather Armor', type: 'armor', equipped: false },
          { id: 'thieves_tools', name: "Thieves' Tools", type: 'gear', equipped: false },
          { id: 'burglars_pack', name: "Burglar's Pack", type: 'gear', equipped: false }
        ],
        paladin: [
          { id: 'longsword', name: 'Longsword', type: 'weapon', equipped: false },
          { id: 'shield', name: 'Shield', type: 'armor', equipped: false },
          { id: 'chain_mail', name: 'Chain Mail', type: 'armor', equipped: false },
          { id: 'javelin', name: 'Javelin (x5)', type: 'weapon', equipped: false, quantity: 5 },
          { id: 'holy_symbol', name: 'Holy Symbol', type: 'gear', equipped: false },
          { id: 'priests_pack', name: "Priest's Pack", type: 'gear', equipped: false }
        ],
        ranger: [
          { id: 'longbow', name: 'Longbow', type: 'weapon', equipped: false },
          { id: 'arrows', name: 'Arrows (x20)', type: 'ammunition', equipped: false, quantity: 20 },
          { id: 'shortsword', name: 'Shortsword (x2)', type: 'weapon', equipped: false, quantity: 2 },
          { id: 'scale_mail', name: 'Scale Mail', type: 'armor', equipped: false },
          { id: 'explorers_pack', name: "Explorer's Pack", type: 'gear', equipped: false }
        ],
        bard: [
          { id: 'rapier', name: 'Rapier', type: 'weapon', equipped: false },
          { id: 'lute', name: 'Lute', type: 'gear', equipped: false },
          { id: 'leather_armor', name: 'Leather Armor', type: 'armor', equipped: false },
          { id: 'dagger', name: 'Dagger', type: 'weapon', equipped: false },
          { id: 'entertainers_pack', name: "Entertainer's Pack", type: 'gear', equipped: false }
        ],
        cleric: [
          { id: 'mace', name: 'Mace', type: 'weapon', equipped: false },
          { id: 'shield', name: 'Shield', type: 'armor', equipped: false },
          { id: 'scale_mail', name: 'Scale Mail', type: 'armor', equipped: false },
          { id: 'holy_symbol', name: 'Holy Symbol', type: 'gear', equipped: false },
          { id: 'priests_pack', name: "Priest's Pack", type: 'gear', equipped: false }
        ],
        druid: [
          { id: 'scimitar', name: 'Scimitar', type: 'weapon', equipped: false },
          { id: 'shield', name: 'Wooden Shield', type: 'armor', equipped: false },
          { id: 'leather_armor', name: 'Leather Armor', type: 'armor', equipped: false },
          { id: 'druidic_focus', name: 'Druidic Focus', type: 'gear', equipped: false },
          { id: 'explorers_pack', name: "Explorer's Pack", type: 'gear', equipped: false }
        ],
        sorcerer: [
          { id: 'light_crossbow', name: 'Light Crossbow', type: 'weapon', equipped: false },
          { id: 'crossbow_bolts', name: 'Crossbow Bolts (x20)', type: 'ammunition', equipped: false, quantity: 20 },
          { id: 'arcane_focus', name: 'Arcane Focus', type: 'gear', equipped: false },
          { id: 'dagger', name: 'Dagger (x2)', type: 'weapon', equipped: false, quantity: 2 },
          { id: 'explorers_pack', name: "Explorer's Pack", type: 'gear', equipped: false }
        ],
        warlock: [
          { id: 'light_crossbow', name: 'Light Crossbow', type: 'weapon', equipped: false },
          { id: 'crossbow_bolts', name: 'Crossbow Bolts (x20)', type: 'ammunition', equipped: false, quantity: 20 },
          { id: 'arcane_focus', name: 'Arcane Focus', type: 'gear', equipped: false },
          { id: 'leather_armor', name: 'Leather Armor', type: 'armor', equipped: false },
          { id: 'dagger', name: 'Dagger (x2)', type: 'weapon', equipped: false, quantity: 2 }
        ],
        wizard: [
          { id: 'quarterstaff', name: 'Quarterstaff', type: 'weapon', equipped: false },
          { id: 'arcane_focus', name: 'Arcane Focus', type: 'gear', equipped: false },
          { id: 'spellbook', name: 'Spellbook', type: 'gear', equipped: false },
          { id: 'scholars_pack', name: "Scholar's Pack", type: 'gear', equipped: false },
          { id: 'component_pouch', name: 'Component Pouch', type: 'gear', equipped: false }
        ]
      };

      // Common items all classes can use
      const commonItems = [
        { id: 'healing_potion', name: 'Potion of Healing', type: 'consumable', quantity: 3 },
        { id: 'greater_healing_potion', name: 'Potion of Greater Healing', type: 'consumable', quantity: 1 },
        { id: 'rope', name: 'Rope (50ft)', type: 'gear', equipped: false },
        { id: 'rations', name: 'Rations (10 days)', type: 'consumable', quantity: 10 },
        { id: 'torch', name: 'Torch (x10)', type: 'gear', equipped: false, quantity: 10 },
        { id: 'bedroll', name: 'Bedroll', type: 'gear', equipped: false },
        { id: 'tinderbox', name: 'Tinderbox', type: 'gear', equipped: false }
      ];

      // High level items (level 10+)
      const highLevelItems = [
        { id: 'potion_superior_healing', name: 'Potion of Superior Healing', type: 'consumable', quantity: 2 },
        { id: 'antitoxin', name: 'Antitoxin', type: 'consumable', quantity: 2 },
        { id: 'climbers_kit', name: "Climber's Kit", type: 'gear', equipped: false }
      ];

      let itemsAdded = 0;

      // Add class-specific items
      const classItemList = classItems[charClass] || [];
      classItemList.forEach(item => {
        if (!currentItemIds.includes(item.id)) {
          currentCharacter.inventory.push(item);
          currentItemIds.push(item.id);
          itemsAdded++;
        }
      });

      // Add 3-4 common items
      const commonToAdd = commonItems.slice(0, 4);
      commonToAdd.forEach(item => {
        if (!currentItemIds.includes(item.id)) {
          currentCharacter.inventory.push(item);
          currentItemIds.push(item.id);
          itemsAdded++;
        }
      });

      // Add high level items if level 10+
      if (level >= 10) {
        highLevelItems.forEach(item => {
          if (!currentItemIds.includes(item.id)) {
            currentCharacter.inventory.push(item);
            currentItemIds.push(item.id);
            itemsAdded++;
          }
        });
      }

      if (itemsAdded > 0) {
        updateInventory();
        addBattleLog(`🎒 ${currentCharacter.name} acquired ${itemsAdded} new item${itemsAdded > 1 ? 's' : ''}!`);
        alert(`✨ Added ${itemsAdded} new item${itemsAdded > 1 ? 's' : ''} to inventory!`);
      } else {
        alert('🎒 No new items available! You already have all available items, or customize your inventory manually.');
      }
    }'''

        content = content[:func_end + 1] + new_function + content[func_end + 1:]
        print("✅ Added updateInventory_autoAdd function")
    else:
        print("⚠️ Could not find end of updateInventory function")
else:
    print("⚠️ Could not find updateInventory function")

# Write the file
with open('test-enhanced-features.html', 'w') as f:
    f.write(content)

print("\n🎉 Complete!")
print("✓ Spells tab now hidden for Barbarian, Fighter, Monk, Rogue")
print("✓ Renamed 'Auto-Add More' to 'Update' for spells and abilities")
print("✓ Added 'Update' button to Inventory tab")
print("✓ Added class-appropriate inventory items (weapons, armor, gear)")
