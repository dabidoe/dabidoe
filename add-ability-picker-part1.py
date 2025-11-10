#!/usr/bin/env python3
"""
Add ability picker system similar to spells
"""

# Read the file
with open('test-enhanced-features.html', 'r') as f:
    content = f.read()

# STEP 1: Add "+ Add Ability" button to Abilities tab
abilities_tab_pos = content.find('<div id="abilitiesTab"')
if abilities_tab_pos != -1:
    # Find where abilitiesContent div is
    abilities_content = content.find('<div id="abilitiesContent">', abilities_tab_pos)

    if abilities_content != -1:
        # Add button before abilitiesContent
        add_button = '''            <div style="margin-bottom: 15px; display: flex; justify-content: space-between; align-items: center;">
              <button onclick="openAbilityPicker()" style="padding: 6px 12px; background: var(--accent-color); border: none; border-radius: 6px; color: white; font-size: 0.85rem; cursor: pointer; font-weight: 600;">
                + Add Ability
              </button>
            </div>

            '''

        if '+ Add Ability' not in content:
            content = content[:abilities_content] + add_button + content[abilities_content:]
            print("✅ Added + Add Ability button")

# STEP 2: Add ability database as JavaScript variable
# Find where characters array ends and add ability database
chars_array_end = content.find('    let currentCharacter = characters[0];')
if chars_array_end != -1:
    ability_database = '''
    // Common D&D Abilities Database
    const abilityDatabase = {
      barbarian: [
        { id: 'rage', name: 'Rage', icon: '😡', damage: null, description: 'Gain advantage on STR checks, +2 damage, resistance to physical damage' },
        { id: 'reckless_attack', name: 'Reckless Attack', icon: '💥', damage: null, description: 'Gain advantage on attack rolls, enemies have advantage against you' },
        { id: 'danger_sense', name: 'Danger Sense', icon: '⚠️', damage: null, description: 'Advantage on DEX saves against effects you can see' }
      ],
      bard: [
        { id: 'bardic_inspiration', name: 'Bardic Inspiration', icon: '🎵', damage: '1d6', description: 'Grant ally inspiration die to add to ability check, attack, or save' },
        { id: 'jack_of_all_trades', name: 'Jack of All Trades', icon: '🎭', damage: null, description: 'Add half proficiency to any ability check you make' },
        { id: 'cutting_words', name: 'Cutting Words', icon: '🗣️', damage: '1d6', description: 'Subtract inspiration die from enemy attack or ability check' }
      ],
      cleric: [
        { id: 'channel_divinity', name: 'Channel Divinity', icon: '✝️', damage: null, description: 'Use divine energy for various effects based on domain' },
        { id: 'turn_undead', name: 'Turn Undead', icon: '👻', damage: null, description: 'Force undead to flee if they fail WIS save' },
        { id: 'divine_intervention', name: 'Divine Intervention', icon: '🙏', damage: null, description: 'Ask deity for direct intervention' }
      ],
      druid: [
        { id: 'wild_shape', name: 'Wild Shape', icon: '🐺', damage: null, description: 'Transform into beast you have seen' },
        { id: 'natural_recovery', name: 'Natural Recovery', icon: '🌿', damage: null, description: 'Recover spell slots during short rest' },
        { id: 'beast_spells', name: 'Beast Spells', icon: '🦅', damage: null, description: 'Cast spells while in Wild Shape' }
      ],
      fighter: [
        { id: 'action_surge', name: 'Action Surge', icon: '⚡', damage: null, description: 'Take additional action on your turn' },
        { id: 'second_wind', name: 'Second Wind', icon: '💨', damage: '1d10+10', description: 'Regain hit points as bonus action' },
        { id: 'extra_attack', name: 'Extra Attack', icon: '⚔️', damage: null, description: 'Attack twice when you take Attack action' },
        { id: 'indomitable', name: 'Indomitable', icon: '🛡️', damage: null, description: 'Reroll failed saving throw' }
      ],
      monk: [
        { id: 'flurry_of_blows', name: 'Flurry of Blows', icon: '👊', damage: '2d6', description: 'Make two unarmed strikes as bonus action' },
        { id: 'patient_defense', name: 'Patient Defense', icon: '🥋', damage: null, description: 'Dodge as bonus action' },
        { id: 'step_of_the_wind', name: 'Step of the Wind', icon: '💨', damage: null, description: 'Dash or Disengage as bonus action, jump distance doubled' },
        { id: 'stunning_strike', name: 'Stunning Strike', icon: '⭐', damage: null, description: 'Target must succeed CON save or be stunned' },
        { id: 'deflect_missiles', name: 'Deflect Missiles', icon: '🛡️', damage: '1d10+20', description: 'Reduce damage from ranged attacks' },
        { id: 'slow_fall', name: 'Slow Fall', icon: '🪂', damage: null, description: 'Reduce falling damage by 5x monk level' },
        { id: 'ki_empowered_strikes', name: 'Ki-Empowered Strikes', icon: '✨', damage: null, description: 'Unarmed strikes count as magical' }
      ],
      paladin: [
        { id: 'lay_on_hands', name: 'Lay on Hands', icon: '🙌', damage: null, description: 'Heal hit points or cure disease/poison' },
        { id: 'divine_smite', name: 'Divine Smite', icon: '⚡', damage: '2d8', description: 'Expend spell slot to deal extra radiant damage' },
        { id: 'divine_sense', name: 'Divine Sense', icon: '👁️', damage: null, description: 'Detect celestials, fiends, undead nearby' },
        { id: 'aura_of_protection', name: 'Aura of Protection', icon: '🛡️', damage: null, description: 'You and allies within 10ft get bonus to saves' }
      ],
      ranger: [
        { id: 'favored_enemy', name: 'Favored Enemy', icon: '🎯', damage: null, description: 'Advantage on tracking and INT checks about chosen foe' },
        { id: 'natural_explorer', name: 'Natural Explorer', icon: '🗺️', damage: null, description: 'Expertise in navigation and tracking in favored terrain' },
        { id: 'primeval_awareness', name: 'Primeval Awareness', icon: '👁️', damage: null, description: 'Sense presence of certain creature types' },
        { id: 'colossus_slayer', name: 'Colossus Slayer', icon: '⚔️', damage: '1d8', description: 'Deal extra damage to injured enemies once per turn' }
      ],
      rogue: [
        { id: 'sneak_attack', name: 'Sneak Attack', icon: '🗡️', damage: '10d6', description: 'Deal extra damage when you have advantage' },
        { id: 'cunning_action', name: 'Cunning Action', icon: '💨', damage: null, description: 'Dash, Disengage, or Hide as bonus action' },
        { id: 'evasion', name: 'Evasion', icon: '🤸', damage: null, description: 'Take no damage on successful DEX save, half on failure' },
        { id: 'uncanny_dodge', name: 'Uncanny Dodge', icon: '🛡️', damage: null, description: 'Halve damage from one attack as reaction' }
      ],
      sorcerer: [
        { id: 'metamagic', name: 'Metamagic', icon: '🔮', damage: null, description: 'Modify spells with sorcery points' },
        { id: 'twinned_spell', name: 'Twinned Spell', icon: '👥', damage: null, description: 'Target second creature with single-target spell' },
        { id: 'quickened_spell', name: 'Quickened Spell', icon: '⚡', damage: null, description: 'Cast spell as bonus action' }
      ],
      warlock: [
        { id: 'eldritch_blast', name: 'Eldritch Blast', icon: '💥', damage: '4d10', description: 'Warlock signature cantrip attack' },
        { id: 'agonizing_blast', name: 'Agonizing Blast', icon: '😈', damage: null, description: 'Add CHA modifier to Eldritch Blast damage' },
        { id: 'hex', name: 'Hex', icon: '🎯', damage: '1d6', description: 'Curse target to deal extra necrotic damage' },
        { id: 'eldritch_invocations', name: 'Eldritch Invocations', icon: '👁️', damage: null, description: 'Special warlock abilities granted by patron' }
      ],
      wizard: [
        { id: 'arcane_recovery', name: 'Arcane Recovery', icon: '🔄', damage: null, description: 'Recover spell slots during short rest' },
        { id: 'spell_mastery', name: 'Spell Mastery', icon: '📖', damage: null, description: 'Cast certain spells at will' },
        { id: 'signature_spells', name: 'Signature Spells', icon: '✍️', damage: null, description: 'Always have two 3rd level spells prepared' }
      ]
    };

'''

    if 'const abilityDatabase' not in content:
        content = content[:chars_array_end] + ability_database + content[chars_array_end:]
        print("✅ Added ability database")

