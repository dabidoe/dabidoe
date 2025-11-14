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
    huntersPrey: 'colossus-slayer', // Specific Hunter choice
    level: 6,
    hp: { current: 58, max: 58 },
    ac: 16,
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
    proficiencies: ['Athletics', 'Survival', 'Perception', 'Stealth', 'Nature'],
    background: 'Outlander',
    alignment: 'Chaotic Good',
    // abilities, spellSlots, inventory will be populated by data-loader.js
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
    race: 'Human',
    class: 'Fighter',
    subclass: 'Champion',
    level: 10,
    hp: { current: 104, max: 104 },
    ac: 18,
    initiative: 3,
    speed: 30,
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
    level: 12,
    hp: { current: 110, max: 110 },
    ac: 20,
    initiative: 1,
    speed: 30,
    portrait: '⚔️',
    portraitUrl: 'https://api.dicebear.com/7.x/adventurer/svg?seed=seraphina&backgroundColor=1a1a1a&radius=10',
    stats: {
      str: 18,
      dex: 12,
      con: 16,
      int: 10,
      wis: 14,
      cha: 18  // Primary stat for Paladin spellcasting
    },
    proficiencies: ['Athletics', 'Insight', 'Persuasion', 'Religion'],
    background: 'Noble',
    alignment: 'Lawful Good',
    // abilities, spellSlots, inventory will be populated by data-loader.js
    initialMessage: {
      type: 'character',
      mood: 'Righteous',
      text: "I am Seraphina, sworn to the Oath of Devotion. My blade serves justice, my shield protects the innocent, and my faith illuminates the darkest paths."
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
    level: 12,
    hp: { current: 72, max: 72 },
    ac: 15,  // With Mage Armor
    initiative: 3,
    speed: 30,
    portrait: '🧙',
    portraitUrl: 'https://api.dicebear.com/7.x/adventurer/svg?seed=mordecai&backgroundColor=1a1a1a&radius=10',
    stats: {
      str: 8,
      dex: 16,  // +2 from High Elf racial
      con: 14,
      int: 20,  // +1 from High Elf racial, primary stat for Wizard
      wis: 12,
      cha: 10
    },
    proficiencies: ['Arcana', 'History', 'Investigation', 'Insight'],
    background: 'Sage',
    alignment: 'Neutral Good',
    // abilities, spellSlots, inventory will be populated by data-loader.js
    initialMessage: {
      type: 'character',
      mood: 'Scholarly',
      text: "Knowledge is the key to all power. I am Mordecai, master of the arcane arts. Through study and discipline, I have learned to reshape reality itself."
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
  },
  {
    id: 'seraphina',
    name: 'Seraphina the Radiant',
    title: 'Paladin of Devotion',
    portrait: '⚔️',
    description: 'A devoted paladin sworn to protect the innocent. Wields divine magic and martial prowess with equal skill.',
    available: true
  },
  {
    id: 'mordecai',
    name: 'Mordecai the Arcane',
    title: 'Master Evoker',
    portrait: '🧙',
    description: 'A High Elf wizard specializing in evocation magic. Commands devastating elemental powers with scholarly precision.',
    available: true
  }
]

export const getDemoCharacter = (characterId) => {
  return demoCharacters[characterId] || null
}

export const getDemoCharacterList = () => {
  return demoCharacterList
}
