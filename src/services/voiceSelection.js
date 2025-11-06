/**
 * Voice Selection Service
 * Maps character attributes (voice, mood, personality, gender) to TTS voice IDs
 */

// ElevenLabs Voice Library
// These are popular ElevenLabs voices - update with your actual voice IDs
const ELEVENLABS_VOICES = {
  // Male voices
  'male-deep-authoritative': 'VR6AewLTigWG4xSOukaG', // Arnold
  'male-deep-calm': 'pNInz6obpgDQGcFmaJgB', // Adam (used for Gandalf)
  'male-energetic': 'ErXwobaYiN019PkySvjV', // Antoni
  'male-whisper': 'yoZ06aMxZJJ28mfd3POQ', // Sam
  'male-wise': 'TxGEqnHWrfWFTfGW9XjX', // Josh
  'male-young': 'IKne3meq5aSn9XLyUdCD', // Charlie
  'male-dramatic': 'onwK4e9ZLuTAKqWW03F9', // Daniel

  // Female voices
  'female-calm-mature': 'EXAVITQu4vr4xnSDxMaL', // Bella
  'female-energetic': 'jsCqWAovK2LkecY7zXl4', // Freya
  'female-soft': 'MF3mGyEYCl7XYWbV9V6O', // Elli
  'female-authoritative': 'XB0fDUnXU5powFXDhCwa', // Charlotte
  'female-young': 'jBpfuIE2acCO8z3wKNLl', // Gigi
  'female-whisper': 'ThT5KcBeYPX3keUQqHPh', // Dorothy
  'female-wise': 'XrExE9yKIg1WjnnlVkGX', // Matilda
}

// OpenAI TTS Voices
const OPENAI_VOICES = {
  'male-deep': 'onyx',
  'male-balanced': 'echo',
  'male-light': 'fable',
  'female-calm': 'nova',
  'female-soft': 'shimmer',
  'female-balanced': 'alloy',
}

/**
 * Analyze character attributes and select the best matching voice
 * @param {Object} character - Character object with voice, mood, personality, gender
 * @param {string} provider - 'elevenlabs' or 'openai'
 * @returns {string} Voice ID for the selected provider
 */
export function selectVoice(character, provider = 'elevenlabs') {
  const {
    voice = '',
    mood = '',
    personality = '',
    gender = 'male',
    voiceId // If character already has a voiceId, use it
  } = character

  // If character already has a specific voiceId set, use it
  if (voiceId) {
    return voiceId
  }

  // Normalize inputs to lowercase
  const voiceDesc = voice.toLowerCase()
  const moodDesc = mood.toLowerCase()
  const personalityDesc = personality.toLowerCase()
  const genderNorm = gender.toLowerCase()

  if (provider === 'elevenlabs') {
    return selectElevenLabsVoice(voiceDesc, moodDesc, personalityDesc, genderNorm)
  } else if (provider === 'openai') {
    return selectOpenAIVoice(voiceDesc, moodDesc, personalityDesc, genderNorm)
  }

  // Default fallback
  return provider === 'elevenlabs'
    ? ELEVENLABS_VOICES['male-deep-calm']
    : OPENAI_VOICES['male-balanced']
}

/**
 * Select ElevenLabs voice based on character attributes
 */
