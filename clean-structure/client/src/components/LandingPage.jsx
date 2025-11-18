import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './LandingPage.css'

function LandingPage() {
  const navigate = useNavigate()
  const [showInfo, setShowInfo] = useState(false)

  const handleCreateCharacter = () => {
    navigate('/create')
  }

  const handleBrowse = () => {
    navigate('/browse')
  }

  // Featured characters data
  const featuredCharacters = [
    {
      id: 'burlon',
      name: 'Burlon Throatchoppa',
      subtitle: 'Half-Orc Hunter',
      level: 20,
      class: 'Ranger',
      gradient: 'linear-gradient(135deg, #1a4d2e 0%, #0f2920 100%)'
    },
    {
      id: 'achilles',
      name: 'Achilles',
      subtitle: 'Legendary Warrior',
      level: 15,
      class: 'Fighter',
      gradient: 'linear-gradient(135deg, #8b4513 0%, #4a2511 100%)'
    },
    {
      id: 'mordecai',
      name: 'Mordecai the Arcane',
      subtitle: 'High Elf Archmage',
      level: 20,
      class: 'Wizard',
      gradient: 'linear-gradient(135deg, #4a148c 0%, #1a0033 100%)'
    },
    {
      id: 'shadowmere',
      name: 'Shadowmere',
      subtitle: 'Halfling Assassin',
      level: 20,
      class: 'Rogue',
      gradient: 'linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%)'
    }
  ]

  return (
    <div className="landing-page">
      {/* Animated background elements */}
      <div className="bg-ornament ornament-1"></div>
      <div className="bg-ornament ornament-2"></div>
      <div className="bg-ornament ornament-3"></div>

      <header className="landing-header">
        <div className="logo">
          <div className="logo-icon-modern">
            <div className="shield-shape"></div>
            <div className="sword-shape"></div>
          </div>
          <div className="logo-text">
            <h1>CHARACTER FOUNDRY</h1>
            <div className="logo-line"></div>
          </div>
        </div>
        <p className="tagline">FORGE LEGENDARY HEROES</p>
      </header>

      <main className="landing-main">
        {/* Create Character Section */}
        <section className="create-section">
          <div className="section-badge">NEW</div>
          <h2 className="section-title">Create Your Hero</h2>
          <p className="section-desc">Transform your imagination into living, breathing D&D characters powered by advanced AI</p>
          <button onClick={handleCreateCharacter} className="new-character-btn">
            <span className="btn-text">Begin Creation</span>
            <div className="btn-shine"></div>
          </button>
        </section>

        {/* Browse Section with Character Grid */}
        <section className="browse-section">
          <h2 className="section-title">Featured Characters</h2>
          <p className="section-desc">Explore our gallery of pre-made heroes ready for your campaign</p>

          <div className="character-grid">
            {featuredCharacters.map(char => (
              <div
                key={char.id}
                className="character-card-modern"
                onClick={() => navigate(`/character/${char.id}`)}
                style={{ '--card-gradient': char.gradient }}
              >
                <div className="card-glow"></div>
                <div className="card-content">
                  <div className="char-level">Lvl {char.level}</div>
                  <h3 className="char-name">{char.name}</h3>
                  <p className="char-subtitle">{char.subtitle}</p>
                  <div className="char-class">{char.class}</div>
                  <div className="card-arrow">→</div>
                </div>
              </div>
            ))}
          </div>

          <button onClick={handleBrowse} className="browse-btn">
            <span>View Full Gallery</span>
          </button>
        </section>

        {/* Features Section */}
        <section className="features-section">
          <h2 className="section-title">Powered by AI</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <div className="icon-brain"></div>
              </div>
              <h3>Intelligent Personalities</h3>
              <p>Each character comes alive with unique behaviors, dialogue, and decision-making</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <div className="icon-dice"></div>
              </div>
              <h3>Complete D&D 5e Rules</h3>
              <p>Full implementation of spells, abilities, combat mechanics, and progression</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <div className="icon-chat"></div>
              </div>
              <h3>Interactive Dialogue</h3>
              <p>Engage in dynamic conversations that adapt to your character's personality</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <div className="icon-stats"></div>
              </div>
              <h3>Real-time Stats</h3>
              <p>Track HP, spells, equipment, and abilities with an intuitive interface</p>
            </div>
          </div>
        </section>

        {/* More Info Toggle */}
        <section className="info-section">
          <button
            onClick={() => setShowInfo(!showInfo)}
            className="info-toggle"
          >
            {showInfo ? 'Hide Details' : 'Learn More'}
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
                <li>AI-generated character personalities and behaviors</li>
                <li>Interactive dialogue systems with natural responses</li>
                <li>Complete D&D 5e stats, spells, and abilities</li>
                <li>Rich character backgrounds and evolving stories</li>
                <li>Real-time combat and skill check mechanics</li>
              </ul>

              <h3>How It Works</h3>
              <ol>
                <li><strong>Create:</strong> Describe your character using natural language</li>
                <li><strong>Customize:</strong> Fine-tune stats, abilities, and personality traits</li>
                <li><strong>Interact:</strong> Chat with your character and explore their world</li>
                <li><strong>Adventure:</strong> Use full D&D mechanics in your campaigns</li>
              </ol>

              <div className="info-footer">
                <p>Powered by Advanced AI • Built for D&D 5e</p>
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
