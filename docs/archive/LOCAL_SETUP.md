# Local Development Setup

If you prefer to run CollabCanvas locally without Docker, follow these steps:

## Prerequisites
- Node.js v20+ (LTS)
- npm v10+

## Backend Setup

```powershell
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file (copy from env.example.txt)
# Add your Firebase credentials

# Start backend server
npm run dev
```

Backend will run on: http://localhost:8080

## Frontend Setup

```powershell
# Navigate to frontend directory (in a new terminal)
cd frontend

# Install dependencies
npm install --legacy-peer-deps

# Create .env file (copy from env.example.txt)
# Add your Firebase and WebSocket URL

# Start frontend dev server
npm run dev
```

Frontend will run on: http://localhost:5173

## Environment Variables

### Backend (.env)
```
PORT=8080
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:5173
FIREBASE_PROJECT_ID=your-project-id
```

### Frontend (.env)
```
VITE_WS_URL=ws://localhost:8080
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

## Troubleshooting

### Frontend package-lock.json deleted
The `package-lock.json` was intentionally removed to avoid peer dependency conflicts with React 19. Always use:
```powershell
npm install --legacy-peer-deps
```

### Peer dependency warnings
React 19 is new and some libraries haven't updated their peer dependencies yet. Using `--legacy-peer-deps` is safe and expected.

### Port conflicts
Make sure ports 5173 (frontend) and 8080 (backend) are not in use by other applications.

## Running Both Locally

Open two terminal windows:

**Terminal 1 (Backend):**
```powershell
cd backend
npm run dev
```

**Terminal 2 (Frontend):**
```powershell
cd frontend
npm run dev
```

Both services must be running for the application to work properly.

