/**
 * Ability Library Component
 * Mobile-first class abilities browser for D&D 5e
 * Browse and use class/racial features
 */

import { useState } from 'react';
import PropTypes from 'prop-types';
import { rollDice, rollAttack } from '../../utils/5e-mechanics';
import './AbilityLibrary.css';

function AbilityLibrary({ character, onUseAbility, onRoll, onUpdateCharacter }) {
  const [selectedAbility, setSelectedAbility] = useState(null);
  const [showAbilityModal, setShowAbilityModal] = useState(false);
  const [filterType, setFilterType] = useState('all'); // all, action, bonus, reaction, passive

  const abilities = character.abilities || [];

  // Filter abilities by action type
  const filteredAbilities = filterType === 'all'
    ? abilities
    : abilities.filter(a => a.actionType === filterType);

  // Get ability icon based on type
  const getAbilityIcon = (ability) => {
    if (ability.category === 'spell-like') return '✨';
    if (ability.category === 'combat') return '⚔️';
    if (ability.category === 'utility') return '🔧';
    if (ability.category === 'defensive') return '🛡️';
    if (ability.category === 'movement') return '🏃';
    return '💫';
  };

  // Get usage badge color
  const getUsageBadgeColor = (ability) => {
    if (!ability.uses) return null;
    const { current, max, per } = ability.uses;
    if (current === 0) return 'depleted';
    if (current <= max * 0.3) return 'low';
    return 'available';
  };

  // Check if ability can be used
  const canUseAbility = (ability) => {
    if (!ability.uses) return true; // Passive or unlimited use
    return ability.uses.current > 0;
  };

  // Handle ability use
  const handleUseAbility = async (ability) => {
    if (!canUseAbility(ability)) {
      alert(`No uses of ${ability.name} remaining! Recharges on ${ability.uses.per}.`);
      return;
    }

    let rollResult = null;

    // Roll damage if applicable
    if (ability.damage) {
      const roll = rollDice(ability.damage.formula);
      rollResult = {
        type: ability.name,
        diceType: ability.damage.formula,
        total: roll.total,
        breakdown: roll.breakdown,
        damageType: ability.damage.type
      };

      if (onRoll) {
        onRoll(rollResult);
      }
    }

    // Roll attack if applicable
    if (ability.attack) {
      const attackBonus = ability.attack.bonus || 0;
      const attackRoll = rollAttack({ attackBonus });

      rollResult = {
        type: `${ability.name} Attack`,
        diceType: 'd20',
        total: attackRoll.total,
        breakdown: attackRoll.breakdown,
        critical: attackRoll.isCriticalHit ? 'success' : (attackRoll.isCriticalFailure ? 'fail' : null)
      };

      if (onRoll) {
        onRoll(rollResult);
      }

      // Roll damage on hit
      if (attackRoll.total >= 10 && ability.damage) {
        const damageRoll = rollDice(ability.damage.formula);
        setTimeout(() => {
          if (onRoll) {
            onRoll({
              type: `${ability.name} Damage`,
              diceType: ability.damage.formula,
              total: damageRoll.total,
              breakdown: damageRoll.breakdown,
              damageType: ability.damage.type
            });
          }
        }, 500);
      }
    }

    // Consume use if limited
    if (ability.uses && ability.uses.current > 0) {
      const updatedAbilities = abilities.map(a => {
        if (a.id === ability.id) {
          return {
            ...a,
            uses: {
              ...a.uses,
              current: a.uses.current - 1
            }
          };
        }
        return a;
      });

      if (onUpdateCharacter) {
        onUpdateCharacter({ ...character, abilities: updatedAbilities });
      }
    }

    // Trigger callback
    if (onUseAbility) {
      onUseAbility({
        ability,
        result: rollResult
      });
    }

    setShowAbilityModal(false);
  };

  // Open ability details
  const openAbilityDetails = (ability) => {
    setSelectedAbility(ability);
    setShowAbilityModal(true);
  };

  // Close modal
  const closeModal = () => {
    setShowAbilityModal(false);
    setSelectedAbility(null);
  };

  return (
    <div className="ability-library">
      {/* Filter Tabs */}
      <div className="ability-filters">
        <button
          className={`filter-tab ${filterType === 'all' ? 'active' : ''}`}
          onClick={() => setFilterType('all')}
        >
          All
        </button>
        <button
          className={`filter-tab ${filterType === 'action' ? 'active' : ''}`}
          onClick={() => setFilterType('action')}
        >
          🎯 Action
        </button>
        <button
          className={`filter-tab ${filterType === 'bonus' ? 'active' : ''}`}
          onClick={() => setFilterType('bonus')}
        >
          ⚡ Bonus
        </button>
        <button
          className={`filter-tab ${filterType === 'reaction' ? 'active' : ''}`}
          onClick={() => setFilterType('reaction')}
        >
          🛡️ Reaction
        </button>
        <button
          className={`filter-tab ${filterType === 'passive' ? 'active' : ''}`}
          onClick={() => setFilterType('passive')}
        >
          💫 Passive
        </button>
      </div>

      {/* Abilities List */}
      <div className="abilities-list">
        {filteredAbilities.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🌟</div>
            <h3>No Abilities Yet</h3>
            <p>Class and racial abilities will appear here as you level up.</p>
          </div>
        ) : (
          filteredAbilities.map(ability => {
            const usable = canUseAbility(ability);
            const badgeColor = getUsageBadgeColor(ability);

            return (
              <button
                key={ability.id}
                className={`ability-card ${!usable ? 'depleted' : ''}`}
                onClick={() => openAbilityDetails(ability)}
              >
                <div className="ability-icon">{getAbilityIcon(ability)}</div>

                <div className="ability-info">
                  <div className="ability-header">
                    <h4 className="ability-name">{ability.name}</h4>
                    {ability.uses && (
                      <span className={`usage-badge ${badgeColor}`}>
                        {ability.uses.current}/{ability.uses.max}
                      </span>
                    )}
                  </div>

                  <p className="ability-summary">{ability.shortDescription}</p>

                  <div className="ability-meta">
                    <span className="action-type">{ability.actionType}</span>
                    {ability.damage && (
                      <span className="damage-preview">
                        {ability.damage.formula} {ability.damage.type}
                      </span>
                    )}
                    {ability.uses && (
                      <span className="recharge-info">Per {ability.uses.per}</span>
                    )}
                  </div>
                </div>

                <div className="ability-arrow">→</div>
              </button>
            );
          })
        )}
      </div>

      {/* Ability Detail Modal */}
      {showAbilityModal && selectedAbility && (
        <div className="ability-modal-overlay" onClick={closeModal}>
          <div className="ability-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-icon">{getAbilityIcon(selectedAbility)}</span>
              <h3>{selectedAbility.name}</h3>
              <button className="close-btn" onClick={closeModal}>✕</button>
            </div>

            <div className="modal-content">
              {/* Usage Info */}
              {selectedAbility.uses && (
                <div className="usage-display">
                  <div className="usage-dots">
                    {Array.from({ length: selectedAbility.uses.max }).map((_, i) => (
                      <span
                        key={i}
                        className={`usage-dot ${i < selectedAbility.uses.current ? 'filled' : 'empty'}`}
                      >
                        ●
                      </span>
                    ))}
                  </div>
                  <p className="usage-text">
                    {selectedAbility.uses.current} of {selectedAbility.uses.max} uses remaining
                    <br />
                    <small>Recharges on {selectedAbility.uses.per}</small>
                  </p>
                </div>
              )}

              {/* Ability Stats */}
              <div className="ability-stats">
                <div className="stat-row">
                  <span className="stat-label">Action Type</span>
                  <span className="stat-value">{selectedAbility.actionType}</span>
                </div>

                {selectedAbility.attack && (
                  <div className="stat-row">
                    <span className="stat-label">Attack Bonus</span>
                    <span className="stat-value">+{selectedAbility.attack.bonus}</span>
                  </div>
                )}

                {selectedAbility.damage && (
                  <>
                    <div className="stat-row">
                      <span className="stat-label">Damage</span>
                      <span className="stat-value">{selectedAbility.damage.formula}</span>
                    </div>
                    <div className="stat-row">
                      <span className="stat-label">Damage Type</span>
                      <span className="stat-value">{selectedAbility.damage.type}</span>
                    </div>
                  </>
                )}

                {selectedAbility.saveDC && (
                  <div className="stat-row">
                    <span className="stat-label">Save DC</span>
                    <span className="stat-value">
                      DC {selectedAbility.saveDC.dc} {selectedAbility.saveDC.ability.toUpperCase()}
                    </span>
                  </div>
                )}

                {selectedAbility.range && (
                  <div className="stat-row">
                    <span className="stat-label">Range</span>
                    <span className="stat-value">{selectedAbility.range}</span>
                  </div>
                )}

                {selectedAbility.duration && (
                  <div className="stat-row">
                    <span className="stat-label">Duration</span>
                    <span className="stat-value">{selectedAbility.duration}</span>
                  </div>
                )}
              </div>

              {/* Full Description */}
              <div className="ability-description">
                <h4>Description</h4>
                <p>{selectedAbility.description}</p>
              </div>

              {/* Effect Details */}
              {selectedAbility.effects && selectedAbility.effects.length > 0 && (
                <div className="ability-effects">
                  <h4>Effects</h4>
                  <ul>
                    {selectedAbility.effects.map((effect, i) => (
                      <li key={i}>{effect}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Use Button */}
              {selectedAbility.actionType !== 'passive' && (
                <button
                  className="use-ability-btn"
                  onClick={() => handleUseAbility(selectedAbility)}
                  disabled={!canUseAbility(selectedAbility)}
                >
                  {canUseAbility(selectedAbility) ? (
                    <>🎲 Use {selectedAbility.name}</>
                  ) : (
                    <>❌ No Uses Remaining</>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

AbilityLibrary.propTypes = {
  character: PropTypes.shape({
    abilities: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      shortDescription: PropTypes.string,
      description: PropTypes.string.isRequired,
      actionType: PropTypes.oneOf(['action', 'bonus', 'reaction', 'passive']).isRequired,
      category: PropTypes.string,
      uses: PropTypes.shape({
        current: PropTypes.number,
        max: PropTypes.number,
        per: PropTypes.string
      }),
      damage: PropTypes.shape({
        formula: PropTypes.string,
        type: PropTypes.string
      }),
      attack: PropTypes.shape({
        bonus: PropTypes.number
      }),
      saveDC: PropTypes.shape({
        dc: PropTypes.number,
        ability: PropTypes.string
      }),
      range: PropTypes.string,
      duration: PropTypes.string,
      effects: PropTypes.arrayOf(PropTypes.string)
    }))
  }).isRequired,
  onUseAbility: PropTypes.func,
  onRoll: PropTypes.func,
  onUpdateCharacter: PropTypes.func
};

export default AbilityLibrary;
