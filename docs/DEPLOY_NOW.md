# Quick Deployment Guide - CollabCanvas

Follow these steps to deploy your app to production in ~30 minutes.

## ✅ Prerequisites Checklist

- [ ] GitHub account with repo access
- [ ] Firebase project created (see FIREBASE_SETUP_GUIDE.md)
- [ ] Firebase Authentication enabled with Google provider
- [ ] Firebase credentials ready

## 🚀 Step 1: Deploy Backend to Render (10 minutes)

### 1.1 Create Render Account

1. Go to: https://render.com
2. Click **"Get Started"**
3. Sign up with GitHub (recommended)
4. Authorize Render to access your repositories

### 1.2 Create Web Service

1. From Render Dashboard, click **"New +"** → **"Web Service"**
2. Connect your GitHub repository: `sainathyai/CollabCanva`
3. Configure the service:

```
Name: collabcanva-backend
Region: Oregon (US West) or closest to you
Branch: main (or pr8-deployment for testing)
Root Directory: backend
Environment: Node
Build Command: npm ci --include=dev && npm run build
Start Command: NODE_ENV=production node dist/server.js
Instance Type: Free
```

### 1.3 Add Environment Variables

Click **"Advanced"** → **"Add Environment Variable"**

Add these 2 variables:

```
PORT=8080
FIREBASE_PROJECT_ID=your-firebase-project-id
```

**Note:** We DON'T add `NODE_ENV` as an environment variable because it's set in the start command.

