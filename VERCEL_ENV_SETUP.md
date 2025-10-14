# Vercel Environment Variables Setup

## 📋 Quick Copy-Paste for Vercel

When deploying to Vercel, add these environment variables in the Vercel dashboard:

**Path:** Project Settings → Environment Variables → Add New

---

## 🔧 Environment Variables to Add:

### 1. WebSocket URL (Update after backend is deployed)
```
VITE_WS_URL=wss://YOUR-RENDER-BACKEND-URL.onrender.com
```
**Replace with your actual Render backend URL!**
Example: `wss://collabcanva-backend-abc123.onrender.com`

---

### 2. Firebase API Key
```
VITE_FIREBASE_API_KEY=YOUR_FIREBASE_API_KEY_HERE
```

---

### 3. Firebase Auth Domain
```
VITE_FIREBASE_AUTH_DOMAIN=YOUR_PROJECT_ID.firebaseapp.com
```

---

### 4. Firebase Project ID
```
VITE_FIREBASE_PROJECT_ID=YOUR_PROJECT_ID
```

---

### 5. Firebase Storage Bucket
```
VITE_FIREBASE_STORAGE_BUCKET=YOUR_PROJECT_ID.appspot.com
```

---

### 6. Firebase Messaging Sender ID
```
VITE_FIREBASE_MESSAGING_SENDER_ID=YOUR_SENDER_ID
```

---

### 7. Firebase App ID
```
VITE_FIREBASE_APP_ID=YOUR_APP_ID
```

---

## 🔍 How to Find Your Firebase Credentials:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click the **gear icon** (⚙️) → **Project Settings**
4. Scroll down to **"Your apps"**
5. Click on your web app or add one if you haven't
6. Copy the `firebaseConfig` object values

It will look like this:
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyA...",                    // ← VITE_FIREBASE_API_KEY
  authDomain: "project.firebaseapp.com",   // ← VITE_FIREBASE_AUTH_DOMAIN
  projectId: "project-id",                 // ← VITE_FIREBASE_PROJECT_ID
  storageBucket: "project.appspot.com",    // ← VITE_FIREBASE_STORAGE_BUCKET
  messagingSenderId: "123456789",          // ← VITE_FIREBASE_MESSAGING_SENDER_ID
  appId: "1:123:web:abc"                   // ← VITE_FIREBASE_APP_ID
};
```

---

## ⚡ Quick Setup Steps:

### Step 1: Get Your Render Backend URL
From your Render dashboard, copy the URL (it looks like):
```
https://collabcanva-backend-xxxx.onrender.com
```

### Step 2: Add to Vercel
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your CollabCanvas project (or import it first)
3. Go to **Settings** → **Environment Variables**
4. Add each variable above
5. **Important:** Set them for **Production**, **Preview**, and **Development**

### Step 3: Deploy
Click **"Deploy"** or push to trigger deployment

---

## 📝 Environment Variables Checklist

Before deploying, make sure you have:

- [ ] `VITE_WS_URL` - Your Render backend URL with `wss://` protocol
- [ ] `VITE_FIREBASE_API_KEY` - From Firebase Console
- [ ] `VITE_FIREBASE_AUTH_DOMAIN` - From Firebase Console
- [ ] `VITE_FIREBASE_PROJECT_ID` - From Firebase Console
- [ ] `VITE_FIREBASE_STORAGE_BUCKET` - From Firebase Console
- [ ] `VITE_FIREBASE_MESSAGING_SENDER_ID` - From Firebase Console
- [ ] `VITE_FIREBASE_APP_ID` - From Firebase Console
- [ ] All variables set for **Production** environment
- [ ] Render backend is running and accessible

---

## 🚨 Common Mistakes:

1. **Using `ws://` instead of `wss://`** for VITE_WS_URL in production
   - ❌ `ws://backend.onrender.com`
   - ✅ `wss://backend.onrender.com`

2. **Forgetting to include the protocol**
   - ❌ `backend.onrender.com`
   - ✅ `wss://backend.onrender.com`

3. **Not setting environment for all deployment targets**
   - Make sure to check **Production**, **Preview**, and **Development**

4. **Using quotes around values in Vercel UI**
   - ❌ `"wss://backend.onrender.com"`
   - ✅ `wss://backend.onrender.com`

---

## 🎯 Expected Format in Vercel:

| Key | Value (Example) | Environments |
|-----|----------------|--------------|
| `VITE_WS_URL` | `wss://collabcanva-backend-abc.onrender.com` | Production, Preview, Development |
| `VITE_FIREBASE_API_KEY` | `AIzaSyAbC123...` | Production, Preview, Development |
| `VITE_FIREBASE_AUTH_DOMAIN` | `collabcanvas-123.firebaseapp.com` | Production, Preview, Development |
| `VITE_FIREBASE_PROJECT_ID` | `collabcanvas-123` | Production, Preview, Development |
| `VITE_FIREBASE_STORAGE_BUCKET` | `collabcanvas-123.appspot.com` | Production, Preview, Development |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | `123456789012` | Production, Preview, Development |
| `VITE_FIREBASE_APP_ID` | `1:123456:web:abc123` | Production, Preview, Development |

---

## ✅ Testing Your Setup:

After deployment, check browser console:
1. Should see: `Connected to WebSocket server`
2. Should NOT see: `WebSocket connection failed`
3. Firebase auth should work without errors

---

## 📚 Additional Resources:

- [Vercel Environment Variables Docs](https://vercel.com/docs/concepts/projects/environment-variables)
- [Firebase Web Setup](https://firebase.google.com/docs/web/setup)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)

---

**Ready to deploy?** Follow the steps above and you'll have your frontend live in minutes! 🚀

