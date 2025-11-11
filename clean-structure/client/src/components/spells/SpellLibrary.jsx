/**
 * Spell Library Component
 * Mobile-first spell browser and caster
 * Extracted from test-enhanced-features.html
 */

import { useState } from 'prop-types';
import PropTypes from 'prop-types';
import { rollDice, hasSpellSlot, useSpellSlot, getAbilityModifier, formatModifier } from '../../utils/5e-mechanics';
import './SpellLibrary.css';

function SpellLibrary({ character, onCastSpell, onPrepareSpell, onRoll }) {
  const [selectedLevel, setSelectedLevel] = useState(0); // 0 = cantrips
  const [selectedSpell, setSelectedSpell] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  const { spellcasting } = character;

  if (!spellcasting || !spellcasting.enabled) {
    return (
      <div className="spell-library-empty">
        <span className="empty-icon">✨</span>
        <p>This character doesn't cast spells</p>
      </div>
    );
  }

  // Group spells by level
  const spellsByLevel = {};
  for (let i = 0; i <= 9; i++) {
    spellsByLevel[i] = spellcasting.spells.filter(s => s.level === i);
  }

  // Get spell slots for current level
  const currentSlots = selectedLevel > 0
    ? spellcasting.spellSlots[selectedLevel]
    : { current: '∞', max: '∞' };

  // Handle spell casting
  const handleCastSpell = (spell) => {
    if (spell.level > 0) {
      if (!hasSpellSlot(character, spell.level)) {
        alert(`No ${spell.level}${getOrdinalSuffix(spell.level)} level spell slots available!`);
        return;
      }
    }

    // Calculate spell attack/save
    const spellMod = getAbilityModifier(character.stats[spellcasting.ability]);
    let result = {
      spell: spell.name,
      level: spell.level
    };

    // Roll attack if needed
    if (spell.attackRoll) {
      const attackRoll = rollDice('1d20');
      result.attackRoll = attackRoll.total + spellcasting.spellAttackBonus;
      result.attackBreakdown = `${attackRoll.total} + ${spellcasting.spellAttackBonus} = ${result.attackRoll}`;
      result.isCritical = attackRoll.isCriticalSuccess;
    }

    // Roll damage if present
    if (spell.damage) {
      const damageRoll = rollDice(spell.damage);
      result.damage = damageRoll.total;
      result.damageBreakdown = damageRoll.breakdown;
      result.damageType = spell.damageType;

      // Trigger dice animation
      if (onRoll) {
        onRoll({
          type: spell.name,
          diceType: `d${spell.damage.match(/d(\d+)/)?.[1] || '8'}`,
          total: result.damage,
          breakdown: result.damageBreakdown,
          critical: result.isCritical ? 'success' : null
        });
      }
    }

    // Show save DC if needed
    if (spell.savingThrow) {
      result.saveDC = spellcasting.spellSaveDC;
      result.saveType = spell.savingThrow;
    }

    // Use spell slot
    if (spell.level > 0) {
      useSpellSlot(character, spell.level);
    }

    // Call parent handler
    if (onCastSpell) {
      onCastSpell(spell, result);
    }

    setShowDetails(false);
  };

  // Handle prepare/unprepare
  const handleTogglePrepare = (spell) => {
    if (onPrepareSpell) {
      onPrepareSpell(spell.id, !spell.prepared);
    }
  };

  // Spell level tabs
  const spellLevels = [
    { level: 0, label: 'Cantrips', icon: '✨' },
    { level: 1, label: '1st', icon: '①' },
    { level: 2, label: '2nd', icon: '②' },
    { level: 3, label: '3rd', icon: '③' },
    { level: 4, label: '4th', icon: '④' },
    { level: 5, label: '5th', icon: '⑤' },
    { level: 6, label: '6th', icon: '⑥' },
    { level: 7, label: '7th', icon: '⑦' },
    { level: 8, label: '8th', icon: '⑧' },
    { level: 9, label: '9th', icon: '⑨' }
  ].filter(lvl => spellsByLevel[lvl.level]?.length > 0);

  const currentSpells = spellsByLevel[selectedLevel] || [];
  const preparedSpells = currentSpells.filter(s => s.prepared || s.alwaysPrepared || s.level === 0);

  return (
    <div className="spell-library">
      {/* Spell Slots Display */}
      {selectedLevel > 0 && (
        <div className="spell-slots-banner">
          <span className="slots-label">Level {selectedLevel} Slots:</span>
          <div className="slot-dots">
            {Array.from({ length: currentSlots.max }).map((_, i) => (
              <span
                key={i}
                className={`slot-dot ${i < currentSlots.current ? 'available' : 'used'}`}
              >
                {i < currentSlots.current ? '⚫' : '⚪'}
              </span>
            ))}
          </div>
          <span className="slots-count">
            {currentSlots.current}/{currentSlots.max}
          </span>
        </div>
      )}

      {/* Spell Level Tabs (Swipeable on mobile) */}
      <div className="spell-level-tabs">
        <div className="tabs-scroll">
          {spellLevels.map(lvl => (
            <button
              key={lvl.level}
              className={`level-tab ${selectedLevel === lvl.level ? 'active' : ''}`}
              onClick={() => setSelectedLevel(lvl.level)}
            >
              <span className="tab-icon">{lvl.icon}</span>
              <span className="tab-label">{lvl.label}</span>
              <span className="tab-count">({spellsByLevel[lvl.level].length})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Spells List */}
      <div className="spells-list">
        {currentSpells.length === 0 ? (
          <div className="no-spells">
            <p>No spells at this level</p>
          </div>
        ) : (
          <>
            {currentSpells.map(spell => (
              <div
                key={spell.id}
                className={`spell-card ${spell.prepared ? 'prepared' : ''} ${spell.alwaysPrepared ? 'always-prepared' : ''}`}
                onClick={() => {
                  setSelectedSpell(spell);
                  setShowDetails(true);
                }}
              >
                <div className="spell-header">
                  <span className="spell-icon">{getSpellIcon(spell.school)}</span>
                  <div className="spell-info">
                    <h4 className="spell-name">{spell.name}</h4>
                    <div className="spell-meta">
                      <span className="spell-school">{spell.school}</span>
                      {spell.concentration && <span className="spell-tag concentration">⏱️ Conc</span>}
                      {spell.ritual && <span className="spell-tag ritual">📖 Ritual</span>}
                    </div>
                  </div>
                  {spell.level > 0 && !spell.alwaysPrepared && (
                    <button
                      className={`prepare-btn ${spell.prepared ? 'prepared' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTogglePrepare(spell);
                      }}
                    >
                      {spell.prepared ? '✓' : '○'}
                    </button>
                  )}
                </div>

                <div className="spell-quick-info">
                  {spell.damage && (
                    <span className="quick-stat">
                      ⚔️ {spell.damage} {spell.damageType}
                    </span>
                  )}
                  {spell.attackRoll && (
                    <span className="quick-stat">
                      🎯 +{spellcasting.spellAttackBonus} to hit
                    </span>
                  )}
                  {spell.savingThrow && (
                    <span className="quick-stat">
                      🛡️ {spell.savingThrow} DC {spellcasting.spellSaveDC}
                    </span>
                  )}
                  <span className="quick-stat">
                    📍 {spell.range}
                  </span>
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      {/* Spell Details Bottom Sheet */}
      {showDetails && selectedSpell && (
        <div className="spell-details-overlay" onClick={() => setShowDetails(false)}>
          <div className="spell-details-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="sheet-header">
              <h3>
                <span className="spell-icon-large">{getSpellIcon(selectedSpell.school)}</span>
                {selectedSpell.name}
              </h3>
              <button className="close-btn" onClick={() => setShowDetails(false)}>✕</button>
            </div>

            <div className="sheet-content">
              <div className="spell-stats-grid">
                <div className="stat-item">
                  <span className="label">Level</span>
                  <span className="value">
                    {selectedSpell.level === 0 ? 'Cantrip' : getOrdinalSuffix(selectedSpell.level)}
                  </span>
                </div>
                <div className="stat-item">
                  <span className="label">School</span>
                  <span className="value">{selectedSpell.school}</span>
                </div>
                <div className="stat-item">
                  <span className="label">Casting Time</span>
                  <span className="value">{selectedSpell.castingTime}</span>
                </div>
                <div className="stat-item">
                  <span className="label">Range</span>
                  <span className="value">{selectedSpell.range}</span>
                </div>
                <div className="stat-item">
                  <span className="label">Components</span>
                  <span className="value">{selectedSpell.components}</span>
                </div>
                <div className="stat-item">
                  <span className="label">Duration</span>
                  <span className="value">{selectedSpell.duration}</span>
                </div>
              </div>

              <div className="spell-description">
                <p>{selectedSpell.description}</p>
              </div>

              {/* Cast Button */}
              <button
                className="cast-spell-btn"
                onClick={() => handleCastSpell(selectedSpell)}
                disabled={selectedSpell.level > 0 && !hasSpellSlot(character, selectedSpell.level)}
              >
                {selectedSpell.level === 0 ? '✨ Cast Cantrip' : `🎆 Cast Spell (Use Slot)`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper: Get spell school icon
function getSpellIcon(school) {
  const icons = {
    Evocation: '🔥',
    Abjuration: '🛡️',
    Conjuration: '🌀',
    Divination: '👁️',
    Enchantment: '✨',
    Illusion: '🎭',
    Necromancy: '💀',
    Transmutation: '🔄'
  };
  return icons[school] || '⭐';
}

// Helper: Ordinal suffix
function getOrdinalSuffix(num) {
  const j = num % 10;
  const k = num % 100;
  if (j === 1 && k !== 11) return num + 'st';
  if (j === 2 && k !== 12) return num + 'nd';
  if (j === 3 && k !== 13) return num + 'rd';
  return num + 'th';
}

SpellLibrary.propTypes = {
  character: PropTypes.object.isRequired,
  onCastSpell: PropTypes.func,
  onPrepareSpell: PropTypes.func,
  onRoll: PropTypes.func
};

export default SpellLibrary;
