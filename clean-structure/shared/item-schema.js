/**
 * D&D 5e Item and Equipment Schema
 * Extends the character schema with detailed item management
 */

/**
 * Item Rarities
 */
export const ItemRarity = {
  COMMON: 'common',
  UNCOMMON: 'uncommon',
  RARE: 'rare',
  VERY_RARE: 'very-rare',
  LEGENDARY: 'legendary',
  ARTIFACT: 'artifact'
};

/**
 * Item Categories
 */
export const ItemCategory = {
  WEAPON: 'weapon',
  ARMOR: 'armor',
  SHIELD: 'shield',
  POTION: 'potion',
  SCROLL: 'scroll',
  WAND: 'wand',
  RING: 'ring',
  AMULET: 'amulet',
  GEAR: 'gear',
  TOOL: 'tool',
  TREASURE: 'treasure',
  QUEST: 'quest'
};

/**
 * Equipment Slots
 */
export const EquipmentSlot = {
  HEAD: 'head',
  NECK: 'neck',
  BODY: 'body',
  HANDS: 'hands',
  FEET: 'feet',
  RING_1: 'ring1',
  RING_2: 'ring2',
  MAIN_HAND: 'mainHand',
  OFF_HAND: 'offHand',
  BACK: 'back'
};

/**
 * Weapon Properties
 */
export const WeaponProperty = {
  FINESSE: 'finesse',
  LIGHT: 'light',
  HEAVY: 'heavy',
  REACH: 'reach',
  THROWN: 'thrown',
  TWO_HANDED: 'two-handed',
  VERSATILE: 'versatile',
  AMMUNITION: 'ammunition',
  LOADING: 'loading',
  SPECIAL: 'special'
};

/**
 * Complete Item Schema
 */
export const ItemSchema = {
  id: String,
  name: String,
  category: String, // ItemCategory
  rarity: String, // ItemRarity
  requiresAttunement: Boolean,
  attuned: Boolean,

  // Basic Properties
  description: String,
  quantity: Number,
  weight: Number, // In pounds
  value: Number, // In GP

  // Equipment
  slot: String, // EquipmentSlot or null
  equipped: Boolean,

  // Weapon Properties
  weapon: {
    damage: String, // "1d8", "2d6", etc.
    damageType: String, // slashing, piercing, bludgeoning
    properties: [String], // WeaponProperty array
    range: String, // "5 ft", "20/60 ft", etc.
    attackBonus: Number, // Magic bonus
    versatileDamage: String // "1d10" for versatile weapons
  },

  // Armor Properties
  armor: {
    ac: Number, // Base AC
    type: String, // light, medium, heavy
    maxDexBonus: Number, // null for light, 2 for medium, 0 for heavy
    stealthDisadvantage: Boolean,
    strengthRequired: Number // Minimum STR for heavy armor
  },

  // Shield Properties
  shield: {
    acBonus: Number // +2 for standard shield
  },

  // Magic Item Properties
  magic: {
    bonus: Number, // +1, +2, +3
    effects: [
      {
        name: String, // "Fire Resistance", "Advantage on DEX saves"
        description: String,
        type: String, // 'passive', 'active', 'charge'
        charges: {
          current: Number,
          max: Number,
          rechargeType: String // 'dawn', 'dusk', 'long rest'
        }
      }
    ],
    curse: {
      cursed: Boolean,
      description: String,
      removable: Boolean
    }
  },

  // Consumable Properties
  consumable: {
    uses: Number,
    effect: String, // "Heal 2d4+2 HP", "Gain advantage on next roll"
    duration: String // "Instant", "1 hour", etc.
  },

  // Custom Properties (for unique items)
  customProperties: {
    bonuses: {
      str: Number,
      dex: Number,
      con: Number,
      int: Number,
      wis: Number,
      cha: Number,
      ac: Number,
      initiative: Number,
      speed: Number
    },
    resistances: [String], // ['fire', 'cold', 'poison']
    immunities: [String],
    vulnerabilities: [String],
    senses: [String], // ['darkvision 60 ft', 'blindsight 10 ft']
    languages: [String]
  },

  // Image
  image: String, // CDN URL or emoji

  // Metadata
  source: String, // "Player's Handbook", "Dungeon Master's Guide"
  page: Number
};

/**
 * Equipment Layout
 * Defines which items are equipped in which slots
 */
export const EquipmentSchema = {
  head: Object, // Item or null
  neck: Object,
  body: Object,
  hands: Object,
  feet: Object,
  ring1: Object,
  ring2: Object,
  mainHand: Object,
  offHand: Object,
  back: Object
};

