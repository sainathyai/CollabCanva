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
    return initializeFirebase()
  }
  return auth
}

// Sign in with Google
export async function signInWithGoogle(): Promise<User> {
  const authInstance = getAuthInstance()
  const provider = new GoogleAuthProvider()
  
  try {
    const result = await signInWithPopup(authInstance, provider)
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

