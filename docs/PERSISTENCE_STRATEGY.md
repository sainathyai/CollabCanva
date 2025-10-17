# Persistence & Collaboration Strategy

**Status**: Production Enhancement Plan  
**Goal**: Add persistence, multi-project support, and collaboration features  
**Timeline**: 2-3 weeks  
**Cost**: ~$11/month for DynamoDB

---

## 🗄️ Current State (In-Memory Issues)

### Problems:
1. **Data Loss on Restart**: All canvas objects lost when backend server restarts
2. **No Multi-Container Support**: Each backend container has its own separate memory
3. **No Projects**: All users share one global canvas
4. **No Collaboration Management**: Can't invite or remove collaborators
5. **No Persistence**: Canvas state disappears permanently

### Impact:
- Not production-ready
- Can't scale to multiple backend containers
- Poor user experience with data loss

---

## ✅ Solution: DynamoDB for Persistent Storage

### Four Database Tables:

**1. Projects Table**
- Stores project information (name, owner, dates)
- Each project gets unique ID
- Tracks thumbnail images for previews
- Manages public/private visibility

**2. Collaborators Table**
- Links users to projects they can access
- Defines three roles: owner, editor, viewer
- Tracks invitation history
- Controls who can do what

**3. CanvasObjects Table**
- Stores all shapes and objects
- Links objects to specific projects
- Saves position, size, color, rotation
- Maintains creation and update timestamps

**4. Users Table (Optional)**
- User profile data
- Project ownership lists
- Login activity tracking

---

## 🚀 Implementation Plan

### Phase 1: DynamoDB Setup (1-2 days)

**Create Four Tables**
Use AWS Console or CLI to create tables with proper keys and indexes.

**Key Configuration:**
- Projects: Use projectId as primary key
- Collaborators: Use projectId + userId as composite key
- CanvasObjects: Use projectId + objectId as composite key
- Users: Use userId as primary key

**Billing Mode:**
Choose pay-per-request pricing for flexibility. Only pay for what you use.

---

### Phase 2: Backend Integration (2-3 days)

**Database Service Layer**
Create service that handles all database operations:
- Project CRUD (create, read, update, delete)
- Collaborator management
- Object persistence
- User profile management

**Auto-Save System**
- Every 5 seconds, check for modified projects
- Save all changed objects to DynamoDB
- Clear "dirty" flags after successful save
- Log any errors for debugging

**Access Control**
Before any operation:
- Verify user has access to project
- Check their role permits the action
- Return error if unauthorized

---

### Phase 3: Multi-Project Frontend (3-4 days)

**New Pages:**

**Dashboard Page**
- Shows grid of all user's projects
- Displays project thumbnails
- Shows last modified date
- "Create New Project" button
- Click project to open canvas

**Project Settings Page**
- Manage project name and description
- Invite collaborators by email
- View and remove existing collaborators
- Delete project (owner only)
- Export options (future)

**Enhanced Canvas Page**
- Loads specific project by ID
- Shows project name in header
- Displays active collaborators
- Per-project presence tracking

**Enhanced Login Page**
- Professional hero section
- Feature highlights (AI, collaboration, speed)
- Animated preview
- Clear call-to-action

---

### Phase 4: Collaboration Features (2-3 days)

**Invite System**
- Enter email address to invite
- System sends invitation (future: email)
- Invited user sees project in their dashboard
- Can assign role when inviting

**Role-Based Access**
- **Owner**: Full control, can delete project
- **Editor**: Can modify canvas, invite others
- **Viewer**: Read-only, can see live changes

**Real-Time Presence**
- Show who's currently viewing each project
- Display cursors per project, not globally
- Update active user list in real-time

**Project Sharing**
- Generate shareable links (future)
- Set expiration on links
- View-only vs edit permissions

---

## 💰 Cost Breakdown

### DynamoDB Pricing (Pay-Per-Request):
- Reads: $0.25 per million
- Writes: $1.25 per million
- Storage: $0.25 per GB/month

