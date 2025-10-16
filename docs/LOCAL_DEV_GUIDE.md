# 🚀 Local Development Guide

## Why Local Development?

### Speed Comparison
- **Docker Build**: 60-90 seconds per change ❌
- **Local Hot Reload**: < 1 second per change ✅

### Benefits
✅ **Instant hot reload** - Changes appear immediately
✅ **Better debugging** - Direct browser DevTools access
✅ **Faster iteration** - Save file → See changes instantly
✅ **No build wait** - Vite's lightning-fast HMR
✅ **Native performance** - No container overhead

## Quick Start

### One-Time Setup (Already Done ✅)
```powershell
# Backend
cd backend
npm install

# Frontend
cd frontend
npm install
```

### Daily Development

**Option 1: Manual (Recommended for learning)**

Open 2 terminals:

**Terminal 1 - Backend:**
```powershell
cd backend
npm run dev
```
✅ Backend running on http://localhost:8080

**Terminal 2 - Frontend:**
```powershell
cd frontend
npm run dev
```
✅ Frontend running on http://localhost:5173

**Option 2: PowerShell Script**
```powershell
# From project root
.\start-local.ps1
```

## Environment Variables

### Backend (`.env` in `backend/` folder)
```env
PORT=8080
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:5173
FIREBASE_PROJECT_ID=your-project-id
```

### Frontend (`.env` in `frontend/` folder)
```env
VITE_WS_URL=ws://localhost:8080
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

## Development Workflow

### Making Changes

1. **Edit any file** in `frontend/src/` or `backend/src/`
2. **Save the file** (Ctrl+S)
3. **Changes appear instantly** in browser (< 1 second)

### Frontend Hot Reload
- Edit React components → Instant update
- Edit CSS → Instant style update
- Edit TypeScript → Instant recompile
- Vite HMR preserves component state

### Backend Auto-Restart
- Edit TypeScript files → Auto-restart in ~2 seconds
- Uses `tsx watch` for fast recompilation
- WebSocket clients auto-reconnect

## Debugging

### Frontend Debugging
1. Open Chrome DevTools (F12)
2. Use React DevTools extension
3. Set breakpoints directly in browser
4. Console.log appears instantly

### Backend Debugging
1. View logs in terminal
2. Use VS Code debugger (launch.json included)
3. Add console.log statements
4. Logs appear immediately in terminal

## Common Commands

### Frontend
```powershell
npm run dev       # Start dev server
npm run build     # Build for production
npm run preview   # Preview production build
npm run test      # Run tests
npm run lint      # Run ESLint
```

### Backend
```powershell
npm run dev       # Start dev server with watch mode
npm run build     # Compile TypeScript
npm start         # Run compiled JavaScript
npm test          # Run tests (if configured)
```

## Port Configuration

| Service | Port | URL |
|---------|------|-----|
| Frontend | 5173 | http://localhost:5173 |
| Backend | 8080 | http://localhost:8080 |
| WebSocket | 8080 | ws://localhost:8080 |

## Troubleshooting

### Port Already in Use
```powershell
# Check what's using the port
netstat -ano | findstr :8080
netstat -ano | findstr :5173

# Kill the process
taskkill /PID <PID> /F
```

### Dependencies Out of Sync
```powershell
# Backend
cd backend
rm -rf node_modules
npm install

# Frontend
cd frontend
rm -rf node_modules
npm install
```

### WebSocket Connection Failed
1. Ensure backend is running first
2. Check backend logs for errors
3. Verify VITE_WS_URL in frontend/.env
4. Check firewall settings

### React 18 vs 19 Issues
✅ **Already fixed!** We're using React 18.3.1 with compatible versions:
- `react@18.3.1`
- `react-dom@18.3.1`
- `react-konva@18.2.14`
- `@types/react@18.3.18`

## When to Use Docker

Use Docker for:
- 🚢 **Production deployment**
- 🧪 **Testing production builds**
- 👥 **Sharing exact environment with team**
- 🔄 **CI/CD pipelines**
- 📦 **Full-stack testing**

Use Local for:
- 💻 **Daily development**
- 🐛 **Debugging**
- ⚡ **Fast iteration**
- 🎨 **UI/UX work**
- 🧪 **Quick experiments**

## Performance Tips

### Faster Development
1. **Keep terminals open** - No restart overhead
2. **Use Vite's HMR** - Preserves app state
3. **Disable unused tools** - Faster reload
4. **Use TypeScript strict mode** - Catch errors early

### Browser DevTools
1. Open DevTools (F12)
2. Go to Network tab → WS → See WebSocket messages
3. Console tab → See all logs
4. React DevTools → Inspect component state

## Summary

✅ **10x faster** than Docker rebuilds
✅ **Instant feedback** on code changes
✅ **Better debugging** experience
✅ **Native performance**
✅ **Professional workflow**

Happy coding! 🎉

