// WebSocket message types for CollabCanvas

export enum MessageType {
  // Connection
  CONNECT = 'connect',
  DISCONNECT = 'disconnect',

  // Auth
  AUTH = 'auth',
  AUTH_SUCCESS = 'auth.success',
  AUTH_ERROR = 'auth.error',

  // Object operations (for PR 5)
  OBJECT_CREATE = 'object.create',
  OBJECT_UPDATE = 'object.update',
  OBJECT_DELETE = 'object.delete',
  INITIAL_STATE = 'initialState',

  // Presence (for PR 7)
  PRESENCE_JOIN = 'presence.join',
  PRESENCE_CURSOR = 'presence.cursor',
  PRESENCE_LEAVE = 'presence.leave',

  // Error
  ERROR = 'error'
}

export interface BaseMessage {
  type: MessageType
  timestamp: string
}

export interface AuthMessage extends BaseMessage {
  type: MessageType.AUTH
  token: string
  displayName?: string
  projectId?: string
}

export interface AuthSuccessMessage extends BaseMessage {
  type: MessageType.AUTH_SUCCESS
  userId: string
  displayName?: string
}

export interface AuthErrorMessage extends BaseMessage {
  type: MessageType.AUTH_ERROR
  error: string
}

export interface ErrorMessage extends BaseMessage {
  type: MessageType.ERROR
  error: string
}

// Canvas Object interface
export type ShapeType = 'rectangle' | 'circle' | 'line' | 'text' | 'triangle' | 'star' | 'polygon' | 'arrow' | 'ellipse' | 'roundedRect' | 'diamond' | 'pentagon'

export interface CanvasObject {
  id: string
  type: ShapeType
  x: number
  y: number
  width: number
  height: number
  rotation: number  // NEW: for Konva rotation
  color: string     // NEW: renamed from 'fill' for consistency
  zIndex: number    // NEW: for layer management

  // Text-specific fields
  text?: string
  fontSize?: number
  fontFamily?: string

  // Line-specific fields
  points?: number[] // [x1, y1, x2, y2]

  createdBy: string
  createdAt: string
  updatedAt?: string // Optional now
}

// Object operation messages
export interface ObjectCreateMessage extends BaseMessage {
  type: MessageType.OBJECT_CREATE
  object: CanvasObject
}

export interface ObjectUpdateMessage extends BaseMessage {
  type: MessageType.OBJECT_UPDATE
  object: Partial<CanvasObject> & { id: string }
}

export interface ObjectDeleteMessage extends BaseMessage {
  type: MessageType.OBJECT_DELETE
  objectId: string
}

export interface InitialStateMessage extends BaseMessage {
  type: MessageType.INITIAL_STATE
  objects: CanvasObject[]
}

// Presence interfaces
export interface PresenceInfo {
  userId: string
  displayName: string
  x: number
  y: number
  lastSeen: number
}

export interface PresenceJoinMessage extends BaseMessage {
  type: MessageType.PRESENCE_JOIN
  presence: PresenceInfo
}

export interface PresenceCursorMessage extends BaseMessage {
  type: MessageType.PRESENCE_CURSOR
  userId: string
  displayName?: string
  x: number
  y: number
}

export interface PresenceLeaveMessage extends BaseMessage {
  type: MessageType.PRESENCE_LEAVE
  userId: string
}

export interface PresenceStateMessage extends BaseMessage {
  type: MessageType.INITIAL_STATE
  presence: PresenceInfo[]
}

export type WSMessage =
  | AuthMessage
  | AuthSuccessMessage
  | AuthErrorMessage
  | ErrorMessage
  | ObjectCreateMessage
  | ObjectUpdateMessage
  | ObjectDeleteMessage
  | InitialStateMessage
  | PresenceJoinMessage
  | PresenceCursorMessage
  | PresenceLeaveMessage