# STEP 3: Add ability picker modal HTML before closing body
body_close = content.rfind('</body>')
if body_close != -1:
    modal_html = '''
  <!-- Ability Picker Modal -->
  <div class="spell-picker-overlay" id="abilityPickerOverlay" onclick="closeAbilityPicker(event)">
    <div class="spell-picker-modal" onclick="event.stopPropagation()">
      <div class="spell-picker-header">
        <div class="spell-picker-title">⚔️ Add Ability</div>
        <button class="spell-modal-close" onclick="closeAbilityPicker()" style="position: absolute; top: 15px; right: 15px;">✕</button>

        <div class="spell-picker-search">
          <input type="text" id="abilityPickerSearch" placeholder="Search abilities..." oninput="filterAbilities()">
        </div>

        <div style="padding: 10px 15px 0 15px;">
          <select id="abilityClassFilter" onchange="filterAbilities()" style="width: 100%; padding: 8px; background: var(--background-color); color: var(--text-primary); border: 2px solid var(--border-color); border-radius: 6px; font-size: 0.9rem;">
            <option value="all">All Classes</option>
            <option value="barbarian">Barbarian</option>
            <option value="bard">Bard</option>
            <option value="cleric">Cleric</option>
            <option value="druid">Druid</option>
            <option value="fighter">Fighter</option>
            <option value="monk">Monk</option>
            <option value="paladin">Paladin</option>
            <option value="ranger">Ranger</option>
            <option value="rogue">Rogue</option>
            <option value="sorcerer">Sorcerer</option>
            <option value="warlock">Warlock</option>
            <option value="wizard">Wizard</option>
          </select>
        </div>
      </div>

      <div class="spell-picker-body" id="abilityPickerBody">
        <div class="spell-picker-loading">
          ⚔️ Select a class to see abilities...
        </div>
      </div>

      <div style="padding: 15px; border-top: 2px solid var(--border-color);">
        <button onclick="openCustomAbilityCreator()" style="width: 100%; padding: 12px; background: var(--surface-color); border: 2px solid var(--accent-color); border-radius: 6px; color: var(--accent-color); font-weight: 600; cursor: pointer; font-size: 1rem;">
          ✨ Create Custom Ability
        </button>
      </div>
    </div>
  </div>

  <!-- Custom Ability Creator Modal -->
  <div class="spell-modal-overlay" id="customAbilityOverlay" onclick="closeCustomAbilityCreator(event)" style="z-index: 10200;">
    <div class="spell-modal" onclick="event.stopPropagation()" style="max-width: 500px;">
      <div class="spell-modal-header">
        <div class="spell-modal-icon">✨</div>
        <div class="spell-modal-title">
          <div class="spell-modal-name">Create Custom Ability</div>
          <div class="spell-modal-level">Design your own ability</div>
        </div>
        <button class="spell-modal-close" onclick="closeCustomAbilityCreator()">✕</button>
      </div>

      <div class="spell-modal-body" style="padding: 20px;">
        <div style="display: flex; flex-direction: column; gap: 15px;">
          <div>
            <label style="display: block; color: var(--text-primary); font-weight: 600; margin-bottom: 5px;">Ability Name</label>
            <input type="text" id="customAbilityName" placeholder="e.g., Power Strike" style="width: 100%; padding: 10px; background: var(--background-color); color: var(--text-primary); border: 2px solid var(--border-color); border-radius: 6px; font-size: 1rem;">
          </div>

          <div>
            <label style="display: block; color: var(--text-primary); font-weight: 600; margin-bottom: 5px;">Icon (emoji)</label>
            <input type="text" id="customAbilityIcon" placeholder="⚔️" maxlength="2" style="width: 100%; padding: 10px; background: var(--background-color); color: var(--text-primary); border: 2px solid var(--border-color); border-radius: 6px; font-size: 1rem;">
          </div>

          <div>
            <label style="display: block; color: var(--text-primary); font-weight: 600; margin-bottom: 5px;">Damage (optional)</label>
            <input type="text" id="customAbilityDamage" placeholder="e.g., 2d6+4" style="width: 100%; padding: 10px; background: var(--background-color); color: var(--text-primary); border: 2px solid var(--border-color); border-radius: 6px; font-size: 1rem;">
          </div>

          <div>
            <label style="display: block; color: var(--text-primary); font-weight: 600; margin-bottom: 5px;">Description</label>
            <textarea id="customAbilityDesc" placeholder="Describe what this ability does..." rows="4" style="width: 100%; padding: 10px; background: var(--background-color); color: var(--text-primary); border: 2px solid var(--border-color); border-radius: 6px; font-size: 1rem; resize: vertical;"></textarea>
          </div>

          <button onclick="addCustomAbility()" style="width: 100%; padding: 12px; background: var(--accent-color); border: none; border-radius: 6px; color: white; font-weight: 600; cursor: pointer; font-size: 1.1rem; margin-top: 10px;">
            ✨ Add Ability
          </button>
        </div>
      </div>
    </div>
  </div>

'''

    if 'abilityPickerOverlay' not in content:
        content = content[:body_close] + modal_html + content[body_close:]
        print("✅ Added ability picker and custom creator modals")

# Write the file
with open('test-enhanced-features.html', 'w') as f:
    f.write(content)

print("\n✅ Part 1 complete - Added UI elements")
print("Next: Adding JavaScript functions...")
