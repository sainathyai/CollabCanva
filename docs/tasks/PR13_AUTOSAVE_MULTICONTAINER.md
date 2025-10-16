# PR13: Auto-Save System & Multi-Container Support

**Branch**: `pr13-autosave-multicontainer`  
**Timeline**: 2-3 days  
**Priority**: High - Enables horizontal scaling  
**Status**: Not Started

---

## Overview

Implement automatic background saving every 5 seconds and enable multiple backend containers to share state through DynamoDB. This unlocks horizontal scaling and production deployment.

**Key Principle**: In-memory for speed, periodic sync to database for persistence.

---

## Problem Statement

Currently:
- ❌ Objects only save to DB on creation/update (immediate dual-write)
- ❌ High DB write load (every single change triggers a write)
- ❌ Multiple backend containers would conflict without coordination
- ❌ No batching of writes (inefficient for DynamoDB)

After PR13:
- ✅ Objects batch-saved every 5 seconds (reduce DB load)
- ✅ Multiple containers share state through DynamoDB
- ✅ Dirty flag tracking (only save what changed)
- ✅ Efficient batch writes (up to 25 items per batch)

---

## Architecture

### Auto-Save Worker Flow
```
Every 5 seconds:
  1. Check for projects with dirty flags
  2. Collect all modified objects in project
  3. Batch write to DynamoDB (up to 25 at a time)
  4. Clear dirty flags on success
  5. Log metrics (objects saved, latency, errors)
```

### Multi-Container State Sync
```
Container A:                    Container B:
User edits object          →    Cache miss on read
Mark dirty                      Load from DynamoDB  →
Write to memory                 Populate cache
                                User sees latest data
↓ (5 seconds)
Auto-save to DB  →  DynamoDB  ←  Both containers sync
```

---

## Tasks Breakdown

### Task 1: Dirty Flag System

**Create**: `backend/src/state/dirtyFlags.ts`

**Functionality**:
- Track which projects have unsaved changes
- Track modification timestamps per project
- Provide `markDirty(projectId)` function
- Provide `isDirty(projectId)` function
- Provide `clearDirty(projectId)` function
- Provide `getDirtyProjects()` function

**Data Structure**:
```typescript
Map<projectId, lastModifiedTimestamp>
```

---

### Task 2: Auto-Save Worker

**Create**: `backend/src/workers/autoSaveWorker.ts`

**Functionality**:
- Run every 5 seconds using `setInterval`
- Get list of dirty projects
- For each dirty project:
  - Get all objects from memory
  - Batch write to DynamoDB (25 per batch)
  - Clear dirty flag on success
  - Log errors but continue to next project
- Track metrics (saves per minute, average latency)

**Pseudo-code**:
```typescript
setInterval(async () => {
  const dirtyProjects = getDirtyProjects()
  
  for (const projectId of dirtyProjects) {
    try {
      const objects = getAllObjectsForProject(projectId)
      await saveObjects(projectId, objects)  // Batch write
      clearDirty(projectId)
      logSuccess(projectId, objects.length)
    } catch (error) {
      logError(projectId, error)
    }
  }
}, 5000)
```

---

### Task 3: Update Canvas State to Use Dirty Flags

**Modify**: `backend/src/state/canvasState.ts`

**Changes**:
1. Remove immediate DB writes from `createObject()` and `updateObject()`
2. Keep in-memory writes (fast user response)
3. Mark project as dirty after any modification
4. Let auto-save worker handle DB writes

**Before (PR12)**:
```typescript
export function createObject(object: CanvasObject) {
  canvasObjects.set(object.id, object)
  saveToDatabaseAsync(object)  // Immediate write
  return object
}
```

**After (PR13)**:
```typescript
export function createObject(object: CanvasObject) {
  canvasObjects.set(object.id, object)
  markDirty(DEFAULT_PROJECT_ID)  // Just mark dirty
  return object
}
```

---

### Task 4: Enhanced Object Service for Batch Operations

**Modify**: `backend/src/services/objectService.ts`

**Add New Function**:
```typescript
/**
 * Replace all objects for a project (full sync)
 * Used by auto-save to batch write all objects
 */
export async function syncProjectObjects(
  projectId: string,
  objects: CanvasObject[]
): Promise<void>
```

**Logic**:
1. Delete all existing objects for project (optional optimization)
2. Batch write all new objects (25 per batch)
3. Return success/failure

---

### Task 5: Monitoring & Metrics

**Create**: `backend/src/monitoring/autoSaveMetrics.ts`