### Example for 1000 Active Users:
**Writes per month:**
- Object updates: 100 actions/user/day × 1000 users × 30 days = 3M writes
- Auto-saves: 12/hour × 8 hours × 1000 users × 30 days = 2.9M writes
- **Total writes**: ~6M/month = **$7.50**

**Reads per month:**
- Project loads: 5/user/day × 1000 users × 30 days = 150K reads
- Object fetches: 150K × 100 objects = 15M reads
- **Total reads**: ~15M/month = **$3.75**

**Storage:**
- 1000 projects × 100 objects × 1KB = 100MB = **$0.03**

**Total**: ~**$11.28/month** for 1000 active users

Very affordable compared to traditional databases!

---

## 🔐 Security Strategy

### Authentication:
- Every request verified with Firebase token
- Token includes user ID for authorization
- Expired tokens rejected immediately

### Authorization:
- Check collaborators table before all operations
- Verify user has required role for action
- Owner-only operations strictly enforced

### Data Validation:
- Sanitize all user input
- Validate object properties before saving
- Prevent malicious data injection
- Rate limiting on API endpoints

### Encryption:
- DynamoDB encryption at rest (automatic)
- HTTPS for all API calls
- Secure token transmission

---

## 📊 Monitoring & Metrics

### What to Track:

**Performance Metrics:**
- Read latency (target: under 20ms)
- Write latency (target: under 30ms)
- Throttled requests (target: zero)

**Usage Metrics:**
- Projects created per day
- Active users per project
- Objects per project
- Collaboration invitations sent

**Health Indicators:**
- Failed writes (alert if non-zero)
- Connection errors
- Timeout errors

### Set Up Alarms For:
- High throttling rates
- Increased error rates
- Unusually high costs
- Slow query performance

---

## 🎯 Feature Roadmap

### MVP (Week 1-2):
- DynamoDB tables created and configured
- Backend can save and load projects
- Auto-save runs every 5 seconds
- Basic project list in frontend

### Enhanced (Week 3):
- Multi-project dashboard
- Create and delete projects
- Project thumbnails
- Enhanced login page design

### Collaboration (Week 4):
- Invite collaborators by email
- Role-based access control
- Remove collaborators
- Real-time presence per project

### Advanced (Future):
- Project templates library
- Version history and rollback
- Comments and annotations
- Export to PNG, SVG, PDF
- Team workspaces for organizations
- Project analytics dashboard

---

## 🚀 Migration Strategy

### Step 1: Add Persistence (No Breaking Changes)
- Keep current in-memory system working
- Add DynamoDB writes in parallel
- Objects saved to both memory and database
- Test thoroughly before next step

### Step 2: Verify Everything Works
- Check objects persist after restart
- Test with multiple backend containers
- Verify auto-save runs correctly
- Monitor for any errors

### Step 3: Gradual Rollout
- Deploy to staging environment first
- Test with small group of users
- Monitor performance closely
- Deploy to production when stable

### Step 4: Full Database Mode
- Rely primarily on DynamoDB
- Keep memory cache for performance
- System can survive restarts
- Multiple containers share same data

---

## ✅ Success Criteria

**Must Achieve:**
- Canvas state survives server restarts
- Multiple backend containers share same state
- Users can create unlimited projects
- Collaborators can be invited and removed
- Database reads under 20ms latency
- Auto-save works reliably every 5 seconds
- Dashboard loads in under 2 seconds
- Zero data loss during normal operations

**Nice to Have:**
- Project thumbnails generate automatically
- Real-time collaboration indicators
- Smooth animations during saves
- Offline mode with sync on reconnect

---

## 🎓 Key Learnings

**Why DynamoDB?**
- Scales automatically (no capacity planning)
- Pay only for what you use
- Built-in reliability and backups
- Perfect for this access pattern
- Integrates seamlessly with AWS

**Why Not Traditional SQL?**
- Need to manage server capacity
- Higher costs for same performance
- More complex to scale
- Overkill for this use case

**Why Auto-Save vs Manual?**
- Users forget to save
- Better user experience
- Prevents accidental data loss
- 5 seconds balances UX and cost

---

**This strategy transforms CollabCanvas from prototype to production-ready!** 🚀

