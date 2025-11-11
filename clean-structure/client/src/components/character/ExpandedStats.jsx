/**
 * Expanded Character Stats Component
 * Displays comprehensive D&D 5e character statistics
 */

import PropTypes from 'prop-types';
import './ExpandedStats.css';

function ExpandedStats({ character }) {
  const {
    stats = {},
    computed = {},
    skills = {},
    savingThrows = {},
    resources = {},
    conditions = [],
    exhaustion = 0
  } = character;

  // Calculate ability modifiers
  const getModifier = (score) => {
    return Math.floor((score - 10) / 2);
  };

  const formatModifier = (mod) => {
    return mod >= 0 ? `+${mod}` : `${mod}`;
  };

  // Ability score display
  const abilities = [
    { key: 'str', name: 'Strength', icon: '💪' },
    { key: 'dex', name: 'Dexterity', icon: '🏃' },
    { key: 'con', name: 'Constitution', icon: '❤️' },
    { key: 'int', name: 'Intelligence', icon: '🧠' },
    { key: 'wis', name: 'Wisdom', icon: '👁️' },
    { key: 'cha', name: 'Charisma', icon: '✨' }
  ];

  // Computed stats
  const computedStats = [
    { label: 'Proficiency', value: `+${computed.proficiencyBonus || 2}` },
    { label: 'Initiative', value: formatModifier(computed.initiative || 0) },
    { label: 'Speed', value: `${computed.speed || 30} ft` },
    { label: 'Passive Perception', value: computed.passivePerception || 10 }
  ];

  if (computed.spellSaveDC) {
    computedStats.push({ label: 'Spell Save DC', value: computed.spellSaveDC });
    computedStats.push({ label: 'Spell Attack', value: `+${computed.spellAttackBonus}` });
  }

  return (
    <div className="expanded-stats">
      {/* Core Stats */}
      <div className="stats-section">
        <h3 className="section-title">Ability Scores</h3>
        <div className="ability-grid">
          {abilities.map(ability => {
            const score = stats[ability.key] || 10;
            const modifier = getModifier(score);

            return (
              <div key={ability.key} className="ability-block">
                <div className="ability-icon">{ability.icon}</div>
                <div className="ability-name">{ability.name}</div>
                <div className="ability-score">{score}</div>
                <div className="ability-modifier">{formatModifier(modifier)}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Computed Stats */}
      <div className="stats-section">
        <h3 className="section-title">Combat Stats</h3>
        <div className="computed-grid">
          {computedStats.map((stat, idx) => (
            <div key={idx} className="stat-item">
              <span className="stat-label">{stat.label}</span>
              <span className="stat-value">{stat.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Saving Throws */}
      <div className="stats-section">
        <h3 className="section-title">Saving Throws</h3>
        <div className="saves-grid">
          {abilities.map(ability => {
            const saveBonus = savingThrows[ability.key] || getModifier(stats[ability.key] || 10);
            const isProficient = saveBonus > getModifier(stats[ability.key] || 10);

            return (
              <div key={ability.key} className={`save-item ${isProficient ? 'proficient' : ''}`}>
                <span className="save-name">{ability.name.slice(0, 3).toUpperCase()}</span>
                <span className="save-value">{formatModifier(saveBonus)}</span>
                {isProficient && <span className="prof-indicator">●</span>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Skills */}
      {Object.keys(skills).length > 0 && (
        <div className="stats-section">
          <h3 className="section-title">Skills</h3>
          <div className="skills-list">
            {Object.entries(skills).map(([skillName, skillData]) => {
              const profClass = skillData.proficiency === 'expertise' ? 'expertise' :
                                skillData.proficiency === 'proficient' ? 'proficient' : '';

              return (
                <div key={skillName} className={`skill-item ${profClass}`}>
                  <span className="skill-name">{formatSkillName(skillName)}</span>
                  <span className="skill-value">{formatModifier(skillData.value)}</span>
                  {skillData.proficiency !== 'none' && (
                    <span className="skill-prof">
                      {skillData.proficiency === 'expertise' ? '⚫⚫' : '⚫'}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Resources */}
      {Object.keys(resources).length > 0 && (
        <div className="stats-section">
          <h3 className="section-title">Resources</h3>

          {/* Hit Dice */}
          {resources.hitDice && (
            <div className="resource-item">
              <span className="resource-label">Hit Dice</span>
              <div className="resource-tracker">
                <span className="resource-value">
                  {resources.hitDice.current}/{resources.hitDice.max} {resources.hitDice.type}
                </span>
                <div className="resource-bar">
                  <div
                    className="resource-fill"
                    style={{
                      width: `${(resources.hitDice.current / resources.hitDice.max) * 100}%`
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Spell Slots */}
          {resources.spellSlots && (
            <div className="resource-item">
              <span className="resource-label">Spell Slots</span>
              <div className="spell-slots-grid">
                {Object.entries(resources.spellSlots).map(([level, slots]) => (
                  <div key={level} className="spell-slot">
                    <span className="slot-level">Lv{level}</span>
                    <span className="slot-count">{slots.current}/{slots.max}</span>
                    <div className="slot-dots">
                      {Array.from({ length: slots.max }).map((_, i) => (
                        <span
                          key={i}
                          className={`slot-dot ${i < slots.current ? 'available' : 'used'}`}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Custom Resources */}
          {resources.custom && resources.custom.length > 0 && (
            <>
              {resources.custom.map((resource, idx) => (
                <div key={idx} className="resource-item">
                  <span className="resource-label">{resource.name}</span>
                  <div className="resource-tracker">
                    <span className="resource-value">
                      {resource.current}/{resource.max}
                    </span>
                    <div className="resource-bar">
                      <div
                        className="resource-fill"
                        style={{
                          width: `${(resource.current / resource.max) * 100}%`
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      )}

      {/* Conditions & Status */}
      {(conditions.length > 0 || exhaustion > 0) && (
        <div className="stats-section">
          <h3 className="section-title">Status Effects</h3>

          {exhaustion > 0 && (
            <div className="status-item exhaustion">
              <span className="status-icon">😓</span>
              <span className="status-name">Exhaustion Level {exhaustion}</span>
            </div>
          )}

          {conditions.map((condition, idx) => (
            <div key={idx} className="status-item">
              <span className="status-icon">{getConditionIcon(condition)}</span>
              <span className="status-name">{condition}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Helper: Format skill names
function formatSkillName(skillName) {
  return skillName
    .split(/(?=[A-Z])/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// Helper: Get condition icon
function getConditionIcon(condition) {
  const icons = {
    poisoned: '🤢',
    paralyzed: '⚡',
    stunned: '💫',
    blinded: '👁️‍🗨️',
    deafened: '🔇',
    frightened: '😱',
    charmed: '💘',
    invisible: '👻',
    prone: '🔻',
    restrained: '⛓️',
    grappled: '🤝',
    blessed: '✨',
    hasted: '⚡',
    enlarged: '📈',
    reduced: '📉'
  };
  return icons[condition.toLowerCase()] || '🔷';
}

ExpandedStats.propTypes = {
  character: PropTypes.shape({
    stats: PropTypes.object,
    computed: PropTypes.object,
    skills: PropTypes.object,
    savingThrows: PropTypes.object,
    resources: PropTypes.object,
    conditions: PropTypes.array,
    exhaustion: PropTypes.number
  }).isRequired
};

export default ExpandedStats;
