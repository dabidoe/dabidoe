import { useNavigate } from 'react-router-dom'
import { simpleAdventures } from '../data/simple-adventures'
import './AdventurePicker.css'

function AdventurePicker() {
  const navigate = useNavigate()

  const handleSelectAdventure = (adventureId) => {
    navigate(`/adventure/${adventureId}`)
  }

  const getDifficultyColor = (difficulty) => {
    switch (difficulty.toLowerCase()) {
      case 'easy':
        return '#4caf50'
      case 'medium':
        return '#ff9800'
      case 'hard':
        return '#f44336'
      default:
        return '#888'
    }
  }

  return (
    <div className="adventure-picker">
      <header className="picker-header">
        <button className="back-btn" onClick={() => navigate('/')}>
          ← Back to Home
        </button>
        <div className="header-content">
          <div className="beta-badge-small">BETA</div>
          <h1>Solo Adventures</h1>
          <p className="subtitle">Choose your text-based adventure</p>
        </div>
      </header>

      <main className="picker-main">
        <div className="adventures-grid">
          {simpleAdventures.map(adventure => (
            <div
              key={adventure.id}
              className="adventure-picker-card"
              onClick={() => handleSelectAdventure(adventure.id)}
            >
              <div className="card-header">
                <h2>{adventure.title}</h2>
                <span
                  className="difficulty-badge"
                  style={{ borderColor: getDifficultyColor(adventure.difficulty), color: getDifficultyColor(adventure.difficulty) }}
                >
                  {adventure.difficulty}
                </span>
              </div>

              <p className="adventure-description">{adventure.description}</p>

              <div className="adventure-meta">
                <div className="meta-item">
                  <span className="meta-icon">⏱️</span>
                  <span>{adventure.estimatedTime}</span>
                </div>
                <div className="meta-item">
                  <span className="meta-icon">🎭</span>
                  <span>{adventure.theme}</span>
                </div>
              </div>

              <div className="card-footer">
                <button className="start-btn">
                  <span>Begin Adventure</span>
                  <span className="arrow">→</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="info-box">
          <h3>⚠️ Beta Feature</h3>
          <p>
            These are simple text-based adventures with dice rolling mechanics.
            Your choices matter, and skill checks use your character's stats!
          </p>
          <p>
            <strong>No AI image generation</strong> - Pure text adventures to ensure stability.
          </p>
        </div>
      </main>
    </div>
  )
}

export default AdventurePicker
