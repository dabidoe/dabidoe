/**
 * D&D 5e Data Loader
 * Utilities to populate characters with spells, items, and abilities
 */

import spellsSRD from '../data/spells-srd.json' with { type: 'json' };
import itemsSRD from '../data/items-srd.json' with { type: 'json' };
import classFeatures from '../data/class-features.json' with { type: 'json' };
import {
  getSpellSlots,
  getClassFeatures as getProgressionFeatures,
  getCantripsKnown,
  getSpellsKnown,
  getPreparedSpellsCount,
  PROFICIENCY_BONUS,
  CLASS_PROGRESSION
} from './5e-progression.js';

/**
 * Get all spells available to a class
 */
export function getSpellsForClass(className, level = 1) {
  const normalizedClass = className.toLowerCase();

  return spellsSRD
    .filter(spell => spell.classes?.includes(normalizedClass))
    .map(spell => ({
      id: spell.name.toLowerCase().replace(/\s+/g, '-'),
      name: spell.name,
      level: spell.level === 'cantrip' ? 0 : parseInt(spell.level.match(/\d+/)?.[0] || 0),
      school: spell.school,
      castingTime: spell.casting_time,
      range: spell.range,
      components: spell.components.raw,
      duration: spell.duration,
      concentration: spell.description.toLowerCase().includes('concentration'),
      ritual: spell.ritual,
      description: spell.description,
      damage: extractDamage(spell.description),
      damageType: extractDamageType(spell.description),
      attackRoll: spell.description.toLowerCase().includes('spell attack'),
      savingThrow: extractSave(spell.description),
      prepared: false,
      alwaysPrepared: false
    }));
}

/**
 * Get cantrips for a class
 */
export function getCantripsForClass(className) {
  return getSpellsForClass(className).filter(spell => spell.level === 0);
}

/**
 * Get starting equipment for a class
 */
