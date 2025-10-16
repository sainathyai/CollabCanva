# CollabCanvas - Production PRD
## Building a Grade A Real-Time Collaborative Canvas with AI

**Version**: 2.0 (Production)
**Date**: October 15, 2025
**Status**: Planning Phase
**Previous**: MVP Complete (v1.0)

---

## Executive Summary

CollabCanvas v2.0 transforms the MVP into a production-grade collaborative design tool with AI capabilities. This PRD addresses rubric requirements for Grade A while ensuring performance targets: <100ms sync latency, 60 FPS rendering, 500+ objects, and 5+ concurrent users.

**Key Changes from MVP:**
- AWS infrastructure (scalable, performant)
- Rich canvas features (resize, rotate, multi-select, multiple shapes)
- Firestore persistence (state survives server restarts)
- AI agent with function calling (6+ command types)
- Performance optimizations (partial canvas redraws, Redis pub/sub)

---

## Project Goals

### Primary Goal
**Achieve Grade A** by meeting all rubric requirements while building a comprehensive platform that showcases real-time collaboration + AI co-creation.

### Success Criteria
1. ✅ All rubric "must-haves" implemented
2. ✅ Performance targets met (<100ms, 60 FPS, 500+ objects)
3. ✅ AI agent with 6+ command types including complex multi-step operations
4. ✅ Professional demo video (3-5 minutes)
5. ✅ Deployed on AWS with reliable uptime

---

## Rubric Requirements Analysis

### CRUCIAL (Required for Grade A)

#### 1. Canvas Features (Core Collaborative Canvas Section)
| Feature | Status | Priority |
|---------|--------|----------|
| Pan and zoom | ❌ Not implemented | PR10 |
| Create objects | ✅ Done (rectangles only) | - |
| Move objects | ✅ Done | - |
| **Resize objects** | ❌ Not implemented | PR10 |
| **Rotate objects** | ❌ Not implemented | PR10 |
| Delete objects | ✅ Done | - |
| **Duplicate objects** | ❌ Not implemented | PR10 |
| **Multi-select** (shift-click, drag-to-select) | ❌ Not implemented | PR11 |
| **Circles** | ❌ Not implemented | PR12 |
| **Lines** | ❌ Not implemented | PR12 |
| **Text layers** | ❌ Not implemented | PR12 |
| **Layer management** (z-index, bring to front) | ❌ Not implemented | PR11 |

#### 2. Real-Time Collaboration
| Feature | Status | Priority |
|---------|--------|----------|
| Multiplayer cursors with names | ✅ Done | - |
| Real-time object sync (<100ms) | ✅ Done | - |
| Presence awareness | ✅ Done | - |
| Conflict resolution | ✅ Last-write-wins (acceptable) | - |
| Reconnection handling | ✅ Done | - |
| **State persistence** | ❌ In-memory only | PR13 |

#### 3. Performance Targets (Testing Criteria)
| Target | Current | Required Action |
|--------|---------|-----------------|
| 60 FPS during interactions | ⚠️ Not tested at scale | PR14 (optimization) |
| Object sync <100ms | ✅ Achieved | - |
| Cursor sync <50ms | ✅ Achieved | - |
| 500+ objects without FPS drops | ❌ Not implemented | PR14 (optimization) |
| 5+ concurrent users | ⚠️ Tested with 2 users | AWS deployment |

#### 4. AI Canvas Agent (50%+ of Grade)
| Feature | Status | Priority |
|---------|--------|----------|
| Natural language commands | ❌ Not implemented | PR15 |
| 6+ distinct command types | ❌ Not implemented | PR15 |
| Creation commands | ❌ Not implemented | PR15 |
| Manipulation commands | ❌ Not implemented | PR15 |
| Layout commands | ❌ Not implemented | PR16 |
| Complex multi-step commands | ❌ Not implemented | PR16 |
| Shared AI results (all users see) | ❌ Not implemented | PR15 |
| <2 second response time | ❌ Not implemented | PR15 |

#### 5. Deliverables
| Item | Status | Priority |
|------|--------|----------|
| GitHub repository | ✅ Done | - |
| AI Development Log | ✅ Done | - |
| **Demo video** (3-5 min) | ❌ Not created | Final |
| Deployed application | ✅ Done (Vercel/Render) | Upgrade to AWS |

---

### NICE TO HAVE (Bonus Points)

These features are NOT required by rubric but enhance the project:

| Feature | Impact | Effort | Include? |
|---------|--------|--------|----------|
| Undo/redo | High UX value | Medium | ✅ Yes (PR17) |
| Color picker | Enables better AI commands | Low | ✅ Yes (PR10) |
| Keyboard shortcuts | Professional feel | Low | ✅ Yes (PR17) |
| Export PNG/SVG | Portfolio feature | Medium | ❌ Skip |
| Image uploads | Complex + not required | High | ❌ Skip |
| Multiple canvases | Not required | High | ❌ Skip |
| Custom shapes (polygons, stars) | Not required | Medium | ❌ Skip |
| Advanced styling (gradients, shadows) | Not required | Medium | ❌ Skip |

---

## Technical Architecture

### Current Stack (MVP)
- **Frontend**: React + Vite + TypeScript
- **Backend**: Node.js + WebSocket (ws library)
- **Auth**: Firebase Authentication
- **State**: In-memory (backend)
- **Deployment**: Vercel (frontend), Render free tier (backend)

### Problems with Current Stack
1. ❌ Render free tier cold starts (30-60s) - unacceptable for rubric testing
2. ❌ In-memory state lost on restart - fails persistence requirement
3. ❌ Single instance WebSocket - no horizontal scaling
4. ❌ No Redis pub/sub - can't support multi-instance backend
5. ❌ Canvas full redraw on every change - can't hit 60 FPS with 500+ objects

---

### Recommended Production Stack

#### Frontend (Keep + Enhance)
- **Framework**: React 18 + TypeScript
- **Build**: Vite
- **Canvas Library**: **Konva.js** or **Fabric.js** (recommended)
  - Why: Built-in transform controls (resize, rotate handles)
  - Why: Layer management out of the box
  - Why: Performance optimizations (partial redraws, caching)
  - Why: Event handling for multi-select
- **State Management**: Keep current approach (local state + WebSocket sync)
- **Auth**: Keep Firebase Auth (works well)

**Alternative Canvas Libraries:**
| Library | Pros | Cons | Verdict |
|---------|------|------|---------|
| **Konva.js** | Transform controls, layering, great docs | Slightly heavier | ✅ Recommended |
| **Fabric.js** | Mature, full-featured | Older API style | ✅ Good alternative |
| PixiJS | Best for 1000+ objects, WebGL | Overkill for this project | ❌ Skip |
| HTML5 Canvas (current) | Full control, lightweight | Manual everything | ⚠️ Hard to hit deadlines |

