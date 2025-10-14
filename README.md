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

## Backend Setup

The backend is a Node.js WebSocket server that handles:
- Real-time synchronization between clients
- Firebase token verification (optional in development)
- Canvas state management (in-memory)
- Live presence tracking

### Backend Configuration

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   - Copy `backend/.env.example` to `backend/.env`
   - Basic configuration:
     ```bash
     PORT=8080
     ALLOWED_ORIGINS=http://localhost:5173
     NODE_ENV=development
     ```

4. **Start the backend server:**
   ```bash
   npm run dev
   ```

   You should see:
   ```
   Server running on port 8080
   Environment: development
   Health check: http://localhost:8080/health
   WebSocket: ws://localhost:8080
   ```

5. **Test the health endpoint:**
   Open http://localhost:8080/health in your browser
   You should see: `{"status":"ok","timestamp":"...","uptime":...}`

## Firebase Setup

### Step-by-Step Firebase Configuration

1. **Create a Firebase Project**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Click "Add project" or select an existing project
   - Follow the setup wizard

2. **Enable Google Authentication**
   - In your Firebase project, go to **Authentication** → **Sign-in method**
   - Click on **Google** provider
   - Toggle **Enable** switch
   - Add your project's support email
   - Click **Save**

3. **Get Your Firebase Configuration**
   - Go to **Project Settings** (gear icon) → **General**
   - Scroll down to **Your apps** section
   - Click the web icon `</>` to add a web app (if you haven't already)
   - Register your app with a nickname (e.g., "CollabCanvas")
   - Copy the `firebaseConfig` object values

4. **Configure Environment Variables**
   - Copy `.env.example` to `.env` in the `frontend/` directory:
     ```bash
     cp .env.example frontend/.env
     ```
   - Edit `frontend/.env` and add your Firebase credentials:
     ```bash
     VITE_FIREBASE_API_KEY=AIzaSy...your_actual_api_key
     VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
     VITE_FIREBASE_PROJECT_ID=your-project-id
     VITE_WS_URL=ws://localhost:8080
     ```

5. **Authorize Your Domain**
   - In Firebase Console → **Authentication** → **Settings** → **Authorized domains**
   - Add `localhost` (should be there by default)
   - When deploying, add your production domain (e.g., `your-app.vercel.app`)

## Deployment

### Prerequisites for Deployment

- GitHub account
- Vercel account (for frontend)
- Render/Fly.io/Railway account (for backend)
- Firebase project configured

### Frontend Deployment (Vercel)

1. **Push code to GitHub**
   ```bash
   git push origin main
   ```

2. **Import to Vercel**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "Add New..." → "Project"
   - Import your GitHub repository
   - Configure project:
     - **Framework Preset:** Vite
     - **Root Directory:** `frontend`
     - **Build Command:** `npm run build`
     - **Output Directory:** `dist`

3. **Add Environment Variables**
   In Vercel Project Settings → Environment Variables, add:
   ```
   VITE_WS_URL=wss://your-backend-url.com
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

4. **Deploy**
   - Click "Deploy"
   - Your frontend will be available at `https://your-app.vercel.app`

5. **Update Firebase Authorized Domains**
   - Go to Firebase Console → Authentication → Settings → Authorized domains
   - Add your Vercel domain: `your-app.vercel.app`

### Backend Deployment

#### Option 1: Render

1. **Create New Web Service**
   - Go to [Render Dashboard](https://dashboard.render.com/)
   - Click "New +" → "Web Service"
   - Connect your GitHub repository

2. **Configure Service**
   - **Name:** collabcanva-backend
   - **Root Directory:** `backend`
   - **Environment:** Node
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `node dist/index.js`
   - **Plan:** Free (or Starter for production)

3. **Add Environment Variables**
   In Service → Environment tab, add:
   ```
   NODE_ENV=production
   PORT=8080
   ALLOWED_ORIGINS=https://your-app.vercel.app
   FIREBASE_PROJECT_ID=your_project_id
   ```

4. **Deploy**
   - Click "Create Web Service"
   - Your backend will be available at `https://collabcanva-backend.onrender.com`
   - **Note:** Use `wss://` (not `ws://`) for the WebSocket URL

5. **Update Frontend**
   - Go back to Vercel
   - Update `VITE_WS_URL` to `wss://collabcanva-backend.onrender.com`
   - Redeploy frontend

#### Option 2: Fly.io

1. **Install Fly CLI**
   ```bash
   # macOS/Linux
   curl -L https://fly.io/install.sh | sh

   # Windows (PowerShell)
   powershell -Command "iwr https://fly.io/install.ps1 -useb | iex"
   ```

2. **Login to Fly**
   ```bash
   fly auth login
   ```

3. **Launch App**
   ```bash
   cd backend
   fly launch
   ```
   - Choose app name: `collabcanva-backend`
   - Choose region closest to your users
   - Don't deploy yet (we need to set secrets first)

4. **Set Environment Variables**
   ```bash
   fly secrets set NODE_ENV=production
   fly secrets set ALLOWED_ORIGINS=https://your-app.vercel.app
   fly secrets set FIREBASE_PROJECT_ID=your_project_id
   ```

5. **Deploy**
   ```bash
   fly deploy
   ```
   - Your backend will be available at `https://collabcanva-backend.fly.dev`

6. **Update Frontend**
   - Update Vercel environment variable `VITE_WS_URL` to `wss://collabcanva-backend.fly.dev`
   - Redeploy

#### Option 3: Docker (Self-Hosted)

1. **Build Docker Image**
   ```bash
   cd backend
   docker build -t collabcanva-backend .
   ```

2. **Run Container**
   ```bash
   docker run -d \
     -p 8080:8080 \
     -e NODE_ENV=production \
     -e ALLOWED_ORIGINS=https://your-app.vercel.app \
     -e FIREBASE_PROJECT_ID=your_project_id \
     --name collabcanva-backend \
     collabcanva-backend
   ```

3. **Check Logs**
   ```bash
   docker logs -f collabcanva-backend
   ```

### Post-Deployment Verification

1. **Check Backend Health**
   ```bash
   curl https://your-backend-url.com/health
   ```
   Should return: `{"status":"ok",...}`

2. **Test WebSocket Connection**
   - Open browser console on your deployed frontend
   - Check for WebSocket connection messages
   - Should see "Connected to WebSocket server"

3. **Run Smoke Tests**
   - Follow steps in `docs/SMOKE_TEST.md`
   - Test with multiple users in different browsers

### Troubleshooting Deployment

**WebSocket Connection Failed:**
- Ensure backend is using `wss://` in production
- Check CORS: `ALLOWED_ORIGINS` must include your frontend URL
- Verify backend is running: check health endpoint

**Authentication Not Working:**
- Verify Firebase config in Vercel environment variables
- Check Firebase Authorized Domains includes your Vercel domain
- Ensure `FIREBASE_PROJECT_ID` is set in backend (if using Firebase auth)

**Objects Not Syncing:**
- Check browser console for WebSocket messages
- Verify backend logs for incoming messages
- Ensure authentication is successful before operations

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
├── docs/              # All documentation
│   ├── PRD_MVP.md     # Product requirements
│   ├── Tasks.md       # Development task list
│   ├── architecture.md # System architecture
│   ├── DEPLOYMENT.md  # Deployment guide
│   ├── SMOKE_TEST.md  # Test scenarios
│   └── ... more docs
├── memory-bank/       # AI memory system
│   ├── projectbrief.md
│   ├── systemPatterns.md
│   └── ... context files
└── README.md          # This file
```

## Documentation

Comprehensive documentation is organized in the `docs/` folder:

### Product & Planning
- **[PRD_MVP.md](docs/PRD_MVP.md)** - Product Requirements Document for MVP
- **[Tasks.md](docs/Tasks.md)** - Development task list and PRs breakdown
- **[Prompts.md](docs/Prompts.md)** - Development prompts and context

### Architecture & Technical
- **[ARCHITECTURE_DETAILED.md](docs/ARCHITECTURE_DETAILED.md)** - 🆕 Complete architecture with Mermaid diagrams
- **[architecture.md](docs/architecture.md)** - System architecture overview (original)
- **[DEPLOYMENT_SUMMARY.md](docs/DEPLOYMENT_SUMMARY.md)** - Complete deployment status and results

### Setup Guides
- **[DEPLOYMENT.md](docs/DEPLOYMENT.md)** - Detailed deployment guide (Vercel + Render)
- **[DEPLOY_NOW.md](docs/DEPLOY_NOW.md)** - Quick deployment checklist
- **[DEVELOPMENT.md](docs/DEVELOPMENT.md)** - Cross-platform development setup
- **[FIREBASE_SETUP_GUIDE.md](docs/FIREBASE_SETUP_GUIDE.md)** - Firebase configuration
- **[VERCEL_ENV_SETUP.md](docs/VERCEL_ENV_SETUP.md)** - Vercel environment variables

### Testing & Security
- **[SMOKE_TEST.md](docs/SMOKE_TEST.md)** - Manual testing scenarios
- **[PR3_IMPLEMENTATION_SUMMARY.md](docs/PR3_IMPLEMENTATION_SUMMARY.md)** - WebSocket implementation details
- **[SECURITY_FIX_WEBSOCKET_AUTH.md](docs/SECURITY_FIX_WEBSOCKET_AUTH.md)** - Security documentation

### Memory Bank (AI Context)
The `memory-bank/` folder contains structured documentation for AI sessions:
- **projectbrief.md** - Core requirements and scope
- **productContext.md** - Product vision and UX goals
- **systemPatterns.md** - Architecture patterns and decisions
- **techContext.md** - Technologies and setup
- **activeContext.md** - Current work state
- **progress.md** - Detailed completion status

## Contributing

This is an MVP project built for evaluation. For issues or improvements, open a GitHub issue.

## License

MIT

