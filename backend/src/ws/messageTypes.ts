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

export type WSMessage = AuthMessage | AuthSuccessMessage | AuthErrorMessage | ErrorMessage

