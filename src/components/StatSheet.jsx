import { useRef } from 'react'
import { QRCodeCanvas } from 'qrcode.react'
import html2canvas from 'html2canvas'
import './StatSheet.css'

const BUNNY_CDN_URL = import.meta.env.VITE_BUNNY_CDN_URL || 'https://statsheet-cdn.b-cdn.net'

function StatSheet({ character, characterId, onDownload }) {
  const sheetRef = useRef(null)

  const handleDownload = async () => {
    try {
      const element = sheetRef.current
      const canvas = await html2canvas(element, {
        backgroundColor: '#ffffff',
        scale: 2,
        logging: false,
        useCORS: true
      })

      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.download = `${character.name.toLowerCase()}-stat-sheet.png`
        link.href = url
        link.click()
        URL.revokeObjectURL(url)
        if (onDownload) onDownload()
      })
    } catch (error) {
      console.error('Error generating stat sheet:', error)
    }
  }

  const getModifier = (score) => {
    const mod = Math.floor((score - 10) / 2)
    return mod >= 0 ? `+${mod}` : `${mod}`
  }

  const getImageUrl = (layerId) => {
    return layerId ? `${BUNNY_CDN_URL}/${layerId}` : null
  }

  return (
    <div className="stat-sheet-container">
      <button className="download-sheet-btn" onClick={handleDownload}>
        💾 Download Stat Sheet
      </button>

      <div ref={sheetRef} className="stat-sheet">
        {/* Header with Character Image */}
        <div className="sheet-header">
          <div className="sheet-portrait">
            {character.imageLayers && character.imageLayers.length > 0 ? (
              character.imageLayers.map((layerId, index) => (
                <img
                  key={index}
                  src={getImageUrl(layerId)}
                  alt={`${character.name} layer ${index + 1}`}
                  className="sheet-portrait-layer"
                  crossOrigin="anonymous"
                />
              ))
            ) : (
              <div className="sheet-portrait-fallback">
                {character.portrait || '⚔️'}
              </div>
            )}
          </div>
          <div className="sheet-title">
            <h1>{character.name}</h1>
            <p className="sheet-class">{character.class || 'Adventurer'} • Level {character.level || 1}</p>
            <p className="sheet-race">{character.race || 'Human'}</p>
          </div>
        </div>

        {/* Primary Stats */}
        <div className="sheet-primary-stats">
          <div className="stat-box-large hp-box">
            <div className="stat-label">Hit Points</div>
            <div className="stat-value-large">{character.hp.max}</div>
          </div>
          <div className="stat-box-large ac-box">
            <div className="stat-label">Armor Class</div>
            <div className="stat-value-large">{character.ac}</div>
          </div>
          <div className="stat-box-large speed-box">
            <div className="stat-label">Speed</div>
            <div className="stat-value-large">{character.speed || 30} ft</div>
          </div>
        </div>

        {/* Ability Scores */}
        <div className="sheet-section">
          <h2 className="section-title">Ability Scores</h2>
          <div className="ability-scores">
            {['str', 'dex', 'con', 'int', 'wis', 'cha'].map((ability) => (
              <div key={ability} className="ability-score-box">
                <div className="ability-name">{ability.toUpperCase()}</div>
                <div className="ability-score">{character.stats?.[ability] || 10}</div>
                <div className="ability-modifier">{getModifier(character.stats?.[ability] || 10)}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Proficiencies & Skills */}
        {character.proficiencies && character.proficiencies.length > 0 && (
          <div className="sheet-section">
            <h2 className="section-title">Proficiencies</h2>
            <div className="proficiency-list">
              {character.proficiencies.map((prof, index) => (
                <span key={index} className="proficiency-tag">{prof}</span>
              ))}
            </div>
          </div>
        )}

        {/* Combat Abilities */}
        {character.abilities && character.abilities.filter(a => a.category === 'attack').length > 0 && (
          <div className="sheet-section">
            <h2 className="section-title">⚔️ Attacks & Actions</h2>
            <div className="ability-list">
              {character.abilities.filter(a => a.category === 'attack').map((ability, index) => (
                <div key={index} className="ability-item">
                  <div className="ability-icon-small">
                    {ability.details?.iconLayers?.[0]?.[0] || ability.icon || '⚔️'}
                  </div>
                  <div className="ability-details">
                    <strong>{ability.name}</strong>
                    <p>{ability.details?.shortDescription || 'No description'}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Spells */}
        {character.abilities && character.abilities.filter(a => a.category === 'spell').length > 0 && (
          <div className="sheet-section">
            <h2 className="section-title">✨ Spells & Magic</h2>
            <div className="ability-list">
              {character.abilities.filter(a => a.category === 'spell').map((spell, index) => (
                <div key={index} className="ability-item">
                  <div className="ability-icon-small">
                    {spell.details?.iconLayers?.[0]?.[0] || spell.icon || '✨'}
                  </div>
                  <div className="ability-details">
                    <strong>{spell.name}</strong>
                    {spell.details?.level && <span className="spell-level"> (Level {spell.details.level})</span>}
                    <p>{spell.details?.shortDescription || 'No description'}</p>
                    {spell.details?.school && <span className="spell-school">{spell.details.school}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Equipment */}
        {character.items && character.items.length > 0 && (
          <div className="sheet-section">
            <h2 className="section-title">🎒 Equipment</h2>
            <div className="equipment-grid">
              {character.items.map((item, index) => (
                <div key={index} className="equipment-item">
                  <span className="equipment-icon">{item.icon || '📦'}</span>
                  <span className="equipment-name">{item.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* QR Code Footer */}
        <div className="sheet-footer">
          <div className="sheet-qr">
            <QRCodeCanvas
              value={`https://m.characterfoundry.io/character/${characterId}`}
              size={80}
              level="H"
              bgColor="#ffffff"
              fgColor="#000000"
            />
          </div>
          <div className="sheet-footer-text">
            <p><strong>characterfoundry.io</strong></p>
            <p className="sheet-footer-small">Scan to view character</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StatSheet
