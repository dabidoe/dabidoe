#!/usr/bin/env python3
"""
Add proper 5e spell/ability progression + Auto-Add More Abilities button
"""

# Read the file
with open('test-enhanced-features.html', 'r') as f:
    content = f.read()

# ============================================================================
# PART 1: Add "Auto-Add More Abilities" button to Abilities tab
# ============================================================================

# Find the abilities tab button area
old_abilities_header = '''          <!-- Abilities Tab -->
          <div id="abilitiesTab" style="display: none;">'''

new_abilities_header = '''          <!-- Abilities Tab -->
          <div id="abilitiesTab" style="display: none;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; padding: 0 5px;">
              <div style="font-size: 0.9rem; color: var(--text-secondary);">Class Abilities & Features</div>
              <button onclick="autoAddMoreAbilities()" style="padding: 6px 12px; background: var(--secondary-color, #6c757d); border: none; border-radius: 6px; color: white; font-size: 0.85rem; cursor: pointer; font-weight: 600;">
                🔄 Auto-Add More
              </button>
            </div>'''

if old_abilities_header in content:
    content = content.replace(old_abilities_header, new_abilities_header)
    print("✅ Added 'Auto-Add More' button to Abilities tab")
else:
    print("⚠️ Could not find Abilities tab header")

# ============================================================================
# PART 2: Add 5e Spell Progression Tables
# ============================================================================

# Find where to add the progression tables (after abilityDatabase)
insert_marker = 'const abilityDatabase = {'
marker_pos = content.find(insert_marker)

if marker_pos != -1:
    # Find the end of abilityDatabase
    search_pos = marker_pos
    brace_count = 0
    found_opening = False
    db_end = -1

    for i in range(search_pos, len(content)):
        if content[i] == '{':
            found_opening = True
            brace_count += 1
        elif content[i] == '}':
            brace_count -= 1
            if found_opening and brace_count == 0:
                db_end = i
                break

    if db_end != -1:
        # Add 5e progression tables after abilityDatabase
        progression_tables = '''

    // 5e Spell Progression Tables (spells known/in spellbook by level)
    const spellsKnownProgression = {
      // Full casters - Known spells
      bard: [0, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 15, 16, 18, 19, 20, 22, 22, 22],
      sorcerer: [0, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 12, 13, 13, 14, 14, 15, 15, 15, 15],
      warlock: [0, 2, 3, 4, 5, 6, 7, 8, 9, 10, 10, 11, 11, 12, 12, 13, 13, 14, 14, 15, 15],
      // Half casters - Known spells
      ranger: [0, 0, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11],
      // Prepared casters - these numbers represent spellbook size for wizards
      wizard: [0, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36, 38, 40, 42, 44],
      // Prepared casters (Cleric, Druid, Paladin) have access to full class list
      // They can prepare: spellcasting_mod + level spells
    };

    // Cantrips known progression
    const cantripsKnownProgression = {
      bard: [0, 2, 2, 2, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
      cleric: [0, 3, 3, 3, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5],
      druid: [0, 2, 2, 2, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
      sorcerer: [0, 4, 4, 4, 5, 5, 5, 5, 5, 5, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6],
      warlock: [0, 2, 2, 2, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
      wizard: [0, 3, 3, 3, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5]
    };'''

        content = content[:db_end + 2] + progression_tables + content[db_end + 2:]
        print("✅ Added 5e spell progression tables")
    else:
        print("⚠️ Could not find end of abilityDatabase")
else:
    print("⚠️ Could not find abilityDatabase")

# ============================================================================
# PART 3: Update autoPopulateSpells to use 5e progression
# ============================================================================

# Find and replace the spellsToAdd logic in autoPopulateSpells
old_spells_logic = '''        // Number of spells to add depends on casting type
        let spellsToAdd = 2;
        if (charClass === 'wizard') {
          // Wizards learn 2 per level
          spellsToAdd = Math.min(6, 2 + Math.floor(level / 2));
        } else if (knownCasters.includes(charClass)) {
          // Known casters have limited spells
          spellsToAdd = 2;
        } else if (preparedCasters.includes(charClass)) {
          // Prepared casters have access to more
          spellsToAdd = 3;
        }'''

