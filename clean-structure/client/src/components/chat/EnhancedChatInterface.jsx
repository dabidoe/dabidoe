/**
 * Enhanced Chat Interface Component
 * Supports multiple modes: Conversation, Battle, Skills
 * Features state-based conversations with hooks and dynamic character states
 */

import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import './EnhancedChatInterface.css';

function EnhancedChatInterface({ character, onSendMessage, onUseAbility, onRoll }) {
  const [mode, setMode] = useState('conversation'); // conversation, battle, skills
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [currentState, setCurrentState] = useState('default');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Load conversation state
  const stateConfig = character.conversationStates?.[currentState] || character.conversationStates?.default;

  useEffect(() => {
    // Add initial greeting when state changes
    if (stateConfig?.greeting) {
      setMessages(prev => [
        ...prev,
        {
          type: 'character',
          text: stateConfig.greeting,
          mood: stateConfig.mood,
          timestamp: Date.now()
        }
      ]);
    }
  }, [currentState, stateConfig]);

  useEffect(() => {
    // Auto-scroll to bottom
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!message.trim() || loading) return;

    const userMessage = {
      type: 'player',
      text: message,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    setMessage('');
    setLoading(true);

    try {
      // Call API with current state context
      const response = await onSendMessage(message, {
        state: currentState,
        mood: stateConfig?.mood,
        conversationHistory: messages
      });

      const characterMessage = {
        type: 'character',
        text: response.text,
        mood: response.mood,
        emotion: response.emotion,
        timestamp: Date.now()
      };

      setMessages(prev => [...prev, characterMessage]);
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUseAbility = async (ability) => {
    try {
      const result = await onUseAbility(character.id, ability.id);

      // Add ability use message
      setMessages(prev => [
        ...prev,
        {
          type: 'system',
          text: `${character.name} uses ${ability.name}!`,
          abilityResult: result,
          timestamp: Date.now()
        }
      ]);

      // Trigger dice roll if damage
      if (result.damage && onRoll) {
        onRoll({
          type: ability.name,
          diceType: ability.damage?.split('d')[1]?.split('+')[0] || 'd20',
          total: result.damage,
          breakdown: ability.damage
        });
      }
    } catch (error) {
      console.error('Failed to use ability:', error);
    }
  };

  const handleStateChange = (newState) => {
    setCurrentState(newState);
    setMessages([]); // Clear messages when changing state
  };

  const handleQuickAction = (action) => {
    switch (action) {
      case 'attack':
        if (onRoll) {
          onRoll({
            type: 'Attack Roll',
            diceType: 'd20',
            total: Math.floor(Math.random() * 20) + 1,
            success: Math.random() > 0.5
          });
        }
        break;
      case 'initiative':
        if (onRoll) {
          onRoll({
            type: 'Initiative',
            diceType: 'd20',
            total: Math.floor(Math.random() * 20) + 1 + (character.computed?.initiative || 0)
          });
        }
        break;
      case 'save':
        // Add save selection UI
        break;
      default:
        break;
    }
  };

  return (
    <div className="enhanced-chat-interface">
      {/* Mode Tabs */}
      <div className="chat-mode-tabs">
        <button
          className={`mode-tab ${mode === 'conversation' ? 'active' : ''}`}
          onClick={() => setMode('conversation')}
        >
          <span className="tab-icon">💬</span>
          Conversation
        </button>
        <button
          className={`mode-tab ${mode === 'battle' ? 'active' : ''}`}
          onClick={() => setMode('battle')}
        >
          <span className="tab-icon">⚔️</span>
          Battle
        </button>
        <button
          className={`mode-tab ${mode === 'skills' ? 'active' : ''}`}
          onClick={() => setMode('skills')}
        >
          <span className="tab-icon">✨</span>
          Skills
        </button>
      </div>

      {/* State Selector (for conversation mode) */}
      {mode === 'conversation' && character.conversationStates && (
        <div className="state-selector">
          <label>Character State:</label>
          <select value={currentState} onChange={(e) => handleStateChange(e.target.value)}>
            {Object.keys(character.conversationStates).map(state => (
              <option key={state} value={state}>
                {state} ({character.conversationStates[state].mood})
              </option>
            ))}
          </select>
          <button className="new-state-btn" title="Create Custom State">+</button>
        </div>
      )}

      {/* Messages Area */}
      <div className="messages-container">
        {mode === 'conversation' && (
          <ConversationMessages
            messages={messages}
            character={character}
            loading={loading}
          />
        )}

        {mode === 'battle' && (
          <BattleInterface
            character={character}
            onQuickAction={handleQuickAction}
            onUseAbility={handleUseAbility}
          />
        )}

        {mode === 'skills' && (
          <SkillsInterface
            character={character}
            onUseAbility={handleUseAbility}
          />
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      {mode === 'conversation' && (
        <div className="chat-input-area">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder={`Message ${character.name}...`}
            disabled={loading}
            className="chat-input"
          />
          <button
            onClick={handleSendMessage}
            disabled={!message.trim() || loading}
            className="send-button"
          >
            {loading ? '⏳' : '➤'}
          </button>
        </div>
      )}
    </div>
  );
}

// Conversation Messages Component
function ConversationMessages({ messages, character, loading }) {
  return (
    <div className="conversation-messages">
      {messages.map((msg, idx) => (
        <div key={idx} className={`message ${msg.type}`}>
          {msg.type === 'character' && (
            <div className="message-avatar">
              {character.images?.emoji || '🎭'}
            </div>
          )}
          <div className="message-content">
            {msg.type === 'character' && (
              <div className="message-header">
                <span className="message-author">{character.name}</span>
                {msg.mood && <span className="message-mood">({msg.mood})</span>}
              </div>
            )}
            <div className="message-text">{msg.text}</div>
            {msg.type === 'system' && msg.abilityResult && (
              <div className="ability-result">
                {msg.abilityResult.narration}
              </div>
            )}
          </div>
        </div>
      ))}
      {loading && (
        <div className="message character">
          <div className="message-avatar">{character.images?.emoji || '🎭'}</div>
          <div className="message-content">
            <div className="typing-indicator">
              <span></span><span></span><span></span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Battle Interface Component
function BattleInterface({ character, onQuickAction, onUseAbility }) {
  const [selectedTarget, setSelectedTarget] = useState(null);

  return (
    <div className="battle-interface">
      <div className="battle-status">
        <div className="character-status">
          <h3>{character.name}</h3>
          <div className="hp-display">
            <span className="hp-label">HP:</span>
            <div className="hp-bar-large">
              <div
                className="hp-fill-large"
                style={{
                  width: `${(character.hp.current / character.hp.max) * 100}%`
                }}
              />
              <span className="hp-text-large">
                {character.hp.current} / {character.hp.max}
              </span>
            </div>
          </div>
          <div className="ac-display">
            <span className="ac-label">AC:</span>
            <span className="ac-value">{character.ac}</span>
          </div>
        </div>
      </div>

      <div className="quick-actions">
        <h4>Quick Actions</h4>
        <div className="action-buttons">
          <button className="action-btn" onClick={() => onQuickAction('attack')}>
            ⚔️ Attack
          </button>
          <button className="action-btn" onClick={() => onQuickAction('initiative')}>
            🎲 Initiative
          </button>
          <button className="action-btn" onClick={() => onQuickAction('save')}>
            🛡️ Save
          </button>
          <button className="action-btn" onClick={() => onQuickAction('dash')}>
            🏃 Dash
          </button>
          <button className="action-btn" onClick={() => onQuickAction('dodge')}>
            💨 Dodge
          </button>
          <button className="action-btn" onClick={() => onQuickAction('help')}>
            🤝 Help
          </button>
        </div>
      </div>

      <div className="battle-abilities">
        <h4>Combat Abilities</h4>
        <div className="abilities-grid">
          {character.abilities?.map(ability => (
            <button
              key={ability.id}
              className="battle-ability-btn"
              onClick={() => onUseAbility(ability)}
              disabled={ability.cooldown > 0}
            >
              <span className="ability-icon-large">{ability.icon}</span>
              <span className="ability-name-battle">{ability.name}</span>
              {ability.damage && (
                <span className="ability-damage">{ability.damage}</span>
              )}
              {ability.cooldown > 0 && (
                <span className="cooldown-overlay">{ability.cooldown}</span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// Skills Interface Component
function SkillsInterface({ character, onUseAbility }) {
  const [selectedAbility, setSelectedAbility] = useState(null);

  return (
    <div className="skills-interface">
      <div className="abilities-showcase">
        {character.abilities?.map(ability => (
          <div
            key={ability.id}
            className={`ability-card ${selectedAbility?.id === ability.id ? 'selected' : ''}`}
            onClick={() => setSelectedAbility(ability)}
          >
            <div className="ability-card-header">
              <span className="ability-icon-xl">{ability.icon}</span>
              <h3 className="ability-title">{ability.name}</h3>
            </div>

            {/* Ability Image */}
            {ability.images?.icon && (
              <div className="ability-image">
                <img src={ability.images.icon} alt={ability.name} />
              </div>
            )}

            <div className="ability-details">
              <p className="ability-description">{ability.description}</p>

              {ability.damage && (
                <div className="ability-stat">
                  <span className="stat-label">Damage:</span>
                  <span className="stat-value">{ability.damage}</span>
                </div>
              )}

              {ability.castingTime && (
                <div className="ability-stat">
                  <span className="stat-label">Casting Time:</span>
                  <span className="stat-value">{ability.castingTime}</span>
                </div>
              )}

              {ability.range && (
                <div className="ability-stat">
                  <span className="stat-label">Range:</span>
                  <span className="stat-value">{ability.range}</span>
                </div>
              )}
            </div>

            <button
              className="use-ability-btn"
              onClick={(e) => {
                e.stopPropagation();
                onUseAbility(ability);
              }}
              disabled={ability.cooldown > 0}
            >
              {ability.cooldown > 0 ? `Cooldown: ${ability.cooldown}` : 'Use Ability'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

EnhancedChatInterface.propTypes = {
  character: PropTypes.object.isRequired,
  onSendMessage: PropTypes.func.isRequired,
  onUseAbility: PropTypes.func,
  onRoll: PropTypes.func
};

ConversationMessages.propTypes = {
  messages: PropTypes.array.isRequired,
  character: PropTypes.object.isRequired,
  loading: PropTypes.bool
};

BattleInterface.propTypes = {
  character: PropTypes.object.isRequired,
  onQuickAction: PropTypes.func.isRequired,
  onUseAbility: PropTypes.func.isRequired
};

SkillsInterface.propTypes = {
  character: PropTypes.object.isRequired,
  onUseAbility: PropTypes.func.isRequired
};

export default EnhancedChatInterface;
