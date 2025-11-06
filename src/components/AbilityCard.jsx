import { useState } from 'react'
import './AbilityCard.css'

function AbilityCard({ ability, onUse, character, mode }) {
  const [expanded, setExpanded] = useState(false)

  const { details, uses, equipped } = ability

  if (!details) {
    return (
      <button className="action-btn disabled">
        ⚠️ {ability.name || 'Unknown Ability'}
      </button>
    )
  }

  // Check if ability is available to use
  const canUse = () => {
    if (!equipped) return false
    if (uses && uses.max !== null) {
      return uses.current > 0
    }
    return true
  }

  // Format uses display
  const getUsesText = () => {
    if (!uses || uses.max === null) return ''
    return `(${uses.current}/${uses.max})`
  }

  // Get icon from iconLayers or fallback
  const getIcon = () => {
    // Your iconLayers format: ["a8b5484b05547025ec022a00a80b49c4..."]
    // For now, use category-based emoji fallback
    if (ability.category === 'spell') {
      const schoolIcons = {
        'Abjuration': '🛡️',
        'Conjuration': '🌀',
        'Divination': '🔮',
        'Enchantment': '✨',
        'Evocation': '🔥',
        'Illusion': '👁️',
        'Necromancy': '💀',
        'Transmutation': '⚗️'
      }
      return schoolIcons[details.school] || '📜'
    }

    if (ability.category === 'attack') return '⚔️'
    if (ability.category === 'item') return '🎒'
    return '⭐'
  }

  // Handle ability use
  const handleUse = () => {
    if (!canUse()) return
    onUse(ability)
  }

  // Handle expand/collapse
  const handleClick = (e) => {
    // If clicking the button itself, use ability
    if (e.target.classList.contains('action-btn')) {
      handleUse()
    } else {
      // Otherwise toggle details
      setExpanded(!expanded)
    }
  }

  return (
    <div className={`ability-card ${expanded ? 'expanded' : ''} ${!canUse() ? 'disabled' : ''}`}>
      <button
        className={`action-btn ${!canUse() ? 'disabled' : ''}`}
        onClick={handleUse}
        disabled={!canUse()}
        title={expanded ? details.longDescription : details.shortDescription}
      >
        {getIcon()} {details.name} {getUsesText()}
      </button>

      {expanded && (
        <div className="ability-details" onClick={(e) => e.stopPropagation()}>
          <div className="ability-header">
            <h4>{details.name}</h4>
            <button className="close-details" onClick={() => setExpanded(false)}>✕</button>
          </div>

          {/* Basic Info */}
          <div className="ability-info">
            {details.level && (
              <span className="info-badge">{details.level}</span>
            )}
            {details.school && (
              <span className="info-badge">{details.school}</span>
            )}
            {ability.category && (
              <span className="info-badge category">{ability.category}</span>
            )}
          </div>

          {/* Spell Stats */}
          {ability.category === 'spell' && (
            <div className="ability-stats">
              <div className="stat-row">
                <span className="stat-label">Casting Time:</span>
                <span>{details.castingTime || 'Unknown'}</span>
              </div>
              <div className="stat-row">
                <span className="stat-label">Range:</span>
                <span>{details.range || 'Unknown'}</span>
              </div>
              <div className="stat-row">
                <span className="stat-label">Components:</span>
                <span>{details.components || 'Unknown'}</span>
              </div>
              <div className="stat-row">
                <span className="stat-label">Duration:</span>
                <span>{details.duration || 'Unknown'}</span>
              </div>
            </div>
          )}

          {/* Attack Stats */}
          {ability.category === 'attack' && (
            <div className="ability-stats">
              {details.attackBonus && (
                <div className="stat-row">
                  <span className="stat-label">Attack Bonus:</span>
                  <span>+{details.attackBonus}</span>
                </div>
              )}
              {details.damageFormula && (
                <div className="stat-row">
                  <span className="stat-label">Damage:</span>
                  <span>{details.damageFormula}</span>
                </div>
              )}
              {details.damageType && (
                <div className="stat-row">
                  <span className="stat-label">Damage Type:</span>
                  <span>{details.damageType}</span>
                </div>
              )}
            </div>
          )}

          {/* Description */}
          {details.shortDescription && (
            <div className="ability-description">
              <strong>Description:</strong>
              <p>{details.shortDescription}</p>
            </div>
          )}

          {/* Long Description */}
          {details.longDescription && (
            <div className="ability-description long">
              <pre>{details.longDescription}</pre>
            </div>
          )}

          {/* Uses */}
          {uses && uses.max !== null && (
            <div className="ability-uses">
              <div className="uses-bar">
                <div
                  className="uses-fill"
                  style={{ width: `${(uses.current / uses.max) * 100}%` }}
                ></div>
              </div>
              <span className="uses-text">
                {uses.current} / {uses.max} uses remaining
              </span>
            </div>
          )}

          {/* Use Button (when expanded) */}
          <button
            className="use-ability-btn"
            onClick={handleUse}
            disabled={!canUse()}
          >
            {canUse() ? `Use ${details.name}` : 'No Uses Remaining'}
          </button>
        </div>
      )}

      {/* Expand indicator */}
      {!expanded && (
        <button className="expand-indicator" onClick={() => setExpanded(true)}>
          ⓘ
        </button>
      )}
    </div>
  )
}

export default AbilityCard
