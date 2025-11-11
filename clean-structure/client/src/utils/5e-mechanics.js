/**
 * D&D 5e Game Mechanics
 * Extracted from test-enhanced-features.html
 */

/**
 * Roll dice with formula parsing
 * @param {string} formula - Dice formula (e.g., "2d6+3", "1d20", "d8")
 * @returns {Object} { total, rolls, modifier, formula, breakdown }
 */
export function rollDice(formula) {
  if (!formula) {
    return { total: 0, rolls: [], modifier: 0, formula: '', breakdown: '' };
  }

  // Parse formula: XdY+Z or XdY-Z or dY
  const match = formula.match(/(\d*)d(\d+)([+-]\d+)?/i);

  if (!match) {
    // Not a valid dice formula, might be a flat number
    const flatNum = parseInt(formula);
    if (!isNaN(flatNum)) {
      return {
        total: flatNum,
        rolls: [],
        modifier: flatNum,
        formula,
        breakdown: `${flatNum}`
      };
    }
    return { total: 0, rolls: [], modifier: 0, formula, breakdown: '' };
  }

  const count = parseInt(match[1]) || 1;
  const sides = parseInt(match[2]);
  const modifier = match[3] ? parseInt(match[3]) : 0;

  // Roll the dice
  const rolls = [];
  for (let i = 0; i < count; i++) {
    rolls.push(Math.floor(Math.random() * sides) + 1);
  }

  const rollTotal = rolls.reduce((sum, roll) => sum + roll, 0);
  const total = rollTotal + modifier;

  const breakdown = modifier !== 0
    ? `${rolls.join('+')}${modifier >= 0 ? '+' : ''}${modifier} = ${total}`
    : `${rolls.join('+')} = ${total}`;

  return {
    total,
    rolls,
    modifier,
    formula,
    breakdown,
    isCriticalSuccess: count === 1 && sides === 20 && rolls[0] === 20,
    isCriticalFailure: count === 1 && sides === 20 && rolls[0] === 1
  };
}

/**
 * Calculate ability modifier from score
 * @param {number} score - Ability score (1-30)
 * @returns {number} Modifier (-5 to +10)
 */
export function getAbilityModifier(score) {
  return Math.floor((score - 10) / 2);
}

/**
 * Format modifier with + or -
 * @param {number} mod - Modifier value
 * @returns {string} Formatted string (e.g., "+3" or "-1")
 */
export function formatModifier(mod) {
  return mod >= 0 ? `+${mod}` : `${mod}`;
}

/**
 * Calculate proficiency bonus from level
 * @param {number} level - Character level (1-20)
 * @returns {number} Proficiency bonus (2-6)
 */
export function getProficiencyBonus(level) {
  return 2 + Math.floor((level - 1) / 4);
}

/**
 * Roll skill check
 * @param {Object} params - Check parameters
 * @returns {Object} Roll result with breakdown
 */
export function rollSkillCheck({ abilityScore, proficiency = 0, proficiencyBonus, advantage = false, disadvantage = false }) {
  const abilityMod = getAbilityModifier(abilityScore);
  const profMod = proficiency * proficiencyBonus;
  const totalMod = abilityMod + profMod;

  let roll1 = Math.floor(Math.random() * 20) + 1;
  let roll2 = null;
  let rollUsed = roll1;

  if (advantage && !disadvantage) {
    roll2 = Math.floor(Math.random() * 20) + 1;
    rollUsed = Math.max(roll1, roll2);
  } else if (disadvantage && !advantage) {
    roll2 = Math.floor(Math.random() * 20) + 1;
    rollUsed = Math.min(roll1, roll2);
  }

  const total = rollUsed + totalMod;

  return {
    total,
    roll: rollUsed,
    roll1,
    roll2,
    modifier: totalMod,
    breakdown: roll2
      ? `${advantage ? 'ADV' : 'DIS'}(${roll1}, ${roll2}) = ${rollUsed} + ${totalMod} = ${total}`
      : `${rollUsed} + ${totalMod} = ${total}`,
    isCriticalSuccess: rollUsed === 20,
    isCriticalFailure: rollUsed === 1
  };
}

/**
 * Roll saving throw
 * @param {Object} params - Save parameters
 * @returns {Object} Roll result
 */
export function rollSavingThrow({ abilityScore, proficient = false, proficiencyBonus, advantage = false, disadvantage = false }) {
  return rollSkillCheck({
    abilityScore,
    proficiency: proficient ? 1 : 0,
    proficiencyBonus,
    advantage,
    disadvantage
  });
}

/**
 * Roll attack
 * @param {Object} params - Attack parameters
 * @returns {Object} Attack result
 */
export function rollAttack({ attackBonus, advantage = false, disadvantage = false }) {
  let roll1 = Math.floor(Math.random() * 20) + 1;
  let roll2 = null;
  let rollUsed = roll1;

  if (advantage && !disadvantage) {
    roll2 = Math.floor(Math.random() * 20) + 1;
    rollUsed = Math.max(roll1, roll2);
  } else if (disadvantage && !advantage) {
    roll2 = Math.floor(Math.random() * 20) + 1;
    rollUsed = Math.min(roll1, roll2);
  }

  const total = rollUsed + attackBonus;

  return {
    total,
    roll: rollUsed,
    roll1,
    roll2,
    modifier: attackBonus,
    breakdown: roll2
      ? `${advantage ? 'ADV' : 'DIS'}(${roll1}, ${roll2}) = ${rollUsed} + ${attackBonus} = ${total}`
      : `${rollUsed} + ${attackBonus} = ${total}`,
    isCriticalHit: rollUsed === 20,
    isCriticalMiss: rollUsed === 1,
    hit: (ac) => total >= ac
  };
}

