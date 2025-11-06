/**
 * API Service for Character Foundry
 *
 * This service handles all communication with the Node.js backend server.
 * Configure your API_BASE_URL to point to your Node server.
 */

// Configure your Node server URL here
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api'

/**
 * Fetch character data by ID
 * @param {string} characterId - The ID of the character to fetch
 * @returns {Promise<Object>} Character data
 */
export const getCharacter = async (characterId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/characters/${characterId}`)
    if (!response.ok) {
      throw new Error(`Failed to fetch character: ${response.statusText}`)
    }
    return await response.json()
  } catch (error) {
    console.error('Error fetching character:', error)
    throw error
  }
}

/**
 * Fetch all available characters
 * @returns {Promise<Array>} List of characters
 */
export const getAllCharacters = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/characters`)
    if (!response.ok) {
      throw new Error(`Failed to fetch characters: ${response.statusText}`)
    }
    return await response.json()
  } catch (error) {
    console.error('Error fetching characters:', error)
    throw error
  }
}

/**
 * Create a new character from a text prompt
 * @param {string} prompt - Description of the character to create
 * @returns {Promise<Object>} Newly created character data
 */
export const createCharacter = async (prompt) => {
  try {
    const response = await fetch(`${API_BASE_URL}/characters/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt })
    })
    if (!response.ok) {
      throw new Error(`Failed to create character: ${response.statusText}`)
    }
    return await response.json()
  } catch (error) {
    console.error('Error creating character:', error)
    throw error
  }
}

/**
 * Send a chat message to a character
 * @param {string} characterId - The ID of the character
 * @param {string} message - The message to send
 * @param {Array} conversationHistory - Previous messages in the conversation
 * @returns {Promise<Object>} Character's response
 */
export const sendMessage = async (characterId, message, conversationHistory = []) => {
  try {
    const response = await fetch(`${API_BASE_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        characterId,
        message,
        conversationHistory
      })
    })
    if (!response.ok) {
      throw new Error(`Failed to send message: ${response.statusText}`)
    }
    return await response.json()
  } catch (error) {
    console.error('Error sending message:', error)
    throw error
  }
}

/**
 * Use a character ability
 * @param {string} characterId - The ID of the character
 * @param {string} abilityName - The name of the ability to use
 * @param {Object} context - Additional context for the ability
 * @returns {Promise<Object>} Ability result
 */
export const useAbility = async (characterId, abilityName, context = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}/abilities/use`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        characterId,
        abilityName,
        context
      })
    })
    if (!response.ok) {
      throw new Error(`Failed to use ability: ${response.statusText}`)
    }
    return await response.json()
  } catch (error) {
    console.error('Error using ability:', error)
    throw error
  }
}

/**
 * Update character stats (HP, AC, etc.)
 * @param {string} characterId - The ID of the character
 * @param {Object} updates - Stats to update
 * @returns {Promise<Object>} Updated character data
 */
export const updateCharacterStats = async (characterId, updates) => {
  try {
    const response = await fetch(`${API_BASE_URL}/characters/${characterId}/stats`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates)
    })
    if (!response.ok) {
      throw new Error(`Failed to update character stats: ${response.statusText}`)
    }
    return await response.json()
  } catch (error) {
    console.error('Error updating character stats:', error)
    throw error
  }
}
