/**
 * History Manager for Undo/Redo Functionality
 * Tracks canvas actions and enables undo/redo operations
 */

import type { CanvasObject } from '../types'

export type ActionType =
  | 'create'
  | 'delete'
  | 'modify'
  | 'move'
  | 'batch_delete'

export interface HistoryAction {
  type: ActionType
  timestamp: number
  // For create/delete
  object?: CanvasObject
  objects?: CanvasObject[] // For batch operations
  // For modify/move
  objectId?: string
  before?: Partial<CanvasObject>
  after?: Partial<CanvasObject>
}

export class HistoryManager {
  private undoStack: HistoryAction[] = []
  private redoStack: HistoryAction[] = []
  private maxHistorySize: number

  constructor(maxHistorySize: number = 50) {
    this.maxHistorySize = maxHistorySize
  }

  /**
   * Add an action to the history
   */
  addAction(action: HistoryAction): void {
    // Add to undo stack
    this.undoStack.push(action)

    // Limit stack size
    if (this.undoStack.length > this.maxHistorySize) {
      this.undoStack.shift() // Remove oldest
    }

    // Clear redo stack when new action is added
    this.redoStack = []

    console.log(`📝 History: Added ${action.type} action`)
  }

  /**
   * Undo the last action
   */
  undo(): HistoryAction | null {
    const action = this.undoStack.pop()

    if (!action) {
      console.log('⚠️ Nothing to undo')
      return null
    }

    // Add to redo stack
    this.redoStack.push(action)

    console.log(`↩️ Undo: ${action.type}`)
    return action
  }

  /**
   * Redo the last undone action
   */
  redo(): HistoryAction | null {
    const action = this.redoStack.pop()

    if (!action) {
      console.log('⚠️ Nothing to redo')
      return null
    }

    // Add back to undo stack
    this.undoStack.push(action)

    console.log(`↪️ Redo: ${action.type}`)
    return action
  }

  /**
   * Check if undo is available
   */
  canUndo(): boolean {
    return this.undoStack.length > 0
  }

  /**
   * Check if redo is available
   */
  canRedo(): boolean {
    return this.redoStack.length > 0
  }

  /**
   * Clear all history
   */
  clear(): void {
    this.undoStack = []
    this.redoStack = []
    console.log('🗑️ History cleared')
  }

  /**
   * Get history stats
   */
  getStats(): { undoCount: number; redoCount: number } {
    return {
      undoCount: this.undoStack.length,
      redoCount: this.redoStack.length
    }
  }
}

/**
 * Helper to create history actions
 */
export const createHistoryAction = {
  create: (object: CanvasObject): HistoryAction => ({
    type: 'create',
    timestamp: Date.now(),
    object
  }),

  delete: (object: CanvasObject): HistoryAction => ({
    type: 'delete',
    timestamp: Date.now(),
    object
  }),

  batchDelete: (objects: CanvasObject[]): HistoryAction => ({
    type: 'batch_delete',
    timestamp: Date.now(),
    objects
  }),

  modify: (objectId: string, before: Partial<CanvasObject>, after: Partial<CanvasObject>): HistoryAction => ({
    type: 'modify',
    timestamp: Date.now(),
    objectId,
    before,
    after
  }),

  move: (objectId: string, before: { x: number; y: number }, after: { x: number; y: number }): HistoryAction => ({
    type: 'move',
    timestamp: Date.now(),
    objectId,
    before,
    after
  })
}

