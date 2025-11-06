import { useLocation, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import PropTypes from 'prop-types'
import './CharacterPreview.css'

/**
 * CharacterPreview - Shows generated character with portrait
 * User can review and save or regenerate
 */
function CharacterPreview() {
  const location = useLocation()
  const navigate = useNavigate()
  const [saving, setSaving] = useState(false)

  const { character, imageUrl } = location.state || {}

  if (!character) {
    // No character data, redirect back
    navigate('/create')
    return null
  }

  const handleSave = async () => {
    setSaving(true)

    try {
      // Save to backend (character already exists, just need to mark as saved)
      const response = await fetch(
        `https://app.characterfoundry.io/api/characters/${character._id || character.id}/save`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )

      if (!response.ok) {
        throw new Error('Failed to save character')
      }

      // Navigate to character chat
      navigate(`/character/${character._id || character.id}`)
    } catch (err) {
      console.error('Error saving character:', err)
      setSaving(false)
      // For now, still navigate (could show error)
      navigate(`/character/${character._id || character.id}`)
    }
  }

  const handleRegenerate = () => {
    // Go back to creation
    navigate('/create')
  }

  return (
    <div className="character-preview">
      <div className="preview-header">
        <button className="back-btn" onClick={handleRegenerate}>
          ← Create Different
        </button>
      </div>

      <div className="preview-content">
        {/* Character Portrait */}
        <div className="portrait-frame">
          {imageUrl ? (
            <img src={imageUrl} alt={character.characterName || character.name} className="portrait-image" />
          ) : (
            <div className="portrait-placeholder">
              <span className="placeholder-icon">🎨</span>
              <p>Generating portrait...</p>
            </div>
          )}
        </div>

        {/* Character Info */}
        <div className="character-info">
          <h1 className="character-name">{character.characterName || character.name}</h1>

          <p className="character-subtitle">
            Level {character.level} {character.race} {character.class}
          </p>

          {/* Quick Stats */}
          <div className="quick-stats">
            <div className="stat-badge">
              <span className="stat-label">HP</span>
              <span className="stat-value">{character.labels?.HP || character.combat_data?.['Current HP'] || '—'}</span>
            </div>
            <div className="stat-badge">
              <span className="stat-label">AC</span>
              <span className="stat-value">{character.ac || character.combat_data?.['Armor Class'] || '—'}</span>
            </div>
            <div className="stat-badge">
              <span className="stat-label">Initiative</span>
              <span className="stat-value">{character.combat_data?.Initiative || '—'}</span>
            </div>
          </div>

          {/* Greeting/Backstory Preview */}
          {character.backstory && (
            <div className="backstory-preview">
              <h3>Backstory</h3>
              <p>{character.backstory}</p>
            </div>
          )}

          {/* Personality Traits */}
          {(character.personality || character.voice || character.mood) && (
            <div className="personality-preview">
              <div className="personality-tags">
                {character.personality && <span className="tag">💭 {character.personality}</span>}
                {character.voice && <span className="tag">🗣️ {character.voice}</span>}
                {character.mood && <span className="tag">😌 {character.mood}</span>}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="preview-actions">
            <button className="btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? (
                <>
                  <span className="spinner">⚙️</span> Saving...
                </>
              ) : (
                <>💬 Start Adventure</>
              )}
            </button>

            <button className="btn-secondary" onClick={() => navigate('/character-sheet', { state: { character } })}>
              📋 View Full Stats
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * CharacterSheet - Full stats view (simple version)
 */
export function CharacterSheet() {
  const location = useLocation()
  const navigate = useNavigate()

  const { character } = location.state || {}

  if (!character) {
    navigate('/create')
    return null
  }

  return (
    <div className="character-sheet-view">
      <div className="sheet-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          ← Back
        </button>
        <h1>{character.characterName || character.name}</h1>
      </div>

      <div className="sheet-content">
        {/* Stats */}
        {character.stats && (
          <section className="stats-section">
            <h2>Ability Scores</h2>
            <div className="stats-grid">
              {Object.entries(character.stats).map(([stat, value]) => (
                <div key={stat} className="stat-box">
                  <div className="stat-name">{stat}</div>
                  <div className="stat-value">{value}</div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Combat Data */}
        {character.combat_data && (
          <section className="combat-section">
            <h2>Combat Statistics</h2>
            <div className="combat-grid">
              {Object.entries(character.combat_data).map(([key, value]) => (
                <div key={key} className="combat-item">
                  <span className="item-label">{key}:</span>
                  <span className="item-value">{value}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Skills */}
        {character.skills && (
          <section className="skills-section">
            <h2>Skills</h2>
            <div className="skills-list">
              {Object.entries(character.skills).map(([skill, bonus]) => (
                <div key={skill} className="skill-item">
                  <span className="skill-name">
                    {skill.endsWith('*') ? `★ ${skill.replace('*', '')}` : skill}
                  </span>
                  <span className="skill-bonus">{bonus}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Abilities */}
        {character.abilities && (
          <section className="abilities-section">
            <h2>Abilities</h2>
            <div className="abilities-list">
              {Object.entries(character.abilities).map(([name, description]) => (
                <div key={name} className="ability-item">
                  <h3>{name}</h3>
                  <p>{description}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Traits */}
        {character.traits && (
          <section className="traits-section">
            <h2>Traits</h2>
            <div className="traits-list">
              {Object.entries(character.traits).map(([name, description]) => (
                <div key={name} className="trait-item">
                  <h3>{name}</h3>
                  <p>{description}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}

CharacterPreview.propTypes = {}

export default CharacterPreview
