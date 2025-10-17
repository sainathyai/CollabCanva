import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './styles.css'
import './styles/animations.css'
import { initializeFirebase } from './lib/auth'

// Initialize Firebase on app startup
initializeFirebase()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

