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
    huntersPrey: 'colossus-slayer',
    level: 20,
    hp: { current: 180, max: 180 },
    ac: 18,
    initiative: 4,
    speed: 30,
    portrait: '🪓',
    portraitUrl: 'https://api.dicebear.com/7.x/adventurer/svg?seed=burlon&backgroundColor=1a1a1a&radius=10',
    stats: {
      str: 20,
      dex: 20,
      con: 18,
      int: 10,
      wis: 16,
      cha: 8
    },
    proficiencyBonus: 6,
    proficiencies: ['Athletics', 'Survival', 'Perception', 'Stealth', 'Nature'],
    background: 'Outlander',
    alignment: 'Chaotic Good',
    initialMessage: {
      type: 'character',
      mood: 'Gruff',
      text: "Burlon Throatchoppa. Master hunter. Legendary tracker. No beast escapes me, no prey survives. The wilderness itself bends to my will."
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
    race: 'Human',
    class: 'Fighter',
    subclass: 'Champion',
    level: 20,
    hp: { current: 220, max: 220 },
    ac: 20,
    initiative: 4,
    speed: 30,
    portrait: '🛡️',
    portraitUrl: 'https://api.dicebear.com/7.x/adventurer/svg?seed=achilles&backgroundColor=1a1a1a&radius=10',
    stats: {
      str: 20,
      dex: 18,
      con: 20,
      int: 12,
      wis: 14,
      cha: 16
    },
    proficiencyBonus: 6,
    proficiencies: ['Athletics', 'Intimidation', 'Perception', 'Survival'],
    background: 'Soldier',
    alignment: 'Chaotic Neutral',
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
    },
    personality: {
      traits: [
        'Legendary warrior from the Trojan War',
        'Immortal but contemplative of mortality',
        'Haunted by glory and loss'
      ],
      background: 'Soldier',
      alignment: 'Chaotic Neutral'
    }
  },

  seraphina: {
    id: 'seraphina',
    name: 'Seraphina the Radiant',
    race: 'Human',
    class: 'Paladin',
    subclass: 'Oath of Devotion',
    level: 20,
    hp: { current: 200, max: 200 },
    ac: 21,
    initiative: 1,
    speed: 30,
    portrait: '⚔️',
    portraitUrl: 'https://api.dicebear.com/7.x/adventurer/svg?seed=seraphina&backgroundColor=1a1a1a&radius=10',
    stats: {
      str: 20,
      dex: 12,
      con: 18,
      int: 10,
      wis: 14,
      cha: 20
    },
    proficiencyBonus: 6,
    proficiencies: ['Athletics', 'Insight', 'Persuasion', 'Religion'],
    background: 'Noble',
    alignment: 'Lawful Good',
    initialMessage: {
      type: 'character',
      mood: 'Righteous',
      text: "I am Seraphina, living saint and champion of the divine. My blade is blessed by the gods themselves, and through my faith, miracles become reality."
    },
    personality: {
      traits: [
        'Unwavering devotion to honor and duty',
        'Compassionate protector of the weak',
        'Inspires courage in allies'
      ],
      background: 'Noble',
      alignment: 'Lawful Good'
    }
  },

  mordecai: {
    id: 'mordecai',
    name: 'Mordecai the Arcane',
    race: 'High Elf',
    class: 'Wizard',
    subclass: 'School of Evocation',
    level: 20,
    hp: { current: 140, max: 140 },
    ac: 16,
    initiative: 4,
    speed: 30,
    portrait: '🧙',
    portraitUrl: 'https://api.dicebear.com/7.x/adventurer/svg?seed=mordecai&backgroundColor=1a1a1a&radius=10',
    stats: {
      str: 8,
      dex: 18,
      con: 16,
      int: 20,
      wis: 14,
      cha: 10
    },
    proficiencyBonus: 6,
    proficiencies: ['Arcana', 'History', 'Investigation', 'Insight'],
    background: 'Sage',
    alignment: 'Neutral Good',
    initialMessage: {
      type: 'character',
      mood: 'Scholarly',
      text: "I am Mordecai, Archmage of the Evocation school. The very fabric of reality bends to my will. From my fingertips flow the raw forces of the cosmos."
    },
    personality: {
      traits: [
        'Insatiably curious about magical phenomena',
        'Methodical and precise in spellcasting',
        'Values knowledge above all else'
      ],
      background: 'Sage',
      alignment: 'Neutral Good'
    }
  },

  grommash: {
    id: 'grommash',
    name: 'Grommash Ironhide',
    race: 'Half-Orc',
    class: 'Barbarian',
    subclass: 'Path of the Totem Warrior',
    level: 20,
    hp: { current: 285, max: 285 },
    ac: 18,
    initiative: 2,
    speed: 40,
    portrait: '💀',
    portraitUrl: 'https://api.dicebear.com/7.x/adventurer/svg?seed=grommash&backgroundColor=1a1a1a&radius=10',
    stats: {
      str: 24,
      dex: 16,
      con: 22,
      int: 8,
      wis: 14,
      cha: 10
    },
    proficiencyBonus: 6,
    proficiencies: ['Athletics', 'Intimidation', 'Perception', 'Survival'],
    background: 'Outlander',
    alignment: 'Chaotic Neutral',
    initialMessage: {
      type: 'character',
      mood: 'Fierce',
      text: "Grommash Ironhide. I am rage incarnate. The spirits of the wild flow through my veins, and my enemies know only terror and death."
    },
    personality: {
      traits: [
        'Primal fury unleashed in combat',
        'Deep connection to nature spirits',
        'Nearly unkillable in battle'
      ],
      background: 'Outlander',
      alignment: 'Chaotic Neutral'
    }
  },

  lysandra: {
    id: 'lysandra',
    name: 'Lysandra Dawnbringer',
    race: 'Human',
    class: 'Cleric',
    subclass: 'Life Domain',
    level: 20,
    hp: { current: 180, max: 180 },
    ac: 19,
    initiative: 0,
    speed: 30,
    portrait: '⛪',
    portraitUrl: 'https://api.dicebear.com/7.x/adventurer/svg?seed=lysandra&backgroundColor=1a1a1a&radius=10',
    stats: {
      str: 14,
      dex: 10,
      con: 16,
      int: 12,
      wis: 20,
      cha: 16
    },
    proficiencyBonus: 6,
    proficiencies: ['Insight', 'Medicine', 'Persuasion', 'Religion'],
    background: 'Acolyte',
    alignment: 'Lawful Good',
    initialMessage: {
      type: 'character',
      mood: 'Serene',
      text: "I am Lysandra, High Priestess of the Dawn. Through divine grace, I channel the very essence of life itself. No wound is beyond my healing touch."
    },
    personality: {
      traits: [
        'Devoted servant of healing deities',
        'Compassionate and nurturing',
        'Channels immense divine power'
      ],
      background: 'Acolyte',
      alignment: 'Lawful Good'
    }
  },

  shadowmere: {
    id: 'shadowmere',
    name: 'Shadowmere',
    race: 'Halfling',
    class: 'Rogue',
    subclass: 'Assassin',
    level: 20,
    hp: { current: 160, max: 160 },
    ac: 19,
    initiative: 6,
    speed: 25,
    portrait: '🗡️',
    portraitUrl: 'https://api.dicebear.com/7.x/adventurer/svg?seed=shadowmere&backgroundColor=1a1a1a&radius=10',
    stats: {
      str: 12,
      dex: 20,
      con: 16,
      int: 16,
      wis: 14,
      cha: 14
    },
    proficiencyBonus: 6,
    proficiencies: ['Stealth', 'Acrobatics', 'Deception', 'Investigation', 'Perception', 'Sleight of Hand'],
    background: 'Criminal',
    alignment: 'Neutral',
    initialMessage: {
      type: 'character',
      mood: 'Mysterious',
      text: "They call me Shadowmere. If you've seen me, you're already dead. I am the whisper in the dark, the blade you never see coming."
    },
    personality: {
      traits: [
        'Master of stealth and deception',
        'Deadly precision in combat',
        'Prefers to observe before acting'
      ],
      background: 'Criminal',
      alignment: 'Neutral'
    }
  },

  kaelen: {
    id: 'kaelen',
    name: 'Kaelen Windwalker',
    race: 'Human',
    class: 'Monk',
    subclass: 'Way of the Open Hand',
    level: 20,
    hp: { current: 180, max: 180 },
    ac: 20,
    initiative: 5,
    speed: 60,
    portrait: '🥋',
    portraitUrl: 'https://api.dicebear.com/7.x/adventurer/svg?seed=kaelen&backgroundColor=1a1a1a&radius=10',
    stats: {
      str: 14,
      dex: 20,
      con: 16,
      int: 12,
      wis: 20,
      cha: 10
    },
    proficiencyBonus: 6,
    proficiencies: ['Acrobatics', 'Athletics', 'Insight', 'Stealth'],
    background: 'Hermit',
    alignment: 'Lawful Neutral',
    initialMessage: {
      type: 'character',
      mood: 'Calm',
      text: "I am Kaelen, master of the Way. My body is a weapon, my ki is limitless. I move faster than the eye can follow and strike with the force of a hurricane."
    },
    personality: {
      traits: [
        'Disciplined and focused',
        'Superhuman speed and reflexes',
        'Seeks perfect balance in all things'
      ],
      background: 'Hermit',
      alignment: 'Lawful Neutral'
    }
  },

  thornvale: {
    id: 'thornvale',
    name: 'Thornvale the Ancient',
    race: 'Wood Elf',
    class: 'Druid',
    subclass: 'Circle of the Moon',
    level: 20,
    hp: { current: 180, max: 180 },
    ac: 17,
    initiative: 2,
    speed: 35,
    portrait: '🌿',
    portraitUrl: 'https://api.dicebear.com/7.x/adventurer/svg?seed=thornvale&backgroundColor=1a1a1a&radius=10',
    stats: {
      str: 12,
      dex: 16,
      con: 16,
      int: 14,
      wis: 20,
      cha: 12
    },
    proficiencyBonus: 6,
    proficiencies: ['Animal Handling', 'Arcana', 'Nature', 'Perception', 'Survival'],
    background: 'Hermit',
    alignment: 'Neutral',
    initialMessage: {
      type: 'character',
      mood: 'Ancient',
      text: "I am Thornvale, guardian of the primordial wilds. I have walked this earth for centuries in countless forms. The natural world answers my call."
    },
    personality: {
      traits: [
        'Ancient and wise beyond measure',
        'Shapeshifts into powerful beasts',
        'Guardian of natural balance'
      ],
      background: 'Hermit',
      alignment: 'Neutral'
    }
  },

  malakar: {
    id: 'malakar',
    name: 'Malakar the Bound',
    race: 'Tiefling',
    class: 'Warlock',
    subclass: 'The Fiend',
    level: 20,
    hp: { current: 160, max: 160 },
    ac: 17,
    initiative: 3,
    speed: 30,
    portrait: '😈',
    portraitUrl: 'https://api.dicebear.com/7.x/adventurer/svg?seed=malakar&backgroundColor=1a1a1a&radius=10',
    stats: {
      str: 10,
      dex: 16,
      con: 16,
      int: 14,
      wis: 12,
      cha: 20
    },
    proficiencyBonus: 6,
    proficiencies: ['Arcana', 'Deception', 'Intimidation', 'Investigation'],
    background: 'Charlatan',
    alignment: 'Chaotic Neutral',
    initialMessage: {
      type: 'character',
      mood: 'Sinister',
      text: "Malakar the Bound. I have made pacts with entities beyond mortal comprehension. Their dark power flows through me, and I wield it without mercy."
    },
    personality: {
      traits: [
        'Bound by infernal pacts',
        'Manipulative and cunning',
        'Wields eldritch power'
      ],
      background: 'Charlatan',
      alignment: 'Chaotic Neutral'
    }
  },

  aurelia: {
    id: 'aurelia',
    name: 'Aurelia Stormborn',
    race: 'Dragonborn',
    class: 'Sorcerer',
    subclass: 'Draconic Bloodline',
    level: 20,
    hp: { current: 160, max: 160 },
    ac: 18,
    initiative: 3,
    speed: 30,
    portrait: '🐉',
    portraitUrl: 'https://api.dicebear.com/7.x/adventurer/svg?seed=aurelia&backgroundColor=1a1a1a&radius=10',
    stats: {
      str: 12,
      dex: 16,
      con: 16,
      int: 12,
      wis: 10,
      cha: 20
    },
    proficiencyBonus: 6,
    proficiencies: ['Arcana', 'Intimidation', 'Persuasion', 'Insight'],
    background: 'Noble',
    alignment: 'Lawful Neutral',
    initialMessage: {
      type: 'character',
      mood: 'Confident',
      text: "I am Aurelia Stormborn, heir to ancient draconic power. Magic is not something I learned—it is my birthright, coursing through my very blood."
    },
    personality: {
      traits: [
        'Dragon blood grants innate magic',
        'Proud and regal bearing',
        'Commands devastating elemental power'
      ],
      background: 'Noble',
      alignment: 'Lawful Neutral'
    }
  },

  cassian: {
    id: 'cassian',
    name: 'Cassian Goldentongue',
    race: 'Half-Elf',
    class: 'Bard',
    subclass: 'College of Lore',
    level: 20,
    hp: { current: 160, max: 160 },
    ac: 17,
    initiative: 4,
    speed: 30,
    portrait: '🎵',
    portraitUrl: 'https://api.dicebear.com/7.x/adventurer/svg?seed=cassian&backgroundColor=1a1a1a&radius=10',
    stats: {
      str: 10,
      dex: 18,
      con: 16,
      int: 14,
      wis: 12,
      cha: 20
    },
    proficiencyBonus: 6,
    proficiencies: ['Acrobatics', 'Deception', 'Performance', 'Persuasion', 'Sleight of Hand', 'Stealth'],
    background: 'Entertainer',
    alignment: 'Chaotic Good',
    initialMessage: {
      type: 'character',
      mood: 'Charming',
      text: "Cassian Goldentongue at your service! My songs inspire heroes, my magic bends minds, and my knowledge spans the ages. Every tale you've heard? I was there."
    },
    personality: {
      traits: [
        'Charismatic and quick-witted',
        'Master of lore and secrets',
        'Inspires allies to greatness'
      ],
      background: 'Entertainer',
      alignment: 'Chaotic Good'
    }
  }
}

