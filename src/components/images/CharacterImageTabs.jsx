/**
 * Character Image Tabs Component
 * Displays character images with tabs for different types:
 * - Standard Portrait
 * - Battle Portrait
 * - Canvas/Scene
 */

import { useState } from 'react';
import PropTypes from 'prop-types';
import './CharacterImageTabs.css';

function CharacterImageTabs({ character, currentState = 'default' }) {
  const [activeTab, setActiveTab] = useState('portrait');
  const [activePortrait, setActivePortrait] = useState('standard');
  const [activeCanvas, setActiveCanvas] = useState(null);

  // Get state-specific settings
  const stateConfig = character.conversationStates?.[currentState] || character.conversationStates?.default;
  const defaultPortrait = stateConfig?.activePortrait || 'standard';
  const defaultCanvas = stateConfig?.activeCanvas;

  // Get available images
  const portraits = character.images?.portraits || {};
  const canvasImages = character.images?.canvas || {};

  // Determine active image based on state
  const currentPortrait = portraits[activePortrait] || portraits.standard;
  const currentCanvas = activeCanvas ? canvasImages[activeCanvas] : (defaultCanvas ? canvasImages[defaultCanvas] : null);

  const handleTabChange = (tab) => {
    setActiveTab(tab);

    // Auto-select defaults when switching tabs
    if (tab === 'portrait' && !activePortrait) {
      setActivePortrait(defaultPortrait);
    } else if (tab === 'canvas' && !activeCanvas) {
      setActiveCanvas(defaultCanvas || Object.keys(canvasImages)[0]);
    }
  };

  return (
    <div className="character-image-tabs">
      {/* Tab Navigation */}
      <div className="image-tabs-nav">
        <button
          className={`tab-button ${activeTab === 'portrait' ? 'active' : ''}`}
          onClick={() => handleTabChange('portrait')}
        >
          <span className="tab-icon">🎨</span>
          Portrait
        </button>

        <button
          className={`tab-button ${activeTab === 'battle' ? 'active' : ''}`}
          onClick={() => handleTabChange('battle')}
          disabled={!portraits.battle}
        >
          <span className="tab-icon">⚔️</span>
          Battle
        </button>

        <button
          className={`tab-button ${activeTab === 'canvas' ? 'active' : ''}`}
          onClick={() => handleTabChange('canvas')}
          disabled={Object.keys(canvasImages).length === 0}
        >
          <span className="tab-icon">🖼️</span>
          Canvas
        </button>
      </div>

      {/* Image Display */}
      <div className="image-display">
        {activeTab === 'portrait' && (
          <div className="portrait-view">
            <div className="image-container">
              {currentPortrait ? (
                <>
                  <img
                    src={currentPortrait.url}
                    alt={`${character.name} - ${activePortrait}`}
                    className="character-image"
                  />
                  <div className="image-info">
                    <span className="image-type">{activePortrait}</span>
                  </div>
                </>
              ) : (
                <div className="image-placeholder">
                  <span className="placeholder-emoji">{character.images?.emoji || '🎭'}</span>
                  <p>No portrait available</p>
                </div>
              )}
            </div>

            {/* Portrait Type Selector */}
            <div className="portrait-types">
              {Object.keys(portraits).map(type => (
                <button
                  key={type}
                  className={`portrait-type-btn ${activePortrait === type ? 'active' : ''}`}
                  onClick={() => setActivePortrait(type)}
                  disabled={!portraits[type]}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'battle' && (
          <div className="battle-view">
            <div className="image-container battle-frame">
              {portraits.battle ? (
                <>
                  <img
                    src={portraits.battle.url}
                    alt={`${character.name} - Battle`}
                    className="character-image battle-pose"
                  />
                  <div className="battle-overlay">
                    <div className="hp-bar">
                      <div
                        className="hp-fill"
                        style={{
                          width: `${(character.hp.current / character.hp.max) * 100}%`
                        }}
                      />
                      <span className="hp-text">
                        {character.hp.current} / {character.hp.max}
                      </span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="image-placeholder">
                  <span className="placeholder-emoji">⚔️</span>
                  <p>Battle portrait not generated</p>
                  <button className="generate-btn">Generate Battle Portrait</button>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'canvas' && (
          <div className="canvas-view">
            <div className="image-container canvas-frame">
              {currentCanvas ? (
                <>
                  {currentCanvas.type === 'video' ? (
                    <video
                      src={currentCanvas.url}
                      poster={currentCanvas.thumbnailUrl}
                      controls
                      loop
                      className="canvas-video"
                    />
                  ) : (
                    <img
                      src={currentCanvas.url}
                      alt={`${character.name} - ${activeCanvas} scene`}
                      className="canvas-image"
                    />
                  )}
                  <div className="canvas-caption">
                    <span>{activeCanvas}</span>
                  </div>
                </>
              ) : (
                <div className="image-placeholder">
                  <span className="placeholder-emoji">🖼️</span>
                  <p>No canvas scene available</p>
                  <button className="generate-btn">Generate Scene</button>
                </div>
              )}
            </div>

            {/* Canvas Scene Selector */}
            {Object.keys(canvasImages).length > 0 && (
              <div className="canvas-scenes">
                {Object.keys(canvasImages).map(scene => (
                  <button
                    key={scene}
                    className={`scene-btn ${activeCanvas === scene ? 'active' : ''}`}
                    onClick={() => setActiveCanvas(scene)}
                  >
                    <div className="scene-thumbnail">
                      {canvasImages[scene].type === 'video' ? (
                        <img src={canvasImages[scene].thumbnailUrl} alt={scene} />
                      ) : (
                        <img src={canvasImages[scene].url} alt={scene} />
                      )}
                    </div>
                    <span className="scene-name">{scene}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Current State Indicator */}
      {currentState !== 'default' && (
        <div className="state-indicator">
          <span className="state-label">State:</span>
          <span className="state-value">{currentState}</span>
          {stateConfig && (
            <span className="state-mood">({stateConfig.mood})</span>
          )}
        </div>
      )}
    </div>
  );
}

CharacterImageTabs.propTypes = {
  character: PropTypes.shape({
    name: PropTypes.string.isRequired,
    hp: PropTypes.shape({
      current: PropTypes.number,
      max: PropTypes.number
    }),
    images: PropTypes.shape({
      emoji: PropTypes.string,
      portraits: PropTypes.object,
      canvas: PropTypes.object
    }),
    conversationStates: PropTypes.object
  }).isRequired,
  currentState: PropTypes.string
};

export default CharacterImageTabs;
