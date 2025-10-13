import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { onAuthChange, signOut as authSignOut } from '../lib/auth'
import type { User } from 'firebase/auth'

function Header() {
  const location = useLocation()
  const navigate = useNavigate()
  const [user, setUser] = useState<User | null>(null)
  
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

  // Don't show header on login page
  if (location.pathname === '/login') {
    return null
  }

  return (
    <header className="app-header">
      <div className="header-content">
        <div className="header-left">
          <h1 className="header-title">CollabCanvas</h1>
        </div>
        
        <div className="header-right">
          {user && (
            <>
              <span className="user-name">{displayName}</span>
              <button className="btn-secondary" onClick={handleSignOut}>
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

