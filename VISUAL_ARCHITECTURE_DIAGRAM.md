# 🎨 Visual Architecture Diagram Guide

This document provides a description for creating a visual architecture diagram using Excalidraw, draw.io, or similar tools.

---

## System Architecture Diagram

### Layout Structure

```
┌─────────────────────────────────────────────────────────────────────┐
│                           USERS / CLIENTS                            │
│                        (Web Browsers, Mobile)                        │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                ┌───────────────────┴───────────────────┐
                │                                       │
                ▼                                       ▼
┌─────────────────────────────┐         ┌─────────────────────────────┐
│    AWS ROUTE 53 (DNS)       │         │    AWS ROUTE 53 (DNS)       │
│  collabcanva.sainathyai.com │         │  backend.sainathyai.com     │
└─────────────────────────────┘         └─────────────────────────────┘
                │                                       │
                ▼                                       ▼
┌─────────────────────────────┐         ┌─────────────────────────────┐
│      AWS AMPLIFY CDN        │         │  APPLICATION LOAD BALANCER  │
│   (CloudFront + S3)         │         │         (HTTPS/WSS)         │
│                             │         │                             │
│   ┌─────────────────────┐   │         │   ┌─────────────────────┐   │
│   │   React SPA         │   │         │   │  HTTPS Listener     │   │
│   │   - Konva Canvas    │   │         │   │  WSS Upgrade        │   │
│   │   - WebSocket Client│   │         │   └─────────────────────┘   │
│   │   - Firebase Auth   │   │         └─────────────────────────────┘
│   └─────────────────────┘   │                         │
└─────────────────────────────┘                         │
                                                        ▼
                                        ┌─────────────────────────────┐
                                        │    ECS FARGATE CLUSTER      │
                                        │                             │
                                        │  ┌──────────────────────┐   │
                                        │  │  Task 1 (Container)  │   │
                                        │  │  - Node.js + Express │   │
                                        │  │  - WebSocket Server  │   │
                                        │  └──────────────────────┘   │
                                        │                             │
                                        │  ┌──────────────────────┐   │
                                        │  │  Task 2 (Container)  │   │
                                        │  │  - Node.js + Express │   │
                                        │  │  - WebSocket Server  │   │
                                        │  └──────────────────────┘   │
                                        └─────────────────────────────┘
                                                        │
                        ┌───────────────────────────────┴───────────────────────────────┐
                        │                                                               │
                        ▼                                                               ▼
        ┌─────────────────────────────┐                             ┌─────────────────────────────┐
        │     AWS DYNAMODB            │                             │  EXTERNAL SERVICES          │
        │                             │                             │                             │
        │  ┌──────────────────────┐   │                             │  ┌──────────────────────┐   │
        │  │  Projects Table      │   │                             │  │   Firebase Auth      │   │
        │  │  - id (PK)           │   │                             │  │   - Authentication   │   │
        │  │  - name              │   │                             │  └──────────────────────┘   │
        │  │  - collaborators     │   │                             │                             │
        │  └──────────────────────┘   │                             │  ┌──────────────────────┐   │
        │                             │                             │  │   OpenAI API         │   │
        │  ┌──────────────────────┐   │                             │  │   - GPT-4            │   │
        │  │  Objects Table       │   │                             │  │   - Function Calling │   │
        │  │  - projectId (PK)    │   │                             │  └──────────────────────┘   │
        │  │  - id (SK)           │   │                             │                             │
        │  │  - type, x, y, etc.  │   │                             └─────────────────────────────┘
        │  └──────────────────────┘   │
        └─────────────────────────────┘

                                        ┌─────────────────────────────┐
                                        │  SECURITY & SECRETS         │
                                        │                             │
                                        │  ┌──────────────────────┐   │
                                        │  │  Systems Manager     │   │
                                        │  │  Parameter Store     │   │
                                        │  │  - Firebase creds    │   │
                                        │  │  - OpenAI key        │   │
                                        │  └──────────────────────┘   │
                                        │                             │
                                        │  ┌──────────────────────┐   │
                                        │  │  IAM Roles           │   │
                                        │  │  - Task Execution    │   │
                                        │  │  - Task Role         │   │
                                        │  └──────────────────────┘   │
                                        │                             │
                                        │  ┌──────────────────────┐   │
                                        │  │  ACM Certificate     │   │
                                        │  │  - SSL/TLS           │   │
                                        │  └──────────────────────┘   │
                                        └─────────────────────────────┘
```

