// Shared TypeScript types for the frontend

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

export type ShapeType = 'rectangle' | 'circle' | 'line' | 'text' | 'triangle' | 'star' | 'polygon' | 'arrow' | 'ellipse' | 'roundedRect' | 'diamond' | 'pentagon';

export interface CanvasObject {
  id: string;
  type: ShapeType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;  // NEW: for Konva rotation
  color: string;     // NEW: renamed from 'fill' for consistency
  zIndex: number;    // NEW: for layer management

  // Text-specific fields
  text?: string;
  fontSize?: number;
  fontFamily?: string;

  // Line-specific fields
  points?: number[]; // [x1, y1, x2, y2]

  createdBy: string;
  createdAt: string; // ISO timestamp
  updatedAt?: string; // ISO timestamp (optional)
}

export interface Presence {
  userId: string;
  displayName: string;
  x: number;
  y: number;
  color: string;
  lastSeen: number;
}

export type WSMessage =
  | { type: 'initialState'; objects: CanvasObject[]; presence?: Presence[]; timestamp: string }
  | { type: 'object.create'; object: CanvasObject; timestamp: string }
  | { type: 'object.update'; object: Partial<CanvasObject> & { id: string }; timestamp: string }
  | { type: 'object.delete'; objectId: string; timestamp: string }
  | { type: 'auth.success'; userId: string; displayName?: string; timestamp: string }
  | { type: 'auth.error'; error: string; timestamp: string }
  | { type: 'error'; error: string; timestamp: string }
  | { type: 'presence.join'; presence: Presence; timestamp: string }
  | { type: 'presence.cursor'; userId: string; x: number; y: number; timestamp: string }
  | { type: 'presence.leave'; userId: string; timestamp: string };

