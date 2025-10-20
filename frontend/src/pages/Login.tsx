import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { signInWithGoogle, handleAuthRedirect } from '../lib/auth'

function Login() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  // Handle redirect result when component mounts
  useEffect(() => {
    const checkAuthRedirect = async () => {
      setLoading(true)
      try {
        const user = await handleAuthRedirect()
        if (user) {
          // Successfully signed in via redirect
          navigate('/canvas')
        }
      } catch (err) {
        console.error('Auth redirect error:', err)
        setError('Failed to complete sign in. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    checkAuthRedirect()
  }, [navigate])

  const handleGoogleSignIn = async () => {
    setLoading(true)
    setError(null)
    
    try {
      // This will redirect to Google (no return, user leaves page)
      await signInWithGoogle()
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

