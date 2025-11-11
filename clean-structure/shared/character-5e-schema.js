/**
 * Complete D&D 5e Character Schema
 * MongoDB-ready with all mechanics from test-enhanced-features.html
 */

export const Character5eSchema = {
  // Core Identity
  id: String,
  userId: String, // Owner
  name: String,
  race: String,
  class: String,
  subclass: String,
  level: Number,
  background: String,
  alignment: String,
  experience: Number,

  // Ability Scores (8-20 standard range)
  stats: {
    str: Number, // Strength
    dex: Number, // Dexterity
    con: Number, // Constitution
    int: Number, // Intelligence
    wis: Number, // Wisdom
    cha: Number  // Charisma
  },

  // Hit Points
  hp: {
    current: Number,
    max: Number,
    temporary: Number
  },

  // Combat Stats
  ac: Number, // Armor Class
  initiative: Number, // Usually DEX modifier
  speed: Number, // Movement speed in feet

  // Proficiency & Skills
  proficiencyBonus: Number, // 2 + floor((level-1)/4)

  // Skills: [abilityKey, proficiencyLevel]
  // proficiencyLevel: 0=none, 1=proficient, 2=expertise
  skills: {
    // STR
    athletics: { ability: 'str', proficiency: 0, value: Number },

    // DEX
    acrobatics: { ability: 'dex', proficiency: 0, value: Number },
    sleightOfHand: { ability: 'dex', proficiency: 0, value: Number },
    stealth: { ability: 'dex', proficiency: 0, value: Number },

    // INT
    arcana: { ability: 'int', proficiency: 0, value: Number },
    history: { ability: 'int', proficiency: 0, value: Number },
    investigation: { ability: 'int', proficiency: 0, value: Number },
    nature: { ability: 'int', proficiency: 0, value: Number },
    religion: { ability: 'int', proficiency: 0, value: Number },

    // WIS
    animalHandling: { ability: 'wis', proficiency: 0, value: Number },
    insight: { ability: 'wis', proficiency: 0, value: Number },
    medicine: { ability: 'wis', proficiency: 0, value: Number },
    perception: { ability: 'wis', proficiency: 0, value: Number },
    survival: { ability: 'wis', proficiency: 0, value: Number },

    // CHA
    deception: { ability: 'cha', proficiency: 0, value: Number },
    intimidation: { ability: 'cha', proficiency: 0, value: Number },
    performance: { ability: 'cha', proficiency: 0, value: Number },
    persuasion: { ability: 'cha', proficiency: 0, value: Number }
  },

  // Saving Throws (proficient or not)
  savingThrows: {
    str: { proficient: Boolean, value: Number },
    dex: { proficient: Boolean, value: Number },
    con: { proficient: Boolean, value: Number },
    int: { proficient: Boolean, value: Number },
    wis: { proficient: Boolean, value: Number },
    cha: { proficient: Boolean, value: Number }
  },

  // Spellcasting
  spellcasting: {
    enabled: Boolean,
    ability: String, // 'int', 'wis', or 'cha'
    spellSaveDC: Number, // 8 + prof + ability mod
    spellAttackBonus: Number, // prof + ability mod

    // Spell slots by level
    spellSlots: {
      1: { current: Number, max: Number },
      2: { current: Number, max: Number },
      3: { current: Number, max: Number },
      4: { current: Number, max: Number },
      5: { current: Number, max: Number },
      6: { current: Number, max: Number },
      7: { current: Number, max: Number },
      8: { current: Number, max: Number },
      9: { current: Number, max: Number }
    },

    // Known spells
    spells: [
      {
        id: String,
        name: String,
        level: Number, // 0 for cantrips
        school: String, // Evocation, Abjuration, etc.
        castingTime: String,
        range: String,
        components: String, // "V, S, M"
        duration: String,
        concentration: Boolean,
        ritual: Boolean,
        description: String,
        damage: String, // e.g., "3d6" or null
        damageType: String, // fire, cold, etc.
        attackRoll: Boolean, // true if spell attack
        savingThrow: String, // "DEX", "WIS", etc. or null
        prepared: Boolean, // For prepared casters
        alwaysPrepared: Boolean // Domain spells, etc.
      }
    ],

    // Cantrips known
    cantripsKnown: Number,
    spellsKnown: Number, // For sorcerers, bards
    spellsPrepared: Number // For wizards, clerics
  },

  // Class Abilities
  abilities: [
    {
      id: String,
      name: String,
      icon: String, // Emoji
      description: String,
      damage: String, // Dice formula or null
      type: String, // 'attack', 'utility', 'defense', 'buff'
      usesPerRest: Number, // -1 for unlimited
      usesRemaining: Number,
      restType: String, // 'short', 'long', 'none'
      level: Number // Level acquired
    }
  ],

  // Resources (Ki, Rage, Bardic Inspiration, etc.)
  resources: {
    hitDice: {
      type: String, // "d8", "d10", etc.
      current: Number,
      max: Number
    },

    custom: [
      {
        name: String, // "Ki Points", "Rage", etc.
        current: Number,
        max: Number,
        restType: String // 'short' or 'long'
      }
    ]
  },

  // Conditions & Status
  conditions: [String], // ['poisoned', 'blessed', 'hasted', etc.]
  exhaustion: Number, // 0-6
  inspiration: Boolean, // Bardic inspiration

  // Temporary Modifiers
  tempModifiers: [
    {
      name: String, // "Bless", "Guidance", etc.
      value: String, // "+1d4", "+2", etc.
      appliesTo: String, // "attack", "save", "skill", "all"
      duration: String, // "1 minute", "until long rest"
    }
  ],

  // Inventory
  inventory: [
    {
      id: String,
      name: String,
      type: String, // weapon, armor, consumable, gear, treasure
      quantity: Number,
      equipped: Boolean,
      attuned: Boolean,
      weight: Number,
      value: Number, // In GP
      description: String,
      properties: Array, // ['finesse', 'light', 'thrown', etc.]
      damage: String, // For weapons
      ac: Number, // For armor
      magicBonus: Number
    }
  ],

  // Money
  currency: {
    cp: Number,
    sp: Number,
    gp: Number,
    pp: Number
  },

  // Character State (for AI conversations)
  currentState: String, // 'default', 'battle', 'injured', etc.
  conversationStates: {
    default: {
      mood: String,
      greeting: String,
      systemPrompt: String
    },
    battle: {
      mood: String,
      greeting: String,
      systemPrompt: String
    },
    // ... more states
  },

  // Images
  images: {
    portrait: String, // CDN URL
    thumbnail: String,
    emoji: String
  },

  // AI-Generated Fields
  personality: String,
  background: String,
  imagePrompt: String,

  // Combat Tracking
  combat: {
    inCombat: Boolean,
    turnNumber: Number,
    battleLog: [
      {
        turn: Number,
        message: String,
        type: String, // 'attack', 'damage', 'heal', 'spell', 'ability'
        timestamp: Date
      }
    ]
  },

  // Conversation History (for AI)
  conversationHistory: [
    {
      role: String, // 'user' or 'assistant'
      content: String,
      timestamp: Date
    }
  ],

  // Metadata
  createdAt: Date,
  updatedAt: Date
};

