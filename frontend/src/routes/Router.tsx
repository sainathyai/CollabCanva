import { Routes, Route, Navigate } from 'react-router-dom'
import Login from '../pages/Login'
import Canvas from '../pages/Canvas'

function Router() {
  // TODO: Implement authentication check in PR3
  const isAuthenticated = false

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route 
        path="/canvas" 
        element={
          isAuthenticated ? <Canvas /> : <Navigate to="/login" replace />
        } 
      />
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default Router