---

## Component Diagram

### Frontend Components

```
┌──────────────────────────────────────────────────────────────────┐
│                         REACT APPLICATION                         │
│                                                                   │
│  ┌────────────────┐    ┌────────────────┐    ┌────────────────┐  │
│  │  Login Page    │    │  Dashboard     │    │  Canvas Page   │  │
│  │                │    │                │    │                │  │
│  │  - Firebase    │    │  - Project Grid│    │  - KonvaCanvas │  │
│  │    Auth UI     │    │  - Create      │    │  - Toolbar     │  │
│  └────────────────┘    │  - Manage      │    │  - AI Agent    │  │
│                        └────────────────┘    └────────────────┘  │
│                                                       │           │
│  ┌──────────────────────────────────────────────────┴─────────┐  │
│  │              SHARED SERVICES & CONTEXTS                     │  │
│  │                                                              │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │  │
│  │  │ WebSocket   │  │ Project API │  │ Firebase    │        │  │
│  │  │ Client      │  │             │  │ Auth        │        │  │
│  │  └─────────────┘  └─────────────┘  └─────────────┘        │  │
│  │                                                              │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │  │
│  │  │ Project     │  │ Viewport    │  │ Color       │        │  │
│  │  │ Context     │  │ Calculator  │  │ Generator   │        │  │
│  │  └─────────────┘  └─────────────┘  └─────────────┘        │  │
│  └──────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
```

### Backend Components

```
┌──────────────────────────────────────────────────────────────────┐
│                       NODE.JS BACKEND                             │
│                                                                   │
│  ┌────────────────────────┐         ┌────────────────────────┐   │
│  │     HTTP SERVER        │         │   WEBSOCKET SERVER     │   │
│  │     (Express)          │         │   (ws library)         │   │
│  │                        │         │                        │   │
│  │  /health               │         │  Connection Handler    │   │
│  │  /metrics              │         │  Message Router        │   │
│  │  /api/projects/*       │         │  Auth Middleware       │   │
│  └────────────────────────┘         └────────────────────────┘   │
│             │                                    │                │
│             └──────────────┬─────────────────────┘                │
│                            │                                      │
│  ┌────────────────────────┴────────────────────────┐             │
│  │            BUSINESS LOGIC LAYER                 │             │
│  │                                                  │             │
│  │  ┌──────────────┐  ┌──────────────┐           │             │
│  │  │ Canvas State │  │ Presence     │           │             │
│  │  │ Manager      │  │ State        │           │             │
│  │  └──────────────┘  └──────────────┘           │             │
│  │                                                  │             │
│  │  ┌──────────────┐  ┌──────────────┐           │             │
│  │  │ Project      │  │ Object       │           │             │
│  │  │ Service      │  │ Service      │           │             │
│  │  └──────────────┘  └──────────────┘           │             │
│  │                                                  │             │
│  │  ┌──────────────┐  ┌──────────────┐           │             │
│  │  │ Dirty Flags  │  │ Auto-Save    │           │             │
│  │  │ Manager      │  │ Worker       │           │             │
│  │  └──────────────┘  └──────────────┘           │             │
│  └─────────────────────────────────────────────────┘             │
│                            │                                      │
│  ┌────────────────────────┴────────────────────────┐             │
│  │           DATABASE ACCESS LAYER                 │             │
│  │                                                  │             │
│  │  ┌──────────────────────────────────────────┐   │             │
│  │  │        DynamoDB Client                   │   │             │
│  │  │  - Projects Table Interface              │   │             │
│  │  │  - Objects Table Interface               │   │             │
│  │  └──────────────────────────────────────────┘   │             │
│  └─────────────────────────────────────────────────┘             │
└──────────────────────────────────────────────────────────────────┘
```

---

## Data Flow Diagram

### Real-Time Collaboration Flow

