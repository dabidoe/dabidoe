import { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { getClassFeaturesByLevel, featureToAbility } from '../../../shared/data-service'
import classFeatures from '../../../data/class-features.json' with { type: 'json' }
import './AbilityBrowser.css'

/**
 * AbilityBrowser Component
 *
 * Modal for browsing and adding class features/abilities to character
 */
function AbilityBrowser({ character, onAddAbility, onClose }) {
  const [allAbilities, setAllAbilities] = useState([])
  const [filteredAbilities, setFilteredAbilities] = useState([])
  const [selectedLevel, setSelectedLevel] = useState('all')
  const [selectedAbility, setSelectedAbility] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedVariant, setSelectedVariant] = useState(null) // For abilities with multiple choices

  // Helper functions defined before useEffect hooks that need them
  // Detect if an ability has multiple variants (e.g., "Fighting Style: X")
  const getAbilityBaseName = (abilityName) => {
    // Extract base name before colon (e.g., "Fighting Style: Dueling" -> "Fighting Style")
    const colonIndex = abilityName.indexOf(':')
    return colonIndex > 0 ? abilityName.substring(0, colonIndex).trim() : abilityName
  }

  useEffect(() => {
    // Load all class features for this character's class
    if (!character.class) {
      setAllAbilities([])
      setFilteredAbilities([])
      return
    }
    const className = character.class.toLowerCase()
    const features = classFeatures[className] || []
    setAllAbilities(features)
    setFilteredAbilities(features)
  }, [character.class])

  useEffect(() => {
    // Filter abilities by level and search query
    let filtered = allAbilities

    if (selectedLevel !== 'all') {
      filtered = filtered.filter(a => a.level === parseInt(selectedLevel))
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(a =>
        a.name.toLowerCase().includes(query) ||
        a.description?.toLowerCase().includes(query) ||
        a.shortDescription?.toLowerCase().includes(query)
      )
    }

    // Deduplicate abilities with variants (e.g., "Fighting Style: X")
    // Only show one entry per base name + level combination
    const seen = new Set()
    filtered = filtered.filter(ability => {
      const baseName = getAbilityBaseName(ability.name)
      const key = `${baseName}-${ability.level}`
      if (seen.has(key)) {
        return false
      }
      seen.add(key)
      return true
    })

    setFilteredAbilities(filtered)
  }, [selectedLevel, searchQuery, allAbilities])

  // Check if character already has this ability
  const hasAbility = (abilityName) => {
    return character.abilities?.some(a =>
      a.category !== 'spell' && a.name === abilityName
    )
  }

  const getAbilityVariants = (ability) => {
    const baseName = getAbilityBaseName(ability.name)
    // Find all abilities with the same base name and level
    return allAbilities.filter(a =>
      getAbilityBaseName(a.name) === baseName && a.level === ability.level
    )
  }

  const hasAbilityVariant = (baseName) => {
    // Check if character has any variant of this ability
    return character.abilities?.some(a =>
      a.category !== 'spell' && getAbilityBaseName(a.name) === baseName
    )
  }

  const handleAddAbility = (ability) => {
    const variants = getAbilityVariants(ability)

    // If there are multiple variants, show selection UI
    if (variants.length > 1 && !selectedVariant) {
      setSelectedAbility(ability)
      setSelectedVariant(variants[0]) // Default to first variant
      return
    }

    const abilityToAdd = selectedVariant || ability
    if (hasAbility(abilityToAdd.name)) return

    const abilityFormat = featureToAbility(abilityToAdd)
    onAddAbility(abilityFormat)
    setSelectedVariant(null) // Reset selection
  }

  // Group abilities by level for count display
  const abilityCounts = allAbilities.reduce((acc, ability) => {
    acc[ability.level] = (acc[ability.level] || 0) + 1
    return acc
  }, {})

  // Get unique levels
  const availableLevels = [...new Set(allAbilities.map(a => a.level))].sort((a, b) => a - b)

  // Get category icon
  const getCategoryIcon = (category) => {
    const icons = {
      'combat': '⚔️',
      'utility': '🔧',
      'defensive': '🛡️',
      'social': '💬',
      'spell-like': '✨'
    }
    return icons[category] || '⭐'
  }

  // Get action type badge color
  const getActionTypeColor = (actionType) => {
    const colors = {
      'action': '#3498db',
      'bonus': '#9b59b6',
      'reaction': '#e74c3c',
      'passive': '#95a5a6'
    }
    return colors[actionType] || '#95a5a6'
  }

  return (
    <div className="ability-browser-overlay" onClick={onClose}>
      <div className="ability-browser" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="browser-header">
          <h2>⚔️ Class Features{character.class ? ` - ${character.class}` : ''}</h2>
          <button className="close-browser" onClick={onClose}>✕</button>
        </div>

        {/* Search Bar */}
        <div className="browser-search">
          <input
            type="text"
            placeholder="Search abilities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>

        {/* Level Filter */}
        <div className="level-filter">
          <button
            className={`level-btn ${selectedLevel === 'all' ? 'active' : ''}`}
            onClick={() => setSelectedLevel('all')}
          >
            All ({allAbilities.length})
          </button>
          {availableLevels.map(level => (
            <button
              key={level}
              className={`level-btn ${selectedLevel === String(level) ? 'active' : ''}`}
              onClick={() => setSelectedLevel(String(level))}
            >
              Level {level} ({abilityCounts[level] || 0})
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="browser-content">
          {/* Ability List */}
          <div className="ability-list-panel">
            <div className="ability-list-header">
              {filteredAbilities.length} features
            </div>
            <div className="ability-list-scroll">
              {filteredAbilities.map((ability, index) => {
                const variants = getAbilityVariants(ability)
                const baseName = getAbilityBaseName(ability.name)
                const isVariant = variants.length > 1
                const hasVariant = hasAbilityVariant(baseName)

                return (
                  <div
                    key={index}
                    className={`ability-list-item ${selectedAbility?.id === ability.id ? 'selected' : ''} ${hasVariant ? 'owned' : ''}`}
                    onClick={() => {
                      setSelectedAbility(ability)
                      if (isVariant) {
                        setSelectedVariant(variants[0])
                      } else {
                        setSelectedVariant(null)
                      }
                    }}
                  >
                    <div className="ability-list-icon">{getCategoryIcon(ability.category)}</div>
                    <div className="ability-list-info">
                      <div className="ability-list-name">
                        {hasVariant && <span className="owned-badge">✓</span>}
                        {isVariant ? baseName : ability.name}
                        {isVariant && <span style={{ fontSize: '11px', color: 'rgba(212, 175, 55, 0.7)', marginLeft: '6px' }}>({variants.length} options)</span>}
                      </div>
                      <div className="ability-list-meta">
                        <span className="ability-list-level">Level {ability.level}</span>
                        <span className="ability-list-category">{ability.category}</span>
                      </div>
                    </div>
                  </div>
                )
              })}
              {filteredAbilities.length === 0 && (
                <div className="no-results">
                  No abilities found
                </div>
              )}
            </div>
          </div>

          {/* Ability Details */}
          <div className="ability-details-panel">
            {selectedAbility ? (
              <>
                <div className="ability-detail-header">
                  <h3>
                    {getCategoryIcon(selectedAbility.category)} {selectedAbility.name}
                  </h3>
                  <div className="ability-detail-badges">
                    <span className="ability-detail-level">Level {selectedAbility.level}</span>
                    <span
                      className="ability-detail-action"
                      style={{ backgroundColor: getActionTypeColor(selectedAbility.actionType) }}
                    >
                      {selectedAbility.actionType}
                    </span>
                  </div>
                </div>

                <div className="ability-detail-short">
                  <strong>{selectedAbility.shortDescription}</strong>
                </div>

                <div className="ability-detail-meta">
                  <div className="meta-row">
                    <span className="meta-label">Category:</span>
                    <span>{selectedAbility.category}</span>
                  </div>
                  <div className="meta-row">
                    <span className="meta-label">Action Type:</span>
                    <span>{selectedAbility.actionType}</span>
                  </div>
                  {selectedAbility.uses && (
                    <div className="meta-row">
                      <span className="meta-label">Uses:</span>
                      <span>
                        {selectedAbility.uses.max === null ? 'Unlimited' : `${selectedAbility.uses.max} per ${selectedAbility.uses.per}`}
                      </span>
                    </div>
                  )}
                  {selectedAbility.damage && (
                    <div className="meta-row">
                      <span className="meta-label">Damage:</span>
                      <span>{selectedAbility.damage.formula} {selectedAbility.damage.type}</span>
                    </div>
                  )}
                  {selectedAbility.range && (
                    <div className="meta-row">
                      <span className="meta-label">Range:</span>
                      <span>{selectedAbility.range}</span>
                    </div>
                  )}
                </div>

                <div className="ability-detail-description">
                  <h4>Description</h4>
                  <p>{selectedVariant ? selectedVariant.description : selectedAbility.description}</p>
                  {(selectedVariant ? selectedVariant.effects : selectedAbility.effects) && (selectedVariant ? selectedVariant.effects : selectedAbility.effects).length > 0 && (
                    <div className="ability-effects">
                      <strong>Effects:</strong>
                      <ul>
                        {(selectedVariant ? selectedVariant.effects : selectedAbility.effects).map((effect, i) => (
                          <li key={i}>{effect}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {(() => {
                  const variants = getAbilityVariants(selectedAbility)
                  const baseName = getAbilityBaseName(selectedAbility.name)
                  const hasVariant = hasAbilityVariant(baseName)

                  if (variants.length > 1) {
                    return (
                      <div style={{ marginBottom: '16px' }}>
                        <div style={{ marginBottom: '8px', fontSize: '14px', fontWeight: 'bold', color: '#d4af37' }}>
                          Choose Option:
                        </div>
                        <select
                          value={selectedVariant?.id || variants[0].id}
                          onChange={(e) => {
                            const variant = variants.find(v => v.id === e.target.value)
                            setSelectedVariant(variant)
                          }}
                          style={{
                            width: '100%',
                            padding: '10px',
                            background: 'rgba(0,0,0,0.3)',
                            border: '1px solid rgba(212, 175, 55, 0.3)',
                            borderRadius: '4px',
                            color: '#fff',
                            fontSize: '14px',
                            cursor: 'pointer'
                          }}
                        >
                          {variants.map((variant) => (
                            <option key={variant.id} value={variant.id} style={{ background: '#1a1a2e', color: '#fff' }}>
                              {variant.name} - {variant.shortDescription}
                            </option>
                          ))}
                        </select>
                      </div>
                    )
                  }
                  return null
                })()}

                <button
                  className="add-ability-btn"
                  onClick={() => handleAddAbility(selectedAbility)}
                  disabled={(() => {
                    const variants = getAbilityVariants(selectedAbility)
                    if (variants.length > 1) {
                      return hasAbilityVariant(getAbilityBaseName(selectedAbility.name))
                    }
                    return hasAbility(selectedAbility.name)
                  })()}
                >
                  {(() => {
                    const variants = getAbilityVariants(selectedAbility)
                    const baseName = getAbilityBaseName(selectedAbility.name)
                    if (variants.length > 1) {
                      return hasAbilityVariant(baseName) ? '✓ Already Known' : `+ Add ${baseName}`
                    }
                    return hasAbility(selectedAbility.name) ? '✓ Already Known' : '+ Add Ability'
                  })()}
                </button>
              </>
            ) : (
              <div className="no-selection">
                <p>Select an ability to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

AbilityBrowser.propTypes = {
  character: PropTypes.shape({
    class: PropTypes.string.isRequired,
    abilities: PropTypes.array
  }).isRequired,
  onAddAbility: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired
}

export default AbilityBrowser
