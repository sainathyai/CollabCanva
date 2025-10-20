# Technical Context: CollabCanvas

## Technology Stack

### Frontend
- **Framework**: React 19.2.0 (upgraded in PR10)
- **Canvas Library**: Konva 10.0.2 + React Konva 19.0.10 (added in PR10)
- **Build Tool**: Vite 4.5.3
- **Language**: TypeScript 5.3.3
- **Routing**: React Router 6.22.0
- **Auth**: Firebase SDK 12.4.0 (upgraded in PR10)
- **Styling**: Plain CSS (no framework)
- **Testing**: Vitest + @testing-library/react

### Backend
- **Runtime**: Node.js 18+
- **Language**: TypeScript 5.3.3
- **WebSocket**: ws ^8.16.0
- **Auth Verification**: firebase-admin ^12.0.0
- **Cache Client**: ioredis ^5.3.2
- **Build**: TypeScript Compiler (tsc)

### Infrastructure
- **Frontend Hosting**: AWS Amplify (us-east-2)
- **Backend Hosting**: AWS ECS Fargate (us-east-2)
- **Load Balancer**: AWS ALB with sticky sessions
- **Cache**: AWS ElastiCache Redis (us-east-2)
- **Database**: AWS DynamoDB
- **Authentication**: Firebase Authentication
- **Version Control**: Git + GitHub

## Development Setup

### Prerequisites
```bash
- Node.js 18+ (specified in .nvmrc)
- npm (comes with Node.js)
- Git
- Two browsers for testing (or one + incognito)
- Two Google accounts for multi-user testing
```

### Environment Variables

#### Frontend (.env)
```bash
VITE_WS_URL=ws://localhost:8080              # Local dev
# VITE_WS_URL=wss://collabcanva-backend.onrender.com  # Production

VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=collabcanva-730db.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=collabcanva-730db
VITE_FIREBASE_STORAGE_BUCKET=collabcanva-730db.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

#### Backend (.env)
```bash
PORT=8080
ALLOWED_ORIGINS=http://localhost:5173       # Local dev
# ALLOWED_ORIGINS=https://collabcanva.sainathyai.com  # Production
FIREBASE_PROJECT_ID=collabcanva-730db
NODE_ENV=development                         # or production
AWS_REGION=us-east-2                         # AWS services region
DYNAMODB_TABLE_PREFIX=collabcanvas          # DynamoDB table prefix
REDIS_URL=redis://collabcanvas-redis-us2.wda3jc.0001.use2.cache.amazonaws.com:6379  # ElastiCache Redis
```

### Local Development Commands

#### Frontend
```bash
cd frontend
npm install
npm run dev       # Start dev server on http://localhost:5173
npm run build     # Build for production
npm run preview   # Preview production build
npm test          # Run tests with Vitest
```

#### Backend
```bash
cd backend
npm install
npm run dev       # Start with nodemon (auto-reload)
npm run build     # Compile TypeScript to dist/
npm start         # Run compiled code
```

### Project Structure
```
CollabCanva/
├── frontend/
│   ├── src/
│   │   ├── pages/          # Route components (Login, Canvas)
│   │   ├── components/     # Reusable components (Header, Toolbar, CursorOverlay, KonvaCanvas)
│   │   ├── routes/         # Router configuration
│   │   ├── lib/            # Utilities (auth, ws client, canvas logic)
│   │   ├── types.ts        # TypeScript interfaces
│   │   └── styles.css      # Global styles
│   ├── index.html          # Entry HTML
│   ├── vite.config.ts      # Vite configuration
│   ├── tsconfig.json       # TypeScript config
│   └── package.json
│
├── backend/
│   ├── src/
│   │   ├── server.ts       # Entry point (HTTP + WebSocket)
│   │   ├── ws/             # WebSocket handlers and message types
│   │   ├── state/          # In-memory state (canvas, presence)
│   │   ├── auth/           # Firebase token verification
│   │   ├── http/           # Health check endpoint
│   │   └── utils/          # Logger
│   ├── tsconfig.json       # TypeScript config
│   ├── render.yaml         # Render deployment config
│   └── package.json
│
├── docs/                   # Documentation
├── memory-bank/            # Project memory (this directory)
├── .cursor/rules/          # Cursor AI rules
├── PRD_MVP.md             # Product requirements
├── Tasks.md               # Development task list
└── README.md              # Quick start guide
```

## Dependencies

### Frontend Dependencies
```json
{
  "react": "^19.2.0",
  "react-dom": "^19.2.0",
  "react-router-dom": "^6.22.0",
  "firebase": "^12.4.0",
  "konva": "^10.0.2",
  "react-konva": "^19.0.10"
}
```

### Frontend DevDependencies
```json
{
  "@types/react": "^19.2.2",
  "@types/react-dom": "^19.2.2",
  "@vitejs/plugin-react": "^4.2.1",
  "typescript": "^5.3.3",
  "vite": "^4.5.3",
  "vitest": "^1.2.0",
  "@testing-library/react": "^14.1.2"
}
```

### Backend Dependencies
```json
{
  "ws": "^8.16.0",
  "firebase-admin": "^12.0.0"
}
```

### Backend DevDependencies
```json
{
  "@types/node": "^20.10.6",
  "@types/ws": "^8.5.10",
  "typescript": "^5.3.3",
  "nodemon": "^3.0.2",
  "ts-node": "^10.9.2"
}
```

## TypeScript Configuration

### Frontend tsconfig.json
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  }
}
```

