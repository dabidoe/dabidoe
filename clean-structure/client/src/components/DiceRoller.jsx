import { useState } from 'react'
import PropTypes from 'prop-types'
import './DiceRoller.css'

function DiceRoller({ character, onMessage, onClose }) {
  const [diceType, setDiceType] = useState(20)
  const [modifier, setModifier] = useState(0)
  const [numDice, setNumDice] = useState(1)
  const [activeTab, setActiveTab] = useState('dice')

  const rollDice = (sides, mod = 0, count = 1, label = '') => {
    const rolls = []
    let total = 0

    for (let i = 0; i < count; i++) {
      const roll = Math.floor(Math.random() * sides) + 1
      rolls.push(roll)
      total += roll
    }

    total += mod

    let message = label ? `🎲 **${label}**\n\n` : '🎲 **Custom Roll**\n\n'

    if (count > 1) {
      message += `${count}d${sides}`
    } else {
      message += `d${sides}`
    }

    if (mod !== 0) {
      message += ` ${mod >= 0 ? '+' : ''}${mod}`
    }

    message += ` = **${total}**`

    if (count > 1 || mod !== 0) {
      message += ` [${rolls.join(', ')}]`
    }

    onMessage(message, 'player')
  }

  const handleCustomRoll = () => {
    rollDice(diceType, modifier, numDice, 'Custom Roll')
  }

  // Helper to parse and roll damage dice (e.g., "1d8", "2d6+3")
  const rollDamage = (damageStr) => {
    const match = damageStr.match(/(\d+)d(\d+)([+-]\d+)?/)
    if (!match) return { total: 0, rolls: [], formula: damageStr }

    const count = parseInt(match[1])
    const sides = parseInt(match[2])
    const modifier = match[3] ? parseInt(match[3]) : 0

    const rolls = []
    let total = 0
    for (let i = 0; i < count; i++) {
      const roll = Math.floor(Math.random() * sides) + 1
      rolls.push(roll)
      total += roll
    }
    total += modifier

    return { total, rolls, formula: damageStr }
  }

  // Handle combat actions
  const handleMeleeAttack = () => {
    const meleeWeapons = character.inventory?.filter(i =>
      i.category === 'weapon' &&
      i.equipped &&
      !i.weapon?.properties?.includes('ammunition')
    )
    const weapon = meleeWeapons?.find(w => w.slot === 'mainHand') || meleeWeapons?.[0] || { name: 'Unarmed', weapon: { damage: '1d4', damageType: 'bludgeoning' } }
    const attackBonus = Math.floor((character.stats.str - 10) / 2) + character.proficiencyBonus
    const attackRoll = Math.floor(Math.random() * 20) + 1
    const attackTotal = attackRoll + attackBonus

    // Roll damage
    const damageFormula = weapon.weapon?.damage || '1d4'
    const damageType = weapon.weapon?.damageType || 'bludgeoning'
    const damageBonus = Math.floor((character.stats.str - 10) / 2)
    const damage = rollDamage(damageFormula)
    const totalDamage = damage.total + damageBonus

    onMessage(`⚔️ **${weapon.name} Attack**\n\n` +
              `To Hit: d20(${attackRoll}) + ${attackBonus} = **${attackTotal}**\n` +
              `Damage: ${damageFormula}(${damage.rolls.join(', ')}) + ${damageBonus} = **${totalDamage} ${damageType}**`, 'player')
  }

  const handleRangedAttack = () => {
    const rangedWeapons = character.inventory?.filter(i =>
      i.category === 'weapon' &&
      i.equipped &&
      (i.weapon?.properties?.includes('thrown') || i.weapon?.properties?.includes('ammunition'))
    )
    const weapon = rangedWeapons?.[0] || { name: 'Improvised', weapon: { damage: '1d4', damageType: 'bludgeoning' } }
    const useStr = weapon.weapon?.properties?.includes('thrown') && !weapon.weapon?.properties?.includes('ammunition')
    const attackBonus = Math.floor(((useStr ? character.stats.str : character.stats.dex) - 10) / 2) + character.proficiencyBonus
    const attackRoll = Math.floor(Math.random() * 20) + 1
    const attackTotal = attackRoll + attackBonus

    // Roll damage
    const damageFormula = weapon.weapon?.damage || '1d4'
    const damageType = weapon.weapon?.damageType || 'bludgeoning'
    const damageBonus = Math.floor(((useStr ? character.stats.str : character.stats.dex) - 10) / 2)
    const damage = rollDamage(damageFormula)
    const totalDamage = damage.total + damageBonus

    onMessage(`🏹 **${weapon.name} Attack**\n\n` +
              `To Hit: d20(${attackRoll}) + ${attackBonus} = **${attackTotal}**\n` +
              `Damage: ${damageFormula}(${damage.rolls.join(', ')}) + ${damageBonus} = **${totalDamage} ${damageType}**`, 'player')
  }

  const handleInitiative = () => {
    const initiativeBonus = Math.floor((character.stats.dex - 10) / 2)
    const roll = Math.floor(Math.random() * 20) + 1
    const total = roll + initiativeBonus
    onMessage(`🎲 Initiative: d20(${roll}) + ${initiativeBonus} = ${total}`, 'player')
  }

  // Quick roll buttons
  const quickRolls = [
    { label: 'd4', sides: 4 },
    { label: 'd6', sides: 6 },
    { label: 'd8', sides: 8 },
    { label: 'd10', sides: 10 },
    { label: 'd12', sides: 12 },
    { label: 'd20', sides: 20 },
    { label: 'd100', sides: 100 }
  ]

  return (
    <div className="dice-roller-popup">
      <div className="dice-roller-header">
        <h3>🎲 Quick Actions</h3>
        <button className="close-roller-btn" onClick={onClose}>✕</button>
      </div>

      {/* Combat Actions - Always Visible */}
      {character && (
        <div className="roller-section combat-section">
          <div className="combat-actions-grid">
            <button className="combat-action-btn melee" onClick={handleMeleeAttack}>
              <span className="action-emoji">⚔️</span>
              <span className="action-text">Melee</span>
              <span className="weapon-name">
                {(() => {
                  const meleeWeapons = character.inventory?.filter(i =>
                    i.category === 'weapon' &&
                    i.equipped &&
                    !i.weapon?.properties?.includes('ammunition')
                  )
                  const weapon = meleeWeapons?.find(w => w.slot === 'mainHand') || meleeWeapons?.[0]
                  return weapon ? weapon.name : 'Unarmed'
                })()}
              </span>
            </button>
            <button className="combat-action-btn ranged" onClick={handleRangedAttack}>
              <span className="action-emoji">🏹</span>
              <span className="action-text">Ranged</span>
              <span className="weapon-name">
                {(() => {
                  const rangedWeapons = character.inventory?.filter(i =>
                    i.category === 'weapon' &&
                    i.equipped &&
                    (i.weapon?.properties?.includes('thrown') || i.weapon?.properties?.includes('ammunition'))
                  )
                  const weapon = rangedWeapons?.[0]
                  return weapon ? weapon.name : 'Improvised'
                })()}
              </span>
            </button>
            <button className="combat-action-btn initiative" onClick={handleInitiative}>
              <span className="action-emoji">🎲</span>
              <span className="action-text">Initiative</span>
            </button>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="roller-tabs">
        <button
          className={`roller-tab ${activeTab === 'dice' ? 'active' : ''}`}
          onClick={() => setActiveTab('dice')}
        >
          🎲
        </button>
        <button
          className={`roller-tab ${activeTab === 'checks' ? 'active' : ''}`}
          onClick={() => setActiveTab('checks')}
        >
          Checks
        </button>
        <button
          className={`roller-tab ${activeTab === 'saves' ? 'active' : ''}`}
          onClick={() => setActiveTab('saves')}
        >
          Saves
        </button>
        <button
          className={`roller-tab ${activeTab === 'actions' ? 'active' : ''}`}
          onClick={() => setActiveTab('actions')}
        >
          Actions
        </button>
      </div>

      <div className="dice-roller-content">
        {/* Dice Tab */}
        {activeTab === 'dice' && (
          <>
            <div className="roller-section">
              <strong>Quick Rolls</strong>
              <div className="quick-rolls-grid">
                {quickRolls.map(({ label, sides }) => (
                  <button
                    key={label}
                    className="quick-roll-btn"
                    onClick={() => rollDice(sides, 0, 1, label)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="roller-section">
              <strong>Custom Roll</strong>
              <div className="custom-roll-controls">
                <div className="control-group">
                  <label>Dice</label>
                  <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                    <input
                      type="number"
                      min="1"
                      max="20"
                      value={numDice}
                      onChange={(e) => setNumDice(Math.max(1, parseInt(e.target.value) || 1))}
                      className="dice-input small"
                    />
                    <span style={{ color: 'rgba(255,255,255,0.5)' }}>d</span>
                    <select
                      value={diceType}
                      onChange={(e) => setDiceType(parseInt(e.target.value))}
                      className="dice-select"
                    >
                      <option value="4">4</option>
                      <option value="6">6</option>
                      <option value="8">8</option>
                      <option value="10">10</option>
                      <option value="12">12</option>
                      <option value="20">20</option>
                      <option value="100">100</option>
                    </select>
                  </div>
                </div>

                <div className="control-group">
                  <label>Modifier</label>
                  <input
                    type="number"
                    min="-20"
                    max="20"
                    value={modifier}
                    onChange={(e) => setModifier(parseInt(e.target.value) || 0)}
                    className="dice-input"
                  />
                </div>

                <button className="roll-btn" onClick={handleCustomRoll}>
                  Roll
                </button>
              </div>
            </div>
          </>
        )}

        {/* Checks Tab */}
        {activeTab === 'checks' && character && (
          <div className="roller-section">
            <div className="ability-checks-grid">
              {['str', 'dex', 'con', 'int', 'wis', 'cha'].map(stat => {
                const statValue = character.stats?.[stat] || 10
                const mod = Math.floor((statValue - 10) / 2)
                return (
                  <button
                    key={stat}
                    className="ability-check-btn"
                    onClick={() => rollDice(20, mod, 1, `${stat.toUpperCase()} Check`)}
                  >
                    {stat.toUpperCase()}<br/>
                    <span className="mod-value">{mod >= 0 ? '+' : ''}{mod}</span>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Saves Tab */}
        {activeTab === 'saves' && character && (
          <div className="roller-section">
            <div className="saves-grid">
              {['str', 'dex', 'con', 'int', 'wis', 'cha'].map(stat => {
                const statValue = character.stats?.[stat] || 10
                const mod = Math.floor((statValue - 10) / 2)
                const proficient = character.class === 'Ranger' && ['str', 'dex'].includes(stat)
                const finalMod = proficient ? mod + (character.proficiencyBonus || 0) : mod

                return (
                  <button
                    key={stat}
                    className={`save-btn ${proficient ? 'proficient' : ''}`}
                    onClick={() => rollDice(20, finalMod, 1, `${stat.toUpperCase()} Save`)}
                  >
                    {stat.toUpperCase()}<br/>
                    <span className="mod-value">{finalMod >= 0 ? '+' : ''}{finalMod}</span>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Actions Tab */}
        {activeTab === 'actions' && character && (
          <div className="roller-section">
            <div className="actions-grid">
              {character.abilities
                ?.filter(ability => {
                  // Show abilities/spells that have damage or attack rolls
                  const details = ability.details || {}
                  const desc = (details.description || '').toLowerCase()
                  const shortDesc = (details.shortDescription || '').toLowerCase()
                  const hasAttack = details.attack || desc.includes('attack') || shortDesc.includes('attack')
                  const hasDamage = details.damage || desc.includes('d4') || desc.includes('d6') ||
                                   desc.includes('d8') || desc.includes('d10') || desc.includes('d12') || desc.includes('d20')
                  return hasAttack || hasDamage
                })
                .map((ability, index) => {
                  const isSpell = ability.category === 'spell'
                  const icon = isSpell ? '✨' : '⚔️'
                  return (
                    <button
                      key={index}
                      className="action-ability-btn"
                      onClick={() => {
                        // Roll for the ability
                        const details = ability.details || {}
                        const abilityName = details.name || ability.name
                        const damage = details.damage || '1d8'
                        onMessage(`${icon} **${abilityName}**: ${damage}`, 'player')
                      }}
                    >
                      <span className="ability-icon">{icon}</span>
                      <span className="ability-name">{ability.details?.name || ability.name}</span>
                      {ability.details?.damage && (
                        <span className="ability-damage">{ability.details.damage}</span>
                      )}
                    </button>
                  )
                })}
              {(!character.abilities || character.abilities.filter(a => {
                const details = a.details || {}
                const desc = (details.description || '').toLowerCase()
                const shortDesc = (details.shortDescription || '').toLowerCase()
                return details.attack || details.damage || desc.includes('d')
              }).length === 0) && (
                <div style={{padding: '20px', textAlign: 'center', color: 'rgba(255,255,255,0.5)', gridColumn: '1 / -1'}}>
                  No actions available
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

DiceRoller.propTypes = {
  character: PropTypes.object,
  onMessage: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired
}

export default DiceRoller
