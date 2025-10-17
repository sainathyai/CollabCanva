import { BrowserRouter } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Header from './components/Header'
import Router from './routes/Router'

function App() {
  // Connection state will be passed from Canvas component via global callback
  const [connectionState, setConnectionState] = useState({ 
    isConnected: false, 
    isAuthenticated: false,
    projectName: undefined as string | undefined
  })

  // Make connection state updater available globally
  useEffect(() => {
    (window as any).updateConnectionState = setConnectionState
    return () => {
      delete (window as any).updateConnectionState
    }
  }, [])

  return (
    <BrowserRouter>
      <div className="app">
        <Header 
          isConnected={connectionState.isConnected} 
          isAuthenticated={connectionState.isAuthenticated}
          projectName={connectionState.projectName}
        />
        <Router />
      </div>
    </BrowserRouter>
  )
}

export default App

