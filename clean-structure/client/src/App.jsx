import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import ErrorBoundary from './components/ErrorBoundary'
import LoadingScreen from './components/LoadingScreen'
import LandingPage from './components/LandingPage'
import BrowsePage from './components/BrowsePage'
import CharacterCard from './components/CharacterCard'
import CharacterCreation from './components/CharacterCreation'
import CharacterPreview, { CharacterSheet } from './components/CharacterPreview'
import AdventurePicker from './components/AdventurePicker'
import SimpleAdventurePlayer from './components/SimpleAdventurePlayer'
import './App.css'

console.log('🎨 App.jsx loading...')
console.log('✅ All components imported')

function App() {
  console.log('🎨 App component rendering...')
  const [loading, setLoading] = useState(false)  // Skip loading screen for now

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
            <Route path="/create" element={<CharacterCreation />} />
            <Route path="/character-preview" element={<CharacterPreview />} />
            <Route path="/character-sheet" element={<CharacterSheet />} />
            <Route path="/character/:characterId" element={<CharacterCard />} />
            <Route path="/adventures" element={<AdventurePicker />} />
            <Route path="/adventure/:adventureId" element={<SimpleAdventurePlayer />} />
          </Routes>
        </div>
      </Router>
    </ErrorBoundary>
  )
}

export default App
