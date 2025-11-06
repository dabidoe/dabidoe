import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { UserProvider } from './contexts/UserContext'
import LoadingScreen from './components/LoadingScreen'
import LandingPage from './components/LandingPage'
import BrowsePage from './components/BrowsePage'
import CharacterCard from './components/CharacterCard'
import AuthCallback from './components/AuthCallback'
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
    <Router>
      <UserProvider>
        <div className="App">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/browse" element={<BrowsePage />} />
            <Route path="/character/:characterId" element={<CharacterCard />} />
            <Route path="/auth/discord/callback" element={<AuthCallback />} />
          </Routes>
        </div>
      </UserProvider>
    </Router>
  )
}

export default App
