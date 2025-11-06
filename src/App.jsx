import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import ErrorBoundary from './components/ErrorBoundary'
import LoadingScreen from './components/LoadingScreen'
import LandingPage from './components/LandingPage'
import BrowsePage from './components/BrowsePage'
import CharacterCard from './components/CharacterCard'
import './App.css'

function App() {
  const [loading, setLoading] = useState(true)

  const handleLoadComplete = () => {
    setLoading(false)
  }

  if (loading) {
    return <LoadingScreen onLoadComplete={handleLoadComplete} />
  }

  return (
    <ErrorBoundary>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/browse" element={<BrowsePage />} />
            <Route path="/character/:characterId" element={<CharacterCard />} />
          </Routes>
        </div>
      </Router>
    </ErrorBoundary>
  )
}

export default App
