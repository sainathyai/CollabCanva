// Presence state management for tracking active users

export interface PresenceInfo {
  userId: string
  displayName: string
  x: number
  y: number
  lastSeen: number
}

// In-memory presence storage (Map of userId -> PresenceInfo)
const presenceMap = new Map<string, PresenceInfo>()

/**
 * Add or update user presence
 */
export function updatePresence(
  userId: string,
  displayName: string,
  x?: number,
  y?: number
): PresenceInfo {
  const existing = presenceMap.get(userId)
  
  const presence: PresenceInfo = {
    userId,
    displayName,
    x: x !== undefined ? x : existing?.x ?? 0,
    y: y !== undefined ? y : existing?.y ?? 0,
    lastSeen: Date.now()
  }
  
  presenceMap.set(userId, presence)
  return presence
}

/**
 * Update only cursor position for a user
 */
export function updateCursor(userId: string, x: number, y: number): PresenceInfo | null {
  const existing = presenceMap.get(userId)
  if (!existing) {
    return null
  }
  
  existing.x = x
  existing.y = y
  existing.lastSeen = Date.now()
  
  presenceMap.set(userId, existing)
  return existing
}

/**
 * Remove user presence
 */
export function removePresence(userId: string): boolean {
  return presenceMap.delete(userId)
}

/**
 * Get all active presences
 */
export function getAllPresence(): PresenceInfo[] {
  return Array.from(presenceMap.values())
}

/**
 * Get specific user presence
 */
export function getPresence(userId: string): PresenceInfo | undefined {
  return presenceMap.get(userId)
}

/**
 * Clean up stale presences (older than timeout milliseconds)
 */
export function cleanupStalePresence(timeoutMs: number = 30000): string[] {
  const now = Date.now()
  const staleUsers: string[] = []
  
  presenceMap.forEach((presence, userId) => {
    if (now - presence.lastSeen > timeoutMs) {
      presenceMap.delete(userId)
      staleUsers.push(userId)
    }
  })
  
  return staleUsers
}

/**
 * Get count of active users
 */
export function getPresenceCount(): number {
  return presenceMap.size
}

/**
 * Clear all presence data (for testing)
 */
export function clearAllPresence(): void {
  presenceMap.clear()
}

