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
 * Distribute spells intelligently across available spell levels
 * Ensures a good mix of spells from each level rather than just grabbing the first N
 */
function distributeSpellsByLevel(allSpells, totalCount, maxSpellLevel) {
  const selectedSpells = [];

  // Filter spells to only those we can cast
  const availableSpells = allSpells.filter(s =>
    s.level !== 'cantrip' && parseInt(s.level) <= maxSpellLevel
  );

  // Group spells by level
  const spellsByLevel = {};
  for (let i = 1; i <= maxSpellLevel; i++) {
    spellsByLevel[i] = availableSpells.filter(s => parseInt(s.level) === i);
  }

  // Calculate how many spells per level (distribute evenly, with preference for lower levels)
  const spellsPerLevel = {};
  let remaining = totalCount;

  // Strategy: Give more spells to lower levels, but ensure all levels get representation
  for (let level = 1; level <= maxSpellLevel; level++) {
    const availableAtLevel = spellsByLevel[level]?.length || 0;
    if (availableAtLevel === 0) continue;

    // Base allocation: at least 1 spell per level, more for lower levels
    const weight = (maxSpellLevel - level + 1); // Higher weight for lower levels
    const totalWeight = ((maxSpellLevel + 1) * maxSpellLevel) / 2; // Sum of weights
    let allocation = Math.max(1, Math.floor((weight / totalWeight) * totalCount));

    // Don't allocate more than available
    allocation = Math.min(allocation, availableAtLevel);
    // Don't allocate more than remaining
    allocation = Math.min(allocation, remaining);

    spellsPerLevel[level] = allocation;
    remaining -= allocation;
  }

  // Distribute any remaining spells to lower levels first
  for (let level = 1; level <= maxSpellLevel && remaining > 0; level++) {
    const availableAtLevel = spellsByLevel[level]?.length || 0;
    const currentAllocation = spellsPerLevel[level] || 0;

    if (currentAllocation < availableAtLevel) {
      const canAdd = Math.min(remaining, availableAtLevel - currentAllocation);
      spellsPerLevel[level] = currentAllocation + canAdd;
      remaining -= canAdd;
    }
  }

  // Select the actual spells
  for (let level = 1; level <= maxSpellLevel; level++) {
    const count = spellsPerLevel[level] || 0;
    if (count > 0 && spellsByLevel[level]) {
      // Take the first N spells of this level
      const spells = spellsByLevel[level].slice(0, count);
      selectedSpells.push(...spells);
    }
  }

  return selectedSpells;
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
      // Array is 0-indexed but represents [1st, 2nd, 3rd, ...] level spells
      spellSlots.forEach((slots, index) => {
        if (slots > 0) {
          character.spellSlots[index + 1] = { current: slots, max: slots };
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

    // Determine max spell level available
    const maxSpellLevel = spellSlots ? spellSlots.findLastIndex(slots => slots > 0) : 1;

    // Get leveled spells with proper distribution
    const spellsKnownCount = getSpellsKnown(className, level);

    if (spellsKnownCount !== null && spellsKnownCount > 0) {
      // Known caster (Sorcerer, Bard, Ranger, Warlock)
      let spellsToAdd = [];

      if (className === 'ranger') {
        // Use ranger-specific recommendations
        spellsToAdd = getRangerSpellRecommendations(level);
      } else {
        // Distribute spells intelligently across available spell levels
        spellsToAdd = distributeSpellsByLevel(allSpells, spellsKnownCount, maxSpellLevel);
      }

      spellsToAdd.forEach(spell => {
        character.abilities.push(spellToAbility(spell, true));
      });
    } else {
      // Prepared caster (Wizard, Cleric, Druid, Paladin)
      const preparedCount = getPreparedSpellsCount(className, level, abilityMod);

      // Distribute prepared spells intelligently across available spell levels
      const preparedSpells = distributeSpellsByLevel(allSpells, preparedCount, maxSpellLevel);

      preparedSpells.forEach(spell => {
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
