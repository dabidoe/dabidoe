/**
 * Demo ability library data for testing
 * TODO: Replace with API calls in production
 */

export const demoAbilities = [
  {
    abilityId: 'fireball',
    name: 'Fireball',
    category: 'spell',
    details: {
      name: 'Fireball',
      shortDescription: 'A bright streak flashes to a point within range and explodes',
      longDescription: 'A bright streak flashes from your pointing finger to a point you choose within range and then blossoms with a low roar into an explosion of flame.',
      school: 'Evocation',
      level: '3rd',
      castingTime: '1 action',
      range: '150 feet',
      components: 'V, S, M (a tiny ball of bat guano and sulfur)',
      duration: 'Instantaneous',
      iconLayers: [['🔥']]
    }
  },
  {
    abilityId: 'shield-spell',
    name: 'Shield',
    category: 'spell',
    details: {
      name: 'Shield',
      shortDescription: 'An invisible barrier of magical force appears',
      longDescription: 'An invisible barrier of magical force appears and protects you. Until the start of your next turn, you have a +5 bonus to AC.',
      school: 'Abjuration',
      level: '1st',
      castingTime: '1 reaction',
      range: 'Self',
      components: 'V, S',
      duration: '1 round',
      iconLayers: [['🛡️']]
    }
  },
  {
    abilityId: 'magic-missile',
    name: 'Magic Missile',
    category: 'spell',
    details: {
      name: 'Magic Missile',
      shortDescription: 'Create three glowing darts of magical force',
      longDescription: 'You create three glowing darts of magical force. Each dart hits a creature of your choice that you can see within range.',
      school: 'Evocation',
      level: '1st',
      castingTime: '1 action',
      range: '120 feet',
      components: 'V, S',
      duration: 'Instantaneous',
      iconLayers: [['✨']]
    }
  },
  {
    abilityId: 'healing-word',
    name: 'Healing Word',
    category: 'spell',
    details: {
      name: 'Healing Word',
      shortDescription: 'A creature of your choice regains hit points',
      longDescription: 'A creature of your choice that you can see within range regains hit points equal to 1d4 + your spellcasting ability modifier.',
      school: 'Evocation',
      level: '1st',
      castingTime: '1 bonus action',
      range: '60 feet',
      components: 'V',
      duration: 'Instantaneous',
      iconLayers: [['💚']]
    }
  },
  {
    abilityId: 'longsword-attack',
    name: 'Longsword',
    category: 'attack',
    details: {
      name: 'Longsword',
      shortDescription: 'A versatile martial weapon',
      longDescription: 'Melee Weapon Attack. Versatile (1d8 one-handed, 1d10 two-handed)',
      attackBonus: '+5',
      damageFormula: '1d8+3',
      damageType: 'Slashing',
      iconLayers: [['⚔️']]
    }
  },
  {
    abilityId: 'bow-attack',
    name: 'Longbow',
    category: 'attack',
    details: {
      name: 'Longbow',
      shortDescription: 'A powerful ranged weapon',
      longDescription: 'Ranged Weapon Attack. Two-handed, requires ammunition.',
      attackBonus: '+6',
      damageFormula: '1d8+3',
      damageType: 'Piercing',
      range: '150/600 ft',
      iconLayers: [['🏹']]
    }
  },
  {
    abilityId: 'potion-healing',
    name: 'Potion of Healing',
    category: 'item',
    details: {
      name: 'Potion of Healing',
      shortDescription: 'Restores 2d4+2 hit points',
      longDescription: 'A character who drinks the magical red fluid in this vial regains 2d4 + 2 hit points. Drinking or administering a potion takes an action.',
      rarity: 'Common',
      iconLayers: [['🧪']]
    }
  },
  {
    abilityId: 'potion-greater-healing',
    name: 'Potion of Greater Healing',
    category: 'item',
    details: {
      name: 'Potion of Greater Healing',
      shortDescription: 'Restores 4d4+4 hit points',
      longDescription: 'A character who drinks the magical red fluid in this vial regains 4d4 + 4 hit points.',
      rarity: 'Uncommon',
      iconLayers: [['🧪']]
    }
  }
]

export const getDemoAbilities = () => {
  return demoAbilities
}

export const getDemoAbilityById = (abilityId) => {
  return demoAbilities.find(ability => ability.abilityId === abilityId) || null
}

export const getDemoAbilitiesByCategory = (category) => {
  if (category === 'all') return demoAbilities
  return demoAbilities.filter(ability => ability.category === category)
}
