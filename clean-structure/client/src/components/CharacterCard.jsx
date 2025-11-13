import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { rollAttack, rollD20, getNarration } from '../utils/dice'
import { getDemoCharacter } from '../data/demo-characters'
import CharacterModes from './CharacterModes'
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
  const messagesEndRef = useRef(null)

  // Load character data
  useEffect(() => {
    const loadCharacter = async () => {
      const loadedCharacter = getDemoCharacter(characterId)
      if (loadedCharacter) {
        setCharacter(loadedCharacter)
        setCurrentHP(loadedCharacter.hp.current)
        setMessages([loadedCharacter.initialMessage])
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

  // Get HP display class based on current HP
  const getHPClass = () => {
    const percentage = currentHP / character.hp.max
    if (percentage <= 0.25) return 'critical'
    if (percentage <= 0.6) return 'damaged'
    return ''
  }

  // Handle combat abilities
  const handleAbilityClick = (ability) => {
    const abilityData = {
      'Sword Strike': { modifier: 9, damageCount: 1, damageSides: 8, damageBonus: 6, icon: '⚔️' },
      'Divine Fury': { modifier: 8, damageCount: 2, damageSides: 6, damageBonus: 8, icon: '🔥' },
      'Spear Thrust': { modifier: 10, damageCount: 1, damageSides: 10, damageBonus: 7, icon: '🗡️' },
      'Shield Wall': { modifier: 7, isDefensive: true, icon: '🛡️' }
    }

    const data = abilityData[ability.name]
    if (!data) return

    // Handle combat actions
    if (data.isDefensive) {
      const roll = rollD20(data.modifier)
      const acBonus = Math.floor((roll.total - 10) / 5)
      let responseText = `${data.icon} **Shield Defense**: AC Bonus +${acBonus} (rolled ${roll.total})`
      if (roll.isCrit) responseText += ' **CRITICAL!**'
      if (roll.isFail) responseText += ' *Critical miss...*'

      responseText += '\n\n' + getNarration(ability.name, { attack: roll })
      addMessage(responseText, 'character', 'Defensive')
    } else {
      // Attack ability
      const result = rollAttack(data)
      let responseText = `${data.icon} **${ability.name}**: Attack ${result.attack.total} (d20: ${result.attack.d20}+${result.attack.modifier})`

      if (result.attack.isCrit) {
        responseText += ' **CRITICAL HIT!**'
      } else if (result.attack.isFail) {
        responseText += ' *Critical miss...*'
      }

      if (result.damage) {
        responseText += `\n💥 **Damage**: ${result.damage.total} (${result.damage.formula}) [${result.damage.rolls.join(', ')}]`
      }

      responseText += '\n\n' + getNarration(ability.name, result)
      addMessage(responseText, 'character', 'Focused')
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
        <button className="quick-action-btn" onClick={() => addMessage('⚔️ Sword Strike!', 'character')}>
          <span className="action-icon">⚔️</span>
          <span className="action-label">Attack</span>
        </button>
        <button className="quick-action-btn" onClick={() => addMessage('🛡️ Shield Wall!', 'character')}>
          <span className="action-icon">🛡️</span>
          <span className="action-label">Defend</span>
        </button>
        <button className="quick-action-btn" onClick={() => addMessage('🎲 Initiative Roll: 18', 'character')}>
          <span className="action-icon">🎲</span>
          <span className="action-label">Initiative</span>
        </button>
        <button className="quick-action-btn" onClick={() => addMessage('💚 Healed 10 HP', 'character')}>
          <span className="action-icon">💚</span>
          <span className="action-label">Heal</span>
        </button>
        <button className="quick-action-btn edit-btn">
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
            <CharacterModes
              character={character}
              mode="battle"
              onMessage={addMessage}
              abilities={character.abilities}
              onAbilityUse={handleAbilityClick}
            />
          )}

          {activeTab === 'stats' && (
            <div className="stats-tab">
              <div className="stats-grid">
                <div className="stat-block">
                  <div className="stat-name">STR</div>
                  <div className="stat-score">{character.stats?.str || 16}</div>
                  <div className="stat-mod">+{Math.floor(((character.stats?.str || 16) - 10) / 2)}</div>
                </div>
                <div className="stat-block">
                  <div className="stat-name">DEX</div>
                  <div className="stat-score">{character.stats?.dex || 14}</div>
                  <div className="stat-mod">+{Math.floor(((character.stats?.dex || 14) - 10) / 2)}</div>
                </div>
                <div className="stat-block">
                  <div className="stat-name">CON</div>
                  <div className="stat-score">{character.stats?.con || 15}</div>
                  <div className="stat-mod">+{Math.floor(((character.stats?.con || 15) - 10) / 2)}</div>
                </div>
                <div className="stat-block">
                  <div className="stat-name">INT</div>
                  <div className="stat-score">{character.stats?.int || 10}</div>
                  <div className="stat-mod">+{Math.floor(((character.stats?.int || 10) - 10) / 2)}</div>
                </div>
                <div className="stat-block">
                  <div className="stat-name">WIS</div>
                  <div className="stat-score">{character.stats?.wis || 12}</div>
                  <div className="stat-mod">+{Math.floor(((character.stats?.wis || 12) - 10) / 2)}</div>
                </div>
                <div className="stat-block">
                  <div className="stat-name">CHA</div>
                  <div className="stat-score">{character.stats?.cha || 14}</div>
                  <div className="stat-mod">+{Math.floor(((character.stats?.cha || 14) - 10) / 2)}</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'spells' && (
            <div className="spells-tab">
              <div className="spell-list">
                <div className="spell-item">
                  <span className="spell-name">Cure Wounds</span>
                  <span className="spell-level">Level 1</span>
                </div>
                <div className="spell-item">
                  <span className="spell-name">Shield of Faith</span>
                  <span className="spell-level">Level 1</span>
                </div>
                <div className="spell-item">
                  <span className="spell-name">Hold Person</span>
                  <span className="spell-level">Level 2</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'equipment' && (
            <div className="equipment-tab">
              <div className="equipment-list">
                <div className="equipment-item equipped">
                  <span className="equipment-icon">⚔️</span>
                  <span className="equipment-name">Longsword</span>
                  <span className="equipment-status">Equipped</span>
                </div>
                <div className="equipment-item equipped">
                  <span className="equipment-icon">🛡️</span>
                  <span className="equipment-name">Shield</span>
                  <span className="equipment-status">Equipped</span>
                </div>
                <div className="equipment-item">
                  <span className="equipment-icon">🎒</span>
                  <span className="equipment-name">Backpack</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default CharacterCard
