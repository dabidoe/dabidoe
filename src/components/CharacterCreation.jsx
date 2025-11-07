import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PropTypes from 'prop-types'
import './CharacterCreation.css'

/**
 * CharacterCreation - Simple mobile-first character creation
 * Two paths: Freeform prompt OR Quick pick dropdowns
 */
function CharacterCreation() {
  const navigate = useNavigate()
  const [creationType, setCreationType] = useState(null) // null, 'prompt', or 'quick'

  return (
    <div className="character-creation">
      <div className="creation-header">
        <button className="back-btn" onClick={() => navigate('/')}>
          ← Back
        </button>
        <h1>Create Your Character</h1>
      </div>

      {!creationType && <CreationChoice onChoice={setCreationType} />}
      {creationType === 'prompt' && <PromptCreator onBack={() => setCreationType(null)} />}
      {creationType === 'quick' && <QuickCreator onBack={() => setCreationType(null)} />}
    </div>
  )
}

/**
 * CreationChoice - Choose between prompt or quick pick
 */
function CreationChoice({ onChoice }) {
  return (
    <div className="creation-choice">
      <p className="choice-subtitle">Choose how to create:</p>

      <button className="choice-card prompt-choice" onClick={() => onChoice('prompt')}>
        <div className="choice-icon">✏️</div>
        <h2>Describe</h2>
        <p>Type freely, just like Discord</p>
        <div className="choice-example">
          "A Drow paladin exiled from the Underdark..."
        </div>
      </button>

      <button className="choice-card quick-choice" onClick={() => onChoice('quick')}>
        <div className="choice-icon">⚡</div>
        <h2>Quick Pick</h2>
        <p>Answer simple questions</p>
        <div className="choice-example">Name, race, class, level → Done!</div>
      </button>
    </div>
  )
}

CreationChoice.propTypes = {
  onChoice: PropTypes.func.isRequired,
}

/**
 * PromptCreator - Freeform text prompt (like Discord)
 */
function PromptCreator({ onBack }) {
  const navigate = useNavigate()
  const [prompt, setPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const examplePrompts = [
    'A level 10 elf wizard specializing in illusion magic',
    'Gruff dwarf fighter, ex-soldier with a heart of gold',
    'Charismatic half-elf bard who tells tales of heroism',
    'Young human cleric devoted to healing the sick',
    'Drow paladin exiled from the Underdark, seeking redemption',
  ]

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Please describe your character')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Call your backend API
      const response = await fetch('https://app.characterfoundry.io/api/characters/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'prompt',
          prompt: prompt.trim(),
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate character')
      }

      const data = await response.json()

      // Navigate to preview with character data
      navigate('/character-preview', {
        state: { character: data.character, imageUrl: data.imageUrl },
      })
    } catch (err) {
      console.error('Error creating character:', err)
      setError('Failed to generate character. Please try again.')
      setLoading(false)
    }
  }

  const handleExampleClick = example => {
    setPrompt(example)
  }

  return (
    <div className="prompt-creator">
      <button className="back-link" onClick={onBack}>
        ← Choose different method
      </button>

      <h2>Describe Your Character</h2>
      <p className="prompt-instructions">
        Tell me about your character. Be as detailed or brief as you like!
      </p>

      <textarea
        className="prompt-input"
        value={prompt}
        onChange={e => setPrompt(e.target.value)}
        placeholder="A Drow paladin exiled from the Underdark, now serving Tyr as a champion of justice..."
        rows="6"
        maxLength="500"
      />

      <div className="char-count">{prompt.length}/500</div>

      {error && <div className="error-message">{error}</div>}

      <button
        className="generate-btn"
        onClick={handleGenerate}
        disabled={loading || !prompt.trim()}
      >
        {loading ? (
          <>
            <span className="spinner">⚙️</span> Generating...
          </>
        ) : (
          <>🎨 Generate Character</>
        )}
      </button>

      {/* Example prompts */}
      <div className="examples-section">
        <h3>Examples:</h3>
        <div className="examples-list">
          {examplePrompts.map((example, i) => (
            <button
              key={i}
              className="example-prompt"
              onClick={() => handleExampleClick(example)}
            >
              {example}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

PromptCreator.propTypes = {
  onBack: PropTypes.func.isRequired,
}

/**
 * QuickCreator - Dropdown-based quick creation
 */
function QuickCreator({ onBack }) {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: '',
    race: '',
    class: '',
    level: 1,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const races = [
    'Human',
    'Elf',
    'Dark Elf',
    'Dwarf',
    'Halfling',
    'Dragonborn',
    'Gnome',
    'Half-Elf',
    'Half-Orc',
    'Tiefling',
  ]

  const classes = [
    'Barbarian',
    'Bard',
    'Cleric',
    'Druid',
    'Fighter',
    'Monk',
    'Paladin',
    'Ranger',
    'Rogue',
    'Sorcerer',
    'Warlock',
    'Wizard',
  ]

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value })
  }

  const handleGenerate = async () => {
    // Validate
    if (!formData.name.trim()) {
      setError('Please enter a character name')
      return
    }
    if (!formData.race) {
      setError('Please select a race')
      return
    }
    if (!formData.class) {
      setError('Please select a class')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Call your backend API
      const response = await fetch('https://app.characterfoundry.io/api/characters/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'quick',
          ...formData,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate character')
      }

      const data = await response.json()

      // Navigate to preview with character data
      navigate('/character-preview', {
        state: { character: data.character, imageUrl: data.imageUrl },
      })
    } catch (err) {
      console.error('Error creating character:', err)
      setError('Failed to generate character. Please try again.')
      setLoading(false)
    }
  }

  const isFormValid = formData.name.trim() && formData.race && formData.class

  return (
    <div className="quick-creator">
      <button className="back-link" onClick={onBack}>
        ← Choose different method
      </button>

      <h2>Quick Character Creator</h2>
      <p className="quick-instructions">Answer a few questions to create your character</p>

      <div className="form-group">
        <label htmlFor="name">Character Name</label>
        <input
          id="name"
          type="text"
          className="form-input"
          value={formData.name}
          onChange={e => handleChange('name', e.target.value)}
          placeholder="Sebastienne"
          maxLength="50"
        />
      </div>

      <div className="form-group">
        <label htmlFor="race">Race</label>
        <select
          id="race"
          className="form-select"
          value={formData.race}
          onChange={e => handleChange('race', e.target.value)}
        >
          <option value="">Select race...</option>
          {races.map(race => (
            <option key={race} value={race}>
              {race}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="class">Class</label>
        <select
          id="class"
          className="form-select"
          value={formData.class}
          onChange={e => handleChange('class', e.target.value)}
        >
          <option value="">Select class...</option>
          {classes.map(cls => (
            <option key={cls} value={cls}>
              {cls}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="level">
          Level: <strong>{formData.level}</strong>
        </label>
        <input
          id="level"
          type="range"
          className="form-slider"
          min="1"
          max="20"
          value={formData.level}
          onChange={e => handleChange('level', parseInt(e.target.value))}
        />
        <div className="slider-labels">
          <span>1</span>
          <span>10</span>
          <span>20</span>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <button className="generate-btn" onClick={handleGenerate} disabled={loading || !isFormValid}>
        {loading ? (
          <>
            <span className="spinner">⚙️</span> Generating...
          </>
        ) : (
          <>🎨 Generate Character</>
        )}
      </button>
    </div>
  )
}

QuickCreator.propTypes = {
  onBack: PropTypes.func.isRequired,
}

export default CharacterCreation
