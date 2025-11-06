import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { handleDiscordCallback } from '../services/auth'
import { useUser } from '../contexts/UserContext'
import './LoadingScreen.css'

function AuthCallback() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user } = useUser()

  useEffect(() => {
    const processCallback = async () => {
      const code = searchParams.get('code')
      const error = searchParams.get('error')

      if (error) {
        console.error('OAuth error:', error)
        navigate('/?auth_error=' + error)
        return
      }

      if (!code) {
        navigate('/')
        return
      }

      try {
        // Handle Discord callback
        await handleDiscordCallback(code)
        // Force user context to update
        window.location.href = '/'
      } catch (err) {
        console.error('Failed to complete authentication:', err)
        navigate('/?auth_error=callback_failed')
      }
    }

    processCallback()
  }, [searchParams, navigate])

  return (
    <div className="loading-screen">
      <div className="loading-content">
        <div className="loading-spinner">
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
        </div>
        <h2 className="loading-text">Completing sign in...</h2>
      </div>
    </div>
  )
}

export default AuthCallback
