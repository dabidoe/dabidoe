import { useState } from 'react'
import PropTypes from 'prop-types'
import AbilityIcon from './AbilityIcon'
import './AbilityCard.css'

function AbilityCard({ ability, onUse, character, mode, initialExpanded = false }) {
  const [expanded, setExpanded] = useState(initialExpanded)

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
    // Class features and spells don't need 'equipped' check
    // Only items need to be equipped
    if (ability.category === 'item' && !equipped) return false

    // Check uses if applicable
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

  // Get spell level text for display
  const getSpellLevelText = () => {
    if (ability.category !== 'spell') return ''
    if (ability.type === 'cantrip' || details.level === 0) return 'Cantrip'
    if (details.level) {
      const levelNum = parseInt(details.level)
      const suffixes = ['', 'st', 'nd', 'rd', 'th', 'th', 'th', 'th', 'th', 'th']
      return `${levelNum}${suffixes[levelNum] || 'th'}-level`
    }
    return ''
  }

  // Get display icon text for button (emoji format)
  const getDisplayIcon = () => {
    // Check if iconLayers has an emoji
    if (details.iconLayers && details.iconLayers[0] && details.iconLayers[0][0]) {
      const icon = details.iconLayers[0][0]
      if (icon && icon.length <= 4) return icon // Emoji are typically 1-4 chars
    }

    // Category-based fallback icons
    const categoryIcons = {
      'attack': '⚔️',
      'combat': '⚔️',
      'item': '🎒',
      'social': '💬',
      'utility': '🔧',
      'defensive': '🛡️',
      'spell': '✨'
    }
    return categoryIcons[ability.category] || '⭐'
  }

  // Handle ability use
  const handleUse = () => {
    if (!canUse()) return
    onUse(ability)
  }

  return (
    <div
      className={`ability-card ${expanded ? 'expanded' : ''} ${!canUse() ? 'disabled' : ''}`}
    >
      {/* Collapsed View - Click to cast, info button to expand */}
      {!expanded && (
        <div
          className="ability-card-header"
          onClick={handleUse}
          style={{ cursor: canUse() ? 'pointer' : 'not-allowed' }}
        >
          <span className="ability-icon">{getDisplayIcon()}</span>
          <span className="ability-name">{details.name}</span>
          {getSpellLevelText() && <span className="spell-level-badge">{getSpellLevelText()}</span>}
          {getUsesText() && <span className="uses-badge">{getUsesText()}</span>}
          <button
            className="info-button"
            onClick={(e) => { e.stopPropagation(); setExpanded(true); }}
            title="View details"
          >
            ⓘ
          </button>
        </div>
      )}

      {expanded && (
        <div className="ability-details" onClick={(e) => e.stopPropagation()}>
          <div className="ability-header">
            <div className="ability-title">
              <AbilityIcon ability={ability} size="small" format="emoji" />
              <h4>{details.name}</h4>
            </div>
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
          {details.shortDescription && !details.description && (
            <div className="ability-description">
              <strong>Description:</strong>
              <p>{details.shortDescription}</p>
            </div>
          )}

          {/* Full Spell Description */}
          {ability.category === 'spell' && details.description && (
            <div className="ability-description spell-description">
              <strong>Description:</strong>
              <div className="spell-desc-content">{details.description}</div>
            </div>
          )}

          {/* Non-spell Long Description */}
          {ability.category !== 'spell' && details.longDescription && (
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

          {/* Cast/Use Button (when expanded) */}
          <button
            className={`use-ability-btn ${ability.category === 'spell' ? 'cast-spell-btn' : ''}`}
            onClick={handleUse}
            disabled={!canUse()}
          >
            {canUse() ? (
              ability.category === 'spell' ? (
                <>
                  ✨ Cast {details.name}
                  {ability.type === 'cantrip' && <span className="cantrip-note"> (Cantrip)</span>}
                  {ability.type === 'leveled-spell' && details.level && (
                    <span className="spell-level-note"> (Level {details.level})</span>
                  )}
                </>
              ) : (
                `Use ${details.name}`
              )
            ) : (
              'No Uses Remaining'
            )}
          </button>
        </div>
      )}
    </div>
  )
}

AbilityCard.propTypes = {
  ability: PropTypes.shape({
    abilityId: PropTypes.string,
    name: PropTypes.string.isRequired,
    category: PropTypes.string.isRequired,
    equipped: PropTypes.bool,
    uses: PropTypes.shape({
      current: PropTypes.number,
      max: PropTypes.number,
    }),
    details: PropTypes.shape({
      name: PropTypes.string.isRequired,
      shortDescription: PropTypes.string,
      longDescription: PropTypes.string,
      school: PropTypes.string,
      level: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      castingTime: PropTypes.string,
      range: PropTypes.string,
      components: PropTypes.string,
      duration: PropTypes.string,
      attackBonus: PropTypes.string,
      damageFormula: PropTypes.string,
      damageType: PropTypes.string,
      rarity: PropTypes.string,
      iconLayers: PropTypes.array,
    }).isRequired,
  }).isRequired,
  onUse: PropTypes.func.isRequired,
  character: PropTypes.object,
  mode: PropTypes.string,
  initialExpanded: PropTypes.bool,
}

export default AbilityCard