new_spells_logic = '''        // Number of spells to add depends on casting type - use 5e progression
        let spellsToAdd = 2;

        // Calculate total spells for this character based on 5e rules
        const totalSpellsKnown = spellsKnownProgression[charClass] ? spellsKnownProgression[charClass][level] || 0 : 0;

        if (charClass === 'wizard') {
          // Wizards: Distribute spellbook spells across levels
          // Higher level wizards have more spells per level
          spellsToAdd = Math.min(8, Math.floor(totalSpellsKnown / maxSpellLevel) + 2);
        } else if (knownCasters.includes(charClass)) {
          // Known casters: Distribute known spells across available levels
          spellsToAdd = Math.min(6, Math.floor(totalSpellsKnown / maxSpellLevel) + 1);
        } else if (preparedCasters.includes(charClass)) {
          // Prepared casters have access to full class list (give them more options)
          spellsToAdd = 6;
        }'''

if old_spells_logic in content:
    content = content.replace(old_spells_logic, new_spells_logic)
    print("✅ Updated autoPopulateSpells to use 5e progression")
else:
    print("⚠️ Could not find spell logic to update")

# Also update cantrip count to use progression table
old_cantrip_logic = '''      // Add cantrips
      const cantripCount = spellcasters.includes(charClass) ? Math.min(4, 2 + Math.floor(level / 4)) : 0;'''

new_cantrip_logic = '''      // Add cantrips - use 5e progression
      let cantripCount = 0;
      if (cantripsKnownProgression[charClass]) {
        cantripCount = cantripsKnownProgression[charClass][level] || 0;
      } else if (spellcasters.includes(charClass)) {
        cantripCount = Math.min(4, 2 + Math.floor(level / 4));
      }'''

if old_cantrip_logic in content:
    content = content.replace(old_cantrip_logic, new_cantrip_logic)
    print("✅ Updated cantrip count to use 5e progression")
else:
    print("⚠️ Could not find cantrip logic to update")

# ============================================================================
# PART 4: Add autoAddMoreAbilities function
# ============================================================================

# Find autoAddMoreSpells function and add abilities version after it
insert_marker = '    function autoAddMoreSpells() {'
marker_pos = content.find(insert_marker)

