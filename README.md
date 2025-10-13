# CollabCanvas MVP

A real-time collaborative whiteboard application built for multi-user interaction with live presence and synchronization.

## Overview

CollabCanvas is a minimal viable product (MVP) demonstrating:
- **Real-time synchronization** of canvas objects across all active users
- **Live presence** with cursor tracking and name labels
- **Basic authentication** via Firebase Auth (Google OAuth)
- **Single shared canvas** for collaborative design

Built to meet a 24-hour development deadline.

## Tech Stack

- **Frontend**: React + Vite, WebSocket client
- **Backend**: Node.js + TypeScript, WebSocket server
- **Authentication**: Firebase Auth (Google OAuth)
- **Database**: In-memory state (optional Firestore for persistence)
- **Deployment**: Vercel (frontend), Render/Fly.io/AWS (backend)

## Prerequisites

- Node.js 18+
- Firebase project with Authentication enabled
- Git

## Quick Start

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd CollabCanvas
```

### 2. Set up environment variables

Copy `.env.example` to `.env` in both `frontend/` and `backend/` directories, then fill in your credentials:

**Frontend (`frontend/.env`):**
```bash
VITE_WS_URL=ws://localhost:8080
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
```

**Backend (`backend/.env`):**
```bash
PORT=8080
ALLOWED_ORIGINS=http://localhost:5173
FIREBASE_PROJECT_ID=your_project_id
```

### 3. Install dependencies

```bash
# Frontend
cd frontend
npm install

# Backend
cd ../backend
npm install
```

### 4. Run locally

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

Open `http://localhost:5173` in your browser.

## Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing
3. Enable **Authentication** → Sign-in method → **Google**
4. Copy your project credentials to `.env` files

## Deployment

### Frontend (Vercel)

1. Push code to GitHub
2. Import repository in [Vercel](https://vercel.com)
3. Set root directory to `frontend/`
4. Add environment variables in Vercel dashboard
5. Deploy

### Backend (Render/Fly.io)

**Render:**
1. Create new Web Service
2. Connect GitHub repository
3. Set root directory to `backend/`
4. Add environment variables
5. Deploy

**Fly.io:**
```bash
cd backend
fly launch
fly secrets set ALLOWED_ORIGINS=https://your-frontend.vercel.app
fly deploy
```

Update frontend `VITE_WS_URL` to point to deployed backend WSS URL.

## Testing

Run the smoke tests documented in `docs/SMOKE_TEST.md`:

1. Open staging URL in two browsers
2. Sign in with different Google accounts
3. Verify cursors, object creation, and real-time sync

## Project Structure

```
CollabCanvas/
├── frontend/          # React + Vite frontend
│   ├── src/
│   │   ├── pages/     # Login, Canvas
│   │   ├── components/ # Header, Toolbar, CursorOverlay
│   │   ├── lib/       # auth, ws, canvas helpers
│   │   └── types.ts   # TypeScript types
│   └── package.json
├── backend/           # Node.js WebSocket server
│   ├── src/
│   │   ├── ws/        # WebSocket handlers
│   │   ├── state/     # In-memory canvas & presence
│   │   ├── auth/      # Token verification
│   │   └── server.ts
│   └── package.json
├── docs/
│   └── SMOKE_TEST.md  # Manual test scenarios
├── PRD_MVP.md         # Product requirements
├── Tasks.md           # Development tasks
└── architecture.md    # System architecture diagram
```

## Contributing

This is an MVP project built for evaluation. For issues or improvements, open a GitHub issue.

## License

MIT

