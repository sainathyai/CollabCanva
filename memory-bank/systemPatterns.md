# System Patterns: CollabCanvas

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                      User Browsers                       │
│  (Chrome, Firefox, Safari - Desktop focused)            │
└────────────┬────────────────────────────┬───────────────┘
             │                            │
             │ HTTPS                      │ WSS (Secure WebSocket)
             ▼                            ▼
┌────────────────────────┐   ┌──────────────────────────┐
│   Vercel (Frontend)    │   │   Render (Backend)       │
│   - React App          │   │   - Node.js Server       │
│   - Static Assets      │◄──┤   - WebSocket Server     │
│   - Client-side Auth   │   │   - State Management     │
└────────────┬───────────┘   └──────────┬───────────────┘
             │                           │
             │ Token Verification        │
             ▼                           ▼
┌────────────────────────┐   ┌──────────────────────────┐
│  Firebase Auth         │   │   In-Memory State        │
│  - Google OAuth        │   │   - Canvas Objects       │
│  - Token Generation    │   │   - User Presence        │
└────────────────────────┘   └──────────────────────────┘
```

## Key Technical Decisions

### 1. WebSocket Over HTTP Polling
**Decision**: Use WebSocket for all real-time communication  
**Rationale**: 
- Bidirectional communication required for cursors
- Lower latency than polling
- Reduced server load
- Single persistent connection

**Alternative Considered**: Server-Sent Events (SSE)
- Rejected: Unidirectional, would need separate HTTP for client→server

### 2. In-Memory State (No Database)
**Decision**: Store canvas state and presence in backend memory  
**Rationale**:
- Simplifies MVP scope
- Reduces latency (no DB round trips)
- Free tier hosting friendly
- Acceptable data loss for learning project

**Trade-off**: State lost on server restart, but acceptable for MVP

### 3. Firebase Auth (Not Custom Auth)
**Decision**: Use Firebase Authentication with Google OAuth  
**Rationale**:
- No need to build auth system
- Secure token-based verification
- Free tier generous
- Easy Google OAuth integration

**Implementation**: Frontend gets token → sends to backend → backend verifies with Firebase Admin SDK

### 4. Client-Side Rendering (Not SSR)
**Decision**: Vite SPA with client-side routing  
**Rationale**:
- Real-time app doesn't benefit from SSR
- Simpler deployment
- Faster development

### 5. Monorepo Structure (Separate Frontend/Backend)
**Decision**: Two separate projects in same repo  
**Rationale**:
- Different deployment targets (Vercel vs Render)
- Different TypeScript configs
- Clear separation of concerns

## Design Patterns

### Frontend Patterns

#### 1. WebSocket Client Singleton
```typescript
// frontend/src/lib/ws.ts
class WebSocketClient {
  private ws: WebSocket | null = null
  private messageHandlers: Set<MessageHandler> = new Set()
  
  // Singleton pattern for global WebSocket connection
}

export const wsClient = new WebSocketClient()
```
**Why**: Single WebSocket connection per client, shared across components

#### 2. React Context for Auth State
```typescript
// Implicit in Router.tsx with ProtectedRoute
- Auth state stored in firebase.auth().currentUser
- Protected routes check auth before rendering
```

#### 3. Canvas State Management
```typescript
// Canvas.tsx - Local state with WebSocket sync
const [objects, setObjects] = useState<CanvasObject[]>([])
const [presences, setPresences] = useState<Map<string, Presence>>(new Map())

// State updated from WebSocket messages
// Changes published to WebSocket
```
**Pattern**: Optimistic UI updates with eventual consistency

### Backend Patterns

#### 1. Event-Driven WebSocket Handler
```typescript
// ws/handlers.ts
export function handleMessage(ws: WebSocket, data: string) {
  const message = JSON.parse(data)
  
  switch (message.type) {
    case 'auth': return handleAuth(ws, message)
    case 'object.create': return handleObjectCreate(ws, message)
    // ... more handlers
  }
}
```
**Pattern**: Message router with type-based dispatch

#### 2. Broadcast Pattern
```typescript
function broadcastToOthers(sender: WebSocket, message: object) {
  connectedClients.forEach((claims, client) => {
    if (client !== sender && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message))
    }
  })
}
```
**Why**: Efficiently send updates to all clients except sender

#### 3. State as Single Source of Truth
```typescript
// state/canvasState.ts
const canvasObjects: CanvasObject[] = []

export const canvasState = {
  getAll: () => canvasObjects,
  add: (obj) => canvasObjects.push(obj),
  update: (id, changes) => { /* ... */ },
  delete: (id) => { /* ... */ }
}
```
**Pattern**: Centralized state management with accessor functions

#### 4. Claims-Based Authentication
```typescript
// connectedClients: Map<WebSocket, UserClaims>
// Each WebSocket stores authenticated user info
```
**Why**: O(1) lookup to verify user making requests

## Message Protocol

### Message Types
```typescript
enum MessageType {
  // Auth Flow
  AUTH = 'auth',                    // Client → Server
  AUTH_SUCCESS = 'auth.success',    // Server → Client
  AUTH_ERROR = 'auth.error',        // Server → Client
  
  // Canvas Operations
  OBJECT_CREATE = 'object.create',  // Client → Server → Broadcast
  OBJECT_UPDATE = 'object.update',  // Client → Server → Broadcast
  OBJECT_DELETE = 'object.delete',  // Client → Server → Broadcast
  INITIAL_STATE = 'initialState',   // Server → Client (on connect)
  
  // Presence
  PRESENCE_JOIN = 'presence.join',      // Server → Broadcast (user joins)
  PRESENCE_CURSOR = 'presence.cursor',  // Client → Server → Broadcast
  PRESENCE_LEAVE = 'presence.leave',    // Server → Broadcast (user leaves)
  
