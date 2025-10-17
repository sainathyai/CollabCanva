import { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { onAuthChange } from '../lib/auth'
import { ProjectProvider } from '../contexts/ProjectContext'
import Login from '../pages/Login'
import Canvas from '../pages/Canvas'
import { Dashboard } from '../pages/Dashboard'

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
    <ProjectProvider>
      <Routes>
        <Route 
          path="/login" 
          element={
            isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />
          } 
        />
        <Route 
          path="/dashboard" 
          element={
            isAuthenticated ? <Dashboard /> : <Navigate to="/login" replace />
          } 
        />
        <Route 
          path="/canvas/:projectId" 
          element={
            isAuthenticated ? <Canvas /> : <Navigate to="/login" replace />
          } 
        />
        {/* Legacy route - redirect to dashboard */}
        <Route 
          path="/canvas" 
          element={<Navigate to="/dashboard" replace />} 
        />
        <Route 
          path="/" 
          element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} 
        />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </ProjectProvider>
  )
}

export default Router

