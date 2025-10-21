import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { signInWithGoogle } from '../lib/auth'

function Login() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  const handleGoogleSignIn = async () => {
    setLoading(true)
    setError(null)

    try {
      console.log('User clicked Sign in with Google')
      const user = await signInWithGoogle()
      console.log('Sign-in complete, user:', user?.email)
      
      // Popup returns immediately with user, so we can navigate
      // Router's auth listener will also update isAuthenticated state
      if (user) {
        console.log('Navigating to dashboard...')
        navigate('/dashboard')
      }
    } catch (err) {
      console.error('Sign in error:', err)
      setError('Failed to sign in with Google. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-card">
          <h1>CollabCanvas</h1>
          <p className="login-subtitle">Real-time Collaborative Whiteboard</p>

          <div className="login-content">
            <p>Sign in to start collaborating</p>

            {error && (
              <div className="error-message" style={{
                color: '#dc3545',
                marginBottom: '1rem',
                padding: '0.5rem',
                backgroundColor: '#f8d7da',
                borderRadius: '4px'
              }}>
                {error}
              </div>
            )}

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
              Secure authentication powered by Firebase
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login

