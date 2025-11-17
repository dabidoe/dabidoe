import { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import itemsData from '../../../data/items-srd.json'
import './EquipmentBrowser.css'

// Category definitions
const mainCategories = {
    weapons: {
      label: 'Weapons',
      icon: '⚔️',
      subcategories: {
        all: 'All Weapons',
        swords: 'Swords',
        axes: 'Axes',
        bows: 'Bows',
        daggers: 'Daggers',
        hammers: 'Hammers & Maces',
        polearms: 'Polearms',
        other: 'Other Weapons'
      }
    },
    armor: {
      label: 'Armor',
      icon: '🛡️',
      subcategories: {
        all: 'All Armor',
        light: 'Light Armor',
        medium: 'Medium Armor',
        heavy: 'Heavy Armor',
        shields: 'Shields'
      }
    },
    magic: {
      label: 'Magic Items',
      icon: '✨',
      subcategories: {
        all: 'All Magic Items',
        rings: 'Rings',
        amulets: 'Amulets & Necklaces',
        wands: 'Wands & Staffs',
        scrolls: 'Scrolls',
        wondrous: 'Wondrous Items'
      }
    },
    consumables: {
      label: 'Potions',
      icon: '🧪',
      subcategories: {
        all: 'All Potions',
        healing: 'Healing',
        buff: 'Buffs & Enhancements',
        utility: 'Utility',
        poison: 'Poisons'
      }
    },
    tools: {
      label: 'Tools & Kits',
      icon: '🔧',
      subcategories: {
        all: 'All Tools',
        artisan: 'Artisan Tools',
        gaming: 'Gaming Sets',
        instruments: 'Musical Instruments',
        kits: 'Kits'
      }
    },
    gear: {
      label: 'Gear',
      icon: '🎒',
      subcategories: {
        all: 'All Gear',
        adventuring: 'Adventuring Gear',
        containers: 'Containers',
        clothing: 'Clothing',
        other: 'Other'
      }
    },
    treasure: {
      label: 'Treasure',
      icon: '💎',
      subcategories: {
        all: 'All Treasure',
        gems: 'Gems',
        art: 'Art Objects',
        jewelry: 'Jewelry',
        trinkets: 'Trinkets'
      }
    }
  }

// Available traits/enchantments for weapons
const weaponTraits = [
    { id: 'flaming', name: 'Flaming', icon: '🔥', bonus: '+1d6 fire damage' },
    { id: 'frost', name: 'Frost', icon: '❄️', bonus: '+1d6 cold damage' },
    { id: 'shocking', name: 'Shocking', icon: '⚡', bonus: '+1d6 lightning damage' },
    { id: 'venomous', name: 'Venomous', icon: '☠️', bonus: '+1d6 poison damage' },
    { id: 'keen', name: 'Keen', icon: '🗡️', bonus: 'Critical hits on 19-20' },
    { id: 'vorpal', name: 'Vorpal', icon: '💀', bonus: 'Critical decapitation' },
    { id: 'holy', name: 'Holy', icon: '✨', bonus: '+2d6 radiant vs undead/fiends' },
    { id: 'defending', name: 'Defending', icon: '🛡️', bonus: '+1 AC while wielding' },
    { id: 'returning', name: 'Returning', icon: '🔄', bonus: 'Returns when thrown' },
    { id: 'vicious', name: 'Vicious', icon: '💢', bonus: '+2d6 on critical hit' },
    { id: 'lifestealing', name: 'Lifestealing', icon: '💀', bonus: 'Heal for damage dealt' }
]

// Available traits/enchantments for armor
const armorTraits = [
    { id: 'resistance-fire', name: 'Fire Resistance', icon: '🔥', bonus: 'Resistance to fire damage' },
    { id: 'resistance-cold', name: 'Cold Resistance', icon: '❄️', bonus: 'Resistance to cold damage' },
    { id: 'resistance-lightning', name: 'Lightning Resistance', icon: '⚡', bonus: 'Resistance to lightning damage' },
    { id: 'resistance-poison', name: 'Poison Resistance', icon: '☠️', bonus: 'Resistance to poison damage' },
    { id: 'adamantine', name: 'Adamantine', icon: '💎', bonus: 'Immune to critical hits' },
    { id: 'mithral', name: 'Mithral', icon: '⭐', bonus: 'No stealth disadvantage, no Str requirement' },
    { id: 'glamoured', name: 'Glamoured', icon: '✨', bonus: 'Change appearance as bonus action' },
    { id: 'shadow', name: 'Shadow', icon: '🌑', bonus: 'Advantage on Stealth checks in dim light' },
    { id: 'spellguard', name: 'Spellguard', icon: '🔮', bonus: 'Advantage on saves vs spells' },
    { id: 'absorbing', name: 'Absorbing', icon: '🌀', bonus: 'Absorb spell energy' },
    { id: 'animated', name: 'Animated', icon: '🤖', bonus: 'Armor animates and fights alongside you' }
]

/**
 * EquipmentBrowser Component
 *
 * Modal for browsing and adding equipment/items to character inventory
 */
function EquipmentBrowser({ character, onAddEquipment, onClose }) {
  const [allItems, setAllItems] = useState([])
  const [filteredItems, setFilteredItems] = useState([])
  const [selectedMainCategory, setSelectedMainCategory] = useState('weapons')
  const [selectedSubCategory, setSelectedSubCategory] = useState('all')
  const [selectedItem, setSelectedItem] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')

  // Modifier and enchantment state
  const [selectedModifier, setSelectedModifier] = useState(0) // +0 through +9
  const [selectedTraits, setSelectedTraits] = useState([]) // array of trait names

  useEffect(() => {
    // Load all items
    setAllItems(itemsData)
  }, [])

  useEffect(() => {
    // Reset subcategory when main category changes
    setSelectedSubCategory('all')
    setSelectedItem(null)
  }, [selectedMainCategory])

  useEffect(() => {
    // Reset modifiers and traits when selected item changes
    setSelectedModifier(0)
    setSelectedTraits([])
  }, [selectedItem])

  useEffect(() => {
    // Filter items by category and search query
    let filtered = allItems

    // Filter by main category
    if (selectedMainCategory === 'weapons') {
      filtered = filtered.filter(i => i.category === 'weapon')
    } else if (selectedMainCategory === 'armor') {
      filtered = filtered.filter(i => i.category === 'armor' || i.category === 'shield')
    } else if (selectedMainCategory === 'magic') {
      filtered = filtered.filter(i =>
        i.category === 'ring' || i.category === 'amulet' || i.category === 'wand' ||
        i.category === 'scroll' || i.category === 'wondrous' || i.rarity !== 'common'
      )
    } else if (selectedMainCategory === 'consumables') {
      filtered = filtered.filter(i => i.category === 'potion')
    } else if (selectedMainCategory === 'tools') {
      filtered = filtered.filter(i =>
        i.category === 'tool' || i.name?.toLowerCase().includes('tool') ||
        i.name?.toLowerCase().includes('kit') || i.name?.toLowerCase().includes('instrument')
      )
    } else if (selectedMainCategory === 'gear') {
      filtered = filtered.filter(i =>
        !['weapon', 'armor', 'shield', 'potion', 'ring', 'amulet', 'wand', 'scroll', 'wondrous', 'treasure'].includes(i.category) &&
        !i.name?.toLowerCase().includes('tool') && !i.name?.toLowerCase().includes('kit')
      )
    } else if (selectedMainCategory === 'treasure') {
      filtered = filtered.filter(i =>
        i.category === 'treasure' || i.category === 'gem' || i.name?.toLowerCase().includes('gem') ||
        i.name?.toLowerCase().includes('art') || i.name?.toLowerCase().includes('jewelry')
      )
    }

    // Filter by subcategory
    if (selectedSubCategory !== 'all') {
      filtered = filtered.filter(i => {
        const itemName = i.name.toLowerCase()

        // Weapon subcategories
        if (selectedSubCategory === 'swords') {
          return itemName.includes('sword') || itemName.includes('rapier') || itemName.includes('scimitar')
        } else if (selectedSubCategory === 'axes') {
          return itemName.includes('axe')
        } else if (selectedSubCategory === 'bows') {
          return itemName.includes('bow') || itemName.includes('crossbow')
        } else if (selectedSubCategory === 'daggers') {
          return itemName.includes('dagger') || itemName.includes('knife')
        } else if (selectedSubCategory === 'hammers') {
          return itemName.includes('hammer') || itemName.includes('mace') || itemName.includes('maul') || itemName.includes('club')
        } else if (selectedSubCategory === 'polearms') {
          return itemName.includes('spear') || itemName.includes('pike') || itemName.includes('halberd') || itemName.includes('glaive') || itemName.includes('lance')
        }

        // Armor subcategories
        else if (selectedSubCategory === 'light') {
          return i.armor?.type === 'light'
        } else if (selectedSubCategory === 'medium') {
          return i.armor?.type === 'medium'
        } else if (selectedSubCategory === 'heavy') {
          return i.armor?.type === 'heavy'
        } else if (selectedSubCategory === 'shields') {
          return i.category === 'shield'
        }

        // Magic item subcategories
        else if (selectedSubCategory === 'rings') {
          return i.category === 'ring'
        } else if (selectedSubCategory === 'amulets') {
          return i.category === 'amulet' || itemName.includes('amulet') || itemName.includes('necklace')
        } else if (selectedSubCategory === 'wands') {
          return i.category === 'wand' || itemName.includes('wand') || itemName.includes('staff')
        } else if (selectedSubCategory === 'scrolls') {
          return i.category === 'scroll'
        } else if (selectedSubCategory === 'wondrous') {
          return i.category === 'wondrous'
        }

        // Potion subcategories
        else if (selectedSubCategory === 'healing') {
          return i.category === 'potion' && itemName.includes('healing')
        } else if (selectedSubCategory === 'buff') {
          return i.category === 'potion' && (itemName.includes('strength') || itemName.includes('heroism') || itemName.includes('giant'))
        } else if (selectedSubCategory === 'utility') {
          return i.category === 'potion' && !itemName.includes('healing') && !itemName.includes('poison')
        } else if (selectedSubCategory === 'poison') {
          return i.category === 'potion' && itemName.includes('poison')
        }

        // Tool subcategories
        else if (selectedSubCategory === 'artisan') {
          return itemName.includes("'s tools") || itemName.includes('artisan')
        } else if (selectedSubCategory === 'gaming') {
          return itemName.includes('dice') || itemName.includes('cards') || itemName.includes('gaming')
        } else if (selectedSubCategory === 'instruments') {
          return itemName.includes('lute') || itemName.includes('flute') || itemName.includes('horn') || itemName.includes('instrument')
        } else if (selectedSubCategory === 'kits') {
          return itemName.includes('kit')
        }

        // Gear subcategories
        else if (selectedSubCategory === 'adventuring') {
          return itemName.includes('rope') || itemName.includes('torch') || itemName.includes('ration') || itemName.includes('backpack')
        } else if (selectedSubCategory === 'containers') {
          return itemName.includes('bag') || itemName.includes('pouch') || itemName.includes('chest') || itemName.includes('barrel')
        } else if (selectedSubCategory === 'clothing') {
          return itemName.includes('robe') || itemName.includes('clothes') || itemName.includes('outfit')
        }

        // Treasure subcategories
        else if (selectedSubCategory === 'gems') {
          return i.category === 'gem' || itemName.includes('gem') || itemName.includes('diamond') || itemName.includes('ruby')
        } else if (selectedSubCategory === 'art') {
          return itemName.includes('art') || itemName.includes('painting') || itemName.includes('statue')
        } else if (selectedSubCategory === 'jewelry') {
          return itemName.includes('jewelry') || itemName.includes('crown') || itemName.includes('tiara')
        } else if (selectedSubCategory === 'trinkets') {
          return i.category === 'trinket'
        }

        return true
      })
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(i =>
        i.name.toLowerCase().includes(query) ||
        i.description?.toLowerCase().includes(query)
      )
    }

    setFilteredItems(filtered)
  }, [selectedMainCategory, selectedSubCategory, searchQuery, allItems])

  // Check if character already has this item
  const hasItem = (itemId) => {
    return character.inventory?.some(i => i.id === itemId)
  }

  // Get available traits for an item based on its type
  const getAvailableTraits = (item) => {
    if (!item) return []

    // Check if it's a weapon
    if (item.category === 'weapon') {
      return weaponTraits
    }

    // Check if it's armor or shield
    if (item.category === 'armor' || item.category === 'shield') {
      return armorTraits
    }

    // No traits for other items
    return []
  }

  // Toggle trait selection
  const toggleTrait = (traitId) => {
    setSelectedTraits(prev =>
      prev.includes(traitId)
        ? prev.filter(t => t !== traitId)
        : [...prev, traitId]
    )
  }

  // Apply modifiers and traits to item
  const applyEnhancements = (item) => {
    let enhancedItem = { ...item }
    let namePrefix = ''
    let bonuses = []

    // Apply modifier
    if (selectedModifier > 0) {
      namePrefix = `+${selectedModifier} `
      enhancedItem.modifier = selectedModifier

      // Apply to weapon
      if (enhancedItem.weapon) {
        enhancedItem.weapon = {
          ...enhancedItem.weapon,
          attackBonus: selectedModifier,
          damageBonus: selectedModifier
        }
      }

      // Apply to armor
      if (enhancedItem.armor) {
        enhancedItem.armor = {
          ...enhancedItem.armor,
          ac: enhancedItem.armor.ac + selectedModifier
        }
      }

      // Adjust value and rarity
      enhancedItem.value = (enhancedItem.value || 0) * (1 + selectedModifier * 2)
      if (selectedModifier >= 1 && enhancedItem.rarity === 'common') enhancedItem.rarity = 'uncommon'
      if (selectedModifier >= 3 && enhancedItem.rarity === 'uncommon') enhancedItem.rarity = 'rare'
      if (selectedModifier >= 5) enhancedItem.rarity = 'very-rare'
      if (selectedModifier >= 7) enhancedItem.rarity = 'legendary'
    }

    // Apply traits
    if (selectedTraits.length > 0) {
      const availableTraits = getAvailableTraits(item)
      const traitObjects = selectedTraits.map(traitId =>
        availableTraits.find(t => t.id === traitId)
      ).filter(Boolean)

      enhancedItem.traits = traitObjects
      enhancedItem.magic = {
        effects: traitObjects.map(t => ({
          name: t.name,
          description: t.bonus
        }))
      }

      // Add trait names to item name
      const traitNames = traitObjects.map(t => t.name).join(', ')
      namePrefix += traitNames + ' '

      // Increase value based on traits
      enhancedItem.value = (enhancedItem.value || 0) * (1 + selectedTraits.length)

      // Upgrade rarity
      if (selectedTraits.length >= 1 && enhancedItem.rarity === 'common') enhancedItem.rarity = 'uncommon'
      if (selectedTraits.length >= 2) enhancedItem.rarity = 'rare'
      if (selectedTraits.length >= 3) enhancedItem.rarity = 'very-rare'
    }

    // Update item name
    if (namePrefix) {
      enhancedItem.name = namePrefix + enhancedItem.name
    }

    // Mark as requiring attunement if enhanced
    if (selectedModifier >= 3 || selectedTraits.length >= 2) {
      enhancedItem.requiresAttunement = true
    }

    return enhancedItem
  }

  const handleAddEquipment = (item) => {
    // Apply enhancements
    const enhancedItem = applyEnhancements(item)

    // Create inventory item
    const inventoryItem = {
      ...enhancedItem,
      id: `${item.id}-${Date.now()}`, // Unique ID for enhanced items
      equipped: false,
      quantity: 1
    }

    onAddEquipment(inventoryItem)

    // Reset modifiers and traits
    setSelectedModifier(0)
    setSelectedTraits([])
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
      'scroll': '📜',
      'wand': '🪄',
      'ring': '💍',
      'amulet': '📿',
      'wondrous': '✨',
      'tool': '🔧',
      'gear': '🎒',
      'treasure': '💎',
      'gem': '💎',
      'trinket': '🎲',
      'clothing': '👔',
      'container': '🎒'
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

        {/* Main Layout with Sidebar */}
        <div style={{ display: 'flex', gap: '16px', height: 'calc(100% - 60px)' }}>
          {/* Left Sidebar - Main Categories */}
          <div style={{
            width: '180px',
            background: 'rgba(0,0,0,0.3)',
            borderRadius: '8px',
            padding: '12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            <div style={{
              fontSize: '11px',
              fontWeight: '600',
              color: 'rgba(255,255,255,0.5)',
              textTransform: 'uppercase',
              marginBottom: '4px'
            }}>
              Categories
            </div>
            {Object.entries(mainCategories).map(([key, cat]) => (
              <button
                key={key}
                onClick={() => setSelectedMainCategory(key)}
                style={{
                  padding: '10px 12px',
                  background: selectedMainCategory === key ? 'rgba(212, 175, 55, 0.3)' : 'rgba(0,0,0,0.3)',
                  border: selectedMainCategory === key ? '2px solid rgba(212, 175, 55, 0.6)' : '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '6px',
                  color: selectedMainCategory === key ? '#d4af37' : '#fff',
                  fontSize: '13px',
                  fontWeight: selectedMainCategory === key ? '600' : '400',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
                onMouseEnter={(e) => {
                  if (selectedMainCategory !== key) {
                    e.target.style.borderColor = 'rgba(255,255,255,0.3)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedMainCategory !== key) {
                    e.target.style.borderColor = 'rgba(255,255,255,0.1)'
                  }
                }}
              >
                <span style={{ fontSize: '18px' }}>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>

          {/* Main Content Area */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
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

            {/* Subcategory Filter */}
            <div style={{
              display: 'flex',
              gap: '8px',
              flexWrap: 'wrap',
              alignItems: 'center'
            }}>
              {Object.entries(mainCategories[selectedMainCategory].subcategories).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setSelectedSubCategory(key)}
                  style={{
                    padding: '6px 12px',
                    background: selectedSubCategory === key ? 'rgba(100, 150, 255, 0.3)' : 'rgba(0,0,0,0.3)',
                    border: selectedSubCategory === key ? '1px solid rgba(100, 150, 255, 0.6)' : '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '6px',
                    color: selectedSubCategory === key ? '#6496ff' : 'rgba(255,255,255,0.8)',
                    fontSize: '12px',
                    fontWeight: selectedSubCategory === key ? '600' : '400',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (selectedSubCategory !== key) {
                      e.target.style.borderColor = 'rgba(255,255,255,0.4)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedSubCategory !== key) {
                      e.target.style.borderColor = 'rgba(255,255,255,0.2)'
                    }
                  }}
                >
                  {label}
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

                {/* Item Image */}
                {selectedItem.image && (
                  <div style={{
                    width: '100%',
                    height: '200px',
                    background: 'rgba(0,0,0,0.3)',
                    borderRadius: '8px',
                    marginBottom: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    border: '1px solid rgba(255,255,255,0.1)'
                  }}>
                    <img
                      src={selectedItem.image}
                      alt={selectedItem.name}
                      style={{
                        maxWidth: '100%',
                        maxHeight: '100%',
                        objectFit: 'contain'
                      }}
                      onError={(e) => {
                        e.target.style.display = 'none'
                      }}
                    />
                  </div>
                )}

                {/* Placeholder for image if no image exists */}
                {!selectedItem.image && (
                  <div style={{
                    width: '100%',
                    height: '200px',
                    background: 'rgba(0,0,0,0.2)',
                    borderRadius: '8px',
                    marginBottom: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px dashed rgba(255,255,255,0.1)',
                    gap: '8px'
                  }}>
                    <div style={{ fontSize: '48px', opacity: 0.3 }}>
                      {getCategoryIcon(selectedItem.category)}
                    </div>
                    <div style={{
                      fontSize: '11px',
                      color: 'rgba(255,255,255,0.3)',
                      fontStyle: 'italic'
                    }}>
                      No image available
                    </div>
                  </div>
                )}

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

                {/* Enhancements Section */}
                <div style={{
                  background: 'rgba(100, 150, 255, 0.1)',
                  border: '1px solid rgba(100, 150, 255, 0.3)',
                  borderRadius: '8px',
                  padding: '12px',
                  marginTop: '16px'
                }}>
                  <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#6496ff' }}>
                    ✨ Enhancements
                  </h4>

                  {/* Modifier Selector */}
                  <div style={{ marginBottom: '12px' }}>
                    <label style={{
                      display: 'block',
                      fontSize: '12px',
                      color: 'rgba(255,255,255,0.8)',
                      marginBottom: '6px',
                      fontWeight: '600'
                    }}>
                      Modifier (+0 to +9)
                    </label>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                        <button
                          key={num}
                          onClick={() => setSelectedModifier(num)}
                          style={{
                            padding: '6px 12px',
                            background: selectedModifier === num ? 'rgba(212, 175, 55, 0.4)' : 'rgba(0,0,0,0.3)',
                            border: selectedModifier === num ? '2px solid #d4af37' : '1px solid rgba(255,255,255,0.2)',
                            borderRadius: '4px',
                            color: selectedModifier === num ? '#d4af37' : '#fff',
                            fontSize: '12px',
                            fontWeight: selectedModifier === num ? '700' : '400',
                            cursor: 'pointer',
                            minWidth: '36px'
                          }}
                        >
                          {num > 0 ? `+${num}` : '0'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Traits Selector */}
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '12px',
                      color: 'rgba(255,255,255,0.8)',
                      marginBottom: '6px',
                      fontWeight: '600'
                    }}>
                      Magical Traits {selectedItem.category === 'weapon' ? '(Weapon)' : selectedItem.category === 'armor' || selectedItem.category === 'shield' ? '(Armor)' : ''}
                    </label>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {getAvailableTraits(selectedItem).map(trait => (
                        <button
                          key={trait.id}
                          onClick={() => toggleTrait(trait.id)}
                          style={{
                            padding: '6px 10px',
                            background: selectedTraits.includes(trait.id) ? 'rgba(156, 39, 176, 0.4)' : 'rgba(0,0,0,0.3)',
                            border: selectedTraits.includes(trait.id) ? '2px solid #9c27b0' : '1px solid rgba(255,255,255,0.2)',
                            borderRadius: '4px',
                            color: selectedTraits.includes(trait.id) ? '#ce93d8' : 'rgba(255,255,255,0.8)',
                            fontSize: '11px',
                            fontWeight: selectedTraits.includes(trait.id) ? '600' : '400',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                          title={trait.bonus}
                        >
                          <span>{trait.icon}</span>
                          <span>{trait.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Enhancement Preview */}
                  {(selectedModifier > 0 || selectedTraits.length > 0) && (
                    <div style={{
                      marginTop: '12px',
                      padding: '8px',
                      background: 'rgba(0,0,0,0.3)',
                      borderRadius: '4px',
                      fontSize: '11px'
                    }}>
                      <div style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '4px' }}>
                        Preview:
                      </div>
                      <div style={{ color: '#d4af37', fontWeight: '600', fontSize: '13px' }}>
                        {selectedModifier > 0 && `+${selectedModifier} `}
                        {selectedTraits.map(id => getAvailableTraits(selectedItem).find(t => t.id === id)?.name).join(', ')}
                        {selectedTraits.length > 0 && ' '}
                        {selectedItem.name}
                      </div>
                      {selectedModifier > 0 && selectedItem.weapon && (
                        <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '11px', marginTop: '4px' }}>
                          Attack: +{selectedModifier}, Damage: {selectedItem.weapon.damage} + {selectedModifier}
                        </div>
                      )}
                      {selectedModifier > 0 && selectedItem.armor && (
                        <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '11px', marginTop: '4px' }}>
                          AC: {selectedItem.armor.ac + selectedModifier}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <button
                  className="add-equipment-btn"
                  onClick={() => handleAddEquipment(selectedItem)}
                  style={{ marginTop: '12px' }}
                >
                  ✅ Add to Inventory
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
