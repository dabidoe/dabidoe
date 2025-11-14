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

  // Define all slots for consistent display
  const allSlots = [
    { id: 'head', item: equipment.head },
    { id: 'neck', item: equipment.neck },
    { id: 'body', item: equipment.body },
    { id: 'back', item: equipment.back },
    { id: 'hands', item: equipment.hands },
    { id: 'feet', item: equipment.feet },
    { id: 'ring1', item: equipment.ring1 },
    { id: 'ring2', item: equipment.ring2 },
    { id: 'mainHand', item: equipment.mainHand },
    { id: 'offHand', item: equipment.offHand }
  ]

  return (
    <div className="equipment-slots">
      {/* Equipment Grid - 4 Column Cards */}
      <div className="equipment-grid-cards">
        {allSlots.map(({ id, item }) => {
          // Build item details for key:value display
          const details = []

          if (item) {
            // Add rarity
            if (item.rarity) {
              details.push({ key: 'Rarity', value: item.rarity, color: getRarityColor(item.rarity) })
            }

            // Add armor AC
            if (item.armor) {
              details.push({ key: 'AC', value: item.armor.ac })
            }

            // Add weapon damage
            if (item.weapon) {
              details.push({ key: 'Damage', value: `${item.weapon.damage} ${item.weapon.damageType}` })
            }

            // Add shield AC bonus
            if (item.shield) {
              details.push({ key: 'AC Bonus', value: `+${item.shield.acBonus}` })
            }

            // Add magic bonus
            if (item.magic?.bonus) {
              details.push({ key: 'Magic', value: `+${item.magic.bonus}` })
            }

            // Add weight
            if (item.weight) {
              details.push({ key: 'Weight', value: `${item.weight} lb` })
            }
          }

          return (
            <div
              key={id}
              className={`equipment-card ${item ? 'filled' : 'empty'}`}
              onClick={() => handleSlotClick(id, item)}
              style={{
                background: item ? 'rgba(45, 45, 68, 0.6)' : 'rgba(20, 20, 30, 0.4)',
                border: `1px solid ${item ? 'rgba(212, 175, 55, 0.4)' : 'rgba(255,255,255,0.15)'}`,
                borderRadius: '8px',
                padding: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                if (item) e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.7)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = item ? 'rgba(212, 175, 55, 0.4)' : 'rgba(255,255,255,0.15)'
              }}
            >
              {/* Card Header */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: item ? '8px' : '0',
                paddingBottom: item ? '8px' : '0',
                borderBottom: item ? '1px solid rgba(255,255,255,0.1)' : 'none'
              }}>
                <span style={{ fontSize: '20px' }}>
                  {getSlotIcon(id)}
                </span>
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: '11px',
                    color: 'rgba(255,255,255,0.5)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    {getSlotLabel(id)}
                  </div>
                  {item && (
                    <div style={{
                      fontSize: '13px',
                      color: getRarityColor(item.rarity),
                      fontWeight: '600',
                      marginTop: '2px'
                    }}>
                      {item.name}
                    </div>
                  )}
                </div>
              </div>

              {/* Item Details - Key:Value pairs */}
              {item && details.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {details.map((detail, idx) => (
                    <div key={idx} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '11px'
                    }}>
                      <span style={{ color: 'rgba(255,255,255,0.5)' }}>{detail.key}:</span>
                      <span style={{
                        color: detail.color || '#fff',
                        fontWeight: '600'
                      }}>
                        {detail.value}
                      </span>
                    </div>
                  ))}

                  {/* Unequip button for equipped items */}
                  {onUnequipItem && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onUnequipItem(item)
                      }}
                      style={{
                        marginTop: '8px',
                        padding: '4px 8px',
                        background: 'rgba(244, 67, 54, 0.2)',
                        border: '1px solid rgba(244, 67, 54, 0.4)',
                        borderRadius: '4px',
                        color: '#f44336',
                        fontSize: '10px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(244, 67, 54, 0.3)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(244, 67, 54, 0.2)'
                      }}
                    >
                      ❌ Unequip
                    </button>
                  )}
                </div>
              ) : !item && (
                <div style={{
                  textAlign: 'center',
                  color: 'rgba(255,255,255,0.3)',
                  fontSize: '11px',
                  fontStyle: 'italic',
                  padding: '8px 0'
                }}>
                  Empty
                </div>
              )}
            </div>
          )
        })}
      </div>
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
