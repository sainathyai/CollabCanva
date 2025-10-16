# Docker Setup Guide for CollabCanvas

This guide explains how to run CollabCanvas using Docker containers, which eliminates all environment setup issues.

## Prerequisites

- Docker Desktop installed (includes Docker Compose)
  - Windows: https://docs.docker.com/desktop/install/windows-install/
  - Mac: https://docs.docker.com/desktop/install/mac-install/
  - Linux: https://docs.docker.com/desktop/install/linux-install/

## Quick Start

### 1. Setup Environment Variables

Copy the example environment file:
```bash
cp .env.docker.example .env
```

Edit `.env` and add your Firebase credentials (see `docs/FIREBASE_SETUP_GUIDE.md`).

### 2. Start Development Environment

```bash
docker-compose up
```

Or run in detached mode (background):
```bash
docker-compose up -d
```

**That's it!** The application will be available at:
- Frontend: http://localhost:5173
- Backend WebSocket: ws://localhost:8080

### 3. Stop the Application

```bash
docker-compose down
```

To also remove volumes (clean slate):
```bash
docker-compose down -v
```

## Docker Architecture

### Services

#### Frontend Container
- **Base Image**: Node 18 Alpine
- **Port**: 5173
- **Features**:
  - Hot reload enabled (changes reflect immediately)
  - All npm packages installed (including Konva)
  - React 19.2.0, Konva 10.0.2, React Konva 19.0.10

#### Backend Container
- **Base Image**: Node 18 Alpine
- **Port**: 8080
- **Features**:
  - WebSocket server with hot reload
  - TypeScript compilation
  - Firebase Admin SDK

### Volumes

Both containers use named volumes for `node_modules` to:
- Speed up container builds
- Persist installed packages between rebuilds
- Avoid platform-specific binary conflicts

Source code is mounted for hot reload during development.

## Commands Reference

### Development

```bash
# Start services
docker-compose up

# Start in background
docker-compose up -d

# View logs
docker-compose logs -f

# View logs for specific service
docker-compose logs -f frontend
docker-compose logs -f backend

# Stop services
docker-compose down

# Rebuild containers (after dependency changes)
docker-compose up --build

# Execute command in running container
docker-compose exec frontend npm install new-package
docker-compose exec backend npm run test
```

### Production

```bash
# Build and run production containers
docker-compose -f docker-compose.prod.yml up --build

# Run in background
docker-compose -f docker-compose.prod.yml up -d

# Stop production containers
docker-compose -f docker-compose.prod.yml down
```

## Troubleshooting

### Port Already in Use

If you get "port already in use" errors:

```bash
# Check what's using the port (Windows PowerShell)
netstat -ano | findstr :5173
netstat -ano | findstr :8080

# Stop the process or change ports in docker-compose.yml
ports:
  - "5174:5173"  # Map to different host port
```

### Package Installation Fails

```bash
# Remove volumes and rebuild
docker-compose down -v
docker-compose up --build
```

### Changes Not Reflecting

```bash
# Ensure volumes are mounted correctly
docker-compose down
docker-compose up
```

### Firebase Connection Issues

Make sure `.env` file has correct Firebase credentials and is in the project root.

### WebSocket Connection Failed

Check that:
1. Backend container is running: `docker-compose ps`
2. Backend logs show no errors: `docker-compose logs backend`
3. CORS origins are correct in `.env`

## File Structure

```
CollabCanvas/
├── docker-compose.yml           # Development setup
├── docker-compose.prod.yml      # Production setup
├── .dockerignore                # Files to exclude from containers
├── .env.docker.example          # Environment template
├── .env                         # Your actual environment (not committed)
│
├── frontend/
│   ├── Dockerfile               # Development frontend image
│   ├── Dockerfile.prod          # Production frontend image
│   ├── nginx.conf               # Nginx config for production
│   └── ...
│
└── backend/
    ├── Dockerfile               # Production backend image
    ├── Dockerfile.dev           # Development backend image
    └── ...
```

## Advantages of Docker Setup

✅ **No Manual Setup**: No need to install Node, npm, or packages
✅ **Consistent Environment**: Same setup works on Windows, Mac, Linux
✅ **Isolated Dependencies**: No conflicts with other projects
✅ **Easy Cleanup**: Remove everything with one command
✅ **Version Control**: Node 18, npm versions locked in Dockerfile
✅ **Hot Reload**: Code changes reflect immediately
✅ **Production Ready**: Same setup works for deployment

## Production Deployment

For production, use `docker-compose.prod.yml` which:
- Uses optimized production builds
- Serves frontend with Nginx (fast static file serving)
- Enables gzip compression
- Sets proper caching headers
- Runs on ports 80 (frontend) and 8080 (backend)

## Next Steps

After starting the containers:

1. Open http://localhost:5173 in your browser
2. Sign in with Google OAuth
3. Test PR10 features (shapes, transforms, multi-select)
4. Open second browser for multi-user testing

See `docs/SMOKE_TEST.md` for detailed testing scenarios.

