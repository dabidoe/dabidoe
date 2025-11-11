/**
 * Interactive Stats Component
 * Mobile-first clickable character stats for D&D 5e
 * Click skills/saves/abilities to roll with animation
 */

import { useState } from 'react';
import PropTypes from 'prop-types';
import {
  getAbilityModifier,
  formatModifier,
  rollSkillCheck,
  rollSavingThrow
} from '../../utils/5e-mechanics';
import './InteractiveStats.css';

function InteractiveStats({ character, onRoll, onUpdateCharacter }) {
  const [selectedAbility, setSelectedAbility] = useState(null);
  const [showAbilityMenu, setShowAbilityMenu] = useState(false);

  const { stats, skills, savingThrows, proficiencyBonus, level } = character;
  const computed = character.computed || {};

  // Calculate proficiency if not provided
  const prof = proficiencyBonus || (2 + Math.floor((level - 1) / 4));

  // Abilities
  const abilities = [
    { key: 'str', name: 'Strength', icon: '💪', color: '#e74c3c' },
    { key: 'dex', name: 'Dexterity', icon: '🏃', color: '#3498db' },
    { key: 'con', name: 'Constitution', icon: '❤️', color: '#e67e22' },
    { key: 'int', name: 'Intelligence', icon: '🧠', color: '#9b59b6' },
    { key: 'wis', name: 'Wisdom', icon: '👁️', color: '#1abc9c' },
    { key: 'cha', name: 'Charisma', icon: '✨', color: '#f39c12' }
  ];

  // Skills organized by ability
  const skillsByAbility = {
    str: ['athletics'],
    dex: ['acrobatics', 'sleightOfHand', 'stealth'],
    int: ['arcana', 'history', 'investigation', 'nature', 'religion'],
    wis: ['animalHandling', 'insight', 'medicine', 'perception', 'survival'],
    cha: ['deception', 'intimidation', 'performance', 'persuasion']
  };

  // Format skill name for display
  const formatSkillName = (skillName) => {
    return skillName
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
  };

  // Handle skill roll
  const handleSkillRoll = (skillName, skillData) => {
    const abilityScore = stats[skillData.ability];
    const result = rollSkillCheck({
      abilityScore,
      proficiency: skillData.proficiency,
      proficiencyBonus: prof
    });

    // Trigger dice animation
    if (onRoll) {
      onRoll({
        type: `${formatSkillName(skillName)} Check`,
        diceType: 'd20',
        total: result.total,
        breakdown: result.breakdown,
        critical: result.isCriticalSuccess ? 'success' : (result.isCriticalFailure ? 'fail' : null)
      });
    }

    return result;
  };

  // Handle saving throw
  const handleSaveRoll = (abilityKey) => {
    const abilityScore = stats[abilityKey];
    const saveData = savingThrows[abilityKey] || { proficient: false };

    const result = rollSavingThrow({
      abilityScore,
      proficient: saveData.proficient,
      proficiencyBonus: prof
    });

    const abilityName = abilities.find(a => a.key === abilityKey)?.name;

    if (onRoll) {
      onRoll({
        type: `${abilityName} Save`,
        diceType: 'd20',
        total: result.total,
        breakdown: result.breakdown,
        critical: result.isCriticalSuccess ? 'success' : (result.isCriticalFailure ? 'fail' : null)
      });
    }

    return result;
  };

  // Handle ability score click
  const handleAbilityClick = (ability) => {
    setSelectedAbility(ability);
    setShowAbilityMenu(true);
  };

  // Close ability menu
  const closeAbilityMenu = () => {
    setShowAbilityMenu(false);
    setSelectedAbility(null);
  };

  return (
    <div className="interactive-stats">
      {/* Ability Scores */}
      <div className="stats-section">
        <h3 className="section-title">Ability Scores</h3>
        <div className="ability-grid">
          {abilities.map(ability => {
            const score = stats[ability.key] || 10;
            const modifier = getAbilityModifier(score);

            return (
              <button
                key={ability.key}
                className="ability-block interactive"
                onClick={() => handleAbilityClick(ability)}
                style={{ '--ability-color': ability.color }}
              >
                <div className="ability-icon">{ability.icon}</div>
                <div className="ability-name">{ability.name.slice(0, 3).toUpperCase()}</div>
                <div className="ability-score">{score}</div>
                <div className="ability-modifier">{formatModifier(modifier)}</div>
                <div className="tap-hint">Tap to roll</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Skills */}
      <div className="stats-section">
        <h3 className="section-title">Skills</h3>
        {Object.entries(skillsByAbility).map(([abilityKey, skillNames]) => {
          const ability = abilities.find(a => a.key === abilityKey);
          const abilitySkills = skillNames
            .map(name => ({ name, data: skills[name] }))
            .filter(s => s.data);

          if (abilitySkills.length === 0) return null;

          return (
            <div key={abilityKey} className="skill-group">
              <div className="skill-group-header">
                <span className="group-icon">{ability.icon}</span>
                <span className="group-name">{ability.name}</span>
              </div>
              <div className="skill-list">
                {abilitySkills.map(({ name, data }) => {
                  const profClass = data.proficiency === 2 ? 'expertise' :
                                   data.proficiency === 1 ? 'proficient' : '';

                  return (
                    <button
                      key={name}
                      className={`skill-button ${profClass}`}
                      onClick={() => handleSkillRoll(name, data)}
                    >
                      <span className="skill-name">{formatSkillName(name)}</span>
                      <span className="skill-value">{formatModifier(data.value || 0)}</span>
                      {data.proficiency > 0 && (
                        <span className="skill-prof">
                          {data.proficiency === 2 ? '⚫⚫' : '⚫'}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Saving Throws */}
      <div className="stats-section">
        <h3 className="section-title">Saving Throws</h3>
        <div className="saves-grid">
          {abilities.map(ability => {
            const saveData = savingThrows[ability.key] || { proficient: false };
            const abilityMod = getAbilityModifier(stats[ability.key] || 10);
            const saveMod = abilityMod + (saveData.proficient ? prof : 0);

            return (
              <button
                key={ability.key}
                className={`save-button ${saveData.proficient ? 'proficient' : ''}`}
                onClick={() => handleSaveRoll(ability.key)}
              >
                <span className="save-icon">{ability.icon}</span>
                <span className="save-name">{ability.name.slice(0, 3).toUpperCase()}</span>
                <span className="save-value">{formatModifier(saveMod)}</span>
                {saveData.proficient && <span className="prof-dot">●</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Combat Stats */}
      <div className="stats-section">
        <h3 className="section-title">Combat</h3>
        <div className="combat-stats-grid">
          <div className="combat-stat">
            <span className="stat-label">AC</span>
            <span className="stat-value">{character.ac || 10}</span>
          </div>
          <div className="combat-stat">
            <span className="stat-label">Initiative</span>
            <span className="stat-value">{formatModifier(computed.initiative || 0)}</span>
          </div>
          <div className="combat-stat">
            <span className="stat-label">Speed</span>
            <span className="stat-value">{computed.speed || 30} ft</span>
          </div>
          <div className="combat-stat">
            <span className="stat-label">Prof Bonus</span>
            <span className="stat-value">+{prof}</span>
          </div>
        </div>
      </div>

      {/* Ability Menu Modal */}
      {showAbilityMenu && selectedAbility && (
        <div className="ability-menu-overlay" onClick={closeAbilityMenu}>
          <div className="ability-menu" onClick={(e) => e.stopPropagation()}>
            <div className="menu-header">
              <span className="menu-icon">{selectedAbility.icon}</span>
              <h3>{selectedAbility.name}</h3>
              <button className="close-btn" onClick={closeAbilityMenu}>✕</button>
            </div>
            <div className="menu-content">
              <div className="ability-details">
                <div className="detail-row">
                  <span className="label">Score</span>
                  <span className="value">{stats[selectedAbility.key]}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Modifier</span>
                  <span className="value large">
                    {formatModifier(getAbilityModifier(stats[selectedAbility.key]))}
                  </span>
                </div>
              </div>

              <div className="menu-actions">
                <button
                  className="action-btn primary"
                  onClick={() => {
                    handleSaveRoll(selectedAbility.key);
                    closeAbilityMenu();
                  }}
                >
                  🎲 Roll Saving Throw
                </button>

                <button
                  className="action-btn secondary"
                  onClick={() => {
                    const modifier = getAbilityModifier(stats[selectedAbility.key]);
                    if (onRoll) {
                      onRoll({
                        type: `${selectedAbility.name} Check`,
                        diceType: 'd20',
                        total: Math.floor(Math.random() * 20) + 1 + modifier,
                        breakdown: `d20 + ${formatModifier(modifier)}`
                      });
                    }
                    closeAbilityMenu();
                  }}
                >
                  🎯 Roll Ability Check
                </button>
              </div>

              {/* Show related skills */}
              {skillsByAbility[selectedAbility.key] && (
                <div className="related-skills">
                  <h4>Related Skills</h4>
                  {skillsByAbility[selectedAbility.key].map(skillName => {
                    const skillData = skills[skillName];
                    if (!skillData) return null;

                    return (
                      <button
                        key={skillName}
                        className="skill-quick-roll"
                        onClick={() => {
                          handleSkillRoll(skillName, skillData);
                          closeAbilityMenu();
                        }}
                      >
                        {formatSkillName(skillName)} {formatModifier(skillData.value || 0)}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

InteractiveStats.propTypes = {
  character: PropTypes.shape({
    stats: PropTypes.object.isRequired,
    skills: PropTypes.object,
    savingThrows: PropTypes.object,
    proficiencyBonus: PropTypes.number,
    level: PropTypes.number,
    ac: PropTypes.number,
    computed: PropTypes.object
  }).isRequired,
  onRoll: PropTypes.func,
  onUpdateCharacter: PropTypes.func
};

export default InteractiveStats;
