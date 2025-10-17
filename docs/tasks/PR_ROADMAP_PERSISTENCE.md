# PR Roadmap: Persistence & Collaboration

**Goal**: Transform CollabCanvas from in-memory prototype to production-ready application  
**Timeline**: 4-6 weeks  
**Architecture**: DynamoDB (persistence) + Redis (speed) + Multi-project support

---

## PR12: DynamoDB Foundation & Basic Persistence

**Branch**: `pr12-dynamodb-foundation`  
**Timeline**: 3-4 days  
**Priority**: Critical - Enables all future persistence work

### Objectives:
- Set up DynamoDB tables for production persistence
- Create database service layer in backend
- Implement basic save/load operations
- Keep existing in-memory system working in parallel

### Tasks:

**1. AWS DynamoDB Setup**
- Create four DynamoDB tables with proper keys and indexes
- Configure pay-per-request billing mode
- Set up encryption and backup policies
- Create IAM roles and access policies

**2. Backend Database Service**
- Create database service module for DynamoDB operations
- Implement project CRUD operations
- Implement canvas object persistence
- Add error handling and logging

**3. Dual-Write System**
- Keep existing in-memory state working
- Add parallel writes to DynamoDB
- Log any database errors without affecting users
- Verify data integrity between memory and database

**4. Basic Load on Startup**
- Load existing projects from DynamoDB on server start
- Populate in-memory cache from database
- Handle empty database gracefully
- Add health check for database connection

**5. Environment Configuration**
- Add AWS credentials to environment variables
- Configure DynamoDB region and table names
- Add database connection pooling
- Set up proper error logging

### Success Criteria:
- DynamoDB tables created and accessible
- Objects save to database without user impact
- Server can restart and reload data from DynamoDB
- Zero breaking changes to existing functionality
- All existing tests still pass

### Files to Create/Modify:
- `backend/src/db/dynamodb.ts` - DynamoDB client setup
- `backend/src/services/projectService.ts` - Project operations
- `backend/src/services/objectService.ts` - Object operations
- `backend/src/state/canvasState.ts` - Add DB writes
- `backend/.env.example` - Add AWS config

---

## PR13: Auto-Save System & Multi-Container Support

**Branch**: `pr13-autosave-multicontainer`  
**Timeline**: 2-3 days  
**Priority**: High - Enables horizontal scaling

### Objectives:
- Implement automatic background saving every 5 seconds
- Enable multiple backend containers to share state
- Add dirty flag tracking for modified projects
- Ensure data consistency across containers

### Tasks:

**1. Auto-Save Worker**
- Create background worker that runs every 5 seconds
- Check for projects with dirty flags
- Batch write modified objects to DynamoDB
- Clear dirty flags after successful save
- Log save metrics and errors

**2. Dirty Flag System**
- Mark projects as dirty when objects change
- Track modification timestamps
- Batch multiple changes in 5-second window
- Clear flags after successful database write

**3. Multi-Container State Sync**
- Load fresh data from DynamoDB on cache miss
- Implement eventual consistency model
- Handle concurrent updates gracefully
- Add version numbers to prevent conflicts

**4. Monitoring & Logging**
- Log auto-save success/failure rates
- Track save latency metrics
- Alert on repeated save failures
- Dashboard for database health

### Success Criteria:
- Auto-save runs reliably every 5 seconds
- Multiple backend containers share same database
- No data loss during normal operations
- Conflicts resolved automatically
- Save latency under 100ms per batch

### Files to Create/Modify:
- `backend/src/workers/autoSaveWorker.ts` - Background save process
- `backend/src/state/dirtyFlags.ts` - Track modifications
- `backend/src/utils/conflictResolution.ts` - Handle conflicts
- `backend/src/monitoring/metrics.ts` - Performance tracking

---

## PR14: Multi-Project Support & Dashboard

**Branch**: `pr14-multiproject-dashboard`  
**Timeline**: 4-5 days  
**Priority**: High - Core feature for production

### Objectives:
- Add project management system
- Create dashboard UI for project list
- Implement project creation and deletion
- Update canvas to work with specific projects

### Tasks:

**1. Backend Project Management**
- API endpoint to create new project
- API endpoint to list user's projects
- API endpoint to delete project
- API endpoint to get project details
- Add project ownership validation

**2. Database Schema Updates**
- Add Projects table operations
- Link canvas objects to specific projects
- Add project metadata (name, description, thumbnail)
- Implement soft delete for projects

**3. Frontend Dashboard Page**
- Create new dashboard route and component
- Display grid of user's projects
- Show project thumbnails (placeholder initially)
- Add "Create New Project" button
- Click project to navigate to canvas