  // Errors
  ERROR = 'error'                   // Server → Client
}
```

### Message Flow Example: Creating Object

```
1. User A clicks "Add Rectangle" in browser
   │
   ├─► Frontend creates object locally (optimistic update)
   │   setObjects([...objects, newObject])
   │
   ├─► Frontend sends WebSocket message:
   │   { type: 'object.create', object: {...} }
   │
   ▼
2. Backend receives message
   │
   ├─► Validates user is authenticated
   │
   ├─► Adds to canvasState
   │
   ├─► Broadcasts to all OTHER clients:
   │   { type: 'object.create', object: {...}, timestamp: '...' }
   │
   ▼
3. User B's browser receives broadcast
   │
   └─► Updates local state: setObjects([...objects, receivedObject])
```

## Component Relationships

### Frontend Components
```
App.tsx
└── Router.tsx
    ├── Login.tsx (public route)
    └── Canvas.tsx (protected route)
        ├── Header.tsx (display name, logout)
        ├── Toolbar.tsx (Add Rectangle button)
        └── CursorOverlay.tsx (other users' cursors)
```

### Backend Components
```
server.ts (entry point)
├── ws/index.ts (WebSocket server setup)
│   └── ws/handlers.ts (message routing)
│       ├── auth/verifyToken.ts (Firebase verification)
│       ├── state/canvasState.ts (object storage)
│       └── state/presenceState.ts (user presence)
│
└── http/health.ts (health check endpoint)
```

## State Synchronization Strategy

### Eventual Consistency Model
- **No Conflict Resolution**: Last-write-wins for object updates
- **Acceptable for MVP**: Low conflict probability with ~2-10 users
- **Optimistic Updates**: Client updates immediately, backend confirms
- **Initial State Sync**: New clients receive full state on connection

### Race Condition Handling
- **Object Creation**: UUID ensures unique IDs, no collisions
- **Object Updates**: Timestamp included but not used for resolution (accepted trade-off)
- **Object Deletion**: ID-based, works correctly even with race conditions

## Error Handling Patterns

### Frontend Resilience
```typescript
// Automatic reconnection
reconnect(attempt: number) {
  if (attempt <= MAX_RETRIES) {
    setTimeout(() => this.connect(), delay)
  }
}

// Graceful degradation
if (!isConnected) {
  // Show "Reconnecting..." message
  // Queue actions for when reconnected
}
```

### Backend Resilience
```typescript
// Graceful error responses
ws.on('error', (error: Error) => {
  logger.error('WebSocket error', { error: error.message })
})

// Clean disconnect handling
ws.on('close', () => {
  connectedClients.delete(ws)
  broadcastPresenceLeave(userId)
})
```

## Performance Optimizations

### 1. Cursor Throttling
```typescript
// Frontend: Limit cursor updates to 60/sec
const CURSOR_THROTTLE_MS = 16 // ~60 FPS

if (now - lastCursorUpdate.current >= CURSOR_THROTTLE_MS) {
  wsClient.send({ type: 'presence.cursor', x, y })
}
```

### 2. Canvas Rendering
```typescript
// Only redraw when state changes
useEffect(() => {
  drawCanvas()
}, [objects, selectedObjectId])
```

### 3. Presence Cleanup
```typescript
// Remove stale presence (users who disconnected without cleanup)
setInterval(() => {
  const now = Date.now()
  presenceState.forEach((presence, userId) => {
    if (now - presence.lastSeen > PRESENCE_TIMEOUT) {
      presenceState.delete(userId)
    }
  })
}, 30000) // Every 30 seconds
```

## Security Patterns

### 1. Token Verification
```typescript
// Every WebSocket connection must authenticate
if (!connectedClients.has(ws)) {
  return sendError(ws, 'Not authenticated')
}
```

### 2. CORS Configuration
```typescript
// Backend only accepts connections from frontend domain
const allowedOrigins = env.ALLOWED_ORIGINS.split(',')
```

### 3. Firebase Admin SDK
```typescript
// Verify tokens server-side, never trust client
const decodedToken = await admin.auth().verifyIdToken(token)
```

## Deployment Patterns

### Frontend (Vercel)
- **Build**: `npm run build` → static files in `dist/`
- **Routing**: SPA routing via `vercel.json` rewrites
- **Auto-Deploy**: Push to `main` → automatic deployment
- **Environment**: Variables set in Vercel dashboard

### Backend (Render)
- **Build**: `npm ci --include=dev && npm run build`
- **Start**: `NODE_ENV=production node dist/server.js`
- **Health Check**: `/health` endpoint for Render monitoring
- **Auto-Deploy**: Push to `main` → automatic deployment
- **Cold Start**: Free tier sleeps after 15 min idle

## Known Architectural Limitations

### 1. Single Server Instance
- **Issue**: Render free tier = 1 instance, WebSocket connections limited
- **Impact**: ~100-500 concurrent connections max
- **Solution (if needed)**: Upgrade to paid tier or add Redis pub/sub for multi-instance

### 2. In-Memory State
- **Issue**: State lost on server restart/crash
- **Impact**: All objects disappear when server restarts
- **Solution (if needed)**: Add Firestore or PostgreSQL persistence

### 3. No Conflict Resolution
- **Issue**: Simultaneous edits = last-write-wins
- **Impact**: Rare object update conflicts
- **Solution (if needed)**: Implement Operational Transformation or CRDT

### 4. No Authentication on Health Check
- **Issue**: `/health` endpoint is public
- **Impact**: Minimal - only returns "OK" status
- **Acceptable**: Standard practice for health checks

