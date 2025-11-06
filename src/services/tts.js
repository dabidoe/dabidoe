/**
 * Text-to-Speech Service
 * Supports ElevenLabs and OpenAI TTS
 */

const ELEVENLABS_API_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY
const TTS_PROVIDER = import.meta.env.VITE_TTS_PROVIDER || 'elevenlabs'

// Cache audio blobs to avoid re-generating
const audioCache = new Map()

/**
 * Generate speech using ElevenLabs
 * @param {string} text - Text to convert to speech
 * @param {string} voiceId - ElevenLabs voice ID (default: Adam)
 * @returns {Promise<Blob>} Audio blob
 */
async function generateElevenLabsSpeech(text, voiceId = 'pNInz6obpgDQGcFmaJgB') {
  const cacheKey = `elevenlabs_${voiceId}_${text}`
  if (audioCache.has(cacheKey)) {
    return audioCache.get(cacheKey)
  }

  const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    method: 'POST',
    headers: {
      'Accept': 'audio/mpeg',
      'Content-Type': 'application/json',
      'xi-api-key': ELEVENLABS_API_KEY
    },
    body: JSON.stringify({
      text,
      model_id: 'eleven_monolingual_v1',
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75
      }
    })
  })

  if (!response.ok) {
    throw new Error(`ElevenLabs TTS failed: ${response.statusText}`)
  }

  const blob = await response.blob()
  audioCache.set(cacheKey, blob)
  return blob
}

/**
 * Generate speech using OpenAI TTS
 * @param {string} text - Text to convert to speech
 * @param {string} voice - OpenAI voice name (default: alloy)
 * @returns {Promise<Blob>} Audio blob
 */
async function generateOpenAISpeech(text, voice = 'alloy') {
  const cacheKey = `openai_${voice}_${text}`
  if (audioCache.has(cacheKey)) {
    return audioCache.get(cacheKey)
  }

  const response = await fetch('https://api.openai.com/v1/audio/speech', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'tts-1',
      voice: voice,
      input: text
    })
  })

  if (!response.ok) {
    throw new Error(`OpenAI TTS failed: ${response.statusText}`)
  }

  const blob = await response.blob()
  audioCache.set(cacheKey, blob)
  return blob
}

/**
 * Generate and play speech
 * @param {string} text - Text to speak
 * @param {Object} options - Options for TTS
 * @param {string} options.provider - 'elevenlabs' or 'openai'
 * @param {string} options.voiceId - ElevenLabs voice ID or OpenAI voice name
 * @param {Function} options.onStart - Callback when audio starts playing
 * @param {Function} options.onEnd - Callback when audio ends
 * @returns {Promise<HTMLAudioElement>} Audio element
 */
export async function speak(text, options = {}) {
  const {
    provider = TTS_PROVIDER,
    voiceId,
    onStart,
    onEnd
  } = options

  try {
    let blob

    if (provider === 'elevenlabs') {
      blob = await generateElevenLabsSpeech(text, voiceId)
    } else if (provider === 'openai') {
      blob = await generateOpenAISpeech(text, voiceId)
    } else {
      throw new Error(`Unknown TTS provider: ${provider}`)
    }

    // Create audio element and play
    const audioUrl = URL.createObjectURL(blob)
    const audio = new Audio(audioUrl)

    audio.onplay = () => {
      if (onStart) onStart()
    }

    audio.onended = () => {
      URL.revokeObjectURL(audioUrl)
      if (onEnd) onEnd()
    }

    audio.onerror = (error) => {
      URL.revokeObjectURL(audioUrl)
      console.error('Audio playback error:', error)
      if (onEnd) onEnd()
    }

    await audio.play()
    return audio
  } catch (error) {
    console.error('TTS error:', error)
    throw error
  }
}

/**
 * Stop currently playing audio
 * @param {HTMLAudioElement} audio - Audio element to stop
 */
export function stopSpeech(audio) {
  if (audio) {
    audio.pause()
    audio.currentTime = 0
  }
}

/**
 * Check if TTS is configured
 * @returns {boolean}
 */
export function isTTSAvailable() {
  if (TTS_PROVIDER === 'elevenlabs') {
    return !!ELEVENLABS_API_KEY
  } else if (TTS_PROVIDER === 'openai') {
    return !!OPENAI_API_KEY
  }
  return false
}

/**
 * Clear audio cache
 */
export function clearAudioCache() {
  audioCache.clear()
}
