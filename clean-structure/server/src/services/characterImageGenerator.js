/**
 * Character Image Generation Service
 * Handles multi-image generation for characters (portraits, canvas, abilities)
 */

class CharacterImageGenerator {
  constructor(runwareService) {
    this.runware = runwareService;
    this.generationQueue = [];
    this.processing = false;
  }

  /**
   * Generate all standard images for a character
   * @param {Object} character - Character data
   * @param {Function} progressCallback - Progress updates
   * @returns {Promise<Object>} All generated images
   */
  async generateCharacterImages(character, progressCallback) {
    const images = {
      portraits: {},
      canvas: {},
      abilities: {}
    };

    const totalTasks = 3; // standard portrait, battle portrait, primary canvas
    let completedTasks = 0;

    const updateProgress = (message, partial = {}) => {
      if (progressCallback) {
        progressCallback({
          progress: Math.round((completedTasks / totalTasks) * 100),
          message,
          images: { ...images, ...partial }
        });
      }
    };

    try {
      // 1. Generate standard portrait (required)
      updateProgress('Generating standard portrait...');
      images.portraits.standard = await this.generatePortrait(character, 'standard');
      completedTasks++;
      updateProgress('Standard portrait complete', { portraits: images.portraits });

      // 2. Generate battle portrait
      updateProgress('Generating battle portrait...');
      images.portraits.battle = await this.generatePortrait(character, 'battle');
      completedTasks++;
      updateProgress('Battle portrait complete', { portraits: images.portraits });

      // 3. Generate primary canvas scene
      updateProgress('Generating primary scene...');
      const sceneName = this.getPrimaryScene(character);
      images.canvas[sceneName] = await this.generateCanvas(character, sceneName);
      completedTasks++;
      updateProgress('All images generated!', images);

      return images;
    } catch (error) {
      console.error('Error generating character images:', error);
      throw error;
    }
  }

  /**
   * Generate a specific portrait type
   * @param {Object} character - Character data
   * @param {String} type - Portrait type (standard, battle, injured, etc.)
   * @returns {Promise<Object>} Generated portrait data
   */
  async generatePortrait(character, type = 'standard') {
    const prompt = this.buildPortraitPrompt(character, type);
    const negativePrompt = 'blurry, low quality, distorted, ugly, deformed, bad anatomy, watermark, text, signature, duplicate, multiple faces';

    const result = await this.runware.generateImage({
      prompt,
      negativePrompt,
      model: 'runware:100@1', // Flux.1 Dev
      height: 1024,
      width: 1024,
      steps: 25
    });

    return {
      url: result.url,
      seed: result.seed,
      type,
      prompt,
      generatedAt: new Date().toISOString()
    };
  }

  /**
   * Build portrait prompt based on character and type
   * Simplified to use only 2 main portrait types for cleaner mobile UI
   */
  buildPortraitPrompt(character, type) {
    const baseDescription = `${character.description || character.type}, ${character.class}`;

    const typeModifiers = {
      standard: 'calm pose, neutral expression, professional portrait',
      battle: 'action pose, fierce expression, combat ready, dynamic angle, weapons drawn'
    };

    const modifier = typeModifiers[type] || typeModifiers.standard;

    return `High quality fantasy art portrait of ${character.name}, ${baseDescription}, ${modifier}, detailed features, professional lighting, sharp focus, 8k, highly detailed, D&D character art style`;
  }

  /**
   * Generate a canvas/scene image
   * @param {Object} character - Character data
   * @param {String} sceneName - Scene type (forest, tavern, dungeon, etc.)
   * @returns {Promise<Object>} Generated scene data
   */
  async generateCanvas(character, sceneName) {
    const prompt = this.buildCanvasPrompt(character, sceneName);
    const negativePrompt = 'blurry, low quality, people, characters, text, watermark';

    const result = await this.runware.generateImage({
      prompt,
      negativePrompt,
      model: 'runware:100@1',
      height: 1024,
      width: 1536, // Landscape format for scenes
      steps: 20
    });

    return {
      url: result.url,
      seed: result.seed,
      scene: sceneName,
      prompt,
      type: 'image',
      generatedAt: new Date().toISOString()
    };
  }

  /**
   * Build canvas prompt based on character background and scene
   */
  buildCanvasPrompt(character, sceneName) {
    const sceneDescriptions = {
      forest: `mystical forest at dawn, ancient trees, dappled sunlight, magical atmosphere, ${character.background || 'fantasy'} style`,
      tavern: `cozy fantasy tavern interior, warm firelight, wooden tables, adventurer atmosphere`,
      dungeon: `dark dungeon corridor, stone walls, torch light, ominous atmosphere, ancient ruins`,
      campfire: `nighttime camp under stars, glowing campfire, peaceful atmosphere, forest clearing`,
      mountain: `epic mountain vista, dramatic clouds, high altitude, adventure atmosphere`,
      city: `fantasy city street, medieval architecture, bustling marketplace, detailed buildings`,
      temple: `ancient temple interior, mystical lighting, sacred atmosphere, ornate decoration`,
      battlefield: `epic battlefield aftermath, dramatic sky, war-torn landscape, heroic atmosphere`,
      cave: `mysterious cave interior, crystal formations, bioluminescent glow, underground atmosphere`,
      ocean: `ocean coastline at sunset, dramatic waves, maritime atmosphere, ship in distance`
    };

    const sceneDesc = sceneDescriptions[sceneName] || sceneDescriptions.forest;

    return `High quality fantasy landscape art, ${sceneDesc}, cinematic lighting, detailed environment, 8k, no people, D&D campaign setting, professional illustration`;
  }

