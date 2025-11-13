/**
 * Inventory Manager Component
 * Mobile-first inventory browsing and management for D&D 5e
 */

import { useState } from 'react';
import PropTypes from 'prop-types';
import './InventoryManager.css';

function InventoryManager({ character, onEquipItem, onUnequipItem, onUseItem, onDropItem, onUpdateCharacter }) {
  const [selectedItem, setSelectedItem] = useState(null);
  const [showItemModal, setShowItemModal] = useState(false);
  const [filterCategory, setFilterCategory] = useState('all'); // all, weapons, armor, consumables, gear
  const [sortBy, setSortBy] = useState('name'); // name, weight, value, rarity

  const inventory = character.inventory || [];
  const currency = character.currency || { cp: 0, sp: 0, gp: 0, pp: 0 };

  // Calculate encumbrance
  const totalWeight = inventory.reduce((sum, item) => {
    return sum + (item.weight || 0) * (item.quantity || 1);
  }, 0);

  const str = character.stats?.str || 10;
  const maxWeight = str * 15;
  const encumbrancePercent = (totalWeight / maxWeight) * 100;

  // Get encumbrance status
  const getEncumbranceStatus = () => {
    if (totalWeight <= str * 5) return { label: 'Normal', color: '#4caf50' };
    if (totalWeight <= str * 10) return { label: 'Encumbered', color: '#ff9800' };
    if (totalWeight <= str * 15) return { label: 'Heavily Encumbered', color: '#f44336' };
    return { label: 'Over Max!', color: '#d32f2f' };
  };

  const encumbranceStatus = getEncumbranceStatus();

  // Filter items
  const filteredInventory = filterCategory === 'all'
    ? inventory
    : inventory.filter(item => {
        if (filterCategory === 'weapons') return item.category === 'weapon';
        if (filterCategory === 'armor') return item.category === 'armor' || item.category === 'shield';
        if (filterCategory === 'consumables') return item.category === 'potion' || item.category === 'scroll';
        if (filterCategory === 'gear') return !['weapon', 'armor', 'shield', 'potion', 'scroll'].includes(item.category);
        return true;
      });

  // Sort items
  const sortedInventory = [...filteredInventory].sort((a, b) => {
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    if (sortBy === 'weight') return (b.weight || 0) - (a.weight || 0);
    if (sortBy === 'value') return (b.value || 0) - (a.value || 0);
    if (sortBy === 'rarity') {
      const rarityOrder = { common: 0, uncommon: 1, rare: 2, 'very-rare': 3, legendary: 4, artifact: 5 };
      return (rarityOrder[b.rarity] || 0) - (rarityOrder[a.rarity] || 0);
    }
    return 0;
  });

  // Get item icon
  const getItemIcon = (item) => {
    if (item.image) return item.image;
    if (item.category === 'weapon') return '⚔️';
    if (item.category === 'armor') return '🛡️';
    if (item.category === 'shield') return '🛡️';
    if (item.category === 'potion') return '🧪';
    if (item.category === 'scroll') return '📜';
    if (item.category === 'ring') return '💍';
    if (item.category === 'amulet') return '📿';
    if (item.category === 'treasure') return '💎';
    return '📦';
  };

  // Get rarity color
  const getRarityColor = (rarity) => {
    const colors = {
      common: '#9e9e9e',
      uncommon: '#4caf50',
      rare: '#2196f3',
      'very-rare': '#9c27b0',
      legendary: '#ff9800',
      artifact: '#f44336'
    };
    return colors[rarity] || colors.common;
  };

  // Open item details
  const openItemDetails = (item) => {
    setSelectedItem(item);
    setShowItemModal(true);
  };

  // Close modal
  const closeModal = () => {
    setShowItemModal(false);
    setSelectedItem(null);
  };

  // Equip/Unequip item
  const handleToggleEquip = (item) => {
    if (item.equipped) {
      if (onUnequipItem) {
        onUnequipItem(item);
      }
    } else {
      if (onEquipItem) {
        onEquipItem(item);
      }
    }
    closeModal();
  };

  // Use consumable
  const handleUseItem = (item) => {
    if (onUseItem) {
      onUseItem(item);
    }
    closeModal();
  };

  // Drop item
  const handleDropItem = (item) => {
    if (confirm(`Drop ${item.name}?`)) {
      if (onDropItem) {
        onDropItem(item);
      }
      closeModal();
    }
  };

  // Format currency
  const formatCurrency = () => {
    const parts = [];
    if (currency.pp > 0) parts.push(`${currency.pp} PP`);
    if (currency.gp > 0) parts.push(`${currency.gp} GP`);
    if (currency.sp > 0) parts.push(`${currency.sp} SP`);
    if (currency.cp > 0) parts.push(`${currency.cp} CP`);
    return parts.join(', ') || '0 GP';
  };

  return (
    <div className="inventory-manager">
      {/* Currency Display */}
      <div className="currency-display">
        <div className="currency-icon">💰</div>
        <div className="currency-amount">{formatCurrency()}</div>
      </div>

      {/* Encumbrance Bar */}
      <div className="encumbrance-section">
        <div className="encumbrance-header">
          <span className="encumbrance-label">Carrying Capacity</span>
          <span className="encumbrance-value">
            {totalWeight.toFixed(1)} / {maxWeight} lbs
          </span>
        </div>
        <div className="encumbrance-bar">
          <div
            className="encumbrance-fill"
            style={{
              width: `${Math.min(encumbrancePercent, 100)}%`,
              backgroundColor: encumbranceStatus.color
            }}
          />
        </div>
        <div className="encumbrance-status" style={{ color: encumbranceStatus.color }}>
          {encumbranceStatus.label}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="inventory-filters">
        <button
          className={`filter-tab ${filterCategory === 'all' ? 'active' : ''}`}
          onClick={() => setFilterCategory('all')}
        >
          All
        </button>
        <button
          className={`filter-tab ${filterCategory === 'weapons' ? 'active' : ''}`}
          onClick={() => setFilterCategory('weapons')}
        >
          ⚔️ Weapons
        </button>
        <button
          className={`filter-tab ${filterCategory === 'armor' ? 'active' : ''}`}
          onClick={() => setFilterCategory('armor')}
        >
          🛡️ Armor
        </button>
        <button
          className={`filter-tab ${filterCategory === 'consumables' ? 'active' : ''}`}
          onClick={() => setFilterCategory('consumables')}
        >
          🧪 Consumables
        </button>
        <button
          className={`filter-tab ${filterCategory === 'gear' ? 'active' : ''}`}
          onClick={() => setFilterCategory('gear')}
        >
          📦 Gear
        </button>
      </div>

      {/* Sort Options */}
      <div className="sort-options">
        <label>Sort by:</label>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="name">Name</option>
          <option value="weight">Weight</option>
          <option value="value">Value</option>
          <option value="rarity">Rarity</option>
        </select>
      </div>

      {/* Inventory List */}
      <div className="inventory-list">
        {sortedInventory.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🎒</div>
            <h3>Empty Inventory</h3>
            <p>You don't have any {filterCategory !== 'all' ? filterCategory : 'items'} yet.</p>
          </div>
        ) : (
          sortedInventory.map(item => (
            <button
              key={item.id}
              className={`inventory-item ${item.equipped ? 'equipped' : ''}`}
              onClick={() => openItemDetails(item)}
            >
              <div className="item-icon">{getItemIcon(item)}</div>

              <div className="item-info">
                <div className="item-header">
                  <h4 className="item-name" style={{ color: getRarityColor(item.rarity) }}>
                    {item.name}
                    {item.requiresAttunement && <span className="attunement-icon" title="Requires Attunement">⚡</span>}
                  </h4>
                  {item.equipped && <span className="equipped-badge">Equipped</span>}
                </div>

                <p className="item-details">
                  {item.weapon && <span>⚔️ {item.weapon.damage} {item.weapon.damageType}</span>}
                  {item.armor && <span>🛡️ AC {item.armor.ac}</span>}
                  {item.shield && <span>🛡️ +{item.shield.acBonus} AC</span>}
                  {item.quantity > 1 && <span>×{item.quantity}</span>}
                </p>

                <div className="item-meta">
                  <span className="item-weight">{item.weight ? `${item.weight} lb` : '-'}</span>
                  <span className="item-value">{item.value ? `${item.value} gp` : '-'}</span>
                </div>
              </div>

              <div className="item-arrow">→</div>
            </button>
          ))
        )}
      </div>

      {/* Item Detail Modal */}
      {showItemModal && selectedItem && (
        <div className="item-modal-overlay" onClick={closeModal}>
          <div className="item-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-icon">{getItemIcon(selectedItem)}</span>
              <div>
                <h3 style={{ color: getRarityColor(selectedItem.rarity) }}>{selectedItem.name}</h3>
                <p className="item-rarity">{selectedItem.rarity || 'common'}</p>
              </div>
              <button className="close-btn" onClick={closeModal}>✕</button>
            </div>

            <div className="modal-content">
              {/* Description */}
              <div className="item-description">
                <p>{selectedItem.description}</p>
              </div>

              {/* Stats */}
              <div className="item-stats">
                {selectedItem.weapon && (
                  <>
                    <div className="stat-row">
                      <span className="stat-label">Damage</span>
                      <span className="stat-value">{selectedItem.weapon.damage} {selectedItem.weapon.damageType}</span>
                    </div>
                    {selectedItem.weapon.properties && selectedItem.weapon.properties.length > 0 && (
                      <div className="stat-row">
                        <span className="stat-label">Properties</span>
                        <span className="stat-value">{selectedItem.weapon.properties.join(', ')}</span>
                      </div>
                    )}
                    {selectedItem.weapon.range && (
                      <div className="stat-row">
                        <span className="stat-label">Range</span>
                        <span className="stat-value">{selectedItem.weapon.range}</span>
                      </div>
                    )}
                  </>
                )}

                {selectedItem.armor && (
                  <>
                    <div className="stat-row">
                      <span className="stat-label">Armor Class</span>
                      <span className="stat-value">{selectedItem.armor.ac}</span>
                    </div>
                    <div className="stat-row">
                      <span className="stat-label">Type</span>
                      <span className="stat-value">{selectedItem.armor.type}</span>
                    </div>
                    {selectedItem.armor.stealthDisadvantage && (
                      <div className="stat-row">
                        <span className="stat-label">Stealth</span>
                        <span className="stat-value">Disadvantage</span>
                      </div>
                    )}
                  </>
                )}

                {selectedItem.shield && (
                  <div className="stat-row">
                    <span className="stat-label">AC Bonus</span>
                    <span className="stat-value">+{selectedItem.shield.acBonus}</span>
                  </div>
                )}

                <div className="stat-row">
                  <span className="stat-label">Weight</span>
                  <span className="stat-value">{selectedItem.weight || 0} lb</span>
                </div>

                <div className="stat-row">
                  <span className="stat-label">Value</span>
                  <span className="stat-value">{selectedItem.value || 0} gp</span>
                </div>

                {selectedItem.quantity > 1 && (
                  <div className="stat-row">
                    <span className="stat-label">Quantity</span>
                    <span className="stat-value">×{selectedItem.quantity}</span>
                  </div>
                )}
              </div>

              {/* Magic Properties */}
              {selectedItem.magic?.effects && selectedItem.magic.effects.length > 0 && (
                <div className="magic-effects">
                  <h4>✨ Magic Properties</h4>
                  <ul>
                    {selectedItem.magic.effects.map((effect, i) => (
                      <li key={i}>
                        <strong>{effect.name}:</strong> {effect.description}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Attunement */}
              {selectedItem.requiresAttunement && (
                <div className="attunement-notice">
                  ⚡ Requires Attunement
                  {selectedItem.attuned && <span className="attuned-badge">Attuned</span>}
                </div>
              )}

              {/* Actions */}
              <div className="item-actions">
                {selectedItem.category === 'weapon' && (
                  <>
                    {!selectedItem.equipped && (
                      <>
                        <button
                          className="action-btn primary"
                          onClick={() => {
                            // Equip to main hand
                            const updatedItem = { ...selectedItem, slot: 'mainHand', equipped: true };
                            if (onEquipItem) onEquipItem(updatedItem);
                            closeModal();
                          }}
                        >
                          ⚔️ Equip Main Hand
                        </button>
                        <button
                          className="action-btn primary"
                          onClick={() => {
                            // Equip to off hand
                            const updatedItem = { ...selectedItem, slot: 'offHand', equipped: true };
                            if (onEquipItem) onEquipItem(updatedItem);
                            closeModal();
                          }}
                        >
                          🗡️ Equip Off Hand
                        </button>
                      </>
                    )}
                    {selectedItem.equipped && (
                      <button
                        className="action-btn primary"
                        onClick={() => handleToggleEquip(selectedItem)}
                      >
                        ❌ Unequip
                      </button>
                    )}
                  </>
                )}

                {(selectedItem.category === 'armor' || selectedItem.category === 'shield') && (
                  <button
                    className="action-btn primary"
                    onClick={() => handleToggleEquip(selectedItem)}
                  >
                    {selectedItem.equipped ? '❌ Unequip' : '✅ Equip'}
                  </button>
                )}

                {(selectedItem.category === 'potion' || selectedItem.category === 'scroll') && (
                  <button
                    className="action-btn primary"
                    onClick={() => handleUseItem(selectedItem)}
                  >
                    🧪 Use
                  </button>
                )}

                <button
                  className="action-btn danger"
                  onClick={() => handleDropItem(selectedItem)}
                >
                  🗑️ Drop
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

InventoryManager.propTypes = {
  character: PropTypes.shape({
    inventory: PropTypes.arrayOf(PropTypes.object),
    currency: PropTypes.shape({
      cp: PropTypes.number,
      sp: PropTypes.number,
      gp: PropTypes.number,
      pp: PropTypes.number
    }),
    stats: PropTypes.shape({
      str: PropTypes.number
    })
  }).isRequired,
  onEquipItem: PropTypes.func,
  onUnequipItem: PropTypes.func,
  onUseItem: PropTypes.func,
  onDropItem: PropTypes.func,
  onUpdateCharacter: PropTypes.func
};

export default InventoryManager;