```
┌─────────┐
│ User 1  │
└────┬────┘
     │ 1. Create Object
     ▼
┌─────────────┐
│ Frontend 1  │
│ (Browser)   │
└────┬────────┘
     │ 2. Optimistic Update
     │ 3. Send WebSocket Message
     ▼
┌──────────────────┐
│  WebSocket       │
│  Server          │
│  ┌────────────┐  │
│  │ Verify Auth│  │
│  │ Check Role │  │
│  └────────────┘  │
└────┬─────────────┘
     │ 4. Add to State
     │ 5. Mark Dirty
     ▼
┌──────────────────┐
│  Canvas State    │
│  Manager         │
└────┬─────────────┘
     │ 6. Broadcast
     ├──────────────┐
     │              │
     ▼              ▼
┌─────────────┐  ┌─────────────┐
│ Frontend 1  │  │ Frontend 2  │
│ (confirm)   │  │ (sync)      │
└─────────────┘  └─────────────┘
                      │
                      ▼
                 ┌─────────┐
                 │ User 2  │
                 └─────────┘

     │ (After 5 seconds)
     ▼
┌──────────────────┐
│  Auto-Save       │
│  Worker          │
└────┬─────────────┘
     │ 7. Batch Save
     ▼
┌──────────────────┐
│  DynamoDB        │
│  - Projects      │
│  - Objects       │
└──────────────────┘
```

---

## Security Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      SECURITY LAYERS                             │
│                                                                  │
│  Layer 1: AUTHENTICATION                                        │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Firebase Authentication                                   │ │
│  │  - Email/Password                                          │ │
│  │  - ID Token Generation                                     │ │
│  │  - Token Refresh                                           │ │
│  └────────────────────────────────────────────────────────────┘ │
│                             │                                    │
│                             ▼                                    │
│  Layer 2: AUTHORIZATION                                         │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Backend Token Verification                                │ │
│  │  - Firebase Admin SDK                                      │ │
│  │  - Token Expiry Check                                      │ │
│  │  - User Identity Extraction                                │ │
│  └────────────────────────────────────────────────────────────┘ │
│                             │                                    │
│                             ▼                                    │
│  Layer 3: ROLE-BASED ACCESS CONTROL                            │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Project-Level Permissions                                 │ │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐                 │ │
│  │  │  Owner   │  │  Editor  │  │  Viewer  │                 │ │
│  │  │  Full    │  │  Canvas  │  │  Read    │                 │ │
│  │  │  Access  │  │  Only    │  │  Only    │                 │ │
│  │  └──────────┘  └──────────┘  └──────────┘                 │ │
│  └────────────────────────────────────────────────────────────┘ │
│                             │                                    │
│                             ▼                                    │
│  Layer 4: NETWORK SECURITY                                      │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  - HTTPS/WSS Encryption (TLS 1.2+)                         │ │
│  │  - CORS Configuration                                       │ │
│  │  - Security Groups (AWS)                                    │ │
│  │  - VPC Isolation                                            │ │
│  └────────────────────────────────────────────────────────────┘ │
│                             │                                    │
│                             ▼                                    │
│  Layer 5: DATA SECURITY                                         │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  - Secrets in AWS Parameter Store (encrypted)              │ │
│  │  - IAM Roles for Service Access                            │ │
│  │  - DynamoDB Encryption at Rest                             │ │
│  │  - No Sensitive Data in Logs                               │ │
│  └────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────┘
```

---

## Drawing Instructions for Excalidraw

### Colors to Use
- **Frontend**: Light blue (#61DAFB - React color)
- **Backend**: Green (#68A063 - Node.js color)
- **Database**: Dark blue (#4053D6 - DynamoDB blue)
- **External Services**:
  - Firebase: Yellow/Orange (#FFCA28)
  - OpenAI: Teal (#10A37F)
- **AWS Services**: Orange (#FF9900)
- **Security**: Red/Pink (#F44336)

### Shapes
- **Boxes** for components/services
- **Cylinders** for databases
- **Clouds** for external services
- **Arrows** for data flow (solid for synchronous, dashed for asynchronous)
- **Groups** for logical layers

### Text Annotations
- Add labels inside boxes
- Use arrows with text for explaining data flow
- Add numbers (1, 2, 3...) to show sequence
- Use icons where available (AWS service icons)

### Layout Tips
- Top-to-bottom flow (users → frontend → backend → database)
- Left-to-right for alternatives or parallel services
- Use consistent spacing
- Group related components
- Keep it clean and readable

---

## Export Options

Once created, export as:
- ✅ **PNG** (for README.md) - 1920x1080 or higher
- ✅ **SVG** (for scalability) - vector format
- ✅ **PDF** (for documentation) - high quality
- ✅ **Excalidraw JSON** (for future edits) - save source file

---

**This diagram should clearly show the complete system architecture at a glance!** 🎨

