import { useState, useEffect } from 'react'
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

        // Demo data for now
        const demoAbilities = [
          {
            _id: '1',
            name: 'Fireball',
            shortDescription: 'A bright streak flashes to a point you choose within range',
            longDescription: 'A bright streak flashes from your pointing finger to a point you choose within range and then blossoms with a low roar into an explosion of flame...',
            school: 'Evocation',
            level: 3,
            castingTime: '1 action',
            range: '150 feet',
            components: 'V, S, M (a tiny ball of bat guano and sulfur)',
            duration: 'Instantaneous',
            damageFormula: '8d6',
            savingThrow: 'Dexterity',
            userId: 'system',
            iconLayers: [['https://game-icons.net/icons/ff5722/000000/1x1/lorc/fire-bolt.svg']]
          },
          {
            _id: '2',
            name: 'Shield',
            shortDescription: 'An invisible barrier of magical force appears',
            longDescription: 'An invisible barrier of magical force appears and protects you. Until the start of your next turn, you have a +5 bonus to AC...',
            school: 'Abjuration',
            level: 1,
            castingTime: '1 reaction',
            range: 'Self',
            components: 'V, S',
            duration: '1 round',
            userId: 'system',
            iconLayers: [['https://game-icons.net/icons/4CAF50/000000/1x1/lorc/shield-reflect.svg']]
          },
          {
            _id: '3',
            name: 'Longsword',
            shortDescription: 'A versatile martial melee weapon',
            longDescription: 'Proficiency with a longsword allows you to add your proficiency bonus to the attack roll...',
            type: 'Weapon',
            rarity: 'Common',
            itemSlot: 'Weapon',
            damage: '1d8',
            value: 1500,
            weight: 3,
            userId: 'system',
            iconLayers: [['https://game-icons.net/icons/9E9E9E/000000/1x1/various-artists/crossed-swords.svg']]
          },
          {
            _id: '4',
            name: 'Potion of Healing',
            shortDescription: 'You regain 2d4 + 2 hit points',
            longDescription: 'You regain 2d4 + 2 hit points when you drink this potion. The potion\'s red liquid glimmers when agitated.',
            type: 'Potion',
            rarity: 'Common',
            itemSlot: 'Miscellaneous',
            value: 5000,
            weight: 0.5,
            userId: 'system',
            iconLayers: [['https://game-icons.net/icons/9E9E9E/000000/1x1/various-artists/potion.svg']]
          }
        ]

        setAbilities(demoAbilities)
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