export const demoCharacterList = [
  {
    id: 'burlon',
    name: 'Burlon Throatchoppa',
    title: 'Ranger 20 - Hunter',
    portrait: '🪓',
    description: 'Master hunter and legendary tracker. Commands the wilderness and brings down the mightiest prey.',
    available: true
  },
  {
    id: 'achilles',
    name: 'Achilles',
    title: 'Fighter 20 - Champion',
    portrait: '🛡️',
    description: 'Legendary hero of Troy. An immortal warrior whose martial prowess is unmatched.',
    available: true
  },
  {
    id: 'seraphina',
    name: 'Seraphina the Radiant',
    title: 'Paladin 20 - Devotion',
    portrait: '⚔️',
    description: 'Living saint and divine champion. Channels the power of the gods through blade and prayer.',
    available: true
  },
  {
    id: 'mordecai',
    name: 'Mordecai the Arcane',
    title: 'Wizard 20 - Evocation',
    portrait: '🧙',
    description: 'Archmage who bends reality itself. Master of devastating elemental magic.',
    available: true
  },
  {
    id: 'grommash',
    name: 'Grommash Ironhide',
    title: 'Barbarian 20 - Totem Warrior',
    portrait: '💀',
    description: 'Rage incarnate. Nearly unkillable berserker infused with primal spirit power.',
    available: true
  },
  {
    id: 'lysandra',
    name: 'Lysandra Dawnbringer',
    title: 'Cleric 20 - Life Domain',
    portrait: '⛪',
    description: 'High Priestess channeling divine life energy. No wound is beyond her healing touch.',
    available: true
  },
  {
    id: 'shadowmere',
    name: 'Shadowmere',
    title: 'Rogue 20 - Assassin',
    portrait: '🗡️',
    description: 'Master of stealth and death. The whisper in the dark, the blade unseen.',
    available: true
  },
  {
    id: 'kaelen',
    name: 'Kaelen Windwalker',
    title: 'Monk 20 - Open Hand',
    portrait: '🥋',
    description: 'Martial arts grandmaster. Moves faster than the eye can follow, strikes like a hurricane.',
    available: true
  },
  {
    id: 'thornvale',
    name: 'Thornvale the Ancient',
    title: 'Druid 20 - Circle of the Moon',
    portrait: '🌿',
    description: 'Ancient guardian of nature. Shapeshifts into legendary beasts at will.',
    available: true
  },
  {
    id: 'malakar',
    name: 'Malakar the Bound',
    title: 'Warlock 20 - The Fiend',
    portrait: '😈',
    description: 'Bound by dark pacts. Wields eldritch power from entities beyond mortal comprehension.',
    available: true
  },
  {
    id: 'aurelia',
    name: 'Aurelia Stormborn',
    title: 'Sorcerer 20 - Draconic',
    portrait: '🐉',
    description: 'Dragon-blooded sorcerer. Magic is her birthright, flowing through her ancient lineage.',
    available: true
  },
  {
    id: 'cassian',
    name: 'Cassian Goldentongue',
    title: 'Bard 20 - College of Lore',
    portrait: '🎵',
    description: 'Master of secrets and inspiration. His songs inspire heroes and his magic bends minds.',
    available: true
  }
]

export const getDemoCharacter = (characterId) => {
  return demoCharacters[characterId] || null
}

export const getDemoCharacterList = () => {
  return demoCharacterList
}