  /**
   * Generate ability/spell cast image
   * @param {Object} character - Character data
   * @param {Object} ability - Ability data
   * @returns {Promise<Object>} Generated ability image
   */
  async generateAbilityImage(character, ability) {
    const prompt = this.buildAbilityPrompt(character, ability);
    const negativePrompt = 'blurry, low quality, distorted, text, watermark';

    const result = await this.runware.generateImage({
      prompt,
      negativePrompt,
      model: 'runware:100@1',
      height: 768,
      width: 768,
      steps: 20
    });

    return {
      url: result.url,
      seed: result.seed,
      abilityId: ability.id,
      prompt,
      generatedAt: new Date().toISOString()
    };
  }

  /**
   * Build ability image prompt
   */
  buildAbilityPrompt(character, ability) {
    const abilityType = ability.type || 'ability';

    if (abilityType === 'spell') {
      const schoolStyles = {
        evocation: 'explosive energy, bright flames or lightning, destructive power',
        abjuration: 'protective shield, glowing barrier, defensive magic',
        conjuration: 'summoning portal, mystical gate, creatures appearing',
        divination: 'mystical sight, glowing eyes, prophetic visions',
        enchantment: 'mind control, swirling charm magic, mesmerizing patterns',
        illusion: 'reality bending, mirror images, deceptive magic',
        necromancy: 'dark energy, death magic, shadowy power',
        transmutation: 'shapeshifting energy, transformative magic, morphing effect'
      };

      const schoolStyle = schoolStyles[ability.school] || 'magical energy';

      return `Fantasy spell effect, ${ability.name}, ${schoolStyle}, ${character.name} casting magic, dynamic magical effects, cinematic lighting, 8k, detailed magic visualization`;
    }

    // Physical abilities
    return `Fantasy action scene, ${ability.name}, ${character.name} performing ${ability.description}, dynamic action pose, motion blur, dramatic lighting, epic combat art, 8k detailed`;
  }

  /**
   * Generate canvas video for dramatic scenes
   * @param {Object} character - Character data
   * @param {String} sceneName - Scene type
   * @returns {Promise<Object>} Generated video data
   */
  async generateCanvasVideo(character, sceneName) {
    const prompt = this.buildVideoPrompt(character, sceneName);

    const result = await this.runware.generateVideo({
      prompt,
      model: 'runware:101@1', // Kling AI v1.5
      duration: 5,
      ratio: '16:9'
    });

    return {
      url: result.url,
      thumbnailUrl: result.thumbnailUrl,
      scene: sceneName,
      prompt,
      type: 'video',
      duration: 5,
      generatedAt: new Date().toISOString()
    };
  }

  /**
   * Build video prompt for canvas scenes
   */
  buildVideoPrompt(character, sceneName) {
    const videoScenes = {
      combat: `Epic fantasy battle scene, ${character.name} fighting enemies, dynamic combat, weapons clashing, dramatic action`,
      exploration: `Fantasy adventure scene, exploring ancient ruins, discovery moment, atmospheric environment`,
      spell: `Dramatic spell casting, magical energy swirling, mystical effects, epic magic`,
      travel: `Fantasy journey through landscapes, cinematic travel sequence, beautiful environments`,
      victory: `Victory celebration scene, triumphant hero moment, epic conclusion`
    };

    const sceneDesc = videoScenes[sceneName] || videoScenes.combat;

    return `Cinematic ${sceneDesc}, realistic motion, smooth camera movement, dramatic lighting, high quality fantasy film style`;
  }

  /**
   * Determine primary scene based on character background
   */
  getPrimaryScene(character) {
    const backgroundScenes = {
      'Outlander': 'forest',
      'Soldier': 'battlefield',
      'Criminal': 'city',
      'Sage': 'temple',
      'Folk Hero': 'tavern',
      'Noble': 'city',
      'Acolyte': 'temple',
      'Sailor': 'ocean'
    };

    return backgroundScenes[character.background] || 'forest';
  }

  /**
   * Add generation task to queue
   */
  queueGeneration(task) {
    this.generationQueue.push(task);
    if (!this.processing) {
      this.processQueue();
    }
  }

  /**
   * Process generation queue
   */
  async processQueue() {
    if (this.generationQueue.length === 0) {
      this.processing = false;
      return;
    }

    this.processing = true;
    const task = this.generationQueue.shift();

    try {
      await task.execute();
    } catch (error) {
      console.error('Queue task failed:', error);
    }

    // Continue processing
    setTimeout(() => this.processQueue(), 1000);
  }
}

export default CharacterImageGenerator;