function selectElevenLabsVoice(voice, mood, personality, gender) {
  const isFemale = gender.includes('female') || gender.includes('woman')

  // Voice description keywords
  const isWhisper = voice.includes('whisper') || voice.includes('soft') || voice.includes('quiet')
  const isDeep = voice.includes('deep') || voice.includes('low') || voice.includes('bass')
  const isEnergetic = voice.includes('energetic') || voice.includes('lively') || voice.includes('excited')
  const isCalm = voice.includes('calm') || voice.includes('soothing') || voice.includes('gentle')
  const isAuthoritative = voice.includes('commanding') || voice.includes('authoritative') || voice.includes('powerful')
  const isWise = voice.includes('wise') || voice.includes('ancient') || voice.includes('sage')
  const isDramatic = voice.includes('dramatic') || voice.includes('theatrical')
  const isYoung = voice.includes('young') || voice.includes('youthful')

  // Mood keywords
  const isMoodCalm = mood.includes('calm') || mood.includes('peaceful') || mood.includes('serene')
  const isMoodEnergetic = mood.includes('energetic') || mood.includes('excited') || mood.includes('eager')
  const isMoodStoic = mood.includes('stoic') || mood.includes('resolute') || mood.includes('determined')

  // Personality keywords
  const isPersonalityWise = personality.includes('wise') || personality.includes('sage') || personality.includes('scholarly')
  const isPersonalityBold = personality.includes('bold') || personality.includes('brave') || personality.includes('confident')

  if (isFemale) {
    // Female voice selection
    if (isWhisper) return ELEVENLABS_VOICES['female-whisper']
    if (isWise || isPersonalityWise) return ELEVENLABS_VOICES['female-wise']
    if (isEnergetic || isMoodEnergetic) return ELEVENLABS_VOICES['female-energetic']
    if (isAuthoritative || isPersonalityBold) return ELEVENLABS_VOICES['female-authoritative']
    if (isYoung) return ELEVENLABS_VOICES['female-young']
    if (isCalm || isMoodCalm) return ELEVENLABS_VOICES['female-calm-mature']

    // Default female
    return ELEVENLABS_VOICES['female-calm-mature']
  } else {
    // Male voice selection
    if (isWhisper) return ELEVENLABS_VOICES['male-whisper']
    if (isWise || isPersonalityWise) return ELEVENLABS_VOICES['male-wise']
    if (isEnergetic || isMoodEnergetic) return ELEVENLABS_VOICES['male-energetic']
    if (isAuthoritative || isPersonalityBold) return ELEVENLABS_VOICES['male-deep-authoritative']
    if (isDramatic) return ELEVENLABS_VOICES['male-dramatic']
    if (isYoung) return ELEVENLABS_VOICES['male-young']
    if (isDeep) return ELEVENLABS_VOICES['male-deep-calm']
    if (isCalm || isMoodCalm || isMoodStoic) return ELEVENLABS_VOICES['male-deep-calm']

    // Default male
    return ELEVENLABS_VOICES['male-deep-calm']
  }
}

/**
 * Select OpenAI voice based on character attributes
 */
function selectOpenAIVoice(voice, mood, personality, gender) {
  const isFemale = gender.includes('female') || gender.includes('woman')

  const isDeep = voice.includes('deep') || voice.includes('low') || voice.includes('bass')
  const isSoft = voice.includes('soft') || voice.includes('gentle') || voice.includes('whisper')
  const isCalm = voice.includes('calm') || mood.includes('calm') || mood.includes('peaceful')

  if (isFemale) {
    if (isSoft) return OPENAI_VOICES['female-soft']
    if (isCalm) return OPENAI_VOICES['female-calm']
    return OPENAI_VOICES['female-balanced']
  } else {
    if (isDeep) return OPENAI_VOICES['male-deep']
    if (isSoft) return OPENAI_VOICES['male-light']
    return OPENAI_VOICES['male-balanced']
  }
}

/**
 * Get a human-readable description of the selected voice
 */
export function getVoiceDescription(voiceId, provider = 'elevenlabs') {
  if (provider === 'elevenlabs') {
    const voiceKey = Object.keys(ELEVENLABS_VOICES).find(
      key => ELEVENLABS_VOICES[key] === voiceId
    )
    return voiceKey ? voiceKey.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Unknown Voice'
  } else {
    const voiceKey = Object.keys(OPENAI_VOICES).find(
      key => OPENAI_VOICES[key] === voiceId
    )
    return voiceKey ? voiceKey.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Unknown Voice'
  }
}

/**
 * Get all available voices for a provider
 */
export function getAvailableVoices(provider = 'elevenlabs') {
  return provider === 'elevenlabs' ? ELEVENLABS_VOICES : OPENAI_VOICES
}
