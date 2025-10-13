import { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { onAuthChange } from '../lib/auth'
import Login from '../pages/Login'
import Canvas from '../pages/Canvas'

function Router() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)

  useEffect(() => {
    // Subscribe to auth state changes
    const unsubscribe = onAuthChange((user) => {
      setIsAuthenticated(!!user)
    })

    // Cleanup subscription on unmount
    return () => unsubscribe()
  }, [])

  // Show loading state while checking auth
  if (isAuthenticated === null) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}>
        Loading...
      </div>
    )
  }

  return (
    <Routes>
      <Route 
        path="/login" 
        element={
          isAuthenticated ? <Navigate to="/canvas" replace /> : <Login />
        } 
      />
      <Route 
        path="/canvas" 
        element={
          isAuthenticated ? <Canvas /> : <Navigate to="/login" replace />
        } 
      />
      <Route 
        path="/" 
        element={<Navigate to={isAuthenticated ? "/canvas" : "/login"} replace />} 
      />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default Router

