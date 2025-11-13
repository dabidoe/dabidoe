/**
 * Demo character data for development and testing
 * TODO: Replace with API calls in production
 */

export const demoCharacters = {
  burlon: {
    id: 'burlon',
    name: 'Burlon Throatchoppa',
    race: 'Half-Orc',
    class: 'Ranger',
    subclass: 'Hunter',
    level: 6,
    hp: { current: 58, max: 58 },
    ac: 16, // Medium armor + Dex
    initiative: 3,
    speed: 30,
    portrait: '🪓',
    portraitUrl: 'https://api.dicebear.com/7.x/adventurer/svg?seed=burlon&backgroundColor=1a1a1a&radius=10',
    stats: {
      str: 18,  // +2 from Half-Orc racial
      dex: 16,
      con: 16,  // +1 from Half-Orc racial
      int: 10,
      wis: 14,  // For spellcasting
      cha: 8
    },
    proficiencyBonus: 3,
    proficiencies: ['Athletics', 'Survival', 'Perception', 'Stealth', 'Nature'],
    abilities: [
      {
        abilityId: 'greataxe-attack',
        name: 'Greataxe Attack',
        category: 'attack',
        equipped: true,
        details: {
          name: 'Greataxe Attack',
          shortDescription: 'Devastating two-handed axe strike',
          damage: '1d12 + 4',
          damageType: 'slashing',
          attackBonus: 7, // +3 prof + +4 str
          iconLayers: [['🪓']]
        }
      },
      {
        abilityId: 'handaxe-throw',
        name: 'Handaxe Throw',
        category: 'attack',
        equipped: true,
        details: {
          name: 'Handaxe Throw',
          shortDescription: 'Throw a light axe at a distant target',
          damage: '1d6 + 4',
          damageType: 'slashing',
          range: '20/60 ft',
          attackBonus: 7,
          iconLayers: [['🪓']]
        }
      },
      {
        abilityId: 'colossus-slayer',
        name: 'Colossus Slayer',
        category: 'combat',
        equipped: true,
        details: {
          name: 'Colossus Slayer',
          shortDescription: 'Deal extra 1d8 damage to wounded foes (once per turn)',
          school: 'Hunter Feature',
          damage: '+1d8',
          iconLayers: [['⚔️', '💀']]
        }
      },
      {
        abilityId: 'hunters-mark',
        name: "Hunter's Mark",
        category: 'spell',
        type: 'leveled-spell',
        level: 1,
        prepared: true,
        details: {
          name: "Hunter's Mark",
          shortDescription: 'Mark a target for +1d6 damage and tracking advantage',
          school: 'Divination',
          level: 1,
          castingTime: '1 bonus action',
          range: '90 feet',
          duration: 'Concentration, up to 1 hour',
          components: 'V',
          description: 'Mark a creature you can see. Until the spell ends, you deal an extra 1d6 damage whenever you hit it, and you have advantage on Wisdom (Perception) and Wisdom (Survival) checks to find it.',
          iconLayers: [['🎯']]
        }
      },
      {
        abilityId: 'cure-wounds',
        name: 'Cure Wounds',
        category: 'spell',
        type: 'leveled-spell',
        level: 1,
        prepared: true,
        details: {
          name: 'Cure Wounds',
          shortDescription: 'Heal 1d8 + Wisdom modifier HP',
          school: 'Evocation',
          level: 1,
          castingTime: '1 action',
          range: 'Touch',
          duration: 'Instantaneous',
          components: 'V, S',
          description: 'Touch a creature to restore 1d8 + your spellcasting modifier hit points.',
          iconLayers: [['💚']]
        }
      },
      {
        abilityId: 'goodberry',
        name: 'Goodberry',
        category: 'spell',
        type: 'leveled-spell',
        level: 1,
        prepared: true,
        details: {
          name: 'Goodberry',
          shortDescription: 'Create 10 berries that heal 1 HP each',
          school: 'Transmutation',
          level: 1,
          castingTime: '1 action',
          range: 'Touch',
          duration: '24 hours',
          components: 'V, S, M',
          description: 'Up to ten berries appear in your hand. A creature can use its action to eat one berry to regain 1 hit point.',
          iconLayers: [['🫐']]
        }
      },
      {
        abilityId: 'ensnaring-strike',
        name: 'Ensnaring Strike',
        category: 'spell',
        type: 'leveled-spell',
        level: 1,
        prepared: true,
        details: {
          name: 'Ensnaring Strike',
          shortDescription: 'Restrain target with magical vines on hit',
          school: 'Conjuration',
          level: 1,
          castingTime: '1 bonus action',
          range: 'Self',
          duration: 'Concentration, up to 1 minute',
          components: 'V',
          description: 'Next time you hit with a weapon attack, vines sprout and restrain the target (Str save to escape).',
          iconLayers: [['🌿', '⛓️']]
        }
      },
      {
        abilityId: 'extra-attack',
        name: 'Extra Attack',
        category: 'combat',
        equipped: true,
        details: {
          name: 'Extra Attack',
          shortDescription: 'Attack twice when you take the Attack action',
          school: 'Class Feature',
          iconLayers: [['⚔️', '⚔️']]
        }
      },
      {
        abilityId: 'favored-enemy-humanoid',
        name: 'Favored Enemy: Humanoids',
        category: 'utility',
        equipped: true,
        details: {
          name: 'Favored Enemy: Humanoids',
          shortDescription: 'Advantage on tracking and knowledge of humanoids',
          school: 'Ranger Feature',
          iconLayers: [['🎯', '👥']]
        }
      },
      {
        abilityId: 'natural-explorer',
        name: 'Natural Explorer',
        category: 'utility',
        equipped: true,
        details: {
          name: 'Natural Explorer',
          shortDescription: 'Expertise in wilderness survival and navigation',
          school: 'Ranger Feature',
          iconLayers: [['🌲', '🧭']]
        }
      },
      {
        abilityId: 'relentless-endurance',
        name: 'Relentless Endurance',
        category: 'defensive',
        equipped: true,
        details: {
          name: 'Relentless Endurance',
          shortDescription: 'Drop to 1 HP instead of 0 (once per long rest)',
          school: 'Half-Orc Racial',
          iconLayers: [['💪', '❤️']]
        }
      }
    ],
    spellSlots: {
      1: { max: 4, current: 4 },
      2: { max: 2, current: 2 }
    },
    equipment: [
      { id: 'greataxe', name: 'Greataxe', equipped: true, slot: 'mainHand' },
      { id: 'handaxe', name: 'Handaxe x2', equipped: true, slot: 'belt', quantity: 2 },
      { id: 'leather-armor', name: 'Studded Leather Armor', equipped: true, slot: 'body' },
      { id: 'backpack', name: 'Backpack', equipped: true },
      { id: 'rations', name: 'Rations', quantity: 10 },
      { id: 'rope-hemp', name: 'Hempen Rope', quantity: 1 },
      { id: 'potion-healing', name: 'Potion of Healing', quantity: 2 }
    ],
    initialMessage: {
      type: 'character',
      mood: 'Gruff',
      text: "Burlon Throatchoppa. Hunter. Tracker. If you're lookin' for someone or somethin', I'm the one who finds 'em. And if they need findin' with an axe... well, that's even better."
    },
    personality: {
      traits: [
        'Direct and no-nonsense',
        'Expert tracker and survivalist',
        'Fiercely loyal to companions'
      ],
      background: 'Outlander',
      alignment: 'Chaotic Good'
    }
  },

  achilles: {
    id: 'achilles',
    name: 'Achilles',
    hp: { current: 104, max: 104 },
    ac: 18,
    portrait: '🛡️',
    portraitUrl: 'https://api.dicebear.com/7.x/adventurer/svg?seed=achilles&backgroundColor=1a1a1a&radius=10',
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
      },
      {
        abilityId: 'tell-story',
        name: 'Tell Story',
        category: 'social',
        equipped: true,
        details: {
          name: 'Tell Story',
          shortDescription: 'Share tales from legendary battles',
          iconLayers: [['📖']]
        }
      },
      {
        abilityId: 'current-quest',
        name: 'Current Quest',
        category: 'social',
        equipped: true,
        details: {
          name: 'Current Quest',
          shortDescription: 'Discuss the journey to freedom',
          iconLayers: [['🗺️']]
        }
      }
    ],
    initialMessage: {
      type: 'character',
      mood: 'Contemplative',
      text: "You find me in a moment of reflection. The weight of eight decades rests upon these shoulders, yet I appear as I did in my prime at Troy."
    }
  }
}

export const demoCharacterList = [
  {
    id: 'burlon',
    name: 'Burlon Throatchoppa',
    title: 'Half-Orc Hunter',
    portrait: '🪓',
    description: 'A gruff tracker and hunter wielding greataxe and handaxes. Expert in tracking prey and bringing down wounded foes.',
    available: true
  },
  {
    id: 'achilles',
    name: 'Achilles',
    title: 'Hero of Troy',
    portrait: '🛡️',
    description: 'An 80-year-old immortal who hasn\'t aged a day since Troy. Contemplating eight decades of life.',
    available: true
  }
]

export const getDemoCharacter = (characterId) => {
  return demoCharacters[characterId] || null
}

export const getDemoCharacterList = () => {
  return demoCharacterList
}
