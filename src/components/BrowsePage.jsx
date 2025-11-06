import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser } from '../contexts/UserContext'
import './BrowsePage.css'

function BrowsePage() {
  const navigate = useNavigate()
  const { isAuthenticated, user } = useUser()
  const [activeCategory, setActiveCategory] = useState('all')

  // Demo characters - will be fetched from API
  // TODO: Replace with API call: const characters = await getAllCharacters(userId)
  const characters = [
    {
      id: 'achilles',
      name: 'Achilles',
      icon: '🛡️',
      type: 'Legendary Warrior',
      description: 'The greatest warrior of ancient Greece',
      hp: 104,
      ac: 18,
      category: 'party',
      userId: user?.id
    },
    {
      id: 'fighter-01',
      name: 'Valeria Ironheart',
      icon: '⚔️',
      type: 'Fighter',
      description: 'A stalwart human warrior, master of combat',
      hp: 47,
      ac: 18,
      category: 'party',
      userId: user?.id
    },
    {
      id: 'mage-01',
      name: 'Elara Moonwhisper',
      icon: '🔮',
      type: 'Wizard',
      description: 'A brilliant elven mage wielding arcane power',
      hp: 28,
      ac: 12,
      category: 'party',
      userId: user?.id
    },
    {
      id: 'cleric-01',
      name: 'Brother Aldric',
      icon: '⛪',
      type: 'Cleric',
      description: 'A devout dwarven priest serving the divine',
      hp: 40,
      ac: 16,
      category: 'party',
      userId: user?.id
    }
  ]

  // Filter characters by category
  const filteredCharacters = activeCategory === 'all'
    ? characters
    : characters.filter(c => c.category === activeCategory)

  // Count characters per category
  const categoryCounts = {
    all: characters.length,
    party: characters.filter(c => c.category === 'party').length,
    enemies: characters.filter(c => c.category === 'enemies').length,
    npcs: characters.filter(c => c.category === 'npcs').length
  }

  return (
    <div className="browse-page">
      <header className="browse-header">
        <button onClick={() => navigate('/')} className="back-btn">
          ← Back
        </button>
        <h1>Character Gallery</h1>
      </header>

      {/* Category Tabs (only for logged-in users) */}
      {isAuthenticated && (
        <div className="category-tabs">
          <button
            className={`category-tab ${activeCategory === 'all' ? 'active' : ''}`}
            onClick={() => setActiveCategory('all')}
          >
            All ({categoryCounts.all})
          </button>
          <button
            className={`category-tab ${activeCategory === 'party' ? 'active' : ''}`}
            onClick={() => setActiveCategory('party')}
          >
            ⚔️ Party ({categoryCounts.party})
          </button>
          <button
            className={`category-tab ${activeCategory === 'enemies' ? 'active' : ''}`}
            onClick={() => setActiveCategory('enemies')}
          >
            💀 Enemies ({categoryCounts.enemies})
          </button>
          <button
            className={`category-tab ${activeCategory === 'npcs' ? 'active' : ''}`}
            onClick={() => setActiveCategory('npcs')}
          >
            👥 NPCs ({categoryCounts.npcs})
          </button>
        </div>
      )}

      <div className="browse-content">
        <div className="characters-grid">
          {filteredCharacters.map((character) => (
            <div
              key={character.id}
              className="character-card-browse"
              onClick={() => navigate(`/character/${character.id}`)}
            >
              <div className="card-icon">{character.icon}</div>
              <h2>{character.name}</h2>
              <p className="card-type">{character.type}</p>
              <p className="card-desc">{character.description}</p>
              <div className="card-stats">
                <span className="stat">HP: {character.hp}</span>
                <span className="stat">AC: {character.ac}</span>
              </div>
              <button className="select-btn">Select Character</button>
            </div>
          ))}

          {/* Coming Soon Cards */}
          <div className="character-card-browse coming-soon">
            <div className="card-icon">🧙</div>
            <h2>More Heroes</h2>
            <p className="card-type">Coming Soon</p>
            <p className="card-desc">New characters are being forged...</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BrowsePage
