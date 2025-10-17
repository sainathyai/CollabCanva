# 🚀 Local Development Setup (Fast & Easy)

## Prerequisites
- Node.js v18+ installed
- npm v9+ installed

## One-Time Setup

### 1. Backend Setup
```powershell
cd backend
npm install
```

Create `.env` file in `backend/` folder:
```env
PORT=8080
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:5173
FIREBASE_PROJECT_ID=your-firebase-project-id
```

### 2. Frontend Setup
```powershell
cd frontend
npm install
```

Create `.env` file in `frontend/` folder:
```env
VITE_WS_URL=ws://localhost:8080
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

## Daily Development (2 Terminals)

### Terminal 1 - Backend
```powershell
cd backend
npm run dev
```
Backend runs on: http://localhost:8080

### Terminal 2 - Frontend
```powershell
cd frontend
npm run dev
```
Frontend runs on: http://localhost:5173

## ✨ Benefits
- **Instant Hot Reload**: Changes appear immediately
- **No Build Wait**: Save and see changes in < 1 second
- **Better Debugging**: Direct access to browser DevTools
- **Faster Iteration**: 10x faster development cycle

## 🐳 When to Use Docker
- Production deployment
- Testing production builds
- Sharing with team (consistent environment)
- CI/CD pipelines

## 📝 Notes
- Both services must be running for the app to work
- Keep both terminal windows open while developing
- Stop with `Ctrl+C` in each terminal

