import { createContext, useContext, useState, useEffect } from 'react'
import {
  getCurrentUser,
  signInWithGoogle,
  signInWithDiscord,
  signInAsGuest,
  signOut as authSignOut,
  isAuthenticated
} from '../services/auth'

const UserContext = createContext()

export const useUser = () => {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Initialize user from local storage
  useEffect(() => {
    const initUser = async () => {
      if (isAuthenticated()) {
        const currentUser = getCurrentUser()
        setUser(currentUser)
      }
      setLoading(false)
    }

    initUser()
  }, [])

  const loginWithGoogle = async () => {
    try {
      const user = await signInWithGoogle()
      setUser(user)
      return user
    } catch (error) {
      console.error('Failed to login with Google:', error)
      throw error
    }
  }

  const loginWithDiscord = () => {
    signInWithDiscord()
  }

  const loginAsGuest = async () => {
    try {
      const user = await signInAsGuest()
      setUser(user)
      return user
    } catch (error) {
      console.error('Failed to login as guest:', error)
      throw error
    }
  }

  const logout = async () => {
    try {
      await authSignOut()
      setUser(null)
    } catch (error) {
      console.error('Failed to logout:', error)
      throw error
    }
  }

  const value = {
    user,
    loading,
    isGuest: user?.accountType === 'guest',
    isAuthenticated: !!user,
    loginWithGoogle,
    loginWithDiscord,
    loginAsGuest,
    logout
  }

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}
