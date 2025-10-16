# PR12: DynamoDB Foundation & Basic Persistence

**Branch**: `pr12-dynamodb-foundation`  
**Timeline**: 3-4 days  
**Status**: Not Started

---

## Overview

Set up DynamoDB tables and implement basic persistence layer. This PR creates the foundation for all future persistence work while keeping the existing in-memory system working.

**Key Principle**: Dual-write strategy - write to both memory and database, read from memory for speed.

---

## AWS DynamoDB Table Setup

### Table 1: Projects

**Table Name**: `collabcanvas-projects`  
**Primary Key**: `projectId` (String)

**Attributes**:
- projectId: Unique project identifier
- ownerId: User ID of project owner
- name: Project name
- description: Project description
- createdAt: ISO timestamp
- updatedAt: ISO timestamp
- thumbnailUrl: S3 URL for preview image (future)
- isPublic: Boolean for public/private

**Indexes**:
- GSI: ownerId-createdAt-index (query projects by owner)

**Settings**:
- Billing Mode: Pay per request
- Encryption: AWS managed
- Point-in-time recovery: Enabled

---

### Table 2: CanvasObjects

**Table Name**: `collabcanvas-objects`  
**Primary Key**: 
- Partition Key: `projectId` (String)
- Sort Key: `objectId` (String)

**Attributes**:
- projectId: Links object to project
- objectId: Unique object identifier
- type: Shape type (rectangle, circle, etc.)
- x, y: Position coordinates
- width, height: Dimensions
- rotation: Rotation angle
- color: Fill color
- text: Text content (for text objects)
- fontSize: Font size (for text)
- fontFamily: Font family (for text)
- createdAt: ISO timestamp
- updatedAt: ISO timestamp
- createdBy: User ID who created object

**Settings**:
- Billing Mode: Pay per request
- Encryption: AWS managed

---

### Table 3: Collaborators

**Table Name**: `collabcanvas-collaborators`  
**Primary Key**:
- Partition Key: `projectId` (String)
- Sort Key: `userId` (String)

**Attributes**:
- projectId: Links to project
- userId: User being given access
- role: owner | editor | viewer
- invitedBy: User ID who invited them
- invitedAt: ISO timestamp
- acceptedAt: ISO timestamp (null if pending)

**Indexes**:
- GSI: userId-projectId-index (query projects by user)

**Settings**:
- Billing Mode: Pay per request
- Encryption: AWS managed

---

### Table 4: Users (Optional for now)

**Table Name**: `collabcanvas-users`  
**Primary Key**: `userId` (String)

**Attributes**:
- userId: Firebase UID
- email: User email
- displayName: User name
- photoURL: Profile picture URL
- createdAt: ISO timestamp
- lastLoginAt: ISO timestamp

**Settings**:
- Billing Mode: Pay per request
- Encryption: AWS managed

---

## Backend Implementation

### File Structure

```
backend/src/
  db/
    dynamodb.ts          - DynamoDB client setup
    tables.ts            - Table name constants
  services/
    projectService.ts    - Project CRUD operations
    objectService.ts     - Canvas object operations
    collaboratorService.ts - Collaborator management
  state/
    canvasState.ts       - Enhanced with DB writes
  utils/
    dbLogger.ts          - Database operation logging
```

---

## Task Breakdown

### Task 1: AWS Infrastructure Setup

**What to do**:
- Log into AWS Console
- Navigate to DynamoDB service
- Create four tables with specifications above
- Create IAM role with DynamoDB permissions
- Generate access key and secret for backend

**Verification**:
- All four tables visible in AWS Console
- Tables show "Active" status
- IAM credentials generated successfully

---

### Task 2: Backend Database Client

**File**: `backend/src/db/dynamodb.ts`

**What to create**:
- Initialize AWS SDK DynamoDB client
- Configure region and credentials from environment
- Export configured client instance
- Add connection health check function
- Add error handling for connection failures

**Environment Variables Needed**:
```
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
DYNAMODB_PROJECTS_TABLE=collabcanvas-projects
DYNAMODB_OBJECTS_TABLE=collabcanvas-objects
DYNAMODB_COLLABORATORS_TABLE=collabcanvas-collaborators
DYNAMODB_USERS_TABLE=collabcanvas-users
```

---

### Task 3: Project Service

**File**: `backend/src/services/projectService.ts`

**Functions to implement**:

**createProject(ownerId, name, description)**
- Generate unique projectId
- Create project record in DynamoDB
- Return project object
- Handle errors gracefully

**getProject(projectId)**
- Query project by ID from DynamoDB
- Return project data or null
- Cache result in memory for speed

**getUserProjects(userId)**
- Query projects where user is owner or collaborator
- Use GSI for efficient query
- Return array of project objects
- Sort by most recently updated

