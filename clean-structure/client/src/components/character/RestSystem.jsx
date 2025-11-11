/**
 * Rest System Component
 * Short rest and long rest functionality
 * Handles healing, spell slot restoration, and resource recovery
 */

import { useState } from 'react';
import PropTypes from 'prop-types';
import { rollDice, getAbilityModifier } from '../../utils/5e-mechanics';
import './RestSystem.css';

function RestSystem({ character, onRest, onRoll, onUpdateCharacter }) {
  const [showRestModal, setShowRestModal] = useState(false);
  const [restType, setRestType] = useState(null); // 'short' or 'long'
  const [hitDiceToUse, setHitDiceToUse] = useState(1);
  const [resting, setResting] = useState(false);

  const { hp, resources, spellcasting, class: className } = character;
  const hitDice = resources?.hitDice || { type: 'd8', current: 1, max: 1 };
  const conMod = getAbilityModifier(character.stats?.con || 10);

  // Open rest modal
  const handleOpenRest = (type) => {
    setRestType(type);
    setShowRestModal(true);
  };

  // Close modal
  const handleCloseRest = () => {
    setShowRestModal(false);
    setRestType(null);
    setHitDiceToUse(1);
  };

  // Perform short rest
  const handleShortRest = async () => {
    setResting(true);

    // Roll hit dice for healing
    let totalHealing = 0;
    for (let i = 0; i < hitDiceToUse; i++) {
      const roll = rollDice(`1${hitDice.type}+${conMod}`);
      totalHealing += roll.total;

      if (onRoll) {
        onRoll({
          type: 'Hit Die',
          diceType: hitDice.type,
          total: roll.total,
          breakdown: roll.breakdown
        });
      }
    }

    // Calculate new HP
    const newHP = Math.min((hp?.max || 0), (hp?.current || 0) + totalHealing);

    // Update character
    const updates = {
      hp: {
        ...hp,
        current: newHP
      },
      resources: {
        ...resources,
        hitDice: {
          ...hitDice,
          current: Math.max(0, hitDice.current - hitDiceToUse)
        }
      }
    };

    // Warlock special: restore all spell slots
    if (className?.toLowerCase().includes('warlock') && spellcasting) {
      Object.keys(spellcasting.spellSlots).forEach(level => {
        if (updates.spellcasting) {
          updates.spellcasting.spellSlots[level].current = spellcasting.spellSlots[level].max;
        }
      });
    }

    // Call API
    if (onRest) {
      await onRest('short', { hitDiceUsed: hitDiceToUse, healing: totalHealing });
    }

    if (onUpdateCharacter) {
      onUpdateCharacter(updates);
    }

    setResting(false);
    handleCloseRest();
  };

  // Perform long rest
  const handleLongRest = async () => {
    setResting(true);

    const updates = {
      hp: {
        ...hp,
        current: hp?.max || 0
      },
      resources: {
        ...resources,
        hitDice: {
          ...hitDice,
          current: Math.min(hitDice.max, hitDice.current + Math.ceil(hitDice.max / 2))
        }
      }
    };

    // Restore spell slots
    if (spellcasting && updates.spellcasting) {
      Object.keys(spellcasting.spellSlots).forEach(level => {
        updates.spellcasting.spellSlots[level].current = spellcasting.spellSlots[level].max;
      });
    }

    // Clear temp modifiers
    updates.tempModifiers = [];

    // Reduce exhaustion by 1
    if (character.exhaustion > 0) {
      updates.exhaustion = Math.max(0, character.exhaustion - 1);
    }

    // Call API
    if (onRest) {
      await onRest('long', {});
    }

    if (onUpdateCharacter) {
      onUpdateCharacter(updates);
    }

    setResting(false);
    handleCloseRest();
  };

  return (
    <div className="rest-system">
      {/* Rest Buttons */}
      <div className="rest-buttons">
        <button className="rest-btn short-rest" onClick={() => handleOpenRest('short')}>
          <span className="rest-icon">🌙</span>
          <div className="rest-info">
            <span className="rest-name">Short Rest</span>
            <span className="rest-desc">1 hour, spend hit dice</span>
          </div>
        </button>

        <button className="rest-btn long-rest" onClick={() => handleOpenRest('long')}>
          <span className="rest-icon">😴</span>
          <div className="rest-info">
            <span className="rest-name">Long Rest</span>
            <span className="rest-desc">8 hours, full recovery</span>
          </div>
        </button>
      </div>

      {/* Resources Display */}
      <div className="resources-display">
        <div className="resource-item">
          <span className="resource-label">Hit Dice</span>
          <span className="resource-value">
            {hitDice.current}/{hitDice.max} {hitDice.type}
          </span>
        </div>

        {character.exhaustion > 0 && (
          <div className="resource-item exhaustion">
            <span className="resource-label">Exhaustion</span>
            <span className="resource-value">Level {character.exhaustion}</span>
          </div>
        )}
      </div>

      {/* Rest Modal */}
      {showRestModal && (
        <div className="rest-modal-overlay" onClick={handleCloseRest}>
          <div className="rest-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                {restType === 'short' ? '🌙 Short Rest' : '😴 Long Rest'}
              </h3>
              <button className="close-btn" onClick={handleCloseRest}>✕</button>
            </div>

            <div className="modal-content">
              {restType === 'short' ? (
                <>
                  <p className="rest-description">
                    A short rest is a period of downtime, at least 1 hour long, during which you
                    can spend hit dice to recover hit points.
                  </p>

                  <div className="hit-dice-section">
                    <div className="hit-dice-info">
                      <span className="label">Available Hit Dice:</span>
                      <span className="value">{hitDice.current} {hitDice.type}</span>
                    </div>

                    <div className="hit-dice-selector">
                      <label htmlFor="hit-dice-count">Spend Hit Dice:</label>
                      <div className="selector-controls">
                        <button
                          className="dice-btn"
                          onClick={() => setHitDiceToUse(Math.max(1, hitDiceToUse - 1))}
                          disabled={hitDiceToUse <= 1}
                        >
                          −
                        </button>
                        <input
                          id="hit-dice-count"
                          type="number"
                          value={hitDiceToUse}
                          onChange={(e) => setHitDiceToUse(Math.min(hitDice.current, Math.max(1, parseInt(e.target.value) || 1)))}
                          min="1"
                          max={hitDice.current}
                          className="dice-input"
                        />
                        <button
                          className="dice-btn"
                          onClick={() => setHitDiceToUse(Math.min(hitDice.current, hitDiceToUse + 1))}
                          disabled={hitDiceToUse >= hitDice.current}
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div className="healing-estimate">
                      <span className="estimate-label">Estimated Healing:</span>
                      <span className="estimate-value">
                        {hitDiceToUse}{hitDice.type} + {hitDiceToUse * conMod} (CON)
                      </span>
                    </div>
                  </div>

                  {className?.toLowerCase().includes('warlock') && (
                    <div className="class-feature-note">
                      <strong>✨ Pact Magic:</strong> All spell slots restored!
                    </div>
                  )}

                  <button
                    className="rest-action-btn"
                    onClick={handleShortRest}
                    disabled={resting || hitDice.current < 1}
                  >
                    {resting ? 'Resting...' : 'Take Short Rest'}
                  </button>
                </>
              ) : (
                <>
                  <p className="rest-description">
                    A long rest is a period of extended downtime, at least 8 hours long, during which
                    you sleep or perform light activity. At the end, you regain all lost hit points
                    and spent hit dice (up to half your maximum).
                  </p>

                  <div className="rest-benefits">
                    <h4>You will recover:</h4>
                    <ul>
                      <li>✅ Full HP restored</li>
                      <li>✅ {Math.ceil(hitDice.max / 2)} hit dice recovered</li>
                      <li>✅ All spell slots restored</li>
                      <li>✅ All class abilities restored</li>
                      <li>✅ Temporary modifiers cleared</li>
                      {character.exhaustion > 0 && (
                        <li>✅ Exhaustion reduced by 1 level</li>
                      )}
                    </ul>
                  </div>

                  <button
                    className="rest-action-btn"
                    onClick={handleLongRest}
                    disabled={resting}
                  >
                    {resting ? 'Resting...' : 'Take Long Rest'}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

RestSystem.propTypes = {
  character: PropTypes.object.isRequired,
  onRest: PropTypes.func,
  onRoll: PropTypes.func,
  onUpdateCharacter: PropTypes.func
};

export default RestSystem;
