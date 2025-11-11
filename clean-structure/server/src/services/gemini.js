/**
 * Gemini Flash 2.0 Integration
 * Ultra-cheap LLM for character conversations
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

export default class GeminiService {
  constructor(apiKey) {
    if (!apiKey) {
      throw new Error('Gemini API key is required');
    }
    this.client = new GoogleGenerativeAI(apiKey);
    this.model = this.client.getGenerativeModel({
      model: 'gemini-2.0-flash-exp' // Latest, fastest, cheapest
    });
  }

  /**
   * Generate character conversation response
   * @param {Object} params - Conversation parameters
   * @param {string} params.characterName - Character's name
   * @param {string} params.characterPersonality - Character personality/background
   * @param {string} params.userMessage - User's message
   * @param {Array} params.conversationHistory - Previous messages
   * @param {string} params.mood - Current character mood (default, battle, angry, etc.)
   * @returns {Promise<string>} Character's response
   */
  async generateConversation({
    characterName,
    characterPersonality,
    userMessage,
    conversationHistory = [],
    mood = 'default'
  }) {
    const moodPrompts = {
      default: '',
      battle: 'You are in combat. Be tactical and focused.',
      angry: 'You are angry and aggressive in your responses.',
      injured: 'You are wounded and in pain. Show weakness and desperation.',
      triumphant: 'You just achieved a great victory. Be confident and celebratory.'
    };

    const systemPrompt = `You are ${characterName}, a character in a D&D-style RPG.

CHARACTER BACKGROUND:
${characterPersonality}

CURRENT MOOD: ${mood}
${moodPrompts[mood] || ''}

INSTRUCTIONS:
- Stay in character at all times
- Respond naturally as ${characterName} would
- Keep responses concise (2-4 sentences max)
- Use appropriate emotion based on mood
- Reference past conversation when relevant
- Never break character or mention being an AI`;

    // Format conversation history
    let conversationContext = '';
    if (conversationHistory.length > 0) {
      conversationContext = '\n\nPREVIOUS CONVERSATION:\n';
      conversationHistory.slice(-5).forEach(msg => { // Only last 5 messages for context
        conversationContext += `${msg.role === 'user' ? 'User' : characterName}: ${msg.content}\n`;
      });
    }

    const prompt = `${systemPrompt}${conversationContext}

User: ${userMessage}
${characterName}:`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = result.response.text();
      return response.trim();
    } catch (error) {
      console.error('Gemini API error:', error);
      throw new Error(`Failed to generate response: ${error.message}`);
    }
  }

  /**
   * Generate character from text prompt
   * @param {string} prompt - User's character description
   * @returns {Promise<Object>} Character data
   */
  async generateCharacter(prompt) {
    const systemPrompt = `You are a D&D character creator. Generate a complete character based on the user's description.

Return ONLY valid JSON in this exact format:
{
  "name": "Character Name",
  "race": "Race",
  "class": "Class",
  "level": 1,
  "background": "Brief background story (2-3 sentences)",
  "personality": "Personality traits and quirks (2-3 sentences)",
  "stats": {
    "hp": 20,
    "maxHp": 20,
    "ac": 14,
    "str": 10,
    "dex": 14,
    "con": 12,
    "int": 10,
    "wis": 13,
    "cha": 16
  },
  "abilities": [
    {
      "name": "Ability Name",
      "description": "What it does",
      "type": "attack|spell|utility",
      "damage": "1d8+2",
      "range": "60ft",
      "cooldown": 0
    }
  ],
  "imagePrompt": "Detailed visual description for AI image generation (physical appearance, clothing, pose, style: fantasy art portrait)"
}

USER PROMPT: ${prompt}

Generate the character JSON:`;

    try {
      const result = await this.model.generateContent(systemPrompt);
      const response = result.response.text();

      // Extract JSON from response (handles markdown code blocks)
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in response');
      }

      const character = JSON.parse(jsonMatch[0]);
      character.id = `char_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      character.createdAt = new Date().toISOString();

      return character;
    } catch (error) {
      console.error('Character generation error:', error);
      throw new Error(`Failed to generate character: ${error.message}`);
    }
  }

  /**
   * Generate ability usage narrative
   * @param {Object} params - Ability usage parameters
   * @returns {Promise<string>} Narrative description
   */
  async generateAbilityNarrative({ characterName, abilityName, abilityDescription, target = 'enemy', result }) {
    const prompt = `${characterName} uses ${abilityName} on ${target}.

ABILITY: ${abilityDescription}
RESULT: ${result}

Generate a dramatic, concise narrative (1-2 sentences) describing what happens. Be vivid and action-focused.`;

    try {
      const response = await this.model.generateContent(prompt);
      return response.response.text().trim();
    } catch (error) {
      console.error('Narrative generation error:', error);
      return `${characterName} uses ${abilityName}!`;
    }
  }

  /**
   * Enhance image prompt for character generation
   * @param {string} basicPrompt - Basic character description
   * @returns {Promise<string>} Enhanced prompt for image generation
   */
  async enhanceImagePrompt(basicPrompt) {
    const prompt = `Enhance this character description for AI image generation.
Add specific details about: lighting, art style, composition, quality, and visual elements.
Keep it under 150 words. Format for Stable Diffusion.

CHARACTER: ${basicPrompt}

ENHANCED PROMPT:`;

    try {
      const result = await this.model.generateContent(prompt);
      return result.response.text().trim();
    } catch (error) {
      console.error('Prompt enhancement error:', error);
      return basicPrompt; // Fallback to original
    }
  }
}
