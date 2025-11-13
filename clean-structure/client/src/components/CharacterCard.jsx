import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { rollAttack, rollD20, getNarration } from '../utils/dice'
import { getDemoCharacter } from '../data/demo-characters'
import { populateCharacterData } from '../../../shared/data-loader'
import CharacterModes from './CharacterModes'
import SpellBrowser from './SpellBrowser'
import AbilityBrowser from './AbilityBrowser'
import EquipmentBrowser from './EquipmentBrowser'
import './CharacterCard.css'

function CharacterCard() {
  const { characterId } = useParams()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('skills') // skills, abilities, stats, spells, equipment
  const [mood, setMood] = useState('Contemplative')
  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState('')
  const [character, setCharacter] = useState(null)
  const [currentHP, setCurrentHP] = useState(104)
  const [loading, setLoading] = useState(true)
  const [showSpellBrowser, setShowSpellBrowser] = useState(false)
  const [showAbilityBrowser, setShowAbilityBrowser] = useState(false)
  const [showEquipmentBrowser, setShowEquipmentBrowser] = useState(false)
  const messagesEndRef = useRef(null)

  // Load character data
  useEffect(() => {
    const loadCharacter = async () => {
      const loadedCharacter = getDemoCharacter(characterId)
      if (loadedCharacter) {
        // Populate with actual D&D data (spells, abilities, equipment)
        const populatedCharacter = populateCharacterData({ ...loadedCharacter })
        setCharacter(populatedCharacter)
        setCurrentHP(populatedCharacter.hp.current)
        setMessages([populatedCharacter.initialMessage])
      }
      setLoading(false)
    }

    loadCharacter()
  }, [characterId])

  // Auto-scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  if (loading || !character) {
    return <div className="character-loading">Loading character...</div>
  }

  // Helper to get item icon by category
  const getItemIcon = (category) => {
    const icons = {
      weapon: '⚔️',
      armor: '🛡️',
      shield: '🛡️',
      potion: '🧪',
      gear: '🎒',
      ring: '💍',
      scroll: '📜'
    }
    return icons[category] || '📦'
  }

  // Get HP display class based on current HP
  const getHPClass = () => {
    const percentage = currentHP / character.hp.max
    if (percentage <= 0.25) return 'critical'
    if (percentage <= 0.6) return 'damaged'
    return ''
  }

  // Handle combat abilities
  const handleAbilityClick = (ability) => {
    const details = ability.details || ability

    // Get icon for ability
    const getIcon = () => {
      const categoryIcons = {
        'combat': '⚔️',
        'utility': '🔧',
        'defensive': '🛡️',
        'spell': '✨',
        'social': '💬'
      }
      return categoryIcons[ability.category] || '⭐'
    }

    const icon = getIcon()
    const abilityName = details.name || ability.name
    const actionType = details.actionType

    // Handle spells with attack rolls
    if (ability.category === 'spell') {
      let message = `${icon} **Cast ${abilityName}**`
      if (details.shortDescription) {
        message += `\n\n${details.shortDescription}`
      }
      addMessage(message, 'character', 'Focused')
      return
    }

    // Handle active combat abilities with damage (like Colossus Slayer)
    // Only roll if it has damage AND is meant to be used actively
    if ((details.damage || ability.damage) && ability.category === 'combat') {
      // Get equipped weapon for base attack
      const meleeWeapons = character.inventory?.filter(i =>
        i.category === 'weapon' && i.equipped && !i.weapon?.properties?.includes('ranged')
      )
      const weapon = meleeWeapons?.[0] || { name: 'Unarmed Strike', weapon: { damage: '1d4', damageType: 'bludgeoning' } }

      // Calculate attack bonus
      const attackBonus = Math.floor((character.stats.str - 10) / 2) + character.proficiencyBonus
      const attackRoll = Math.floor(Math.random() * 20) + 1
      const attackTotal = attackRoll + attackBonus

      let message = `${icon} **${abilityName}**\n\n`
      message += `🎯 Attack Roll: d20(${attackRoll}) + ${attackBonus} = **${attackTotal}**`

      if (attackRoll === 20) {
        message += ' 🎉 **CRITICAL HIT!**'
      } else if (attackRoll === 1) {
        message += ' 💀 *Critical miss...*'
      }

      // Roll weapon damage
      const weaponDamage = weapon.weapon.damage
      const weaponDiceMatch = weaponDamage.match(/(\d+)d(\d+)/)
      if (weaponDiceMatch) {
        const [_, numDice, diceSize] = weaponDiceMatch
        let totalDamage = 0
        const rolls = []
        for (let i = 0; i < parseInt(numDice); i++) {
          const roll = Math.floor(Math.random() * parseInt(diceSize)) + 1
          rolls.push(roll)
          totalDamage += roll
        }
        const damageBonus = Math.floor((character.stats.str - 10) / 2)
        totalDamage += damageBonus

        message += `\n💥 ${weapon.name} Damage: ${weaponDamage}+${damageBonus} = **${totalDamage}** ${weapon.weapon.damageType} [${rolls.join(', ')}]`
      }

      // Roll ability extra damage (like Colossus Slayer's 1d8)
      const abilityDamage = details.damage || ability.damage
      if (abilityDamage && abilityDamage.formula) {
        const damageMatch = abilityDamage.formula.match(/(\d+)d(\d+)/)
        if (damageMatch) {
          const [_, numDice, diceSize] = damageMatch
          let totalExtraDamage = 0
          const extraRolls = []
          for (let i = 0; i < parseInt(numDice); i++) {
            const roll = Math.floor(Math.random() * parseInt(diceSize)) + 1
            extraRolls.push(roll)
            totalExtraDamage += roll
          }
          message += `\n✨ ${abilityName} Damage: ${abilityDamage.formula} = **${totalExtraDamage}** ${abilityDamage.type} [${extraRolls.join(', ')}]`
        }
      }

      addMessage(message, 'character', 'Battle Ready')
      return
    }

    // Handle passive traits - just show description, no "Activated" messaging
    if (actionType === 'passive') {
      let message = `${icon} **${abilityName}**`
      if (details.shortDescription) {
        message += `\n\n${details.shortDescription}`
      }
      addMessage(message, 'character', 'Contemplative')
      return
    }

    // Handle active abilities (action, bonus, reaction)
    let message = `${icon} **${abilityName}**`

    if (actionType === 'action') {
      message += ' (Action)'
    } else if (actionType === 'bonus') {
      message += ' (Bonus Action)'
    } else if (actionType === 'reaction') {
      message += ' (Reaction)'
    }

    if (details.shortDescription) {
      message += `\n\n${details.shortDescription}`
    }

    // Add flavor based on category
    if (ability.category === 'defensive') {
      addMessage(message, 'character', 'Defensive')
    } else if (ability.category === 'utility') {
      addMessage(message, 'character', 'Focused')
    } else {
      addMessage(message, 'character', 'Ready')
    }
  }

  // Add message to chat
  const addMessage = (text, type = 'character', messageMood = mood) => {
    const newMessage = {
      type,
      mood: messageMood,
      text,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, newMessage])

    if (type === 'character' && messageMood) {
      setMood(messageMood)
    }
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (inputMessage.trim()) {
      addMessage(inputMessage, 'player')
      setInputMessage('')

      // Simulate character response
      setTimeout(() => {
        addMessage("Your words reach me across the ages...", 'character', 'Thoughtful')
      }, 1000)
    }
  }

  // Handle adding spell from spell browser
  const handleAddSpell = (spell) => {
    setCharacter(prev => ({
      ...prev,
      abilities: [...(prev.abilities || []), spell]
    }))
    addMessage(`✨ Learned new spell: **${spell.name}**`, 'system')
  }

  // Handle adding ability from ability browser
  const handleAddAbility = (ability) => {
    setCharacter(prev => ({
      ...prev,
      abilities: [...(prev.abilities || []), ability]
    }))
    addMessage(`⚔️ Gained new ability: **${ability.name}**`, 'system')
  }

  // Handle adding equipment from equipment browser
  const handleAddEquipment = (item) => {
    setCharacter(prev => ({
      ...prev,
      inventory: [...(prev.inventory || []), item]
    }))
    addMessage(`🎒 Added to inventory: **${item.name}**`, 'system')
  }

  return (
    <div className="character-card">
      {/* Large Header with Portrait + Stats */}
      <div className="character-header-large">
        <div className="portrait-section">
          <div className="character-portrait">
            {/* Portrait - supports emoji or image URL */}
            {character.portraitUrl ? (
              <img src={character.portraitUrl} alt={character.name} className="portrait-image" />
            ) : (
              <div className="portrait-placeholder">{character.portrait || '🎭'}</div>
            )}
          </div>
        </div>

        <div className="header-stats">
          <div className="character-name-large">{character.name}</div>
          <div className="character-details">
            <span className="detail-item">{character.class || 'Fighter'}</span>
            <span className="detail-separator">•</span>
            <span className="detail-item">Level {character.level || 10}</span>
            <span className="detail-separator">•</span>
            <span className="detail-item">{character.race || 'Human'}</span>
          </div>

          <div className="stat-bars">
            <div className="stat-bar-item">
              <span className="stat-label">HP</span>
              <div className="stat-bar-bg">
                <div
                  className={`stat-bar-fill hp ${getHPClass()}`}
                  style={{ width: `${(currentHP / character.hp.max) * 100}%` }}
                />
              </div>
              <span className="stat-value">{currentHP}/{character.hp.max}</span>
            </div>

            <div className="quick-stats">
              <div className="quick-stat">
                <span className="quick-stat-label">AC</span>
                <span className="quick-stat-value">{character.ac || 18}</span>
              </div>
              <div className="quick-stat">
                <span className="quick-stat-label">Initiative</span>
                <span className="quick-stat-value">+{character.initiative || 3}</span>
              </div>
              <div className="quick-stat">
                <span className="quick-stat-label">Speed</span>
                <span className="quick-stat-value">{character.speed || 30}ft</span>
              </div>
            </div>
          </div>
        </div>

        <button className="close-btn-top" onClick={() => navigate('/')}>✕</button>
      </div>

      {/* Conversation/Log Area */}
      <div className="conversation-log">
        <div className="log-header">
          <span className="log-title">Activity Log</span>
          <span className="mood-indicator">{mood}</span>
        </div>

        <div className="log-messages">
          {messages.map((message, index) => (
            <div key={index} className={`log-message ${message.type}`}>
              {message.type === 'character' && (
                <div className="message-author">{character.name}</div>
              )}
              {message.type === 'player' && (
                <div className="message-author">You</div>
              )}
              <div className="message-content">{message.text}</div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <form className="message-input" onSubmit={handleSendMessage}>
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Type a message..."
          />
          <button type="submit">Send</button>
        </form>
      </div>

      {/* Quick Actions Row */}
      <div className="quick-actions-row">
        <button className="quick-action-btn" onClick={() => {
          const meleeWeapons = character.inventory?.filter(i => i.category === 'weapon' && i.equipped && !i.weapon?.properties?.includes('ranged'))
          const weapon = meleeWeapons?.[0] || { name: 'Unarmed', weapon: { damage: '1d4' } }
          const attackBonus = Math.floor((character.stats.str - 10) / 2) + character.proficiencyBonus
          const roll = Math.floor(Math.random() * 20) + 1
          const total = roll + attackBonus
          addMessage(`⚔️ ${weapon.name} Attack: d20(${roll}) + ${attackBonus} = ${total}`, 'player')
        }}>
          <span className="action-icon">⚔️</span>
          <span className="action-label">Melee</span>
        </button>
        <button className="quick-action-btn" onClick={() => {
          const rangedWeapons = character.inventory?.filter(i => i.category === 'weapon' && i.equipped && (i.weapon?.properties?.includes('thrown') || i.weapon?.properties?.includes('ammunition')))
          const weapon = rangedWeapons?.[0] || { name: 'Improvised', weapon: { damage: '1d4' } }
          const attackBonus = Math.floor((character.stats.dex - 10) / 2) + character.proficiencyBonus
          const roll = Math.floor(Math.random() * 20) + 1
          const total = roll + attackBonus
          addMessage(`🏹 ${weapon.name} Attack: d20(${roll}) + ${attackBonus} = ${total}`, 'player')
        }}>
          <span className="action-icon">🏹</span>
          <span className="action-label">Ranged</span>
        </button>
        <button className="quick-action-btn" onClick={() => {
          const spells = character.abilities?.filter(a => a.category === 'spell' && a.type === 'leveled-spell') || []
          if (spells.length > 0) {
            const spell = spells[0]
            addMessage(`✨ Cast ${spell.name}!`, 'player')
          } else {
            addMessage(`✨ No spells available`, 'player')
          }
        }}>
          <span className="action-icon">✨</span>
          <span className="action-label">Spell</span>
        </button>
        <button className="quick-action-btn" onClick={() => {
          const initiativeBonus = Math.floor((character.stats.dex - 10) / 2)
          const roll = Math.floor(Math.random() * 20) + 1
          const total = roll + initiativeBonus
          addMessage(`🎲 Initiative: d20(${roll}) + ${initiativeBonus} = ${total}`, 'player')
        }}>
          <span className="action-icon">🎲</span>
          <span className="action-label">Initiative</span>
        </button>
        <button className="quick-action-btn edit-btn" onClick={() => addMessage('⚙️ Character editing coming soon!', 'system')}>
          <span className="action-icon">⚙️</span>
          <span className="action-label">Edit</span>
        </button>
      </div>

      {/* Tabs Section */}
      <div className="tabs-section">
        <div className="tab-headers">
          <button
            className={`tab-header ${activeTab === 'skills' ? 'active' : ''}`}
            onClick={() => setActiveTab('skills')}
          >
            Skills
          </button>
          <button
            className={`tab-header ${activeTab === 'abilities' ? 'active' : ''}`}
            onClick={() => setActiveTab('abilities')}
          >
            Abilities
          </button>
          <button
            className={`tab-header ${activeTab === 'stats' ? 'active' : ''}`}
            onClick={() => setActiveTab('stats')}
          >
            Stats
          </button>
          <button
            className={`tab-header ${activeTab === 'spells' ? 'active' : ''}`}
            onClick={() => setActiveTab('spells')}
          >
            Spells
          </button>
          <button
            className={`tab-header ${activeTab === 'equipment' ? 'active' : ''}`}
            onClick={() => setActiveTab('equipment')}
          >
            Equipment
          </button>
        </div>

        <div className="tab-content">
          {activeTab === 'skills' && (
            <CharacterModes
              character={character}
              mode="skills"
              onMessage={addMessage}
              abilities={character.abilities}
              onAbilityUse={handleAbilityClick}
            />
          )}

          {activeTab === 'abilities' && (
            <div className="abilities-tab-wrapper">
              <button
                className="browse-abilities-btn"
                onClick={() => setShowAbilityBrowser(true)}
                style={{
                  width: '100%',
                  padding: '12px',
                  marginBottom: '16px',
                  background: 'linear-gradient(135deg, #d4af37 0%, #ffd700 100%)',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#1a1a2e',
                  fontWeight: 'bold',
                  fontSize: '14px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
              >
                ⚔️ Browse Class Features
              </button>
              <CharacterModes
                character={character}
                mode="battle"
                onMessage={addMessage}
                abilities={character.abilities}
                onAbilityUse={handleAbilityClick}
              />
            </div>
          )}

          {activeTab === 'stats' && (
            <div className="stats-tab">
              <div className="stats-grid">
                {['str', 'dex', 'con', 'int', 'wis', 'cha'].map(stat => {
                  const statValue = character.stats?.[stat] || 10
                  const modifier = Math.floor((statValue - 10) / 2)
                  return (
                    <div
                      key={stat}
                      className="stat-block clickable"
                      onClick={() => {
                        const roll = Math.floor(Math.random() * 20) + 1
                        const total = roll + modifier
                        addMessage(
                          `🎲 **${stat.toUpperCase()} Check**: d20(${roll}) ${modifier >= 0 ? '+' : ''}${modifier} = **${total}**`,
                          'player'
                        )
                      }}
                      style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-4px)'
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(212, 175, 55, 0.3)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)'
                        e.currentTarget.style.boxShadow = 'none'
                      }}
                    >
                      <div className="stat-name">{stat.toUpperCase()}</div>
                      <div className="stat-score">{statValue}</div>
                      <div className="stat-mod">{modifier >= 0 ? '+' : ''}{modifier}</div>
                    </div>
                  )
                })}
              </div>

              {/* Passive Traits Section */}
              <div className="traits-section" style={{ marginTop: '24px' }}>
                <h3 style={{ color: '#d4af37', marginBottom: '12px', fontSize: '16px' }}>Passive Traits</h3>
                <div className="traits-list">
                  {character.abilities
                    ?.filter(a =>
                      a.details?.actionType === 'passive' &&
                      a.category !== 'spell' &&
                      !a.usable && !a.details?.usable // Exclude usable abilities like Colossus Slayer
                    )
                    .map((trait, index) => (
                      <div
                        key={index}
                        className="trait-item"
                        style={{
                          background: 'rgba(45, 45, 68, 0.4)',
                          border: '1px solid rgba(212, 175, 55, 0.3)',
                          borderRadius: '6px',
                          padding: '10px 12px',
                          marginBottom: '8px'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <span style={{ fontSize: '16px' }}>
                            {trait.category === 'combat' ? '⚔️' : trait.category === 'defensive' ? '🛡️' : '🔧'}
                          </span>
                          <span style={{ color: '#fff', fontWeight: '600', fontSize: '14px' }}>
                            {trait.name}
                          </span>
                        </div>
                        <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px', paddingLeft: '24px' }}>
                          {trait.details?.shortDescription}
                        </div>
                      </div>
                    ))}
                  {(!character.abilities || character.abilities.filter(a => a.details?.actionType === 'passive' && a.category !== 'spell').length === 0) && (
                    <div style={{ padding: '20px', textAlign: 'center', color: 'rgba(255,255,255,0.5)', fontSize: '14px' }}>
                      No passive traits
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'spells' && (
            <div className="spells-tab">
              {character.spellSlots && (
                <div className="spell-slots-display" style={{marginBottom: '20px'}}>
                  <h4 style={{marginBottom: '10px', color: 'rgba(255,255,255,0.9)'}}>Spell Slots:</h4>
                  <div style={{display: 'flex', gap: '10px', flexWrap: 'wrap'}}>
                    {Object.entries(character.spellSlots).map(([level, slots]) => (
                      <div key={level} style={{
                        padding: '8px 12px',
                        background: 'rgba(30,30,30,0.8)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: '8px'
                      }}>
                        <span style={{color: 'rgba(255,255,255,0.7)', fontSize: '12px'}}>Level {level}:</span>
                        <span style={{color: '#fff', marginLeft: '6px', fontWeight: 'bold'}}>
                          {slots.current}/{slots.max}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <button
                className="browse-spells-btn"
                onClick={() => setShowSpellBrowser(true)}
                style={{
                  width: '100%',
                  padding: '12px',
                  marginBottom: '16px',
                  background: 'linear-gradient(135deg, #d4af37 0%, #ffd700 100%)',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#1a1a2e',
                  fontWeight: 'bold',
                  fontSize: '14px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
              >
                📚 Browse Spell Library
              </button>
              <div className="spell-list">
                {character.abilities
                  ?.filter(ability => ability.category === 'spell')
                  .map((spell, index) => (
                    <div key={index} className="spell-item" onClick={() => handleAbilityClick(spell)}>
                      <span className="spell-name">{spell.details?.name || spell.name}</span>
                      <span className="spell-level">
                        {spell.type === 'cantrip' ? 'Cantrip' : `Level ${spell.level || spell.details?.level || '?'}`}
                      </span>
                    </div>
                  ))}
                {(!character.abilities || character.abilities.filter(a => a.category === 'spell').length === 0) && (
                  <div style={{padding: '20px', textAlign: 'center', color: 'rgba(255,255,255,0.5)'}}>
                    No spells available
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'equipment' && (
            <div className="equipment-tab">
              <button
                className="browse-equipment-btn"
                onClick={() => setShowEquipmentBrowser(true)}
                style={{
                  width: '100%',
                  padding: '12px',
                  marginBottom: '16px',
                  background: 'linear-gradient(135deg, #d4af37 0%, #ffd700 100%)',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#1a1a2e',
                  fontWeight: 'bold',
                  fontSize: '14px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
              >
                🎒 Browse Equipment & Gear
              </button>
              <div className="equipment-list">
                {character.inventory?.map((item, index) => (
                  <div key={index} className={`equipment-item ${item.equipped ? 'equipped' : ''}`}>
                    <span className="equipment-icon">{getItemIcon(item.category)}</span>
                    <span className="equipment-name">
                      {item.name}
                      {item.quantity > 1 && ` x${item.quantity}`}
                    </span>
                    {item.equipped && <span className="equipment-status">Equipped</span>}
                  </div>
                ))}
                {(!character.inventory || character.inventory.length === 0) && (
                  <div style={{padding: '20px', textAlign: 'center', color: 'rgba(255,255,255,0.5)'}}>
                    No equipment
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Spell Browser Modal */}
      {showSpellBrowser && (
        <SpellBrowser
          character={character}
          onAddSpell={handleAddSpell}
          onClose={() => setShowSpellBrowser(false)}
        />
      )}

      {/* Ability Browser Modal */}
      {showAbilityBrowser && (
        <AbilityBrowser
          character={character}
          onAddAbility={handleAddAbility}
          onClose={() => setShowAbilityBrowser(false)}
        />
      )}

      {/* Equipment Browser Modal */}
      {showEquipmentBrowser && (
        <EquipmentBrowser
          character={character}
          onAddEquipment={handleAddEquipment}
          onClose={() => setShowEquipmentBrowser(false)}
        />
      )}
    </div>
  )
}

export default CharacterCard