/**
 * Calculate total encumbrance
 */
export function calculateEncumbrance(inventory) {
  return inventory.reduce((total, item) => {
    return total + (item.weight || 0) * (item.quantity || 1);
  }, 0);
}

/**
 * Check if character is encumbered
 * Normal: STR × 5
 * Encumbered: STR × 10 (speed -10)
 * Heavily Encumbered: STR × 15 (speed -20, disadvantage)
 * Max: STR × 15
 */
export function getEncumbranceStatus(character, totalWeight) {
  const str = character.stats.str;

  if (totalWeight <= str * 5) {
    return { status: 'normal', penalty: 0 };
  } else if (totalWeight <= str * 10) {
    return { status: 'encumbered', penalty: 10, disadvantage: false };
  } else if (totalWeight <= str * 15) {
    return { status: 'heavily-encumbered', penalty: 20, disadvantage: true };
  } else {
    return { status: 'over-max', penalty: 20, disadvantage: true };
  }
}

/**
 * Calculate total AC from equipped armor and bonuses
 */
export function calculateAC(character, equipment) {
  let baseAC = 10;
  let dexMod = Math.floor((character.stats.dex - 10) / 2);
  let maxDexBonus = null;
  let bonuses = 0;

  // Armor
  if (equipment.body?.armor) {
    const armor = equipment.body.armor;
    baseAC = armor.ac;
    maxDexBonus = armor.maxDexBonus;

    // Magic bonus
    if (equipment.body.magic?.bonus) {
      bonuses += equipment.body.magic.bonus;
    }
  }

  // Shield
  if (equipment.offHand?.shield) {
    bonuses += equipment.offHand.shield.acBonus;

    // Magic bonus
    if (equipment.offHand.magic?.bonus) {
      bonuses += equipment.offHand.magic.bonus;
    }
  }

  // Apply DEX modifier (respecting max from armor)
  if (maxDexBonus !== null) {
    dexMod = Math.min(dexMod, maxDexBonus);
  }

  // Ring/Amulet bonuses
  [equipment.ring1, equipment.ring2, equipment.neck].forEach(item => {
    if (item?.customProperties?.bonuses?.ac) {
      bonuses += item.customProperties.bonuses.ac;
    }
  });

  return baseAC + dexMod + bonuses;
}

/**
 * Get weapon attack bonus
 */
export function getWeaponAttackBonus(character, weapon) {
  if (!weapon?.weapon) return 0;

  const prof = character.proficiencyBonus || 2;
  const strMod = Math.floor((character.stats.str - 10) / 2);
  const dexMod = Math.floor((character.stats.dex - 10) / 2);

  // Finesse weapons can use DEX or STR
  const hasFinesse = weapon.weapon.properties?.includes('finesse');
  const abilityMod = hasFinesse ? Math.max(strMod, dexMod) : strMod;

  // Magic bonus
  const magicBonus = weapon.weapon.attackBonus || weapon.magic?.bonus || 0;

  return prof + abilityMod + magicBonus;
}

/**
 * Get weapon damage
 */
export function getWeaponDamage(character, weapon, versatile = false) {
  if (!weapon?.weapon) return null;

  const strMod = Math.floor((character.stats.str - 10) / 2);
  const dexMod = Math.floor((character.stats.dex - 10) / 2);

  // Finesse weapons can use DEX or STR
  const hasFinesse = weapon.weapon.properties?.includes('finesse');
  const abilityMod = hasFinesse ? Math.max(strMod, dexMod) : strMod;

  // Magic bonus
  const magicBonus = weapon.magic?.bonus || 0;

  // Damage dice
  let damageDice = weapon.weapon.damage;
  if (versatile && weapon.weapon.versatileDamage) {
    damageDice = weapon.weapon.versatileDamage;
  }

  return {
    formula: `${damageDice}+${abilityMod + magicBonus}`,
    type: weapon.weapon.damageType
  };
}

/**
 * Check if item can be equipped in slot
 */
export function canEquipInSlot(item, slot) {
  if (!item.slot) return false;

  // Some items can go in multiple slots (rings)
  if (slot === 'ring1' || slot === 'ring2') {
    return item.slot === 'ring';
  }

  return item.slot === slot;
}

/**
 * Get rarity color
 */
export function getRarityColor(rarity) {
  const colors = {
    common: '#9e9e9e',
    uncommon: '#4caf50',
    rare: '#2196f3',
    'very-rare': '#9c27b0',
    legendary: '#ff9800',
    artifact: '#f44336'
  };
  return colors[rarity] || colors.common;
}

export default ItemSchema;
