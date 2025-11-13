/**
 * Equipment Slots Component
 * Visual display of equipped items for D&D 5e
 */

import { useState } from 'react';
import PropTypes from 'prop-types';
import './EquipmentSlots.css';

function EquipmentSlots({ character, onSlotClick, onUnequipItem }) {
  const [selectedSlot, setSelectedSlot] = useState(null);

  // Get equipped items by slot
  const equipment = {
    head: null,
    neck: null,
    body: null,
    hands: null,
    feet: null,
    ring1: null,
    ring2: null,
    mainHand: null,
    offHand: null,
    back: null
  };

  // Populate equipment from inventory
  if (character.inventory) {
    character.inventory.forEach(item => {
      if (item.equipped && item.slot) {
        if (item.slot === 'ring') {
          // Rings can go in either ring slot
          if (!equipment.ring1) equipment.ring1 = item;
          else if (!equipment.ring2) equipment.ring2 = item;
        } else {
          equipment[item.slot] = item;
        }
      }
    });
  }

  // Calculate total AC
  const calculateAC = () => {
    let baseAC = 10;
    const dexMod = Math.floor((character.stats?.dex || 10) - 10) / 2;
    let maxDexBonus = null;
    let bonuses = 0;

    // Armor (body)
    if (equipment.body?.armor) {
      baseAC = equipment.body.armor.ac;
      maxDexBonus = equipment.body.armor.maxDexBonus;
      if (equipment.body.magic?.bonus) {
        bonuses += equipment.body.magic.bonus;
      }
    }

    // Shield (offHand)
    if (equipment.offHand?.shield) {
      bonuses += equipment.offHand.shield.acBonus;
      if (equipment.offHand.magic?.bonus) {
        bonuses += equipment.offHand.magic.bonus;
      }
    }

    // Apply DEX modifier
    let finalDexMod = dexMod;
    if (maxDexBonus !== null && maxDexBonus !== undefined) {
      finalDexMod = Math.min(dexMod, maxDexBonus);
    }

    // Ring/Amulet AC bonuses
    [equipment.ring1, equipment.ring2, equipment.neck].forEach(item => {
      if (item?.customProperties?.bonuses?.ac) {
        bonuses += item.customProperties.bonuses.ac;
      }
    });

    return Math.floor(baseAC + finalDexMod + bonuses);
  };

  // Get slot icon
  const getSlotIcon = (slot) => {
    const icons = {
      head: '👑',
      neck: '📿',
      body: '👕',
      hands: '🧤',
      feet: '👞',
      ring1: '💍',
      ring2: '💍',
      mainHand: '⚔️',
      offHand: '🛡️',
      back: '🎒'
    };
    return icons[slot] || '📦';
  };

  // Get slot label
  const getSlotLabel = (slot) => {
    const labels = {
      head: 'Head',
      neck: 'Neck',
      body: 'Body',
      hands: 'Hands',
      feet: 'Feet',
      ring1: 'Ring 1',
      ring2: 'Ring 2',
      mainHand: 'Main Hand',
      offHand: 'Off Hand',
      back: 'Back'
    };
    return labels[slot] || slot;
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

  // Handle slot click
  const handleSlotClick = (slot, item) => {
    if (item) {
      // Show selected slot for menu
      setSelectedSlot(selectedSlot === slot ? null : slot);
    } else if (onSlotClick) {
      onSlotClick(slot);
    }
  };

  // Handle unequip from menu
  const handleUnequipFromMenu = (item) => {
    if (onUnequipItem) {
      onUnequipItem(item);
    }
    setSelectedSlot(null);
  };

  const totalAC = calculateAC();

  return (
    <div className="equipment-slots">
      {/* AC Display */}
      <div className="ac-display">
        <div className="ac-value">{totalAC}</div>
        <div className="ac-label">Armor Class</div>
      </div>

      {/* Equipment Grid */}
      <div className="equipment-grid">
        {/* Head Slot */}
        <div className="equipment-row">
          <button
            className={`equipment-slot ${equipment.head ? 'filled' : 'empty'}`}
            onClick={() => handleSlotClick('head', equipment.head)}
          >
            <div className="slot-icon">{equipment.head ? (equipment.head.image || getSlotIcon('head')) : getSlotIcon('head')}</div>
            <div className="slot-info">
              <div className="slot-label">{getSlotLabel('head')}</div>
              {equipment.head ? (
                <div className="slot-item" style={{ color: getRarityColor(equipment.head.rarity) }}>
                  {equipment.head.name}
                </div>
              ) : (
                <div className="slot-empty">Empty</div>
              )}
            </div>
          </button>
        </div>

        {/* Neck Slot */}
        <div className="equipment-row">
          <button
            className={`equipment-slot ${equipment.neck ? 'filled' : 'empty'}`}
            onClick={() => handleSlotClick('neck', equipment.neck)}
          >
            <div className="slot-icon">{equipment.neck ? (equipment.neck.image || getSlotIcon('neck')) : getSlotIcon('neck')}</div>
            <div className="slot-info">
              <div className="slot-label">{getSlotLabel('neck')}</div>
              {equipment.neck ? (
                <div className="slot-item" style={{ color: getRarityColor(equipment.neck.rarity) }}>
                  {equipment.neck.name}
                </div>
              ) : (
                <div className="slot-empty">Empty</div>
              )}
            </div>
          </button>
        </div>

        {/* Body Slot */}
        <div className="equipment-row">
          <button
            className={`equipment-slot ${equipment.body ? 'filled' : 'empty'}`}
            onClick={() => handleSlotClick('body', equipment.body)}
          >
            <div className="slot-icon">{equipment.body ? (equipment.body.image || getSlotIcon('body')) : getSlotIcon('body')}</div>
            <div className="slot-info">
              <div className="slot-label">{getSlotLabel('body')}</div>
              {equipment.body ? (
                <div className="slot-item" style={{ color: getRarityColor(equipment.body.rarity) }}>
                  {equipment.body.name}
                  {equipment.body.armor && <span className="slot-bonus"> (AC {equipment.body.armor.ac})</span>}
                </div>
              ) : (
                <div className="slot-empty">Empty</div>
              )}
            </div>
          </button>
        </div>

        {/* Hands/Feet Row */}
        <div className="equipment-row two-column">
          <button
            className={`equipment-slot ${equipment.hands ? 'filled' : 'empty'}`}
            onClick={() => handleSlotClick('hands', equipment.hands)}
          >
            <div className="slot-icon">{equipment.hands ? (equipment.hands.image || getSlotIcon('hands')) : getSlotIcon('hands')}</div>
            <div className="slot-info">
              <div className="slot-label">{getSlotLabel('hands')}</div>
              {equipment.hands ? (
                <div className="slot-item" style={{ color: getRarityColor(equipment.hands.rarity) }}>
                  {equipment.hands.name}
                </div>
              ) : (
                <div className="slot-empty">Empty</div>
              )}
            </div>
          </button>

          <button
            className={`equipment-slot ${equipment.feet ? 'filled' : 'empty'}`}
            onClick={() => handleSlotClick('feet', equipment.feet)}
          >
            <div className="slot-icon">{equipment.feet ? (equipment.feet.image || getSlotIcon('feet')) : getSlotIcon('feet')}</div>
            <div className="slot-info">
              <div className="slot-label">{getSlotLabel('feet')}</div>
              {equipment.feet ? (
                <div className="slot-item" style={{ color: getRarityColor(equipment.feet.rarity) }}>
                  {equipment.feet.name}
                </div>
              ) : (
                <div className="slot-empty">Empty</div>
              )}
            </div>
          </button>
        </div>

        {/* Rings Row */}
        <div className="equipment-row two-column">
          <button
            className={`equipment-slot ${equipment.ring1 ? 'filled' : 'empty'}`}
            onClick={() => handleSlotClick('ring1', equipment.ring1)}
          >
            <div className="slot-icon">{equipment.ring1 ? (equipment.ring1.image || getSlotIcon('ring1')) : getSlotIcon('ring1')}</div>
            <div className="slot-info">
              <div className="slot-label">{getSlotLabel('ring1')}</div>
              {equipment.ring1 ? (
                <div className="slot-item" style={{ color: getRarityColor(equipment.ring1.rarity) }}>
                  {equipment.ring1.name}
                </div>
              ) : (
                <div className="slot-empty">Empty</div>
              )}
            </div>
          </button>

          <button
            className={`equipment-slot ${equipment.ring2 ? 'filled' : 'empty'}`}
            onClick={() => handleSlotClick('ring2', equipment.ring2)}
          >
            <div className="slot-icon">{equipment.ring2 ? (equipment.ring2.image || getSlotIcon('ring2')) : getSlotIcon('ring2')}</div>
            <div className="slot-info">
              <div className="slot-label">{getSlotLabel('ring2')}</div>
              {equipment.ring2 ? (
                <div className="slot-item" style={{ color: getRarityColor(equipment.ring2.rarity) }}>
                  {equipment.ring2.name}
                </div>
              ) : (
                <div className="slot-empty">Empty</div>
              )}
            </div>
          </button>
        </div>

        {/* Main/Off Hand Row */}
        <div className="equipment-row two-column">
          <div className="slot-container">
            <button
              className={`equipment-slot ${equipment.mainHand ? 'filled' : 'empty'} ${selectedSlot === 'mainHand' ? 'selected' : ''}`}
              onClick={() => handleSlotClick('mainHand', equipment.mainHand)}
            >
              <div className="slot-icon">{equipment.mainHand ? (equipment.mainHand.image || getSlotIcon('mainHand')) : getSlotIcon('mainHand')}</div>
              <div className="slot-info">
                <div className="slot-label">{getSlotLabel('mainHand')}</div>
                {equipment.mainHand ? (
                  <div className="slot-item" style={{ color: getRarityColor(equipment.mainHand.rarity) }}>
                    {equipment.mainHand.name}
                    {equipment.mainHand.weapon && <span className="slot-bonus"> ({equipment.mainHand.weapon.damage})</span>}
                  </div>
                ) : (
                  <div className="slot-empty">Empty</div>
                )}
              </div>
            </button>
            {selectedSlot === 'mainHand' && equipment.mainHand && (
              <div className="slot-menu">
                <button
                  className="menu-btn unequip"
                  onClick={() => handleUnequipFromMenu(equipment.mainHand)}
                >
                  ❌ Unequip
                </button>
              </div>
            )}
          </div>

          <div className="slot-container">
            <button
              className={`equipment-slot ${equipment.offHand ? 'filled' : 'empty'} ${selectedSlot === 'offHand' ? 'selected' : ''}`}
              onClick={() => handleSlotClick('offHand', equipment.offHand)}
            >
              <div className="slot-icon">{equipment.offHand ? (equipment.offHand.image || getSlotIcon('offHand')) : getSlotIcon('offHand')}</div>
              <div className="slot-info">
                <div className="slot-label">{getSlotLabel('offHand')}</div>
                {equipment.offHand ? (
                  <div className="slot-item" style={{ color: getRarityColor(equipment.offHand.rarity) }}>
                    {equipment.offHand.name}
                    {equipment.offHand.shield && <span className="slot-bonus"> (+{equipment.offHand.shield.acBonus} AC)</span>}
                    {equipment.offHand.weapon && <span className="slot-bonus"> ({equipment.offHand.weapon.damage})</span>}
                  </div>
                ) : (
                  <div className="slot-empty">Empty</div>
                )}
              </div>
            </button>
            {selectedSlot === 'offHand' && equipment.offHand && (
              <div className="slot-menu">
                <button
                  className="menu-btn unequip"
                  onClick={() => handleUnequipFromMenu(equipment.offHand)}
                >
                  ❌ Unequip
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Back Slot */}
        <div className="equipment-row">
          <button
            className={`equipment-slot ${equipment.back ? 'filled' : 'empty'}`}
            onClick={() => handleSlotClick('back', equipment.back)}
          >
            <div className="slot-icon">{equipment.back ? (equipment.back.image || getSlotIcon('back')) : getSlotIcon('back')}</div>
            <div className="slot-info">
              <div className="slot-label">{getSlotLabel('back')}</div>
              {equipment.back ? (
                <div className="slot-item" style={{ color: getRarityColor(equipment.back.rarity) }}>
                  {equipment.back.name}
                </div>
              ) : (
                <div className="slot-empty">Empty</div>
              )}
            </div>
          </button>
        </div>
      </div>

      {/* Bonuses Summary */}
      {(equipment.ring1 || equipment.ring2 || equipment.neck || equipment.hands || equipment.feet) && (
        <div className="bonuses-summary">
          <h4>Active Bonuses</h4>
          <div className="bonuses-list">
            {[equipment.ring1, equipment.ring2, equipment.neck, equipment.hands, equipment.feet, equipment.back].filter(Boolean).map((item, i) => (
              item.magic?.effects && item.magic.effects.length > 0 && (
                <div key={i} className="bonus-item">
                  <span className="bonus-source">{item.name}:</span>
                  <span className="bonus-effect">{item.magic.effects.map(e => e.name).join(', ')}</span>
                </div>
              )
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

EquipmentSlots.propTypes = {
  character: PropTypes.shape({
    inventory: PropTypes.arrayOf(PropTypes.object),
    stats: PropTypes.shape({
      dex: PropTypes.number
    })
  }).isRequired,
  onSlotClick: PropTypes.func,
  onUnequipItem: PropTypes.func
};

export default EquipmentSlots;
