import { useState, useEffect, lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { onAuthChange } from '../lib/auth'
import { ProjectProvider } from '../contexts/ProjectContext'
import Login from '../pages/Login'

// Lazy load heavy components for better initial load performance
const Canvas = lazy(() => import('../pages/Canvas'))
const Dashboard = lazy(() => import('../pages/Dashboard'))

function Router() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)

  useEffect(() => {
    console.log('[Router] Setting up auth listener...')
    // Subscribe to auth state changes
    const unsubscribe = onAuthChange((user) => {
      console.log('[Router] Auth state changed:', user ? `User: ${user.email}` : 'No user')
      setIsAuthenticated(!!user)
      console.log('[Router] isAuthenticated set to:', !!user)
    })

    // Cleanup subscription on unmount
    return () => {
      console.log('[Router] Cleaning up auth listener')
      unsubscribe()
    }
  }, [])

  // Show loading state while checking auth
  if (isAuthenticated === null) {
    console.log('[Router] Rendering loading state (isAuthenticated is null)')
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

  console.log('[Router] Rendering routes, isAuthenticated:', isAuthenticated)

  return (
    <ProjectProvider>
      <Suspense fallback={
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
          Loading...
        </div>
      }>
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
      </Suspense>
    </ProjectProvider>
  )
}

export default Router

