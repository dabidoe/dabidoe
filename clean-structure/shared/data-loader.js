/**
 * D&D 5e Data Loader
 * Utilities to populate characters with spells, items, and abilities
 */

import {
  getSpellSlots,
  getClassFeatures as getProgressionFeatures,
  getSubclassFeatures,
  getCantripsKnown,
  getSpellsKnown,
  getPreparedSpellsCount,
  PROFICIENCY_BONUS,
  CLASS_PROGRESSION,
  HUNTER_ABILITIES
} from './5e-progression.js';

import {
  getSpellsByClass,
  getSpellsByClassAndLevel,
  getRangerSpellRecommendations,
  getClassFeaturesByLevel,
  getStartingEquipment as getStartingEquipmentFromService,
  spellToAbility,
  featureToAbility
} from './data-service.js';

/**
 * Get starting equipment for a class
 */
export function getStartingEquipment(className, background = 'adventurer') {
  return getStartingEquipmentFromService(className);
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

  // Add class features from class-features.json
  const classFeatures = getClassFeaturesByLevel(className, level);
  classFeatures.forEach(feature => {
    character.abilities.push(featureToAbility(feature));
  });

  // Add subclass features if subclass is specified
  if (character.subclass) {
    const subclassFeatures = getSubclassFeatures(className, character.subclass, level);
    subclassFeatures.forEach(feature => {
      character.abilities.push(featureToAbility(feature));

      // If it's a Hunter's Prey choice feature, add the specific ability
      if (feature.id === 'hunters-prey' && character.huntersPrey) {
        const specificAbility = HUNTER_ABILITIES[character.huntersPrey];
        if (specificAbility) {
          character.abilities.push(featureToAbility(specificAbility));
        }
      }
    });
  }

  // Handle spellcasting
  if (classData.spellcasting) {
    const spellcastingAbility = classData.spellcasting.ability;
    const abilityMod = Math.floor(((character.stats?.[spellcastingAbility] || 10) - 10) / 2);

    // Get spell slots
    const spellSlots = getSpellSlots(className, level);
    if (spellSlots) {
      character.spellSlots = {};
      spellSlots.forEach((slots, index) => {
        if (slots > 0 && index > 0) {
          character.spellSlots[index] = { current: slots, max: slots };
        }
      });
    }

    // Get all available spells for the class
    const allSpells = getSpellsByClass(className);

    // Get cantrips
    const numCantrips = getCantripsKnown(className, level);
    if (numCantrips > 0) {
      const cantrips = allSpells
        .filter(s => s.level === 'cantrip')
        .slice(0, numCantrips);

      cantrips.forEach(spell => {
        character.abilities.push(spellToAbility(spell, true));
      });
    }

    // Get leveled spells
    const spellsKnownCount = getSpellsKnown(className, level);

    if (spellsKnownCount !== null && spellsKnownCount > 0) {
      // Known caster (Sorcerer, Bard, Ranger, Warlock)
      let recommendedSpells = [];

      if (className === 'ranger') {
        // Use ranger-specific recommendations
        recommendedSpells = getRangerSpellRecommendations(level);
      } else {
        // Get spells by level availability
        const maxSpellLevel = spellSlots ? spellSlots.findLastIndex(slots => slots > 0) : 1;
        recommendedSpells = allSpells.filter(s =>
          s.level !== 'cantrip' &&
          parseInt(s.level) <= maxSpellLevel
        );
      }

      // Take the appropriate number
      const spellsToAdd = recommendedSpells.slice(0, spellsKnownCount);

      spellsToAdd.forEach(spell => {
        character.abilities.push(spellToAbility(spell, true));
      });
    } else {
      // Prepared caster (Wizard, Cleric, Druid, Paladin)
      const preparedCount = getPreparedSpellsCount(className, level, abilityMod);
      const maxSpellLevel = spellSlots ? spellSlots.findLastIndex(slots => slots > 0) : 1;

      const leveledSpells = allSpells
        .filter(s => s.level !== 'cantrip' && parseInt(s.level) <= maxSpellLevel)
        .slice(0, preparedCount);

      leveledSpells.forEach(spell => {
        character.abilities.push(spellToAbility(spell, true));
      });
    }

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

export default {
  getStartingEquipment,
  getStartingCurrency,
  populateCharacterData
};