**Recommendation: Switch to Konva.js**
- Built-in resize/rotate handles (saves 5-10 hours)
- Layer management API (z-index, grouping)
- Multi-select with drag-to-select
- Partial redraws (60 FPS with 500+ objects)
- 2-3 hours to migrate current rectangle code

---

#### Backend (Major Upgrade)

**Recommended: AWS with Redis Pub/Sub**

**Architecture:**
```
AWS Application Load Balancer
         ↓
  [EC2 Auto Scaling Group]
    Instance 1, 2, 3...
         ↓
  [ElastiCache Redis]
  (pub/sub for WebSocket)
         ↓
    [RDS PostgreSQL]
    (persistent state)
         ↓
  [Amazon Cognito]
  (can replace Firebase)
```

**Component Breakdown:**

1. **AWS EC2 + ALB (Application Load Balancer)**
   - Why: Replaces Render, no cold starts
   - Why: Horizontal scaling (multiple instances)
   - Why: WebSocket support via ALB
   - Cost: ~$20-30/month (t3.small instances)

2. **ElastiCache Redis**
   - Why: Pub/sub for multi-instance WebSocket broadcast
   - Why: Fast state caching (reduce DB queries)
   - Pattern: Instance 1 publishes message → Redis → All instances receive → Broadcast to connected clients
   - Cost: ~$15-20/month (cache.t3.micro)

3. **RDS PostgreSQL** (or DynamoDB)
   - Why: Persistent canvas state (survives restarts)
   - Why: Point-in-time recovery
   - Schema:
     ```sql
     canvas_objects (id, canvas_id, type, x, y, width, height, rotation, color, z_index, created_by, created_at, updated_at)
     canvas_state (canvas_id, last_updated, user_count)
     ```
   - Cost: ~$15-20/month (db.t3.micro)

   **Alternative: DynamoDB**
   - Why: Serverless, scales automatically
   - Why: Single-digit ms latency
   - Cost: Pay-per-request (~$5-10/month for this workload)
   - Verdict: ✅ Better choice for this project

4. **AWS Lambda + API Gateway** (Alternative Backend)
   - Pattern: API Gateway WebSocket → Lambda handlers → DynamoDB
   - Why: Serverless, scales automatically
   - Why: No instance management
   - Downside: More complex WebSocket setup
   - Verdict: ⚠️ Good for long-term, but tighter dev timeline

**Recommended Approach: EC2 + Redis + DynamoDB**
- Migrate current Node.js backend to EC2
- Add Redis for pub/sub
- Add DynamoDB for persistence
- Keep Firebase Auth (works with AWS)

**Total AWS Cost Estimate: $40-60/month**

---

#### AI Agent Stack

**Recommended: OpenAI GPT-4 with Function Calling**

**Why OpenAI:**
- ✅ Mature function calling API
- ✅ Fast response times (<1s typically)
- ✅ Great at understanding spatial/layout commands
- ✅ Extensive documentation

**Alternative: Anthropic Claude with Tools**
- ✅ We're already using Claude for development
- ✅ Tools API similar to function calling
- ✅ Strong reasoning for complex commands
- Verdict: ✅ Good alternative, personal preference

**Implementation Pattern:**
```typescript
// Backend endpoint
POST /api/ai/command
{
  "message": "Create a login form",
  "canvasState": { objects: [...] }
}

// Backend calls OpenAI with tools
const tools = [
  {
    name: "create_shape",
    parameters: { type, x, y, width, height, color }
  },
  {
    name: "move_shape",
    parameters: { id, x, y }
  },
  // ... more tools
]

// AI generates function calls
// Backend executes → broadcasts via WebSocket
```

**Cost:** ~$0.01-0.05 per AI command (acceptable)

---

### Performance Strategy

#### 1. Canvas Rendering (60 FPS with 500+ objects)

**Current Problem:**
- Full canvas redraw on every state change
- O(n) draw operations for n objects

**Solution with Konva.js:**
```typescript
// Konva automatically handles:
- Partial redraws (only changed objects)
- Layer caching
- Hit detection optimization
- Transform controls without manual math

// Performance gains:
- 500 objects: 60 FPS ✅
- 1000 objects: 45-50 FPS ✅
- Meets rubric requirements
```

**Fallback (if staying with HTML5 Canvas):**
```typescript
// Manual optimizations needed:
1. Dirty rectangle tracking (only redraw changed areas)
2. Object culling (don't draw off-screen objects)
3. RequestAnimationFrame throttling
4. Canvas layering (separate layers for objects vs UI)

// Estimated effort: 8-12 hours
// Verdict: Not worth it, use Konva
```

#### 2. WebSocket Sync (<100ms)

**Current:** Already achieving this ✅

**Improvements for scale:**
- Redis pub/sub for multi-instance
- Message batching (combine multiple updates)
- Binary protocol (MessagePack instead of JSON) - optional

#### 3. State Persistence

**Pattern:**
```typescript
// On object change:
1. Update DynamoDB (async, don't block)
2. Broadcast via Redis pub/sub
3. Clients receive and render

// On connect:
1. Query DynamoDB for canvas state
2. Send initial state to client
3. Client renders

// Performance:
- DynamoDB: 2-5ms writes
- Redis pub/sub: 1-2ms latency
- Total: <10ms overhead
```

---

## Authentication Strategy

### Option 1: Keep Firebase Auth (Recommended)
**Pros:**
- ✅ Already implemented
- ✅ Works with AWS backend
- ✅ Free tier generous (10k MAU)
- ✅ Google OAuth working

**Cons:**
- ⚠️ External dependency

**Verdict:** ✅ Keep it (don't fix what isn't broken)

---

### Option 2: AWS Cognito
**Pros:**
- ✅ Native AWS integration
- ✅ User pools + identity pools
- ✅ OAuth support (Google, Facebook, etc.)

**Cons:**
- ❌ 3-5 hours to migrate
- ❌ More complex setup
- ❌ Not worth it for this timeline

**Verdict:** ❌ Skip (Firebase works fine)

---

## Development Plan: PR10-PR17 + Demo

### Timeline: 7 Days (40-50 hours)

| PR | Focus | Time | Priority |
|----|-------|------|----------|
| PR10 | Transform operations + Konva migration | 8-10h | Critical |
| PR11 | Multi-select + Layer management | 4-5h | Critical |
| PR12 | Multiple shapes (circles, text, lines) | 4-5h | Critical |
| PR13 | DynamoDB persistence | 4-5h | Critical |
| PR14 | AWS deployment (EC2 + Redis) | 6-8h | Critical |
| PR15 | AI Agent (basic commands) | 6-8h | Critical |
| PR16 | AI Agent (complex commands) | 4-5h | Critical |
| PR17 | Polish (undo/redo, shortcuts, color picker) | 3-4h | Nice-to-have |
| Demo | Record video | 3-4h | Critical |

