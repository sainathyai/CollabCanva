# AWS Amplify Frontend Deployment Guide

## Quick Deployment Steps

### Step 1: Open AWS Amplify Console

Go to: https://console.aws.amazon.com/amplify/home?region=us-east-2

### Step 2: Create New App

1. Click **"New app"** → **"Host web app"**
2. Select **"GitHub"** as the repository service
3. Click **"Continue"**
4. Authorize AWS Amplify to access your GitHub account (if not already done)

### Step 3: Select Repository and Branch

1. **Repository**: Select `sainathyai/CollabCanva`
2. **Branch**: Select `pr15-rbac`
3. Click **"Next"**

### Step 4: Configure Build Settings

The build settings should be auto-detected from `amplify.yml`:

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - cd frontend
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: frontend/dist
    files:
      - '**/*'
  cache:
    paths:
      - frontend/node_modules/**/*
```

1. **App name**: `collabcanvas-frontend` (or your choice)
2. **Build settings**: Should match the above (auto-detected)
3. Click **"Next"**

### Step 5: Add Environment Variables

**CRITICAL**: Before saving, add these environment variables:

Click **"Advanced settings"** → **"Environment variables"** → **"Add variable"**

Add the following variables:

| Key | Value |
|-----|-------|
| `VITE_WS_URL` | `ws://collabcanvas-alb-1957081275.us-east-2.elb.amazonaws.com` |
| `VITE_FIREBASE_API_KEY` | `AIzaSyDVJdiYewzOcpUoL8COpIG6Cj9cd3q_Lvg` |
| `VITE_FIREBASE_AUTH_DOMAIN` | `collabcanva-730db.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | `collabcanva-730db` |
| `VITE_FIREBASE_STORAGE_BUCKET` | `collabcanva-730db.firebasestorage.app` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | `863766359179` |
| `VITE_FIREBASE_APP_ID` | `1:863766359179:web:59aff664cd5fccab4c388e` |

### Step 6: Review and Deploy

1. Review all settings
2. Click **"Save and deploy"**
3. Wait for deployment to complete (~3-5 minutes)

### Step 7: Get Your Amplify URL

Once deployment completes, you'll see:

```
✅ Deploy successful!

Your app URL: https://pr15-rbac.xxxxxx.amplifyapp.com
```

**Save this URL** - this is your production frontend URL!

---

## Alternative: Manual Deployment (If GitHub Connection Fails)

If you prefer not to connect GitHub, you can deploy manually:

### Option 1: Amplify CLI

```powershell
# Install Amplify CLI
npm install -g @aws-amplify/cli

# Initialize Amplify
cd frontend
amplify init

# Follow prompts:
# - Environment: production
# - AWS Profile: default

# Publish
amplify publish
```

### Option 2: Manual Hosting

```powershell
# Build locally
cd frontend
npm run build

# The build output will be in frontend/dist/
# You can then upload this to:
# - Amplify Hosting (drag and drop)
# - S3 + CloudFront
# - Vercel
# - Netlify
```

---

## Verify Deployment

Once deployed, test your app:

1. **Open the Amplify URL** in your browser
2. **Sign in** with your Firebase credentials
3. **Create a project** to test the dashboard
4. **Open canvas** to test WebSocket connection
5. **Add objects** to test real-time collaboration

### Check WebSocket Connection

Open browser DevTools (F12) → Console:
- Should see: `WebSocket connection established`
- Should NOT see: `WebSocket connection failed`

If WebSocket fails, verify:
- `VITE_WS_URL` is set correctly in Amplify environment variables
- Backend is running: http://collabcanvas-alb-1957081275.us-east-2.elb.amazonaws.com/health

---

## Troubleshooting

### Build Fails

**Error**: `Cannot find module`
- **Fix**: Check `amplify.yml` build commands are correct
- Verify `frontend/package.json` has all dependencies

**Error**: `Environment variable not defined`
- **Fix**: Add missing env vars in Amplify Console → Environment variables

### WebSocket Connection Fails

**Error**: `WebSocket connection to 'ws://...' failed`
- **Fix**: Check backend is running
- Verify ALB DNS is correct
- Check browser console for CORS errors

### Firebase Auth Fails

**Error**: `Firebase: Error (auth/invalid-api-key)`
- **Fix**: Verify all Firebase env vars are set correctly
- Check Firebase console for correct API key

---

## Post-Deployment

### Update Backend CORS

If you see CORS errors, update backend to allow Amplify domain:

```powershell
# Get your Amplify URL
$amplifyUrl = "https://pr15-rbac.xxxxxx.amplifyapp.com"

# Update SSM parameter
aws ssm put-parameter \
  --name "/collabcanvas/prod/allowed-origins" \
  --value "http://localhost:5173,https://*.amplifyapp.com,$amplifyUrl" \
  --type String \
  --overwrite \
  --region us-east-2

# Restart backend
aws ecs update-service \
  --cluster collabcanvas-cluster \
  --service collabcanvas-backend-service \
  --force-new-deployment \
  --region us-east-2
```

### Enable Automatic Deployments

Amplify will automatically deploy when you push to `pr15-rbac` branch:

```bash
# Make changes
git add .
git commit -m "Update feature"
git push origin pr15-rbac

# Amplify auto-deploys in ~3 minutes
```

### Monitor Deployments

- **Amplify Console**: https://console.aws.amazon.com/amplify
- **Build logs**: Click on your app → Build history
- **Domain management**: App settings → Domain management

---

## URLs to Remember

| Service | URL |
|---------|-----|
| **Frontend (Amplify)** | `https://pr15-rbac.xxxxxx.amplifyapp.com` (you'll get this after deployment) |
| **Backend API** | `http://collabcanvas-alb-1957081275.us-east-2.elb.amazonaws.com` |
| **Backend Health** | `http://collabcanvas-alb-1957081275.us-east-2.elb.amazonaws.com/health` |
| **WebSocket** | `ws://collabcanvas-alb-1957081275.us-east-2.elb.amazonaws.com` |
| **Amplify Console** | https://console.aws.amazon.com/amplify/home?region=us-east-2 |
| **GitHub Repo** | https://github.com/sainathyai/CollabCanva |

---

## Expected Deployment Time

- **Build**: 2-3 minutes
- **Deploy**: 1-2 minutes
- **Total**: **3-5 minutes**

---

## Success Checklist

- [ ] Amplify app created
- [ ] GitHub repository connected (branch: `pr15-rbac`)
- [ ] Environment variables configured
- [ ] Build successful
- [ ] Deployment successful
- [ ] Amplify URL accessible
- [ ] Login works (Firebase auth)
- [ ] Dashboard loads
- [ ] Canvas connects to WebSocket
- [ ] Real-time updates work

---

## Next Steps After Deployment

1. **Test the full application** end-to-end
2. **Update Firebase credentials** in backend (currently using placeholders)
3. **Configure custom domain** (optional)
4. **Enable HTTPS** for WebSocket (upgrade to WSS)
5. **Set up monitoring** and alerts

---

## Need Help?

**AWS Support**:
- Amplify Console: https://console.aws.amazon.com/amplify
- Build logs: Check in Amplify app → Build history

**Documentation**:
- `DEPLOYMENT_COMPLETE.md` - Backend deployment summary
- `AWS_DEPLOYMENT_STATUS.md` - Infrastructure monitoring
- `aws-config.json` - Infrastructure configuration

---

*Ready to deploy? Follow Step 1 above!*

