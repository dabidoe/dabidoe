import { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { rollD20 } from '../utils/dice'
import AbilityCard from './AbilityCard'
import AdventureMode from './AdventureMode'
import { getAvailableAdventures } from '../data/adventure-trees'
import './CharacterModes.css'

/**
 * CharacterModes Component
 *
 * Displays different interaction modes:
 * - Conversation: Dialogue tree options
 * - Battle: Combat macros and abilities
 * - Skills: Skill checks with emoji icons
 * - Adventure: Solo play adventures with dialogue trees
 */

// D&D Skills with emoji mappings
const SKILLS = [
  { name: 'Acrobatics', emoji: '🤸', ability: 'DEX' },
  { name: 'Animal Handling', emoji: '🐴', ability: 'WIS' },
  { name: 'Arcana', emoji: '✨', ability: 'INT' },
  { name: 'Athletics', emoji: '💪', ability: 'STR' },
  { name: 'Deception', emoji: '🎭', ability: 'CHA' },
  { name: 'History', emoji: '📚', ability: 'INT' },
  { name: 'Insight', emoji: '👁️', ability: 'WIS' },
  { name: 'Intimidation', emoji: '😠', ability: 'CHA' },
  { name: 'Investigation', emoji: '🔍', ability: 'INT' },
  { name: 'Medicine', emoji: '🏥', ability: 'WIS' },
  { name: 'Nature', emoji: '🌿', ability: 'INT' },
  { name: 'Perception', emoji: '👀', ability: 'WIS' },
  { name: 'Performance', emoji: '🎭', ability: 'CHA' },
  { name: 'Persuasion', emoji: '🗣️', ability: 'CHA' },
  { name: 'Religion', emoji: '⛪', ability: 'INT' },
  { name: 'Sleight of Hand', emoji: '🖐️', ability: 'DEX' },
  { name: 'Stealth', emoji: '🥷', ability: 'DEX' },
  { name: 'Survival', emoji: '🏕️', ability: 'WIS' }
]

function CharacterModes({ character, mode, onMessage, abilities = [], onAbilityUse, initialAdventureId }) {
  const [selectedDialogue, setSelectedDialogue] = useState(null)
  const [selectedAdventure, setSelectedAdventure] = useState(null)
  const [availableAdventures] = useState(getAvailableAdventures())

  // Auto-select adventure if initialAdventureId is provided
  useEffect(() => {
    if (initialAdventureId && mode === 'adventure' && !selectedAdventure) {
      const adventure = availableAdventures.find(adv => adv.id === initialAdventureId)
      if (adventure) {
        setSelectedAdventure(adventure)
      }
    }
  }, [initialAdventureId, mode, availableAdventures, selectedAdventure])

  // Calculate skill modifier
  const getSkillModifier = (skill) => {
    const abilityScore = character.stats?.[skill.ability.toLowerCase()] || 10
    const modifier = Math.floor((abilityScore - 10) / 2)

    // Check if proficient (could be from character data)
    const isProficient = character.proficiencies?.includes(skill.name)
    const proficiencyBonus = character.proficiencyBonus || 2

    return isProficient ? modifier + proficiencyBonus : modifier
  }

  // Handle skill check
  const handleSkillCheck = (skill) => {
    const modifier = getSkillModifier(skill)
    const roll = rollD20(modifier)

    const resultText = `${skill.emoji} **${skill.name}** (${skill.ability}): ${roll.total} (d20: ${roll.d20}${modifier >= 0 ? '+' : ''}${modifier})`

    let flavor = ''
    if (roll.isCrit) {
      flavor = '\n*Exceptional performance!*'
    } else if (roll.isFail) {
      flavor = '\n*A fumble...*'
    } else if (roll.total >= 20) {
      flavor = '\n*Very impressive!*'
    } else if (roll.total >= 15) {
      flavor = '\n*A solid attempt.*'
    }

    onMessage(resultText + flavor, 'character', 'Focused')
  }

  // Dialogue tree options (example - would come from API)
  const dialogueOptions = [
    {
      id: 'greeting',
      text: 'Tell me about yourself',
      response: `I am ${character.name}, a warrior of legend. Eight decades of battle have shaped me into who I am today.`,
      mood: 'Proud'
    },
    {
      id: 'quest',
      text: 'What is your quest?',
      response: 'To lead these people to freedom. Every step we take defies empires and gods alike.',
      mood: 'Determined'
    },
    {
      id: 'story',
      text: 'Tell me a story from Troy',
      response: 'Troy... where I learned that glory without meaning is hollow. The walls stood for ten years, but the memory will stand forever.',
      mood: 'Contemplative'
    },
    {
      id: 'advice',
      text: 'What advice do you have?',
      response: 'True strength comes not from the sword, but from knowing when to wield it and when to stay your hand.',
      mood: 'Wise'
    },
    {
      id: 'challenge',
      text: 'Challenge them to prove themselves',
      response: 'You wish to test your mettle against mine? Bold. Very well, let us see what you are made of.',
      mood: 'Battle Ready',
      switchToBattle: true
    }
  ]

  // Battle macros
  const battleMacros = [
    {
      name: 'Attack Roll',
      emoji: '⚔️',
      action: () => {
        const roll = rollD20(9) // +9 to hit
        onMessage(`⚔️ **Attack**: ${roll.total} (d20: ${roll.d20}+9)${roll.isCrit ? ' **CRITICAL!**' : ''}`, 'character', 'Aggressive')
      }
    },
    {
      name: 'Initiative',
      emoji: '🎲',
      action: () => {
        const dexMod = Math.floor((character.stats?.dex - 10) / 2) || 3
        const roll = rollD20(dexMod)
        onMessage(`🎲 **Initiative**: ${roll.total} (d20: ${roll.d20}+${dexMod})`, 'character', 'Ready')
      }
    },
    {
      name: 'Saving Throw',
      emoji: '🛡️',
      action: () => {
        const roll = rollD20(5)
        onMessage(`🛡️ **Saving Throw**: ${roll.total} (d20: ${roll.d20}+5)${roll.isCrit ? ' **SUCCESS!**' : ''}`, 'character', 'Defensive')
      }
    },
    {
      name: 'Second Wind',
      emoji: '💚',
      action: () => {
        const healing = Math.floor(Math.random() * 10) + 1 + 10
        onMessage(`💚 **Second Wind**: Heal ${healing} HP\n*Drawing upon reserves of stamina!*`, 'character', 'Recovering')
      }
    }
  ]

  // Render based on mode
  const renderConversationMode = () => (
    <div className="conversation-mode">
      <div className="dialogue-options">
        {dialogueOptions.map(option => (
          <button
            key={option.id}
            className="dialogue-option"
            onClick={() => {
              onMessage(option.text, 'player')
              setTimeout(() => {
                onMessage(option.response, 'character', option.mood)
                if (option.switchToBattle) {
                  // Could trigger mode switch
                }
              }, 500)
            }}
          >
            <span className="dialogue-icon">💬</span>
            <span className="dialogue-text">{option.text}</span>
          </button>
        ))}
      </div>

      <div className="conversation-hint">
        <small>💡 Choose a dialogue option to speak with {character.name}</small>
      </div>
    </div>
  )

  const renderBattleMode = () => (
    <div className="battle-mode">
      {/* Battle Macros */}
      <div className="battle-macros">
        <div className="macros-label">Quick Actions</div>
        <div className="macros-grid">
          {battleMacros.map((macro, index) => (
            <button
              key={index}
              className="macro-btn"
              onClick={macro.action}
            >
              <span className="macro-emoji">{macro.emoji}</span>
              <span className="macro-name">{macro.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Combat Abilities */}
      <div className="combat-abilities">
        <div className="abilities-label">Combat Abilities</div>
        <div className="abilities-grid">
          {abilities
            .filter(a => ['attack', 'spell'].includes(a.category) && a.equipped)
            .map((ability) => (
              <AbilityCard
                key={ability.abilityId}
                ability={ability}
                onUse={onAbilityUse || ((ab) => {
                  // Handle ability use (fallback if no handler provided)
                  onMessage(`Used: ${ab.details?.name || ab.name}`, 'character', 'Focused')
                })}
                character={character}
                mode="battle"
              />
            ))}
        </div>
      </div>
    </div>
  )

  const renderSkillsMode = () => (
    <div className="skills-mode">
      <div className="skills-header">
        <h4>Skill Checks</h4>
        <p>Roll a d20 + your skill modifier</p>
      </div>

      <div className="skills-grid">
        {SKILLS.map(skill => {
          const modifier = getSkillModifier(skill)
          const isProficient = character.proficiencies?.includes(skill.name)

          return (
            <button
              key={skill.name}
              className={`skill-btn ${isProficient ? 'proficient' : ''}`}
              onClick={() => handleSkillCheck(skill)}
              title={`${skill.name} (${skill.ability}${modifier >= 0 ? '+' : ''}${modifier})`}
            >
              <span className="skill-emoji">{skill.emoji}</span>
              <span className="skill-info">
                <span className="skill-name">{skill.name}</span>
                <span className="skill-modifier">
                  {modifier >= 0 ? '+' : ''}{modifier}
                </span>
              </span>
              {isProficient && <span className="proficiency-badge">★</span>}
            </button>
          )
        })}
      </div>

      <div className="skills-legend">
        <small>★ = Proficient • Rolls appear in chat</small>
      </div>
    </div>
  )

  const renderAdventureMode = () => {
    if (selectedAdventure) {
      return (
        <AdventureMode
          character={character}
          adventure={selectedAdventure.adventure}
          onMessage={onMessage}
          onCombatStart={(enemies, hasAdvantage) => {
            onMessage(`⚔️ Combat started against ${enemies.length} enemies!`, 'system', 'Battle')
            // In a real implementation, this would trigger the actual combat system
          }}
          onAdventureComplete={(result) => {
            onMessage(
              `Adventure complete! Type: ${result.endType}${result.message ? ` - ${result.message}` : ''}`,
              'system',
              'Complete'
            )
            setTimeout(() => {
              setSelectedAdventure(null)
            }, 3000)
          }}
        />
      )
    }

    return (
      <div className="adventure-select">
        <div className="adventure-header">
          <h4>🗺️ Solo Play Adventures</h4>
          <p>Choose your own adventure in these interactive stories!</p>
        </div>

        <div className="adventures-list">
          {availableAdventures.map(adventure => (
            <button
              key={adventure.id}
              className="adventure-card"
              onClick={() => setSelectedAdventure(adventure)}
            >
              <div className="adventure-card-header">
                <h3>{adventure.title}</h3>
                <span className={`difficulty-badge ${adventure.difficulty.toLowerCase()}`}>
                  {adventure.difficulty}
                </span>
              </div>
              <p className="adventure-description">{adventure.description}</p>
              <div className="adventure-meta">
                <span className="meta-item">⏱️ {adventure.estimatedTime}</span>
              </div>
              <div className="adventure-start">
                <span className="start-arrow">▶</span>
                <span>Begin Adventure</span>
              </div>
            </button>
          ))}
        </div>

        <div className="adventure-info">
          <p className="info-text">
            💡 <strong>Tip:</strong> Adventures combine dialogue choices, skill checks, and combat encounters. Your choices matter!
          </p>
        </div>
      </div>
    )
  }

  // Render current mode
  switch (mode) {
    case 'conversation':
      return renderConversationMode()
    case 'battle':
      return renderBattleMode()
    case 'skills':
      return renderSkillsMode()
    case 'adventure':
      return renderAdventureMode()
    default:
      return renderConversationMode()
  }
}

CharacterModes.propTypes = {
  character: PropTypes.shape({
    name: PropTypes.string.isRequired,
    portrait: PropTypes.string,
    abilities: PropTypes.array,
    proficiencies: PropTypes.arrayOf(PropTypes.string),
    skills: PropTypes.object,
    stats: PropTypes.shape({
      str: PropTypes.number,
      dex: PropTypes.number,
      con: PropTypes.number,
      int: PropTypes.number,
      wis: PropTypes.number,
      cha: PropTypes.number,
    }),
    proficiencyBonus: PropTypes.number,
  }).isRequired,
  mode: PropTypes.oneOf(['conversation', 'battle', 'skills', 'adventure']).isRequired,
  onMessage: PropTypes.func.isRequired,
  abilities: PropTypes.array,
  onAbilityUse: PropTypes.func,
  initialAdventureId: PropTypes.string,
}

export default CharacterModes
