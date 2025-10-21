import { initializeApp } from 'firebase/app'
import {
  getAuth,
  GoogleAuthProvider,
  signInWithRedirect,
  getRedirectResult,
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
    return initializeFirebase()!
  }
  return auth!
}

// Sign in with Google (uses redirect to avoid COOP issues)
export async function signInWithGoogle(): Promise<void> {
  const authInstance = getAuthInstance()
  const provider = new GoogleAuthProvider()

  try {
    // This will redirect the user to Google sign-in
    await signInWithRedirect(authInstance, provider)
  } catch (error) {
    console.error('Error signing in with Google:', error)
    throw error
  }
}

// Handle redirect result after Google sign-in
export async function handleAuthRedirect(): Promise<User | null> {
  const authInstance = getAuthInstance()

  try {
    console.log('Checking for redirect result...')
    const result = await getRedirectResult(authInstance)
    console.log('Redirect result:', result)
    console.log('User from result:', result?.user)
    return result?.user || null
  } catch (error) {
    console.error('Error handling auth redirect:', error)
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

