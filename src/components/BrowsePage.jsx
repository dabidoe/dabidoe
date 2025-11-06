import { useNavigate } from 'react-router-dom'
import { getDemoCharacterList } from '../data/demo-characters'
import './BrowsePage.css'

function BrowsePage() {
  const navigate = useNavigate()

  // TODO: Replace with API call to fetch characters
  const characters = getDemoCharacterList()

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
              <div className="card-icon">{character.portrait}</div>
              <h2>{character.name}</h2>
              <p className="card-type">{character.title}</p>
              <p className="card-desc">{character.description}</p>
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
