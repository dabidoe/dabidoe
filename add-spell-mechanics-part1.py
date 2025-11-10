#!/usr/bin/env python3
"""
Implement proper D&D spellcasting mechanics and subclass-based spell selection
"""

# Read the file
with open('test-enhanced-features.html', 'r') as f:
    content = f.read()

# STEP 1: Create subclass-themed spell databases
# Find where to add (after abilityDatabase)
ability_db_end = content.find('    let currentCharacter = characters[0];')
if ability_db_end != -1:
    spell_themes = '''
    // Subclass-themed spell suggestions
    const subclassSpells = {
      // Wizard subclasses
      'School of Evocation': {
        cantrips: ['fire_bolt', 'ray_of_frost'],
        1: ['burning_hands', 'magic_missile', 'thunderwave'],
        2: ['scorching_ray', 'shatter'],
        3: ['fireball', 'lightning_bolt'],
        4: ['ice_storm', 'wall_of_fire'],
        5: ['cone_of_cold']
      },
      'School of Abjuration': {
        cantrips: ['mage_hand', 'light'],
        1: ['shield', 'mage_armor', 'alarm'],
        2: ['arcane_lock', 'mirror_image'],
        3: ['counterspell', 'dispel_magic'],
        4: ['banishment', 'dimension_door'],
        5: ['wall_of_force']
      },
      // Cleric domains
      'Life Domain': {
        cantrips: ['sacred_flame', 'guidance', 'light'],
        1: ['cure_wounds', 'bless', 'healing_word'],
        2: ['prayer_of_healing', 'lesser_restoration', 'spiritual_weapon'],
        3: ['mass_healing_word', 'revivify', 'beacon_of_hope'],
        4: ['death_ward', 'guardian_of_faith'],
        5: ['mass_cure_wounds', 'raise_dead']
      },
      'Light Domain': {
        cantrips: ['sacred_flame', 'light', 'guidance'],
        1: ['burning_hands', 'faerie_fire', 'cure_wounds'],
        2: ['scorching_ray', 'flaming_sphere'],
        3: ['fireball', 'daylight'],
        4: ['wall_of_fire', 'guardian_of_faith'],
        5: ['flame_strike']
      },
      // Sorcerer bloodlines
      'Draconic Bloodline': {
        cantrips: ['fire_bolt', 'mage_hand', 'prestidigitation'],
        1: ['burning_hands', 'shield', 'mage_armor'],
        2: ['scorching_ray', 'dragon_breath'],
        3: ['fireball', 'fly', 'fear'],
        4: ['wall_of_fire', 'polymorph'],
        5: ['cone_of_cold', 'dominate_person']
      },
      // Warlock patrons
      'The Fiend': {
        cantrips: ['eldritch_blast', 'mage_hand'],
        1: ['burning_hands', 'command', 'hex'],
        2: ['scorching_ray', 'suggestion'],
        3: ['fireball', 'vampiric_touch'],
        4: ['wall_of_fire', 'dimension_door'],
        5: ['flame_strike']
      },
      // Druid circles
      'Circle of the Moon': {
        cantrips: ['guidance', 'produce_flame', 'shillelagh'],
        1: ['cure_wounds', 'entangle', 'goodberry'],
        2: ['moonbeam', 'pass_without_trace', 'healing_spirit'],
        3: ['call_lightning', 'conjure_animals'],
        4: ['polymorph', 'giant_insect'],
        5: ['mass_cure_wounds']
      },
      // Bard colleges
      'College of Lore': {
        cantrips: ['vicious_mockery', 'mage_hand', 'minor_illusion'],
        1: ['cure_wounds', 'healing_word', 'detect_magic', 'identify'],
        2: ['invisibility', 'suggestion', 'heat_metal'],
        3: ['counterspell', 'hypnotic_pattern'],
        4: ['polymorph', 'dimension_door'],
        5: ['mass_cure_wounds', 'dominate_person']
      }
    };

    // Spell definitions with more complete data
    const spellDefinitions = {
      // Cantrips
      fire_bolt: { name: 'Fire Bolt', icon: '🔥', damage: '1d10', school: 'Evocation', description: 'Hurl a mote of fire at a creature', castingTime: '1 action', range: '120 feet', components: 'V, S', duration: 'Instantaneous', attackRoll: true },
      ray_of_frost: { name: 'Ray of Frost', icon: '❄️', damage: '1d8', school: 'Evocation', description: 'Frigid beam of blue-white light', castingTime: '1 action', range: '60 feet', components: 'V, S', duration: 'Instantaneous', attackRoll: true },
      sacred_flame: { name: 'Sacred Flame', icon: '✨', damage: '1d8', school: 'Evocation', description: 'Flame-like radiance descends', castingTime: '1 action', range: '60 feet', components: 'V, S', duration: 'Instantaneous', save: 'Dexterity' },
      guidance: { name: 'Guidance', icon: '🙏', damage: null, school: 'Divination', description: 'Touch creature to add d4 to ability check', castingTime: '1 action', range: 'Touch', components: 'V, S', duration: '1 minute', concentration: true },
      mage_hand: { name: 'Mage Hand', icon: '✋', damage: null, school: 'Conjuration', description: 'Spectral floating hand', castingTime: '1 action', range: '30 feet', components: 'V, S', duration: '1 minute' },
      eldritch_blast: { name: 'Eldritch Blast', icon: '💥', damage: '1d10', school: 'Evocation', description: 'Crackling beam of energy', castingTime: '1 action', range: '120 feet', components: 'V, S', duration: 'Instantaneous', attackRoll: true },
      light: { name: 'Light', icon: '💡', damage: null, school: 'Evocation', description: 'Object sheds bright light', castingTime: '1 action', range: 'Touch', components: 'V, M', duration: '1 hour' },
      vicious_mockery: { name: 'Vicious Mockery', icon: '🗣️', damage: '1d4', school: 'Enchantment', description: 'Unleash string of insults', castingTime: '1 action', range: '60 feet', components: 'V', duration: 'Instantaneous', save: 'Wisdom' },
      produce_flame: { name: 'Produce Flame', icon: '🔥', damage: '1d8', school: 'Conjuration', description: 'Flickering flame in palm', castingTime: '1 action', range: 'Self', components: 'V, S', duration: '10 minutes', attackRoll: true },
      prestidigitation: { name: 'Prestidigitation', icon: '✨', damage: null, school: 'Transmutation', description: 'Minor magical trick', castingTime: '1 action', range: '10 feet', components: 'V, S', duration: '1 hour' },
      minor_illusion: { name: 'Minor Illusion', icon: '👻', damage: null, school: 'Illusion', description: 'Create sound or image', castingTime: '1 action', range: '30 feet', components: 'S, M', duration: '1 minute' },
      shillelagh: { name: 'Shillelagh', icon: '🪵', damage: '1d8', school: 'Transmutation', description: 'Imbue club with nature magic', castingTime: '1 bonus action', range: 'Touch', components: 'V, S, M', duration: '1 minute' },

      // Level 1
      burning_hands: { name: 'Burning Hands', icon: '🔥', damage: '3d6', school: 'Evocation', description: 'Thin sheet of flames', castingTime: '1 action', range: 'Self (15-foot cone)', components: 'V, S', duration: 'Instantaneous', save: 'Dexterity' },
      magic_missile: { name: 'Magic Missile', icon: '✨', damage: '3d4+3', school: 'Evocation', description: 'Three darts of magical force', castingTime: '1 action', range: '120 feet', components: 'V, S', duration: 'Instantaneous' },
      shield: { name: 'Shield', icon: '🛡️', damage: null, school: 'Abjuration', description: '+5 AC until your next turn', castingTime: '1 reaction', range: 'Self', components: 'V, S', duration: '1 round' },
      cure_wounds: { name: 'Cure Wounds', icon: '❤️', damage: '1d8+3', school: 'Evocation', description: 'Heal creature you touch', castingTime: '1 action', range: 'Touch', components: 'V, S', duration: 'Instantaneous' },
      bless: { name: 'Bless', icon: '✨', damage: null, school: 'Enchantment', description: 'Add d4 to attacks and saves', castingTime: '1 action', range: '30 feet', components: 'V, S, M', duration: '1 minute', concentration: true },
      healing_word: { name: 'Healing Word', icon: '💚', damage: '1d4+3', school: 'Evocation', description: 'Heal with a word', castingTime: '1 bonus action', range: '60 feet', components: 'V', duration: 'Instantaneous' },
      thunderwave: { name: 'Thunderwave', icon: '⚡', damage: '2d8', school: 'Evocation', description: 'Wave of thunderous force', castingTime: '1 action', range: 'Self (15-foot cube)', components: 'V, S', duration: 'Instantaneous', save: 'Constitution' },
      mage_armor: { name: 'Mage Armor', icon: '🛡️', damage: null, school: 'Abjuration', description: 'Base AC becomes 13 + DEX', castingTime: '1 action', range: 'Touch', components: 'V, S, M', duration: '8 hours' },
      hex: { name: 'Hex', icon: '🎯', damage: '1d6', school: 'Enchantment', description: 'Curse target for extra damage', castingTime: '1 bonus action', range: '90 feet', components: 'V, S, M', duration: '1 hour', concentration: true },
      entangle: { name: 'Entangle', icon: '🌿', damage: null, school: 'Conjuration', description: 'Grasping weeds and vines', castingTime: '1 action', range: '90 feet', components: 'V, S', duration: '1 minute', concentration: true, save: 'Strength' },
      goodberry: { name: 'Goodberry', icon: '🫐', damage: null, school: 'Transmutation', description: '10 berries that heal 1 HP each', castingTime: '1 action', range: 'Touch', components: 'V, S, M', duration: '24 hours' },
      detect_magic: { name: 'Detect Magic', icon: '🔮', damage: null, school: 'Divination', description: 'Sense presence of magic', castingTime: '1 action', range: 'Self', components: 'V, S', duration: '10 minutes', concentration: true },

      // Level 2
      scorching_ray: { name: 'Scorching Ray', icon: '🔥', damage: '2d6', school: 'Evocation', description: 'Three rays of fire', castingTime: '1 action', range: '120 feet', components: 'V, S', duration: 'Instantaneous', attackRoll: true },
      shatter: { name: 'Shatter', icon: '💥', damage: '3d8', school: 'Evocation', description: 'Sudden loud ringing noise', castingTime: '1 action', range: '60 feet', components: 'V, S, M', duration: 'Instantaneous', save: 'Constitution' },
      spiritual_weapon: { name: 'Spiritual Weapon', icon: '⚔️', damage: '1d8+3', school: 'Evocation', description: 'Floating spectral weapon', castingTime: '1 bonus action', range: '60 feet', components: 'V, S', duration: '1 minute' },
      moonbeam: { name: 'Moonbeam', icon: '🌙', damage: '2d10', school: 'Evocation', description: 'Column of silvery light', castingTime: '1 action', range: '120 feet', components: 'V, S, M', duration: '1 minute', concentration: true, save: 'Constitution' },
      prayer_of_healing: { name: 'Prayer of Healing', icon: '🙏', damage: '2d8+3', school: 'Evocation', description: 'Heal up to 6 creatures', castingTime: '10 minutes', range: '30 feet', components: 'V', duration: 'Instantaneous' },

      // Level 3
      fireball: { name: 'Fireball', icon: '🔥', damage: '8d6', school: 'Evocation', description: 'Streak of flame explodes', castingTime: '1 action', range: '150 feet', components: 'V, S, M', duration: 'Instantaneous', save: 'Dexterity' },
      lightning_bolt: { name: 'Lightning Bolt', icon: '⚡', damage: '8d6', school: 'Evocation', description: 'Stroke of lightning', castingTime: '1 action', range: 'Self (100-foot line)', components: 'V, S, M', duration: 'Instantaneous', save: 'Dexterity' },
      counterspell: { name: 'Counterspell', icon: '🚫', damage: null, school: 'Abjuration', description: 'Interrupt creature casting spell', castingTime: '1 reaction', range: '60 feet', components: 'S', duration: 'Instantaneous' },
      dispel_magic: { name: 'Dispel Magic', icon: '✋', damage: null, school: 'Abjuration', description: 'End spells on target', castingTime: '1 action', range: '120 feet', components: 'V, S', duration: 'Instantaneous' },
      revivify: { name: 'Revivify', icon: '💫', damage: null, school: 'Necromancy', description: 'Return creature to life', castingTime: '1 action', range: 'Touch', components: 'V, S, M', duration: 'Instantaneous' },
      mass_healing_word: { name: 'Mass Healing Word', icon: '💚', damage: '1d4+3', school: 'Evocation', description: 'Heal up to 6 creatures', castingTime: '1 bonus action', range: '60 feet', components: 'V', duration: 'Instantaneous' },
      call_lightning: { name: 'Call Lightning', icon: '⚡', damage: '3d10', school: 'Conjuration', description: 'Storm cloud rains lightning', castingTime: '1 action', range: '120 feet', components: 'V, S', duration: '10 minutes', concentration: true, save: 'Dexterity' },
      hypnotic_pattern: { name: 'Hypnotic Pattern', icon: '🌀', damage: null, school: 'Illusion', description: 'Twisting pattern of colors', castingTime: '1 action', range: '120 feet', components: 'S, M', duration: '1 minute', concentration: true, save: 'Wisdom' },
      fly: { name: 'Fly', icon: '🦅', damage: null, school: 'Transmutation', description: 'Grant flying speed', castingTime: '1 action', range: 'Touch', components: 'V, S, M', duration: '10 minutes', concentration: true },

      // Level 4-5
      polymorph: { name: 'Polymorph', icon: '🐸', damage: null, school: 'Transmutation', description: 'Transform into beast', castingTime: '1 action', range: '60 feet', components: 'V, S, M', duration: '1 hour', concentration: true, save: 'Wisdom' },
      wall_of_fire: { name: 'Wall of Fire', icon: '🔥', damage: '5d8', school: 'Evocation', description: 'Wall of flames', castingTime: '1 action', range: '120 feet', components: 'V, S, M', duration: '1 minute', concentration: true, save: 'Dexterity' },
      cone_of_cold: { name: 'Cone of Cold', icon: '❄️', damage: '8d8', school: 'Evocation', description: 'Blast of cold air', castingTime: '1 action', range: 'Self (60-foot cone)', components: 'V, S, M', duration: 'Instantaneous', save: 'Constitution' },
      mass_cure_wounds: { name: 'Mass Cure Wounds', icon: '❤️', damage: '3d8+3', school: 'Evocation', description: 'Heal up to 6 creatures', castingTime: '1 action', range: '60 feet', components: 'V, S', duration: 'Instantaneous' },
      flame_strike: { name: 'Flame Strike', icon: '🔥', damage: '8d6', school: 'Evocation', description: 'Column of divine fire', castingTime: '1 action', range: '60 feet', components: 'V, S, M', duration: 'Instantaneous', save: 'Dexterity' }
    };

'''

    if 'const subclassSpells' not in content:
        content = content[:ability_db_end] + spell_themes + content[ability_db_end:]
        print("✅ Added subclass spell databases")

# Write the file
with open('test-enhanced-features.html', 'w') as f:
    f.write(content)

print("\n✅ Part 1 complete - Added spell databases")
print("Next: Updating auto-populate logic...")