**4. Update Canvas Page**
- Load specific project by ID from URL
- Show project name in header
- Update WebSocket to use project-scoped rooms
- Save objects to correct project

**5. Navigation & Routing**
- Add dashboard route
- Update login redirect to dashboard
- Add "Back to Dashboard" navigation
- Handle invalid project IDs gracefully

### Success Criteria:
- Users can create unlimited projects
- Dashboard loads all projects under 2 seconds
- Canvas works with specific project ID
- Projects can be deleted safely
- URL reflects current project ID

### Files to Create/Modify:
- `backend/src/http/projects.ts` - Project API endpoints
- `frontend/src/pages/Dashboard.tsx` - Project list UI
- `frontend/src/pages/Canvas.tsx` - Update for project ID
- `frontend/src/components/ProjectCard.tsx` - Project preview
- `frontend/src/routes/Router.tsx` - Add dashboard route

---

## PR15: Collaboration & Role-Based Access

**Branch**: `pr15-collaboration-rbac`  
**Timeline**: 4-5 days  
**Priority**: Medium - Essential for team features

### Objectives:
- Implement role-based access control (owner, editor, viewer)
- Add collaborator invitation system
- Create project settings page
- Add per-project presence tracking

### Tasks:

**1. Collaborators Table & API**
- Create collaborators API endpoints
- Implement invite collaborator endpoint
- Implement remove collaborator endpoint
- List all collaborators for project
- Check user access before operations

**2. Role-Based Access Control**
- Define three roles: owner, editor, viewer
- Implement permission checking middleware
- Restrict operations based on role
- Enforce owner-only operations

**3. Project Settings UI**
- Create project settings page
- Show collaborator list with roles
- Add collaborator by email input
- Remove collaborator button (owner only)
- Change project name and description

**4. Enhanced Canvas Presence**
- Scope presence to specific project
- Show active collaborators in header
- Display role badges next to names
- Update cursor colors per project

**5. Invitation Flow**
- Generate invitation tokens
- Email notification system (basic)
- Accept invitation workflow
- Project appears in invitee's dashboard

### Success Criteria:
- Owners can invite editors and viewers
- Viewers cannot modify canvas
- Editors can modify but not delete project
- Collaborators see project in dashboard
- Real-time presence scoped to project

### Files to Create/Modify:
- `backend/src/http/collaborators.ts` - Collaboration API
- `backend/src/middleware/rbac.ts` - Role checking
- `frontend/src/pages/ProjectSettings.tsx` - Settings UI
- `frontend/src/components/CollaboratorList.tsx` - Show team
- `backend/src/services/collaboratorService.ts` - Invite logic

---

## PR16: Redis Cache Layer

**Branch**: `pr16-redis-cache`  
**Timeline**: 3-4 days  
**Priority**: Medium - Performance optimization

### Objectives:
- Add Redis for fast caching and pub/sub
- Implement cache-first read strategy
- Use Redis pub/sub for real-time events
- Maintain DynamoDB as source of truth

### Tasks:

**1. Redis Setup & Integration**
- Set up AWS ElastiCache Redis instance
- Create Redis client in backend
- Implement connection pooling
- Add health checks for Redis

**2. Cache Layer Implementation**
- Cache active project objects in Redis
- Implement read-through caching pattern
- Set expiration on inactive projects (1 hour)
- Warm cache on project open

**3. Redis Pub/Sub for Events**
- Replace direct WebSocket broadcasts
- Publish events to Redis channels
- Subscribe all backend containers to channels
- Broadcast to connected users from any container

**4. Presence in Redis**
- Store user presence in Redis (fast updates)
- Expire presence keys after 30 seconds
- Use Redis sets for active user lists
- Publish presence updates via pub/sub

**5. Write-Through Caching**
- Write to Redis immediately (1-2ms)
- Mark project as dirty for DynamoDB save
- Auto-save syncs Redis to DynamoDB
- Handle cache invalidation properly

### Success Criteria:
- Cache hit rate above 90% for active projects
- Read latency under 5ms for cached data
- Pub/sub broadcasts to all containers instantly
- Presence updates in real-time
- System works if Redis temporarily fails

### Files to Create/Modify:
- `backend/src/cache/redis.ts` - Redis client setup
- `backend/src/services/cacheService.ts` - Caching logic
- `backend/src/ws/pubsub.ts` - Pub/sub implementation
- `backend/src/state/presenceState.ts` - Redis presence
- `backend/src/middleware/cacheMiddleware.ts` - Cache layer

