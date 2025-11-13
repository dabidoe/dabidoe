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
