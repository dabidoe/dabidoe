import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { rollAttack, rollD20, getNarration } from '../utils/dice'
import { getDemoCharacter } from '../data/demo-characters'
import CharacterModes from './CharacterModes'
import './CharacterCard.css'

// Performance: Limit message history to prevent unbounded growth
const MAX_MESSAGES = 100

function CharacterCard() {
  const { characterId } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [mode, setMode] = useState('portrait') // portrait or battle (for image display)
  const [interactionMode, setInteractionMode] = useState('conversation') // conversation, battle, or skills
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
      // TODO: Replace with API call to your Node server
      // const response = await fetch(`/api/characters/${characterId}`)
      // const data = await response.json()

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

  // Get HP display class based on current HP (memoized)
  const hpClass = useMemo(() => {
    if (!character) return ''
    const percentage = currentHP / character.hp.max
    if (percentage <= 0.25) return 'critical'
    if (percentage <= 0.6) return 'damaged'
    return ''
  }, [currentHP, character])

  // Add message to chat (memoized callback)
  const addMessage = useCallback((text, type = 'character', messageMood = mood) => {
    const newMessage = {
      type,
      mood: messageMood,
      text,
      timestamp: new Date()
    }
    setMessages(prev => {
      const updated = [...prev, newMessage]
      // Keep only the most recent MAX_MESSAGES for performance
      return updated.length > MAX_MESSAGES ? updated.slice(-MAX_MESSAGES) : updated
    })

    // Update the mood display when a character message with a mood is added
    if (type === 'character' && messageMood) {
      setMood(messageMood)
    }
  }, [mood])

  // Handle scene/mode switching (memoized callback)
  const handleModeChange = useCallback((newMode) => {
    setMode(newMode)
    if (newMode === 'battle') {
      setMood('Battle Ready')
    } else {
      setMood('Contemplative')
    }
  }, [])

  // Handle combat abilities (memoized callback)
  const handleAbilityClick = useCallback((ability) => {
    const abilityData = {
      'Sword Strike': { modifier: 9, damageCount: 1, damageSides: 8, damageBonus: 6, icon: '⚔️' },
      'Divine Fury': { modifier: 8, damageCount: 2, damageSides: 6, damageBonus: 8, icon: '🔥' },
      'Spear Thrust': { modifier: 10, damageCount: 1, damageSides: 10, damageBonus: 7, icon: '🗡️' },
      'Shield Wall': { modifier: 7, isDefensive: true, icon: '🛡️' },
      'Tell Story': { isStory: true, icon: '📖' },
      'Current Quest': { isQuest: true, icon: '🗺️' }
    }

    const data = abilityData[ability.name]

    if (!data) return

    // Handle story/quest actions
    if (data.isStory) {
      const storyText = mode === 'battle'
        ? '📖 At Troy, I thought glory was everything. This battle taught me there are causes worth more than fame.'
        : '📖 Troy haunts my memory. I learned victory without meaning is hollow. Here I fight for something greater.'
      addMessage(storyText, 'character', mood)
      return
    }

    if (data.isQuest) {
      const questText = mode === 'battle'
        ? '🗺️ This is our great quest - lead 600,000 souls to freedom. Every step defies empires and gods.'
        : '🗺️ The real quest is simple: help these people find hope. I finally understand purpose.'
      addMessage(questText, 'character', mood)
      return
    }

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

      // Switch to battle mode on crit with Divine Fury
      if (result.attack.isCrit && ability.name === 'Divine Fury') {
        setTimeout(() => handleModeChange('battle'), 800)
      }
    }

    // TODO: Send ability use to API
    // await useAbility(characterId, ability.name, { mode, currentHP })
  }, [mode, addMessage, handleModeChange])

  const handleSendMessage = useCallback(async (e) => {
    e.preventDefault()
    if (inputMessage.trim()) {
      addMessage(inputMessage, 'player')
      setInputMessage('')

      // TODO: Replace with API call to your Node server
      // import { sendMessage } from '../services/api'
      // const response = await sendMessage(characterId, inputMessage, messages)
      // addMessage(response.text, 'character', response.mood)

      // Simulate character response for now
      setTimeout(() => {
        addMessage("Your words reach me across the ages...", 'character', 'Thoughtful')
      }, 1000)
    }
  }, [inputMessage, characterId, addMessage])

  if (loading || !character) {
    return <div className="character-loading">Loading character...</div>
  }

  return (
    <div className="character-card">
      <div className="character-header">
        <div className="character-info">
          <div className="character-name" role="heading" aria-level="1">
            {character.name.toUpperCase()}
          </div>
          <div className="stats-line">
            <div
              className={`hp-display ${hpClass}`}
              role="status"
              aria-label={`Hit points: ${currentHP} out of ${character.hp.max}${hpClass === 'critical' ? ', critical health' : hpClass === 'damaged' ? ', damaged' : ''}`}
            >
              {currentHP}/{character.hp.max} HP
            </div>
            <div className="ac-display" aria-label={`Armor class: ${character.ac}`}>
              AC {character.ac}
            </div>
            <div className="scene-indicator" role="status" aria-live="polite">
              {mode === 'portrait' ? 'Portrait Mode' : 'Red Sea Battle'}
            </div>
          </div>
        </div>
        <button
          className="close-btn"
          onClick={() => navigate('/')}
          aria-label="Close character view and return to home"
        >
          ✕
        </button>
      </div>

      <div className="character-body">
        <div className="image-section">
          <div className={`character-image ${mode !== 'portrait' ? 'hidden' : ''}`} id="portraitImage"></div>
          <div className={`character-image ${mode !== 'battle' ? 'hidden' : ''}`} id="battleImage"></div>

          <div className="scene-switcher" role="group" aria-label="Scene selection">
            <button
              className={`scene-btn ${mode === 'portrait' ? 'active' : ''}`}
              onClick={() => handleModeChange('portrait')}
              aria-pressed={mode === 'portrait'}
              aria-label="Switch to portrait scene"
            >
              Portrait
            </button>
            <button
              className={`scene-btn ${mode === 'battle' ? 'active' : ''}`}
              onClick={() => handleModeChange('battle')}
              aria-pressed={mode === 'battle'}
              aria-label="Switch to battle scene"
            >
              Battle
            </button>
          </div>
        </div>

        <div className="chat-section">
          <div className="chat-header">
            <span>⚔️ Speaking with {character.name}</span>
            <span className="mood-indicator" role="status" aria-live="polite" aria-label={`Current mood: ${mood}`}>
              {mood}
            </span>
          </div>

          <div
            className="chat-messages"
            role="log"
            aria-live="polite"
            aria-label="Conversation history"
          >
            {messages.map((message, index) => (
              <div
                key={index}
                className={`message ${message.type}`}
                role="article"
                aria-label={`Message from ${message.type === 'character' ? character.name : 'you'}`}
              >
                {message.type === 'character' && (
                  <div className="author">
                    <span>{character.name}</span>
                    <span aria-hidden="true">{mode === 'battle' ? '⚔️' : character.portrait}</span>
                  </div>
                )}
                {message.type === 'player' && (
                  <div className="author">You</div>
                )}
                <div className="message-text" style={{ whiteSpace: 'pre-line' }}>
                  {message.text}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="interaction-modes">
            <div className="mode-tabs" role="tablist" aria-label="Interaction modes">
              <button
                className={`mode-tab ${interactionMode === 'conversation' ? 'active' : ''}`}
                onClick={() => setInteractionMode('conversation')}
                role="tab"
                aria-selected={interactionMode === 'conversation'}
                aria-controls="character-modes-panel"
                aria-label="Conversation mode"
              >
                <span aria-hidden="true">💬</span> Conversation
              </button>
              <button
                className={`mode-tab ${interactionMode === 'battle' ? 'active' : ''}`}
                onClick={() => setInteractionMode('battle')}
                role="tab"
                aria-selected={interactionMode === 'battle'}
                aria-controls="character-modes-panel"
                aria-label="Battle mode"
              >
                <span aria-hidden="true">⚔️</span> Battle
              </button>
              <button
                className={`mode-tab ${interactionMode === 'skills' ? 'active' : ''}`}
                onClick={() => setInteractionMode('skills')}
                role="tab"
                aria-selected={interactionMode === 'skills'}
                aria-controls="character-modes-panel"
                aria-label="Skills mode"
              >
                <span aria-hidden="true">🎲</span> Skills
              </button>
            </div>

            <div
              role="tabpanel"
              id="character-modes-panel"
              aria-label={`${interactionMode} mode panel`}
            >
              <CharacterModes
                character={character}
                mode={interactionMode}
                onMessage={addMessage}
                abilities={character.abilities}
                onAbilityUse={handleAbilityClick}
              />
            </div>
          </div>

          <form className="chat-input" onSubmit={handleSendMessage}>
            <label htmlFor="messageInput" className="sr-only">
              Message input
            </label>
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Speak with the immortal warrior..."
              id="messageInput"
              aria-label="Type your message to the character"
            />
            <button type="submit" className="send-btn" aria-label="Send message">
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default CharacterCard
