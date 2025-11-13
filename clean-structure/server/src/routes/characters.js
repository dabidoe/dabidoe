/**
 * Character API Routes
 * Integrated with Gemini AI, MongoDB, and Bunny CDN
 * Includes D&D 5e roll mechanics
 */

import express from 'express';
import { populateCharacterData } from '../../../shared/data-loader.js';

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

    // Generate character using Gemini (narrative + base stats)
    const character = await gemini.generateCharacter(prompt);

    // Populate character with proper D&D 5e mechanics (spells, abilities, equipment)
    populateCharacterData(character);

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
 * POST /api/characters/create-quick
 * Quick character creation without AI (for testing/quick builds)
 * Body: { name, class, level, race }
 */
router.post('/create-quick', async (req, res) => {
  try {
    const { name, class: className, level = 1, race = 'Human' } = req.body;

    if (!name || !className) {
      return res.status(400).json({
        success: false,
        error: { message: 'Name and class are required' }
      });
    }

    // Create base character object
    const character = {
      id: `char-${Date.now()}`,
      name,
      class: className,
      level: parseInt(level),
      race,
      stats: {
        str: 10,
        dex: 10,
        con: 10,
        int: 10,
        wis: 10,
        cha: 10
      },
      hp: {
        current: 10 + Math.floor((level - 1) * 6),
        max: 10 + Math.floor((level - 1) * 6)
      },
      ac: 10,
      background: 'adventurer',
      abilities: [],
      inventory: [],
      currency: { cp: 0, sp: 0, gp: 0, pp: 0 }
    };

    // Populate with D&D 5e mechanics
    populateCharacterData(character);

    // Save to MongoDB if available
    const { mongodb } = req.app.locals.services;
    if (mongodb) {
      await mongodb.createCharacter(character);
    }

    res.json({
      success: true,
      data: character
    });
  } catch (error) {
    console.error('Quick character creation error:', error);
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

/**
 * POST /api/characters/:id/attack
 * Roll an attack with AI narrative
 */
router.post('/:id/attack', async (req, res) => {
  try {
    const { attackType = 'melee', weaponName, attackBonus, damageFormula, advantage = false, disadvantage = false } = req.body;

    const { mongodb, gemini } = req.app.locals.services;
    const character = mongodb ? await mongodb.getCharacter(req.params.id) : null;

    if (!character) {
      return res.status(404).json({
        success: false,
        error: { message: 'Character not found' }
      });
    }

    // Calculate attack roll
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

    const attackTotal = rollUsed + (attackBonus || 0);
    const attackBreakdown = roll2
      ? `${advantage ? 'ADV' : 'DIS'}(${roll1}, ${roll2}) = ${rollUsed} + ${attackBonus} = ${attackTotal}`
      : `${rollUsed} + ${attackBonus} = ${attackTotal}`;

    // Roll damage
    const damageRoll = rollDiceFormula(damageFormula || '1d8');
    const isCrit = rollUsed === 20;
    let critDamage = null;

    if (isCrit) {
      critDamage = rollDiceFormula(damageFormula || '1d8');
    }

    // Generate AI narrative
    let narrative = `${character.name} attacks with ${weaponName || 'weapon'} and rolls ${attackTotal}!`;
    if (gemini) {
      try {
        const prompt = `${character.name} makes a ${attackType} attack with ${weaponName || 'their weapon'} and rolls ${attackTotal} to hit (rolled ${rollUsed} + ${attackBonus}).
${isCrit ? 'CRITICAL HIT! ' : ''}Generate a dramatic, cinematic 1-sentence description of the attack. Be vivid and action-focused.`;

        const aiResponse = await gemini.model.generateContent(prompt);
        narrative = aiResponse.response.text().trim();
      } catch (error) {
        console.error('Narrative generation failed:', error);
      }
    }

    res.json({
      success: true,
      data: {
        attack: {
          roll: rollUsed,
          bonus: attackBonus,
          total: attackTotal,
          breakdown: attackBreakdown,
          isCriticalHit: isCrit,
          isCriticalMiss: rollUsed === 1
        },
        damage: {
          normal: damageRoll.total,
          critical: critDamage ? critDamage.total + damageRoll.total : null,
          formula: damageFormula
        },
        narrative
      }
    });
  } catch (error) {
    console.error('Attack roll error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to roll attack' }
    });
  }
});

/**
 * PATCH /api/characters/:id/damage
 * Apply damage to character
 */
router.patch('/:id/damage', async (req, res) => {
  try {
    const { amount, damageType = 'untyped' } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: { message: 'Damage amount must be positive' }
      });
    }

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

    const hp = character.hp || { current: 0, max: 0, temp: 0 };
    let damageRemaining = amount;

    // Apply to temp HP first
    if (hp.temp > 0) {
      const tempAbsorbed = Math.min(hp.temp, damageRemaining);
      hp.temp -= tempAbsorbed;
      damageRemaining -= tempAbsorbed;
    }

    // Apply remaining to current HP
    hp.current = Math.max(0, hp.current - damageRemaining);

    const updatedCharacter = await mongodb.updateCharacter(req.params.id, { hp });

    res.json({
      success: true,
      data: {
        hp: updatedCharacter.hp,
        damageTaken: amount,
        damageType
      }
    });
  } catch (error) {
    console.error('Damage error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to apply damage' }
    });
  }
});

