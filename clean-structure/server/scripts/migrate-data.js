/**
 * Migration Script: Import Existing Data to Clean Structure
 *
 * This script migrates:
 * - All items (community + your custom items)
 * - All spells (community + custom spells)
 * - All characters
 * - Preserves: iconLayers, guid, sharing, userId
 */

import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import spellsSRD from '../../data/spells-srd.json' assert { type: 'json' };
import itemsSRD from '../../data/items-srd.json' assert { type: 'json' };

dotenv.config({ path: '../.env' });

const OLD_DB_URI = process.env.OLD_MONGODB_URI || process.env.MONGODB_URI;
const NEW_DB_URI = process.env.MONGODB_URI;

async function migrateData() {
  console.log('🚀 Starting migration...\n');

  // Connect to both databases
  const oldClient = new MongoClient(OLD_DB_URI);
  const newClient = new MongoClient(NEW_DB_URI);

  try {
    await oldClient.connect();
    await newClient.connect();

    const oldDb = oldClient.db();
    const newDb = newClient.db();

    console.log('✅ Connected to databases\n');

    // ======================
    // 1. MIGRATE ITEMS
    // ======================
    console.log('📦 Migrating items...');

    const oldItems = await oldDb.collection('items').find({}).toArray();
    console.log(`   Found ${oldItems.length} existing items`);

    // Adapt schema for existing items
    const adaptedItems = oldItems.map(item => ({
      ...item,
      template: false,  // User-created items
      public: item.public !== undefined ? item.public : false,

      // Map your schema to clean structure
      shortDescription: item.shortDescription || '',
      longDescription: item.longDescription || '',
      type: item.type || 'Item',
      rarity: item.rarity || 'Common',
      itemSlot: item.itemSlot || null,
      damage: item.damage || '',
      armor: item.armor || '',

      // Preserve custom fields
      iconLayers: item.iconLayers || [],
      guid: item.guid || generateGuid(),
      userId: item.userId || null,
      tokens: item.tokens || 0,

      // Timestamps
      createdAt: item.createdAt || new Date(),
      updatedAt: item.updatedAt || new Date()
    }));

    if (adaptedItems.length > 0) {
      await newDb.collection('items').insertMany(adaptedItems);
      console.log(`   ✅ Migrated ${adaptedItems.length} items\n`);
    }

    // ======================
    // 2. ADD SRD ITEMS
    // ======================
    console.log('📦 Adding SRD items...');

    const srdItemsAdapted = itemsSRD.map(item => ({
      name: item.name,
      shortDescription: item.description?.substring(0, 100) || '',
      longDescription: item.description || '',
      type: mapItemType(item.category),
      rarity: capitalize(item.rarity),
      itemSlot: mapItemSlot(item.slot),
      damage: formatDamage(item.weapon),
      armor: formatArmor(item.armor),

      // SRD fields
      template: true,
      public: true,
      userId: null,
      guid: `srd-${item.id}`,
      iconLayers: [],
      tokens: 0,

      // Preserve original structure for compatibility
      srdData: item,

      createdAt: new Date(),
      updatedAt: new Date()
    }));

    await newDb.collection('items').insertMany(srdItemsAdapted);
    console.log(`   ✅ Added ${srdItemsAdapted.length} SRD items\n`);

    // ======================
    // 3. MIGRATE SPELLS
    // ======================
    console.log('✨ Migrating spells...');

    const oldSpells = await oldDb.collection('spells').find({}).toArray();
    console.log(`   Found ${oldSpells.length} existing spells`);

    const adaptedSpells = oldSpells.map(spell => ({
      ...spell,
      template: false,
      public: spell.public !== undefined ? spell.public : false,

      // Ensure required fields
      name: spell.name,
      shortDescription: spell.shortDescription || '',
      longDescription: spell.longDescription || '',
      category: spell.category || 'Utility',
      school: spell.school || 'Evocation',
      level: spell.level || '1',
      castingTime: spell.castingTime || '1 action',
      range: spell.range || '60ft',
      components: spell.components || 'V, S',
      duration: spell.duration || 'Instantaneous',

      damage: spell.damage || {},
      savingThrow: spell.savingThrow || {},
      areaOfEffect: spell.areaOfEffect || {},

      iconLayers: spell.iconLayers || [],
      guid: spell.guid || generateGuid(),
      userId: spell.userId || null,
      tokens: spell.tokens || 0,

      createdAt: spell.createdAt || new Date(),
      updatedAt: spell.updatedAt || new Date()
    }));

    if (adaptedSpells.length > 0) {
      await newDb.collection('spells').insertMany(adaptedSpells);
      console.log(`   ✅ Migrated ${adaptedSpells.length} spells\n`);
    }

    // ======================
    // 4. ADD SRD SPELLS
    // ======================
    console.log('✨ Adding SRD spells...');

    const srdSpellsAdapted = spellsSRD.map(spell => ({
      name: spell.name,
      shortDescription: spell.description?.substring(0, 100) || '',
      longDescription: spell.description || '',
      category: 'Utility',
      school: capitalize(spell.school),
      level: spell.level === 'cantrip' ? '0' : spell.level.toString(),
      castingTime: spell.casting_time,
      range: spell.range,
      components: spell.components?.raw || '',
      duration: spell.duration,

      damage: parseDamage(spell.description),
      savingThrow: parseSave(spell.description),
      areaOfEffect: {},

      // SRD fields
      template: true,
      public: true,
      userId: null,
      guid: `srd-${spell.name.toLowerCase().replace(/\s+/g, '-')}`,
      iconLayers: [],
      tokens: 0,

      // Classes that can use this spell
      classes: spell.classes || [],

      // Preserve original
      srdData: spell,

      createdAt: new Date(),
      updatedAt: new Date()
    }));

    await newDb.collection('spells').insertMany(srdSpellsAdapted);
    console.log(`   ✅ Added ${srdSpellsAdapted.length} SRD spells\n`);

    // ======================
    // 5. MIGRATE CHARACTERS
    // ======================
    console.log('👤 Migrating characters...');

    const oldCharacters = await oldDb.collection('characters').find({}).toArray();
    console.log(`   Found ${oldCharacters.length} existing characters`);

    const adaptedCharacters = oldCharacters.map(char => ({
      ...char,

      // Ensure guid exists
      guid: char.guid || generateGuid(),

      // Make sure inventory/spells are arrays
      inventory: char.inventory || [],
      spells: char.spells || [],
      abilities: char.abilities || [],

      createdAt: char.createdAt || new Date(),
      updatedAt: char.updatedAt || new Date()
    }));

    if (adaptedCharacters.length > 0) {
      await newDb.collection('characters').insertMany(adaptedCharacters);
      console.log(`   ✅ Migrated ${adaptedCharacters.length} characters\n`);
    }

    // ======================
    // SUMMARY
    // ======================
    console.log('🎉 Migration complete!\n');
    console.log('Summary:');
    console.log(`   Items: ${oldItems.length} existing + ${srdItemsAdapted.length} SRD = ${oldItems.length + srdItemsAdapted.length} total`);
    console.log(`   Spells: ${oldSpells.length} existing + ${srdSpellsAdapted.length} SRD = ${oldSpells.length + srdSpellsAdapted.length} total`);
    console.log(`   Characters: ${oldCharacters.length}`);
    console.log('\n✅ All data migrated successfully!');

  } catch (error) {
    console.error('❌ Migration error:', error);
    throw error;
  } finally {
    await oldClient.close();
    await newClient.close();
  }
}

