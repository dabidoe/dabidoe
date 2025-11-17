import { useState, useCallback, useEffect } from 'react'
import PropTypes from 'prop-types'
import { rollD20 } from '../utils/dice'
import { ADVENTURE_TYPES } from '../data/adventure-trees'
import AdventureCanvas from './AdventureCanvas'
import './AdventureMode.css'

/**
 * Adventure Mode Component
 * Handles solo play adventures with dialogue trees, skill checks, and combat
 */
function AdventureMode({ character, adventure, onMessage, onCombatStart, onAdventureComplete, useCanvasView = true }) {
  const [currentNodeId, setCurrentNodeId] = useState(adventure.startNode)
  const [adventureHistory, setAdventureHistory] = useState([])
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [lastSkillCheck, setLastSkillCheck] = useState(null)
  const [showCharacterSheet, setShowCharacterSheet] = useState(false)

  // Get current node
  const currentNode = adventure.nodes[currentNodeId]

  // Add to history when node changes
  useEffect(() => {
    if (currentNode) {
      setAdventureHistory(prev => [...prev, {
        nodeId: currentNodeId,
        type: currentNode.type,
        text: currentNode.text,
        timestamp: new Date()
      }])

      // Add narrative to chat
      if (onMessage) {
        onMessage(currentNode.text, 'adventure-narrator', 'Narrating')

        // Add character response if available
        if (currentNode.characterResponse) {
          setTimeout(() => {
            onMessage(currentNode.characterResponse, 'character', 'Thoughtful')
          }, 1000)
        }
      }
    }
  }, [currentNodeId])

  // Handle choice selection
  const handleChoice = useCallback((choice) => {
    if (isTransitioning) return

    setIsTransitioning(true)

    // Add player's choice to chat
    if (onMessage) {
      onMessage(`> ${choice.text}`, 'player')
    }

    // Transition to next node after brief delay
    setTimeout(() => {
      setCurrentNodeId(choice.nextNode)
      setIsTransitioning(false)
    }, 500)
  }, [isTransitioning, onMessage])

  // Moved handleSkillCheck and handleCanvasChoice will be defined below

  // Handle skill check
  const handleSkillCheck = useCallback(() => {
    if (isTransitioning || !currentNode) return

    setIsTransitioning(true)

    const skillMod = getSkillModifier(character, currentNode.skill)
    const roll = rollD20(skillMod)

    setLastSkillCheck({
      skill: currentNode.skill,
      roll: roll.d20,
      modifier: skillMod,
      total: roll.total,
      dc: currentNode.dc,
      success: roll.total >= currentNode.dc,
      isCrit: roll.isCrit,
      isFail: roll.isFail
    })

    // Add roll result to chat
    if (onMessage) {
      let rollMessage = `🎲 ${currentNode.skill.toUpperCase()} Check: ${roll.d20} + ${skillMod} = **${roll.total}** (DC ${currentNode.dc})`

      if (roll.isCrit) {
        rollMessage += ' **CRITICAL SUCCESS!**'
      } else if (roll.isFail) {
        rollMessage += ' *Critical Failure...*'
      } else if (roll.total >= currentNode.dc) {
        rollMessage += ' ✅ **SUCCESS!**'
      } else {
        rollMessage += ' ❌ **FAILURE**'
      }

      onMessage(rollMessage, 'system', 'Rolling')
    }

    // Transition to success/failure node
    setTimeout(() => {
      const success = roll.total >= currentNode.dc || roll.isCrit
      const nextNode = success ? currentNode.successNode : currentNode.failureNode
      setCurrentNodeId(nextNode)
      setIsTransitioning(false)
    }, 2000)
  }, [character, currentNode, isTransitioning, onMessage])

  // Handle combat start
  const handleCombatStart = useCallback(() => {
    if (onCombatStart && currentNode.enemies) {
      onCombatStart(currentNode.enemies, currentNode.hasAdvantage || false)
    }
  }, [currentNode, onCombatStart])

  // Handle canvas choice (includes skill checks and choices)
  const handleCanvasChoice = useCallback((choice) => {
    // If current node is a skill check, handle it
    if (currentNode.type === ADVENTURE_TYPES.SKILL_CHECK) {
      handleSkillCheck()
      return
    }

    // If current node is combat, start combat
    if (currentNode.type === ADVENTURE_TYPES.COMBAT) {
      handleCombatStart()
      return
    }

    // Otherwise handle normal choice
    handleChoice(choice)
  }, [currentNode, handleChoice, handleSkillCheck, handleCombatStart])

  // Handle adventure end
  useEffect(() => {
    if (currentNode && currentNode.type === ADVENTURE_TYPES.END) {
      if (onAdventureComplete) {
        onAdventureComplete({
          nodeId: currentNodeId,
          endType: currentNode.endType,
          message: currentNode.message,
          rewards: currentNode.rewards
        })
      }
    }
  }, [currentNode, currentNodeId, onAdventureComplete])

  // Handle auto-transition for narratives
  useEffect(() => {
    if (currentNode && currentNode.type === ADVENTURE_TYPES.NARRATIVE && currentNode.nextNode) {
      // Auto-advance narrative nodes after character response
      const delay = currentNode.characterResponse ? 3000 : 2000
      const timer = setTimeout(() => {
        setCurrentNodeId(currentNode.nextNode)
      }, delay)

      return () => clearTimeout(timer)
    }
  }, [currentNode])

  if (!currentNode) {
    return (
      <div className="adventure-error">
        <p>⚠️ Adventure node not found</p>
        <p className="error-detail">Node ID: {currentNodeId}</p>
      </div>
    )
  }

  // Render canvas view if enabled
  if (useCanvasView) {
    return (
      <div className="adventure-mode canvas-mode">
        <AdventureCanvas
          currentNode={currentNode}
          character={character}
          onChoice={handleCanvasChoice}
          onOpenCharacterSheet={() => setShowCharacterSheet(true)}
          combatActive={currentNode.type === ADVENTURE_TYPES.COMBAT}
        />

        {/* Character Sheet Modal/Overlay (if needed) */}
        {showCharacterSheet && (
          <div className="character-sheet-overlay">
            <div className="character-sheet-modal">
              <button
                className="close-sheet"
                onClick={() => setShowCharacterSheet(false)}
              >
                ✕
              </button>
              <div className="character-sheet-content">
                <h2>{character.name}</h2>
                {/* Character sheet would go here */}
                <p>Character sheet coming soon...</p>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  // Traditional text-based view
  return (
    <div className="adventure-mode">
      {/* Current Node Display */}
      <div className={`adventure-node ${currentNode.type}`}>
        {/* Narrative Text */}
        {currentNode.type === ADVENTURE_TYPES.NARRATIVE && (
          <div className="narrative-node">
            <div className="narrative-icon">📖</div>
            <p className="narrative-text">{currentNode.text}</p>
            {currentNode.characterResponse && (
              <div className="character-response">
                <span className="character-portrait">{character.portrait || '⚔️'}</span>
                <p className="response-text">"{currentNode.characterResponse}"</p>
              </div>
            )}
            <div className="narrative-progress">
              <div className="progress-dots">
                <span className="dot"></span>
                <span className="dot"></span>
                <span className="dot"></span>
              </div>
            </div>
          </div>
        )}

        {/* Choice Node */}
        {currentNode.type === ADVENTURE_TYPES.CHOICE && (
          <div className="choice-node">
            <p className="choice-prompt">{currentNode.text}</p>
            <div className="choice-buttons">
              {currentNode.choices.map((choice) => (
                <button
                  key={choice.id}
                  className={`choice-btn ${isTransitioning ? 'disabled' : ''}`}
                  onClick={() => handleChoice(choice)}
                  disabled={isTransitioning}
                  aria-label={choice.text}
                >
                  <span className="choice-icon" aria-hidden="true">{choice.icon}</span>
                  <span className="choice-text">{choice.text}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Skill Check Node */}
        {currentNode.type === ADVENTURE_TYPES.SKILL_CHECK && (
          <div className="skill-check-node">
            <div className="skill-check-header">
              <span className="skill-icon">🎲</span>
              <h3>{currentNode.skill.toUpperCase()} Check</h3>
              <span className="dc-badge">DC {currentNode.dc}</span>
            </div>
            <p className="skill-check-text">{currentNode.text}</p>

            {lastSkillCheck && lastSkillCheck.skill === currentNode.skill ? (
              <div className={`skill-result ${lastSkillCheck.success ? 'success' : 'failure'}`}>
                <div className="roll-display">
                  <span className="die-result">{lastSkillCheck.roll}</span>
                  <span className="modifier">+{lastSkillCheck.modifier}</span>
                  <span className="equals">=</span>
                  <span className="total">{lastSkillCheck.total}</span>
                </div>
                <div className="result-text">
                  {lastSkillCheck.isCrit && '🌟 CRITICAL SUCCESS! 🌟'}
                  {lastSkillCheck.isFail && '💥 CRITICAL FAILURE 💥'}
                  {!lastSkillCheck.isCrit && !lastSkillCheck.isFail && (
                    lastSkillCheck.success ? '✅ SUCCESS!' : '❌ FAILURE'
                  )}
                </div>
              </div>
            ) : (
              <button
                className="skill-check-btn"
                onClick={handleSkillCheck}
                disabled={isTransitioning}
                aria-label={`Roll ${currentNode.skill} check`}
              >
                <span className="btn-icon">🎲</span>
                Roll {currentNode.skill.toUpperCase()}
              </button>
            )}

            {currentNode.characterResponse && !lastSkillCheck && (
              <div className="character-encouragement">
                <span className="character-portrait">{character.portrait || '⚔️'}</span>
                <p>"{currentNode.characterResponse}"</p>
              </div>
            )}
          </div>
        )}

        {/* Combat Node */}
        {currentNode.type === ADVENTURE_TYPES.COMBAT && (
          <div className="combat-node">
            <div className="combat-header">
              <span className="combat-icon">⚔️</span>
              <h3>COMBAT!</h3>
            </div>
            <p className="combat-text">{currentNode.text}</p>

            <div className="enemy-list">
              <h4>Enemies:</h4>
              {currentNode.enemies.map((enemy, index) => (
                <div key={index} className="enemy-card">
                  <span className="enemy-name">{enemy.name}</span>
                  <div className="enemy-stats">
                    <span className="stat">HP: {enemy.hp}</span>
                    <span className="stat">AC: {enemy.ac}</span>
                  </div>
                </div>
              ))}
            </div>

            {currentNode.hasAdvantage && (
              <div className="combat-advantage">
                ✨ You have ADVANTAGE on your first attack!
              </div>
            )}

            <button
              className="combat-start-btn"
              onClick={handleCombatStart}
              disabled={isTransitioning}
            >
              <span className="btn-icon">⚔️</span>
              Begin Combat
            </button>

            {currentNode.characterResponse && (
              <div className="character-battle-cry">
                <span className="character-portrait">{character.portrait || '⚔️'}</span>
                <p>"{currentNode.characterResponse}"</p>
              </div>
            )}
          </div>
        )}

        {/* End Node */}
        {currentNode.type === ADVENTURE_TYPES.END && (
          <div className={`end-node ${currentNode.endType}`}>
            <div className="end-icon">
              {currentNode.endType === 'success' && '🏆'}
              {currentNode.endType === 'defeat' && '💀'}
              {currentNode.endType === 'retreat' && '🏃'}
            </div>
            <h3>
              {currentNode.endType === 'success' && 'Adventure Complete!'}
              {currentNode.endType === 'defeat' && 'Defeated...'}
              {currentNode.endType === 'retreat' && 'Tactical Retreat'}
            </h3>
            <p className="end-text">{currentNode.text}</p>

            {currentNode.characterResponse && (
              <div className="character-final-words">
                <span className="character-portrait">{character.portrait || '⚔️'}</span>
                <p>"{currentNode.characterResponse}"</p>
              </div>
            )}

            {currentNode.message && (
              <div className="end-message">
                <p>{currentNode.message}</p>
              </div>
            )}

            {currentNode.rewards && currentNode.rewards.length > 0 && (
              <div className="rewards">
                <h4>Rewards:</h4>
                <ul>
                  {currentNode.rewards.map((reward, index) => (
                    <li key={index}>✨ {reward}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Adventure Progress Tracker */}
      <div className="adventure-progress">
        <span className="progress-label">Decisions: {adventureHistory.filter(h => h.type === ADVENTURE_TYPES.CHOICE).length}</span>
        <span className="progress-label">Rolls: {adventureHistory.filter(h => h.type === ADVENTURE_TYPES.SKILL_CHECK).length}</span>
      </div>
    </div>
  )
}

/**
 * Get skill modifier for a character
 * This is a simplified version - expand based on your character data structure
 */
function getSkillModifier(character, skillName) {
  // Map skill names to ability scores
  const skillToAbility = {
    'stealth': 'dexterity',
    'persuasion': 'charisma',
    'investigation': 'intelligence',
    'athletics': 'strength',
    'perception': 'wisdom',
    'arcana': 'intelligence',
    'insight': 'wisdom',
    'intimidation': 'charisma'
  }

  const ability = skillToAbility[skillName.toLowerCase()] || 'dexterity'

  // If character has skill proficiencies, use them
  if (character.skills && character.skills[skillName]) {
    return character.skills[skillName].modifier || 2
  }

  // Otherwise return a default modifier
  // In a real implementation, calculate from ability scores
  return 2
}

AdventureMode.propTypes = {
  character: PropTypes.shape({
    name: PropTypes.string.isRequired,
    portrait: PropTypes.string,
    skills: PropTypes.object
  }).isRequired,
  adventure: PropTypes.shape({
    startNode: PropTypes.string.isRequired,
    nodes: PropTypes.object.isRequired
  }).isRequired,
  onMessage: PropTypes.func,
  onCombatStart: PropTypes.func,
  onAdventureComplete: PropTypes.func,
  useCanvasView: PropTypes.bool
}

export default AdventureMode
