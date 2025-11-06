import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser } from '../contexts/UserContext'
import LoginModal from './LoginModal'
import UserMenu from './UserMenu'
import './LandingPage.css'

function LandingPage() {
  const navigate = useNavigate()
  const { isAuthenticated, loginAsGuest } = useUser()
  const [prompt, setPrompt] = useState('')
  const [showInfo, setShowInfo] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)

  // Auto-login as guest if not authenticated
  useEffect(() => {
    const autoLoginGuest = async () => {
      if (!isAuthenticated) {
        try {
          await loginAsGuest()
        } catch (error) {
          console.error('Failed to auto-login as guest:', error)
        }
      }
    }

    autoLoginGuest()
  }, [isAuthenticated, loginAsGuest])

  const handleCreateCharacter = async (e) => {
    e.preventDefault()
    if (prompt.trim()) {
      // TODO: Call API to create character from prompt
      // For now, navigate to demo character
      navigate('/character/achilles')
    }
  }

  const handleBrowse = () => {
    // TODO: Navigate to browse page
    navigate('/browse')
  }

  return (
    <div className="landing-page">
      <header className="landing-header">
        <div className="header-top">
          <div className="logo">
            <span className="logo-icon">⚔️</span>
            <h1>Character Foundry</h1>
          </div>
          <div className="header-actions">
            <button
              className="login-trigger-btn"
              onClick={() => setShowLoginModal(true)}
            >
              Sign In
            </button>
            <UserMenu />
          </div>
        </div>
        <p className="tagline">Forge Your Adventure</p>
      </header>

      <main className="landing-main">
        {/* Create with Prompt Section */}
        <section className="prompt-section">
          <h2 className="section-title">Create Your Character</h2>
          <form onSubmit={handleCreateCharacter} className="prompt-form">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe your character... (e.g., 'A brave warrior from ancient Greece with legendary combat skills')"
              className="prompt-input"
              rows="4"
            />
            <button type="submit" className="create-btn" disabled={!prompt.trim()}>
              <span className="btn-icon">✨</span>
              Create Character
            </button>
          </form>
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

      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
    </div>
  )
}

export default LandingPage
