import { useNavigate } from 'react-router-dom'
import './BrowsePage.css'

function BrowsePage() {
  const navigate = useNavigate()

  // Demo characters - will be fetched from API
  const characters = [
    {
      id: 'achilles',
      name: 'Achilles',
      icon: '🛡️',
      type: 'Legendary Warrior',
      description: 'The greatest warrior of ancient Greece',
      hp: 104,
      ac: 18
    },
    // Add more characters as they become available
  ]

  return (
    <div className="browse-page">
      <header className="browse-header">
        <button onClick={() => navigate('/')} className="back-btn">
          ← Back
        </button>
        <h1>Character Gallery</h1>
      </header>

      <div className="browse-content">
        <div className="characters-grid">
          {characters.map((character) => (
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
