# Project Brief: CollabCanvas

## Overview
CollabCanvas is a real-time collaborative canvas application where multiple users can simultaneously create, move, and delete objects while seeing each other's live cursors with name labels.

## Core Requirements

### Must Have (MVP)
1. **Authentication**: Firebase Authentication with Google OAuth
2. **Single Shared Canvas**: All authenticated users collaborate on the same canvas session
3. **Real-Time Synchronization**: Object creation, movement, and deletion sync instantly (<2 seconds)
4. **Live Cursors**: Display other users' cursor positions with their display names
5. **Object Management**: Add, move, and delete rectangular shapes
6. **Public Deployment**: Accessible via public URL for testing

### Out of Scope (MVP)
- Multiple canvas rooms/sessions
- Persistent storage (in-memory state acceptable)
- Undo/redo functionality
- Shape types beyond rectangles
- Mobile-first design (desktop focus acceptable)
- Offline support

## Success Criteria

### Acceptance Criteria
- **AC-A1**: Users can sign up/sign in and are redirected to canvas
- **AC-A2**: User's display name is visible (next to cursor)
- **AC-C1**: Two authenticated users see the same canvas session
- **AC-C2**: Users can create/move objects; both clients reflect same state
- **AC-RS1**: Actions from one user appear instantly for others
- **AC-RS2**: No actions lost or duplicated during collaborative session
- **AC-P1**: Both users see each other's cursor positions in real-time
- **AC-P2**: Cursors display correct user names from authentication
- **AC-D1**: Reviewer can access staging URL and test with two accounts
- **AC-D2**: Code is publicly accessible on GitHub

### Performance Targets
- Initial load: < 5 seconds
- Object sync latency: < 2 seconds (target < 200ms)
- Cursor update rate: Smooth visual experience (throttled to ~60 updates/sec)
- Supports: 2-10 concurrent users (MVP scope)

## Technical Constraints

### Technology Stack
- **Frontend**: React + TypeScript + Vite
- **Backend**: Node.js + TypeScript + WebSocket
- **Auth**: Firebase Authentication
- **Deployment**: Free tier hosting (Vercel for frontend, Render for backend)
- **Communication**: WebSocket for real-time bidirectional communication

### Deployment Constraints
- Must work on free tier hosting
- Accept cold start delays on Render free tier (~30-60 seconds)
- In-memory state acceptable (no database required for MVP)

## Repository
- **GitHub**: https://github.com/sainathyai/CollabCanva
- **Branch Strategy**: Feature branches (pr1-*, pr2-*, etc.) merged to main
- **Main Branch**: Production-ready code, deployed automatically

## Timeline
- **Status**: ✅ COMPLETED - All 9 PRs merged and deployed
- **Deployed**: October 14, 2025
- **Live URL**: https://collab-canva-jdte.vercel.app

## Team
- **Developer**: Sainath Yatham
- **AI Assistant**: Cursor (Claude Sonnet 4.5)

