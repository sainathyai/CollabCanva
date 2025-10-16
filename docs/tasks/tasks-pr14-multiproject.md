# Tasks: PR14 - Multi-Project Support & Dashboard

**Branch**: `pr14-multiproject-dashboard`
**Status**: Not Started
**Timeline**: 3-4 days

---

## Relevant Files

### Backend - New Files
- `backend/src/http/projects.ts` - Project CRUD API endpoints
- `backend/src/middleware/auth.ts` - Authentication middleware
- `backend/src/utils/projectHelpers.ts` - Helper functions

### Backend - Modified Files
- `backend/src/state/canvasState.ts` - Multi-project canvas state
- `backend/src/ws/handlers.ts` - Project room management
- `backend/src/ws/index.ts` - Room setup
- `backend/src/server.ts` - Add project API routes

### Frontend - New Files
- `frontend/src/pages/Dashboard.tsx` - Project list page
- `frontend/src/components/ProjectCard.tsx` - Project preview card
- `frontend/src/components/CreateProjectModal.tsx` - New project modal
- `frontend/src/lib/projectService.ts` - Project API service
- `frontend/src/types/project.ts` - TypeScript interfaces

### Frontend - Modified Files
- `frontend/src/pages/Canvas.tsx` - Use projectId from URL
- `frontend/src/routes/Router.tsx` - Add dashboard route
- `frontend/src/components/Header.tsx` - Show project name, add back button
- `frontend/src/lib/ws.ts` - Join project room

### Test Files
- `backend/src/http/__tests__/projects.test.ts` - API endpoint tests
- `backend/test-multiproject.mjs` - Integration test

---

## Tasks

- [ ] 1.0 Backend: Project API Endpoints
  - [ ] 1.1 Create `backend/src/http/projects.ts` file structure
  - [ ] 1.2 Implement `POST /api/projects` (create project)
  - [ ] 1.3 Implement `GET /api/projects` (list projects by user)
  - [ ] 1.4 Implement `GET /api/projects/:id` (get single project)
  - [ ] 1.5 Implement `PUT /api/projects/:id` (update project)
  - [ ] 1.6 Implement `DELETE /api/projects/:id` (soft delete)
  - [ ] 1.7 Add error handling and validation

- [ ] 2.0 Backend: Update Canvas State for Multi-Project
  - [ ] 2.1 Change single Map to Map of Maps (per-project storage)
  - [ ] 2.2 Add `getProjectCanvas(projectId)` helper function
  - [ ] 2.3 Update `createObject()` to accept projectId parameter
  - [ ] 2.4 Update `updateObject()` to accept projectId parameter
  - [ ] 2.5 Update `deleteObject()` to accept projectId parameter
  - [ ] 2.6 Update `getAllObjects()` to filter by projectId
  - [ ] 2.7 Update `loadFromDatabase()` to support specific project

- [ ] 3.0 Backend: WebSocket Room Management
  - [ ] 3.1 Add `project.join` message type
  - [ ] 3.2 Add `project.leave` message type
  - [ ] 3.3 Store current projectId on WebSocket connection
  - [ ] 3.4 Update broadcasts to scope by project room
  - [ ] 3.5 Handle room switching
  - [ ] 3.6 Send project-specific initial state

- [ ] 4.0 Backend: Update Auto-Save for Multi-Project
  - [ ] 4.1 Verify auto-save works with multiple projects
  - [ ] 4.2 Test dirty flags per project
  - [ ] 4.3 Ensure batch saves handle all projects

- [ ] 5.0 Backend: Integrate API Routes
  - [ ] 5.1 Add project routes to `server.ts`
  - [ ] 5.2 Add authentication middleware
  - [ ] 5.3 Add CORS headers for API routes
  - [ ] 5.4 Test all endpoints with curl

- [ ] 6.0 Frontend: Project API Service
  - [ ] 6.1 Create `frontend/src/lib/projectService.ts`
  - [ ] 6.2 Implement `createProject(name, description)`
  - [ ] 6.3 Implement `getProjects(userId)`
  - [ ] 6.4 Implement `getProject(projectId)`
  - [ ] 6.5 Implement `updateProject(projectId, updates)`
  - [ ] 6.6 Implement `deleteProject(projectId)`

- [ ] 7.0 Frontend: Dashboard Page
  - [ ] 7.1 Create `Dashboard.tsx` component structure
  - [ ] 7.2 Fetch and display user's projects
  - [ ] 7.3 Add "Create Project" button
  - [ ] 7.4 Implement create project modal
  - [ ] 7.5 Add project card grid layout
  - [ ] 7.6 Handle empty state (no projects)
  - [ ] 7.7 Add loading state

- [ ] 8.0 Frontend: ProjectCard Component
  - [ ] 8.1 Create `ProjectCard.tsx` component
  - [ ] 8.2 Display project name and description
  - [ ] 8.3 Display last modified date
  - [ ] 8.4 Add placeholder thumbnail
  - [ ] 8.5 Add click handler to open project
  - [ ] 8.6 Add delete button with confirmation
  - [ ] 8.7 Add hover effects

- [ ] 9.0 Frontend: Update Canvas Page
  - [ ] 9.1 Get projectId from URL params
  - [ ] 9.2 Fetch project details on mount
  - [ ] 9.3 Show project name in header
  - [ ] 9.4 Send `project.join` message after auth
  - [ ] 9.5 Handle invalid projectId (404)
  - [ ] 9.6 Add "Back to Dashboard" button

- [ ] 10.0 Frontend: Update Router
  - [ ] 10.1 Add `/dashboard` route
  - [ ] 10.2 Update `/canvas/:projectId` route
  - [ ] 10.3 Add protected route logic
  - [ ] 10.4 Update login redirect to dashboard
  - [ ] 10.5 Handle navigation between pages

- [ ] 11.0 Frontend: Update Header Component
  - [ ] 11.1 Accept projectName prop
  - [ ] 11.2 Display project name
  - [ ] 11.3 Add "Back to Dashboard" button
  - [ ] 11.4 Style updates

- [ ] 12.0 Testing: Backend Integration
  - [ ] 12.1 Test create project API
  - [ ] 12.2 Test list projects API
  - [ ] 12.3 Test get project API
  - [ ] 12.4 Test update project API
  - [ ] 12.5 Test delete project API
  - [ ] 12.6 Test project isolation (objects don't mix)

- [ ] 13.0 Testing: Frontend Integration
  - [ ] 13.1 Test dashboard loads projects
  - [ ] 13.2 Test create project flow
  - [ ] 13.3 Test opening project navigates to canvas
  - [ ] 13.4 Test objects save to correct project
  - [ ] 13.5 Test switching between projects
  - [ ] 13.6 Test delete project

- [ ] 14.0 Testing: End-to-End
  - [ ] 14.1 Create 2 projects with different objects
  - [ ] 14.2 Verify objects don't mix between projects
  - [ ] 14.3 Restart server
  - [ ] 14.4 Verify both projects and objects persist
  - [ ] 14.5 Test multi-user on different projects

---

## Notes

- **Project Isolation**: Each project has completely separate canvas state
- **WebSocket Rooms**: Users only see updates for their current project
- **Auto-Save**: Already supports multiple projects (no changes needed!)
- **URL Structure**: `/canvas/:projectId` for direct project access
- **Default Project**: Existing objects stay in "default-project"

## Success Metrics

- Users can create unlimited projects
- Dashboard loads under 2 seconds
- Objects 100% isolated per project
- Auto-save works for all projects
- Server restart preserves everything
- No breaking changes to existing functionality

