import { useState } from 'react'
import { useUser } from '../contexts/UserContext'
import './UserMenu.css'

function UserMenu() {
  const { user, isGuest, logout, loginWithGoogle, loginWithDiscord } = useUser()
  const [showMenu, setShowMenu] = useState(false)

  if (!user) return null

  const handleLogout = async () => {
    await logout()
    setShowMenu(false)
  }

  const handleUpgrade = (provider) => {
    if (provider === 'google') {
      loginWithGoogle()
    } else if (provider === 'discord') {
      loginWithDiscord()
    }
    setShowMenu(false)
  }

  return (
    <div className="user-menu">
      <button
        className="user-menu-trigger"
        onClick={() => setShowMenu(!showMenu)}
      >
        <div className="user-avatar">
          {user.avatar ? (
            <img src={user.avatar} alt={user.name} />
          ) : (
            <span>{isGuest ? '👤' : user.name?.[0]?.toUpperCase() || '?'}</span>
          )}
        </div>
        <span className="user-name">{isGuest ? 'Guest' : user.name}</span>
      </button>

      {showMenu && (
        <>
          <div className="menu-overlay" onClick={() => setShowMenu(false)} />
          <div className="user-dropdown">
            <div className="dropdown-header">
              <div className="user-info">
                <div className="user-avatar-large">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} />
                  ) : (
                    <span>{isGuest ? '👤' : user.name?.[0]?.toUpperCase() || '?'}</span>
                  )}
                </div>
                <div className="user-details">
                  <div className="user-name-large">{isGuest ? 'Guest User' : user.name}</div>
                  {user.email && <div className="user-email">{user.email}</div>}
                  {isGuest && <div className="user-badge">Guest Account</div>}
                </div>
              </div>
            </div>

            <div className="dropdown-divider" />

            {isGuest && (
              <>
                <div className="dropdown-section">
                  <div className="upgrade-prompt">
                    <p>Upgrade your account to sync characters across devices</p>
                  </div>
                  <button
                    className="dropdown-btn upgrade-google"
                    onClick={() => handleUpgrade('google')}
                  >
                    <span className="btn-icon">
                      <svg width="16" height="16" viewBox="0 0 18 18">
                        <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z"/>
                        <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 0 1-7.18-2.54H1.83v2.07A8 8 0 0 0 8.98 17z"/>
                        <path fill="#FBBC05" d="M4.5 10.52a4.8 4.8 0 0 1 0-3.04V5.41H1.83a8 8 0 0 0 0 7.18l2.67-2.07z"/>
                        <path fill="#EA4335" d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.83 5.4L4.5 7.49a4.77 4.77 0 0 1 4.48-3.3z"/>
                      </svg>
                    </span>
                    Link Google Account
                  </button>
                  <button
                    className="dropdown-btn upgrade-discord"
                    onClick={() => handleUpgrade('discord')}
                  >
                    <span className="btn-icon">🎮</span>
                    Link Discord Account
                  </button>
                </div>
                <div className="dropdown-divider" />
              </>
            )}

            <button className="dropdown-btn" onClick={handleLogout}>
              <span className="btn-icon">🚪</span>
              Sign Out
            </button>
          </div>
        </>
      )}
    </div>
  )
}

export default UserMenu
