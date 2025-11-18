import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { simpleAdventures, adventureTrees } from '../data/simple-adventures'
import { rollD20 } from '../utils/dice'
import './SimpleAdventurePlayer.css'

/**
 * Simple Text-Based Adventure Player
 * NO IMAGES - Pure text to avoid API errors
 */
function SimpleAdventurePlayer() {
  const { adventureId } = useParams()
  const navigate = useNavigate()

  const [adventure, setAdventure] = useState(null)
  const [adventureTree, setAdventureTree] = useState(null)
  const [currentNodeId, setCurrentNodeId] = useState(null)
  const [currentNode, setCurrentNode] = useState(null)
  const [history, setHistory] = useState([])
  const [lastSkillRoll, setLastSkillRoll] = useState(null)

  // Mock character for beta - would come from real character selection
  const mockCharacter = {
    name: 'Adventurer',
    stats: { str: 14, dex: 16, con: 14, int: 12, wis: 13, cha: 10 },
    proficiencies: ['Stealth', 'Acrobatics', 'Investigation'],
    proficiencyBonus: 4
  }

  // Load adventure on mount
  useEffect(() => {
    const adv = simpleAdventures.find(a => a.id === adventureId)
    const tree = adventureTrees[adventureId]

    if (adv && tree) {
      setAdventure(adv)
      setAdventureTree(tree)
      setCurrentNodeId(adv.startNodeId)
    }
  }, [adventureId])

  // Update current node when nodeId changes
  useEffect(() => {
    if (adventureTree && currentNodeId) {
      const node = adventureTree[currentNodeId]
      setCurrentNode(node)

      // If node has a skill check, perform it automatically
      if (node.skillCheck) {
        performSkillCheck(node.skillCheck)
      }
    }
  }, [currentNodeId, adventureTree])

  const getSkillModifier = (skillName) => {
    const skillToStat = {
      'Acrobatics': 'dex',
      'Athletics': 'str',
      'Stealth': 'dex',
      'Investigation': 'int',
      'Arcana': 'int',
      'Religion': 'int',
      'Intimidation': 'cha',
      'Persuasion': 'cha',
      'Insight': 'wis',
      'Perception': 'wis',
      'Survival': 'wis'
    }

    const stat = skillToStat[skillName] || 'int'
    const statValue = mockCharacter.stats[stat] || 10
    const modifier = Math.floor((statValue - 10) / 2)
    const isProficient = mockCharacter.proficiencies.includes(skillName)

    return isProficient ? modifier + mockCharacter.proficiencyBonus : modifier
  }

  const performSkillCheck = (skillCheck) => {
    const { skill, dc, successNode, failureNode } = skillCheck
    const modifier = getSkillModifier(skill)
    const roll = rollD20(modifier)

    const success = roll.total >= dc
    const result = {
      skill,
      dc,
      roll: roll.d20,
      modifier,
      total: roll.total,
      success,
      isCrit: roll.isCrit,
      isFail: roll.isFail
    }

    setLastSkillRoll(result)

    // Auto-advance to success/failure node
    setTimeout(() => {
      setCurrentNodeId(success ? successNode : failureNode)
      addToHistory(currentNode.text || `Skill Check: ${skill} (DC ${dc})`, null)
    }, 100)
  }

  const handleChoice = (choice) => {
    addToHistory(currentNode.text, choice)
    setLastSkillRoll(null)

    if (choice.isEnd) {
      setCurrentNodeId(choice.nextNodeId || 'end')
    } else {
      setCurrentNodeId(choice.nextNodeId)
    }
  }

  const addToHistory = (text, choice) => {
    if (text) {
      setHistory(prev => [...prev, { text, choice, timestamp: Date.now() }])
    }
  }

  const handleRestart = () => {
    setCurrentNodeId(adventure.startNodeId)
    setHistory([])
    setLastSkillRoll(null)
  }

  if (!adventure || !adventureTree || !currentNode) {
    return (
      <div className="adventure-player loading">
        <p>Loading adventure...</p>
      </div>
    )
  }

  const isEnd = currentNode.isEnd || false

  return (
    <div className="adventure-player">
      <header className="player-header">
        <button className="back-btn" onClick={() => navigate('/adventures')}>
          ← Back to Adventures
        </button>
        <div className="header-info">
          <h1>{adventure.title}</h1>
          <div className="character-info">
            Playing as: <strong>{mockCharacter.name}</strong>
          </div>
        </div>
      </header>

      <main className="player-main">
        <div className="adventure-content">
          {/* History */}
          {history.length > 0 && (
            <div className="history">
              {history.map((entry, index) => (
                <div key={index} className="history-entry">
                  <p className="history-text">{entry.text}</p>
                  {entry.choice && (
                    <div className="history-choice">
                      → {entry.choice.text}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Current Node */}
          <div className="current-node">
            {/* Skill Roll Result */}
            {lastSkillRoll && (
              <div className={`skill-roll-result ${lastSkillRoll.success ? 'success' : 'failure'}`}>
                <div className="roll-header">
                  {lastSkillRoll.skill} Check (DC {lastSkillRoll.dc})
                </div>
                <div className="roll-details">
                  <div className="roll-dice">
                    🎲 {lastSkillRoll.roll}
                    {lastSkillRoll.isCrit && ' 🌟'}
                    {lastSkillRoll.isFail && ' 💀'}
                  </div>
                  <div className="roll-modifier">
                    {lastSkillRoll.modifier >= 0 ? '+' : ''}{lastSkillRoll.modifier}
                  </div>
                  <div className="roll-total">
                    = {lastSkillRoll.total}
                  </div>
                </div>
                <div className="roll-result">
                  {lastSkillRoll.success ? '✅ Success!' : '❌ Failure'}
                </div>
              </div>
            )}

            {/* Current Text */}
            {currentNode.text && (
              <p className="node-text">{currentNode.text}</p>
            )}

            {/* Choices */}
            {currentNode.choices && currentNode.choices.length > 0 && (
              <div className="choices">
                {currentNode.choices.map((choice, index) => (
                  <button
                    key={index}
                    className="choice-btn"
                    onClick={() => handleChoice(choice)}
                  >
                    <span className="choice-text">{choice.text}</span>
                    {choice.requiresSkill && (
                      <span className="skill-requirement">
                        ({choice.requiresSkill.skill} DC {choice.requiresSkill.dc})
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* End Screen */}
            {isEnd && (
              <div className="adventure-end">
                <div className="end-buttons">
                  <button className="restart-btn" onClick={handleRestart}>
                    🔄 Restart Adventure
                  </button>
                  <button className="return-btn" onClick={() => navigate('/adventures')}>
                    ← Choose Different Adventure
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

export default SimpleAdventurePlayer