/**
 * Helper: Calculate all computed values
 */
export function calculateCharacterStats(character) {
  const { stats, level, proficiencyBonus } = character;

  // Ability modifiers
  const modifiers = {};
  Object.keys(stats).forEach(ability => {
    modifiers[ability] = Math.floor((stats[ability] - 10) / 2);
  });

  // Proficiency bonus
  const prof = proficiencyBonus || (2 + Math.floor((level - 1) / 4));

  // Skill values
  const skills = {};
  Object.entries(character.skills).forEach(([skillName, skillData]) => {
    const abilityMod = modifiers[skillData.ability];
    const profMod = skillData.proficiency * prof;
    skills[skillName] = {
      ...skillData,
      value: abilityMod + profMod
    };
  });

  // Saving throw values
  const saves = {};
  Object.entries(character.savingThrows).forEach(([ability, saveData]) => {
    const abilityMod = modifiers[ability];
    const profMod = saveData.proficient ? prof : 0;
    saves[ability] = {
      ...saveData,
      value: abilityMod + profMod
    };
  });

  // Spell save DC
  let spellSaveDC = null;
  let spellAttackBonus = null;
  if (character.spellcasting?.enabled) {
    const spellMod = modifiers[character.spellcasting.ability];
    spellSaveDC = 8 + prof + spellMod;
    spellAttackBonus = prof + spellMod;
  }

  return {
    ...character,
    computed: {
      modifiers,
      proficiencyBonus: prof,
      initiative: modifiers.dex,
      passivePerception: 10 + (skills.perception?.value || 0),
      spellSaveDC,
      spellAttackBonus
    },
    skills,
    savingThrows: saves
  };
}

/**
 * Helper: Apply short rest
 */
export function applyShortRest(character) {
  const { resources, spellcasting, class: className } = character;

  // Restore hit dice (up to half)
  if (resources.hitDice) {
    resources.hitDice.current = Math.min(
      resources.hitDice.current + Math.ceil(resources.hitDice.max / 2),
      resources.hitDice.max
    );
  }

  // Restore custom resources that recharge on short rest
  if (resources.custom) {
    resources.custom.forEach(resource => {
      if (resource.restType === 'short') {
        resource.current = resource.max;
      }
    });
  }

  // Warlock: restore all spell slots
  if (className.toLowerCase().includes('warlock') && spellcasting) {
    Object.keys(spellcasting.spellSlots).forEach(level => {
      spellcasting.spellSlots[level].current = spellcasting.spellSlots[level].max;
    });
  }

  return character;
}

/**
 * Helper: Apply long rest
 */
export function applyLongRest(character) {
  const { hp, resources, spellcasting, abilities } = character;

  // Restore HP
  hp.current = hp.max;

  // Restore all hit dice
  if (resources.hitDice) {
    resources.hitDice.current = resources.hitDice.max;
  }

  // Restore all spell slots
  if (spellcasting) {
    Object.keys(spellcasting.spellSlots).forEach(level => {
      spellcasting.spellSlots[level].current = spellcasting.spellSlots[level].max;
    });
  }

  // Restore all abilities
  if (abilities) {
    abilities.forEach(ability => {
      if (ability.usesPerRest > 0) {
        ability.usesRemaining = ability.usesPerRest;
      }
    });
  }

  // Restore all resources
  if (resources.custom) {
    resources.custom.forEach(resource => {
      resource.current = resource.max;
    });
  }

  // Clear temp modifiers
  character.tempModifiers = [];

  // Remove exhaustion (1 level)
  if (character.exhaustion > 0) {
    character.exhaustion = Math.max(0, character.exhaustion - 1);
  }

  return character;
}

export default Character5eSchema;
