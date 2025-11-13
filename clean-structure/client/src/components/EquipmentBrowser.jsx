import { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import itemsData from '../../../data/items-srd.json' with { type: 'json' }
import './EquipmentBrowser.css'

/**
 * EquipmentBrowser Component
 *
 * Modal for browsing and adding equipment/items to character inventory
 */
function EquipmentBrowser({ character, onAddEquipment, onClose }) {
  const [allItems, setAllItems] = useState([])
  const [filteredItems, setFilteredItems] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedItem, setSelectedItem] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    // Load all items
    setAllItems(itemsData)
    setFilteredItems(itemsData)
  }, [])

  useEffect(() => {
    // Filter items by category and search query
    let filtered = allItems

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(i => i.category === selectedCategory)
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(i =>
        i.name.toLowerCase().includes(query) ||
        i.description?.toLowerCase().includes(query)
      )
    }

    setFilteredItems(filtered)
  }, [selectedCategory, searchQuery, allItems])

  // Check if character already has this item
  const hasItem = (itemId) => {
    return character.inventory?.some(i => i.id === itemId)
  }

  const handleAddEquipment = (item) => {
    // Create inventory item
    const inventoryItem = {
      ...item,
      equipped: false,
      quantity: 1
    }
    onAddEquipment(inventoryItem)
  }

  // Group items by category for count display
  const itemCounts = allItems.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + 1
    return acc
  }, {})

  // Get unique categories
  const availableCategories = [...new Set(allItems.map(i => i.category))].sort()

  // Get category icon
  const getCategoryIcon = (category) => {
    const icons = {
      'weapon': '⚔️',
      'armor': '🛡️',
      'shield': '🛡️',
      'potion': '🧪',
      'gear': '🎒',
      'ring': '💍',
      'scroll': '📜',
      'wondrous': '✨'
    }
    return icons[category] || '📦'
  }

  return (
    <div className="equipment-browser-overlay" onClick={onClose}>
      <div className="equipment-browser" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="browser-header">
          <h2>🎒 Equipment & Gear</h2>
          <button className="close-browser" onClick={onClose}>✕</button>
        </div>

        {/* Search Bar */}
        <div className="browser-search">
          <input
            type="text"
            placeholder="Search equipment..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>

        {/* Category Filter */}
        <div className="level-filter">
          <button
            className={`level-btn ${selectedCategory === 'all' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('all')}
          >
            All ({allItems.length})
          </button>
          {availableCategories.map(category => (
            <button
              key={category}
              className={`level-btn ${selectedCategory === category ? 'active' : ''}`}
              onClick={() => setSelectedCategory(category)}
            >
              {getCategoryIcon(category)} {category.charAt(0).toUpperCase() + category.slice(1)} ({itemCounts[category] || 0})
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="browser-content">
          {/* Item List */}
          <div className="equipment-list-panel">
            <div className="equipment-list-header">
              {filteredItems.length} items
            </div>
            <div className="equipment-list-scroll">
              {filteredItems.map((item, index) => (
                <div
                  key={index}
                  className={`equipment-list-item ${selectedItem?.id === item.id ? 'selected' : ''} ${hasItem(item.id) ? 'owned' : ''}`}
                  onClick={() => setSelectedItem(item)}
                >
                  <div className="equipment-list-icon">{getCategoryIcon(item.category)}</div>
                  <div className="equipment-list-info">
                    <div className="equipment-list-name">
                      {hasItem(item.id) && <span className="owned-badge">✓</span>}
                      {item.name}
                    </div>
                    <div className="equipment-list-category">{item.category}</div>
                  </div>
                </div>
              ))}
              {filteredItems.length === 0 && (
                <div className="no-results">
                  No items found
                </div>
              )}
            </div>
          </div>

          {/* Item Details */}
          <div className="equipment-details-panel">
            {selectedItem ? (
              <>
                <div className="equipment-detail-header">
                  <h3>
                    {getCategoryIcon(selectedItem.category)} {selectedItem.name}
                  </h3>
                  <span className="equipment-detail-category">
                    {selectedItem.category}
                  </span>
                </div>

                <div className="equipment-detail-meta">
                  {/* Weapon Stats */}
                  {selectedItem.weapon && (
                    <>
                      <div className="meta-section">
                        <h4>Weapon Stats</h4>
                        <div className="meta-row">
                          <span className="meta-label">Damage:</span>
                          <span>{selectedItem.weapon.damage} {selectedItem.weapon.damageType}</span>
                        </div>
                        {selectedItem.weapon.range && (
                          <div className="meta-row">
                            <span className="meta-label">Range:</span>
                            <span>{selectedItem.weapon.range}</span>
                          </div>
                        )}
                        {selectedItem.weapon.properties && selectedItem.weapon.properties.length > 0 && (
                          <div className="meta-row">
                            <span className="meta-label">Properties:</span>
                            <span>{selectedItem.weapon.properties.join(', ')}</span>
                          </div>
                        )}
                      </div>
                    </>
                  )}

                  {/* Armor Stats */}
                  {selectedItem.armor && (
                    <>
                      <div className="meta-section">
                        <h4>Armor Stats</h4>
                        <div className="meta-row">
                          <span className="meta-label">AC:</span>
                          <span>{selectedItem.armor.ac}</span>
                        </div>
                        {selectedItem.armor.type && (
                          <div className="meta-row">
                            <span className="meta-label">Type:</span>
                            <span>{selectedItem.armor.type}</span>
                          </div>
                        )}
                        {selectedItem.armor.stealthDisadvantage && (
                          <div className="meta-row">
                            <span className="meta-label">Stealth:</span>
                            <span style={{color: '#e74c3c'}}>Disadvantage</span>
                          </div>
                        )}
                      </div>
                    </>
                  )}

                  {/* Cost & Weight */}
                  <div className="meta-section">
                    <h4>General</h4>
                    {selectedItem.cost && (
                      <div className="meta-row">
                        <span className="meta-label">Cost:</span>
                        <span>{selectedItem.cost.amount} {selectedItem.cost.unit}</span>
                      </div>
                    )}
                    {selectedItem.weight && (
                      <div className="meta-row">
                        <span className="meta-label">Weight:</span>
                        <span>{selectedItem.weight} lb</span>
                      </div>
                    )}
                    <div className="meta-row">
                      <span className="meta-label">Category:</span>
                      <span style={{textTransform: 'capitalize'}}>{selectedItem.category}</span>
                    </div>
                  </div>
                </div>

                {selectedItem.description && (
                  <div className="equipment-detail-description">
                    <h4>Description</h4>
                    <p>{selectedItem.description}</p>
                  </div>
                )}

                <button
                  className="add-equipment-btn"
                  onClick={() => handleAddEquipment(selectedItem)}
                  disabled={hasItem(selectedItem.id)}
                >
                  {hasItem(selectedItem.id) ? '✓ Already Owned' : '+ Add to Inventory'}
                </button>
              </>
            ) : (
              <div className="no-selection">
                <p>Select an item to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

EquipmentBrowser.propTypes = {
  character: PropTypes.shape({
    inventory: PropTypes.array
  }).isRequired,
  onAddEquipment: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired
}

export default EquipmentBrowser
