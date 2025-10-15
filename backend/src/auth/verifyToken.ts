import { env } from '../env.js'
import { logger } from '../utils/logger.js'
import admin from 'firebase-admin'

export interface UserClaims {
  uid: string
  email?: string
  name?: string
}

// Initialize Firebase Admin (only once)
let firebaseInitialized = false

function initializeFirebase() {
  if (firebaseInitialized) return

  if (env.FIREBASE_PROJECT_ID) {
    admin.initializeApp({
      projectId: env.FIREBASE_PROJECT_ID,
    })
    firebaseInitialized = true
    logger.info('Firebase Admin SDK initialized', { projectId: env.FIREBASE_PROJECT_ID })
  }
}

/**
 * Verify Firebase ID token
 * For MVP, accepts any token in development
 * In production, verifies with Firebase Admin SDK
 */
export async function verifyToken(token: string, displayName?: string): Promise<UserClaims> {
  // Development/MVP mode: Accept any non-empty token
  if (env.NODE_ENV === 'development' || !env.FIREBASE_PROJECT_ID) {
    logger.warn('Auth verification in development mode - accepting all tokens')

    // Use provided displayName from frontend or fallback
    return {
      uid: `dev-user-${Date.now()}`,
      email: 'dev@example.com',
      name: displayName || 'Development User'
    }
  }

  // Production mode: Verify with Firebase Admin SDK
  try {
    initializeFirebase()

    const decodedToken = await admin.auth().verifyIdToken(token)

    logger.info('Token verified successfully', { uid: decodedToken.uid })

    return {
      uid: decodedToken.uid,
      email: decodedToken.email,
      name: decodedToken.name || decodedToken.email || 'User'
    }
  } catch (error) {
    logger.error('Token verification failed', { error })
    throw new Error('Invalid token')
  }
}

