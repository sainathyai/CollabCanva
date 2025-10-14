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
export interface CanvasObject {
  id: string
  type: 'rectangle'
  x: number
  y: number
  width: number
  height: number
  fill: string
  createdBy: string
  createdAt: string
  updatedAt: string
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

export type WSMessage = 
  | AuthMessage 
  | AuthSuccessMessage 
  | AuthErrorMessage 
  | ErrorMessage
  | ObjectCreateMessage
  | ObjectUpdateMessage
  | ObjectDeleteMessage
  | InitialStateMessage