---

## PR17: Performance Optimizations & Monitoring

**Branch**: `pr17-performance-monitoring`  
**Timeline**: 2-3 days  
**Priority**: Low - Polish and observability

### Objectives:
- Add comprehensive performance monitoring
- Optimize database queries and caching
- Implement request tracing
- Create admin dashboard for metrics

### Tasks:

**1. Performance Metrics**
- Track database query latency
- Track cache hit/miss rates
- Track WebSocket message latency
- Track auto-save performance

**2. Optimization**
- Batch database operations where possible
- Implement lazy loading for large projects
- Add pagination for project lists
- Optimize Redis memory usage

**3. Monitoring Dashboard**
- Display real-time metrics
- Show active user count
- Show database health
- Show cache performance
- Alert on errors and slowness

**4. Request Tracing**
- Add unique request IDs
- Log full request lifecycle
- Trace cross-service calls
- Debug tool for production issues

**5. Cost Optimization**
- Analyze DynamoDB and Redis usage
- Optimize table indexes for queries
- Reduce unnecessary database calls
- Monitor and optimize costs

### Success Criteria:
- All operations logged with timing
- Dashboard shows real-time metrics
- Average response time under 50ms
- Database queries optimized
- Monthly costs within budget

### Files to Create/Modify:
- `backend/src/monitoring/metrics.ts` - Metrics collection
- `backend/src/monitoring/dashboard.ts` - Admin UI
- `backend/src/utils/tracing.ts` - Request tracing
- `frontend/src/pages/AdminDashboard.tsx` - Metrics UI
- `backend/src/utils/optimizer.ts` - Performance tuning

---

## Estimated Timeline & Costs

### Implementation Schedule:
- **Week 1**: PR12 - DynamoDB Foundation (3-4 days)
- **Week 2**: PR13 - Auto-Save (2-3 days) + PR14 start
- **Week 3**: PR14 - Multi-Project (4-5 days total)
- **Week 4**: PR15 - Collaboration (4-5 days)
- **Week 5**: PR16 - Redis Cache (3-4 days)
- **Week 6**: PR17 - Performance (2-3 days)

**Total**: 18-24 days of work

### Monthly Costs (1000 active users):
- **DynamoDB**: ~$11/month
- **Redis ElastiCache (t4g.small)**: ~$24/month
- **Total**: ~$35/month

### Cost Scaling (10,000 users):
- **DynamoDB**: ~$110/month
- **Redis**: ~$48/month (upgrade to t4g.medium)
- **Total**: ~$158/month

---

## Testing Strategy

### For Each PR:
1. **Unit Tests**: Test individual functions
2. **Integration Tests**: Test database operations
3. **E2E Tests**: Test full user workflows
4. **Load Tests**: Verify performance under load
5. **Manual Testing**: Real-world usage scenarios

### Critical Test Scenarios:
- Create project, add objects, reload page
- Multiple users editing same project
- Server restart with data persistence
- Simultaneous edits from different users
- Network interruption and reconnection
- Cache failures and fallback to database

---

## Migration & Rollback Plan

### Phase 1: Add Persistence (PR12-PR13)
- Dual-write to memory and database
- Can rollback by disabling database writes
- Zero user-facing changes
- Monitor for errors

### Phase 2: Add Projects (PR14-PR15)
- New features, opt-in initially
- Old single-canvas mode still works
- Gradual migration of users
- Feature flag controlled

### Phase 3: Add Redis (PR16)
- Transparent performance improvement
- System falls back to DynamoDB if Redis fails
- Can disable caching easily
- Monitor cache hit rates

### Phase 4: Production (PR17)
- Full monitoring and optimization
- System battle-tested
- Cost monitoring active
- Ready for scale

---

## Success Metrics

### Technical Metrics:
- ✅ Zero data loss during normal operations
- ✅ 99.9% uptime for database operations
- ✅ Average response time under 50ms
- ✅ Cache hit rate above 90%
- ✅ Auto-save runs reliably every 5 seconds

### User Experience Metrics:
- ✅ Canvas loads in under 2 seconds
- ✅ Presence updates in real-time (under 100ms)
- ✅ Can create unlimited projects
- ✅ Collaboration works smoothly
- ✅ No lag when dragging objects

### Business Metrics:
- ✅ Monthly costs under $50 for 1000 users
- ✅ System scales to 10,000 users
- ✅ Can handle 100 concurrent users per project
- ✅ Multi-container deployment works
- ✅ Production-ready architecture

---

**This roadmap transforms CollabCanvas into an enterprise-ready collaborative canvas platform!** 🚀

