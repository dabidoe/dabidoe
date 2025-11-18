import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAvailableAdventures } from '../data/adventure-trees'
import './LandingPage.css'

function LandingPage() {
  const navigate = useNavigate()
  const [showInfo, setShowInfo] = useState(false)
  const [availableAdventures] = useState(getAvailableAdventures())

  const handleCreateCharacter = () => {
    navigate('/create')
  }

  const handleBrowse = () => {
    navigate('/browse')
  }

  const handleAdventure = (adventureId) => {
    // Navigate to Achilles with adventure mode pre-selected
    navigate(`/character/achilles?mode=adventure&adventure=${adventureId}`)
  }

  return (
    <div className="landing-page">
      <header className="landing-header">
        <div className="logo">
          <span className="logo-icon">⚔️</span>
          <h1>Character Foundry</h1>
        </div>
        <p className="tagline">Forge Your Adventure</p>
      </header>

      <main className="landing-main">
        {/* Create Character Section */}
        <section className="create-section">
          <h2 className="section-title">Create Your Character</h2>
          <p className="section-desc">Bring your character to life with AI-powered creation</p>
          <button onClick={handleCreateCharacter} className="new-character-btn">
            <span className="btn-icon">✨</span>
            New Character
          </button>
        </section>

        {/* Adventures Section */}
        <section className="adventures-section">
          <h2 className="section-title">⚔️ Begin Your Adventure</h2>
          <p className="section-desc">Embark on solo adventures with Achilles, the legendary warrior</p>

          <div className="adventures-grid">
            {availableAdventures.map(adventure => (
              <div
                key={adventure.id}
                className="adventure-card-landing"
                onClick={() => handleAdventure(adventure.id)}
              >
                <div className="adventure-header-landing">
                  <h3>{adventure.title}</h3>
                  <span className={`difficulty-badge ${adventure.difficulty.toLowerCase()}`}>
                    {adventure.difficulty}
                  </span>
                </div>
                <p className="adventure-description-landing">{adventure.description}</p>
                <div className="adventure-meta-landing">
                  <span className="meta-item">⏱️ {adventure.estimatedTime}</span>
                  <span className="meta-item">🛡️ Featuring: Achilles</span>
                </div>
                <div className="adventure-cta">
                  <span className="cta-icon">▶</span>
                  <span className="cta-text">Begin Adventure</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Browse Section */}
        <section className="browse-section">
          <h2 className="section-title">Browse Characters</h2>
          <p className="section-desc">Explore pre-made characters ready for your adventure</p>
          <button onClick={handleBrowse} className="browse-btn">
            <span className="btn-icon">📚</span>
            Browse Gallery
          </button>

          {/* Featured Characters Preview */}
          <div className="featured-preview">
            <div
              className="character-preview-card"
              onClick={() => navigate('/character/achilles')}
            >
              <div className="preview-icon">🛡️</div>
              <h3>Achilles</h3>
              <p>Legendary Warrior</p>
            </div>
            <div className="character-preview-card" onClick={() => alert('More characters coming soon!')}>
              <div className="preview-icon">🧙</div>
              <h3>Coming Soon</h3>
              <p>More Characters</p>
            </div>
          </div>
        </section>

        {/* More Info Toggle */}
        <section className="info-section">
          <button
            onClick={() => setShowInfo(!showInfo)}
            className="info-toggle"
          >
            <span className="btn-icon">ℹ️</span>
            {showInfo ? 'Hide Info' : 'More Info'}
          </button>

          {showInfo && (
            <div className="info-content">
              <h3>About Character Foundry</h3>
              <p>
                Character Foundry is your AI-powered companion for creating
                immersive RPG characters. Whether you're a dungeon master
                preparing for your next session or a player crafting your
                character's backstory, we bring your characters to life with:
              </p>
              <ul>
                <li>AI-generated character personalities</li>
                <li>Interactive dialogue systems</li>
                <li>Dynamic character stats and abilities</li>
                <li>Rich character backgrounds and stories</li>
              </ul>

              <h3>How It Works</h3>
              <ol>
                <li><strong>Create:</strong> Describe your character using natural language</li>
                <li><strong>Interact:</strong> Chat with your character and explore their personality</li>
                <li><strong>Adventure:</strong> Use character abilities in your campaigns</li>
              </ol>

              <div className="info-footer">
                <p>Powered by Advanced AI</p>
              </div>
            </div>
          )}
        </section>
      </main>

      <footer className="landing-footer">
        <p>&copy; 2024 Character Foundry. All rights reserved.</p>
      </footer>
    </div>
  )
}

export default LandingPage
