/**
 * D&D 5e Class Progression Tables
 * Spell slots, features, and level-based progression
 */

// Spell slots by caster type [1st, 2nd, 3rd, 4th, 5th, 6th, 7th, 8th, 9th]
export const SPELL_SLOTS = {
  // Full casters: Wizard, Cleric, Druid, Sorcerer, Bard
  full: {
    1: [2, 0, 0, 0, 0, 0, 0, 0, 0],
    2: [3, 0, 0, 0, 0, 0, 0, 0, 0],
    3: [4, 2, 0, 0, 0, 0, 0, 0, 0],
    4: [4, 3, 0, 0, 0, 0, 0, 0, 0],
    5: [4, 3, 2, 0, 0, 0, 0, 0, 0],
    6: [4, 3, 3, 0, 0, 0, 0, 0, 0],
    7: [4, 3, 3, 1, 0, 0, 0, 0, 0],
    8: [4, 3, 3, 2, 0, 0, 0, 0, 0],
    9: [4, 3, 3, 3, 1, 0, 0, 0, 0],
    10: [4, 3, 3, 3, 2, 0, 0, 0, 0],
    11: [4, 3, 3, 3, 2, 1, 0, 0, 0],
    12: [4, 3, 3, 3, 2, 1, 0, 0, 0],
    13: [4, 3, 3, 3, 2, 1, 1, 0, 0],
    14: [4, 3, 3, 3, 2, 1, 1, 0, 0],
    15: [4, 3, 3, 3, 2, 1, 1, 1, 0],
    16: [4, 3, 3, 3, 2, 1, 1, 1, 0],
    17: [4, 3, 3, 3, 2, 1, 1, 1, 1],
    18: [4, 3, 3, 3, 3, 1, 1, 1, 1],
    19: [4, 3, 3, 3, 3, 2, 1, 1, 1],
    20: [4, 3, 3, 3, 3, 2, 2, 1, 1]
  },

  // Half casters: Paladin, Ranger (max 5th level slots)
  half: {
    1: [0, 0, 0, 0, 0, 0, 0, 0, 0],
    2: [2, 0, 0, 0, 0, 0, 0, 0, 0],
    3: [3, 0, 0, 0, 0, 0, 0, 0, 0],
    4: [3, 0, 0, 0, 0, 0, 0, 0, 0],
    5: [4, 2, 0, 0, 0, 0, 0, 0, 0],
    6: [4, 2, 0, 0, 0, 0, 0, 0, 0],
    7: [4, 3, 0, 0, 0, 0, 0, 0, 0],
    8: [4, 3, 0, 0, 0, 0, 0, 0, 0],
    9: [4, 3, 2, 0, 0, 0, 0, 0, 0],
    10: [4, 3, 2, 0, 0, 0, 0, 0, 0],
    11: [4, 3, 3, 0, 0, 0, 0, 0, 0],
    12: [4, 3, 3, 0, 0, 0, 0, 0, 0],
    13: [4, 3, 3, 1, 0, 0, 0, 0, 0],
    14: [4, 3, 3, 1, 0, 0, 0, 0, 0],
    15: [4, 3, 3, 2, 0, 0, 0, 0, 0],
    16: [4, 3, 3, 2, 0, 0, 0, 0, 0],
    17: [4, 3, 3, 3, 1, 0, 0, 0, 0],
    18: [4, 3, 3, 3, 1, 0, 0, 0, 0],
    19: [4, 3, 3, 3, 2, 0, 0, 0, 0],
    20: [4, 3, 3, 3, 2, 0, 0, 0, 0]
  },

  // Third casters: Eldritch Knight, Arcane Trickster (max 4th level slots)
  third: {
    1: [0, 0, 0, 0, 0, 0, 0, 0, 0],
    2: [0, 0, 0, 0, 0, 0, 0, 0, 0],
    3: [2, 0, 0, 0, 0, 0, 0, 0, 0],
    4: [3, 0, 0, 0, 0, 0, 0, 0, 0],
    5: [3, 0, 0, 0, 0, 0, 0, 0, 0],
    6: [3, 0, 0, 0, 0, 0, 0, 0, 0],
    7: [4, 2, 0, 0, 0, 0, 0, 0, 0],
    8: [4, 2, 0, 0, 0, 0, 0, 0, 0],
    9: [4, 2, 0, 0, 0, 0, 0, 0, 0],
    10: [4, 3, 0, 0, 0, 0, 0, 0, 0],
    11: [4, 3, 0, 0, 0, 0, 0, 0, 0],
    12: [4, 3, 0, 0, 0, 0, 0, 0, 0],
    13: [4, 3, 2, 0, 0, 0, 0, 0, 0],
    14: [4, 3, 2, 0, 0, 0, 0, 0, 0],
    15: [4, 3, 2, 0, 0, 0, 0, 0, 0],
    16: [4, 3, 3, 0, 0, 0, 0, 0, 0],
    17: [4, 3, 3, 0, 0, 0, 0, 0, 0],
    18: [4, 3, 3, 0, 0, 0, 0, 0, 0],
    19: [4, 3, 3, 1, 0, 0, 0, 0, 0],
    20: [4, 3, 3, 1, 0, 0, 0, 0, 0]
  },

  // Warlock - unique pact magic (different from standard spellcasting)
  warlock: {
    1: [1, 0, 0, 0, 0], // Warlock only goes to 5th level
    2: [2, 0, 0, 0, 0],
    3: [0, 2, 0, 0, 0], // All slots become 2nd level
    4: [0, 2, 0, 0, 0],
    5: [0, 0, 2, 0, 0], // All slots become 3rd level
    6: [0, 0, 2, 0, 0],
    7: [0, 0, 0, 2, 0], // All slots become 4th level
    8: [0, 0, 0, 2, 0],
    9: [0, 0, 0, 0, 2], // All slots become 5th level
    10: [0, 0, 0, 0, 2],
    11: [0, 0, 0, 0, 3],
    12: [0, 0, 0, 0, 3],
    13: [0, 0, 0, 0, 3],
    14: [0, 0, 0, 0, 3],
    15: [0, 0, 0, 0, 3],
    16: [0, 0, 0, 0, 3],
    17: [0, 0, 0, 0, 4],
    18: [0, 0, 0, 0, 4],
    19: [0, 0, 0, 0, 4],
    20: [0, 0, 0, 0, 4]
  }
};

