// Mock character data for Fighter, Mage, Cleric
// Realistic D&D 5e stats and abilities

export const mockCharacters = {
  fighter: {
    id: 'fighter-01',
    name: 'Valeria Ironheart',
    class: 'Fighter',
    level: 5,
    race: 'Human',
    portrait: '🛡️',
    hp: { current: 47, max: 47 },
    ac: 18,
    speed: 30,
    stats: {
      str: 18,
      dex: 14,
      con: 16,
      int: 10,
      wis: 12,
      cha: 8
    },
    proficiencyBonus: 3,
    proficiencies: [
      'Athletics',
      'Intimidation',
      'Perception',
      'Survival',
      'All Armor',
      'All Weapons',
      'Shields'
    ],
    abilities: [
      {
        abilityId: 'greatsword-attack',
        name: 'Greatsword Attack',
        category: 'attack',
        icon: '⚔️',
        details: {
          name: 'Greatsword Attack',
          shortDescription: 'Melee weapon attack with a mighty greatsword. +7 to hit, 2d6+4 slashing damage.',
          school: 'Martial',
          iconLayers: [['⚔️']]
        }
      },
      {
        abilityId: 'action-surge',
        name: 'Action Surge',
        category: 'attack',
        icon: '💥',
        details: {
          name: 'Action Surge',
          shortDescription: 'Take one additional action on your turn. Recharges on short or long rest.',
          school: 'Fighter Feature',
          iconLayers: [['💥']]
        }
      },
      {
        abilityId: 'second-wind',
        name: 'Second Wind',
        category: 'attack',
        icon: '💚',
        details: {
          name: 'Second Wind',
          shortDescription: 'Regain 1d10 + 5 hit points as a bonus action. Recharges on short or long rest.',
          school: 'Fighter Feature',
          iconLayers: [['💚']]
        }
      }
    ],
    items: [
      { id: 'item-1', name: 'Greatsword', icon: '⚔️' },
      { id: 'item-2', name: 'Plate Armor', icon: '🛡️' },
      { id: 'item-3', name: 'Healing Potion', icon: '🧪' },
      { id: 'item-4', name: 'Rope (50ft)', icon: '🪢' },
      { id: 'item-5', name: 'Rations (5 days)', icon: '🍖' },
      { id: 'item-6', name: 'Backpack', icon: '🎒' }
    ],
    weapons: [
      { id: 'weapon-1', name: 'Greatsword', icon: '⚔️', description: '2d6 slashing', rarity: 'Common', type: 'Weapon' }
    ],
    imageLayers: [] // Will use emoji fallback
  },

  mage: {
    id: 'mage-01',
    name: 'Elara Moonwhisper',
    class: 'Wizard',
    level: 5,
    race: 'High Elf',
    portrait: '🔮',
    hp: { current: 28, max: 28 },
    ac: 12,
    speed: 30,
    stats: {
      str: 8,
      dex: 14,
      con: 12,
      int: 18,
      wis: 13,
      cha: 10
    },
    proficiencyBonus: 3,
    proficiencies: [
      'Arcana',
      'History',
      'Investigation',
      'Perception',
      'Daggers',
      'Darts',
      'Slings',
      'Quarterstaffs',
      'Light Crossbows'
    ],
    abilities: [
      {
        abilityId: 'quarterstaff',
        name: 'Quarterstaff',
        category: 'attack',
        icon: '🪄',
        details: {
          name: 'Quarterstaff',
          shortDescription: 'Melee weapon attack. +1 to hit, 1d6-1 bludgeoning damage.',
          school: 'Simple Weapon',
          iconLayers: [['🪄']]
        }
      },
      {
        abilityId: 'fire-bolt',
        name: 'Fire Bolt',
        category: 'spell',
        icon: '🔥',
        details: {
          name: 'Fire Bolt',
          shortDescription: 'Ranged spell attack. +7 to hit, 2d10 fire damage. Range 120 ft.',
          school: 'Evocation',
          level: 0,
          iconLayers: [['🔥']]
        }
      },
      {
        abilityId: 'magic-missile',
        name: 'Magic Missile',
        category: 'spell',
        icon: '✨',
        details: {
          name: 'Magic Missile',
          shortDescription: 'Create three darts of magical force. Each dart hits for 1d4+1 force damage. Auto-hit.',
          school: 'Evocation',
          level: 1,
          iconLayers: [['✨']]
        }
      },
      {
        abilityId: 'fireball',
        name: 'Fireball',
        category: 'spell',
        icon: '💥',
        details: {
          name: 'Fireball',
          shortDescription: 'A bright streak flashes to a point within 150 feet, exploding in a 20-foot radius. 8d6 fire damage.',
          school: 'Evocation',
          level: 3,
          iconLayers: [['💥']]
        }
      },
      {
        abilityId: 'shield-spell',
        name: 'Shield',
        category: 'spell',
        icon: '🛡️',
        details: {
          name: 'Shield',
          shortDescription: 'Reaction spell. +5 bonus to AC until start of your next turn.',
          school: 'Abjuration',
          level: 1,
          iconLayers: [['🛡️']]
        }
      },
      {
        abilityId: 'counterspell',
        name: 'Counterspell',
        category: 'spell',
        icon: '🚫',
        details: {
          name: 'Counterspell',
          shortDescription: 'Interrupt a spell being cast within 60 feet. Automatically counters spells of 3rd level or lower.',
          school: 'Abjuration',
          level: 3,
          iconLayers: [['🚫']]
        }
      }
    ],
    items: [
      { id: 'item-1', name: 'Spellbook', icon: '📖' },
      { id: 'item-2', name: 'Quarterstaff', icon: '🪄' },
      { id: 'item-3', name: 'Component Pouch', icon: '🎒' },
      { id: 'item-4', name: 'Robes', icon: '👘' },
      { id: 'item-5', name: 'Ink & Quill', icon: '🖊️' },
      { id: 'item-6', name: 'Arcane Focus', icon: '💎' }
    ],
    weapons: [
      { id: 'weapon-1', name: 'Quarterstaff', icon: '🪄', description: '1d6 bludgeoning', rarity: 'Common', type: 'Weapon' }
    ],
    imageLayers: []
  },

  cleric: {
    id: 'cleric-01',
    name: 'Brother Aldric',
    class: 'Cleric',
    level: 5,
    race: 'Dwarf',
    portrait: '⛪',
    hp: { current: 40, max: 40 },
    ac: 16,
    speed: 25,
    stats: {
      str: 14,
      dex: 10,
      con: 15,
      int: 12,
      wis: 18,
      cha: 13
    },
    proficiencyBonus: 3,
    proficiencies: [
      'Insight',
      'Medicine',
      'Persuasion',
      'Religion',
      'Light Armor',
      'Medium Armor',
      'Shields',
      'Simple Weapons'
    ],
    abilities: [
      {
        abilityId: 'warhammer',
        name: 'Warhammer',
        category: 'attack',
        icon: '🔨',
        details: {
          name: 'Warhammer',
          shortDescription: 'Melee weapon attack. +5 to hit, 1d8+2 bludgeoning damage.',
          school: 'Martial',
          iconLayers: [['🔨']]
        }
      },
      {
        abilityId: 'sacred-flame',
        name: 'Sacred Flame',
        category: 'spell',
        icon: '🕯️',
        details: {
          name: 'Sacred Flame',
          shortDescription: 'Flame-like radiance descends on a creature you can see. 2d8 radiant damage (Dex save).',
          school: 'Evocation',
          level: 0,
          iconLayers: [['🕯️']]
        }
      },
      {
        abilityId: 'cure-wounds',
        name: 'Cure Wounds',
        category: 'spell',
        icon: '💚',
        details: {
          name: 'Cure Wounds',
          shortDescription: 'Touch a creature to restore 1d8 + 4 hit points.',
          school: 'Evocation',
          level: 1,
          iconLayers: [['💚']]
        }
      },
      {
        abilityId: 'spiritual-weapon',
        name: 'Spiritual Weapon',
        category: 'spell',
        icon: '👻',
        details: {
          name: 'Spiritual Weapon',
          shortDescription: 'Create a floating spectral weapon. Bonus action to attack for 1d8+4 force damage.',
          school: 'Evocation',
          level: 2,
          iconLayers: [['👻']]
        }
      },
      {
        abilityId: 'spirit-guardians',
        name: 'Spirit Guardians',
        category: 'spell',
        icon: '👼',
        details: {
          name: 'Spirit Guardians',
          shortDescription: 'Call forth spirits to protect you. 15-foot radius, 3d8 radiant damage to enemies.',
          school: 'Conjuration',
          level: 3,
          iconLayers: [['👼']]
        }
      },
      {
        abilityId: 'channel-divinity',
        name: 'Channel Divinity',
        category: 'spell',
        icon: '✨',
        details: {
          name: 'Channel Divinity',
          shortDescription: 'Turn Undead or use your Divine Domain feature. Recharges on short or long rest.',
          school: 'Divine',
          level: 2,
          iconLayers: [['✨']]
        }
      }
    ],
    items: [
      { id: 'item-1', name: 'Warhammer', icon: '🔨' },
      { id: 'item-2', name: 'Chain Mail', icon: '🛡️' },
      { id: 'item-3', name: 'Holy Symbol', icon: '✝️' },
      { id: 'item-4', name: 'Prayer Book', icon: '📿' },
      { id: 'item-5', name: 'Healer\'s Kit', icon: '🏥' },
      { id: 'item-6', name: 'Holy Water', icon: '💧' }
    ],
    weapons: [
      { id: 'weapon-1', name: 'Warhammer', icon: '🔨', description: '1d8 bludgeoning', rarity: 'Common', type: 'Weapon' }
    ],
    imageLayers: []
  },

  // Original Achilles for backwards compatibility
  achilles: {
    id: 'achilles',
    name: 'Achilles',
    class: 'Legendary Warrior',
    level: 10,
    race: 'Demigod',
    portrait: '🛡️',
    hp: { current: 104, max: 104 },
    ac: 18,
    speed: 40,
    stats: {
      str: 20,
      dex: 16,
      con: 18,
      int: 12,
      wis: 14,
      cha: 16
    },
    proficiencyBonus: 4,
    proficiencies: ['Athletics', 'Intimidation', 'Perception', 'Survival'],
    abilities: [
      {
        abilityId: 'sword-strike',
        name: 'Sword Strike',
        category: 'attack',
        equipped: true,
        details: {
          name: 'Sword Strike',
          shortDescription: 'A powerful melee attack with divine-forged blade',
          school: 'Evocation',
          iconLayers: [['⚔️']]
        }
      },
      {
        abilityId: 'divine-fury',
        name: 'Divine Fury',
        category: 'spell',
        equipped: true,
        details: {
          name: 'Divine Fury',
          shortDescription: 'Channel divine wrath into a devastating strike',
          school: 'Evocation',
          level: 3,
          iconLayers: [['🔥']]
        }
      },
      {
        abilityId: 'spear-thrust',
        name: 'Spear Thrust',
        category: 'attack',
        equipped: true,
        details: {
          name: 'Spear Thrust',
          shortDescription: 'Legendary spear attack from Troy',
          school: 'Evocation',
          iconLayers: [['🗡️']]
        }
      },
      {
        abilityId: 'shield-wall',
        name: 'Shield Wall',
        category: 'spell',
        equipped: true,
        details: {
          name: 'Shield Wall',
          shortDescription: 'Protective stance that deflects attacks',
          school: 'Abjuration',
          level: 2,
          iconLayers: [['🛡️']]
        }
      }
    ],
    items: [
      { id: 'item-1', name: 'Divine Shield', icon: '🛡️' },
      { id: 'item-2', name: 'Bronze Spear', icon: '🗡️' },
      { id: 'item-3', name: 'Trojan Armor', icon: '⚔️' }
    ],
    weapons: [],
    imageLayers: []
  },

  // Fully built character with linked BunnyCDN assets
  'gandalf-01': {
    id: 'gandalf-01',
    name: 'Gandalf the Grey',
    class: 'Wizard',
    level: 20,
    race: 'Maiar (appears as old man)',
    portrait: '🧙‍♂️',
    hp: { current: 130, max: 130 },
    ac: 15,
    speed: 30,
    stats: {
      str: 10,
      dex: 14,
      con: 16,
      int: 22,
      wis: 20,
      cha: 18
    },
    proficiencyBonus: 6,
    proficiencies: [
      'Arcana',
      'History',
      'Insight',
      'Perception',
      'Persuasion',
      'All Simple Weapons',
      'Light Armor'
    ],
    voiceId: 'pNInz6obpgDQGcFmaJgB', // ElevenLabs voice ID (Adam - wise voice)
    abilities: [
      {
        abilityId: 'staff-strike',
        name: 'Staff Strike',
        category: 'attack',
        icon: '🪄',
        imageId: 'weapons/wizard_staff.png', // BunnyCDN path
        details: {
          name: 'Staff Strike',
          shortDescription: 'Strike with an ancient wizard staff. +6 to hit, 1d6+2 bludgeoning damage.',
          school: 'Martial',
          iconLayers: [['🪄']]
        }
      },
      {
        abilityId: 'fireball',
        name: 'Fireball',
        category: 'spell',
        icon: '🔥',
        imageId: 'spells/fireball_epic.png', // BunnyCDN path
        details: {
          name: 'Fireball',
          shortDescription: 'A roaring sphere of flame streaks to a point within 150 feet, exploding in a 20-foot radius sphere. 8d6 fire damage.',
          school: 'Evocation',
          level: 3,
          iconLayers: [['🔥']]
        }
      },
      {
        abilityId: 'lightning-bolt',
        name: 'Lightning Bolt',
        category: 'spell',
        icon: '⚡',
        imageId: 'spells/lightning_bolt.png', // BunnyCDN path
        details: {
          name: 'Lightning Bolt',
          shortDescription: 'A stroke of lightning forming a line 100 feet long and 5 feet wide. 8d6 lightning damage.',
          school: 'Evocation',
          level: 3,
          iconLayers: [['⚡']]
        }
      },
      {
        abilityId: 'shield-spell',
        name: 'Shield',
        category: 'spell',
        icon: '🛡️',
        imageId: 'spells/shield_arcane.png', // BunnyCDN path
        details: {
          name: 'Shield',
          shortDescription: 'An invisible barrier of magical force appears and protects you. +5 AC until start of your next turn.',
          school: 'Abjuration',
          level: 1,
          iconLayers: [['🛡️']]
        }
      },
      {
        abilityId: 'counterspell',
        name: 'Counterspell',
        category: 'spell',
        icon: '🚫',
        imageId: 'spells/counterspell.png', // BunnyCDN path
        details: {
          name: 'Counterspell',
          shortDescription: 'You attempt to interrupt a creature casting a spell. Automatically counters spells of 3rd level or lower.',
          school: 'Abjuration',
          level: 3,
          iconLayers: [['🚫']]
        }
      },
      {
        abilityId: 'meteor-swarm',
        name: 'Meteor Swarm',
        category: 'spell',
        icon: '☄️',
        imageId: 'spells/meteor_swarm.png', // BunnyCDN path
        details: {
          name: 'Meteor Swarm',
          shortDescription: 'Blazing orbs of fire plummet to the ground at four points within range. Each creature takes 20d6 fire damage and 20d6 bludgeoning damage.',
          school: 'Evocation',
          level: 9,
          iconLayers: [['☄️']]
        }
      },
      {
        abilityId: 'word-of-recall',
        name: 'Word of Recall',
        category: 'spell',
        icon: '🌟',
        imageId: 'spells/teleport.png', // BunnyCDN path
        details: {
          name: 'Word of Recall',
          shortDescription: 'You and up to five willing creatures instantly teleport to a previously designated sanctuary.',
          school: 'Conjuration',
          level: 6,
          iconLayers: [['🌟']]
        }
      }
    ],
    items: [
      {
        id: 'item-1',
        name: 'Wizard Staff',
        icon: '🪄',
        imageId: 'items/wizard_staff.png', // BunnyCDN path
        description: 'An ancient staff of power',
        rarity: 'Legendary',
        type: 'Weapon'
      },
      {
        id: 'item-2',
        name: 'Spellbook of Secrets',
        icon: '📖',
        imageId: 'items/spellbook_ancient.png', // BunnyCDN path
        description: 'Contains countless powerful spells',
        rarity: 'Legendary',
        type: 'Tool'
      },
      {
        id: 'item-3',
        name: 'Robes of the Archmagi',
        icon: '👘',
        imageId: 'items/robes_archmage.png', // BunnyCDN path
        description: 'Grey robes that grant +2 AC and advantage on saving throws against spells',
        rarity: 'Legendary',
        type: 'Armor'
      },
      {
        id: 'item-4',
        name: 'Ring of Wizardry',
        icon: '💍',
        imageId: 'items/ring_magic.png', // BunnyCDN path
        description: 'Doubles the number of 1st and 2nd level spell slots',
        rarity: 'Legendary',
        type: 'Ring'
      },
      {
        id: 'item-5',
        name: 'Pipe-weed',
        icon: '🚬',
        imageId: 'items/pipe.png', // BunnyCDN path
        description: 'For relaxation and contemplation',
        rarity: 'Common',
        type: 'Consumable'
      },
      {
        id: 'item-6',
        name: 'Glamdring (Foe-hammer)',
        icon: '⚔️',
        imageId: 'items/sword_elven.png', // BunnyCDN path
        description: 'An Elven blade that glows blue when orcs are near',
        rarity: 'Legendary',
        type: 'Weapon'
      }
    ],
    weapons: [
      {
        id: 'weapon-1',
        name: 'Wizard Staff',
        icon: '🪄',
        imageId: 'weapons/wizard_staff.png', // BunnyCDN path
        description: '1d6+2 bludgeoning, can cast Light at will',
        rarity: 'Legendary',
        type: 'Weapon'
      },
      {
        id: 'weapon-2',
        name: 'Glamdring',
        icon: '⚔️',
        imageId: 'weapons/sword_elven.png', // BunnyCDN path
        description: '1d8+3 slashing, +2 vs orcs and goblins',
        rarity: 'Legendary',
        type: 'Weapon'
      }
    ],
    imageLayers: [
      'characters/gandalf_base.png',      // Base character image
      'characters/gandalf_robes.png',     // Grey robes layer
      'characters/gandalf_staff.png',     // Staff layer
      'characters/gandalf_effects.png'    // Magical effects layer
    ],
    initialMessage: {
      type: 'character',
      mood: 'Wise',
      text: "A wizard is never late, nor is he early. He arrives precisely when he means to. What brings you to seek my counsel?"
    }
  }
}