**Track**:
- Total projects auto-saved
- Total objects saved per minute
- Average save latency
- Save success/failure rate
- Last save timestamp per project

**Expose Metrics**:
- Add `/metrics` HTTP endpoint
- Return JSON with current metrics
- Useful for monitoring dashboard

---

### Task 6: Initialize Auto-Save on Server Start

**Modify**: `backend/src/server.ts`

**Changes**:
- Import and start auto-save worker after DB initialization
- Log auto-save worker status
- Handle graceful shutdown (stop worker)

```typescript
import { startAutoSaveWorker, stopAutoSaveWorker } from './workers/autoSaveWorker.js'

// After database initialization
startAutoSaveWorker()
logger.info('✅ Auto-save worker started (5 second interval)')

// In shutdown handlers
process.on('SIGTERM', () => {
  stopAutoSaveWorker()
  // ... rest of shutdown
})
```

---

### Task 7: Multi-Container Cache Strategy

**Add**: Load-from-DB on cache miss

**Current**: All objects always in memory (single container assumption)

**New**: Load from DB if not in memory cache

**Modify**: `backend/src/state/canvasState.ts`

**Add Function**:
```typescript
/**
 * Get object from memory, or load from DB if not cached
 */
export async function getObjectWithFallback(id: string): Promise<CanvasObject | null> {
  // Try memory first
  const cached = canvasObjects.get(id)
  if (cached) return cached
  
  // Load from database
  const objects = await loadFromDatabase(DEFAULT_PROJECT_ID)
  // Now in cache
  return canvasObjects.get(id) || null
}
```

**Usage**: When a WebSocket message references an object not in cache, load it from DB.

---

### Task 8: Testing & Verification

**Manual Tests**:

1. **Auto-Save Test**:
   - Create 10 objects quickly
   - Wait 6 seconds
   - Check DynamoDB - all 10 objects should be there
   - Check logs - should show successful auto-save

2. **Dirty Flag Test**:
   - Create object → project marked dirty
   - Wait for auto-save → project no longer dirty
   - Verify no unnecessary saves if nothing changed

3. **Batch Write Test**:
   - Create 50 objects
   - Wait for auto-save
   - Check logs - should show multiple batches (25 per batch)

4. **Multi-Container Simulation**:
   - Start two backend servers (different ports)
   - Create objects in Container A
   - Wait for auto-save (5 sec)
   - Read from Container B - should see objects

**Integration Tests**:
- Test auto-save worker start/stop
- Test dirty flag lifecycle
- Test batch write with failures
- Test cache miss fallback to DB

---

## Success Criteria

- ✅ Auto-save worker runs every 5 seconds
- ✅ Only modified projects trigger saves
- ✅ Batch writes reduce DB operations by 90%+
- ✅ Multiple containers can read same data
- ✅ Objects appear in DynamoDB within 5 seconds of creation
- ✅ No immediate DB writes (except on server start)
- ✅ Metrics show save success rate > 99%
- ✅ Save latency < 200ms per batch

---

## Files to Create

- `backend/src/state/dirtyFlags.ts` - Dirty flag tracking
- `backend/src/workers/autoSaveWorker.ts` - Background save process
- `backend/src/monitoring/autoSaveMetrics.ts` - Metrics tracking

---

## Files to Modify

- `backend/src/state/canvasState.ts` - Remove immediate writes, add dirty flags
- `backend/src/services/objectService.ts` - Add sync function
- `backend/src/server.ts` - Start auto-save worker
- `backend/src/http/health.ts` - Add auto-save status to health check

---

## Performance Impact

### Before (PR12):
- Every object create/update: 1 DB write (~50-100ms)
- 100 edits = 100 DB writes = high latency spikes

### After (PR13):
- Every object create/update: Memory write only (~1ms)
- 100 edits = 1 batch DB write every 5 seconds
- **90-95% reduction in DB write operations**

---

## Migration Notes

**Breaking Changes**: None!

**Deployment**:
1. Deploy new backend with auto-save
2. Existing data continues to work
3. New objects auto-save every 5 seconds
4. Can roll back safely (objects still in DB)

**Monitoring**:
- Watch auto-save metrics for first 24 hours
- Check for save failures
- Verify batch sizes are optimal
- Adjust interval if needed (5 seconds is tunable)

---

## Next Steps (PR14)

After PR13 is complete:
- Add multi-project support in frontend
- Create dashboard for project management
- Update WebSocket to use project-scoped rooms
- Add project creation/deletion APIs

---

**This PR enables production-ready horizontal scaling!** 🚀

