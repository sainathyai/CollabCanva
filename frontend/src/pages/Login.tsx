import { useState } from 'react'

function Login() {
  const [loading, setLoading] = useState(false)

  const handleGoogleSignIn = async () => {
    setLoading(true)
    // TODO: Implement Firebase Google sign-in in PR3
    console.log('Sign in with Google - to be implemented in PR3')
    setLoading(false)
  }

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-card">
          <h1>CollabCanvas</h1>
          <p className="login-subtitle">Real-time Collaborative Whiteboard</p>
          
          <div className="login-content">
            <p>Sign in to start collaborating</p>
            <button 
              className="btn-google" 
              onClick={handleGoogleSignIn}
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign in with Google'}
            </button>
          </div>

          <div className="login-footer">
            <p className="text-muted">
              Authentication will be implemented in PR3
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login

