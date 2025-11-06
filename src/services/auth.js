/**
 * Authentication Service for Character Foundry
 *
 * Handles Google OAuth, Discord OAuth, and Guest login flows.
 * Integrates with Node.js backend for account linking and session management.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID
const DISCORD_CLIENT_ID = import.meta.env.VITE_DISCORD_CLIENT_ID
const DISCORD_REDIRECT_URI = import.meta.env.VITE_DISCORD_REDIRECT_URI || `${window.location.origin}/auth/discord/callback`

// Local storage keys
const TOKEN_KEY = 'cf_auth_token'
const USER_KEY = 'cf_user'

/**
 * Initialize Google OAuth
 * Call this on app load to initialize the Google Sign-In library
 */
export const initGoogleAuth = () => {
  return new Promise((resolve, reject) => {
    // Load Google Identity Services script
    if (window.google?.accounts?.id) {
      resolve()
      return
    }

    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.onload = resolve
    script.onerror = reject
    document.head.appendChild(script)
  })
}

/**
 * Sign in with Google
 * Opens Google OAuth popup and returns user data
 */
export const signInWithGoogle = async () => {
  try {
    await initGoogleAuth()

    return new Promise((resolve, reject) => {
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: async (response) => {
          try {
            // Send the credential to your backend
            const result = await fetch(`${API_BASE_URL}/auth/google`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                credential: response.credential
              })
            })

            if (!result.ok) {
              throw new Error('Failed to authenticate with Google')
            }

            const data = await result.json()

            // Store token and user data
            localStorage.setItem(TOKEN_KEY, data.token)
            localStorage.setItem(USER_KEY, JSON.stringify(data.user))

            resolve(data.user)
          } catch (error) {
            reject(error)
          }
        }
      })

      // Trigger the One Tap prompt
      window.google.accounts.id.prompt((notification) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          // Fallback to button flow
          window.google.accounts.id.renderButton(
            document.getElementById('google-signin-button'),
            { theme: 'filled_blue', size: 'large', width: '100%' }
          )
        }
      })
    })
  } catch (error) {
    console.error('Error signing in with Google:', error)
    throw error
  }
}

/**
 * Sign in with Discord
 * Redirects to Discord OAuth flow
 */
export const signInWithDiscord = () => {
  const scope = 'identify email'
  const discordAuthUrl = `https://discord.com/api/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&redirect_uri=${encodeURIComponent(DISCORD_REDIRECT_URI)}&response_type=code&scope=${encodeURIComponent(scope)}`

  window.location.href = discordAuthUrl
}

/**
 * Handle Discord OAuth callback
 * Call this on the redirect page after Discord auth
 */
export const handleDiscordCallback = async (code) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/discord`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code,
        redirectUri: DISCORD_REDIRECT_URI
      })
    })

    if (!response.ok) {
      throw new Error('Failed to authenticate with Discord')
    }

    const data = await response.json()

    // Store token and user data
    localStorage.setItem(TOKEN_KEY, data.token)
    localStorage.setItem(USER_KEY, JSON.stringify(data.user))

    return data.user
  } catch (error) {
    console.error('Error handling Discord callback:', error)
    throw error
  }
}

/**
 * Sign in as Guest
 * Creates a temporary guest account
 */
export const signInAsGuest = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/guest`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    })

    if (!response.ok) {
      throw new Error('Failed to create guest account')
    }

    const data = await response.json()

    // Store token and user data
    localStorage.setItem(TOKEN_KEY, data.token)
    localStorage.setItem(USER_KEY, JSON.stringify(data.user))

    return data.user
  } catch (error) {
    console.error('Error signing in as guest:', error)
    throw error
  }
}

/**
 * Sign out
 * Clears local storage and redirects to landing page
 */
export const signOut = async () => {
  try {
    const token = getAuthToken()

    if (token) {
      // Notify backend of logout
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
    }
  } catch (error) {
    console.error('Error signing out:', error)
  } finally {
    // Clear local storage regardless of API call success
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  }
}

/**
 * Get current auth token
 */
export const getAuthToken = () => {
  return localStorage.getItem(TOKEN_KEY)
}

/**
 * Get current user
 */
export const getCurrentUser = () => {
  const userJson = localStorage.getItem(USER_KEY)
  return userJson ? JSON.parse(userJson) : null
}

/**
 * Check if user is authenticated
 */
export const isAuthenticated = () => {
  return !!getAuthToken()
}

/**
 * Link guest account to Google/Discord
 * Allows users to upgrade from guest to full account
 */
export const linkAccount = async (provider) => {
  const token = getAuthToken()

  if (!token) {
    throw new Error('Must be logged in to link account')
  }

  if (provider === 'google') {
    // Store current token for after OAuth
    sessionStorage.setItem('linking_account', 'true')
    return signInWithGoogle()
  } else if (provider === 'discord') {
    sessionStorage.setItem('linking_account', 'true')
    return signInWithDiscord()
  }
}

/**
 * Get auth headers for API requests
 */
export const getAuthHeaders = () => {
  const token = getAuthToken()
  return token ? {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  } : {
    'Content-Type': 'application/json'
  }
}
