import { useState } from 'react'
import StatSheet from './StatSheet'
import './CharacterStats.css'

const BUNNY_CDN_URL = import.meta.env.VITE_BUNNY_CDN_URL || 'https://statsheet-cdn.b-cdn.net'

function CharacterStats({ character, characterId, isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('abilities')
  const [showStatSheet, setShowStatSheet] = useState(false)

  if (!isOpen) return null

  // Helper to get image URL from BunnyCDN
  const getImageUrl = (serverId) => {
    if (!serverId) return null
    return `${BUNNY_CDN_URL}/${serverId}`
  }

  // Group abilities by category
  const groupedAbilities = {
    attacks: character.abilities?.filter(a => a.category === 'attack') || [],
    spells: character.abilities?.filter(a => a.category === 'spell') || [],
    social: character.abilities?.filter(a => a.category === 'social') || [],
    items: character.items || [],
    weapons: character.weapons || []
  }

  const renderAbilityCard = (ability) => {
    const imageUrl = ability.imageId ? getImageUrl(ability.imageId) : null

    return (
      <div key={ability.abilityId || ability.id} className="stat-item-card">
        <div className="stat-item-icon">
          {imageUrl ? (
            <img src={imageUrl} alt={ability.name} onError={(e) => {
              e.target.style.display = 'none'
              e.target.nextSibling.style.display = 'flex'
            }} />
          ) : null}
          <div className="stat-item-icon-fallback" style={{ display: imageUrl ? 'none' : 'flex' }}>
            {ability.details?.iconLayers?.[0]?.[0] || ability.icon || '⚔️'}
          </div>
        </div>
        <div className="stat-item-info">
          <h4>{ability.name || ability.details?.name}</h4>
          <p className="stat-item-desc">
            {ability.details?.shortDescription || ability.description || 'No description'}
          </p>
          {ability.details?.school && (
            <span className="stat-item-badge">{ability.details.school}</span>
          )}
          {ability.details?.level && (
            <span className="stat-item-badge">Level {ability.details.level}</span>
          )}
        </div>
      </div>
    )
  }

  const renderItemCard = (item) => {
    const imageUrl = item.imageId ? getImageUrl(item.imageId) : null

    return (
      <div key={item.id} className="stat-item-card">
        <div className="stat-item-icon">
          {imageUrl ? (
            <img src={imageUrl} alt={item.name} onError={(e) => {
              e.target.style.display = 'none'
              e.target.nextSibling.style.display = 'flex'
            }} />
          ) : null}
          <div className="stat-item-icon-fallback" style={{ display: imageUrl ? 'none' : 'flex' }}>
            {item.icon || '🎒'}
          </div>
        </div>
        <div className="stat-item-info">
          <h4>{item.name}</h4>
          <p className="stat-item-desc">{item.description || 'No description'}</p>
          {item.rarity && <span className="stat-item-badge">{item.rarity}</span>}
          {item.type && <span className="stat-item-badge">{item.type}</span>}
        </div>
      </div>
    )
  }

  return (
    <div className="stats-modal-overlay" onClick={onClose}>
      <div className="stats-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="stats-modal-close" onClick={onClose}>×</button>

        <h2>{character.name} - Stats & Abilities</h2>

        {/* Toggle between stats view and sheet view */}
        <div className="stats-view-toggle">
          <button
            className={`view-toggle-btn ${!showStatSheet ? 'active' : ''}`}
            onClick={() => setShowStatSheet(false)}
          >
            📊 Stats View
          </button>
          <button
            className={`view-toggle-btn ${showStatSheet ? 'active' : ''}`}
            onClick={() => setShowStatSheet(true)}
          >
            📄 Stat Sheet
          </button>
        </div>

        {showStatSheet ? (
          <StatSheet character={character} characterId={characterId} />
        ) : (
          <>

        {/* Character Basic Stats */}
        <div className="basic-stats">
          <div className="stat-box">
            <span className="stat-label">HP</span>
            <span className="stat-value">{character.hp.max}</span>
          </div>
          <div className="stat-box">
            <span className="stat-label">AC</span>
            <span className="stat-value">{character.ac}</span>
          </div>
          <div className="stat-box">
            <span className="stat-label">STR</span>
            <span className="stat-value">{character.stats?.str || '—'}</span>
          </div>
          <div className="stat-box">
            <span className="stat-label">DEX</span>
            <span className="stat-value">{character.stats?.dex || '—'}</span>
          </div>
          <div className="stat-box">
            <span className="stat-label">CON</span>
            <span className="stat-value">{character.stats?.con || '—'}</span>
          </div>
          <div className="stat-box">
            <span className="stat-label">INT</span>
            <span className="stat-value">{character.stats?.int || '—'}</span>
          </div>
          <div className="stat-box">
            <span className="stat-label">WIS</span>
            <span className="stat-value">{character.stats?.wis || '—'}</span>
          </div>
          <div className="stat-box">
            <span className="stat-label">CHA</span>
            <span className="stat-value">{character.stats?.cha || '—'}</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="stats-tabs">
          <button
            className={`stats-tab ${activeTab === 'abilities' ? 'active' : ''}`}
            onClick={() => setActiveTab('abilities')}
          >
            Abilities ({groupedAbilities.attacks.length + groupedAbilities.spells.length + groupedAbilities.social.length})
          </button>
          <button
            className={`stats-tab ${activeTab === 'items' ? 'active' : ''}`}
            onClick={() => setActiveTab('items')}
          >
            Items ({groupedAbilities.items.length})
          </button>
          <button
            className={`stats-tab ${activeTab === 'weapons' ? 'active' : ''}`}
            onClick={() => setActiveTab('weapons')}
          >
            Weapons ({groupedAbilities.weapons.length})
          </button>
        </div>

        {/* Content */}
        <div className="stats-content">
          {activeTab === 'abilities' && (
            <>
              {groupedAbilities.attacks.length > 0 && (
                <>
                  <h3 className="section-title">⚔️ Attacks</h3>
                  <div className="stat-items-grid">
                    {groupedAbilities.attacks.map(renderAbilityCard)}
                  </div>
                </>
              )}

              {groupedAbilities.spells.length > 0 && (
                <>
                  <h3 className="section-title">✨ Spells</h3>
                  <div className="stat-items-grid">
                    {groupedAbilities.spells.map(renderAbilityCard)}
                  </div>
                </>
              )}

              {groupedAbilities.social.length > 0 && (
                <>
                  <h3 className="section-title">💬 Social</h3>
                  <div className="stat-items-grid">
                    {groupedAbilities.social.map(renderAbilityCard)}
                  </div>
                </>
              )}

              {groupedAbilities.attacks.length === 0 && groupedAbilities.spells.length === 0 && groupedAbilities.social.length === 0 && (
                <div className="empty-state">No abilities found</div>
              )}
            </>
          )}

          {activeTab === 'items' && (
            <>
              {groupedAbilities.items.length > 0 ? (
                <div className="stat-items-grid">
                  {groupedAbilities.items.map(renderItemCard)}
                </div>
              ) : (
                <div className="empty-state">No items found</div>
              )}
            </>
          )}

          {activeTab === 'weapons' && (
            <>
              {groupedAbilities.weapons.length > 0 ? (
                <div className="stat-items-grid">
                  {groupedAbilities.weapons.map(renderItemCard)}
                </div>
              ) : (
                <div className="empty-state">No weapons found</div>
              )}
            </>
          )}
        </div>
        </>
        )}
      </div>
    </div>
  )
}

export default CharacterStats
