/**
 * Battle Mode Component
 * Mobile-first combat tracker with AI narratives
 * Includes combat log, turn tracking, and quick actions
 */

import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { rollDice, rollAttack, getAbilityModifier, formatModifier } from '../../utils/5e-mechanics';
import './BattleMode.css';

function BattleMode({ character, onAttack, onDamage, onHeal, onRoll, onUpdateCharacter }) {
  const [turnNumber, setTurnNumber] = useState(1);
  const [battleLog, setBattleLog] = useState([]);
  const [selectedCantrip, setSelectedCantrip] = useState(null);
  const [showCantripPicker, setShowCantripPicker] = useState(false);
  const [hpEditMode, setHpEditMode] = useState(false);
  const [tempHP, setTempHP] = useState(character.hp?.current || 0);
  const logEndRef = useRef(null);

  // Auto-scroll battle log
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [battleLog]);

  // Update temp HP when character changes
  useEffect(() => {
    setTempHP(character.hp?.current || 0);
  }, [character.hp?.current]);

  // Add message to battle log
  const addLog = (message, type = 'action') => {
    setBattleLog(prev => [
      ...prev,
      {
        turn: turnNumber,
        message,
        type,
        timestamp: Date.now()
      }
    ]);
  };

  // Roll initiative
  const handleInitiative = () => {
    const dexMod = getAbilityModifier(character.stats?.dex || 10);
    const roll = Math.floor(Math.random() * 20) + 1;
    const total = roll + dexMod;

    addLog(`${character.name} rolls initiative: ${total} (${roll} + ${dexMod})`, 'initiative');

    if (onRoll) {
      onRoll({
        type: 'Initiative',
        diceType: 'd20',
        total,
        breakdown: `${roll} + ${dexMod} = ${total}`,
        critical: roll === 20 ? 'success' : (roll === 1 ? 'fail' : null)
      });
    }
  };

  // Melee attack
  const handleMeleeAttack = async () => {
    const strMod = getAbilityModifier(character.stats?.str || 10);
    const prof = 2 + Math.floor(((character.level || 1) - 1) / 4);
    const attackBonus = strMod + prof;

    const attackRoll = rollAttack({ attackBonus });
    const damageRoll = rollDice(`1d8+${strMod}`);

    addLog(
      `${character.name} attacks! Roll: ${attackRoll.total} (${attackRoll.breakdown})`,
      'attack'
    );

    if (attackRoll.isCriticalHit) {
      const critDamage = rollDice(`2d8+${strMod}`);
      addLog(`💥 CRITICAL HIT! Damage: ${critDamage.total}`, 'damage');

      if (onRoll) {
        onRoll({
          type: 'Melee Attack',
          diceType: 'd20',
          total: attackRoll.total,
          breakdown: attackRoll.breakdown,
          critical: 'success'
        });
      }

      if (onAttack) {
        await onAttack('melee', attackRoll, critDamage);
      }
    } else if (attackRoll.isCriticalMiss) {
      addLog(`💨 Critical miss!`, 'miss');

      if (onRoll) {
        onRoll({
          type: 'Melee Attack',
          diceType: 'd20',
          total: attackRoll.total,
          breakdown: attackRoll.breakdown,
          critical: 'fail'
        });
      }
    } else {
      addLog(`⚔️ Damage: ${damageRoll.total} (${damageRoll.breakdown})`, 'damage');

      if (onRoll) {
        onRoll({
          type: 'Damage',
          diceType: 'd8',
          total: damageRoll.total,
          breakdown: damageRoll.breakdown
        });
      }

      if (onAttack) {
        await onAttack('melee', attackRoll, damageRoll);
      }
    }
  };

  // Ranged attack
  const handleRangedAttack = async () => {
    const dexMod = getAbilityModifier(character.stats?.dex || 10);
    const prof = 2 + Math.floor(((character.level || 1) - 1) / 4);
    const attackBonus = dexMod + prof;

    const attackRoll = rollAttack({ attackBonus });
    const damageRoll = rollDice(`1d8+${dexMod}`);

    addLog(
      `${character.name} fires a ranged attack! Roll: ${attackRoll.total} (${attackRoll.breakdown})`,
      'attack'
    );

    if (attackRoll.isCriticalHit) {
      const critDamage = rollDice(`2d8+${dexMod}`);
      addLog(`🎯 CRITICAL HIT! Damage: ${critDamage.total}`, 'damage');

      if (onRoll) {
        onRoll({
          type: 'Ranged Attack',
          diceType: 'd20',
          total: attackRoll.total,
          critical: 'success'
        });
      }

      if (onAttack) {
        await onAttack('ranged', attackRoll, critDamage);
      }
    } else {
      addLog(`🏹 Damage: ${damageRoll.total} (${damageRoll.breakdown})`, 'damage');

      if (onRoll) {
        onRoll({
          type: 'Damage',
          diceType: 'd8',
          total: damageRoll.total,
          breakdown: damageRoll.breakdown
        });
      }

      if (onAttack) {
        await onAttack('ranged', attackRoll, damageRoll);
      }
    }
  };

  // Cast cantrip
  const handleCastCantrip = (cantrip) => {
    if (!cantrip) {
      setShowCantripPicker(true);
      return;
    }

    setShowCantripPicker(false);
    setSelectedCantrip(cantrip);

    if (cantrip.damage) {
      const damageRoll = rollDice(cantrip.damage);
      addLog(`✨ ${character.name} casts ${cantrip.name}! Damage: ${damageRoll.total}`, 'spell');

      if (onRoll) {
        onRoll({
          type: cantrip.name,
          diceType: `d${cantrip.damage.match(/d(\d+)/)?.[1] || '8'}`,
          total: damageRoll.total,
          breakdown: damageRoll.breakdown
        });
      }
    } else {
      addLog(`✨ ${character.name} casts ${cantrip.name}!`, 'spell');
    }
  };

  // Take damage
  const handleTakeDamage = (amount) => {
    if (!amount || isNaN(amount)) return;

    const damage = parseInt(amount);
    const newHP = Math.max(0, (character.hp?.current || 0) - damage);

    addLog(`💔 ${character.name} takes ${damage} damage! HP: ${newHP}/${character.hp?.max}`, 'damage');

    if (onDamage) {
      onDamage(damage);
    }

    if (onUpdateCharacter) {
      onUpdateCharacter({
        hp: {
          ...character.hp,
          current: newHP
        }
      });
    }
  };

  // Heal
  const handleHeal = (amount) => {
    if (!amount || isNaN(amount)) {
      // Random heal 1d20+10
      const healRoll = rollDice('1d20+10');
      amount = healRoll.total;
      addLog(`💚 ${character.name} heals! Roll: ${healRoll.breakdown}`, 'heal');
    }

    const healing = parseInt(amount);
    const newHP = Math.min((character.hp?.max || 0), (character.hp?.current || 0) + healing);

    addLog(`💚 ${character.name} heals ${healing} HP! HP: ${newHP}/${character.hp?.max}`, 'heal');

    if (onHeal) {
      onHeal(healing);
    }

    if (onUpdateCharacter) {
      onUpdateCharacter({
        hp: {
          ...character.hp,
          current: newHP
        }
      });
    }
  };

  // Quick actions
  const handleDash = () => {
    addLog(`🏃 ${character.name} dashes! Movement doubled this turn.`, 'action');
  };

  const handleDodge = () => {
    addLog(`💨 ${character.name} dodges! Attacks against them have disadvantage.`, 'action');
  };

  const handleHelp = () => {
    addLog(`🤝 ${character.name} helps an ally! They have advantage on their next check.`, 'action');
  };

  // Next turn
  const handleNextTurn = () => {
    setTurnNumber(prev => prev + 1);
    addLog(`--- Turn ${turnNumber + 1} ---`, 'turn');
  };

  // Save HP edit
  const handleSaveHP = () => {
    const newHP = Math.max(0, Math.min(character.hp?.max || 0, tempHP));

    if (onUpdateCharacter) {
      onUpdateCharacter({
        hp: {
          ...character.hp,
          current: newHP
        }
      });
    }

    setHpEditMode(false);
  };

  // Get cantrips
  const cantrips = character.spellcasting?.spells?.filter(s => s.level === 0) || [];

  return (
    <div className="battle-mode">
      {/* HP and Combat Info */}
      <div className="battle-header">
        <div className="hp-display">
          <span className="hp-label">HP</span>
          {hpEditMode ? (
            <div className="hp-edit">
              <input
                type="number"
                value={tempHP}
                onChange={(e) => setTempHP(parseInt(e.target.value) || 0)}
                min="0"
                max={character.hp?.max || 0}
                className="hp-input"
              />
              <button className="save-hp-btn" onClick={handleSaveHP}>✓</button>
              <button className="cancel-hp-btn" onClick={() => setHpEditMode(false)}>✕</button>
            </div>
          ) : (
            <div className="hp-value" onClick={() => setHpEditMode(true)}>
              <span className="current-hp">{character.hp?.current || 0}</span>
              <span className="hp-separator">/</span>
              <span className="max-hp">{character.hp?.max || 0}</span>
            </div>
          )}
          <div className="hp-bar">
            <div
              className="hp-fill"
              style={{
                width: `${((character.hp?.current || 0) / (character.hp?.max || 1)) * 100}%`
              }}
            />
          </div>
        </div>

        <div className="combat-info">
          <div className="info-stat">
            <span className="info-label">AC</span>
            <span className="info-value">{character.ac || 10}</span>
          </div>
          <div className="info-stat">
            <span className="info-label">Turn</span>
            <span className="info-value">{turnNumber}</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <button className="action-btn melee" onClick={handleMeleeAttack}>
          <span className="btn-icon">⚔️</span>
          <span className="btn-label">Melee</span>
        </button>
        <button className="action-btn ranged" onClick={handleRangedAttack}>
          <span className="btn-icon">🏹</span>
          <span className="btn-label">Ranged</span>
        </button>
        <button className="action-btn cantrip" onClick={() => handleCastCantrip(selectedCantrip)}>
          <span className="btn-icon">✨</span>
          <span className="btn-label">Cantrip</span>
        </button>
        <button className="action-btn initiative" onClick={handleInitiative}>
          <span className="btn-icon">🎲</span>
          <span className="btn-label">Initiative</span>
        </button>
      </div>

      {/* Secondary Actions */}
      <div className="secondary-actions">
        <button className="secondary-btn" onClick={handleDash}>
          🏃 Dash
        </button>
        <button className="secondary-btn" onClick={handleDodge}>
          💨 Dodge
        </button>
        <button className="secondary-btn" onClick={handleHelp}>
          🤝 Help
        </button>
      </div>

      {/* Damage/Heal Controls */}
      <div className="hp-controls">
        <div className="hp-control-group">
          <input
            type="number"
            placeholder="Damage"
            className="damage-input"
            id="damage-amount"
            min="0"
          />
          <button
            className="control-btn damage"
            onClick={() => {
              const input = document.getElementById('damage-amount');
              handleTakeDamage(input.value);
              input.value = '';
            }}
          >
            💔 Take Damage
          </button>
        </div>

        <div className="hp-control-group">
          <input
            type="number"
            placeholder="Heal"
            className="heal-input"
            id="heal-amount"
            min="0"
          />
          <button
            className="control-btn heal"
            onClick={() => {
              const input = document.getElementById('heal-amount');
              handleHeal(input.value || null);
              input.value = '';
            }}
          >
            💚 Heal
          </button>
        </div>
      </div>

      {/* Battle Log */}
      <div className="battle-log-section">
        <div className="log-header">
          <h3>Battle Log</h3>
          <button className="clear-log-btn" onClick={() => setBattleLog([])}>
            Clear
          </button>
        </div>
        <div className="battle-log">
          {battleLog.length === 0 ? (
            <div className="log-empty">Combat actions will appear here...</div>
          ) : (
            <>
              {battleLog.map((entry, idx) => (
                <div key={idx} className={`log-entry ${entry.type}`}>
                  <span className="log-turn">T{entry.turn}</span>
                  <span className="log-message">{entry.message}</span>
                </div>
              ))}
              <div ref={logEndRef} />
            </>
          )}
        </div>
      </div>

      {/* Turn Controls */}
      <div className="turn-controls">
        <button className="next-turn-btn" onClick={handleNextTurn}>
          Next Turn →
        </button>
      </div>

      {/* Cantrip Picker Modal */}
      {showCantripPicker && cantrips.length > 0 && (
        <div className="cantrip-picker-overlay" onClick={() => setShowCantripPicker(false)}>
          <div className="cantrip-picker" onClick={(e) => e.stopPropagation()}>
            <h3>Select Cantrip</h3>
            <div className="cantrip-list">
              {cantrips.map(cantrip => (
                <button
                  key={cantrip.id}
                  className="cantrip-option"
                  onClick={() => handleCastCantrip(cantrip)}
                >
                  <span className="cantrip-name">{cantrip.name}</span>
                  {cantrip.damage && (
                    <span className="cantrip-damage">{cantrip.damage}</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

BattleMode.propTypes = {
  character: PropTypes.object.isRequired,
  onAttack: PropTypes.func,
  onDamage: PropTypes.func,
  onHeal: PropTypes.func,
  onRoll: PropTypes.func,
  onUpdateCharacter: PropTypes.func
};

export default BattleMode;