**updateProject(projectId, updates)**
- Update project name or description
- Update updatedAt timestamp
- Return updated project

**deleteProject(projectId)**
- Soft delete: set deletedAt timestamp
- Don't actually remove from database
- Remove from memory cache

---

### Task 4: Object Service

**File**: `backend/src/services/objectService.ts`

**Functions to implement**:

**saveObject(projectId, object)**
- Write single object to DynamoDB
- Include projectId and objectId in key
- Set timestamps
- Log any errors

**saveObjects(projectId, objects)**
- Batch write multiple objects (up to 25 at a time)
- Split into multiple batches if needed
- Use DynamoDB batch write API
- Return success/failure status

**loadObjects(projectId)**
- Query all objects for a project
- Use projectId as partition key
- Return array of canvas objects
- Cache in memory after loading

**deleteObject(projectId, objectId)**
- Delete single object from DynamoDB
- Remove from memory cache
- Log deletion

---

### Task 5: Enhance Canvas State

**File**: `backend/src/state/canvasState.ts`

**What to add**:

**Dual-Write Strategy**:
- Keep existing in-memory Map for objects
- When object created: Save to memory AND database
- When object updated: Update memory AND database
- When object deleted: Remove from memory AND database

**Error Handling**:
- If database write fails, log error but don't fail request
- User sees immediate success (from memory)
- Background process can retry failed writes

**Load on Startup**:
- When server starts, load projects from DynamoDB
- Populate memory cache with active projects
- Log how many projects loaded

---

### Task 6: Database Logger

**File**: `backend/src/utils/dbLogger.ts`

**What to create**:
- Log all database operations with timing
- Track success/failure rates
- Log error details for debugging
- Create metrics for monitoring

**Metrics to track**:
- Read latency (ms)
- Write latency (ms)
- Batch write latency (ms)
- Error count
- Success count

---

### Task 7: Environment Configuration

**Files to update**:
- `backend/.env.example` - Add AWS config template
- `backend/src/env.ts` - Add AWS environment variables
- `backend/README.md` - Document setup steps

**New environment variables**:
```
# AWS Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=

# DynamoDB Tables
DYNAMODB_PROJECTS_TABLE=collabcanvas-projects
DYNAMODB_OBJECTS_TABLE=collabcanvas-objects
DYNAMODB_COLLABORATORS_TABLE=collabcanvas-collaborators
DYNAMODB_USERS_TABLE=collabcanvas-users
```

---

### Task 8: Integration & Testing

**What to test**:

**Unit Tests**:
- Test projectService functions
- Test objectService functions
- Mock DynamoDB client for tests
- Verify error handling

**Integration Tests**:
- Create project via API
- Add objects to canvas
- Restart server
- Verify objects reload from database

**Manual Testing**:
- Create project through UI
- Add shapes to canvas
- Check AWS Console - see objects in table
- Restart backend server
- Reload page - objects should reappear

---

## Verification Checklist

Before marking PR complete:

- [ ] All four DynamoDB tables created
- [ ] AWS credentials configured in backend
- [ ] Database client connects successfully
- [ ] Can create project and save to database
- [ ] Can load project from database
- [ ] Can save canvas objects to database
- [ ] Can load canvas objects on server restart
- [ ] Existing in-memory functionality still works
- [ ] No breaking changes to frontend
- [ ] Database errors logged but don't crash server
- [ ] Environment variables documented
- [ ] Unit tests passing
- [ ] Integration tests passing

---

## Files Created

- `backend/src/db/dynamodb.ts`
- `backend/src/db/tables.ts`
- `backend/src/services/projectService.ts`
- `backend/src/services/objectService.ts`
- `backend/src/utils/dbLogger.ts`
- `backend/src/db/__tests__/dynamodb.test.ts`
- `backend/src/services/__tests__/projectService.test.ts`

## Files Modified

- `backend/src/state/canvasState.ts` - Add DB writes
- `backend/src/env.ts` - Add AWS config
- `backend/.env.example` - Add AWS template
- `backend/README.md` - Add setup docs
- `backend/package.json` - Add AWS SDK

---

## Dependencies to Install

```bash
npm install @aws-sdk/client-dynamodb @aws-sdk/lib-dynamodb
```

---

## Success Criteria

✅ Backend connects to DynamoDB successfully  
✅ Objects persist across server restarts  
✅ No performance degradation for users  
✅ All database errors handled gracefully  
✅ Existing functionality unchanged  
✅ Tests pass with 80%+ coverage  

---

## Next Steps

After PR12 is complete and merged:
- Move to PR13: Auto-Save System
- Implement background worker for periodic saves
- Add dirty flag tracking
- Enable multi-container support

---

**This PR establishes the persistence foundation for production!** 🗄️

