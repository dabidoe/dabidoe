import { useState, useRef } from 'react'
import { QRCodeCanvas } from 'qrcode.react'
import html2canvas from 'html2canvas'
import './ShareCharacter.css'

const BUNNY_CDN_URL = import.meta.env.VITE_BUNNY_CDN_URL || 'https://statsheet-cdn.b-cdn.net'

function ShareCharacter({ character, characterId, isOpen, onClose }) {
  const [generating, setGenerating] = useState(false)
  const shareCardRef = useRef(null)

  if (!isOpen) return null

  const characterUrl = `https://m.characterfoundry.io/character/${characterId}`

  // Get image layers from character data
  const getImageLayers = () => {
    // character.imageLayers is an array of image IDs from BunnyCDN
    // e.g., ['characters/base_001.png', 'characters/armor_001.png']
    if (character.imageLayers && Array.isArray(character.imageLayers)) {
      return character.imageLayers.map(layerId => `${BUNNY_CDN_URL}/${layerId}`)
    }
    // Fallback: if no image layers, return empty array
    return []
  }

  const imageLayers = getImageLayers()

  const handleDownload = async () => {
    setGenerating(true)
    try {
      const element = shareCardRef.current
      const canvas = await html2canvas(element, {
        backgroundColor: '#1a1a2e',
        scale: 2,
        logging: false,
        useCORS: true
      })

      // Convert to blob and download
      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.download = `${character.name.toLowerCase()}-character-foundry.png`
        link.href = url
        link.click()
        URL.revokeObjectURL(url)
        setGenerating(false)
      })
    } catch (error) {
      console.error('Error generating image:', error)
      setGenerating(false)
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${character.name} - Character Foundry`,
          text: `Check out ${character.name} on Character Foundry!`,
          url: characterUrl
        })
      } catch (error) {
        console.error('Error sharing:', error)
      }
    } else {
      // Fallback: copy link to clipboard
      navigator.clipboard.writeText(characterUrl)
      alert('Link copied to clipboard!')
    }
  }

  return (
    <div className="share-modal-overlay" onClick={onClose}>
      <div className="share-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="share-modal-close" onClick={onClose}>×</button>

        <h2>Share {character.name}</h2>

        {/* Preview Card */}
        <div className="share-preview">
          <div ref={shareCardRef} className="share-card-image">
            {/* Character Image Layers */}
            <div className="share-image-container">
              {imageLayers.length > 0 ? (
                imageLayers.map((layerUrl, index) => (
                  <img
                    key={index}
                    src={layerUrl}
                    alt={`${character.name} layer ${index + 1}`}
                    className="share-image-layer"
                    crossOrigin="anonymous"
                  />
                ))
              ) : (
                // Fallback: show emoji if no image layers
                <div className="share-image-fallback">
                  <span className="fallback-icon">{character.portrait || '⚔️'}</span>
                </div>
              )}

              {/* QR Code in Lower Right */}
              <div className="share-qr-overlay">
                <div className="qr-container">
                  <QRCodeCanvas
                    value={characterUrl}
                    size={100}
                    level="H"
                    bgColor="#ffffff"
                    fgColor="#000000"
                  />
                  {/* Logo in center of QR code */}
                  <div className="qr-logo">⚔️</div>
                </div>
              </div>

              {/* Top Info Bar */}
              <div className="share-info-bar">
                <h3>{character.name}</h3>
                <div className="share-stats-inline">
                  <span>HP {character.hp.max}</span>
                  <span>AC {character.ac}</span>
                </div>
              </div>

              {/* Watermark */}
              <div className="share-watermark-overlay">
                <span className="watermark-text">characterfoundry.io</span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="share-actions">
          <button
            className="share-btn download-btn"
            onClick={handleDownload}
            disabled={generating}
          >
            {generating ? 'Generating...' : '💾 Download Image'}
          </button>
          <button
            className="share-btn link-btn"
            onClick={handleShare}
          >
            🔗 Share Link
          </button>
        </div>

        <div className="share-link-display">
          <input
            type="text"
            value={characterUrl}
            readOnly
            onClick={(e) => e.target.select()}
          />
        </div>
      </div>
    </div>
  )
}

export default ShareCharacter
