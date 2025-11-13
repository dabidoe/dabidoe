/**
 * Test D&D 5e Progression System
 * Demonstrates auto-population of abilities, spells, and equipment
 */

import { populateCharacterData } from './shared/data-loader.js';

// Test: Level 7 Ranger
console.log('═══════════════════════════════════════════════════');
console.log('🎯 TEST: Level 7 Ranger Auto-Population');
console.log('═══════════════════════════════════════════════════\n');

const ranger = {
  id: 'test-ranger',
  name: 'Aragorn',
  class: 'Ranger',
  level: 7,
  race: 'Human',
  stats: {
    str: 14,
    dex: 16,
    con: 14,
    int: 10,
    wis: 15,  // +2 mod = spell DC 13, +5 spell attack
    cha: 10
  },
  hp: { current: 50, max: 50 },
  ac: 15,
  background: 'outlander'
};

// Populate with D&D 5e mechanics
populateCharacterData(ranger);

console.log('📊 CHARACTER SUMMARY');
console.log('─────────────────────────────────────────────────────');
console.log(`Name: ${ranger.name}`);
console.log(`Class: ${ranger.class} ${ranger.level}`);
console.log(`Proficiency Bonus: +${ranger.proficiencyBonus}`);
console.log(`WIS Modifier: +${Math.floor((ranger.stats.wis - 10) / 2)}`);

if (ranger.spellcasting) {
  console.log(`\nSpell Save DC: ${ranger.spellcasting.spellSaveDC}`);
  console.log(`Spell Attack Bonus: +${ranger.spellcasting.spellAttackBonus}`);
}

console.log('\n\n✨ SPELL SLOTS');
console.log('─────────────────────────────────────────────────────');
if (ranger.spellSlots) {
  Object.entries(ranger.spellSlots).forEach(([level, slots]) => {
    if (slots.max > 0) {
      console.log(`Level ${level}: ${slots.max} slots`);
    }
  });
}

console.log('\n\n📚 ABILITIES (Unified: Features + Spells)');
console.log('─────────────────────────────────────────────────────');

// Group by category
const byCategory = ranger.abilities.reduce((acc, ability) => {
  if (!acc[ability.category]) acc[ability.category] = [];
  acc[ability.category].push(ability);
  return acc;
}, {});

// Show class features
if (byCategory['class-feature']) {
  console.log('\n🗡️  CLASS FEATURES:');
  byCategory['class-feature'].forEach(f => {
    const uses = f.uses ? ` (${f.uses.max}/${f.uses.per})` : '';
    console.log(`  - ${f.name}${uses}`);
  });
}

// Show spells
if (byCategory['spell']) {
  const cantrips = byCategory['spell'].filter(s => s.type === 'cantrip');
  const leveled = byCategory['spell'].filter(s => s.type === 'leveled-spell');

  if (cantrips.length > 0) {
    console.log('\n🔮 CANTRIPS:');
    cantrips.forEach(s => console.log(`  - ${s.name}`));
  }

  if (leveled.length > 0) {
    console.log('\n✨ SPELLS KNOWN:');
    const byLevel = leveled.reduce((acc, spell) => {
      if (!acc[spell.level]) acc[spell.level] = [];
      acc[spell.level].push(spell);
      return acc;
    }, {});

    Object.entries(byLevel)
      .sort(([a], [b]) => a - b)
      .forEach(([level, spells]) => {
        console.log(`  Level ${level}:`);
        spells.forEach(s => console.log(`    - ${s.name}${s.damage ? ` (${s.damage})` : ''}`));
      });
  }
}

console.log('\n\n🎒 EQUIPMENT');
console.log('─────────────────────────────────────────────────────');
if (ranger.inventory) {
  const equipped = ranger.inventory.filter(i => i.equipped);
  const stashed = ranger.inventory.filter(i => !i.equipped);

  if (equipped.length > 0) {
    console.log('Equipped:');
    equipped.forEach(i => console.log(`  - ${i.name}`));
  }

  if (stashed.length > 0) {
    console.log('\nIn Pack:');
    stashed.forEach(i => console.log(`  - ${i.name}`));
  }
}

console.log('\n\n💰 CURRENCY');
console.log('─────────────────────────────────────────────────────');
console.log(`${ranger.currency.gp} gp`);

console.log('\n\n═══════════════════════════════════════════════════');
console.log('✅ TEST COMPLETE');
console.log('═══════════════════════════════════════════════════');
console.log('\n📋 SUMMARY:');
console.log(`  • Proficiency Bonus: Auto-calculated (${ranger.proficiencyBonus})`);
console.log(`  • Spell Slots: ${ranger.spellSlots ? 'Half-caster progression applied' : 'N/A'}`);
console.log(`  • Class Features: ${byCategory['class-feature']?.length || 0} features (levels 1-7)`);
console.log(`  • Spells: ${byCategory['spell']?.length || 0} total (cantrips + known)`);
console.log(`  • Equipment: ${ranger.inventory?.length || 0} items`);
console.log('\n✨ All mechanics auto-populated from class progression tables!');
console.log('   LLM only needed for narrative/personality.\n');
