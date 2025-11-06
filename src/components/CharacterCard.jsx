import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useUser } from '../contexts/UserContext'
import { rollAttack, rollD20, getNarration } from '../utils/dice'
import { mockCharacters } from '../data/mockCharacters'
import { speak, stopSpeech, isTTSAvailable } from '../services/tts'
import CharacterModes from './CharacterModes'
import LoginModal from './LoginModal'
import ShareCharacter from './ShareCharacter'
import CharacterStats from './CharacterStats'
import './CharacterCard.css'

function CharacterCard() {
  const { characterId } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated } = useUser()
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [showStatsModal, setShowStatsModal] = useState(false)
  const [mode, setMode] = useState('portrait') // portrait or battle (for image display)
  const [interactionMode, setInteractionMode] = useState('conversation') // conversation, battle, or skills
  const [mood, setMood] = useState('Contemplative')
  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState('')
  const [character, setCharacter] = useState(null)
  const [currentHP, setCurrentHP] = useState(104)
  const [loading, setLoading] = useState(true)
  const [autoplay, setAutoplay] = useState(false)
  const [playingAudio, setPlayingAudio] = useState(null)
  const [speakingMessageIndex, setSpeakingMessageIndex] = useState(null)
  const messagesEndRef = useRef(null)
  const ttsAvailable = isTTSAvailable()

  // Load character data
  useEffect(() => {
    const loadCharacter = async () => {
      // TODO: Replace with API call to your Node server
      // const response = await fetch(`/api/characters/${characterId}`)
      // const data = await response.json()

      // Use mock character data
      const loadedCharacter = mockCharacters[characterId]
      if (loadedCharacter) {
        setCharacter(loadedCharacter)
        setCurrentHP(loadedCharacter.hp.current)
        // Set initial message if exists
        if (loadedCharacter.initialMessage) {
          setMessages([loadedCharacter.initialMessage])
        }
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

  // Handle scene/mode switching
  const handleModeChange = (newMode) => {
    setMode(newMode)
    if (newMode === 'battle') {
      setMood('Battle Ready')
    } else {
      setMood('Contemplative')
    }
  }

  // Handle combat abilities
  const handleAbilityClick = (ability) => {
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
  }

  // Handle TTS for a message
  const handleSpeak = async (text, messageIndex) => {
    try {
      // Stop any currently playing audio
      if (playingAudio) {
        stopSpeech(playingAudio)
        setPlayingAudio(null)
        setSpeakingMessageIndex(null)
      }

      // If clicking the same message that's playing, just stop
      if (speakingMessageIndex === messageIndex) {
        return
      }

      // Start speaking the new message
      setSpeakingMessageIndex(messageIndex)
      const audio = await speak(text, {
        character: character, // Pass entire character object for auto voice selection
        voiceId: character?.voiceId, // Explicit voiceId overrides auto-selection
        onEnd: () => {
          setSpeakingMessageIndex(null)
          setPlayingAudio(null)
        }
      })
      setPlayingAudio(audio)
    } catch (error) {
      console.error('TTS error:', error)
      setSpeakingMessageIndex(null)
      setPlayingAudio(null)
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
    setMessages(prev => {
      const updatedMessages = [...prev, newMessage]

      // Autoplay TTS for character messages if enabled
      if (type === 'character' && autoplay && ttsAvailable) {
        setTimeout(() => {
          handleSpeak(text, updatedMessages.length - 1)
        }, 100)
      }

      return updatedMessages
    })
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()

    // Require login to chat with characters
    if (!isAuthenticated) {
      setShowLoginModal(true)
      return
    }

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
  }

  return (
    <div className="character-card">
      <div className="character-header">
        <div className="character-info">
          <div className="character-name">{character.name.toUpperCase()}</div>
          <div className="stats-line">
            <div className={`hp-display ${getHPClass()}`}>
              {currentHP}/{character.hp.max} HP
            </div>
            <div className="ac-display">AC {character.ac}</div>
            <div className="scene-indicator">
              {mode === 'portrait' ? 'Portrait Mode' : 'Red Sea Battle'}
            </div>
          </div>
        </div>
        <div className="header-actions">
          {ttsAvailable && (
            <button
              className={`action-btn ${autoplay ? 'active' : ''}`}
              onClick={() => setAutoplay(!autoplay)}
              title={autoplay ? 'Disable Autoplay' : 'Enable Autoplay'}
            >
              {autoplay ? '🔊' : '🔇'}
            </button>
          )}
          <button className="action-btn" onClick={() => setShowStatsModal(true)} title="View Stats">
            📊
          </button>
          <button className="action-btn" onClick={() => setShowShareModal(true)} title="Share Character">
            🔗
          </button>
          <button className="close-btn" onClick={() => navigate('/')}>✕</button>
        </div>
      </div>

      <div className="character-body">
        <div className="image-section">
          <div className={`character-image ${mode !== 'portrait' ? 'hidden' : ''}`} id="portraitImage"></div>
          <div className={`character-image ${mode !== 'battle' ? 'hidden' : ''}`} id="battleImage"></div>

          <div className="scene-switcher">
            <button
              className={`scene-btn ${mode === 'portrait' ? 'active' : ''}`}
              onClick={() => handleModeChange('portrait')}
            >
              Portrait
            </button>
            <button
              className={`scene-btn ${mode === 'battle' ? 'active' : ''}`}
              onClick={() => handleModeChange('battle')}
            >
              Battle
            </button>
          </div>
        </div>

        <div className="chat-section">
          <div className="chat-header">
            <span>⚔️ Speaking with {character.name}</span>
            <span className="mood-indicator">{mood}</span>
          </div>

          <div className="chat-messages">
            {messages.map((message, index) => (
              <div key={index} className={`message ${message.type}`}>
                {message.type === 'character' && (
                  <div className="author">
                    <span>{character.name}</span>
                    <span>{mode === 'battle' ? '⚔️' : character.portrait}</span>
                    {ttsAvailable && (
                      <button
                        className={`speaker-btn ${speakingMessageIndex === index ? 'speaking' : ''}`}
                        onClick={() => handleSpeak(message.text, index)}
                        title={speakingMessageIndex === index ? 'Stop' : 'Speak'}
                      >
                        {speakingMessageIndex === index ? '⏸️' : '🔊'}
                      </button>
                    )}
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
            <div className="mode-tabs">
              <button
                className={`mode-tab ${interactionMode === 'conversation' ? 'active' : ''}`}
                onClick={() => setInteractionMode('conversation')}
              >
                💬 Conversation
              </button>
              <button
                className={`mode-tab ${interactionMode === 'battle' ? 'active' : ''}`}
                onClick={() => setInteractionMode('battle')}
              >
                ⚔️ Battle
              </button>
              <button
                className={`mode-tab ${interactionMode === 'skills' ? 'active' : ''}`}
                onClick={() => setInteractionMode('skills')}
              >
                🎲 Skills
              </button>
            </div>

            <CharacterModes
              character={character}
              mode={interactionMode}
              onMessage={addMessage}
              abilities={character.abilities}
            />
          </div>

          <form className="chat-input" onSubmit={handleSendMessage}>
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Speak with the immortal warrior..."
              id="messageInput"
            />
            <button type="submit" className="send-btn">Send</button>
          </form>
        </div>
      </div>

      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
      <ShareCharacter
        character={character}
        characterId={characterId}
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
      />
      <CharacterStats
        character={character}
        characterId={characterId}
        isOpen={showStatsModal}
        onClose={() => setShowStatsModal(false)}
      />
    </div>
  )
}

export default CharacterCard