export function getStartingEquipment(className, background = 'adventurer') {
  const equipment = [];
  const normalizedClass = className.toLowerCase();

  // Class-specific equipment
  const classEquipment = {
    fighter: ['longsword', 'shield', 'chain-mail', 'potion-healing'],
    barbarian: ['greatsword', 'leather-armor', 'potion-healing'],
    rogue: ['shortsword', 'dagger', 'leather-armor', 'potion-healing'],
    wizard: ['dagger', 'potion-healing'],
    cleric: ['longsword', 'shield', 'chain-mail', 'potion-healing'],
    paladin: ['longsword', 'shield', 'chain-mail', 'potion-healing'],
    ranger: ['longbow', 'shortsword', 'leather-armor', 'potion-healing'],
    monk: ['shortsword', 'leather-armor', 'potion-healing'],
    warlock: ['dagger', 'leather-armor', 'potion-healing']
  };

  // Add standard adventuring gear
  const standardGear = ['backpack', 'bedroll', 'rations', 'rope-hemp', 'torch'];

  // Get class equipment IDs
  const classItems = classEquipment[normalizedClass] || ['dagger', 'leather-armor'];
  const allItemIds = [...classItems, ...standardGear];

  // Convert IDs to full item objects
  allItemIds.forEach(itemId => {
    const item = itemsSRD.find(i => i.id === itemId);
    if (item) {
      equipment.push({
        ...item,
        id: `${itemId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        equipped: false,
        attuned: false
      });
    }
  });

  // Auto-equip armor and main weapon
  equipment.forEach(item => {
    if (item.category === 'armor' || item.category === 'shield') {
      item.equipped = true;
    }
    if (item.category === 'weapon' && !item.weapon?.properties?.includes('two-handed')) {
      if (!equipment.find(e => e.equipped && e.category === 'weapon')) {
        item.equipped = true;
      }
    }
  });

  return equipment;
}

/**
 * Get class abilities for a specific level
 * Returns unified ability objects (includes both class features and spells)
 */
export function getClassAbilities(className, level, characterLevel = null) {
  const normalizedClass = className.toLowerCase();
  const features = classFeatures[normalizedClass] || [];
  const actualLevel = characterLevel || level;

  return features
    .filter(feature => feature.level <= level)
    .map(feature => ({
      ...feature,
      id: `${feature.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      category: 'class-feature',
      type: 'feature',
      equipped: true, // Auto-equip class features
      uses: feature.uses ? {
        type: feature.uses.per,
        current: feature.uses.max,
        max: feature.uses.max,
        per: feature.uses.per
      } : null
    }));
}

/**
 * Get starting currency for a class
 */
export function getStartingCurrency(className) {
  const baseGold = {
    fighter: 125,
    barbarian: 100,
    rogue: 100,
    wizard: 100,
    cleric: 125,
    paladin: 125,
    ranger: 125,
    monk: 50,
    warlock: 100
  };

  const gold = baseGold[className.toLowerCase()] || 100;

  return {
    cp: 0,
    sp: 0,
    gp: gold,
    pp: 0
  };
}

/**
 * Populate a character with D&D 5e data based on class progression
 */
export function populateCharacterData(character) {
  if (!character.class || !character.level) {
    console.warn('Character missing class or level');
    return character;
  }

  const className = character.class.toLowerCase();
  const level = character.level;
  const classData = CLASS_PROGRESSION[className];

  if (!classData) {
    console.warn(`Unknown class: ${character.class}`);
    return character;
  }

  // Set proficiency bonus
  character.proficiencyBonus = PROFICIENCY_BONUS[level];

  // Initialize abilities array (unified spells + features)
  if (!character.abilities) {
    character.abilities = [];
  }

  // Add class features
  const classAbilities = getClassAbilities(className, level);
  character.abilities = [...character.abilities, ...classAbilities];

  // Handle spellcasting
  if (classData.spellcasting) {
    const spellcastingAbility = classData.spellcasting.ability;
    const abilityMod = Math.floor(((character.stats?.[spellcastingAbility] || 10) - 10) / 2);

    // Get spell slots
    const spellSlots = getSpellSlots(className, level);
    if (spellSlots) {
      character.spellSlots = {
        1: { current: spellSlots[0], max: spellSlots[0] },
        2: { current: spellSlots[1], max: spellSlots[1] },
        3: { current: spellSlots[2], max: spellSlots[2] },
        4: { current: spellSlots[3], max: spellSlots[3] },
        5: { current: spellSlots[4], max: spellSlots[4] },
        6: { current: spellSlots[5], max: spellSlots[5] },
        7: { current: spellSlots[6], max: spellSlots[6] },
        8: { current: spellSlots[7], max: spellSlots[7] },
        9: { current: spellSlots[8], max: spellSlots[8] }
      };
    }

    // Get all available spells for the class
    const allSpells = getSpellsForClass(className, level);

    // Get cantrips
    const numCantrips = getCantripsKnown(className, level);
    const cantrips = allSpells
      .filter(s => s.level === 0)
      .slice(0, numCantrips)
      .map(spell => ({
        ...spell,
        category: 'spell',
        type: 'cantrip',
        equipped: true,
        prepared: true,
        alwaysPrepared: true,
        uses: null // Cantrips don't use spell slots
      }));

    // Get leveled spells
    const maxSpellLevel = spellSlots ? spellSlots.findIndex((slots, idx) => idx > 0 && slots > 0) + 1 : 1;
    const leveledSpells = allSpells.filter(s => s.level > 0 && s.level <= maxSpellLevel);

    // Determine how many spells to add
    let spellsToAdd = [];
    const spellsKnownCount = getSpellsKnown(className, level);

    if (spellsKnownCount !== null) {
      // Known caster (Sorcerer, Bard, Ranger, Warlock)
      spellsToAdd = leveledSpells.slice(0, spellsKnownCount).map(spell => ({
        ...spell,
        category: 'spell',
        type: 'leveled-spell',
        equipped: true,
        prepared: true,
        alwaysPrepared: false,
        uses: {
          type: 'spell-slot',
          slotLevel: spell.level
        }
      }));
    } else {
      // Prepared caster (Wizard, Cleric, Druid, Paladin)
      const preparedCount = getPreparedSpellsCount(className, level, abilityMod);
      spellsToAdd = leveledSpells.slice(0, preparedCount).map(spell => ({
        ...spell,
        category: 'spell',
        type: 'leveled-spell',
        equipped: false, // Can swap prepared spells
        prepared: true,
        alwaysPrepared: false,
        uses: {
          type: 'spell-slot',
          slotLevel: spell.level
        }
      }));
    }

    // Add spells to abilities
    character.abilities = [...character.abilities, ...cantrips, ...spellsToAdd];

    // Set spellcasting info
    character.spellcasting = {
      enabled: true,
      ability: spellcastingAbility,
      spellSaveDC: 8 + character.proficiencyBonus + abilityMod,
      spellAttackBonus: character.proficiencyBonus + abilityMod
    };
  }

  // Add starting equipment if empty
  if (!character.inventory || character.inventory.length === 0) {
    character.inventory = getStartingEquipment(className, character.background);
  }

  // Add starting currency if empty
  if (!character.currency || character.currency.gp === 0) {
    character.currency = getStartingCurrency(className);
  }

  return character;
}

// Helper: Extract damage from spell description
function extractDamage(description) {
  const damageMatch = description.match(/(\d+d\d+(?:\s*\+\s*\d+)?)/);
  return damageMatch ? damageMatch[1] : null;
}

// Helper: Extract damage type from spell description
function extractDamageType(description) {
  const types = ['acid', 'cold', 'fire', 'force', 'lightning', 'necrotic', 'poison', 'psychic', 'radiant', 'thunder', 'bludgeoning', 'piercing', 'slashing'];
  for (const type of types) {
    if (description.toLowerCase().includes(type)) {
      return type;
    }
  }
  return null;
}

// Helper: Extract saving throw from spell description
function extractSave(description) {
  const saves = ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'];
  for (const save of saves) {
    if (description.includes(`${save} save`) || description.includes(`${save} saving throw`)) {
      return save;
    }
  }
  return null;
}

export default {
  getSpellsForClass,
  getCantripsForClass,
  getStartingEquipment,
  getClassAbilities,
  getStartingCurrency,
  populateCharacterData
};
