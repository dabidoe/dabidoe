/**
 * API Service for Character Foundry
 *
 * This service handles all communication with the Node.js backend server.
 * Configure your API_BASE_URL to point to your Node server.
 */

// Configure your Node server URL here
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api'

/**
 * Custom API Error class for better error handling
 */
export class APIError extends Error {
  constructor(message, status, data = null) {
    super(message)
    this.name = 'APIError'
    this.status = status
    this.data = data
  }
}

/**
 * Retry a fetch request with exponential backoff
 * @param {Function} fetchFn - The fetch function to retry
 * @param {number} maxRetries - Maximum number of retries
 * @param {number} baseDelay - Base delay in ms for exponential backoff
 * @returns {Promise} Result of the fetch
 */
const retryFetch = async (fetchFn, maxRetries = 3, baseDelay = 1000) => {
  let lastError

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fetchFn()
    } catch (error) {
      lastError = error

      // Don't retry on client errors (4xx) or last attempt
      if (error.status >= 400 && error.status < 500) {
        throw error
      }

      if (attempt < maxRetries) {
        const delay = baseDelay * Math.pow(2, attempt)
        console.log(`Retrying request in ${delay}ms (attempt ${attempt + 1}/${maxRetries})`)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  }

  throw lastError
}

/**
 * Generic fetch wrapper with error handling
 * @param {string} url - The URL to fetch
 * @param {Object} options - Fetch options
 * @returns {Promise<Object>} JSON response
 */
const apiFetch = async (url, options = {}) => {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })

  if (!response.ok) {
    let errorData = null
    try {
      errorData = await response.json()
    } catch (e) {
      // Response body is not JSON
    }

    throw new APIError(
      errorData?.message || `Request failed: ${response.statusText}`,
      response.status,
      errorData
    )
  }

  return await response.json()
}

/**
 * Fetch character data by ID
 * @param {string} characterId - The ID of the character to fetch
 * @returns {Promise<Object>} Character data
 */
export const getCharacter = async (characterId) => {
  return retryFetch(() =>
    apiFetch(`${API_BASE_URL}/characters/${characterId}`)
  )
}

/**
 * Fetch all available characters
 * @returns {Promise<Array>} List of characters
 */
export const getAllCharacters = async () => {
  return retryFetch(() =>
    apiFetch(`${API_BASE_URL}/characters`)
  )
}

/**
 * Create a new character from a text prompt
 * @param {string} prompt - Description of the character to create
 * @returns {Promise<Object>} Newly created character data
 */
export const createCharacter = async (prompt) => {
  return retryFetch(() =>
    apiFetch(`${API_BASE_URL}/characters/create`, {
      method: 'POST',
      body: JSON.stringify({ prompt })
    })
  )
}

/**
 * Send a chat message to a character
 * @param {string} characterId - The ID of the character
 * @param {string} message - The message to send
 * @param {Array} conversationHistory - Previous messages in the conversation
 * @returns {Promise<Object>} Character's response
 */
export const sendMessage = async (characterId, message, conversationHistory = []) => {
  return retryFetch(() =>
    apiFetch(`${API_BASE_URL}/chat`, {
      method: 'POST',
      body: JSON.stringify({
        characterId,
        message,
        conversationHistory
      })
    })
  )
}

/**
 * Use a character ability
 * @param {string} characterId - The ID of the character
 * @param {string} abilityName - The name of the ability to use
 * @param {Object} context - Additional context for the ability
 * @returns {Promise<Object>} Ability result
 */
export const useAbility = async (characterId, abilityName, context = {}) => {
  return retryFetch(() =>
    apiFetch(`${API_BASE_URL}/abilities/use`, {
      method: 'POST',
      body: JSON.stringify({
        characterId,
        abilityName,
        context
      })
    })
  )
}

/**
 * Update character stats (HP, AC, etc.)
 * @param {string} characterId - The ID of the character
 * @param {Object} updates - Stats to update
 * @returns {Promise<Object>} Updated character data
 */
export const updateCharacterStats = async (characterId, updates) => {
  return retryFetch(() =>
    apiFetch(`${API_BASE_URL}/characters/${characterId}/stats`, {
      method: 'PATCH',
      body: JSON.stringify(updates)
    })
  )
}