**Total: 42-54 hours over 7 days**

---

## PR10: Transform Operations + Konva Migration

**Goal:** Add resize, rotate, duplicate + switch to Konva.js for better performance

### Acceptance Criteria
- [ ] Konva.js integrated (replace current HTML5 Canvas)
- [ ] Rectangles render with Konva
- [ ] Click object to select (visual selection indicator)
- [ ] Drag corners to resize (Konva's Transformer)
- [ ] Drag rotation handle to rotate
- [ ] "Duplicate" button creates copy of selected object
- [ ] Color picker to change object color
- [ ] All operations sync in real-time
- [ ] Existing features still work (create, move, delete, cursors)

### Technical Tasks

#### Frontend Changes

1. **Install Konva**
   ```bash
   cd frontend
   npm install konva react-konva
   npm install --save-dev @types/konva
   ```

2. **Create `frontend/src/lib/konva-canvas.ts`**
   - Initialize Konva Stage and Layer
   - Utility functions for shape creation
   - Transform controls setup

3. **Update `frontend/src/pages/Canvas.tsx`**
   - Replace HTML5 Canvas with Konva Stage
   - Integrate react-konva components
   - Add Transformer for selected object
   - Handle resize/rotate events
   - Sync transform changes via WebSocket

4. **Create `frontend/src/components/ColorPicker.tsx`**
   - Simple color picker (HTML5 input type="color")
   - Update selected object color
   - Sync color changes

5. **Update `frontend/src/components/Toolbar.tsx`**
   - Add "Duplicate" button
   - Add color picker
   - Enable only when object selected

6. **Update `frontend/src/types.ts`**
   ```typescript
   interface CanvasObject {
     id: string;
     type: 'rectangle'; // will add more in PR12
     x: number;
     y: number;
     width: number;
     height: number;
     rotation: number; // NEW
     color: string;
     zIndex: number; // NEW (for PR11)
     createdBy: string;
     createdAt: string;
   }
   ```

#### Backend Changes

7. **Update `backend/src/state/canvasState.ts`**
   - Add `rotation` field to objects
   - Add `color` field
   - Add `zIndex` field
   - Update `update` method to handle new fields

8. **Update `backend/src/ws/messageTypes.ts`**
   ```typescript
   export enum MessageType {
     // ... existing
     OBJECT_ROTATE = 'object.rotate',
     OBJECT_RESIZE = 'object.resize',
     OBJECT_DUPLICATE = 'object.duplicate',
     OBJECT_COLOR = 'object.color',
   }
   ```

9. **Update `backend/src/ws/handlers.ts`**
   - Add handlers for rotate, resize, duplicate, color
   - Broadcast transform changes to all clients

#### Testing Checklist

- [ ] Can resize rectangle by dragging corners
- [ ] Can rotate rectangle by dragging rotation handle
- [ ] Can duplicate selected rectangle
- [ ] Can change color of selected rectangle
- [ ] Two users see transforms in real-time
- [ ] Cursors still work
- [ ] Create/move/delete still work
- [ ] No performance regression

**Estimated Time:** 8-10 hours

---

## PR11: Multi-Select + Layer Management

**Goal:** Select multiple objects, arrange layers (z-index)

### Acceptance Criteria
- [ ] Shift+click to select multiple objects
- [ ] Drag to create selection rectangle (drag-to-select)
- [ ] Selected objects have visual indicator
- [ ] "Bring to Front" button moves selected to top layer
- [ ] "Send to Back" button moves selected to bottom layer
- [ ] Layer list shows all objects (click to select)
- [ ] Can delete multiple selected objects at once
- [ ] Multi-select syncs (other users see what you've selected)

### Technical Tasks

#### Frontend Changes

1. **Update `frontend/src/pages/Canvas.tsx`**
   - Add selection state: `selectedObjectIds: Set<string>`
   - Shift+click to add/remove from selection
   - Drag-to-select: Draw selection rectangle, select overlapping objects
   - Konva selection rectangle (use `Rect` with stroke, no fill)

2. **Create `frontend/src/components/LayerPanel.tsx`**
   ```typescript
   // Shows list of all objects
   - Object name (e.g., "Rectangle 1")
   - Click to select
   - Show selected state
   - Drag to reorder (changes z-index)
   ```

3. **Update `frontend/src/components/Toolbar.tsx`**
   - Add "Bring to Front" button
   - Add "Send to Back" button
   - Enable when objects selected

4. **Update `frontend/src/lib/konva-canvas.ts`**
   - Z-index management functions
   - Multi-select visual indicator (different color border)

#### Backend Changes

5. **Update `backend/src/ws/messageTypes.ts`**
   ```typescript
   OBJECT_Z_INDEX = 'object.zindex',
   SELECTION_UPDATE = 'selection.update', // Optional: show others' selections
   ```

6. **Update `backend/src/ws/handlers.ts`**
   - Handle z-index updates
   - Broadcast to all clients

#### Testing Checklist

- [ ] Can shift+click to select multiple rectangles
- [ ] Can drag to create selection rectangle
- [ ] "Bring to Front" moves objects to top
- [ ] "Send to Back" moves objects to bottom
- [ ] Layer panel shows all objects
- [ ] Can click layer panel items to select
- [ ] Delete key removes all selected objects
- [ ] Works with 2+ users

**Estimated Time:** 4-5 hours

---

## PR12: Multiple Shape Types

**Goal:** Add circles, lines, and text (required by rubric)

### Acceptance Criteria
- [ ] "Add Circle" button in toolbar
- [ ] "Add Line" button in toolbar
- [ ] "Add Text" button in toolbar
- [ ] Circles render and sync
- [ ] Lines render and sync
- [ ] Text renders and sync
- [ ] All shapes support: move, resize, rotate, delete, duplicate, color
- [ ] Text has editable content (double-click to edit)
- [ ] All shapes work with multi-select and layer management

### Technical Tasks

#### Frontend Changes

1. **Update `frontend/src/types.ts`**
   ```typescript
   type ShapeType = 'rectangle' | 'circle' | 'line' | 'text';

   interface CanvasObject {
     id: string;
     type: ShapeType;
     x: number;
     y: number;
     width: number;
     height: number;
     rotation: number;
     color: string;
     zIndex: number;

     // Text-specific fields
     text?: string;
     fontSize?: number;
     fontFamily?: string;

     // Line-specific fields
     points?: number[]; // [x1, y1, x2, y2]

     createdBy: string;
     createdAt: string;
   }
   ```

2. **Update `frontend/src/lib/konva-canvas.ts`**
   - `createCircle()` function
   - `createLine()` function
   - `createText()` function
   - Render functions for each shape type

3. **Update `frontend/src/pages/Canvas.tsx`**
   - Render different Konva shapes based on type:
     - `Rect` for rectangles
     - `Circle` for circles
     - `Line` for lines
     - `Text` for text
   - Handle text editing (double-click → input field or Konva text editing)

4. **Update `frontend/src/components/Toolbar.tsx`**
   - Add "Add Circle" button
   - Add "Add Line" button
   - Add "Add Text" button
   - Optional: Dropdown instead of 4 buttons

5. **Create `frontend/src/components/TextEditor.tsx` (Optional)**
   - Modal or inline editor for text content
   - Font size slider
   - Font family dropdown

#### Backend Changes

6. **Update `backend/src/ws/handlers.ts`**
   - Support `type` field in object creation
   - Validate shape types
   - Support text-specific and line-specific fields

#### Testing Checklist

- [ ] Can create circles, sync in real-time
- [ ] Can create lines, sync in real-time
- [ ] Can create text, sync in real-time
- [ ] Can resize all shape types
- [ ] Can rotate all shape types
- [ ] Can change color of all shapes
- [ ] Can edit text content
- [ ] All shapes work with multi-select
- [ ] Two users see all shapes correctly

**Estimated Time:** 4-5 hours

---

## PR13: DynamoDB Persistence

**Goal:** State persists even if server restarts (required by rubric)

### Acceptance Criteria
- [ ] Canvas state saved to DynamoDB on every change
- [ ] Canvas state loaded on connection
- [ ] If all users leave and return, canvas has same objects
- [ ] Server can restart without losing data
- [ ] Performance: writes don't block (<10ms overhead)

### Technical Tasks

#### AWS Setup

1. **Create DynamoDB Table**
   ```bash
   aws dynamodb create-table \
     --table-name collabcanvas-objects \
     --attribute-definitions \
       AttributeName=id,AttributeType=S \
     --key-schema \
       AttributeName=id,KeyType=HASH \
     --billing-mode PAY_PER_REQUEST
   ```

2. **Configure IAM permissions**
   - Backend EC2 instance needs DynamoDB read/write

#### Backend Changes

3. **Install AWS SDK**
   ```bash
   cd backend
   npm install @aws-sdk/client-dynamodb @aws-sdk/lib-dynamodb
   ```

4. **Create `backend/src/db/dynamodb.ts`**
   ```typescript
   import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
   import { DynamoDBDocumentClient, PutCommand, GetCommand, DeleteCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';

   const client = new DynamoDBClient({ region: 'us-east-1' });
   const docClient = DynamoDBDocumentClient.from(client);

   export const db = {
     saveObject: async (obj: CanvasObject) => {
       await docClient.send(new PutCommand({
         TableName: 'collabcanvas-objects',
         Item: obj
       }));
     },

     deleteObject: async (id: string) => {
       await docClient.send(new DeleteCommand({
         TableName: 'collabcanvas-objects',
         Key: { id }
       }));
     },

     getAllObjects: async (): Promise<CanvasObject[]> => {
       const result = await docClient.send(new ScanCommand({
         TableName: 'collabcanvas-objects'
       }));
       return result.Items as CanvasObject[];
     }
   };
   ```

5. **Update `backend/src/state/canvasState.ts`**
   ```typescript
   import { db } from '../db/dynamodb';

   // On startup: load from DynamoDB
   export async function initializeState() {
     const objects = await db.getAllObjects();
     canvasObjects.push(...objects);
   }

   // On add: save to DynamoDB (async, don't block)
   export const canvasState = {
     add: (obj: CanvasObject) => {
       canvasObjects.push(obj);
       db.saveObject(obj).catch(err => logger.error('DB save failed', err));
     },

     update: (id: string, changes: Partial<CanvasObject>) => {
       const obj = canvasObjects.find(o => o.id === id);
       if (obj) {
         Object.assign(obj, changes);
         db.saveObject(obj).catch(err => logger.error('DB save failed', err));
       }
     },

     delete: (id: string) => {
       const index = canvasObjects.findIndex(o => o.id === id);
       if (index !== -1) {
         canvasObjects.splice(index, 1);
         db.deleteObject(id).catch(err => logger.error('DB delete failed', err));
       }
     }
   };
   ```

6. **Update `backend/src/server.ts`**
   ```typescript
   import { initializeState } from './state/canvasState';

   // Load state before starting server
   initializeState().then(() => {
     httpServer.listen(PORT, () => {
       logger.info(`Server started on port ${PORT}`);
     });
   });
   ```

7. **Update `backend/src/env.ts`**
   ```typescript
   // Add AWS region env var
   AWS_REGION: process.env.AWS_REGION || 'us-east-1'
   ```

#### Testing Checklist

- [ ] Create objects, restart server, objects still exist
- [ ] All users leave, all users return, canvas has same state
- [ ] DynamoDB console shows objects
- [ ] Performance: no noticeable lag when creating objects
- [ ] Errors logged if DynamoDB write fails (but doesn't crash)

**Estimated Time:** 4-5 hours

---

## PR14: AWS Deployment (EC2 + Redis)

**Goal:** Deploy to AWS for production-grade performance (no cold starts)

### Acceptance Criteria
- [ ] Backend running on AWS EC2
- [ ] Redis ElastiCache for pub/sub (multi-instance ready)
- [ ] No cold starts (always-on)
- [ ] WebSocket connections stable
- [ ] Frontend deployed (can keep Vercel or move to S3/CloudFront)
- [ ] HTTPS/WSS configured
- [ ] All existing features work on AWS

### Technical Tasks

#### AWS Infrastructure Setup

1. **Create EC2 Instance**
   ```bash
   Instance type: t3.small (2 vCPU, 2 GB RAM)
   AMI: Amazon Linux 2023
   Security group: Allow 80, 443, 8080, 22
   Storage: 20 GB
   ```

2. **Create ElastiCache Redis**
   ```bash
   Node type: cache.t3.micro
   Engine: Redis 7.x
   Cluster mode: Disabled (simplest)
   ```

3. **Setup Application Load Balancer (Optional, for scaling)**
   - Target group: EC2 instances
   - Listener: HTTP/HTTPS
   - WebSocket support enabled

#### Backend Changes

4. **Install Redis client**
   ```bash
   cd backend
   npm install ioredis
   npm install --save-dev @types/ioredis
   ```

5. **Create `backend/src/redis/pubsub.ts`**
   ```typescript
   import Redis from 'ioredis';

   const publisher = new Redis(process.env.REDIS_URL);
   const subscriber = new Redis(process.env.REDIS_URL);

   export const pubsub = {
     publish: (channel: string, message: any) => {
       publisher.publish(channel, JSON.stringify(message));
     },

     subscribe: (channel: string, handler: (message: any) => void) => {
       subscriber.subscribe(channel);
       subscriber.on('message', (ch, msg) => {
         if (ch === channel) {
           handler(JSON.parse(msg));
         }
       });
     }
   };
   ```

6. **Update `backend/src/ws/handlers.ts`**
   ```typescript
   import { pubsub } from '../redis/pubsub';

   // Instead of broadcastToAll(), publish to Redis
   function broadcastViaRedis(message: any) {
     pubsub.publish('canvas-updates', message);
   }

   // Subscribe to Redis, forward to local WebSocket clients
   pubsub.subscribe('canvas-updates', (message) => {
     connectedClients.forEach((claims, client) => {
       if (client.readyState === WebSocket.OPEN) {
         client.send(JSON.stringify(message));
       }
     });
   });
   ```

7. **Update `backend/src/env.ts`**
   ```typescript
   REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
   ```

8. **Create deployment script `backend/deploy-aws.sh`**
   ```bash
   #!/bin/bash
   # SSH to EC2, pull code, restart
   ssh ec2-user@<EC2_IP> << 'EOF'
   cd /home/ec2-user/CollabCanva/backend
   git pull origin main
   npm install
   npm run build
   pm2 restart collabcanva-backend
   EOF
   ```

9. **Setup PM2 for process management**
   ```bash
   # On EC2 instance
   npm install -g pm2
   pm2 start dist/server.js --name collabcanva-backend
   pm2 startup  # Auto-start on reboot
   pm2 save
   ```

#### Frontend Changes

10. **Update `frontend/.env.production`**
    ```bash
    VITE_WS_URL=wss://<EC2_IP_OR_DOMAIN>:8080
    # Or if using ALB: wss://api.collabcanva.com
    ```

11. **Optional: Move frontend to S3 + CloudFront**
    - Faster than Vercel for AWS region
    - Or keep Vercel (works fine)

#### Testing Checklist

- [ ] Backend runs on EC2 (no cold starts)
- [ ] Can connect via WebSocket from deployed frontend
- [ ] All features work (create, move, cursors, shapes)
- [ ] DynamoDB persistence still works
- [ ] Redis pub/sub working (test with 2 EC2 instances if scaling)
- [ ] HTTPS/WSS configured
- [ ] Server restarts automatically on crash (PM2)

**Estimated Time:** 6-8 hours

---

## PR15: AI Agent (Basic Commands)

**Goal:** Natural language commands create/manipulate canvas objects (6+ types)

### Acceptance Criteria
- [ ] Chat input box on canvas page
- [ ] Submit AI command (e.g., "Create a red circle")
- [ ] AI generates function calls
- [ ] Backend executes functions
- [ ] Objects appear on canvas for all users
- [ ] Response time <2 seconds
- [ ] Support 6+ command types:
  1. Create rectangle
  2. Create circle
  3. Create text
  4. Create line
  5. Move object
  6. Resize object
  7. Rotate object (bonus, 7th type)
  8. Change color

### Technical Tasks

#### Backend Changes

1. **Install OpenAI SDK**
   ```bash
   cd backend
   npm install openai
   ```

2. **Create `backend/src/ai/openai.ts`**
   ```typescript
   import OpenAI from 'openai';

   const openai = new OpenAI({
     apiKey: process.env.OPENAI_API_KEY
   });

   export const tools = [
     {
       type: 'function',
       function: {
         name: 'create_rectangle',
         description: 'Create a rectangle on the canvas',
         parameters: {
           type: 'object',
           properties: {
             x: { type: 'number', description: 'X position' },
             y: { type: 'number', description: 'Y position' },
             width: { type: 'number', description: 'Width' },
             height: { type: 'number', description: 'Height' },
             color: { type: 'string', description: 'Color (hex or name)' }
           },
           required: ['x', 'y', 'width', 'height']
         }
       }
     },
     {
       type: 'function',
       function: {
         name: 'create_circle',
         description: 'Create a circle on the canvas',
         parameters: {
           type: 'object',
           properties: {
             x: { type: 'number' },
             y: { type: 'number' },
             radius: { type: 'number' },
             color: { type: 'string' }
           },
           required: ['x', 'y', 'radius']
         }
       }
     },
     {
       type: 'function',
       function: {
         name: 'create_text',
         description: 'Create a text layer on the canvas',
         parameters: {
           type: 'object',
           properties: {
             text: { type: 'string', description: 'Text content' },
             x: { type: 'number' },
             y: { type: 'number' },
             fontSize: { type: 'number' },
             color: { type: 'string' }
           },
           required: ['text', 'x', 'y']
         }
       }
     },
     {
       type: 'function',
       function: {
         name: 'move_object',
         description: 'Move an object to a new position',
         parameters: {
           type: 'object',
           properties: {
             objectId: { type: 'string', description: 'ID or description of object to move' },
             x: { type: 'number' },
             y: { type: 'number' }
           },
           required: ['objectId', 'x', 'y']
         }
       }
     },
     {
       type: 'function',
       function: {
         name: 'resize_object',
         description: 'Resize an object',
         parameters: {
           type: 'object',
           properties: {
             objectId: { type: 'string' },
             width: { type: 'number' },
             height: { type: 'number' }
           },
           required: ['objectId', 'width', 'height']
         }
       }
     },
     {
       type: 'function',
       function: {
         name: 'change_color',
         description: 'Change the color of an object',
         parameters: {
           type: 'object',
           properties: {
             objectId: { type: 'string' },
             color: { type: 'string' }
           },
           required: ['objectId', 'color']
         }
       }
     }
   ];

   export async function processAICommand(
     message: string,
     canvasState: CanvasObject[]
   ): Promise<any[]> {
     const response = await openai.chat.completions.create({
       model: 'gpt-4-turbo-preview',
       messages: [
         {
           role: 'system',
           content: `You are a canvas manipulation assistant. The user has a canvas with objects. Current state: ${JSON.stringify(canvasState)}. Execute commands to create or manipulate objects.`
         },
         {
           role: 'user',
           content: message
         }
       ],
       tools: tools,
       tool_choice: 'auto'
     });

     const toolCalls = response.choices[0].message.tool_calls || [];
     return toolCalls.map(call => ({
       function: call.function.name,
       arguments: JSON.parse(call.function.arguments)
     }));
   }
   ```

3. **Create `backend/src/http/ai.ts`**
   ```typescript
   import { Request, Response } from 'express';
   import { processAICommand } from '../ai/openai';
   import { canvasState } from '../state/canvasState';
   import { broadcastViaRedis } from '../ws/handlers';
   import { v4 as uuidv4 } from 'uuid';

   export async function handleAICommand(req: Request, res: Response) {
     const { message, userId } = req.body;

     try {
       // Get current canvas state
       const currentState = canvasState.getAll();

       // Ask AI for function calls
       const functionCalls = await processAICommand(message, currentState);

       // Execute each function call
       const results = [];
       for (const call of functionCalls) {
         const result = await executeFunctionCall(call, userId);
         results.push(result);

         // Broadcast to all clients
         broadcastViaRedis(result);
       }

       res.json({ success: true, results });
     } catch (error) {
       console.error('AI command error:', error);
       res.status(500).json({ success: false, error: error.message });
     }
   }

   async function executeFunctionCall(call: any, userId: string) {
     const { function: funcName, arguments: args } = call;

     switch (funcName) {
       case 'create_rectangle': {
         const obj = {
           id: uuidv4(),
           type: 'rectangle',
           x: args.x,
           y: args.y,
           width: args.width,
           height: args.height,
           rotation: 0,
           color: args.color || '#3b82f6',
           zIndex: canvasState.getAll().length,
           createdBy: userId,
           createdAt: new Date().toISOString()
         };
         canvasState.add(obj);
         return { type: 'object.create', object: obj };
       }

       case 'create_circle': {
         const obj = {
           id: uuidv4(),
           type: 'circle',
           x: args.x,
           y: args.y,
           width: args.radius * 2,
           height: args.radius * 2,
           rotation: 0,
           color: args.color || '#10b981',
           zIndex: canvasState.getAll().length,
           createdBy: userId,
           createdAt: new Date().toISOString()
         };
         canvasState.add(obj);
         return { type: 'object.create', object: obj };
       }

       case 'create_text': {
         const obj = {
           id: uuidv4(),
           type: 'text',
           x: args.x,
           y: args.y,
           width: 200,
           height: 50,
           rotation: 0,
           color: args.color || '#000000',
           text: args.text,
           fontSize: args.fontSize || 16,
           fontFamily: 'Arial',
           zIndex: canvasState.getAll().length,
           createdBy: userId,
           createdAt: new Date().toISOString()
         };
         canvasState.add(obj);
         return { type: 'object.create', object: obj };
       }

       case 'move_object': {
         // Find object by ID or description
         const obj = findObject(args.objectId, canvasState.getAll());
         if (obj) {
           canvasState.update(obj.id, { x: args.x, y: args.y });
           return { type: 'object.update', id: obj.id, x: args.x, y: args.y };
         }
         throw new Error('Object not found');
       }

       case 'resize_object': {
         const obj = findObject(args.objectId, canvasState.getAll());
         if (obj) {
           canvasState.update(obj.id, { width: args.width, height: args.height });
           return { type: 'object.update', id: obj.id, width: args.width, height: args.height };
         }
         throw new Error('Object not found');
       }

       case 'change_color': {
         const obj = findObject(args.objectId, canvasState.getAll());
         if (obj) {
           canvasState.update(obj.id, { color: args.color });
           return { type: 'object.update', id: obj.id, color: args.color };
         }
         throw new Error('Object not found');
       }

       default:
         throw new Error(`Unknown function: ${funcName}`);
     }
   }

   function findObject(idOrDescription: string, objects: CanvasObject[]) {
     // Try exact ID match first
     let obj = objects.find(o => o.id === idOrDescription);
     if (obj) return obj;

     // Try finding by color (e.g., "the red rectangle")
     if (idOrDescription.includes('red')) {
       obj = objects.find(o => o.color.includes('red'));
     } else if (idOrDescription.includes('blue')) {
       obj = objects.find(o => o.color.includes('blue'));
     }
     // Add more heuristics as needed

     return obj;
   }
   ```

4. **Update `backend/src/server.ts`**
   ```typescript
   import express from 'express';
   import { handleAICommand } from './http/ai';

   const app = express();
   app.use(express.json());

   app.post('/api/ai/command', handleAICommand);
   ```

5. **Update `backend/src/env.ts`**
   ```typescript
   OPENAI_API_KEY: process.env.OPENAI_API_KEY || ''
   ```

#### Frontend Changes

6. **Create `frontend/src/components/AIChat.tsx`**
   ```typescript
   import React, { useState } from 'react';

   export function AIChat() {
     const [message, setMessage] = useState('');
     const [loading, setLoading] = useState(false);

     const handleSubmit = async (e: React.FormEvent) => {
       e.preventDefault();
       if (!message.trim()) return;

       setLoading(true);
       try {
         const userId = auth.currentUser?.uid || 'anonymous';
         const response = await fetch('https://your-backend.com/api/ai/command', {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({ message, userId })
         });

         const result = await response.json();
         if (result.success) {
           setMessage('');
           // Show success toast
         }
       } catch (error) {
         console.error('AI command failed:', error);
         // Show error toast
       } finally {
         setLoading(false);
       }
     };

     return (
       <div className="ai-chat">
         <form onSubmit={handleSubmit}>
           <input
             type="text"
             value={message}
             onChange={(e) => setMessage(e.target.value)}
             placeholder="Ask AI to create or modify objects..."
             disabled={loading}
           />
           <button type="submit" disabled={loading}>
             {loading ? 'Processing...' : 'Send'}
           </button>
         </form>
       </div>
     );
   }
   ```

7. **Update `frontend/src/pages/Canvas.tsx`**
   ```typescript
   import { AIChat } from '../components/AIChat';

   // Add to render:
   <AIChat />
   ```

8. **Update `frontend/src/styles.css`**
   ```css
   .ai-chat {
     position: fixed;
     bottom: 20px;
     left: 20px;
     background: white;
     border: 2px solid #e5e7eb;
     border-radius: 8px;
     padding: 12px;
     box-shadow: 0 4px 6px rgba(0,0,0,0.1);
     width: 400px;
   }

   .ai-chat input {
     width: 100%;
     padding: 8px;
     border: 1px solid #d1d5db;
     border-radius: 4px;
     margin-bottom: 8px;
   }

   .ai-chat button {
     width: 100%;
     padding: 8px;
     background: #3b82f6;
     color: white;
     border: none;
     border-radius: 4px;
     cursor: pointer;
   }

   .ai-chat button:disabled {
     background: #9ca3af;
     cursor: not-allowed;
   }
   ```

#### Testing Checklist

- [ ] Can type "Create a red rectangle at 100, 100" → rectangle appears
- [ ] Can type "Create a blue circle at 200, 200" → circle appears
- [ ] Can type "Add text that says Hello World" → text appears
- [ ] Can type "Move the red rectangle to 300, 300" → moves
- [ ] Can type "Resize the circle to be bigger" → resizes
- [ ] Can type "Change the rectangle to green" → color changes
- [ ] Response time <2 seconds
- [ ] Other users see AI-generated objects in real-time
- [ ] 6+ command types working

**Estimated Time:** 6-8 hours

---

## PR16: AI Agent (Complex Commands)

**Goal:** Multi-step AI commands (e.g., "Create a login form")

### Acceptance Criteria
- [ ] "Create a login form" → username field, password field, submit button (3+ shapes)
- [ ] "Build a navigation bar with 4 menu items" → 4 text items arranged horizontally
- [ ] "Make a card layout" → title, rectangle background, text description
- [ ] Objects arranged neatly (not overlapping randomly)
- [ ] Complex commands complete in <5 seconds
- [ ] All users see the result

### Technical Tasks

#### Backend Changes

1. **Update `backend/src/ai/openai.ts`**
   - Add system prompt with layout instructions:
   ```typescript
   const systemPrompt = `
   You are a canvas manipulation assistant. When creating multiple objects:
   - Arrange them neatly (aligned, spaced)
   - For forms: stack vertically with 60px spacing
   - For horizontal layouts: space evenly with 20px gaps
   - Center elements when appropriate
   - Use sensible defaults: text 16px, buttons 120x40, inputs 200x30
   `;
   ```

2. **Add new tool: `arrange_objects`**
   ```typescript
   {
     type: 'function',
     function: {
       name: 'arrange_horizontal',
       description: 'Arrange multiple objects in a horizontal row',
       parameters: {
         type: 'object',
         properties: {
           objectIds: { type: 'array', items: { type: 'string' } },
           spacing: { type: 'number', description: 'Gap between objects' }
         }
       }
     }
   }
   ```

3. **Update `executeFunctionCall` in `backend/src/http/ai.ts`**
   - Handle `arrange_horizontal`
   - Handle `arrange_vertical`
   - Handle `arrange_grid`

4. **Add examples to AI prompt**
   ```typescript
   const examples = [
     {
       user: 'Create a login form',
       assistant: [
         { function: 'create_text', args: { text: 'Username:', x: 100, y: 100 } },
         { function: 'create_rectangle', args: { x: 100, y: 130, width: 200, height: 30, color: '#ffffff' } },
         { function: 'create_text', args: { text: 'Password:', x: 100, y: 180 } },
         { function: 'create_rectangle', args: { x: 100, y: 210, width: 200, height: 30, color: '#ffffff' } },
         { function: 'create_rectangle', args: { x: 100, y: 260, width: 120, height: 40, color: '#3b82f6' } },
         { function: 'create_text', args: { text: 'Login', x: 130, y: 270, color: '#ffffff' } }
       ]
     }
   ];
   ```

#### Testing Checklist

- [ ] "Create a login form" → username label, input, password label, input, button
- [ ] "Build a navigation bar with 4 menu items" → 4 text items spaced horizontally
- [ ] "Make a 3x3 grid of squares" → 9 rectangles in grid layout
- [ ] Objects don't overlap randomly
- [ ] Spacing looks intentional
- [ ] Completes in <5 seconds
- [ ] Other users see the complex layout

**Estimated Time:** 4-5 hours

---

## PR17: Polish (Nice-to-Have)

**Goal:** Undo/redo, keyboard shortcuts, improved UX

### Acceptance Criteria
- [ ] Ctrl+Z for undo
- [ ] Ctrl+Y for redo
- [ ] Ctrl+D for duplicate
- [ ] Delete key for delete (already works)
- [ ] Escape key to deselect
- [ ] Command history maintained
- [ ] Undo/redo syncs across users (or document that it's local-only)

### Technical Tasks

#### Frontend Changes

1. **Create `frontend/src/lib/history.ts`**
   ```typescript
   interface HistoryEntry {
     type: 'create' | 'update' | 'delete';
     object: CanvasObject;
     before?: Partial<CanvasObject>; // For updates
   }

   const undoStack: HistoryEntry[] = [];
   const redoStack: HistoryEntry[] = [];

   export const history = {
     record: (entry: HistoryEntry) => {
       undoStack.push(entry);
       redoStack.length = 0; // Clear redo on new action
     },

     undo: () => {
       const entry = undoStack.pop();
       if (!entry) return null;

       redoStack.push(entry);
       return entry;
     },

     redo: () => {
       const entry = redoStack.pop();
       if (!entry) return null;

       undoStack.push(entry);
       return entry;
     }
   };
   ```

2. **Update `frontend/src/pages/Canvas.tsx`**
   - Add keyboard event listener:
   ```typescript
   useEffect(() => {
     const handleKeyboard = (e: KeyboardEvent) => {
       if (e.ctrlKey && e.key === 'z') {
         e.preventDefault();
         handleUndo();
       }
       if (e.ctrlKey && e.key === 'y') {
         e.preventDefault();
         handleRedo();
       }
       if (e.ctrlKey && e.key === 'd') {
         e.preventDefault();
         handleDuplicate();
       }
       if (e.key === 'Escape') {
         setSelectedObjectIds(new Set());
       }
     };

     window.addEventListener('keydown', handleKeyboard);
     return () => window.removeEventListener('keydown', handleKeyboard);
   }, []);
   ```

3. **Implement undo/redo handlers**
   ```typescript
   const handleUndo = () => {
     const entry = history.undo();
     if (!entry) return;

     // Reverse the action
     if (entry.type === 'create') {
       // Delete the object
       wsClient.send({ type: 'object.delete', id: entry.object.id });
     } else if (entry.type === 'delete') {
       // Recreate the object
       wsClient.send({ type: 'object.create', object: entry.object });
     } else if (entry.type === 'update') {
       // Revert to before state
       wsClient.send({ type: 'object.update', id: entry.object.id, ...entry.before });
     }
   };
   ```

#### Testing Checklist

- [ ] Ctrl+Z undoes last action
- [ ] Ctrl+Y redoes undone action
- [ ] Ctrl+D duplicates selected object
- [ ] Escape deselects all
- [ ] Keyboard shortcuts feel responsive

**Estimated Time:** 3-4 hours

---

## Demo Video Requirements

**Goal:** 3-5 minute video showcasing collaboration + AI + architecture

### Script Outline

**Intro (30 seconds)**
- "Hi, I'm [Name], and this is CollabCanvas"
- "A real-time collaborative design tool with AI capabilities"
- "Built in 7 days using React, Node.js, WebSocket, AWS, and OpenAI GPT-4"

**Real-Time Collaboration (1 minute)**
- Show two browser windows side-by-side
- User 1 creates a rectangle → User 2 sees it instantly
- User 2 moves the rectangle → User 1 sees it move
- Show live cursors with names
- "Notice the cursors sync in real-time, and all actions appear instantly for both users"

**Canvas Features (1 minute)**
- Create shapes: rectangles, circles, text, lines
- Transform: resize, rotate
- Multi-select: shift-click multiple objects
- Layer management: bring to front, send to back
- "The canvas supports all standard design operations"

**AI Agent (1.5 minutes)**
- Show AI chat interface
- Type: "Create a red circle at 200, 200" → appears
- Type: "Move the circle to the center" → moves
- Type: "Create a login form" → username, password, button appear arranged neatly
- "The AI understands natural language and can create complex layouts with multiple objects"
- "All AI-generated content syncs to other users in real-time"

**Architecture (1 minute)**
- Show quick diagram or bullet points:
  - Frontend: React + Konva.js (canvas rendering)
  - Backend: Node.js + WebSocket (real-time sync)
  - Database: DynamoDB (persistence)
  - Redis: Pub/sub for multi-instance scaling
  - AI: OpenAI GPT-4 function calling
- "Performance targets: <100ms sync, 60 FPS, 500+ objects"
- "Deployed on AWS EC2 with no cold starts"

**Outro (30 seconds)**
- "This project demonstrates real-time collaboration with AI co-creation"
- "GitHub link: github.com/sainathyai/CollabCanva"
- "Live demo: [your deployed URL]"
- "Thanks for watching!"

### Recording Tips

1. Use OBS Studio or Loom
2. Record in 1080p
3. Use two browser windows side-by-side for collaboration demo
4. Have scripts/commands ready (don't type live)
5. Background music (optional, subtle)
6. Export to MP4, upload to YouTube or Vimeo

**Estimated Time:** 3-4 hours (scripting, recording, editing)

---

## Success Metrics

### Must Achieve (Grade A Requirements)

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| Canvas features | All 10 required | 3/10 | ❌ |
| Shape types | 3+ (rect, circle, text) | 1 (rect) | ❌ |
| State persistence | Yes | No (in-memory) | ❌ |
| AI command types | 6+ | 0 | ❌ |
| Complex AI commands | 3+ | 0 | ❌ |
| Demo video | 3-5 min | Not created | ❌ |
| Performance: 60 FPS | 500+ objects | Not tested | ❌ |
| Performance: Sync latency | <100ms | ✅ Achieved | ✅ |
| Concurrent users | 5+ | Tested 2 | ⚠️ |
| Deployment uptime | 99%+ | Free tier cold starts | ❌ |

### Timeline: 7 Days

| Day | PRs | Hours | Cumulative |
|-----|-----|-------|------------|
| Day 1 | PR10 (Konva + transforms) | 8-10h | 10h |
| Day 2 | PR11 (multi-select), PR12 (shapes) | 8-10h | 20h |
| Day 3 | PR13 (DynamoDB) | 4-5h | 25h |
| Day 4 | PR14 (AWS deployment) | 6-8h | 33h |
| Day 5 | PR15 (AI basic) | 6-8h | 41h |
| Day 6 | PR16 (AI complex), PR17 (polish) | 7-9h | 50h |
| Day 7 | Demo video, final testing, submission | 4h | 54h |

**Total: 50-54 hours over 7 days (7-8 hours/day)**

---

## Risk Assessment

### High Risk

| Risk | Impact | Mitigation |
|------|--------|------------|
| Konva.js migration breaks existing features | High | Allocate PR10 buffer time, test thoroughly |
| AWS deployment complexity | High | Use EC2 directly (simplest), skip ALB initially |
| AI commands too slow (>2s) | High | Optimize prompt, use GPT-4 Turbo, cache common commands |
| Can't hit 60 FPS with 500 objects | Medium | Konva handles this, but test early |

### Medium Risk

| Risk | Impact | Mitigation |
|------|--------|------------|
| DynamoDB costs exceed budget | Medium | Use on-demand pricing, monitor spend |
| Complex AI commands don't work | Medium | Start simple, iterate, provide examples in prompt |
| Demo video takes too long | Low | Keep it simple, 3 minutes is enough |

### Low Risk

| Risk | Impact | Mitigation |
|------|--------|------------|
| Multi-select UX confusing | Low | Follow standard patterns (shift-click, drag) |
| Layer management edge cases | Low | Basic z-index is sufficient for MVP |

---

## Submission Checklist

### Before Submission

- [ ] All PRs merged to main
- [ ] Deployed to AWS (backend) + Vercel (frontend)
- [ ] GitHub repository public
- [ ] README updated with:
  - [ ] Live demo link
  - [ ] Architecture diagram
  - [ ] Setup instructions
  - [ ] Feature list
- [ ] AI Development Log updated (already excellent!)
- [ ] Demo video recorded and uploaded
- [ ] All rubric requirements met:
  - [ ] Pan/zoom ✅
  - [ ] Resize/rotate ✅
  - [ ] Multi-select ✅
  - [ ] Circles, text, lines ✅
  - [ ] Layer management ✅
  - [ ] State persistence ✅
  - [ ] AI 6+ commands ✅
  - [ ] Complex AI commands ✅
  - [ ] Demo video ✅

### Submission Package

1. **GitHub Repository**: https://github.com/sainathyai/CollabCanva
2. **Demo Video**: [YouTube/Vimeo link]
3. **AI Development Log**: `docs/AI_DEVELOPMENT_LOG.txt` (already done!)
4. **Live Application**: [AWS deployment URL]

---

## Appendix: Alternative Tech Stack Considerations

### If Time is Limited

**Simplifications:**
- Skip Konva → Stick with HTML5 Canvas + manual transforms (saves 2-3h migration, costs 5-6h building features)
- Skip Redis → Single EC2 instance (acceptable for 5 users)
- Skip undo/redo → Focus on core features

### If Budget is Limited

**Cost Optimizations:**
- Use Render paid tier ($7/month) instead of AWS EC2 ($30/month)
- Use MongoDB Atlas free tier instead of DynamoDB
- Use Firebase Realtime DB instead of DynamoDB + Redis

### If Targeting Higher Grade

**Bonus Features:**
- CRDT-based conflict resolution (instead of last-write-wins)
- Multiple canvas rooms (project management)
- Export to PNG/SVG
- Image uploads
- Collaborative cursors show selection state
- Voice chat alongside canvas

---

## Conclusion

This PRD provides a clear path to Grade A:

1. **Crucial features** (PR10-16): All rubric requirements
2. **Nice-to-have** (PR17): Polish that impresses but not required
3. **Performance targets**: AWS stack ensures <100ms, 60 FPS
4. **AI agent**: 6+ commands including complex multi-step
5. **Demo video**: Showcases everything in 3-5 minutes

**Timeline:** 7 days (50-54 hours)
**Cost:** ~$50-60/month AWS + $20-40 OpenAI
**Grade Target:** A (meets all rubric requirements)

**Next Steps:**
1. Confirm AWS access and create accounts
2. Start with PR10 (Konva migration + transforms)
3. Follow PR-by-PR plan
4. Test continuously
5. Record demo video on Day 7

---

**Let's build this! 🚀**

