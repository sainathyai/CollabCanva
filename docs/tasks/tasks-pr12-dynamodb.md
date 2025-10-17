# Tasks: PR12 - DynamoDB Foundation & Basic Persistence

**Branch**: `pr12-dynamodb-foundation`
**Status**: ✅ Complete
**Started**: October 16, 2025
**Completed**: October 16, 2025

---

## Relevant Files

### New Files to Create
- `backend/src/db/dynamodb.ts` - DynamoDB client initialization and configuration
- `backend/src/db/tables.ts` - Table name constants and configuration
- `backend/src/services/projectService.ts` - Project CRUD operations
- `backend/src/services/objectService.ts` - Canvas object persistence operations
- `backend/src/services/collaboratorService.ts` - Collaborator management (future)
- `backend/src/utils/dbLogger.ts` - Database operation logging and metrics

### Files to Modify
- `backend/src/state/canvasState.ts` - Add dual-write strategy (memory + DB)
- `backend/src/env.ts` - Add AWS environment variables
- `backend/.env.example` - Add AWS configuration template
- `backend/package.json` - Add AWS SDK dependencies
- `backend/src/server.ts` - Initialize DB connection on startup

### Test Files
- `backend/src/db/__tests__/dynamodb.test.ts` - DB client tests
- `backend/src/services/__tests__/projectService.test.ts` - Project service tests
- `backend/src/services/__tests__/objectService.test.ts` - Object service tests

---

## Tasks

- [x] 1.0 Setup AWS Infrastructure
  - [x] 1.1 Create AWS DynamoDB table: `collabcanvas-projects`
  - [x] 1.2 Create AWS DynamoDB table: `collabcanvas-objects`
  - [x] 1.3 Create AWS DynamoDB table: `collabcanvas-collaborators`
  - [x] 1.4 Create AWS DynamoDB table: `collabcanvas-users` (optional)
  - [x] 1.5 Create IAM user with DynamoDB permissions
  - [x] 1.6 Generate and save AWS access credentials

- [x] 2.0 Install Dependencies
  - [x] 2.1 Install AWS SDK packages (@aws-sdk/client-dynamodb, @aws-sdk/lib-dynamodb)
  - [x] 2.2 Verify packages installed correctly

- [x] 3.0 Configure Environment Variables
  - [x] 3.1 Update `backend/src/env.ts` with AWS config variables
  - [x] 3.2 Update `backend/.env.example` with AWS template
  - [x] 3.3 Add AWS credentials to local `.env` file

- [x] 4.0 Create Database Client
  - [x] 4.1 Create `backend/src/db/tables.ts` with table name constants
  - [x] 4.2 Create `backend/src/db/dynamodb.ts` with client initialization
  - [x] 4.3 Add health check function to verify connection
  - [x] 4.4 Add error handling for connection failures

- [x] 5.0 Create Database Logger
  - [x] 5.1 Create `backend/src/utils/dbLogger.ts` with logging functions
  - [x] 5.2 Add timing metrics for operations
  - [x] 5.3 Add success/failure tracking

- [x] 6.0 Implement Project Service
  - [x] 6.1 Create `backend/src/services/projectService.ts` file structure
  - [x] 6.2 Implement `createProject()` function
  - [x] 6.3 Implement `getProject()` function
  - [x] 6.4 Implement `getUserProjects()` function
  - [x] 6.5 Implement `updateProject()` function
  - [x] 6.6 Implement `deleteProject()` function (soft delete)

- [x] 7.0 Implement Object Service
  - [x] 7.1 Create `backend/src/services/objectService.ts` file structure
  - [x] 7.2 Implement `saveObject()` function
  - [x] 7.3 Implement `saveObjects()` batch function
  - [x] 7.4 Implement `loadObjects()` function
  - [x] 7.5 Implement `deleteObject()` function

- [x] 8.0 Enhance Canvas State with Dual-Write
  - [x] 8.1 Import object service into `canvasState.ts`
  - [x] 8.2 Add DB write on object creation
  - [x] 8.3 Add DB write on object update
  - [x] 8.4 Add DB delete on object removal
  - [x] 8.5 Add error handling (log but don't fail requests)
  - [x] 8.6 Add load-from-DB function on server startup

- [x] 9.0 Initialize Database on Server Start
  - [x] 9.1 Update `server.ts` to initialize DB client
  - [x] 9.2 Add health check on startup
  - [x] 9.3 Add graceful fallback if DB unavailable
  - [x] 9.4 Load existing projects into memory cache

- [x] 10.0 Testing & Verification
  - [x] 10.1 Test creating project and saving to DB
  - [x] 10.2 Test adding objects and saving to DB
  - [x] 10.3 Test server restart - objects reload from DB
  - [x] 10.4 Verify AWS Console shows data in tables
  - [x] 10.5 Test error handling with invalid credentials
  - [x] 10.6 Verify in-memory functionality still works

---

## Notes

- **Dual-Write Strategy**: Write to both memory (fast) and database (persistent)
- **Error Handling**: Database failures should not break the user experience
- **No Breaking Changes**: Frontend requires no modifications
- **AWS Billing**: Using pay-per-request mode to minimize costs during development


