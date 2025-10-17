# PR14: Multi-Project Support & Dashboard

**Branch**: `pr14-multiproject-dashboard`
**Timeline**: 3-4 days
**Priority**: High - Core feature for production
**Status**: Not Started

---

## Overview

Add project management system with dashboard UI. Users can create multiple projects, each with its own isolated canvas. This transforms CollabCanvas from a single shared canvas to a proper multi-tenant application.

**Key Principle**: Projects are isolated - objects belong to specific projects, users work on one project at a time.

---

## Problem Statement

Currently:
- ❌ All users share one global canvas (`default-project`)
- ❌ No way to organize work into separate projects
- ❌ Can't have multiple canvases
- ❌ No project ownership or management

After PR14:
- ✅ Users can create unlimited projects
- ✅ Each project has isolated canvas
- ✅ Dashboard shows all user's projects
- ✅ Clean URL routing (`/canvas/:projectId`)
- ✅ Project metadata (name, description, thumbnail)

---

## Architecture

### Backend Changes
```
Current: All objects → default-project
New:     Each project → separate canvas state
         WebSocket rooms per project
         Project-scoped object storage
```

### Frontend Flow
```
Login → Dashboard (list projects) → Select/Create Project → Canvas
```

### URL Structure
```
/              → Login
/dashboard     → Project list
/canvas/:id    → Canvas for specific project
```

---

## Backend Implementation

### Task 1: HTTP API Endpoints

**New File**: `backend/src/http/projects.ts`

**Endpoints**:

**POST /api/projects**
- Create new project
- Body: `{ name, description }`
- Returns: `{ projectId, name, description, createdAt, ownerId }`
- Requires authentication

**GET /api/projects**
- List user's projects
- Query: `?userId=xxx`
- Returns: `[{ projectId, name, description, ... }]`

**GET /api/projects/:id**
- Get single project details
- Returns: Project object or 404

**PUT /api/projects/:id**
- Update project metadata
- Body: `{ name?, description? }`
- Returns: Updated project

**DELETE /api/projects/:id**
- Soft delete project
- Sets `deletedAt` timestamp
- Returns: 204 No Content

---

### Task 2: Update Canvas State for Multi-Project

**Modify**: `backend/src/state/canvasState.ts`

**Changes**:

**Current**:
```typescript
// Single global canvas
const canvasObjects = new Map<string, CanvasObject>()
```

**New**:
```typescript
// Per-project canvas state
const projectCanvases = new Map<string, Map<string, CanvasObject>>()

function getProjectCanvas(projectId: string) {
  if (!projectCanvases.has(projectId)) {
    projectCanvases.set(projectId, new Map())
  }
  return projectCanvases.get(projectId)!
}
```

**Updated Functions**:
- `createObject(projectId, object)` - Add projectId parameter
- `updateObject(projectId, object)` - Add projectId parameter
- `deleteObject(projectId, id)` - Add projectId parameter
- `getAllObjects(projectId)` - Get objects for specific project
- `loadFromDatabase(projectId)` - Load specific project

---

### Task 3: WebSocket Room Management

**Modify**: `backend/src/ws/handlers.ts`

**Changes**:

**Add Room Join**:
```typescript
// When user connects, they join a project room
ws.on('joinProject', ({ projectId }) => {
  ws.join(`project:${projectId}`)
  ws.currentProjectId = projectId
})
```

**Update Broadcasts**:
```typescript
// Broadcast only to users in same project
io.to(`project:${projectId}`).emit('object.create', object)
```

**Message Types**:
- `project.join` - Join project room
- `project.leave` - Leave project room
- Objects scoped to current project

---

### Task 4: Update Auto-Save for Multi-Project

**Modify**: `backend/src/workers/autoSaveWorker.ts`

Already supports multiple projects! Just need to:
- Remove `DEFAULT_PROJECT_ID` hardcoding
- Save all dirty projects (already does this)
- Load all active projects on startup

**No major changes needed** - architecture already supports it! ✅

---

## Frontend Implementation

### Task 5: Create Dashboard Page

**New File**: `frontend/src/pages/Dashboard.tsx`

**Features**:
- Grid layout of project cards
- "Create New Project" button
- Project name, description, last modified
- Click card → navigate to canvas
- Delete project button (with confirmation)

**Mock Layout**:
```
┌─────────────────────────────────┐
│  CollabCanvas Dashboard         │
│                                 │
│  [+ New Project]                │
│                                 │
│  ┌──────┐ ┌──────┐ ┌──────┐   │
│  │ Proj │ │ Proj │ │ Proj │   │
│  │  1   │ │  2   │ │  3   │   │
│  └──────┘ └──────┘ └──────┘   │
└─────────────────────────────────┘
```

---

### Task 6: Create ProjectCard Component

**New File**: `frontend/src/components/ProjectCard.tsx`

**Props**:
```typescript
interface ProjectCardProps {
  project: {
    projectId: string
    name: string
    description?: string
    updatedAt: string
    thumbnailUrl?: string
  }
  onClick: () => void
  onDelete: (id: string) => void
}
```

**Features**:
- Show project thumbnail (placeholder for now)
- Show name and description
- Show last modified date
- Click → open project
- Delete button (hover to show)

---

### Task 7: Update Canvas Page

