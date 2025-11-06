import { useEffect, useState } from 'react'
import './LoadingScreen.css'

function LoadingScreen({ onLoadComplete }) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          setTimeout(() => onLoadComplete(), 300)
          return 100
        }
        return prev + 10
      })
    }, 200)

    return () => clearInterval(interval)
  }, [onLoadComplete])

  return (
    <div className="loading-screen">
      <div className="loading-content">
        <div className="loading-icon">
          <span className="forge-icon">⚔️</span>
          <div className="loading-ring"></div>
        </div>
        <h1 className="loading-title">Character Foundry</h1>
        <p className="loading-subtitle">Forging Your Adventure</p>

        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <p className="loading-percentage">{progress}%</p>
      </div>
    </div>
  )
}

export default LoadingScreen