**IMPORTANT:** Leave `ALLOWED_ORIGINS` empty for now (we'll add it after frontend deployment)

### 1.4 Deploy

1. Click **"Create Web Service"**
2. Wait for deployment (5-10 minutes first time)
3. You'll see logs showing build progress
4. Once deployed, copy your backend URL: `https://collabcanva-backend-xxxx.onrender.com`

### 1.5 Test Backend

In your browser or terminal, test the health endpoint:

```bash
curl https://YOUR-BACKEND-URL.onrender.com/health
```

Should return:
```json
{"status":"ok","timestamp":1234567890,"uptime":123}
```

---

## 🎨 Step 2: Deploy Frontend to Vercel (10 minutes)

### 2.1 Create Vercel Account

1. Go to: https://vercel.com
2. Click **"Sign Up"**
3. Sign up with GitHub (recommended)
4. Authorize Vercel to access your repositories

### 2.2 Import Project

1. From Vercel Dashboard, click **"Add New..."** → **"Project"**
2. Import `sainathyai/CollabCanva` repository
3. Configure project settings:

```
Framework Preset: Vite
Root Directory: frontend
Build Command: npm run build (default)
Output Directory: dist (default)
Install Command: npm install (default)
```

### 2.3 Add Environment Variables

Click **"Environment Variables"** and add these:

```
VITE_WS_URL=wss://YOUR-BACKEND-URL.onrender.com
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

**IMPORTANT:** Replace:
- `YOUR-BACKEND-URL.onrender.com` with your actual Render backend URL from Step 1
- All Firebase values with your actual credentials

### 2.4 Deploy

1. Click **"Deploy"**
2. Wait for build (3-5 minutes)
3. Once deployed, copy your frontend URL: `https://your-app.vercel.app`

---

## 🔗 Step 3: Wire Backend and Frontend Together

### 3.1 Update Backend CORS

1. Go back to Render Dashboard
2. Navigate to your `collabcanva-backend` service
3. Click **"Environment"** tab
4. Add a new environment variable:

```
ALLOWED_ORIGINS=https://your-app.vercel.app
```

Replace `your-app.vercel.app` with your actual Vercel URL

5. Click **"Save Changes"**
6. Render will automatically redeploy (takes 2-3 minutes)

### 3.2 Update Firebase Authorized Domains

1. Go to Firebase Console: https://console.firebase.google.com/
2. Select your project
3. Navigate to **Authentication** → **Settings** → **Authorized domains**
4. Click **"Add domain"**
5. Add your Vercel domain: `your-app.vercel.app` (without https://)
6. Click **"Add"**

---

## ✅ Step 4: Test Your Deployment

### 4.1 Basic Smoke Test

1. Open your Vercel URL in a browser: `https://your-app.vercel.app`
2. You should see the login page
3. Open browser DevTools → Console (F12)
4. Click **"Sign in with Google"**
5. Complete Google OAuth flow
6. Should redirect to Canvas page
7. Check console for connection messages

### 4.2 Multi-User Test

1. Open your app in two different browsers (or Chrome + Chrome Incognito)
2. Sign in with different Google accounts in each
3. Test these features:
   - ✅ Both users can see the canvas
   - ✅ Click "Add Rectangle" in Browser 1 → appears in Browser 2
   - ✅ Drag a rectangle in Browser 1 → updates in Browser 2
   - ✅ Delete in Browser 2 → disappears in Browser 1
   - ✅ Move mouse in Browser 1 → see cursor in Browser 2
   - ✅ Cursor shows correct name label

### 4.3 Check Logs

**Backend Logs (Render):**
1. Render Dashboard → Your service → **"Logs"** tab
2. Look for:
   - `Server started on port 8080`
   - `WebSocket upgrade request from: https://your-app.vercel.app`
   - `User authenticated and initial state sent`

**Frontend Logs (Browser):**
1. Open DevTools → Console
2. Look for:
   - `Connected to WebSocket server`
   - `Authenticated successfully`
   - No error messages

---

## 🎉 Success Checklist

- [ ] Backend deployed and responding at `/health`
- [ ] Frontend deployed and loading
- [ ] Google sign-in works
- [ ] Redirects to canvas after auth
- [ ] WebSocket connects (check console)
- [ ] Objects sync between two browsers
- [ ] Cursors visible and labeled
- [ ] No errors in browser console
- [ ] No errors in Render logs

---

## 🚨 Troubleshooting

### Backend won't deploy
- Check Render logs for build errors
- Verify `backend/` directory structure
- Ensure `package.json` has build script

### Frontend won't deploy
- Check Vercel logs for build errors
- Verify all environment variables are set
- Ensure Node version is 18+ in Vercel settings

### WebSocket connection fails
- Verify `VITE_WS_URL` uses `wss://` (not `ws://`)
- Check `ALLOWED_ORIGINS` in Render includes your Vercel URL
- Test backend health endpoint directly

### Authentication fails
- Verify Firebase credentials are correct
- Check Firebase Authorized Domains includes Vercel domain
- Ensure Google provider is enabled in Firebase

### Objects don't sync
- Check WebSocket connection is established (console)
- Verify backend logs show connected clients
- Test with two separate browsers/devices

---

## 📊 Your Deployment URLs

Fill these in as you deploy:

```
Frontend URL: https://_________________________.vercel.app
Backend URL:  https://_________________________.onrender.com
Firebase Project: _________________________
```

---

## 💡 Next Steps After Successful Deployment

1. Share your app URL for testing
2. Monitor Render logs for issues
3. Consider upgrading Render to paid tier ($7/mo) if cold starts are annoying
4. Set up custom domain (optional)
5. Add error monitoring (e.g., Sentry)

---

## ⏱️ Expected Timeline

- **Backend deployment:** 10 minutes
- **Frontend deployment:** 10 minutes
- **Configuration & wiring:** 5 minutes
- **Testing:** 5 minutes
- **Total:** ~30 minutes

---

## 💰 Cost

- **Render Free:** $0 (with 15-min sleep after inactivity)
- **Vercel Free:** $0 (generous limits)
- **Firebase Auth:** $0 (unlimited)
- **Total:** $0/month

---

Good luck! 🚀

If you encounter any issues, check the detailed guide in `docs/DEPLOYMENT.md` or open an issue.