// Proficiency bonus by level
export const PROFICIENCY_BONUS = {
  1: 2, 2: 2, 3: 2, 4: 2,
  5: 3, 6: 3, 7: 3, 8: 3,
  9: 4, 10: 4, 11: 4, 12: 4,
  13: 5, 14: 5, 15: 5, 16: 5,
  17: 6, 18: 6, 19: 6, 20: 6
};

// Class progression definitions
export const CLASS_PROGRESSION = {
  wizard: {
    hitDice: 'd6',
    primaryAbility: 'int',
    savingThrows: ['int', 'wis'],
    spellcasting: {
      type: 'full',
      ability: 'int',
      preparedSpells: 'level + int modifier (min 1)',
      ritualCasting: true
    },
    cantripsKnown: [3, 3, 3, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5],
    subclassLevel: 2,
    features: {
      1: ['arcane-recovery', 'spellcasting'],
      2: ['arcane-tradition'],
      3: [], // subclass feature
      4: ['ability-score-improvement'],
      6: [], // subclass feature
      8: ['ability-score-improvement'],
      10: [], // subclass feature
      12: ['ability-score-improvement'],
      14: [], // subclass feature
      16: ['ability-score-improvement'],
      18: ['spell-mastery'],
      19: ['ability-score-improvement'],
      20: ['signature-spells']
    }
  },

  cleric: {
    hitDice: 'd8',
    primaryAbility: 'wis',
    savingThrows: ['wis', 'cha'],
    spellcasting: {
      type: 'full',
      ability: 'wis',
      preparedSpells: 'level + wis modifier (min 1)',
      ritualCasting: true
    },
    cantripsKnown: [3, 3, 3, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5],
    subclassLevel: 1,
    features: {
      1: ['divine-domain', 'spellcasting'],
      2: ['channel-divinity-turn-undead'],
      3: [], // subclass feature
      4: ['ability-score-improvement'],
      5: ['destroy-undead'],
      6: ['channel-divinity-2'],
      8: ['ability-score-improvement'],
      10: ['divine-intervention'],
      12: ['ability-score-improvement'],
      14: [], // subclass feature
      16: ['ability-score-improvement'],
      18: ['channel-divinity-3'],
      19: ['ability-score-improvement'],
      20: ['divine-intervention-improvement']
    }
  },

  ranger: {
    hitDice: 'd10',
    primaryAbility: 'dex',
    savingThrows: ['str', 'dex'],
    spellcasting: {
      type: 'half',
      ability: 'wis',
      spellsKnown: [0, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11]
    },
    cantripsKnown: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    subclassLevel: 3,
    features: {
      1: ['favored-enemy', 'natural-explorer'],
      2: ['fighting-style', 'spellcasting'],
      3: ['ranger-archetype', 'primeval-awareness'],
      4: ['ability-score-improvement'],
      5: ['extra-attack'],
      6: ['favored-enemy-improvement', 'natural-explorer-improvement'],
      7: [], // subclass feature
      8: ['ability-score-improvement', 'lands-stride'],
      10: ['natural-explorer-improvement', 'hide-in-plain-sight'],
      11: [], // subclass feature
      12: ['ability-score-improvement'],
      14: ['favored-enemy-improvement', 'vanish'],
      15: [], // subclass feature
      16: ['ability-score-improvement'],
      18: ['feral-senses'],
      19: ['ability-score-improvement'],
      20: ['foe-slayer']
    }
  },

  paladin: {
    hitDice: 'd10',
    primaryAbility: 'str',
    savingThrows: ['wis', 'cha'],
    spellcasting: {
      type: 'half',
      ability: 'cha',
      preparedSpells: 'half level (rounded down) + cha modifier (min 1)'
    },
    cantripsKnown: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    subclassLevel: 3,
    features: {
      1: ['divine-sense', 'lay-on-hands'],
      2: ['fighting-style', 'spellcasting', 'divine-smite'],
      3: ['divine-health', 'sacred-oath'],
      4: ['ability-score-improvement'],
      5: ['extra-attack'],
      6: ['aura-of-protection'],
      7: [], // subclass feature
      8: ['ability-score-improvement'],
      10: ['aura-of-courage'],
      11: ['improved-divine-smite'],
      12: ['ability-score-improvement'],
      14: ['cleansing-touch'],
      15: [], // subclass feature
      16: ['ability-score-improvement'],
      18: ['aura-improvements'],
      19: ['ability-score-improvement'],
      20: [] // subclass feature
    }
  },

  fighter: {
    hitDice: 'd10',
    primaryAbility: 'str',
    savingThrows: ['str', 'con'],
    spellcasting: null,
    subclassLevel: 3,
    features: {
      1: ['fighting-style', 'second-wind'],
      2: ['action-surge'],
      3: ['martial-archetype'],
      4: ['ability-score-improvement'],
      5: ['extra-attack'],
      6: ['ability-score-improvement'],
      7: [], // subclass feature
      8: ['ability-score-improvement'],
      9: ['indomitable'],
      10: [], // subclass feature
      11: ['extra-attack-2'],
      12: ['ability-score-improvement'],
      13: ['indomitable-2'],
      14: ['ability-score-improvement'],
      15: [], // subclass feature
      16: ['ability-score-improvement'],
      17: ['action-surge-2', 'indomitable-3'],
      18: [], // subclass feature
      19: ['ability-score-improvement'],
      20: ['extra-attack-3']
    }
  },

  barbarian: {
    hitDice: 'd12',
    primaryAbility: 'str',
    savingThrows: ['str', 'con'],
    spellcasting: null,
    subclassLevel: 3,
    features: {
      1: ['rage', 'unarmored-defense'],
      2: ['reckless-attack', 'danger-sense'],
      3: ['primal-path'],
      4: ['ability-score-improvement'],
      5: ['extra-attack', 'fast-movement'],
      6: [], // subclass feature
      7: ['feral-instinct'],
      8: ['ability-score-improvement'],
      9: ['brutal-critical-1'],
      10: [], // subclass feature
      11: ['relentless-rage'],
      12: ['ability-score-improvement'],
      13: ['brutal-critical-2'],
      14: [], // subclass feature
      15: ['persistent-rage'],
      16: ['ability-score-improvement'],
      17: ['brutal-critical-3'],
      18: ['indomitable-might'],
      19: ['ability-score-improvement'],
      20: ['primal-champion']
    }
  },

  rogue: {
    hitDice: 'd8',
    primaryAbility: 'dex',
    savingThrows: ['dex', 'int'],
    spellcasting: null,
    subclassLevel: 3,
    features: {
      1: ['expertise', 'sneak-attack-1d6', 'thieves-cant'],
      2: ['cunning-action'],
      3: ['roguish-archetype', 'sneak-attack-2d6'],
      4: ['ability-score-improvement'],
      5: ['uncanny-dodge', 'sneak-attack-3d6'],
      6: ['expertise-2'],
      7: ['evasion', 'sneak-attack-4d6'],
      8: ['ability-score-improvement'],
      9: [], // subclass feature, sneak-attack-5d6
      10: ['ability-score-improvement'],
      11: ['reliable-talent', 'sneak-attack-6d6'],
      12: ['ability-score-improvement'],
      13: [], // subclass feature, sneak-attack-7d6
      14: ['blindsense'],
      15: ['slippery-mind', 'sneak-attack-8d6'],
      16: ['ability-score-improvement'],
      17: [], // subclass feature, sneak-attack-9d6
      18: ['elusive'],
      19: ['ability-score-improvement', 'sneak-attack-10d6'],
      20: ['stroke-of-luck']
    }
  },

  warlock: {
    hitDice: 'd8',
    primaryAbility: 'cha',
    savingThrows: ['wis', 'cha'],
    spellcasting: {
      type: 'warlock',
      ability: 'cha',
      spellsKnown: [2, 3, 4, 5, 6, 7, 8, 9, 10, 10, 11, 11, 12, 12, 13, 13, 14, 14, 15, 15]
    },
    cantripsKnown: [2, 2, 2, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
    invocationsKnown: [0, 2, 2, 2, 3, 3, 4, 4, 5, 5, 5, 6, 6, 6, 7, 7, 7, 8, 8, 8],
    subclassLevel: 1,
    features: {
      1: ['otherworldly-patron', 'pact-magic'],
      2: ['eldritch-invocations'],
      3: ['pact-boon'],
      4: ['ability-score-improvement'],
      6: [], // subclass feature
      8: ['ability-score-improvement'],
      10: [], // subclass feature
      11: ['mystic-arcanum-6'],
      12: ['ability-score-improvement'],
      13: ['mystic-arcanum-7'],
      14: [], // subclass feature
      15: ['mystic-arcanum-8'],
      16: ['ability-score-improvement'],
      17: ['mystic-arcanum-9'],
      18: ['ability-score-improvement'],
      20: ['eldritch-master']
    }
  },

  sorcerer: {
    hitDice: 'd6',
    primaryAbility: 'cha',
    savingThrows: ['con', 'cha'],
    spellcasting: {
      type: 'full',
      ability: 'cha',
      spellsKnown: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 12, 13, 13, 14, 14, 15, 15, 15, 15]
    },
    cantripsKnown: [4, 4, 4, 5, 5, 5, 5, 5, 5, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6],
    subclassLevel: 1,
    features: {
      1: ['sorcerous-origin', 'spellcasting'],
      2: ['font-of-magic'],
      3: ['metamagic'],
      4: ['ability-score-improvement'],
      6: [], // subclass feature
      8: ['ability-score-improvement'],
      10: ['metamagic-2'],
      12: ['ability-score-improvement'],
      14: [], // subclass feature
      16: ['ability-score-improvement'],
      17: ['metamagic-3'],
      18: [], // subclass feature
      19: ['ability-score-improvement'],
      20: ['sorcerous-restoration']
    }
  },

  bard: {
    hitDice: 'd8',
    primaryAbility: 'cha',
    savingThrows: ['dex', 'cha'],
    spellcasting: {
      type: 'full',
      ability: 'cha',
      spellsKnown: [4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 15, 15, 16, 18, 19, 19, 20, 22, 22, 22],
      ritualCasting: true
    },
    cantripsKnown: [2, 2, 2, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
    subclassLevel: 3,
    features: {
      1: ['spellcasting', 'bardic-inspiration-d6'],
      2: ['jack-of-all-trades', 'song-of-rest'],
      3: ['bard-college', 'expertise'],
      4: ['ability-score-improvement'],
      5: ['bardic-inspiration-d8', 'font-of-inspiration'],
      6: ['countercharm'],
      7: [], // subclass feature
      8: ['ability-score-improvement'],
      10: ['bardic-inspiration-d10', 'expertise-2', 'magical-secrets'],
      12: ['ability-score-improvement'],
      14: ['magical-secrets-2'],
      15: ['bardic-inspiration-d12'],
      16: ['ability-score-improvement'],
      18: ['magical-secrets-3'],
      19: ['ability-score-improvement'],
      20: ['superior-inspiration']
    }
  },

  druid: {
    hitDice: 'd8',
    primaryAbility: 'wis',
    savingThrows: ['int', 'wis'],
    spellcasting: {
      type: 'full',
      ability: 'wis',
      preparedSpells: 'level + wis modifier (min 1)',
      ritualCasting: true
    },
    cantripsKnown: [2, 2, 2, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
    subclassLevel: 2,
    features: {
      1: ['druidic', 'spellcasting'],
      2: ['wild-shape', 'druid-circle'],
      3: [], // subclass feature
      4: ['wild-shape-improvement', 'ability-score-improvement'],
      6: [], // subclass feature
      8: ['wild-shape-improvement', 'ability-score-improvement'],
      10: [], // subclass feature
      12: ['ability-score-improvement'],
      14: [], // subclass feature
      16: ['ability-score-improvement'],
      18: ['timeless-body', 'beast-spells'],
      19: ['ability-score-improvement'],
      20: ['archdruid']
    }
  },

  monk: {
    hitDice: 'd8',
    primaryAbility: 'dex',
    savingThrows: ['str', 'dex'],
    spellcasting: null,
    subclassLevel: 3,
    kiPoints: [0, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
    martialArtsDice: ['1d4', '1d4', '1d4', '1d4', '1d6', '1d6', '1d6', '1d6', '1d6', '1d6', '1d8', '1d8', '1d8', '1d8', '1d8', '1d8', '1d10', '1d10', '1d10', '1d10'],
    unarmoredMovement: [0, 10, 10, 10, 10, 15, 15, 15, 15, 20, 20, 20, 20, 25, 25, 25, 25, 30, 30, 30],
    features: {
      1: ['unarmored-defense', 'martial-arts'],
      2: ['ki', 'unarmored-movement'],
      3: ['monastic-tradition', 'deflect-missiles'],
      4: ['slow-fall', 'ability-score-improvement'],
      5: ['extra-attack', 'stunning-strike'],
      6: ['ki-empowered-strikes'],
      7: ['evasion', 'stillness-of-mind'],
      8: ['ability-score-improvement'],
      9: ['unarmored-movement-improvement'],
      10: ['purity-of-body'],
      11: [], // subclass feature
      12: ['ability-score-improvement'],
      13: ['tongue-of-sun-and-moon'],
      14: ['diamond-soul'],
      15: ['timeless-body'],
      16: ['ability-score-improvement'],
      17: [], // subclass feature
      18: ['empty-body'],
      19: ['ability-score-improvement'],
      20: ['perfect-self']
    }
  }
};

// Get spell slots for a class at a specific level
export function getSpellSlots(className, level) {
  const classData = CLASS_PROGRESSION[className.toLowerCase()];
  if (!classData || !classData.spellcasting) {
    return null;
  }

  const casterType = classData.spellcasting.type;
  return SPELL_SLOTS[casterType]?.[level] || null;
}

// Get all features for a class up to a specific level
export function getClassFeatures(className, level) {
  const classData = CLASS_PROGRESSION[className.toLowerCase()];
  if (!classData) return [];

  const features = [];
  for (let lvl = 1; lvl <= level; lvl++) {
    if (classData.features[lvl]) {
      features.push(...classData.features[lvl]);
    }
  }

  return features;
}

// Get number of cantrips known at level
export function getCantripsKnown(className, level) {
  const classData = CLASS_PROGRESSION[className.toLowerCase()];
  if (!classData || !classData.cantripsKnown) return 0;
  return classData.cantripsKnown[level - 1] || 0;
}

// Get number of spells known (for classes like Sorcerer, Bard, Ranger)
export function getSpellsKnown(className, level) {
  const classData = CLASS_PROGRESSION[className.toLowerCase()];
  if (!classData || !classData.spellcasting || !classData.spellcasting.spellsKnown) {
    return null; // Prepared caster, not known
  }
  return classData.spellcasting.spellsKnown[level - 1] || 0;
}

// Calculate prepared spells (for Wizard, Cleric, Druid, Paladin)
export function getPreparedSpellsCount(className, level, abilityModifier) {
  const classData = CLASS_PROGRESSION[className.toLowerCase()];
  if (!classData || !classData.spellcasting) return 0;

  // Prepared casters
  if (classData.spellcasting.preparedSpells) {
    if (className.toLowerCase() === 'paladin') {
      return Math.max(1, Math.floor(level / 2) + abilityModifier);
    }
    return Math.max(1, level + abilityModifier);
  }

  return 0;
}

export default {
  SPELL_SLOTS,
  PROFICIENCY_BONUS,
  CLASS_PROGRESSION,
  getSpellSlots,
  getClassFeatures,
  getCantripsKnown,
  getSpellsKnown,
  getPreparedSpellsCount
};
