# Tasks: PR13 - Auto-Save System & Multi-Container Support

**Branch**: `pr13-autosave-multicontainer`  
**Status**: ✅ Complete  
**Started**: October 16, 2025  
**Completed**: October 16, 2025  
**Timeline**: 1 day

---

## Relevant Files

### New Files to Create
- `backend/src/state/dirtyFlags.ts` - Track which projects need saving
- `backend/src/workers/autoSaveWorker.ts` - Background worker that saves every 5 seconds
- `backend/src/monitoring/autoSaveMetrics.ts` - Track save performance metrics

### Files to Modify
- `backend/src/state/canvasState.ts` - Remove immediate DB writes, add dirty flags
- `backend/src/services/objectService.ts` - Add batch sync function
- `backend/src/server.ts` - Start auto-save worker on startup
- `backend/src/http/health.ts` - Add auto-save status to health endpoint

---

## Tasks

- [ ] 1.0 Create Dirty Flag System
  - [ ] 1.1 Create `dirtyFlags.ts` with Map data structure
  - [ ] 1.2 Implement `markDirty(projectId)` function
  - [ ] 1.3 Implement `isDirty(projectId)` function
  - [ ] 1.4 Implement `clearDirty(projectId)` function
  - [ ] 1.5 Implement `getDirtyProjects()` function
  - [ ] 1.6 Add timestamp tracking for each dirty project

- [ ] 2.0 Create Auto-Save Worker
  - [ ] 2.1 Create `autoSaveWorker.ts` file structure
  - [ ] 2.2 Implement 5-second interval timer
  - [ ] 2.3 Implement main save loop (get dirty projects, save each)
  - [ ] 2.4 Add error handling (log but don't crash)
  - [ ] 2.5 Implement `startAutoSaveWorker()` function
  - [ ] 2.6 Implement `stopAutoSaveWorker()` function
  - [ ] 2.7 Add graceful shutdown handling

- [ ] 3.0 Update Canvas State for Batching
  - [ ] 3.1 Remove `saveToDatabaseAsync()` calls from `createObject()`
  - [ ] 3.2 Remove `saveToDatabaseAsync()` calls from `updateObject()`
  - [ ] 3.3 Add `markDirty()` calls after object modifications
  - [ ] 3.4 Keep in-memory writes (no changes to memory logic)
  - [ ] 3.5 Add function to get all objects for a project

- [ ] 4.0 Enhance Object Service
  - [ ] 4.1 Create `syncProjectObjects()` function
  - [ ] 4.2 Implement batch write logic (25 per batch)
  - [ ] 4.3 Add error handling for partial failures
  - [ ] 4.4 Return success/failure statistics

- [ ] 5.0 Create Metrics System
  - [ ] 5.1 Create `autoSaveMetrics.ts` file
  - [ ] 5.2 Track total saves performed
  - [ ] 5.3 Track total objects saved
  - [ ] 5.4 Track average save latency
  - [ ] 5.5 Track success/failure rates
  - [ ] 5.6 Track last save timestamp per project

- [ ] 6.0 Add Metrics Endpoint
  - [ ] 6.1 Create `/metrics` HTTP endpoint
  - [ ] 6.2 Return JSON with auto-save metrics
  - [ ] 6.3 Include dirty project count
  - [ ] 6.4 Include worker status (running/stopped)

- [ ] 7.0 Integrate Auto-Save into Server
  - [ ] 7.1 Import auto-save worker in `server.ts`
  - [ ] 7.2 Start worker after DB initialization
  - [ ] 7.3 Add shutdown handling to stop worker
  - [ ] 7.4 Update health check to include auto-save status

- [ ] 8.0 Multi-Container Cache Strategy
  - [ ] 8.1 Add `getObjectWithFallback()` function
  - [ ] 8.2 Check memory cache first
  - [ ] 8.3 Load from DB on cache miss
  - [ ] 8.4 Populate memory cache after DB load

- [ ] 9.0 Testing & Verification
  - [ ] 9.1 Test auto-save runs every 5 seconds
  - [ ] 9.2 Test dirty flag lifecycle (mark → save → clear)
  - [ ] 9.3 Test batch writing with 50+ objects
  - [ ] 9.4 Test metrics endpoint returns correct data
  - [ ] 9.5 Test graceful shutdown stops worker
  - [ ] 9.6 Test multi-container scenario (simulate 2 servers)

---

## Notes

- **Auto-save interval**: 5 seconds (configurable)
- **Batch size**: 25 objects per DynamoDB batch (AWS limit)
- **Strategy**: Mark dirty in memory, batch save periodically
- **Performance**: 90%+ reduction in DB writes vs immediate writes
- **Multi-container**: Multiple backends share DynamoDB state

## Success Metrics

- Auto-save success rate > 99%
- Save latency < 200ms per batch
- DB write operations reduced by 90%+
- Worker runs reliably every 5 seconds
- Zero data loss in normal operations

