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

  useEffect(() => {
    // Load all class features for this character's class
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

    setFilteredAbilities(filtered)
  }, [selectedLevel, searchQuery, allAbilities])

  // Check if character already has this ability
  const hasAbility = (abilityName) => {
    return character.abilities?.some(a =>
      a.category !== 'spell' && a.name === abilityName
    )
  }

  const handleAddAbility = (ability) => {
    if (hasAbility(ability.name)) return

    const abilityFormat = featureToAbility(ability)
    onAddAbility(abilityFormat)
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
          <h2>⚔️ Class Features - {character.class}</h2>
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
              {filteredAbilities.map((ability, index) => (
                <div
                  key={index}
                  className={`ability-list-item ${selectedAbility?.id === ability.id ? 'selected' : ''} ${hasAbility(ability.name) ? 'owned' : ''}`}
                  onClick={() => setSelectedAbility(ability)}
                >
                  <div className="ability-list-icon">{getCategoryIcon(ability.category)}</div>
                  <div className="ability-list-info">
                    <div className="ability-list-name">
                      {hasAbility(ability.name) && <span className="owned-badge">✓</span>}
                      {ability.name}
                    </div>
                    <div className="ability-list-meta">
                      <span className="ability-list-level">Level {ability.level}</span>
                      <span className="ability-list-category">{ability.category}</span>
                    </div>
                  </div>
                </div>
              ))}
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
                  <p>{selectedAbility.description}</p>
                  {selectedAbility.effects && selectedAbility.effects.length > 0 && (
                    <div className="ability-effects">
                      <strong>Effects:</strong>
                      <ul>
                        {selectedAbility.effects.map((effect, i) => (
                          <li key={i}>{effect}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <button
                  className="add-ability-btn"
                  onClick={() => handleAddAbility(selectedAbility)}
                  disabled={hasAbility(selectedAbility.name)}
                >
                  {hasAbility(selectedAbility.name) ? '✓ Already Known' : '+ Add Ability'}
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
