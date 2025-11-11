/**
 * Character API Routes
 * Integrated with Gemini AI, MongoDB, and Bunny CDN
 * Includes D&D 5e roll mechanics
 */

import express from 'express';

const router = express.Router();

/**
 * GET /api/characters
 * Get all characters (paginated)
 */
router.get('/', async (req, res) => {
  try {
    const { limit = 20, skip = 0 } = req.query;
    const mongodb = req.app.locals.services.mongodb;

    if (!mongodb) {
      return res.status(503).json({
        success: false,
        error: { message: 'Database not available' }
      });
    }

    const characters = await mongodb.getCharacters({
      limit: parseInt(limit),
      skip: parseInt(skip)
    });

    res.json({
      success: true,
      data: characters
    });
  } catch (error) {
    console.error('Error fetching characters:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch characters' }
    });
  }
});

/**
 * GET /api/characters/:id
 * Get character by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const mongodb = req.app.locals.services.mongodb;

    if (!mongodb) {
      return res.status(503).json({
        success: false,
        error: { message: 'Database not available' }
      });
    }

    const character = await mongodb.getCharacter(req.params.id);

    if (!character) {
      return res.status(404).json({
        success: false,
        error: { message: 'Character not found' }
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
      error: { message: 'Failed to fetch character' }
    });
  }
});

/**
 * POST /api/characters/create
 * Create character from prompt using Gemini AI
 */
router.post('/create', async (req, res) => {
  try {
    const { prompt, generateImage = true } = req.body;

    if (!prompt || prompt.trim().length < 10) {
      return res.status(400).json({
        success: false,
        error: { message: 'Prompt must be at least 10 characters' }
      });
    }

    const { gemini, mongodb, runware, bunny } = req.app.locals.services;

    if (!gemini) {
      return res.status(503).json({
        success: false,
        error: { message: 'AI service not available' }
      });
    }

    // Generate character using Gemini
    const character = await gemini.generateCharacter(prompt);

    // Generate and upload portrait (free tier - 1 image only)
    if (generateImage && runware && bunny) {
      try {
        const imageResult = await runware.generateImage({
          prompt: character.imagePrompt,
          width: 512,
          height: 768,
          steps: 20
        });

        const uploadResult = await bunny.uploadCharacterPortrait(
          character.id,
          imageResult.url,
          'standard'
        );

        character.images = { portrait: uploadResult.cdnUrl };
        character.imageSeed = imageResult.seed;
      } catch (error) {
        console.error('Image generation failed:', error);
        character.images = { portrait: null };
      }
    }

    // Save to MongoDB
    if (mongodb) {
      await mongodb.createCharacter(character);
    }

    res.json({
      success: true,
      data: character
    });
  } catch (error) {
    console.error('Character creation error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to create character', details: error.message }
    });
  }
});

/**
 * POST /api/characters/:id/roll/skill
 * Roll a skill check with AI narrative
 */
router.post('/:id/roll/skill', async (req, res) => {
  try {
    const { skillName, advantage = false, disadvantage = false } = req.body;

    if (!skillName) {
      return res.status(400).json({
        success: false,
        error: { message: 'Skill name is required' }
      });
    }

    const { mongodb, gemini } = req.app.locals.services;
    const character = mongodb ? await mongodb.getCharacter(req.params.id) : null;

    if (!character) {
      return res.status(404).json({
        success: false,
        error: { message: 'Character not found' }
      });
    }

    // Calculate roll
    const skill = character.skills[skillName];
    if (!skill) {
      return res.status(404).json({
        success: false,
        error: { message: 'Skill not found' }
      });
    }

    const prof = 2 + Math.floor((character.level - 1) / 4);
    const abilityMod = Math.floor((character.stats[skill.ability] - 10) / 2);
    const profMod = skill.proficiency * prof;
    const totalMod = abilityMod + profMod;

    let roll1 = Math.floor(Math.random() * 20) + 1;
    let roll2 = null;
    let rollUsed = roll1;

    if (advantage && !disadvantage) {
      roll2 = Math.floor(Math.random() * 20) + 1;
      rollUsed = Math.max(roll1, roll2);
    } else if (disadvantage && !advantage) {
      roll2 = Math.floor(Math.random() * 20) + 1;
      rollUsed = Math.min(roll1, roll2);
    }

    const total = rollUsed + totalMod;
    const breakdown = roll2
      ? `${advantage ? 'ADV' : 'DIS'}(${roll1}, ${roll2}) = ${rollUsed} + ${totalMod} = ${total}`
      : `${rollUsed} + ${totalMod} = ${total}`;

    // Generate AI narrative
    let narrative = `${character.name} rolled ${total} for ${formatSkillName(skillName)}.`;
    if (gemini) {
      try {
        const prompt = `${character.name} rolls a ${formatSkillName(skillName)} check and gets ${total} (rolled ${rollUsed} + ${totalMod}).

Generate a dramatic, cinematic 1-sentence description of what they're doing. Be vivid and action-focused. Consider if it's a high roll (15+) or low roll (<10).`;

        const aiResponse = await gemini.model.generateContent(prompt);
        narrative = aiResponse.response.text().trim();
      } catch (error) {
        console.error('Narrative generation failed:', error);
      }
    }

    res.json({
      success: true,
      data: {
        skill: formatSkillName(skillName),
        roll: rollUsed,
        modifier: totalMod,
        total,
        breakdown,
        narrative,
        isCriticalSuccess: rollUsed === 20,
        isCriticalFailure: rollUsed === 1
      }
    });
  } catch (error) {
    console.error('Skill roll error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to roll skill' }
    });
  }
});