if marker_pos != -1:
    # Find the end of autoAddMoreSpells
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
        # Add autoAddMoreAbilities after autoAddMoreSpells
        new_function = '''

    // Auto-add more abilities from expanded database
    function autoAddMoreAbilities() {
      if (!currentCharacter.abilities) {
        currentCharacter.abilities = [];
      }

      const charClass = currentCharacter.class.toLowerCase();
      const level = currentCharacter.level;

      // Expanded ability database with more options
      const expandedAbilityDatabase = {
        barbarian: [
          { id: 'rage', name: 'Rage', icon: '😡', damage: null, description: 'Gain advantage on STR checks, +2 damage, resistance to physical damage' },
          { id: 'reckless_attack', name: 'Reckless Attack', icon: '💥', damage: null, description: 'Gain advantage on melee attacks, enemies have advantage against you' },
          { id: 'danger_sense', name: 'Danger Sense', icon: '⚠️', damage: null, description: 'Advantage on DEX saves against visible effects' },
          { id: 'feral_instinct', name: 'Feral Instinct', icon: '🐺', damage: null, description: 'Advantage on initiative, cannot be surprised while raging' },
          { id: 'brutal_critical', name: 'Brutal Critical', icon: '💀', damage: null, description: 'Roll additional weapon damage dice on critical hits' },
          { id: 'relentless_rage', name: 'Relentless Rage', icon: '❤️', damage: null, description: 'If you drop to 0 HP while raging, make a DC 10 CON save to drop to 1 HP instead' },
          { id: 'persistent_rage', name: 'Persistent Rage', icon: '🔥', damage: null, description: 'Your rage only ends early if you fall unconscious or choose to end it' }
        ],
        fighter: [
          { id: 'second_wind', name: 'Second Wind', icon: '💨', damage: null, description: 'Regain 1d10 + fighter level HP as bonus action' },
          { id: 'action_surge', name: 'Action Surge', icon: '⚡', damage: null, description: 'Take one additional action on your turn' },
          { id: 'extra_attack', name: 'Extra Attack', icon: '⚔️', damage: null, description: 'Attack twice when you take the Attack action' },
          { id: 'indomitable', name: 'Indomitable', icon: '🛡️', damage: null, description: 'Reroll a failed saving throw' },
          { id: 'improved_critical', name: 'Improved Critical', icon: '🎯', damage: null, description: 'Critical hits on rolls of 19-20' },
          { id: 'remarkable_athlete', name: 'Remarkable Athlete', icon: '🏃', damage: null, description: 'Add half proficiency to STR/DEX/CON checks without proficiency' }
        ],
        monk: [
          { id: 'martial_arts', name: 'Martial Arts', icon: '🥋', damage: '1d6', description: 'Unarmed strikes use martial arts die, bonus action unarmed strike' },
          { id: 'ki', name: 'Ki Points', icon: '✨', damage: null, description: 'Spend ki points to fuel special abilities' },
          { id: 'flurry_of_blows', name: 'Flurry of Blows', icon: '👊', damage: '2d6', description: 'Spend 1 ki to make two unarmed strikes as bonus action' },
          { id: 'patient_defense', name: 'Patient Defense', icon: '🛡️', damage: null, description: 'Spend 1 ki to Dodge as bonus action' },
          { id: 'step_of_wind', name: 'Step of the Wind', icon: '💨', damage: null, description: 'Spend 1 ki to Disengage/Dash as bonus action, double jump distance' },
          { id: 'stunning_strike', name: 'Stunning Strike', icon: '⭐', damage: null, description: 'Spend 1 ki, target must succeed CON save or be stunned' },
          { id: 'deflect_missiles', name: 'Deflect Missiles', icon: '🎯', damage: null, description: 'Reduce ranged attack damage, catch and throw back projectiles' },
          { id: 'slow_fall', name: 'Slow Fall', icon: '🪂', damage: null, description: 'Reduce falling damage by 5x monk level' },
          { id: 'evasion', name: 'Evasion', icon: '⚡', damage: null, description: 'Take no damage on successful DEX save, half on failure' },
          { id: 'stillness_of_mind', name: 'Stillness of Mind', icon: '🧘', damage: null, description: 'End one charmed or frightened effect as action' }
        ],
        rogue: [
          { id: 'sneak_attack', name: 'Sneak Attack', icon: '🗡️', damage: '6d6', description: 'Deal extra damage when you have advantage or ally is nearby' },
          { id: 'cunning_action', name: 'Cunning Action', icon: '⚡', damage: null, description: 'Dash, Disengage, or Hide as bonus action' },
          { id: 'evasion', name: 'Evasion', icon: '💨', damage: null, description: 'Take no damage on successful DEX save, half on failure' },
          { id: 'uncanny_dodge', name: 'Uncanny Dodge', icon: '🛡️', damage: null, description: 'Halve damage from one attack as reaction' },
          { id: 'reliable_talent', name: 'Reliable Talent', icon: '🎯', damage: null, description: 'Treat rolls of 9 or lower as 10 for proficient skills' },
          { id: 'blindsense', name: 'Blindsense', icon: '👁️', damage: null, description: 'Detect hidden/invisible creatures within 10ft' },
          { id: 'slippery_mind', name: 'Slippery Mind', icon: '🧠', damage: null, description: 'Proficiency in WIS saves' }
        ],
        paladin: [
          { id: 'divine_sense', name: 'Divine Sense', icon: '✨', damage: null, description: 'Detect celestials, fiends, and undead within 60ft' },
          { id: 'lay_on_hands', name: 'Lay on Hands', icon: '🤲', damage: null, description: 'Heal 5x paladin level HP per day' },
          { id: 'divine_smite', name: 'Divine Smite', icon: '⚔️', damage: '2d8', description: 'Expend spell slot to deal extra radiant damage' },
          { id: 'extra_attack', name: 'Extra Attack', icon: '⚔️', damage: null, description: 'Attack twice when you take the Attack action' },
          { id: 'aura_of_protection', name: 'Aura of Protection', icon: '🛡️', damage: null, description: 'You and allies within 10ft add CHA mod to saves' },
          { id: 'aura_of_courage', name: 'Aura of Courage', icon: '💪', damage: null, description: 'You and allies within 10ft immune to frightened' },
          { id: 'cleansing_touch', name: 'Cleansing Touch', icon: '✋', damage: null, description: 'End one spell on yourself or ally (CHA mod times per day)' }
        ],
        ranger: [
          { id: 'favored_enemy', name: 'Favored Enemy', icon: '🎯', damage: null, description: 'Advantage on tracking and INT checks for chosen enemy type' },
          { id: 'natural_explorer', name: 'Natural Explorer', icon: '🌲', damage: null, description: 'Benefits in favored terrain: ignore difficult terrain, advantage on initiative' },
          { id: 'hunters_mark', name: "Hunter's Mark", icon: '🏹', damage: '1d6', description: 'Mark target for 1 hour, deal extra damage and track easily' },
          { id: 'extra_attack', name: 'Extra Attack', icon: '⚔️', damage: null, description: 'Attack twice when you take the Attack action' },
          { id: 'land_stride', name: "Land's Stride", icon: '🏃', damage: null, description: 'Move through nonmagical difficult terrain without penalty' },
          { id: 'hide_in_plain_sight', name: 'Hide in Plain Sight', icon: '🌿', damage: null, description: 'Camouflage yourself, +10 to Stealth checks' },
          { id: 'vanish', name: 'Vanish', icon: '💨', damage: null, description: 'Hide as bonus action, cannot be tracked except by magic' }
        ],
        bard: [
          { id: 'bardic_inspiration', name: 'Bardic Inspiration', icon: '🎵', damage: '1d8', description: 'Grant ally inspiration die to add to ability checks, attacks, or saves' },
          { id: 'jack_of_all_trades', name: 'Jack of All Trades', icon: '🎭', damage: null, description: 'Add half proficiency to ability checks without proficiency' },
          { id: 'song_of_rest', name: 'Song of Rest', icon: '🎶', damage: '1d8', description: 'Allies regain extra HP during short rest' },
          { id: 'expertise', name: 'Expertise', icon: '⭐', damage: null, description: 'Double proficiency bonus for two skills' },
          { id: 'font_of_inspiration', name: 'Font of Inspiration', icon: '✨', damage: null, description: 'Regain bardic inspiration on short rest' },
          { id: 'countercharm', name: 'Countercharm', icon: '🎺', damage: null, description: 'Grant advantage vs frightened/charmed to allies within 30ft' }
        ],
        cleric: [
          { id: 'channel_divinity', name: 'Channel Divinity', icon: '✝️', damage: null, description: 'Channel divine energy for powerful effects' },
          { id: 'turn_undead', name: 'Turn Undead', icon: '💀', damage: null, description: 'Force undead to flee for 1 minute (WIS save)' },
          { id: 'destroy_undead', name: 'Destroy Undead', icon: '☠️', damage: null, description: 'Instantly destroy low CR undead when turned' },
          { id: 'divine_intervention', name: 'Divine Intervention', icon: '🙏', damage: null, description: 'Ask deity for aid (10% chance + cleric level)' },
          { id: 'blessed_healer', name: 'Blessed Healer', icon: '💚', damage: null, description: 'Heal yourself when you heal others (2 + spell level HP)' }
        ],
        druid: [
          { id: 'wild_shape', name: 'Wild Shape', icon: '🐻', damage: null, description: 'Transform into beast with CR up to 1/3 druid level' },
          { id: 'natural_recovery', name: 'Natural Recovery', icon: '🌿', damage: null, description: 'Recover spell slots during short rest (total level = half druid level)' },
          { id: 'beast_spells', name: 'Beast Spells', icon: '✨', damage: null, description: 'Cast spells while in Wild Shape' },
          { id: 'timeless_body', name: 'Timeless Body', icon: '⏳', damage: null, description: 'Age 1 year for every 10 years, cannot be aged magically' },
          { id: 'archdruid', name: 'Archdruid', icon: '🌳', damage: null, description: 'Use Wild Shape unlimited times' }
        ],
        sorcerer: [
          { id: 'sorcery_points', name: 'Sorcery Points', icon: '✨', damage: null, description: 'Fuel metamagic and create spell slots' },
          { id: 'metamagic', name: 'Metamagic', icon: '🔮', damage: null, description: 'Modify spells: Quicken, Twin, Empower, Subtle' },
          { id: 'font_of_magic', name: 'Font of Magic', icon: '💫', damage: null, description: 'Convert sorcery points to/from spell slots' },
          { id: 'sorcerous_restoration', name: 'Sorcerous Restoration', icon: '🔄', damage: null, description: 'Regain 4 sorcery points on short rest' }
        ],
        warlock: [
          { id: 'eldritch_invocations', name: 'Eldritch Invocations', icon: '👁️', damage: null, description: 'Learn magical abilities granted by patron' },
          { id: 'pact_magic', name: 'Pact Magic', icon: '📜', damage: null, description: 'Spell slots recharge on short rest' },
          { id: 'agonizing_blast', name: 'Agonizing Blast', icon: '💥', damage: '+5', description: 'Add CHA modifier to Eldritch Blast damage' },
          { id: 'devils_sight', name: "Devil's Sight", icon: '👁️', damage: null, description: 'See normally in darkness (magical or nonmagical) to 120ft' },
          { id: 'mystic_arcanum', name: 'Mystic Arcanum', icon: '📖', damage: null, description: 'Learn 6th-9th level spells, cast once per long rest' }
        ],
        wizard: [
          { id: 'arcane_recovery', name: 'Arcane Recovery', icon: '🔄', damage: null, description: 'Recover spell slots during short rest (total level = half wizard level)' },
          { id: 'spell_mastery', name: 'Spell Mastery', icon: '📚', damage: null, description: 'Cast one 1st and one 2nd level spell at will' },
          { id: 'signature_spells', name: 'Signature Spells', icon: '✍️', damage: null, description: 'Always have two 3rd level spells prepared' },
          { id: 'sculpt_spells', name: 'Sculpt Spells', icon: '🎨', damage: null, description: 'Allies auto-succeed saves against your evocation spells' },
          { id: 'potent_cantrip', name: 'Potent Cantrip', icon: '💫', damage: null, description: 'Targets take half damage on cantrip save success' }
        ]
      };

      // Get current ability IDs to avoid duplicates
      const currentAbilityIds = currentCharacter.abilities.map(a => a.id);

      // Get expanded abilities for this class
      const classAbilities = expandedAbilityDatabase[charClass] || [];

      // Filter out already known abilities
      const newAbilities = classAbilities.filter(ability => !currentAbilityIds.includes(ability.id));

      let abilitiesAdded = 0;

      // Add 3-5 new abilities
      const abilitiesToAdd = Math.min(5, newAbilities.length);

      for (let i = 0; i < abilitiesToAdd; i++) {
        const ability = newAbilities[i];
        currentCharacter.abilities.push({
          id: ability.id,
          name: ability.name,
          icon: ability.icon,
          damage: ability.damage,
          description: ability.description
        });
        abilitiesAdded++;
      }

      if (abilitiesAdded > 0) {
        updateAbilitiesTab();
        addBattleLog(`⚔️ ${currentCharacter.name} learned ${abilitiesAdded} new ${abilitiesAdded > 1 ? 'abilities' : 'ability'}!`);
        alert(`✨ Added ${abilitiesAdded} new ${abilitiesAdded > 1 ? 'abilities' : 'ability'}!`);
      } else {
        alert('⚔️ No new abilities available! You already know all available abilities for your class, or use the Ability Picker to add custom abilities.');
      }
    }'''

        content = content[:func_end + 1] + new_function + content[func_end + 1:]
        print("✅ Added autoAddMoreAbilities function")
    else:
        print("⚠️ Could not find end of autoAddMoreSpells function")
else:
    print("⚠️ Could not find autoAddMoreSpells function")

# Write the file
with open('test-enhanced-features.html', 'w') as f:
    f.write(content)

print("\n🎉 Complete!")
print("✓ Added 'Auto-Add More' button to Abilities tab")
print("✓ Added 5e spell/cantrip progression tables")
print("✓ Updated auto-population to use proper 5e spell counts")
print("✓ Added autoAddMoreAbilities function with expanded ability database")
