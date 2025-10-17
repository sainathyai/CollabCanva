import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { onAuthChange, signOut as authSignOut } from '../lib/auth'
import type { User } from 'firebase/auth'

interface HeaderProps {
  isConnected?: boolean
  isAuthenticated?: boolean
  projectName?: string
}

function Header({ isConnected = false, isAuthenticated = false, projectName }: HeaderProps = {}) {
  const location = useLocation()
  const navigate = useNavigate()
  const [user, setUser] = useState<User | null>(null)
  const isCanvasPage = location.pathname.startsWith('/canvas/')

  useEffect(() => {
    // Subscribe to auth state changes
    const unsubscribe = onAuthChange((currentUser) => {
      setUser(currentUser)
    })

    return () => unsubscribe()
  }, [])

  const displayName = user?.displayName || user?.email || 'User'

  const handleSignOut = async () => {
    try {
      await authSignOut()
      navigate('/login')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  // Don't show header on login page or dashboard
  if (location.pathname === '/login' || location.pathname === '/dashboard') {
    return null
  }

  return (
    <header className="app-header">
      <div className="header-content" style={{ maxWidth: '100%', width: '100%', padding: '0 2%' }}>
        <div className="header-left" style={{ display: 'flex', alignItems: 'center', gap: '1rem', minWidth: 0, flex: '1' }}>
          {isCanvasPage && (
            <button
              onClick={() => navigate('/dashboard')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '2px 4px',
                fontSize: 'clamp(1.25rem, 2vw, 1.75rem)',
                fontWeight: 600,
                color: 'inherit',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer'
              }}
              onMouseOver={(e) => {
                const box = e.currentTarget.querySelector('[data-icon-box]') as HTMLElement | null
                if (box) {
                  box.style.background = 'linear-gradient(135deg, #1d4ed8 0%, #6d28d9 100%)'
                  box.style.boxShadow = '0 2px 6px rgba(37, 99, 235, 0.4)'
                }
              }}
              onMouseOut={(e) => {
                const box = e.currentTarget.querySelector('[data-icon-box]') as HTMLElement | null
                if (box) {
                  box.style.background = 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)'
                  box.style.boxShadow = '0 1px 3px rgba(37, 99, 235, 0.3)'
                }
              }}
            >
              <span
                data-icon-box
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 'clamp(1.75rem, 3vw, 2.25rem)',
                  height: 'clamp(1.75rem, 3vw, 2.25rem)',
                  borderRadius: '4px',
                  background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
                  boxShadow: '0 1px 3px rgba(37, 99, 235, 0.3)'
                }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" style={{ width: '70%', height: '70%' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </span>
              <span
                style={{
                  lineHeight: 1,
                  fontWeight: 700,
                  fontSize: 'clamp(0.9rem, 1.2vw, 1.1rem)',
                  background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  color: 'transparent',
                  letterSpacing: '0.3px'
                }}
              >
                Dashboard
              </span>
            </button>
          )}
          <h1 className="header-title" style={{ fontSize: 'clamp(1.25rem, 2vw, 1.75rem)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {projectName || 'CollabCanvas'}
          </h1>
        </div>

        <div className="header-right" style={{ display: 'flex', alignItems: 'center', gap: 'clamp(0.5rem, 2vw, 1.25rem)', flexShrink: 0 }}>
          {user && location.pathname !== '/login' && (
            <>
              {isCanvasPage && (
                <div className={isConnected && isAuthenticated ? 'header-status status-connected' : 'header-status status-disconnected'}>
                  <span className="status-dot">
                    {isConnected && isAuthenticated ? '●' : '○'}
                  </span>
                  <span style={{ fontSize: 'clamp(0.75rem, 1.5vw, 0.875rem)' }}>
                    {isConnected && isAuthenticated ? 'Connected' : isConnected ? 'Authenticating...' : 'Offline'}
                  </span>
                </div>
              )}
              <span className="user-name" style={{ fontSize: 'clamp(0.875rem, 1.5vw, 1rem)' }}>{displayName}</span>
              <button className="btn-secondary" onClick={handleSignOut} style={{ fontSize: 'clamp(0.875rem, 1.5vw, 1rem)', padding: 'clamp(0.5rem, 1vw, 0.75rem) clamp(0.75rem, 2vw, 1.25rem)' }}>
                Sign Out
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header

