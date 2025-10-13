import { useLocation } from 'react-router-dom'

function Header() {
  const location = useLocation()
  
  // TODO: Get user from auth context in PR3
  const user = null
  const displayName = user ? 'User Name' : null

  const handleSignOut = () => {
    // TODO: Implement sign out in PR3
    console.log('Sign out - to be implemented in PR3')
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
          {displayName && (
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

