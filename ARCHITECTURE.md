# 🏗️ CollabCanvas Architecture

## Table of Contents

- [System Overview](#system-overview)
- [Component Architecture](#component-architecture)
- [Data Flow](#data-flow)
- [WebSocket Protocol](#websocket-protocol)
- [Database Schema](#database-schema)
- [Security Architecture](#security-architecture)
- [Deployment Architecture](#deployment-architecture)
- [Performance Optimizations](#performance-optimizations)

---

## System Overview

CollabCanvas is built as a modern, scalable real-time collaborative application using microservices architecture.

### High-Level Architecture

```mermaid
graph TB
    subgraph "Client Layer"
        A[Web Browser]
        B[React SPA]
        C[Konva Canvas]
    end

    subgraph "CDN & Load Balancing"
        D[AWS Amplify CDN]
        E[Application Load Balancer]
    end

    subgraph "Application Layer"
        F[Frontend Assets]
        G[Backend API - Node.js]
        H[WebSocket Server]
    end

    subgraph "Business Logic"
        I[Canvas State Manager]
        J[Presence Manager]
        K[Project Service]
        L[Object Service]
    end

    subgraph "Data Layer"
        M[(DynamoDB - Projects)]
        N[(DynamoDB - Objects)]
    end

    subgraph "External Services"
        O[Firebase Auth]
        P[OpenAI API]
    end

    A --> B
    B --> C
    B --> D
    B --> E
    D --> F
    E --> G
    E --> H
    G --> K
    G --> L
    H --> I
    H --> J
    I --> N
    K --> M
    L --> N
    B --> O
    H --> P

    style A fill:#e1f5ff
    style B fill:#61dafb
    style G fill:#68a063
    style M fill:#4053d6
    style N fill:#4053d6
    style O fill:#ffca28
    style P fill:#10a37f
```

---

## Component Architecture

### Frontend Architecture

```mermaid
graph TB
    subgraph "Frontend Application"
        A[main.tsx - Entry Point]

        subgraph "Routing"
            B[Router.tsx]
            C[Login Page]
            D[Dashboard Page]
            E[Canvas Page]
        end

        subgraph "State Management"
            F[ProjectContext]
            G[Firebase Auth Context]
        end

        subgraph "Canvas Components"
            H[KonvaCanvas]
            I[Toolbar]
            J[TopToolbar]
            K[Header]
            L[AIAgent]
        end

        subgraph "Services"
            M[WebSocket Client]
            N[Project API]
            O[AI Service]
        end

        subgraph "Utilities"
            P[Viewport Calculator]
            Q[Color Generator]
        end
    end

    A --> B
    B --> C
    B --> D
    B --> E
    E --> F
    E --> G
    E --> H
    E --> I
    E --> J
    E --> K
    E --> L
    H --> M
    D --> N
    L --> O
    H --> P

    style A fill:#61dafb
    style B fill:#4db8ff
    style F fill:#ff9800
    style M fill:#10a37f
```

### Backend Architecture

```mermaid
graph TB
    subgraph "Backend Application"
        A[server.ts - Entry Point]

        subgraph "HTTP Layer"
            B[Express Server]
            C[Health Endpoints]
            D[Metrics Endpoints]
            E[Project Endpoints]
        end

        subgraph "WebSocket Layer"
            F[WebSocket Server]
            G[Connection Handler]
            H[Message Router]
        end

        subgraph "Business Logic"
            I[Canvas State Manager]
            J[Presence State Manager]
            K[Dirty Flags Manager]
            L[Project Service]
            M[Object Service]
        end

        subgraph "Workers"
            N[Auto-Save Worker]
        end

        subgraph "Utilities"
            O[Token Verifier]
            P[Logger]
            Q[DB Logger]
        end

        subgraph "Database"
            R[DynamoDB Client]
            S[Table Definitions]
        end
    end

    A --> B
    A --> F
    B --> C
    B --> D
    B --> E
    F --> G
    G --> H
    H --> I
    H --> J
    E --> L
    E --> M
    I --> K
    K --> N
    N --> R
    L --> R
    M --> R
    G --> O
    R --> S

    style A fill:#68a063
    style F fill:#10a37f
    style I fill:#ff9800
    style R fill:#4053d6
```

---

## Data Flow

### Object Creation Flow

```mermaid
sequenceDiagram
    actor U1 as User 1
    participant F1 as Frontend 1
    participant WS as WebSocket Server
    participant CS as Canvas State
    participant DB as DynamoDB
    participant F2 as Frontend 2
    actor U2 as User 2

    U1->>F1: Click "Add Rectangle"
    F1->>F1: Generate Object ID
    F1->>F1: Optimistic Update
    F1->>WS: Send object.create
    WS->>WS: Verify Auth Token
    WS->>WS: Check User Role
    WS->>CS: Add Object to State
    CS->>CS: Mark as Dirty
    CS-->>WS: Confirm
    WS->>DB: Queue for Save
    WS->>F1: Broadcast to User 1
    WS->>F2: Broadcast to User 2
    F2->>F2: Add Object to State
    F2->>U2: Render Object

    Note over DB,WS: Auto-save worker<br/>saves every 5s
    DB-->>WS: Save Complete
```

### AI Command Flow

```mermaid
sequenceDiagram
    actor U as User
    participant F as Frontend
    participant AI as AI Service
    participant OAI as OpenAI API
    participant WS as WebSocket
    participant DB as DynamoDB

    U->>F: Type "Create 5 red circles"
    F->>AI: Send Command
    AI->>OAI: GPT-4 Function Call
    OAI-->>AI: {function: "generate_objects",<br/>params: {count: 5, shape: "circle",<br/>color: "red"}}
    AI->>F: Return Function Call
    F->>F: Execute Function
    loop For each object
        F->>WS: Send object.create
        WS->>DB: Save Object
        WS-->>F: Broadcast
    end
    F->>U: Show Success Message
```

### Authentication Flow

```mermaid
sequenceDiagram
    actor U as User
    participant F as Frontend
    participant FB as Firebase Auth
    participant WS as WebSocket Server
    participant FBA as Firebase Admin
    participant CS as Canvas State

    U->>F: Login with Email
    F->>FB: Authenticate
    FB-->>F: ID Token
    F->>F: Store Token
    F->>WS: Connect WebSocket
    F->>WS: Send auth message<br/>{token, projectId}
    WS->>FBA: Verify Token
    FBA-->>WS: User Info
    WS->>WS: Store User Session
    WS->>CS: Get Initial State
    CS-->>WS: {objects, presence}
    WS-->>F: initialState message
    F->>U: Show Canvas
```

---

## WebSocket Protocol

### Message Types

```mermaid
graph LR
    subgraph "Client → Server"
        A[auth]
        B[object.create]
        C[object.update]
        D[object.delete]
        E[presence.cursor]
    end

    subgraph "Server → Client"
        F[auth.success]
        G[auth.error]
        H[initialState]
        I[object.create]
        J[object.update]
        K[object.delete]
        L[presence.join]
        M[presence.cursor]
        N[presence.leave]
        O[error]
    end

    style A fill:#10a37f
    style F fill:#4caf50
    style G fill:#f44336
```

### Message Format

```typescript
// Base Message
interface WSMessage {
  type: MessageType
  timestamp: string
  [key: string]: any
}

// Object Create
{
  type: 'object.create',
  object: {
    id: string,
    type: 'rectangle' | 'circle' | ...,
    x: number,
    y: number,
    width: number,
    height: number,
    color: string,
    rotation: number,
    zIndex: number,
    createdBy: string,
    createdAt: string
  },
  timestamp: string
}

// Object Update
{
  type: 'object.update',
  id: string,
  updates: {
    x?: number,
    y?: number,
    width?: number,
    height?: number,
    rotation?: number,
    color?: string
  },
  timestamp: string
}

// Presence Update
{
  type: 'presence.cursor',
  userId: string,
  userName: string,
  cursor: {
    x: number,
    y: number
  },
  timestamp: string
}
```

---

## Database Schema

### DynamoDB Tables

```mermaid
erDiagram
    PROJECTS ||--o{ OBJECTS : contains
    PROJECTS ||--o{ COLLABORATORS : has
    PROJECTS {
        string id PK
        string name
        string ownerId
        array collaborators
        string createdAt
        string updatedAt
    }

    OBJECTS {
        string id PK
        string projectId SK
        string type
        number x
        number y
        number width
        number height
        string color
        number rotation
        number zIndex
        string createdBy
        string createdAt
    }

    COLLABORATORS {
        string email
        string role
    }
```

### Table Definitions

#### Projects Table
```
Table: collabcanvas-projects
Partition Key: id (String)
Attributes:
  - name: String
  - ownerId: String
  - collaborators: List<Map>
    - email: String
    - role: String (owner|editor|viewer)
  - createdAt: String (ISO 8601)
  - updatedAt: String (ISO 8601)

Indexes:
  - GSI1: ownerId-createdAt-index
    - Partition Key: ownerId
    - Sort Key: createdAt
```

#### Objects Table
```
Table: collabcanvas-objects
Partition Key: projectId (String)
Sort Key: id (String)
Attributes:
  - type: String
  - x: Number
  - y: Number
  - width: Number
  - height: Number
  - color: String
  - rotation: Number
  - zIndex: Number
  - text?: String
  - fontSize?: Number
  - points?: List<Number>
  - createdBy: String
  - createdAt: String (ISO 8601)

Indexes:
  - GSI1: projectId-zIndex-index
    - Partition Key: projectId
    - Sort Key: zIndex
```

---

## Security Architecture

### Authentication & Authorization

```mermaid
graph TB
    subgraph "Client"
        A[User Login]
    end

    subgraph "Firebase Auth"
        B[Email/Password]
        C[ID Token Generation]
    end

    subgraph "Backend Validation"
        D[Token Verification]
        E[Firebase Admin SDK]
        F[User Role Check]
    end

    subgraph "Authorization"
        G{Check Role}
        H[Owner: Full Access]
        I[Editor: Object Operations]
        J[Viewer: Read Only]
    end

    A --> B
    B --> C
    C --> D
    D --> E
    E --> F
    F --> G
    G --> H
    G --> I
    G --> J

    style A fill:#e1f5ff
    style B fill:#ffca28
    style E fill:#ffca28
    style H fill:#4caf50
    style I fill:#ff9800
    style J fill:#9e9e9e
```

### Role-Based Access Control (RBAC)

| Operation | Owner | Editor | Viewer |
|-----------|-------|--------|--------|
| View Canvas | ✅ | ✅ | ✅ |
| Create Objects | ✅ | ✅ | ❌ |
| Edit Objects | ✅ | ✅ | ❌ |
| Delete Objects | ✅ | ✅ | ❌ |
| Edit Project Details | ✅ | ❌ | ❌ |
| Manage Collaborators | ✅ | ❌ | ❌ |
| Delete Project | ✅ | ❌ | ❌ |

---

## Deployment Architecture

### AWS Infrastructure

```mermaid
graph TB
    subgraph "Internet"
        A[Users]
    end

    subgraph "Route 53"
        B[collabcanva.sainathyai.com]
        C[backend.sainathyai.com]
    end

    subgraph "AWS Amplify"
        D[CDN / CloudFront]
        E[S3 - Static Assets]
    end

    subgraph "Application Load Balancer"
        F[HTTPS Listener :443]
        G[WSS Upgrade]
    end

    subgraph "ECS Fargate Cluster"
        H[Service: collabcanvas-service]
        I[Task 1]
        J[Task 2]
        K[Task N]
    end

    subgraph "Data Storage"
        L[(DynamoDB<br/>Projects)]
        M[(DynamoDB<br/>Objects)]
    end

    subgraph "Security"
        N[ACM Certificate]
        O[Systems Manager<br/>Parameter Store]
        P[IAM Roles]
    end

    A --> B
    A --> C
    B --> D
    D --> E
    C --> F
    F --> G
    G --> H
    H --> I
    H --> J
    H --> K
    I --> L
    I --> M
    J --> L
    J --> M
    K --> L
    K --> M
    F -.uses.-> N
    I -.reads.-> O
    J -.reads.-> O
    K -.reads.-> O
    H -.uses.-> P

    style A fill:#e1f5ff
    style D fill:#ff9800
    style F fill:#4caf50
    style H fill:#2196f3
    style L fill:#4053d6
    style M fill:#4053d6
```

### Container Architecture

```mermaid
graph TB
    subgraph "ECS Task Definition"
        A[Container: collabcanvas-backend]

        subgraph "Environment Variables"
            B[PORT=8080]
            C[AWS_REGION=us-east-1]
            D[ALLOWED_ORIGINS]
        end

        subgraph "Secrets from SSM"
            E[FIREBASE_PROJECT_ID]
            F[FIREBASE_CLIENT_EMAIL]
            G[FIREBASE_PRIVATE_KEY]
            H[OPENAI_API_KEY]
        end

        subgraph "Resources"
            I[CPU: 1 vCPU]
            J[Memory: 2 GB]
        end

        subgraph "Health Check"
            K[HTTP GET /health]
            L[Interval: 30s]
            M[Timeout: 5s]
        end
    end

    A --> B
    A --> C
    A --> D
    A --> E
    A --> F
    A --> G
    A --> H
    A --> I
    A --> J
    A --> K

    style A fill:#2196f3
    style E fill:#ff9800
    style K fill:#4caf50
```

---

## Performance Optimizations

### Frontend Optimizations

```mermaid
graph TB
    subgraph "Bundle Optimization"
        A[Code Splitting]
        B[Lazy Loading Routes]
        C[Vendor Chunking]
        D[Tree Shaking]
        E[Minification]
    end

    subgraph "Runtime Optimization"
        F[Object Virtualization]
        G[Viewport Culling]
        H[Component Memoization]
        I[Debounced Updates]
        J[Adaptive Grid]
    end

    subgraph "Caching Strategy"
        K[Service Worker]
        L[Asset Caching]
        M[API Response Cache]
    end

    subgraph "Results"
        N[Bundle: 805KB → 189KB]
        O[Load: 3s → 0.8s]
        P[FPS: 60 sustained]
    end

    A --> N
    B --> N
    C --> N
    D --> N
    E --> N
    F --> O
    G --> O
    H --> P
    I --> P
    J --> P

    style N fill:#4caf50
    style O fill:#4caf50
    style P fill:#4caf50
```

### Object Virtualization

```mermaid
graph LR
    subgraph "All Objects (10,000)"
        A[Objects 1-100]
        B[Objects 101-500]
        C[Objects 501-1000]
        D[Objects 1001-5000]
        E[Objects 5001-10000]
    end

    subgraph "Viewport Calculation"
        F[Calculate Visible Area]
        G[Filter Objects]
        H[Render Only Visible]
    end

    subgraph "Rendered (100)"
        I[Visible Objects]
    end

    A --> F
    B --> F
    C --> F
    D --> F
    E --> F
    F --> G
    G --> H
    H --> I

    style I fill:#4caf50
```

### Auto-Save Strategy

```mermaid
sequenceDiagram
    participant U as User Action
    participant CS as Canvas State
    participant DF as Dirty Flags
    participant AW as Auto-Save Worker
    participant DB as DynamoDB

    U->>CS: Modify Object
    CS->>DF: Mark as Dirty

    Note over AW: Every 5 seconds
    AW->>DF: Check Dirty Flags
    DF-->>AW: List of Modified Objects
    AW->>DB: Batch Write
    DB-->>AW: Confirm
    AW->>DF: Clear Dirty Flags

    Note over CS,DB: Only saves what changed<br/>Reduces DB writes by 90%
```

---

## Technology Decisions

### Why WebSocket over HTTP Polling?

- **Latency**: <50ms vs 500ms+
- **Bandwidth**: 90% reduction
- **Real-time**: True real-time updates
- **Scalability**: Better connection management

### Why DynamoDB over PostgreSQL?

- **Scalability**: Auto-scaling with traffic
- **Performance**: Single-digit ms latency
- **Cost**: Pay-per-use model
- **Serverless**: No infrastructure management

### Why Konva.js over Canvas API?

- **Performance**: Hardware-accelerated
- **Features**: Built-in transforms, events
- **Developer Experience**: React integration
- **Battle-tested**: Used by Figma, Canva

### Why React over Vue/Svelte?

- **Ecosystem**: Largest component library
- **Team Expertise**: Industry standard
- **TypeScript**: First-class support
- **Performance**: Virtual DOM optimization

---

## Monitoring & Observability

### Metrics Collected

- **WebSocket**: Connection count, message rate
- **Canvas**: Object count, render FPS
- **API**: Request latency, error rate
- **DynamoDB**: Read/write capacity units

### Health Checks

```
GET /health
Response: {
  status: "healthy",
  uptime: 12345,
  websocket: {
    connections: 42
  }
}
```

---

## Future Architecture Considerations

1. **Redis for Presence**: Move presence to Redis for better scalability
2. **S3 for Assets**: Store canvas thumbnails in S3
3. **CloudFront**: Add CloudFront for global CDN
4. **Aurora Serverless**: Consider for complex queries
5. **Lambda@Edge**: For edge computing needs
6. **ElastiCache**: For caching frequent queries

---

**Architecture designed for scale, performance, and developer experience** 🚀

