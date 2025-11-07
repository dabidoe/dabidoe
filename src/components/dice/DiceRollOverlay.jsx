/**
 * Dice Roll Overlay Component
 * Displays animated dice roll results on screen
 */

import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import './DiceRollOverlay.css';

function DiceRollOverlay({ rolls = [] }) {
  const [activeRolls, setActiveRolls] = useState([]);

  useEffect(() => {
    // Add new rolls to active rolls
    if (rolls.length > 0) {
      const newRoll = rolls[rolls.length - 1];
      const rollWithId = {
        ...newRoll,
        id: Date.now(),
        timestamp: Date.now()
      };

      setActiveRolls(prev => [...prev, rollWithId]);

      // Remove roll after animation
      setTimeout(() => {
        setActiveRolls(prev => prev.filter(r => r.id !== rollWithId.id));
      }, 3000);
    }
  }, [rolls]);

  return (
    <div className="dice-roll-overlay">
      {activeRolls.map(roll => (
        <DiceRollAnimation key={roll.id} roll={roll} />
      ))}
    </div>
  );
}

function DiceRollAnimation({ roll }) {
  const [phase, setPhase] = useState('enter');

  useEffect(() => {
    // Animation sequence
    setTimeout(() => setPhase('showing'), 100);
    setTimeout(() => setPhase('exit'), 2500);
  }, []);

  const getCriticalClass = () => {
    if (roll.critical === 'success') return 'critical-success';
    if (roll.critical === 'fail') return 'critical-fail';
    return '';
  };

  const getResultColor = () => {
    if (roll.critical === 'success') return '#2ecc71';
    if (roll.critical === 'fail') return '#e74c3c';
    if (roll.success) return '#3498db';
    return '#f39c12';
  };

  return (
    <div className={`dice-roll-animation ${phase} ${getCriticalClass()}`}>
      <div className="roll-container">
        {/* Dice Icon */}
        <div className="dice-icon">
          {roll.diceType === 'd20' ? '🎲' : getDiceEmoji(roll.diceType)}
        </div>

        {/* Roll Type */}
        <div className="roll-type">
          {roll.type || 'Roll'}
        </div>

        {/* Result */}
        <div
          className="roll-result"
          style={{ color: getResultColor() }}
        >
          {roll.total}
        </div>

        {/* Breakdown */}
        {roll.breakdown && (
          <div className="roll-breakdown">
            {roll.breakdown}
          </div>
        )}

        {/* Success/Fail Indicator */}
        {roll.success !== undefined && (
          <div className={`roll-indicator ${roll.success ? 'success' : 'fail'}`}>
            {roll.success ? '✓ Success' : '✗ Failed'}
          </div>
        )}

        {/* Critical Burst Effect */}
        {roll.critical && (
          <div className="critical-burst">
            {roll.critical === 'success' ? '⭐' : '💥'}
          </div>
        )}
      </div>
    </div>
  );
}

function getDiceEmoji(diceType) {
  const emojis = {
    'd4': '△',
    'd6': '⚄',
    'd8': '◇',
    'd10': '⬟',
    'd12': '⬢',
    'd20': '🎲',
    'd100': '💯'
  };
  return emojis[diceType] || '🎲';
}

DiceRollOverlay.propTypes = {
  rolls: PropTypes.arrayOf(PropTypes.shape({
    type: PropTypes.string,
    diceType: PropTypes.string,
    total: PropTypes.number.isRequired,
    breakdown: PropTypes.string,
    success: PropTypes.bool,
    critical: PropTypes.oneOf(['success', 'fail', null])
  }))
};

DiceRollAnimation.propTypes = {
  roll: PropTypes.shape({
    id: PropTypes.number,
    type: PropTypes.string,
    diceType: PropTypes.string,
    total: PropTypes.number.isRequired,
    breakdown: PropTypes.string,
    success: PropTypes.bool,
    critical: PropTypes.oneOf(['success', 'fail', null])
  }).isRequired
};

export default DiceRollOverlay;
