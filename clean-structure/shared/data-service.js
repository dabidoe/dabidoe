/**
 * Unified Data Service - Local-First Asset Loading
 * Loads spells, items, abilities from local JSON files
 */

import spellsData from '../data/spells-srd.json' with { type: 'json' };
import itemsData from '../data/items-srd.json' with { type: 'json' };
import classFeaturesData from '../data/class-features.json' with { type: 'json' };

// Cache for performance
const cache = {
  spellsByClass: {},
  spellsById: {},
  itemsById: {},
  classFeaturesById: {}
};

// Initialize caches
function initializeCaches() {
  // Index spells by ID
  spellsData.forEach(spell => {
    cache.spellsById[spell.name.toLowerCase().replace(/\s+/g, '-')] = spell;
  });

  // Index items by ID
  itemsData.forEach(item => {
    cache.itemsById[item.id] = item;
  });

  // Index class features by ID
  Object.entries(classFeaturesData).forEach(([className, features]) => {
    features.forEach(feature => {
      const key = `${className}-${feature.id}`;
      cache.classFeaturesById[key] = { ...feature, className };
    });
  });
}

// Initialize on module load
initializeCaches();

/**
 * Get all spells available to a specific class
 */
export function getSpellsByClass(className) {
  const lowerClass = className.toLowerCase();

  if (cache.spellsByClass[lowerClass]) {
    return cache.spellsByClass[lowerClass];
  }

  const spells = spellsData.filter(spell =>
    spell.classes && spell.classes.includes(lowerClass)
  );

  cache.spellsByClass[lowerClass] = spells;
  return spells;
}

/**
 * Get spells by level for a class
 */
export function getSpellsByClassAndLevel(className, level) {
  const classSpells = getSpellsByClass(className);

  if (level === 'cantrip' || level === 0) {
    return classSpells.filter(s => s.level === 'cantrip');
  }

  return classSpells.filter(s => s.level === String(level));
}

/**
 * Get a specific spell by name
 */
