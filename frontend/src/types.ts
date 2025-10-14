// Shared TypeScript types for the frontend

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

export interface CanvasObject {
  id: string;
  type: 'rectangle';
  x: number;
  y: number;
  width: number;
  height: number;
  fill: string;
  createdBy: string;
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
}

export interface Presence {
  userId: string;
  displayName: string;
  cursor: {
    x: number;
    y: number;
  };
  color: string;
  lastSeen: number;
}

export type WSMessage = 
  | { type: 'initialState'; objects: CanvasObject[]; timestamp: string }
  | { type: 'object.create'; object: CanvasObject; timestamp: string }
  | { type: 'object.update'; object: Partial<CanvasObject> & { id: string }; timestamp: string }
  | { type: 'object.delete'; objectId: string; timestamp: string }
  | { type: 'auth.success'; userId: string; displayName?: string; timestamp: string }
  | { type: 'auth.error'; error: string; timestamp: string }
  | { type: 'error'; error: string; timestamp: string }
  | { type: 'presence.join'; presence: Presence }
  | { type: 'presence.cursor'; userId: string; x: number; y: number }
  | { type: 'presence.leave'; userId: string };

