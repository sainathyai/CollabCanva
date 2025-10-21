import { initializeApp } from 'firebase/app'
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User
} from 'firebase/auth'

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
}

// Log config to verify environment variables are loaded
console.log('Firebase config loaded:', {
  apiKey: firebaseConfig.apiKey ? '***' + firebaseConfig.apiKey.slice(-4) : 'MISSING',
  authDomain: firebaseConfig.authDomain || 'MISSING',
  projectId: firebaseConfig.projectId || 'MISSING'
})

// Initialize Firebase
let app: ReturnType<typeof initializeApp> | null = null
let auth: ReturnType<typeof getAuth> | null = null

export function initializeFirebase() {
  if (!app) {
    app = initializeApp(firebaseConfig)
    auth = getAuth(app)
  }
  return auth
}

// Get auth instance
export function getAuthInstance() {
  if (!auth) {
    return initializeFirebase()!
  }
  return auth!
}

// Sign in with Google (uses popup for custom domain compatibility)
export async function signInWithGoogle(): Promise<User | null> {
  const authInstance = getAuthInstance()
  const provider = new GoogleAuthProvider()

  try {
    console.log('Starting Google sign-in with popup...')
    const result = await signInWithPopup(authInstance, provider)
    console.log('Sign-in successful:', result.user.email)
    return result.user
  } catch (error) {
    console.error('Error signing in with Google:', error)
    throw error
  }
}

// Sign out
export async function signOut(): Promise<void> {
  const authInstance = getAuthInstance()

  try {
    await firebaseSignOut(authInstance)
  } catch (error) {
    console.error('Error signing out:', error)
    throw error
  }
}

// Get current user
export function getCurrentUser(): User | null {
  const authInstance = getAuthInstance()
  return authInstance.currentUser
}

// Subscribe to auth state changes
export function onAuthChange(callback: (user: User | null) => void): () => void {
  const authInstance = getAuthInstance()
  return onAuthStateChanged(authInstance, callback)
}

// Check if user is authenticated
export function isAuthenticated(): boolean {
  return getCurrentUser() !== null
}

