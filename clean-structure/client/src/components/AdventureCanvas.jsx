import React, { useState, useEffect } from 'react';
import './AdventureCanvas.css';

/**
 * AdventureCanvas - Visual adventure mode component
 *
 * Displays scene images, narrative text, character responses, and choices
 * Supports hybrid image loading: preset → AI-generated → fallback
 */
const AdventureCanvas = ({
  currentNode,
  character,
  onChoice,
  onOpenCharacterSheet,
  combatActive
}) => {
  const [imageSource, setImageSource] = useState(null);
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  // Load image with hybrid approach
  useEffect(() => {
    if (!currentNode?.sceneImage) {
      setImageSource(null);
      setImageLoading(false);
      return;
    }

    setImageLoading(true);
    setImageError(false);

    const { preset, fallback } = currentNode.sceneImage;

    // Try preset first
    const img = new Image();
    img.onload = () => {
      setImageSource(preset);
      setImageLoading(false);
    };
    img.onerror = () => {
      // Preset failed, use fallback
      console.log('Preset image failed, using fallback');
      const fallbackImg = new Image();
      fallbackImg.onload = () => {
        setImageSource(fallback);
        setImageLoading(false);
      };
      fallbackImg.onerror = () => {
        setImageError(true);
        setImageLoading(false);
      };
      fallbackImg.src = fallback;
    };
    img.src = preset;
  }, [currentNode?.sceneImage]);

  const renderChoices = () => {
    if (!currentNode?.choices) return null;

    return (
      <div className="adventure-choices">
        {currentNode.choices.map((choice, index) => (
          <button
            key={choice.id || index}
            className="adventure-choice-button"
            onClick={() => onChoice(choice)}
          >
            <span className="choice-icon">{choice.icon}</span>
            <span className="choice-text">{choice.text}</span>
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="adventure-canvas">
      {/* Scene Image */}
      <div className="adventure-scene">
        {imageLoading && (
          <div className="scene-loading">
            <div className="loading-spinner"></div>
            <p>Loading scene...</p>
          </div>
        )}

        {!imageLoading && !imageError && imageSource && (
          <img
            src={imageSource}
            alt="Adventure scene"
            className="scene-image"
          />
        )}

        {!imageLoading && imageError && (
          <div className="scene-placeholder">
            <div className="placeholder-icon">🏛️</div>
            <p>Scene visualization unavailable</p>
          </div>
        )}

        {/* Character portrait overlay */}
        {character && (
          <div className="character-portrait-overlay">
            <img
              src={character.portrait}
              alt={character.name}
              className="portrait-image"
            />
          </div>
        )}
      </div>

      {/* Narrative Content */}
      <div className="adventure-content">
        {/* Narrative text */}
        {currentNode?.text && (
          <div className="narrative-text">
            <p>{currentNode.text}</p>
          </div>
        )}

        {/* Character response */}
        {currentNode?.characterResponse && character && (
          <div className="character-response">
            <div className="response-header">
              <strong>{character.name}</strong>
            </div>
            <p className="response-text">{currentNode.characterResponse}</p>
          </div>
        )}

        {/* Choices */}
        {renderChoices()}
      </div>

      {/* Bottom toolbar */}
      <div className="adventure-toolbar">
        <button
          className="toolbar-button"
          onClick={onOpenCharacterSheet}
          title="Character Sheet"
        >
          📋 Character
        </button>

        {combatActive && (
          <button
            className="toolbar-button combat-active"
            onClick={onOpenCharacterSheet}
            title="Enter Combat"
          >
            ⚔️ Combat
          </button>
        )}
      </div>
    </div>
  );
};

export default AdventureCanvas;