/**
 * PATCH /api/characters/:id/heal
 * Heal character
 */
router.patch('/:id/heal', async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: { message: 'Heal amount must be positive' }
      });
    }

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

    const hp = character.hp || { current: 0, max: 0, temp: 0 };
    hp.current = Math.min(hp.max, hp.current + amount);

    const updatedCharacter = await mongodb.updateCharacter(req.params.id, { hp });

    res.json({
      success: true,
      data: {
        hp: updatedCharacter.hp,
        healingReceived: amount
      }
    });
  } catch (error) {
    console.error('Heal error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to heal character' }
    });
  }
});

/**
 * POST /api/characters/:id/use-ability
 * Use a class ability with AI narrative
 */
router.post('/:id/use-ability', async (req, res) => {
  try {
    const { abilityId } = req.body;

    if (!abilityId) {
      return res.status(400).json({
        success: false,
        error: { message: 'Ability ID is required' }
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

    const ability = character.abilities?.find(a => a.id === abilityId);
    if (!ability) {
      return res.status(404).json({
        success: false,
        error: { message: 'Ability not found' }
      });
    }

    // Check if ability can be used
    if (ability.uses && ability.uses.current <= 0) {
      return res.status(400).json({
        success: false,
        error: { message: `No uses of ${ability.name} remaining` }
      });
    }

    let result = {};

    // Roll damage if applicable
    if (ability.damage) {
      const damageRoll = rollDiceFormula(ability.damage.formula);
      result.damage = {
        total: damageRoll.total,
        formula: ability.damage.formula,
        type: ability.damage.type
      };
    }

    // Roll attack if applicable
    if (ability.attack) {
      const attackRoll = Math.floor(Math.random() * 20) + 1;
      const attackTotal = attackRoll + (ability.attack.bonus || 0);
      result.attack = {
        roll: attackRoll,
        total: attackTotal,
        isCriticalHit: attackRoll === 20,
        isCriticalMiss: attackRoll === 1
      };
    }

    // Generate AI narrative
    let narrative = `${character.name} uses ${ability.name}!`;
    if (gemini) {
      try {
        const prompt = `${character.name} uses their class ability "${ability.name}".
${ability.description}
${result.damage ? `They deal ${result.damage.total} ${result.damage.type} damage.` : ''}
Generate a dramatic, cinematic 1-sentence description. Be vivid and exciting!`;

        const aiResponse = await gemini.model.generateContent(prompt);
        narrative = aiResponse.response.text().trim();
      } catch (error) {
        console.error('Narrative generation failed:', error);
      }
    }

    // Consume use if limited
    if (ability.uses && ability.uses.current > 0) {
      const updatedAbilities = character.abilities.map(a => {
        if (a.id === abilityId) {
          return {
            ...a,
            uses: {
              ...a.uses,
              current: a.uses.current - 1
            }
          };
        }
        return a;
      });

      await mongodb.updateCharacter(req.params.id, { abilities: updatedAbilities });
    }

    res.json({
      success: true,
      data: {
        ability: ability.name,
        result,
        narrative
      }
    });
  } catch (error) {
    console.error('Ability use error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to use ability' }
    });
  }
});

/**
 * POST /api/characters/:id/rest/short
 * Take a short rest
 */
router.post('/:id/rest/short', async (req, res) => {
  try {
    const { hitDiceToUse = 0 } = req.body;

    const { mongodb, gemini } = req.app.locals.services;
    const character = mongodb ? await mongodb.getCharacter(req.params.id) : null;

    if (!character) {
      return res.status(404).json({
        success: false,
        error: { message: 'Character not found' }
      });
    }

    const hitDice = character.hitDice || { current: 0, max: 0, type: 'd8' };
    const hp = character.hp || { current: 0, max: 0, temp: 0 };
    const conMod = Math.floor((character.stats?.con || 10 - 10) / 2);

    if (hitDiceToUse > hitDice.current) {
      return res.status(400).json({
        success: false,
        error: { message: 'Not enough hit dice available' }
      });
    }

    // Roll hit dice for healing
    let totalHealing = 0;
    const rolls = [];

    for (let i = 0; i < hitDiceToUse; i++) {
      const diceSize = parseInt(hitDice.type.replace('d', ''));
      const roll = Math.floor(Math.random() * diceSize) + 1;
      const healAmount = Math.max(1, roll + conMod);
      rolls.push({ roll, healAmount });
      totalHealing += healAmount;
    }

    // Update HP
    const newHP = Math.min(hp.max, hp.current + totalHealing);

    // Update hit dice
    const newHitDice = {
      ...hitDice,
      current: hitDice.current - hitDiceToUse
    };

    // Restore warlock spell slots (pact magic)
    let spellSlotUpdate = {};
    if (character.class === 'Warlock' && character.spellcasting) {
      const pactSlots = character.spellcasting.pactMagic;
      if (pactSlots) {
        spellSlotUpdate = {
          'spellcasting.pactMagic.current': pactSlots.max
        };
      }
    }

    // Update character
    const updates = {
      hp: { ...hp, current: newHP },
      hitDice: newHitDice,
      ...spellSlotUpdate
    };

    const updatedCharacter = await mongodb.updateCharacter(req.params.id, updates);

    // Generate AI narrative
    let narrative = `${character.name} takes a short rest and recovers ${totalHealing} HP.`;
    if (gemini && hitDiceToUse > 0) {
      try {
        const prompt = `${character.name} takes a short rest after a tough battle. They spend ${hitDiceToUse} hit dice and recover ${totalHealing} hit points.
Generate a brief, atmospheric 1-2 sentence description of their rest. Show them catching their breath, tending wounds, or preparing for what's next.`;

        const aiResponse = await gemini.model.generateContent(prompt);
        narrative = aiResponse.response.text().trim();
      } catch (error) {
        console.error('Narrative generation failed:', error);
      }
    }

    res.json({
      success: true,
      data: {
        hitDiceUsed: hitDiceToUse,
        healing: {
          total: totalHealing,
          rolls
        },
        hp: updatedCharacter.hp,
        hitDice: updatedCharacter.hitDice,
        pactMagicRestored: !!spellSlotUpdate['spellcasting.pactMagic.current'],
        narrative
      }
    });
  } catch (error) {
    console.error('Short rest error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to take short rest' }
    });
  }
});