// ==================
// HELPER FUNCTIONS
// ==================

function generateGuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function mapItemType(category) {
  const typeMap = {
    weapon: 'Weapon',
    armor: 'Armor',
    shield: 'Shield',
    potion: 'Potion',
    scroll: 'Scroll',
    ring: 'Ring',
    amulet: 'Jewelry',
    gear: 'Equipment',
    tool: 'Tool',
    treasure: 'Treasure'
  };
  return typeMap[category] || 'Item';
}

function mapItemSlot(slot) {
  const slotMap = {
    head: 'Head',
    neck: 'Neck',
    body: 'Body',
    hands: 'Hands',
    feet: 'Feet',
    ring: 'Ring',
    mainHand: 'MainHand',
    offHand: 'OffHand',
    back: 'Back'
  };
  return slot ? slotMap[slot] : null;
}

function formatDamage(weaponData) {
  if (!weaponData) return '';
  const damage = weaponData.damage || '';
  const type = weaponData.damageType || '';
  return damage && type ? `${damage} ${type}` : damage;
}

function formatArmor(armorData) {
  if (!armorData) return '';
  return armorData.ac ? `AC ${armorData.ac}` : '';
}

function parseDamage(description) {
  if (!description) return {};

  const damageMatch = description.match(/(\d+d\d+(?:\s*\+\s*\d+)?)/);
  const typeMatch = description.match(/(acid|cold|fire|force|lightning|necrotic|poison|psychic|radiant|thunder)/i);

  return {
    formula: damageMatch ? damageMatch[1] : '',
    type: typeMatch ? typeMatch[1] : ''
  };
}

function parseSave(description) {
  if (!description) return {};

  const saveMatch = description.match(/(STR|DEX|CON|INT|WIS|CHA)\s+sav(e|ing throw)/i);

  return saveMatch ? {
    ability: saveMatch[1].toUpperCase(),
    dc: null
  } : {};
}

// Run migration
migrateData().catch(console.error);
