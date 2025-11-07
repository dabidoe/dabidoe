/**
 * Character API Routes
 * Handles character creation, retrieval, and AI-powered portrait generation
 */

import express from 'express';

const router = express.Router();

// In-memory character storage (replace with MongoDB in production)
const characters = new Map();

/**
 * GET /api/characters
 * Get all characters
 */
router.get('/', async (req, res) => {
  try {
    const { limit = 20, offset = 0, sort = 'created' } = req.query;

    const characterList = Array.from(characters.values());

    // Sort
    if (sort === 'created') {
      characterList.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }

    // Paginate
    const total = characterList.length;
    const paginatedList = characterList.slice(parseInt(offset), parseInt(offset) + parseInt(limit));

    res.json({
      success: true,
      data: paginatedList,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: parseInt(offset) + parseInt(limit) < total
      }
    });
  } catch (error) {
    console.error('Error fetching characters:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to fetch characters'
      }
    });
  }
});

/**
 * GET /api/characters/:id
 * Get character by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const character = characters.get(req.params.id);

    if (!character) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'CHARACTER_NOT_FOUND',
          message: `Character with ID '${req.params.id}' not found`
        }
      });
    }

    res.json({
      success: true,
      data: character
    });
  } catch (error) {
    console.error('Error fetching character:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to fetch character'
      }
    });
  }
});

/**
 * POST /api/characters/create
 * Create a new character from a prompt using AI
 */
router.post('/create', async (req, res) => {
  try {
    const { prompt, options = {} } = req.body;

    if (!prompt || typeof prompt !== 'string' || prompt.trim().length < 10) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_REQUEST',
          message: 'Prompt must be at least 10 characters long'
        }
      });
    }

    const startTime = Date.now();

    // TODO: Use AI (Claude/OpenAI) to generate character stats from prompt
    // For now, create a basic character structure
    const characterId = `char_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const character = {
      id: characterId,
      name: extractNameFromPrompt(prompt),
      type: 'Custom Character',
      description: prompt,
      portrait: '🎭', // Default emoji
      hp: {
        current: options.level ? options.level * 8 + 10 : 30,
        max: options.level ? options.level * 8 + 10 : 30
      },
      ac: 12 + Math.floor(Math.random() * 6),
      level: options.level || 1,
      class: 'Adventurer',
      background: 'Mysterious',
      abilities: [
        {
          id: 'basic_attack',
          name: 'Basic Attack',
          icon: '⚔️',
          description: 'A standard attack',
          cooldown: 0,
          damage: '1d6+2'
        }
      ],
      stats: {
        str: 10 + Math.floor(Math.random() * 8),
        dex: 10 + Math.floor(Math.random() * 8),
        con: 10 + Math.floor(Math.random() * 8),
        int: 10 + Math.floor(Math.random() * 8),
        wis: 10 + Math.floor(Math.random() * 8),
        cha: 10 + Math.floor(Math.random() * 8)
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Generate portrait if requested
    if (options.generatePortrait) {
      try {
        const runware = req.app.locals.runware;
        const portraitResult = await runware.generateCharacterPortrait({
          characterName: character.name,
          characterDescription: prompt,
          style: options.style || 'fantasy art'
        });

        character.thumbnail = portraitResult.url;
        character.portraitSeed = portraitResult.seed;
      } catch (error) {
        console.error('Failed to generate portrait:', error);
        // Continue without portrait
      }
    }

    // Store character
    characters.set(characterId, character);

    const generationTime = (Date.now() - startTime) / 1000;

    res.json({
      success: true,
      data: {
        ...character,
        generationTime
      }
    });
  } catch (error) {
    console.error('Error creating character:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'GENERATION_FAILED',
        message: 'Failed to generate character from prompt',
        details: error.message
      }
    });
  }
});

/**
 * POST /api/characters/:id/portrait
 * Generate or regenerate a character portrait
 */
router.post('/:id/portrait', async (req, res) => {
  try {
    const character = characters.get(req.params.id);

    if (!character) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'CHARACTER_NOT_FOUND',
          message: `Character with ID '${req.params.id}' not found`
        }
      });
    }

    const { style = 'fantasy art', regenerate = false } = req.body;

    const runware = req.app.locals.runware;

    const portraitResult = await runware.generateCharacterPortrait({
      characterName: character.name,
      characterDescription: character.description,
      style,
      format: 'portrait'
    });

    // Update character with new portrait
    character.thumbnail = portraitResult.url;
    character.portraitSeed = portraitResult.seed;
    character.updated_at = new Date().toISOString();

    characters.set(req.params.id, character);

    res.json({
      success: true,
      data: {
        portraitUrl: portraitResult.url,
        seed: portraitResult.seed,
        character
      }
    });
  } catch (error) {
    console.error('Error generating portrait:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'GENERATION_FAILED',
        message: 'Failed to generate character portrait',
        details: error.message
      }
    });
  }
});

/**
 * POST /api/chat
 * Send a chat message to a character
 */
router.post('/chat', async (req, res) => {
  try {
    const { characterId, message, conversationHistory = [] } = req.body;

    if (!message || !characterId) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_REQUEST',
          message: 'characterId and message are required'
        }
      });
    }

    const character = characters.get(characterId);

    if (!character) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'CHARACTER_NOT_FOUND',
          message: `Character with ID '${characterId}' not found`
        }
      });
    }

    // TODO: Integrate with Claude/OpenAI for character responses
    // For now, return a placeholder response
    const response = {
      type: 'character',
      mood: 'thoughtful',
      text: `${character.name} considers your words carefully before responding...`,
      emotion: 'neutral',
      timestamp: new Date().toISOString()
    };

    res.json({
      success: true,
      data: response
    });
  } catch (error) {
    console.error('Error sending chat message:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to process chat message'
      }
    });
  }
});

/**
 * PATCH /api/characters/:id/stats
 * Update character stats
 */
router.patch('/:id/stats', async (req, res) => {
  try {
    const character = characters.get(req.params.id);

    if (!character) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'CHARACTER_NOT_FOUND',
          message: `Character with ID '${req.params.id}' not found`
        }
      });
    }

    const { hp, conditions, inventory } = req.body;

    if (hp) {
      character.hp = { ...character.hp, ...hp };
    }

    if (conditions) {
      character.conditions = conditions;
    }

    if (inventory) {
      if (!character.inventory) character.inventory = [];
      if (inventory.add) character.inventory.push(...inventory.add);
      if (inventory.remove) {
        character.inventory = character.inventory.filter(
          item => !inventory.remove.includes(item)
        );
      }
    }

    character.updated_at = new Date().toISOString();
    characters.set(req.params.id, character);

    res.json({
      success: true,
      data: character
    });
  } catch (error) {
    console.error('Error updating character stats:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to update character stats'
      }
    });
  }
});

/**
 * Helper: Extract name from prompt
 */
function extractNameFromPrompt(prompt) {
  // Simple name extraction - can be improved with AI
  const nameMatch = prompt.match(/(?:named|called)\s+([A-Z][a-z]+)/i);
  if (nameMatch) return nameMatch[1];

  // Look for capitalized words
  const words = prompt.split(' ');
  const capitalizedWords = words.filter(w => /^[A-Z][a-z]+$/.test(w));
  if (capitalizedWords.length > 0) return capitalizedWords[0];

  return 'Unnamed Character';
}

export default router;