**Modify**: `frontend/src/pages/Canvas.tsx`

**Changes**:

**1. Get projectId from URL**:
```typescript
const { projectId } = useParams<{ projectId: string }>()
```

**2. Load project on mount**:
```typescript
useEffect(() => {
  fetch(`/api/projects/${projectId}`)
    .then(res => res.json())
    .then(project => setProject(project))
}, [projectId])
```

**3. Update WebSocket connection**:
```typescript
// Join project room after auth
ws.send(JSON.stringify({
  type: 'project.join',
  projectId
}))
```

**4. Show project name in header**:
```typescript
<Header projectName={project?.name} />
```

---

### Task 8: Update Router

**Modify**: `frontend/src/routes/Router.tsx`

**New Routes**:
```typescript
<Routes>
  <Route path="/" element={<Login />} />
  <Route path="/dashboard" element={<Dashboard />} />
  <Route path="/canvas/:projectId" element={<Canvas />} />
</Routes>
```

**Protected Routes**:
- Dashboard and Canvas require authentication
- Redirect to login if not authenticated

---

### Task 9: Create API Service

**New File**: `frontend/src/lib/projectService.ts`

**Functions**:
```typescript
export async function createProject(name: string, description?: string)
export async function getProjects(userId: string)
export async function getProject(projectId: string)
export async function updateProject(projectId: string, updates: any)
export async function deleteProject(projectId: string)
```

All functions use `fetch` with proper error handling.

---

## Testing Strategy

### Unit Tests
- [ ] Test project CRUD operations
- [ ] Test canvas state isolation per project
- [ ] Test WebSocket room joining/leaving
- [ ] Test project service API calls

### Integration Tests
- [ ] Create project → appears in dashboard
- [ ] Open project → loads correct objects
- [ ] Switch projects → state isolated
- [ ] Delete project → removed from list
- [ ] Multiple users on different projects → no interference

### Manual Tests
1. **Create Project Flow**:
   - Login → Dashboard
   - Click "New Project"
   - Enter name/description
   - Project appears in list

2. **Canvas Isolation**:
   - Create Project A, add shapes
   - Create Project B, add different shapes
   - Switch between projects
   - Verify objects don't mix

3. **Multi-User**:
   - User A works on Project 1
   - User B works on Project 2
   - Verify no cross-contamination

4. **Persistence**:
   - Create project, add objects
   - Restart server
   - Verify project and objects reload

---

## Database Schema

Already have `collabcanvas-projects` table from PR12! ✅

**Fields**:
- `projectId` (Primary Key)
- `ownerId` (GSI)
- `name`
- `description`
- `createdAt`
- `updatedAt`
- `thumbnailUrl` (future)
- `isPublic`

**Objects Table**:
- Partition key: `projectId`
- Sort key: `objectId`
- Already supports multi-project! ✅

---

## Success Criteria

- [ ] Users can create unlimited projects
- [ ] Dashboard shows all user's projects
- [ ] Canvas works with specific project ID
- [ ] Objects isolated per project
- [ ] URL routing works (`/canvas/:id`)
- [ ] Auto-save works for all projects
- [ ] Server restart preserves all projects
- [ ] Multiple users can work on different projects simultaneously
- [ ] No breaking changes to existing functionality
- [ ] All tests pass

---

## Migration Notes

**Breaking Changes**: Yes! (But graceful)

**Migration Strategy**:
1. Existing objects in `default-project` stay there
2. Create a "Default Project" for existing users
3. Auto-migrate `default-project` objects to new project
4. Or: Keep `default-project` as legacy, new projects use real IDs

**Recommended**: Create migration script to:
- Create default project for each user
- Migrate existing objects
- Update URLs

---

## Files to Create

### Backend
- `backend/src/http/projects.ts` - Project API endpoints
- `backend/src/middleware/auth.ts` - Authentication middleware
- `backend/src/utils/projectHelpers.ts` - Helper functions

### Frontend
- `frontend/src/pages/Dashboard.tsx` - Project list page
- `frontend/src/components/ProjectCard.tsx` - Project preview card
- `frontend/src/lib/projectService.ts` - API service
- `frontend/src/types/project.ts` - TypeScript types

---

## Files to Modify

### Backend
- `backend/src/state/canvasState.ts` - Multi-project state
- `backend/src/ws/handlers.ts` - Room management
- `backend/src/ws/index.ts` - Room setup
- `backend/src/server.ts` - Add project routes

### Frontend
- `frontend/src/pages/Canvas.tsx` - Use projectId from URL
- `frontend/src/routes/Router.tsx` - Add dashboard route
- `frontend/src/components/Header.tsx` - Show project name
- `frontend/src/lib/ws.ts` - Join project room

---

## Performance Considerations

- **Memory**: Each project has separate Map (lightweight)
- **Auto-Save**: Already batches by project (no impact)
- **WebSocket**: Rooms isolate broadcasts (better performance!)
- **Database**: Queries already scoped by projectId (efficient)

**Expected Impact**: Minimal to none, possibly faster due to isolation.

---

## Next Steps (PR15)

After PR14:
- Add collaborator invitations
- Role-based access control (owner/editor/viewer)
- Project sharing
- Project settings page

---

**This PR transforms CollabCanvas into a real multi-tenant application!** 🚀

