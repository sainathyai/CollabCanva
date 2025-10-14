# Product Context: CollabCanvas

## Why This Exists
CollabCanvas is a learning project demonstrating real-time collaborative editing capabilities. It serves as a portfolio piece and technical proof-of-concept for building multiplayer web applications.

## Problems It Solves

### User Problems
1. **Learning Real-Time Collaboration**: Developers need practical examples of building collaborative applications
2. **Understanding WebSocket**: Need hands-on experience with WebSocket for bidirectional communication
3. **Presence Awareness**: Users want to see who else is active and where they're working

### Technical Problems
1. **State Synchronization**: How to keep multiple clients in sync without conflicts
2. **Real-Time Communication**: Implementing efficient WebSocket-based communication
3. **Authentication with WebSocket**: Securing WebSocket connections with token-based auth
4. **Deployment Complexity**: Getting real-time apps deployed on free tier hosting

## How It Works

### User Flow
```
1. User visits https://collab-canva-jdte.vercel.app
2. Clicks "Sign in with Google"
3. Authenticates via Firebase (Google OAuth)
4. Redirected to /canvas
5. WebSocket connection established automatically
6. User sees:
   - Empty canvas or existing objects
   - Other users' cursors with names
   - Header with their own display name
7. User can:
   - Click "Add Rectangle" to create new object
   - Click and drag objects to move them
   - Press Delete key to remove selected object
   - See all actions sync in real-time
```

### Collaboration Experience
- **Instant Feedback**: When User A adds a rectangle, User B sees it appear within 100ms
- **Cursor Awareness**: Users see colorful cursors showing where others are pointing
- **Name Labels**: Each cursor displays the user's name from Google account
- **Smooth Interaction**: Cursor positions throttled to 60 updates/sec for smooth movement
- **Seamless Reconnection**: If connection drops, automatic reconnection attempts

## User Experience Goals

### Primary Goals
1. **Immediate Collaboration**: No setup required - sign in and start collaborating
2. **Clear Presence**: Always know who else is on the canvas
3. **Responsive Actions**: Actions feel instant and synchronized
4. **No Confusion**: Clear visual feedback for all interactions

### Design Decisions
- **Single Canvas**: Simplified scope - everyone shares one canvas (no rooms/channels)
- **Rectangles Only**: Focus on synchronization mechanics, not drawing features
- **Minimal UI**: Clean interface - toolbar, canvas, header with user name
- **Color-Coded Cursors**: Each user gets a unique color for easy identification
- **In-Memory State**: Fast and simple - no database overhead for MVP

### Non-Goals (Intentional Limitations)
- **Not Persistent**: Canvas resets when last user leaves (acceptable for MVP)
- **Not Mobile-Optimized**: Desktop-focused experience
- **No Chat**: Focus on visual collaboration only
- **No Access Control**: Single public canvas, no permissions system
- **No History**: No undo/redo or version control

## Key Scenarios

### Scenario 1: First-Time User
```
User opens app → Signs in with Google → Sees empty canvas → 
Adds first rectangle → Feels accomplished
```

### Scenario 2: Joining Active Session
```
User opens app → Signs in → Canvas already has objects → 
Sees another user's cursor moving → Adds their own rectangle → 
Watches it sync to other user → Feels connected
```

### Scenario 3: Collaborative Creation
```
User A adds rectangle in top-left → User B adds rectangle in bottom-right → 
User A drags theirs down → User B drags theirs up → 
They create a pattern together → Demonstrates real-time collaboration
```

### Scenario 4: Connection Issues
```
User's network drops → "Reconnecting..." shown → 
Connection restored → Canvas state syncs → 
User continues working seamlessly
```

## Success Metrics (If This Were Production)

### User Engagement
- Time spent collaborating (target: > 5 minutes per session)
- Number of objects created per session
- Return visits (indicates value)

### Technical Performance
- WebSocket connection success rate (target: > 99%)
- Sync latency (target: < 200ms p95)
- Reconnection success rate (target: > 95%)

### Collaboration Quality
- Sessions with 2+ concurrent users
- Actions per minute during collaborative sessions
- User feedback on "it feels real-time"

## Current Status
✅ **MVP Complete and Deployed**
- All core features implemented
- All acceptance criteria met
- Deployed to production URLs
- Smoke tests passed
- Ready for user testing and feedback

