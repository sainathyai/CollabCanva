import { env } from '../env.js'
import { logger } from '../utils/logger.js'

export interface UserClaims {
  uid: string
  email?: string
  name?: string
}

/**
 * Verify Firebase ID token
 * For MVP, this is a stub that accepts any token in development
 * In production, this should use firebase-admin to verify tokens
 */
export async function verifyToken(token: string, displayName?: string): Promise<UserClaims> {
  // Development/MVP mode: Accept any non-empty token
  if (env.NODE_ENV === 'development' || !env.FIREBASE_PROJECT_ID) {
    logger.warn('Auth verification in development mode - accepting all tokens')
    
    // Generate unique user ID based on timestamp
    const timestamp = Date.now()
    const uid = `dev-user-${timestamp}`
    
    return {
      uid,
      email: `user@dev.local`,
      name: displayName || `User ${timestamp.toString().slice(-4)}`
    }
  }

  // Production mode: Verify with Firebase Admin SDK
  try {
    // TODO: Implement Firebase Admin SDK verification
    // const admin = require('firebase-admin')
    // const decodedToken = await admin.auth().verifyIdToken(token)
    // return {
    //   uid: decodedToken.uid,
    //   email: decodedToken.email,
    //   name: decodedToken.name
    // }
    
    throw new Error('Firebase Admin SDK not yet implemented')
  } catch (error) {
    logger.error('Token verification failed', { error })
    throw new Error('Invalid token')
  }
}

