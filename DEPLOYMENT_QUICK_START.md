# 🚀 CollabCanvas Amplify Deployment - Quick Start

## Step-by-Step (5 Minutes)

### 1. Open AWS Amplify Console
**Link**: https://console.aws.amazon.com/amplify/home?region=us-east-2

### 2. Create New App
- Click **"New app"** → **"Host web app"**
- Select **"GitHub"**
- Authorize if needed

### 3. Select Repository
- **Repository**: `sainathyai/CollabCanva`
- **Branch**: `pr15-rbac`
- Click **"Next"**

### 4. Configure (Auto-detected)
- **App name**: `collabcanvas-frontend`
- Build settings auto-detected from `amplify.yml`
- Click **"Next"**

### 5. Add Environment Variables (CRITICAL!)

Click **"Advanced settings"** → Add these variables:

```
VITE_WS_URL = ws://collabcanvas-alb-1957081275.us-east-2.elb.amazonaws.com
VITE_FIREBASE_API_KEY = AIzaSyDVJdiYewzOcpUoL8COpIG6Cj9cd3q_Lvg
VITE_FIREBASE_AUTH_DOMAIN = collabcanva-730db.firebaseapp.com
VITE_FIREBASE_PROJECT_ID = collabcanva-730db
VITE_FIREBASE_STORAGE_BUCKET = collabcanva-730db.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID = 863766359179
VITE_FIREBASE_APP_ID = 1:863766359179:web:59aff664cd5fccab4c388e
```

### 6. Deploy!
- Click **"Save and deploy"**
- Wait 3-5 minutes
- Get your URL: `https://pr15-rbac.xxxxxx.amplifyapp.com`

---

## ✅ What You'll Get

- **Frontend URL**: `https://pr15-rbac.[random].amplifyapp.com`
- **Auto-deployments**: Every push to `pr15-rbac` branch
- **HTTPS**: Automatic SSL certificate
- **Global CDN**: Fast worldwide access

---

## 🔍 Quick Test

Once deployed:

1. **Open Amplify URL**
2. **Sign in** with Google/Email
3. **Create a project**
4. **Open canvas**
5. **Add shapes** - should sync in real-time!

---

## 📋 Backend Already Running

✅ Backend: `http://collabcanvas-alb-1957081275.us-east-2.elb.amazonaws.com`
✅ Health: `http://collabcanvas-alb-1957081275.us-east-2.elb.amazonaws.com/health`
✅ Status: 2/2 tasks running

---

## 🆘 If Something Goes Wrong

**Build fails?**
- Check Amplify Console → Build logs
- Verify environment variables are set

**WebSocket connection fails?**
- Check `VITE_WS_URL` is correct
- Test backend: `curl http://collabcanvas-alb-1957081275.us-east-2.elb.amazonaws.com/health`

**Auth fails?**
- Verify Firebase env vars
- Check Firebase Console settings

---

## 📖 Full Guide

See `AMPLIFY_DEPLOYMENT_GUIDE.md` for detailed instructions and troubleshooting.

---

**Ready? Start at Step 1! 🎯**

