# CollabCanvas Deployment Guide

This guide provides step-by-step instructions for deploying CollabCanvas to production.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Prerequisites](#prerequisites)
3. [Frontend Deployment (Vercel)](#frontend-deployment-vercel)
4. [Backend Deployment](#backend-deployment)
   - [Option 1: Render](#option-1-render)
   - [Option 2: Fly.io](#option-2-flyio)
   - [Option 3: Railway](#option-3-railway)
   - [Option 4: Docker (Self-Hosted)](#option-4-docker-self-hosted)
5. [Environment Variables Reference](#environment-variables-reference)
6. [Post-Deployment Checklist](#post-deployment-checklist)
7. [Monitoring and Maintenance](#monitoring-and-maintenance)
8. [Troubleshooting](#troubleshooting)

## Architecture Overview

```
User Browser
     ↓ (HTTPS/WSS)
Frontend (Vercel)
     ↓ (WebSocket - WSS)
Backend (Render/Fly.io)
     ↓ (Auth Verification)
Firebase Auth
```

## Prerequisites

- GitHub account with repository access
- Firebase project with Authentication enabled
- Vercel account (for frontend)
- Render/Fly.io/Railway account (for backend)
- Git installed locally

## Frontend Deployment (Vercel)

### Step 1: Prepare Repository

```bash
# Ensure your code is committed and pushed
git add .
git commit -m "Prepare for deployment"
git push origin main
```

### Step 2: Create Vercel Project

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New..."** → **"Project"**
3. Import your GitHub repository
4. Configure project settings:
   - **Framework Preset:** Vite
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build` (default)
   - **Output Directory:** `dist` (default)
   - **Install Command:** `npm install` (default)

### Step 3: Configure Environment Variables

In Vercel Project Settings → Environment Variables, add the following:

| Variable | Value | Environment |
|----------|-------|-------------|
| `VITE_WS_URL` | `wss://your-backend.onrender.com` | Production |
| `VITE_FIREBASE_API_KEY` | Your Firebase API key | All |
| `VITE_FIREBASE_AUTH_DOMAIN` | `your-project.firebaseapp.com` | All |
| `VITE_FIREBASE_PROJECT_ID` | Your Firebase project ID | All |
| `VITE_FIREBASE_STORAGE_BUCKET` | `your-project.appspot.com` | All |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Your sender ID | All |
| `VITE_FIREBASE_APP_ID` | Your app ID | All |

> ⚠️ **Note:** Set `VITE_WS_URL` after deploying the backend

### Step 4: Deploy

1. Click **"Deploy"**
2. Wait for build to complete
3. Your app will be available at `https://your-app.vercel.app`

### Step 5: Update Firebase

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Navigate to **Authentication** → **Settings** → **Authorized domains**
3. Add your Vercel domain: `your-app.vercel.app`

## Backend Deployment

### Option 1: Render

#### Using Render Dashboard

1. **Create New Web Service**
   - Go to [Render Dashboard](https://dashboard.render.com/)
   - Click **"New +"** → **"Web Service"**
   - Connect your GitHub repository
   - Select the branch to deploy (e.g., `main`)

2. **Configure Service**
   - **Name:** `collabcanva-backend`
   - **Root Directory:** `backend`
   - **Environment:** `Node`
   - **Region:** Choose closest to your users
   - **Branch:** `main`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `node dist/index.js`
   - **Plan:** Free (or Starter for production traffic)

3. **Add Environment Variables**
   ```
   NODE_ENV=production
   PORT=8080
   ALLOWED_ORIGINS=https://your-app.vercel.app
   FIREBASE_PROJECT_ID=your-firebase-project-id
   ```

4. **Deploy**
   - Click **"Create Web Service"**
   - Wait for deployment to complete
   - Your backend will be at `https://collabcanva-backend.onrender.com`

5. **Update Frontend**
   - Return to Vercel
   - Update `VITE_WS_URL` environment variable to `wss://collabcanva-backend.onrender.com`
   - Trigger redeploy in Vercel

#### Using render.yaml

1. Add `render.yaml` to backend directory (already included)
2. In Render Dashboard, click **"New +"** → **"Blueprint"**
3. Connect your repository
4. Render will automatically detect `render.yaml`
5. Set environment variables manually in dashboard

### Option 2: Fly.io

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

3. **Navigate to Backend**
   ```bash
   cd backend
   ```

4. **Launch Application**
   ```bash
   fly launch
   ```
   - App name: `collabcanva-backend` (or your choice)
   - Region: Choose closest to your users
   - PostgreSQL: No (we use in-memory state)
   - Redis: No
   - Deploy now: No (we need to set secrets first)

5. **Set Secrets**
   ```bash
   fly secrets set NODE_ENV=production
   fly secrets set ALLOWED_ORIGINS=https://your-app.vercel.app
   fly secrets set FIREBASE_PROJECT_ID=your-firebase-project-id
   ```

6. **Deploy**
   ```bash
   fly deploy
   ```

7. **Verify Deployment**
   ```bash
   fly status
   fly logs
   ```

8. **Update Frontend**
   - Your backend is at `https://collabcanva-backend.fly.dev`
   - Update Vercel `VITE_WS_URL` to `wss://collabcanva-backend.fly.dev`
   - Redeploy frontend

### Option 3: Railway

1. **Create Account**
   - Go to [Railway.app](https://railway.app)
   - Sign up with GitHub

2. **New Project**
   - Click **"New Project"**
   - Select **"Deploy from GitHub repo"**
   - Choose your repository

3. **Configure Service**
   - Railway auto-detects Node.js
   - Set root directory: `backend`
   - Build command: `npm install && npm run build`
   - Start command: `node dist/index.js`

4. **Add Environment Variables**
   ```
   NODE_ENV=production
   ALLOWED_ORIGINS=https://your-app.vercel.app
   FIREBASE_PROJECT_ID=your-firebase-project-id
   ```

5. **Deploy**
   - Railway auto-deploys on push
   - Get your domain from Railway dashboard
   - Update Vercel `VITE_WS_URL`

### Option 4: Docker (Self-Hosted)

1. **Build Image**
   ```bash
   cd backend
   docker build -t collabcanva-backend .
   ```

2. **Run Container**
   ```bash
   docker run -d \
     --name collabcanva-backend \
     -p 8080:8080 \
     -e NODE_ENV=production \
     -e ALLOWED_ORIGINS=https://your-app.vercel.app \
     -e FIREBASE_PROJECT_ID=your-firebase-project-id \
     --restart unless-stopped \
     collabcanva-backend
   ```

3. **Using Docker Compose**
   
   Create `docker-compose.yml`:
   ```yaml
   version: '3.8'
   
   services:
     backend:
       build: ./backend
       ports:
         - "8080:8080"
       environment:
         - NODE_ENV=production
         - ALLOWED_ORIGINS=https://your-app.vercel.app
         - FIREBASE_PROJECT_ID=${FIREBASE_PROJECT_ID}
       restart: unless-stopped
       healthcheck:
         test: ["CMD", "curl", "-f", "http://localhost:8080/health"]
         interval: 30s
         timeout: 10s
         retries: 3
   ```

   Run:
   ```bash
   docker-compose up -d
   ```

4. **Setup Reverse Proxy (Nginx)**
   
   Configure Nginx for SSL and WebSocket:
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       return 301 https://$server_name$request_uri;
   }

   server {
       listen 443 ssl http2;
       server_name your-domain.com;

       ssl_certificate /path/to/cert.pem;
       ssl_certificate_key /path/to/key.pem;

       location / {
           proxy_pass http://localhost:8080;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection "upgrade";
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }
   }
   ```

## Environment Variables Reference

### Frontend (Vercel)

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `VITE_WS_URL` | Yes | WebSocket backend URL | `wss://backend.onrender.com` |
| `VITE_FIREBASE_API_KEY` | Yes | Firebase API key | `AIzaSy...` |
| `VITE_FIREBASE_AUTH_DOMAIN` | Yes | Firebase auth domain | `project.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | Yes | Firebase project ID | `my-project-id` |
| `VITE_FIREBASE_STORAGE_BUCKET` | Yes | Firebase storage | `project.appspot.com` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Yes | FCM sender ID | `123456789` |
| `VITE_FIREBASE_APP_ID` | Yes | Firebase app ID | `1:123:web:abc` |

### Backend (Render/Fly.io/Railway)

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `NODE_ENV` | Yes | Environment | `production` |
| `PORT` | No* | Server port | `8080` (auto-set by platform) |
| `ALLOWED_ORIGINS` | Yes | CORS origins | `https://app.vercel.app` |
| `FIREBASE_PROJECT_ID` | No** | Firebase project | `my-project-id` |

\* PORT is usually provided by the platform  
\** Optional - leave empty for mock auth in development

## Post-Deployment Checklist

### 1. Backend Health Check

```bash
# Should return {"status":"ok",...}
curl https://your-backend.onrender.com/health
```

### 2. WebSocket Connection

- Open browser DevTools → Console
- Navigate to your frontend URL
- Look for: `"Connected to WebSocket server"`
- Should not see connection errors

### 3. Authentication Flow

- Click "Sign in with Google"
- Complete Google OAuth flow
- Should redirect to Canvas page
- Check console for: `"User authenticated and initial state sent"`

### 4. Multi-User Testing

1. Open app in two different browsers (or incognito)
2. Sign in with different Google accounts
3. Verify:
   - Both users see each other's cursors
   - Cursor names display correctly
   - Objects sync in real-time
   - Object creation/deletion works
   - Drag and drop syncs

### 5. Performance Check

- Check backend logs for errors
- Monitor response times
- Verify WebSocket messages are flowing
- Test with 3-5 concurrent users

## Monitoring and Maintenance

### Logging

**Render:**
- View logs in Render Dashboard → Service → Logs
- Logs persist for 7 days on free plan

**Fly.io:**
```bash
fly logs
fly logs -a collabcanva-backend
```

**Docker:**
```bash
docker logs -f collabcanva-backend
```

### Metrics to Monitor

- WebSocket connection count
- Authentication success rate
- Message throughput
- Memory usage
- CPU usage
- Error rates

### Scaling Considerations

**Current Implementation:**
- Single server
- In-memory state
- Good for ~50 concurrent users

**To Scale:**
- Add Redis for shared state
- Implement sticky sessions
- Use load balancer
- Consider managed WebSocket service (e.g., Pusher, Ably)

## Troubleshooting

### WebSocket Connection Failed

**Symptoms:**
- Console error: "WebSocket connection failed"
- Status shows "Disconnected"

**Solutions:**
1. Verify backend is running: `curl https://backend/health`
2. Check `VITE_WS_URL` uses `wss://` (not `ws://`)
3. Verify CORS: `ALLOWED_ORIGINS` includes frontend URL
4. Check backend logs for connection attempts

### Authentication Not Working

**Symptoms:**
- Redirect loop after Google sign-in
- "Authentication failed" error

**Solutions:**
1. Verify Firebase config in Vercel is correct
2. Check Firebase Authorized Domains includes Vercel domain
3. Ensure Firebase Authentication is enabled
4. Check browser console for Firebase errors

### Objects Not Syncing

**Symptoms:**
- Objects appear locally but not for other users
- Changes don't propagate

**Solutions:**
1. Check authentication is successful
2. Verify WebSocket connection is active
3. Check backend logs for message handling
4. Ensure object operations are sent after AUTH_SUCCESS

### Render Free Tier Sleeping

**Symptoms:**
- First request takes 30-60 seconds
- Backend "wakes up" slowly

**Solutions:**
1. Upgrade to Render Starter plan ($7/mo) for always-on
2. Use uptime monitoring (e.g., UptimeRobot) to ping every 10 minutes
3. Accept cold starts on free tier

### High Latency

**Symptoms:**
- Cursor lag
- Delayed object updates

**Solutions:**
1. Choose backend region closest to users
2. Reduce cursor update throttle (Canvas.tsx)
3. Consider CDN for frontend
4. Monitor backend CPU/memory

## Support

For issues or questions:
- Check backend logs first
- Review browser console errors
- Test locally to isolate deployment issues
- Verify all environment variables are set correctly

## Next Steps

After successful deployment:
1. Set up monitoring (e.g., Sentry for error tracking)
2. Configure custom domain (optional)
3. Implement analytics (e.g., Google Analytics)
4. Add user feedback mechanism
5. Plan for persistence (Firestore/PostgreSQL)