/**
 * POST /api/characters/:id/rest/long
 * Take a long rest
 */
router.post('/:id/rest/long', async (req, res) => {
  try {
    const { mongodb, gemini } = req.app.locals.services;
    const character = mongodb ? await mongodb.getCharacter(req.params.id) : null;

    if (!character) {
      return res.status(404).json({
        success: false,
        error: { message: 'Character not found' }
      });
    }

    const hp = character.hp || { current: 0, max: 0, temp: 0 };
    const hitDice = character.hitDice || { current: 0, max: 0, type: 'd8' };
    const spellcasting = character.spellcasting || {};

    // Restore HP to max
    const hpRestored = hp.max - hp.current;
    hp.current = hp.max;
    hp.temp = 0; // Clear temp HP

    // Restore hit dice (half of max, minimum 1)
    const hitDiceRestored = Math.max(1, Math.floor(hitDice.max / 2));
    hitDice.current = Math.min(hitDice.max, hitDice.current + hitDiceRestored);

    // Restore all spell slots
    const spellSlots = { ...spellcasting.spellSlots };
    for (let level = 1; level <= 9; level++) {
      if (spellSlots[level]) {
        spellSlots[level].current = spellSlots[level].max;
      }
    }

    // Restore pact magic slots (Warlock)
    if (spellcasting.pactMagic) {
      spellcasting.pactMagic.current = spellcasting.pactMagic.max;
    }

    // Reduce exhaustion by 1 level
    let exhaustion = character.exhaustion || 0;
    if (exhaustion > 0) {
      exhaustion -= 1;
    }

    // Reset ability uses (per long rest)
    const abilities = (character.abilities || []).map(ability => {
      if (ability.uses && ability.uses.per === 'long rest') {
        return {
          ...ability,
          uses: {
            ...ability.uses,
            current: ability.uses.max
          }
        };
      }
      return ability;
    });

    // Clear temporary effects
    const tempEffects = [];

    // Update character
    const updates = {
      hp,
      hitDice,
      'spellcasting.spellSlots': spellSlots,
      exhaustion,
      abilities,
      tempEffects
    };

    if (spellcasting.pactMagic) {
      updates['spellcasting.pactMagic'] = spellcasting.pactMagic;
    }

    const updatedCharacter = await mongodb.updateCharacter(req.params.id, updates);

    // Generate AI narrative
    let narrative = `${character.name} takes a long rest and fully recovers.`;
    if (gemini) {
      try {
        const prompt = `${character.name} finishes a long rest. They've fully recovered their health and magical energy.
${hpRestored > 0 ? `They healed ${hpRestored} hit points.` : 'They were already at full health.'}
${exhaustion > 0 ? 'They feel less exhausted.' : ''}
Generate a brief, peaceful 1-2 sentence description of waking refreshed and ready for adventure.`;

        const aiResponse = await gemini.model.generateContent(prompt);
        narrative = aiResponse.response.text().trim();
      } catch (error) {
        console.error('Narrative generation failed:', error);
      }
    }

    res.json({
      success: true,
      data: {
        hpRestored,
        hitDiceRestored,
        spellSlotsRestored: true,
        exhaustionReduced: character.exhaustion > exhaustion,
        abilitiesRestored: abilities.filter(a => a.uses?.per === 'long rest').length,
        narrative
      }
    });
  } catch (error) {
    console.error('Long rest error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to take long rest' }
    });
  }
});

