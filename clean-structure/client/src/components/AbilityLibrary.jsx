import { useState, useEffect } from 'react'
import { getDemoAbilities } from '../data/demo-abilities'
import AbilityIcon from './AbilityIcon'
import './AbilityLibrary.css'

/**
 * AbilityLibrary Component
 *
 * Browse all available spells and items from the database
 * Search, filter, and add abilities to characters
 */
function AbilityLibrary({ characterId, onAddAbility, onClose }) {
  const [abilities, setAbilities] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all') // all, spell, item
  const [selectedSchool, setSelectedSchool] = useState('all')
  const [selectedLevel, setSelectedLevel] = useState('all')
  const [selectedRarity, setSelectedRarity] = useState('all')
  const [selectedAbility, setSelectedAbility] = useState(null)

  // Load abilities from API
  useEffect(() => {
    const loadAbilities = async () => {
      try {
        // TODO: Replace with actual API call
        // const response = await fetch('/api/abilities')
        // const data = await response.json()

        const loadedAbilities = getDemoAbilities()
        setAbilities(loadedAbilities)
        setLoading(false)
      } catch (error) {
        console.error('Failed to load abilities:', error)
        setLoading(false)
      }
    }

    loadAbilities()
  }, [])

  // Filter abilities based on search and filters
  const filteredAbilities = abilities.filter(ability => {
    // Search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      const matchesName = ability.name.toLowerCase().includes(query)
      const matchesDescription = ability.shortDescription?.toLowerCase().includes(query)
      if (!matchesName && !matchesDescription) return false
    }

    // Category filter
    if (selectedCategory === 'spell' && !ability.school) return false
    if (selectedCategory === 'item' && !ability.type) return false

    // School filter (for spells)
    if (selectedSchool !== 'all' && ability.school !== selectedSchool) return false

    // Level filter (for spells)
    if (selectedLevel !== 'all') {
      const level = parseInt(selectedLevel)
      if (ability.level !== level) return false
    }

    // Rarity filter (for items)
    if (selectedRarity !== 'all' && ability.rarity !== selectedRarity) return false

    return true
  })

  const handleAddAbility = (ability) => {
    if (onAddAbility) {
      onAddAbility(ability)
    }
  }

  const schools = ['Abjuration', 'Conjuration', 'Divination', 'Enchantment', 'Evocation', 'Illusion', 'Necromancy', 'Transmutation']
  const rarities = ['Common', 'Uncommon', 'Rare', 'Very Rare', 'Legendary', 'Artifact']

  if (loading) {
    return (
      <div className="ability-library">
        <div className="library-loading">Loading ability library...</div>
      </div>
    )
  }

  return (
    <div className="ability-library">
      <div className="library-header">
        <h2>📚 Ability Library</h2>
        <button className="close-library-btn" onClick={onClose}>✕</button>
      </div>

      <div className="library-search">
        <input
          type="text"
          className="search-input"
          placeholder="Search abilities..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="library-filters">
        <div className="filter-group">
          <label>Category</label>
          <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
            <option value="all">All</option>
            <option value="spell">Spells</option>
            <option value="item">Items</option>
          </select>
        </div>

        {selectedCategory !== 'item' && (
          <>
            <div className="filter-group">
              <label>School</label>
              <select value={selectedSchool} onChange={(e) => setSelectedSchool(e.target.value)}>
                <option value="all">All Schools</option>
                {schools.map(school => (
                  <option key={school} value={school}>{school}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Level</label>
              <select value={selectedLevel} onChange={(e) => setSelectedLevel(e.target.value)}>
                <option value="all">All Levels</option>
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(level => (
                  <option key={level} value={level}>
                    {level === 0 ? 'Cantrip' : `Level ${level}`}
                  </option>
                ))}
              </select>
            </div>
          </>
        )}

        {selectedCategory !== 'spell' && (
          <div className="filter-group">
            <label>Rarity</label>
            <select value={selectedRarity} onChange={(e) => setSelectedRarity(e.target.value)}>
              <option value="all">All Rarities</option>
              {rarities.map(rarity => (
                <option key={rarity} value={rarity}>{rarity}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="library-results">
        <div className="results-count">
          {filteredAbilities.length} {filteredAbilities.length === 1 ? 'ability' : 'abilities'} found
        </div>

        <div className="abilities-list">
          {filteredAbilities.map(ability => (
            <div
              key={ability._id}
              className={`ability-item ${selectedAbility?._id === ability._id ? 'selected' : ''}`}
              onClick={() => setSelectedAbility(ability)}
            >
              <div className="ability-item-icon">
                <AbilityIcon ability={ability} size="medium" />
              </div>
              <div className="ability-item-info">
                <div className="ability-item-name">{ability.name}</div>
                <div className="ability-item-meta">
                  {ability.school && (
                    <span className="meta-tag">{ability.school} {ability.level !== undefined ? `Lvl ${ability.level}` : ''}</span>
                  )}
                  {ability.type && (
                    <span className="meta-tag">{ability.type} ({ability.rarity})</span>
                  )}
                </div>
                <div className="ability-item-description">{ability.shortDescription}</div>
              </div>
              <button
                className="add-ability-btn"
                onClick={(e) => {
                  e.stopPropagation()
                  handleAddAbility(ability)
                }}
              >
                +
              </button>
            </div>
          ))}

          {filteredAbilities.length === 0 && (
            <div className="no-results">
              <p>No abilities found matching your filters.</p>
              <p>Try adjusting your search or filters.</p>
            </div>
          )}
        </div>
      </div>

      {selectedAbility && (
        <div className="ability-details-panel">
          <div className="details-header">
            <h3>{selectedAbility.name}</h3>
            <button
              className="add-to-character-btn"
              onClick={() => handleAddAbility(selectedAbility)}
            >
              Add to Character
            </button>
          </div>
          <div className="details-body">
            {selectedAbility.school && (
              <div className="detail-row">
                <strong>School:</strong> {selectedAbility.school}
                {selectedAbility.level !== undefined && ` (Level ${selectedAbility.level})`}
              </div>
            )}
            {selectedAbility.type && (
              <div className="detail-row">
                <strong>Type:</strong> {selectedAbility.type} ({selectedAbility.rarity})
              </div>
            )}
            {selectedAbility.castingTime && (
              <div className="detail-row">
                <strong>Casting Time:</strong> {selectedAbility.castingTime}
              </div>
            )}
            {selectedAbility.range && (
              <div className="detail-row">
                <strong>Range:</strong> {selectedAbility.range}
              </div>
            )}
            {selectedAbility.components && (
              <div className="detail-row">
                <strong>Components:</strong> {selectedAbility.components}
              </div>
            )}
            {selectedAbility.duration && (
              <div className="detail-row">
                <strong>Duration:</strong> {selectedAbility.duration}
              </div>
            )}
            {selectedAbility.damage && (
              <div className="detail-row">
                <strong>Damage:</strong> {selectedAbility.damage}
              </div>
            )}
            <div className="detail-description">
              {selectedAbility.longDescription || selectedAbility.shortDescription}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AbilityLibrary