export function getSpellByName(name) {
  const spellId = name.toLowerCase().replace(/\s+/g, '-').replace(/'/g, '');
  return cache.spellsById[spellId] || spellsData.find(s =>
    s.name.toLowerCase() === name.toLowerCase()
  );
}

/**
 * Get Ranger spell recommendations for a given level
 */
export function getRangerSpellRecommendations(characterLevel) {
  const spells = getSpellsByClass('ranger');
  const cantrips = spells.filter(s => s.level === 'cantrip');
  const level1 = spells.filter(s => s.level === '1');
  const level2 = spells.filter(s => s.level === '2');
  const level3 = spells.filter(s => s.level === '3');

  // Rangers don't get cantrips
  const recommendations = [];

  // Level-appropriate spells (Rangers are half-casters)
  if (characterLevel >= 2) {
    // Core ranger spells
    recommendations.push(
      ...level1.filter(s =>
        ['Hunter\'s Mark', 'Cure Wounds', 'Goodberry', 'Ensnaring Strike',
         'Fog Cloud', 'Jump', 'Longstrider'].includes(s.name)
      )
    );
  }

  if (characterLevel >= 5) {
    recommendations.push(
      ...level2.filter(s =>
        ['Pass without Trace', 'Spike Growth', 'Lesser Restoration',
         'Healing Spirit', 'Locate Object'].includes(s.name)
      )
    );
  }

  if (characterLevel >= 9) {
    recommendations.push(
      ...level3.filter(s =>
        ['Conjure Animals', 'Lightning Arrow', 'Plant Growth',
         'Water Breathing'].includes(s.name)
      )
    );
  }

  return recommendations;
}

/**
 * Get all class features for a class up to a specific level
 */
export function getClassFeaturesByLevel(className, level) {
  const lowerClass = className.toLowerCase();
  const classFeatures = classFeaturesData[lowerClass] || [];

  return classFeatures.filter(feature => feature.level <= level);
}

/**
 * Get specific class feature by ID
 */
export function getClassFeature(className, featureId) {
  const key = `${className.toLowerCase()}-${featureId}`;
  return cache.classFeaturesById[key];
}

/**
 * Get item by ID
 */
export function getItemById(itemId) {
  return cache.itemsById[itemId];
}

/**
 * Get items by category
 */
export function getItemsByCategory(category) {
  return itemsData.filter(item => item.category === category);
}

/**
 * Get all weapons
 */
export function getWeapons() {
  return getItemsByCategory('weapon');
}

/**
 * Get all armor
 */
export function getArmor() {
  return getItemsByCategory('armor');
}

/**
 * Get starting equipment for a class
 */
export function getStartingEquipment(className) {
  const lowerClass = className.toLowerCase();

  // Basic starting equipment by class (ID + equipped/quantity info)
  const startingEquipmentIds = {
    ranger: [
      { id: 'greataxe', equipped: true },
      { id: 'handaxe', equipped: false, quantity: 2 },
      { id: 'longbow', equipped: false },
      { id: 'leather-armor', equipped: true },
      { id: 'backpack', equipped: true },
      { id: 'rations', equipped: false, quantity: 10 },
      { id: 'rope-hemp', equipped: false, quantity: 1 },
      { id: 'potion-healing', equipped: false, quantity: 2 }
    ],
    fighter: [
      { id: 'longsword', equipped: true },
      { id: 'shield', equipped: true },
      { id: 'chain-mail', equipped: true },
      { id: 'backpack', equipped: true },
      { id: 'rations', equipped: false, quantity: 10 }
    ],
    wizard: [
      { id: 'dagger', equipped: true },
      { id: 'backpack', equipped: true },
      { id: 'rations', equipped: false, quantity: 10 }
    ],
    // Add more classes as needed
  };

  const equipmentIds = startingEquipmentIds[lowerClass] || [];

  // Map IDs to full item objects from items-srd.json
  return equipmentIds.map(equipInfo => {
    const fullItem = getItemById(equipInfo.id);
    if (!fullItem) {
      console.warn(`Item not found: ${equipInfo.id}`);
      return null;
    }

    // Merge full item data with equipped/quantity info
    return {
      ...fullItem,
      equipped: equipInfo.equipped || false,
      quantity: equipInfo.quantity || 1
    };
  }).filter(item => item !== null);
}

/**
 * Convert spell from SRD format to character ability format
 */
export function spellToAbility(spell, prepared = true) {
  const isCantrip = spell.level === 'cantrip';

  return {
    abilityId: spell.name.toLowerCase().replace(/\s+/g, '-').replace(/'/g, ''),
    name: spell.name,
    category: 'spell',
    type: isCantrip ? 'cantrip' : 'leveled-spell',
    level: isCantrip ? 0 : parseInt(spell.level),
    prepared: isCantrip ? true : prepared,
    details: {
      name: spell.name,
      shortDescription: spell.description.split('\n')[0].substring(0, 100),
      school: spell.school.charAt(0).toUpperCase() + spell.school.slice(1),
      level: isCantrip ? 0 : parseInt(spell.level),
      castingTime: spell.casting_time,
      range: spell.range,
      duration: spell.duration,
      components: spell.components.raw,
      ritual: spell.ritual,
      description: spell.description,
      iconLayers: [[getSpellIcon(spell.school)]]
    }
  };
}

/**
 * Get emoji icon for spell school
 */
function getSpellIcon(school) {
  const icons = {
    evocation: '🔥',
    abjuration: '🛡️',
    conjuration: '✨',
    divination: '🔮',
    enchantment: '💫',
    illusion: '🎭',
    necromancy: '💀',
    transmutation: '🌿'
  };
  return icons[school.toLowerCase()] || '✨';
}

/**
 * Convert class feature to character ability format
 */
export function featureToAbility(feature) {
  return {
    abilityId: feature.id,
    name: feature.name,
    category: feature.category || 'combat',
    equipped: true,
    usable: feature.usable, // Preserve usable flag (true = clickable ability)
    damage: feature.damage, // Preserve damage for combat abilities
    details: {
      name: feature.name,
      shortDescription: feature.shortDescription,
      school: 'Class Feature',
      description: feature.description,
      actionType: feature.actionType,
      usable: feature.usable, // Include in details too
      uses: feature.uses,
      damage: feature.damage, // Include in details too
      range: feature.range,
      effects: feature.effects,
      iconLayers: [[getCategoryIcon(feature.category)]]
    }
  };
}

/**
 * Get emoji icon for ability category
 */
function getCategoryIcon(category) {
  const icons = {
    combat: '⚔️',
    defensive: '🛡️',
    utility: '🔧',
    social: '💬',
    attack: '⚔️'
  };
  return icons[category] || '⚔️';
}

/**
 * Get all available data (for debugging)
 */
export function getAllData() {
  return {
    spells: spellsData,
    items: itemsData,
    classFeatures: classFeaturesData
  };
}

export default {
  getSpellsByClass,
  getSpellsByClassAndLevel,
  getSpellByName,
  getRangerSpellRecommendations,
  getClassFeaturesByLevel,
  getClassFeature,
  getItemById,
  getItemsByCategory,
  getWeapons,
  getArmor,
  getStartingEquipment,
  spellToAbility,
  featureToAbility,
  getAllData
};