/**
 * POST /api/characters/:id/roll/save
 * Roll a saving throw with AI narrative
 */
router.post('/:id/roll/save', async (req, res) => {
  try {
    const { ability, advantage = false, disadvantage = false } = req.body;

    if (!ability) {
      return res.status(400).json({
        success: false,
        error: { message: 'Ability is required' }
      });
    }

    const { mongodb, gemini } = req.app.locals.services;
    const character = mongodb ? await mongodb.getCharacter(req.params.id) : null;

    if (!character) {
      return res.status(404).json({
        success: false,
        error: { message: 'Character not found' }
      });
    }

    // Calculate roll
    const prof = 2 + Math.floor((character.level - 1) / 4);
    const abilityMod = Math.floor((character.stats[ability] - 10) / 2);
    const saveData = character.savingThrows[ability] || { proficient: false };
    const saveMod = abilityMod + (saveData.proficient ? prof : 0);

    let roll1 = Math.floor(Math.random() * 20) + 1;
    let roll2 = null;
    let rollUsed = roll1;

    if (advantage && !disadvantage) {
      roll2 = Math.floor(Math.random() * 20) + 1;
      rollUsed = Math.max(roll1, roll2);
    } else if (disadvantage && !advantage) {
      roll2 = Math.floor(Math.random() * 20) + 1;
      rollUsed = Math.min(roll1, roll2);
    }

    const total = rollUsed + saveMod;
    const breakdown = roll2
      ? `${advantage ? 'ADV' : 'DIS'}(${roll1}, ${roll2}) = ${rollUsed} + ${saveMod} = ${total}`
      : `${rollUsed} + ${saveMod} = ${total}`;

    // Generate AI narrative
    const abilityNames = {
      str: 'Strength',
      dex: 'Dexterity',
      con: 'Constitution',
      int: 'Intelligence',
      wis: 'Wisdom',
      cha: 'Charisma'
    };

    let narrative = `${character.name} rolled ${total} for ${abilityNames[ability]} save.`;
    if (gemini) {
      try {
        const prompt = `${character.name} makes a ${abilityNames[ability]} saving throw and gets ${total} (rolled ${rollUsed} + ${saveMod}).

Generate a dramatic, cinematic 1-sentence description. Show whether they succeed or struggle. Be vivid.`;

        const aiResponse = await gemini.model.generateContent(prompt);
        narrative = aiResponse.response.text().trim();
      } catch (error) {
        console.error('Narrative generation failed:', error);
      }
    }

    res.json({
      success: true,
      data: {
        ability: abilityNames[ability],
        roll: rollUsed,
        modifier: saveMod,
        total,
        breakdown,
        narrative,
        isCriticalSuccess: rollUsed === 20,
        isCriticalFailure: rollUsed === 1
      }
    });
  } catch (error) {
    console.error('Save roll error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to roll save' }
    });
  }
});

/**
 * POST /api/characters/:id/chat
 * Chat with character using Gemini AI
 */
router.post('/:id/chat', async (req, res) => {
  try {
    const { message, mood = 'default' } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        error: { message: 'Message is required' }
      });
    }

    const { gemini, mongodb } = req.app.locals.services;

    if (!gemini) {
      return res.status(503).json({
        success: false,
        error: { message: 'AI service not available' }
      });
    }

    const character = mongodb ? await mongodb.getCharacter(req.params.id) : null;

    if (!character) {
      return res.status(404).json({
        success: false,
        error: { message: 'Character not found' }
      });
    }

    const conversationHistory = character.conversationHistory || [];

    const response = await gemini.generateConversation({
      characterName: character.name,
      characterPersonality: `${character.background}\n${character.personality}`,
      userMessage: message,
      conversationHistory,
      mood
    });

    // Save to conversation history
    if (mongodb) {
      await mongodb.addConversationMessage(req.params.id, { role: 'user', content: message });
      await mongodb.addConversationMessage(req.params.id, { role: 'assistant', content: response });
    }

    res.json({
      success: true,
      data: {
        message: response,
        character: character.name,
        mood
      }
    });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to generate response', details: error.message }
    });
  }
});

/**
 * PATCH /api/characters/:id/stats
 * Update character stats
 */
router.patch('/:id/stats', async (req, res) => {
  try {
    const { stats } = req.body;

    const mongodb = req.app.locals.services.mongodb;

    if (!mongodb) {
      return res.status(503).json({
        success: false,
        error: { message: 'Database not available' }
      });
    }

    const character = await mongodb.updateCharacterStats(req.params.id, stats);

    if (!character) {
      return res.status(404).json({
        success: false,
        error: { message: 'Character not found' }
      });
    }

    res.json({
      success: true,
      data: character
    });
  } catch (error) {
    console.error('Stats update error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to update stats' }
    });
  }
});

/**
 * DELETE /api/characters/:id
 * Delete character
 */
router.delete('/:id', async (req, res) => {
  try {
    const mongodb = req.app.locals.services.mongodb;

    if (!mongodb) {
      return res.status(503).json({
        success: false,
        error: { message: 'Database not available' }
      });
    }

    const success = await mongodb.deleteCharacter(req.params.id);

    if (!success) {
      return res.status(404).json({
        success: false,
        error: { message: 'Character not found' }
      });
    }

    res.json({
      success: true,
      message: 'Character deleted'
    });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to delete character' }
    });
  }
});

// Helper: Format skill name
function formatSkillName(skillName) {
  return skillName
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
}

export default router;
