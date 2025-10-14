# CollabCanvas MVP - Architecture Diagram

This diagram illustrates the complete architecture including all core components, client-server communications, authentication flow, and technologies used in the MVP.

```mermaid
graph TB
  %% CollabCanvas MVP Architecture - Full Component View

  subgraph Client["Frontend Client (React + Vite)"]
    direction TB
    UI[Pages: Login / Canvas]
    COMP[Components: Header / Toolbar / CursorOverlay]
    LIBS[Libs: auth.ts / ws.ts / canvas.ts]
    TYPES[types.ts - Message Schemas]
    
    UI --> COMP
    UI --> LIBS
    COMP --> LIBS
    LIBS --> TYPES
  end

  subgraph Server["Backend Server (Node.js + TypeScript)"]
    direction TB
    HTTP[HTTP Server<br/>GET /health<br/>GET /canvas/state]
    WSS[WebSocket Server<br/>Connection Lifecycle<br/>Message Routing]
    HANDLERS[WS Handlers<br/>object.* / presence.*]
    AUTH_VERIFY[Auth: verifyToken.ts<br/>Validate Firebase ID Token]
    STATE_CANVAS[(In-Memory Canvas State<br/>create/update/delete/list)]
    STATE_PRESENCE[(In-Memory Presence State<br/>join/leave/cursor)]
    MSG[messageTypes.ts<br/>Protocol Definitions]
    
    HTTP --> STATE_CANVAS
    WSS --> AUTH_VERIFY
    WSS --> HANDLERS
    HANDLERS --> MSG
    HANDLERS --> STATE_CANVAS
    HANDLERS --> STATE_PRESENCE
  end

  subgraph Auth["Authentication Service"]
    FIREBASE[Firebase Auth<br/>Google OAuth Provider]
    ALT[Alternative: Okta/Auth0]
  end

  subgraph DB["Database (Optional for MVP)"]
    FIRESTORE[Firestore<br/>Optional Persistence]
    POSTGRES[PostgreSQL/Supabase<br/>Alternative]
  end

  subgraph Deploy["Deployment Infrastructure"]
    FE_HOST[Vercel/Netlify<br/>Static Hosting]
    BE_HOST[Render/Fly.io/AWS EC2<br/>WS + HTTP Server]
  end

  %% Client-Server Communications
  LIBS -->|WSS Connection + Auth Token| WSS
  LIBS -->|object.create/update/delete| WSS
  LIBS -->|presence.cursor| WSS
  WSS -->|Broadcast Updates| LIBS
  LIBS -->|GET /canvas/state| HTTP
  HTTP -->|Initial State JSON| LIBS

  %% Authentication Flow
  LIBS -->|OAuth Sign-In Request| FIREBASE
  FIREBASE -->|ID Token + displayName| LIBS
  WSS -->|Verify ID Token| AUTH_VERIFY
  AUTH_VERIFY -->|Validate Token| FIREBASE

  %% Optional Database Persistence
  STATE_CANVAS -.->|Optional Snapshot| FIRESTORE
  HTTP -.->|Optional Load State| FIRESTORE

  %% Deployment Connections
  FE_HOST -.->|Hosts| Client
  BE_HOST -.->|Hosts| Server

  %% Environment Configuration
  ENV[.env / Environment Variables<br/>VITE_WS_URL<br/>VITE_FIREBASE_API_KEY<br/>PORT / ALLOWED_ORIGINS]
  ENV -.->|Config| Client
  ENV -.->|Config| Server

  %% Message Flow Legend
  LEGEND[Message Protocol:<br/>- object.create/update/delete<br/>- presence.join/cursor/leave<br/>- initialState]
  MSG -.-> LEGEND
  TYPES -.-> LEGEND

  style Client fill:#e1f5ff
  style Server fill:#fff4e1
  style Auth fill:#e8f5e9
  style DB fill:#f3e5f5
  style Deploy fill:#fce4ec
  style LEGEND fill:#fff9c4
```

## Key Components

### Frontend (React + Vite)
- **Pages**: Login, Canvas
- **Components**: Header, Toolbar, CursorOverlay
- **Core Libraries**: 
  - `auth.ts`: Firebase Auth integration
  - `ws.ts`: WebSocket client with reconnection
  - `canvas.ts`: Canvas helpers and transformations

### Backend (Node.js)
- **HTTP API**: Health check and initial canvas state
- **WebSocket Server**: Real-time synchronization
- **State Management**: In-memory canvas objects and presence registry
- **Auth Verification**: Firebase ID token validation

### External Services
- **Authentication**: Firebase Auth (Google OAuth) or Okta/Auth0
- **Database**: Optional Firestore or PostgreSQL for persistence

### Deployment
- **Frontend**: Vercel or Netlify
- **Backend**: Render, Fly.io, or AWS EC2

## Message Protocol
- `object.create/update/delete`: Canvas object manipulation
- `presence.join/cursor/leave`: User presence tracking
- `initialState`: Canvas hydration on connection