### Backend tsconfig.json
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ES2020",
    "moduleResolution": "node",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  }
}
```

**Key Decision**: Backend uses `"module": "ES2020"` for ESM support (import/export)

## Build Process

### Frontend Build
```bash
npm run build
# 1. TypeScript compilation (tsc)
# 2. Vite bundles: JS, CSS, assets
# 3. Output: dist/ directory
# 4. Static files ready for Vercel
```

### Backend Build
```bash
npm run build
# 1. TypeScript compilation (tsc)
# 2. Output: dist/ directory
# 3. Preserves directory structure from src/
# 4. .js files ready for Node.js
```

**Critical**: Backend build requires devDependencies (TypeScript, @types/*)
- Render: `npm ci --include=dev && npm run build`

## Deployment Configuration

### Vercel (Frontend)
```json
// vercel.json
{
  "installCommand": "npm install",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }  // SPA routing
  ]
}
```

### Render (Backend)
```yaml
# render.yaml
services:
  - type: web
    name: collabcanva-backend
    env: node
    region: oregon
    plan: free
    buildCommand: npm ci --include=dev && npm run build
    startCommand: NODE_ENV=production node dist/server.js
    healthCheckPath: /health
    envVars:
      - key: PORT
        value: 8080
      - key: ALLOWED_ORIGINS
        sync: false  # Set in dashboard
      - key: FIREBASE_PROJECT_ID
        sync: false  # Set in dashboard
```

## Technical Constraints

### Render Free Tier Limitations
- **Cold Starts**: Server sleeps after 15 minutes of inactivity
  - First request after sleep: 30-60 second startup
  - Subsequent requests: normal latency
- **Memory**: 512 MB RAM limit
- **CPU**: Shared CPU, performance not guaranteed
- **Disk**: Temporary filesystem (no persistent storage)
- **Concurrent Connections**: Limited to single instance

### Vercel Free Tier Limitations
- **Build Time**: 45 minutes max (we use ~1-2 minutes)
- **Serverless Functions**: Not used (static site only)
- **Bandwidth**: 100 GB/month (generous for MVP)
- **Deployments**: Unlimited

### Firebase Free Tier (Spark Plan)
- **Authentication**: 10k monthly active users (way more than needed)
- **Token Verification**: Unlimited (server-side verification)
- **Storage**: Not used

## Known Technical Issues

### 1. Render Cold Starts
**Issue**: First request after 15 min idle takes 30-60 seconds
**Workaround**: User sees "Connecting..." message, automatic retry
**Future Fix**: Upgrade to paid tier ($7/month) for always-on

### 2. WebSocket Disconnect on Render Deploy
**Issue**: Active connections dropped when new version deploys
**Workaround**: Client auto-reconnects, gets fresh state
**Acceptable**: Deploy frequency low enough not to impact UX

### 3. HTTPS Mixed Content
**Issue**: Cannot mix ws:// (insecure WebSocket) with https:// page
**Solution**: Use wss:// (secure WebSocket) in production
**Configuration**: VITE_WS_URL=wss://... for production

### 4. Firebase Token Expiration
**Issue**: ID tokens expire after 1 hour
**Current**: User must refresh page to re-authenticate
**Future**: Implement token refresh in frontend

## Development Tools

### Recommended VS Code / Cursor Extensions
- **ESLint**: Code linting
- **EditorConfig**: Consistent formatting
- Configured in `.vscode/extensions.json`

### Code Formatting
- **EditorConfig**: Consistent indentation, line endings
- **VS Code Built-in Formatters**: TypeScript, JSON, CSS
- Configuration in `.editorconfig` and `.vscode/settings.json`

### Testing
```bash
# Frontend unit tests
cd frontend
npm test

