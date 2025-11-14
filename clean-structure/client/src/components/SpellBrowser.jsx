import { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { getSpellsByClass, spellToAbility } from '../../../shared/data-service'
import './SpellBrowser.css'

/**
 * SpellBrowser Component
 *
 * Modal for browsing and adding spells to character
 */
function SpellBrowser({ character, onAddSpell, onClose }) {
  const [allSpells, setAllSpells] = useState([])
  const [filteredSpells, setFilteredSpells] = useState([])
  const [selectedLevel, setSelectedLevel] = useState('all')
  const [selectedSpell, setSelectedSpell] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    // Load all spells for this character's class
    if (!character.class) {
      setAllSpells([])
      setFilteredSpells([])
      return
    }
    const spells = getSpellsByClass(character.class.toLowerCase())
    setAllSpells(spells)
    setFilteredSpells(spells)
  }, [character.class])

  useEffect(() => {
    // Filter spells by level and search query
    let filtered = allSpells

    if (selectedLevel !== 'all') {
      filtered = filtered.filter(s => s.level === selectedLevel)
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(s =>
        s.name.toLowerCase().includes(query) ||
        s.description?.toLowerCase().includes(query)
      )
    }

    setFilteredSpells(filtered)
  }, [selectedLevel, searchQuery, allSpells])

  // Check if character already has this spell
  const hasSpell = (spellName) => {
    return character.abilities?.some(a =>
      a.category === 'spell' && a.name === spellName
    )
  }

  const handleAddSpell = (spell) => {
    if (hasSpell(spell.name)) return

    const abilityFormat = spellToAbility(spell, true)
    onAddSpell(abilityFormat)
  }

  // Group spells by level for count display
  const spellCounts = allSpells.reduce((acc, spell) => {
    acc[spell.level] = (acc[spell.level] || 0) + 1
    return acc
  }, {})

  return (
    <div className="spell-browser-overlay" onClick={onClose}>
      <div className="spell-browser" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="browser-header">
          <h2>📚 Spell Library{character.class ? ` - ${character.class}` : ''}</h2>
          <button className="close-browser" onClick={onClose}>✕</button>
        </div>

        {/* Search Bar */}
        <div className="browser-search">
          <input
            type="text"
            placeholder="Search spells..."
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
            All ({allSpells.length})
          </button>
          <button
            className={`level-btn ${selectedLevel === 'cantrip' ? 'active' : ''}`}
            onClick={() => setSelectedLevel('cantrip')}
          >
            Cantrips ({spellCounts.cantrip || 0})
          </button>
          {[1, 2, 3, 4, 5].map(level => (
            <button
              key={level}
              className={`level-btn ${selectedLevel === String(level) ? 'active' : ''}`}
              onClick={() => setSelectedLevel(String(level))}
            >
              Level {level} ({spellCounts[String(level)] || 0})
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="browser-content">
          {/* Spell List */}
          <div className="spell-list-panel">
            <div className="spell-list-header">
              {filteredSpells.length} spells
            </div>
            <div className="spell-list-scroll">
              {filteredSpells.map((spell, index) => (
                <div
                  key={index}
                  className={`spell-list-item ${selectedSpell?.name === spell.name ? 'selected' : ''} ${hasSpell(spell.name) ? 'owned' : ''}`}
                  onClick={() => setSelectedSpell(spell)}
                >
                  <div className="spell-list-name">
                    {hasSpell(spell.name) && <span className="owned-badge">✓</span>}
                    {spell.name}
                  </div>
                  <div className="spell-list-level">
                    {spell.level === 'cantrip' ? 'Cantrip' : `L${spell.level}`}
                  </div>
                </div>
              ))}
              {filteredSpells.length === 0 && (
                <div className="no-results">
                  No spells found
                </div>
              )}
            </div>
          </div>

          {/* Spell Details */}
          <div className="spell-details-panel">
            {selectedSpell ? (
              <>
                <div className="spell-detail-header">
                  <h3>{selectedSpell.name}</h3>
                  <span className="spell-detail-level">
                    {selectedSpell.level === 'cantrip' ? 'Cantrip' : `Level ${selectedSpell.level}`}
                  </span>
                </div>

                <div className="spell-detail-meta">
                  <div className="meta-row">
                    <span className="meta-label">School:</span>
                    <span>{selectedSpell.school}</span>
                  </div>
                  <div className="meta-row">
                    <span className="meta-label">Casting Time:</span>
                    <span>{selectedSpell.casting_time}</span>
                  </div>
                  <div className="meta-row">
                    <span className="meta-label">Range:</span>
                    <span>{selectedSpell.range}</span>
                  </div>
                  <div className="meta-row">
                    <span className="meta-label">Components:</span>
                    <span>{selectedSpell.components?.raw || 'Unknown'}</span>
                  </div>
                  <div className="meta-row">
                    <span className="meta-label">Duration:</span>
                    <span>{selectedSpell.duration}</span>
                  </div>
                </div>

                <div className="spell-detail-description">
                  <h4>Description</h4>
                  <p>{selectedSpell.description}</p>
                </div>

                <button
                  className="add-spell-btn"
                  onClick={() => handleAddSpell(selectedSpell)}
                  disabled={hasSpell(selectedSpell.name)}
                >
                  {hasSpell(selectedSpell.name) ? '✓ Already Known' : '+ Add Spell'}
                </button>
              </>
            ) : (
              <div className="no-selection">
                <p>Select a spell to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

SpellBrowser.propTypes = {
  character: PropTypes.shape({
    class: PropTypes.string.isRequired,
    abilities: PropTypes.array
  }).isRequired,
  onAddSpell: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired
}

export default SpellBrowser
