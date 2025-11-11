/**
 * D&D 5e Data Loader
 * Utilities to populate characters with spells, items, and abilities
 */

import spellsSRD from '../data/spells-srd.json' assert { type: 'json' };
import itemsSRD from '../data/items-srd.json' assert { type: 'json' };
import classFeatures from '../data/class-features.json' assert { type: 'json' };

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
 */
export function getClassAbilities(className, level) {
  const normalizedClass = className.toLowerCase();
  const features = classFeatures[normalizedClass] || [];

  return features
    .filter(feature => feature.level <= level)
    .map(feature => ({
      ...feature,
      id: `${feature.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      uses: feature.uses ? {
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
 * Populate a character with D&D 5e data
 */
export function populateCharacterData(character) {
  if (!character.class || !character.level) {
    console.warn('Character missing class or level');
    return character;
  }

  // Add spells if spellcaster
  const spellcastingClasses = ['wizard', 'cleric', 'paladin', 'ranger', 'warlock', 'sorcerer', 'bard', 'druid'];
  if (spellcastingClasses.includes(character.class.toLowerCase())) {
    const allSpells = getSpellsForClass(character.class, character.level);
    const cantrips = allSpells.filter(s => s.level === 0);
    const leveled = allSpells.filter(s => s.level > 0 && s.level <= Math.ceil(character.level / 2));

    // Auto-prepare some spells
    const preparedSpells = leveled.slice(0, Math.max(3, Math.floor(character.level / 2)));
    preparedSpells.forEach(spell => spell.prepared = true);

    character.spellcasting = character.spellcasting || { enabled: true, spells: [] };
    character.spellcasting.spells = [...cantrips, ...preparedSpells];
  }

  // Add starting equipment if empty
  if (!character.inventory || character.inventory.length === 0) {
    character.inventory = getStartingEquipment(character.class, character.background);
  }

  // Add class abilities
  if (!character.abilities || character.abilities.length === 0) {
    character.abilities = getClassAbilities(character.class, character.level);
  }

  // Add starting currency if empty
  if (!character.currency || character.currency.gp === 0) {
    character.currency = getStartingCurrency(character.class);
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