# Manual smoke testing (see docs/SMOKE_TEST.md)
# - Two browsers
# - Different Google accounts
# - Follow test scenarios
```

## Git Workflow

### Branch Strategy
```
main (production)
├── pr1-repo-scaffold
├── pr2-frontend-scaffold
├── pr3-backend-websocket
├── pr4-canvas-objects
├── pr5-firebase-auth
├── pr6-auth-websocket-integration
├── pr7-presence-cursors
├── pr8-deployment
└── pr9-smoke-tests-and-fixes
```

### Commit Message Format
```
type: brief description

- Detailed point 1
- Detailed point 2

Fixes: #issue (if applicable)
```

Types: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`

### Deployment Trigger
```bash
git push origin main  # Triggers both Vercel and Render deployments
```

## Monitoring & Debugging

### Frontend Debugging
- **Browser DevTools Console**: View WebSocket messages, errors
- **React DevTools**: Inspect component state
- **Network Tab**: Monitor WebSocket connection

### Backend Debugging
- **Render Logs**: View in Render dashboard (real-time)
- **Console Logs**: logger.info(), logger.error()
- **Local Testing**: Run backend locally, connect from deployed frontend

### Health Checks
```bash
# Backend health check
curl https://collabcanva-backend.onrender.com/health
# Expected: { "status": "ok", "timestamp": "..." }

# Frontend
curl https://collab-canva-jdte.vercel.app
# Expected: HTML content
```

## Performance Characteristics

### Measured Metrics (Production)
- **Initial Page Load**: 2-3 seconds
- **Authentication**: 1-2 seconds (Google OAuth)
- **WebSocket Connection**: 500ms (or 30-60s on cold start)
- **Object Sync Latency**: <100ms (real-time feel)
- **Cursor Update Latency**: <50ms (very smooth)
- **Reconnection Time**: 1-5 seconds (with exponential backoff)

### Bottlenecks
1. **Render Cold Start**: Biggest UX issue, only fixable with paid tier
2. **Network Latency**: User distance from Render Oregon datacenter
3. **Browser Performance**: Canvas redraws on every state change

## Security Considerations

### Implemented
- ✅ Firebase token verification on backend
- ✅ CORS configured for specific frontend origin
- ✅ WSS (encrypted WebSocket) in production
- ✅ HTTPS for all traffic
- ✅ Environment variables not committed to Git
- ✅ Firebase Admin SDK credentials via environment

### Not Implemented (Acceptable for MVP)
- ⚠️ Rate limiting (low priority for learning project)
- ⚠️ Input sanitization (rectangles only, no user content)
- ⚠️ DDoS protection (relying on Render/Vercel infrastructure)

## Recent Technical Improvements (PR10)

### Completed
1. ✅ **Konva Canvas Library**: Professional canvas rendering with built-in transformations
2. ✅ **Multiple Shape Types**: 12+ shapes beyond rectangles (circles, text, lines, polygons, etc.)
3. ✅ **Transformations**: Rotation and scaling with visual handles
4. ✅ **Multi-Selection**: Shift+click and area selection
5. ✅ **Canvas Controls**: Zoom and pan functionality
6. ✅ **Enhanced Interactions**: Copy/paste, duplicate, color picker

## Future Technical Improvements

### If Scaling Up
1. **Add Database**: Firestore or PostgreSQL for persistence
2. **Add Redis**: Pub/sub for multi-instance support
3. **Add Rate Limiting**: Prevent abuse
4. **Optimize Rendering**: Use Konva's layering for better performance
5. **Add Service Worker**: Offline support, faster loads
6. **Add Sentry**: Error tracking and monitoring
7. **Add Analytics**: User behavior tracking
8. **Upgrade Hosting**: Paid tier for no cold starts

### If Adding More Features
1. ✅ **More Shapes**: DONE in PR10
2. **Free-hand Drawing**: Pen/brush tool for sketching
3. **Images**: Upload and embed images on canvas
4. **Persistence**: Save/load canvas sessions to database
5. **Multiple Canvases**: Room system for separate sessions
6. **Permissions**: Private canvases, access control
7. **History**: Undo/redo functionality with command pattern
8. **Export**: Save as PNG/SVG
9. **Chat**: Text communication alongside canvas

