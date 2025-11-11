/**
 * Dice Rolling Utilities
 * Handles all dice mechanics for combat and abilities
 */

/**
 * Roll a single die
 * @param {number} sides - Number of sides on the die
 * @returns {number} Result of the roll
 */
export const rollDie = (sides) => {
  return Math.floor(Math.random() * sides) + 1
}

/**
 * Roll multiple dice and sum the results
 * @param {number} count - Number of dice to roll
 * @param {number} sides - Sides per die
 * @param {number} bonus - Flat bonus to add
 * @returns {Object} { total, rolls, formula }
 */
export const rollDamage = (count, sides, bonus = 0) => {
  let total = bonus
  let rolls = []

  for (let i = 0; i < count; i++) {
    const roll = rollDie(sides)
    rolls.push(roll)
    total += roll
  }

  const formula = `${count}d${sides}${bonus > 0 ? '+' + bonus : bonus < 0 ? bonus : ''}`

  return { total, rolls, formula }
}

/**
 * Roll a d20 with modifier
 * @param {number} modifier - Modifier to add to the roll
 * @returns {Object} { total, d20, modifier, isCrit, isFail }
 */
export const rollD20 = (modifier = 0) => {
  const d20 = rollDie(20)
  const total = d20 + modifier

  return {
    total,
    d20,
    modifier,
    isCrit: d20 === 20,
    isFail: d20 === 1
  }
}

/**
 * Roll an attack with damage
 * @param {Object} attackData - { modifier, damageCount, damageSides, damageBonus }
 * @returns {Object} Full attack result
 */
export const rollAttack = (attackData) => {
  const { modifier, damageCount, damageSides, damageBonus } = attackData

  const attack = rollD20(modifier)
  let damage = null

  if (!attack.isFail) {
    // Double damage dice on crit
    const diceCount = attack.isCrit ? damageCount * 2 : damageCount
    damage = rollDamage(diceCount, damageSides, damageBonus)
  }

  return {
    attack,
    damage
  }
}

/**
 * Format roll result for display
 * @param {Object} result - Attack/damage result
 * @returns {string} Formatted text
 */
export const formatRollResult = (result) => {
  const { attack, damage } = result

  let text = `Attack: ${attack.total} (d20: ${attack.d20}`
  if (attack.modifier !== 0) {
    text += `+${attack.modifier}`
  }
  text += ')'

  if (attack.isCrit) {
    text += ' **CRITICAL HIT!**'
  } else if (attack.isFail) {
    text += ' *Critical miss...*'
  }

  if (damage) {
    text += `\n💥 Damage: ${damage.total} (${damage.formula})`
    text += ` [${damage.rolls.join(', ')}]`
  }

  return text
}

/**
 * Get descriptive text based on roll result
 * @param {string} abilityName - Name of the ability
 * @param {Object} result - Roll result
 * @returns {string} Descriptive narration
 */
export const getNarration = (abilityName, result) => {
  const { attack } = result
  const { total, isCrit, isFail } = attack

  const narrations = {
    'Sword Strike': {
      crit: '*The bronze blade finds the perfect opening with legendary precision!*',
      fail: '*A rare misstep - even legends have imperfect moments.*',
      high: '*Masterful technique honed by eight decades of combat.*',
      mid: '*A solid strike delivered with practiced skill.*',
      low: '*The attack is launched with determined focus.*'
    },
    'Divine Fury': {
      crit: '*Divine wrath erupts! Silver fire blazes as immortal fury manifests!*',
      fail: '*The rage burns cold. Divine restraint overcomes mortal anger.*',
      high: '*Controlled fury channels through will forged by decades of war.*',
      mid: '*Ancient anger stirs within the warrior\'s immortal heart.*',
      low: '*Divine heritage flickers with restrained power.*'
    },
    'Spear Thrust': {
      crit: '*Perfect form! The spear flies with the certainty of legend itself!*',
      fail: '*Even the hero who never missed at Troy can have an off moment.*',
      high: '*Precision incarnate - the weapon of legends unleashed.*',
      mid: '*A well-aimed thrust from the greatest warrior of Troy.*',
      low: '*The spear is launched with focused intent.*'
    },
    'Shield Wall': {
      crit: '*Impenetrable! The bronze shield becomes an unbreachable divine barrier!*',
      fail: '*A stumble leaves the legendary defense momentarily compromised.*',
      high: '*Masterful defensive positioning covers every conceivable angle.*',
      mid: '*The shield is raised with practiced expertise.*',
      low: '*A defensive stance is taken with determined resolve.*'
    }
  }

  const ability = narrations[abilityName] || {
    crit: '*An extraordinary success!*',
    fail: '*The attempt fails...*',
    high: '*A strong execution.*',
    mid: '*A decent attempt.*',
    low: '*The action is performed.*'
  }

  if (isCrit) return ability.crit
  if (isFail) return ability.fail
  if (total >= 18) return ability.high
  if (total >= 12) return ability.mid
  return ability.low
}