/**
 * Get spell slots for a character
 * @param {number} level - Character level
 * @param {string} classType - 'full', 'half', 'third'
 * @param {number} spellLevel - Spell level (1-9)
 * @returns {number} Number of spell slots
 */
export function getSpellSlots(level, classType, spellLevel) {
  // Spell slot tables (simplified)
  const fullCasterSlots = {
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
  };

  if (classType === 'full') {
    return fullCasterSlots[level]?.[spellLevel - 1] || 0;
  } else if (classType === 'half') {
    // Half casters (Paladin, Ranger) start at level 2
    const casterLevel = Math.max(0, Math.ceil(level / 2));
    return fullCasterSlots[casterLevel]?.[spellLevel - 1] || 0;
  } else if (classType === 'third') {
    // 1/3 casters (Eldritch Knight, Arcane Trickster) start at level 3
    const casterLevel = Math.max(0, Math.ceil(level / 3));
    return fullCasterSlots[casterLevel]?.[spellLevel - 1] || 0;
  }

  return 0;
}

/**
 * Calculate damage on critical hit
 * @param {string} damageFormula - Normal damage formula
 * @returns {Object} Critical damage roll
 */
export function rollCriticalDamage(damageFormula) {
  // Double the dice, not the modifier
  const match = damageFormula.match(/(\d*)d(\d+)([+-]\d+)?/i);

  if (!match) {
    return rollDice(damageFormula);
  }

  const count = (parseInt(match[1]) || 1) * 2; // Double dice
  const sides = parseInt(match[2]);
  const modifier = match[3] || '';

  const critFormula = `${count}d${sides}${modifier}`;
  return rollDice(critFormula);
}

/**
 * Apply temp HP
 * @param {Object} character - Character object
 * @param {number} amount - Temp HP to add
 * @returns {number} New temp HP value
 */
export function applyTempHP(character, amount) {
  // Temp HP doesn't stack, take the higher value
  return Math.max(character.hp.temporary || 0, amount);
}

/**
 * Take damage
 * @param {Object} character - Character object
 * @param {number} damage - Damage amount
 * @returns {Object} Updated HP values
 */
export function takeDamage(character, damage) {
  let remaining = damage;
  let tempHP = character.hp.temporary || 0;
  let currentHP = character.hp.current;

  // Apply to temp HP first
  if (tempHP > 0) {
    if (tempHP >= remaining) {
      tempHP -= remaining;
      remaining = 0;
    } else {
      remaining -= tempHP;
      tempHP = 0;
    }
  }

  // Apply remaining to current HP
  if (remaining > 0) {
    currentHP = Math.max(0, currentHP - remaining);
  }

  return {
    current: currentHP,
    temporary: tempHP,
    damageDealt: damage,
    isUnconscious: currentHP === 0
  };
}

/**
 * Heal damage
 * @param {Object} character - Character object
 * @param {number} amount - Healing amount
 * @returns {Object} Updated HP values
 */
export function heal(character, amount) {
  const newHP = Math.min(character.hp.current + amount, character.hp.max);

  return {
    current: newHP,
    healingDone: newHP - character.hp.current
  };
}

/**
 * Check if character has spell slot available
 * @param {Object} character - Character object
 * @param {number} spellLevel - Spell level (1-9)
 * @returns {boolean}
 */
export function hasSpellSlot(character, spellLevel) {
  if (!character.spellcasting || spellLevel === 0) return true; // Cantrips always available

  const slots = character.spellcasting.spellSlots[spellLevel];
  return slots && slots.current > 0;
}

/**
 * Use spell slot
 * @param {Object} character - Character object
 * @param {number} spellLevel - Spell level (1-9)
 * @returns {boolean} Success
 */
export function useSpellSlot(character, spellLevel) {
  if (spellLevel === 0) return true; // Cantrips don't use slots

  if (!hasSpellSlot(character, spellLevel)) {
    return false;
  }

  character.spellcasting.spellSlots[spellLevel].current -= 1;
  return true;
}

/**
 * Get ordinal suffix for numbers
 * @param {number} num - Number
 * @returns {string} Ordinal string (e.g., "1st", "2nd", "3rd")
 */
export function getOrdinalSuffix(num) {
  const j = num % 10;
  const k = num % 100;

  if (j === 1 && k !== 11) return num + 'st';
  if (j === 2 && k !== 12) return num + 'nd';
  if (j === 3 && k !== 13) return num + 'rd';
  return num + 'th';
}

/**
 * Calculate passive perception
 * @param {Object} character - Character object
 * @returns {number} Passive perception value
 */
export function getPassivePerception(character) {
  const perceptionSkill = character.skills?.perception;
  if (!perceptionSkill) {
    const wisMod = getAbilityModifier(character.stats.wis);
    return 10 + wisMod;
  }

  return 10 + perceptionSkill.value;
}