/**
 * POST /api/characters/:id/inventory/add
 * Add item to inventory
 */
router.post('/:id/inventory/add', async (req, res) => {
  try {
    const { item } = req.body;

    if (!item || !item.name) {
      return res.status(400).json({
        success: false,
        error: { message: 'Item data is required' }
      });
    }

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

    // Add unique ID if not present
    if (!item.id) {
      item.id = `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    const inventory = character.inventory || [];
    inventory.push(item);

    const updatedCharacter = await mongodb.updateCharacter(req.params.id, { inventory });

    res.json({
      success: true,
      data: {
        item,
        inventory: updatedCharacter.inventory
      }
    });
  } catch (error) {
    console.error('Add item error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to add item' }
    });
  }
});

/**
 * DELETE /api/characters/:id/inventory/:itemId
 * Remove item from inventory
 */
router.delete('/:id/inventory/:itemId', async (req, res) => {
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

    const inventory = character.inventory || [];
    const updatedInventory = inventory.filter(item => item.id !== req.params.itemId);

    if (updatedInventory.length === inventory.length) {
      return res.status(404).json({
        success: false,
        error: { message: 'Item not found' }
      });
    }

    const updatedCharacter = await mongodb.updateCharacter(req.params.id, { inventory: updatedInventory });

    res.json({
      success: true,
      data: {
        inventory: updatedCharacter.inventory
      }
    });
  } catch (error) {
    console.error('Remove item error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to remove item' }
    });
  }
});

/**
 * POST /api/characters/:id/inventory/:itemId/equip
 * Equip an item
 */
router.post('/:id/inventory/:itemId/equip', async (req, res) => {
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

    const inventory = character.inventory || [];
    const item = inventory.find(i => i.id === req.params.itemId);

    if (!item) {
      return res.status(404).json({
        success: false,
        error: { message: 'Item not found' }
      });
    }

    // Check if item can be equipped
    if (!item.slot) {
      return res.status(400).json({
        success: false,
        error: { message: 'This item cannot be equipped' }
      });
    }

    // Unequip conflicting items
    const updatedInventory = inventory.map(i => {
      // If this is the item being equipped, mark it as equipped
      if (i.id === item.id) {
        return { ...i, equipped: true };
      }

      // Unequip items in the same slot
      if (i.equipped && i.slot === item.slot) {
        // Special handling for rings
        if (item.slot === 'ring') {
          // Don't unequip if we have 2 ring slots available
          const equippedRings = inventory.filter(x => x.equipped && x.slot === 'ring');
          if (equippedRings.length < 2) {
            return i; // Keep equipped
          }
        }
        return { ...i, equipped: false };
      }

      // Two-handed weapons unequip off-hand
      if (item.weapon?.properties?.includes('two-handed') && i.equipped && i.slot === 'offHand') {
        return { ...i, equipped: false };
      }

      // Equipping shield/off-hand weapon unequips two-handed weapon
      if ((item.slot === 'offHand' || (item.weapon && item.slot === 'mainHand')) &&
          i.equipped && i.weapon?.properties?.includes('two-handed')) {
        return { ...i, equipped: false };
      }

      return i;
    });

    // Recalculate AC
    const newAC = calculateAC(character, updatedInventory);

    const updatedCharacter = await mongodb.updateCharacter(req.params.id, {
      inventory: updatedInventory,
      ac: newAC
    });

    res.json({
      success: true,
      data: {
        item: updatedInventory.find(i => i.id === item.id),
        inventory: updatedCharacter.inventory,
        ac: newAC
      }
    });
  } catch (error) {
    console.error('Equip item error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to equip item' }
    });
  }
});

/**
 * POST /api/characters/:id/inventory/:itemId/unequip
 * Unequip an item
 */
router.post('/:id/inventory/:itemId/unequip', async (req, res) => {
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

    const inventory = character.inventory || [];
    const updatedInventory = inventory.map(item => {
      if (item.id === req.params.itemId) {
        return { ...item, equipped: false };
      }
      return item;
    });

    // Recalculate AC
    const newAC = calculateAC(character, updatedInventory);

    const updatedCharacter = await mongodb.updateCharacter(req.params.id, {
      inventory: updatedInventory,
      ac: newAC
    });

    res.json({
      success: true,
      data: {
        inventory: updatedCharacter.inventory,
        ac: newAC
      }
    });
  } catch (error) {
    console.error('Unequip item error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to unequip item' }
    });
  }
});

/**
 * POST /api/characters/:id/inventory/:itemId/use
 * Use a consumable item
 */
router.post('/:id/inventory/:itemId/use', async (req, res) => {
  try {
    const { mongodb, gemini } = req.app.locals.services;
    const character = mongodb ? await mongodb.getCharacter(req.params.id) : null;

    if (!character) {
      return res.status(404).json({
        success: false,
        error: { message: 'Character not found' }
      });
    }

    const inventory = character.inventory || [];
    const item = inventory.find(i => i.id === req.params.itemId);

    if (!item) {
      return res.status(404).json({
        success: false,
        error: { message: 'Item not found' }
      });
    }

    if (item.category !== 'potion' && item.category !== 'scroll') {
      return res.status(400).json({
        success: false,
        error: { message: 'This item cannot be used' }
      });
    }

    // Consume item
    let updatedInventory;
    if (item.quantity > 1) {
      updatedInventory = inventory.map(i =>
        i.id === item.id ? { ...i, quantity: i.quantity - 1 } : i
      );
    } else {
      updatedInventory = inventory.filter(i => i.id !== item.id);
    }

    // Apply effect (e.g., healing potion)
    let effectResult = {};
    if (item.consumable?.effect) {
      const healMatch = item.consumable.effect.match(/heal (\d+d\d+\+?\d*)/i);
      if (healMatch) {
        const healRoll = rollDiceFormula(healMatch[1]);
        const hp = character.hp || { current: 0, max: 0 };
        hp.current = Math.min(hp.max, hp.current + healRoll.total);
        effectResult.healing = healRoll.total;
        await mongodb.updateCharacter(req.params.id, { hp });
      }
    }

    // Generate AI narrative
    let narrative = `${character.name} uses ${item.name}.`;
    if (gemini) {
      try {
        const prompt = `${character.name} uses a ${item.name}.
${item.description}
${effectResult.healing ? `They heal ${effectResult.healing} hit points.` : ''}
Generate a brief, flavorful 1-sentence description of using this item.`;

        const aiResponse = await gemini.model.generateContent(prompt);
        narrative = aiResponse.response.text().trim();
      } catch (error) {
        console.error('Narrative generation failed:', error);
      }
    }

    const updatedCharacter = await mongodb.updateCharacter(req.params.id, { inventory: updatedInventory });

    res.json({
      success: true,
      data: {
        item: item.name,
        effect: effectResult,
        inventory: updatedCharacter.inventory,
        narrative
      }
    });
  } catch (error) {
    console.error('Use item error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to use item' }
    });
  }
});

// Helper: Calculate AC from equipped items
function calculateAC(character, inventory) {
  let baseAC = 10;
  const dexMod = Math.floor(((character.stats?.dex || 10) - 10) / 2);
  let maxDexBonus = null;
  let bonuses = 0;

  // Get equipped items
  const equippedBody = inventory.find(i => i.equipped && i.slot === 'body');
  const equippedOffHand = inventory.find(i => i.equipped && i.slot === 'offHand');
  const equippedRings = inventory.filter(i => i.equipped && i.slot === 'ring');
  const equippedNeck = inventory.find(i => i.equipped && i.slot === 'neck');

  // Armor (body)
  if (equippedBody?.armor) {
    baseAC = equippedBody.armor.ac;
    maxDexBonus = equippedBody.armor.maxDexBonus;
    if (equippedBody.magic?.bonus) {
      bonuses += equippedBody.magic.bonus;
    }
  }

  // Shield (offHand)
  if (equippedOffHand?.shield) {
    bonuses += equippedOffHand.shield.acBonus;
    if (equippedOffHand.magic?.bonus) {
      bonuses += equippedOffHand.magic.bonus;
    }
  }

  // Apply DEX modifier (respecting armor max)
  let finalDexMod = dexMod;
  if (maxDexBonus !== null && maxDexBonus !== undefined) {
    finalDexMod = Math.min(dexMod, maxDexBonus);
  }

  // Ring/Amulet AC bonuses
  [...equippedRings, equippedNeck].forEach(item => {
    if (item?.customProperties?.bonuses?.ac) {
      bonuses += item.customProperties.bonuses.ac;
    }
  });

  return Math.floor(baseAC + finalDexMod + bonuses);
}

// Helper: Format skill name
function formatSkillName(skillName) {
  return skillName
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
}

// Helper: Roll dice formula (e.g., "2d6+3")
function rollDiceFormula(formula) {
  const match = formula.match(/(\d+)d(\d+)([+-]\d+)?/);
  if (!match) return { total: 0, breakdown: 'Invalid formula' };

  const [, numDice, diceSize, modifier] = match;
  const rolls = [];
  let total = 0;

  for (let i = 0; i < parseInt(numDice); i++) {
    const roll = Math.floor(Math.random() * parseInt(diceSize)) + 1;
    rolls.push(roll);
    total += roll;
  }

  const mod = parseInt(modifier || 0);
  total += mod;

  const breakdown = `${rolls.join(' + ')}${mod !== 0 ? ` ${mod >= 0 ? '+' : ''}${mod}` : ''} = ${total}`;

  return { total, breakdown, rolls };
}

export default router;
