import { useState } from 'react'
import './CharacterCard.css'

function CharacterCard() {
  const [mode, setMode] = useState('portrait') // portrait or battle
  const [messages, setMessages] = useState([
    {
      type: 'character',
      mood: 'Contemplative',
      text: "You find me in a moment of reflection. The weight of eight decades rests upon these shoulders, yet I appear as I did in my prime at Troy."
    }
  ])
  const [inputMessage, setInputMessage] = useState('')

  const character = {
    name: 'Achilles',
    hp: { current: 104, max: 104 },
    ac: 18,
    portrait: '🛡️',
    abilities: [
      { icon: '⚔️', name: 'Sword Strike' },
      { icon: '🔥', name: 'Divine Fury' },
      { icon: '🗡️', name: 'Spear Thrust' },
      { icon: '🛡️', name: 'Shield Wall' },
      { icon: '📖', name: 'Tell Story' },
      { icon: '🗺️', name: 'Current Quest' }
    ]
  }

  const handleAbilityClick = (ability) => {
    const newMessage = {
      type: 'player',
      text: `Used: ${ability.name}`
    }
    setMessages([...messages, newMessage])
  }

  const handleSendMessage = (e) => {
    e.preventDefault()
    if (inputMessage.trim()) {
      const newMessage = {
        type: 'player',
        text: inputMessage
      }
      setMessages([...messages, newMessage])
      setInputMessage('')

      // Simulate character response
      setTimeout(() => {
        setMessages(prev => [...prev, {
          type: 'character',
          mood: 'Thoughtful',
          text: "Your words reach me across the ages..."
        }])
      }, 1000)
    }
  }

  return (
    <div className="character-card">
      <div className="character-header">
        <div className="character-title">
          <h1>{character.name}</h1>
        </div>
        <div className="character-stats">
          <div className="stat">
            <span className="stat-label">{character.hp.current}/{character.hp.max} HP</span>
          </div>
          <div className="stat">
            <span className="stat-label">AC {character.ac}</span>
          </div>
        </div>
        <div className="mode-toggle">
          <button
            className={mode === 'portrait' ? 'active' : ''}
            onClick={() => setMode('portrait')}
          >
            Portrait Mode
          </button>
          <button className="close-btn">✕</button>
        </div>
      </div>

      <div className="character-body">
        <div className="mode-tabs">
          <button
            className={mode === 'portrait' ? 'tab active' : 'tab'}
            onClick={() => setMode('portrait')}
          >
            Portrait
          </button>
          <button
            className={mode === 'battle' ? 'tab active' : 'tab'}
            onClick={() => setMode('battle')}
          >
            Battle
          </button>
        </div>

        <div className="portrait-section">
          <div className="portrait-display">
            <div className="portrait-icon">{character.portrait}</div>
          </div>
        </div>

        <div className="interaction-section">
          <div className="interaction-header">
            <span className="interaction-icon">⚔️</span>
            <span>Speaking with {character.name}</span>
          </div>

          <div className="messages-container">
            {messages.map((message, index) => (
              <div key={index} className={`message ${message.type}`}>
                {message.type === 'character' && (
                  <div className="message-header">
                    <span className="mood">{message.mood}</span>
                    <span className="character-name">{character.name}</span>
                    <span className="character-icon">{character.portrait}</span>
                  </div>
                )}
                <div className="message-text">{message.text}</div>
              </div>
            ))}
          </div>

          <div className="abilities-grid">
            {character.abilities.map((ability, index) => (
              <button
                key={index}
                className="ability-btn"
                onClick={() => handleAbilityClick(ability)}
              >
                <span className="ability-icon">{ability.icon}</span>
                <span className="ability-name">{ability.name}</span>
              </button>
            ))}
          </div>

          <form className="message-input-form" onSubmit={handleSendMessage}>
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Type your message..."
              className="message-input"
            />
            <button type="submit" className="send-btn">Send</button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default CharacterCard
