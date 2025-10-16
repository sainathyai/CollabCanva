# Firebase Setup Guide - Get Your Credentials

This guide will walk you through setting up Firebase and getting the credentials needed for CollabCanvas authentication.

---

## 📋 Step-by-Step Instructions

### Step 1: Create a Firebase Account & Project

1. **Go to Firebase Console**
   - Open your browser and visit: https://console.firebase.google.com/
   - Sign in with your Google account

2. **Create a New Project**
   - Click **"Add project"** or **"Create a project"**
   - Enter project name: `CollabCanvas` (or any name you prefer)
   - Click **Continue**
   
3. **Google Analytics (Optional)**
   - You can disable Google Analytics for this project (not required for MVP)
   - Click **Create project**
   - Wait for the project to be created (takes ~30 seconds)
   - Click **Continue** when done

---

### Step 2: Register Your Web App

1. **Add a Web App**
   - From your Firebase project dashboard
   - Click the **web icon** (`</>`) in the center or under "Get started by adding Firebase to your app"
   - Or go to **Project Settings** (gear icon) → **General** → scroll down to "Your apps"

2. **Register App**
   - App nickname: `CollabCanvas Web`
   - ✅ Check **"Also set up Firebase Hosting"** (optional, but useful for deployment)
   - Click **Register app**

3. **Get Your Firebase Config**
   - You'll see a code snippet that looks like this:
   
   ```javascript
   const firebaseConfig = {
     apiKey: "AIzaSyAbC123dEf456gHi789jKl012mNo345pQr",
     authDomain: "collabcanvas-12345.firebaseapp.com",
     projectId: "collabcanvas-12345",
     storageBucket: "collabcanvas-12345.appspot.com",
     messagingSenderId: "123456789012",
     appId: "1:123456789012:web:abc123def456"
   };
   ```

4. **Copy These Values** (you'll need them in Step 5)
   - `apiKey`
   - `authDomain`
   - `projectId`
   - Click **Continue to console**

---

### Step 3: Enable Google Authentication

1. **Navigate to Authentication**
   - In the left sidebar, click **Build** → **Authentication**
   - Click **Get started** (if first time)

2. **Enable Google Sign-In**
   - Click the **Sign-in method** tab at the top
   - Find **Google** in the providers list
   - Click on **Google**
   - Toggle the **Enable** switch to ON
   - **Project support email**: Select your email from dropdown
   - Click **Save**

3. **Verify Setup**
   - Google should now show as "Enabled" in the Sign-in providers list

---

### Step 4: Configure Authorized Domains

1. **Still in Authentication**
   - Click the **Settings** tab
   - Scroll down to **Authorized domains**

2. **Add Localhost (for development)**
   - `localhost` should already be there by default
   - If not, click **Add domain** and add `localhost`

3. **For Production** (when you deploy later)
   - Add your production domain (e.g., `your-app.vercel.app`)
   - Add your network IP if testing on other devices (e.g., `192.168.1.13`)

---

### Step 5: Update Your .env File

1. **Open Your Project**
   - Navigate to: `CollabCanva/frontend/.env`

2. **Replace the placeholder values** with your actual Firebase credentials:

   ```bash
   # Firebase Configuration
   VITE_FIREBASE_API_KEY=AIzaSyAbC123dEf456gHi789jKl012mNo345pQr
   VITE_FIREBASE_AUTH_DOMAIN=collabcanvas-12345.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=collabcanvas-12345
   
   # WebSocket URL (for future backend)
   VITE_WS_URL=ws://localhost:8080
   ```

3. **Save the file**

---

### Step 6: Test Your Setup

1. **Restart Your Dev Server**
   ```powershell
   # In your terminal, navigate to frontend folder
   cd "C:\Users\Borehole Seismic\Documents\Gauntlet AI\CollabCanva\frontend"
   
   # Start the dev server
   npm run dev
   ```

2. **Test Authentication**
   - Open http://localhost:5173/
   - Click **"Sign in with Google"**
   - A Google OAuth popup should appear
   - Select your Google account
   - Grant permissions
   - You should be redirected to `/canvas`
   - Your name should appear in the header with a "Sign Out" button

---

## 🔍 Troubleshooting

### Issue: "Auth domain is not configured"
- **Solution**: Make sure `authDomain` in `.env` matches exactly from Firebase console
- Check for typos in the domain name

### Issue: "This domain is not authorized"
- **Solution**: Add your domain to Authorized domains in Firebase Console
- Go to Authentication → Settings → Authorized domains

### Issue: Popup blocked by browser
- **Solution**: Allow popups for localhost in your browser settings
- Or look for the popup blocker icon in your browser's address bar

### Issue: "API key not valid"
- **Solution**: Double-check that you copied the API key correctly
- No spaces or quotes around the value in `.env`
- Restart your dev server after changing `.env`

### Issue: Sign in works but no user info shows
- **Solution**: Check browser console (F12) for errors
- Verify Firebase initialization in `frontend/src/main.tsx`

---

## 📸 Visual Guide - Where to Find Things

### Finding Your Firebase Config:
1. Firebase Console → Click your project
2. Click **gear icon** ⚙️ (Project Settings)
3. Scroll down to **"Your apps"** section
4. Click on your web app name
5. Find the **SDK setup and configuration** section
6. Select **"Config"** radio button
7. Copy the values from the `firebaseConfig` object

### Enabling Google Auth:
1. Firebase Console → Your project
2. Left sidebar → **Authentication**
3. Top tabs → **Sign-in method**
4. Provider list → **Google** → Click to edit
5. Toggle **Enable** → Add support email → **Save**

---

## 🎯 Quick Checklist

Before testing, make sure you have:

- ✅ Created a Firebase project
- ✅ Registered a web app in Firebase
- ✅ Copied Firebase config values (apiKey, authDomain, projectId)
- ✅ Enabled Google sign-in provider
- ✅ Added localhost to authorized domains
- ✅ Updated `frontend/.env` with real credentials
- ✅ Restarted your dev server
- ✅ Allowed popups in your browser

---

## 🔐 Security Notes

### Keep Your Credentials Safe:
- ✅ `.env` file is in `.gitignore` - it won't be committed to Git
- ✅ Never commit API keys to public repositories
- ✅ The Firebase API key in `.env` is safe for client-side use
  - It's designed to be public
  - Access is controlled by Firebase Security Rules
  - Authentication provides the actual security

### Firebase Security:
- Firebase Auth handles all the OAuth security
- Your credentials only identify which Firebase project to use
- User data is protected by Firebase's authentication system

---

## 📞 Need Help?

If you're stuck:
1. Check the Firebase Console for error messages
2. Check your browser's JavaScript console (F12)
3. Verify all environment variables are correct
4. Make sure there are no extra spaces or quotes in `.env`
5. Restart the dev server after any `.env` changes

---

## 🎉 Next Steps After Setup

Once authentication is working:
1. Test signing in with different Google accounts
2. Verify user info shows in the header
3. Test sign out functionality
4. Try refreshing the page (should stay logged in)
5. Ready to move on to PR 4 (Backend WebSocket server)!

---

## 📋 Your Credentials Template

Copy this template and fill in your actual values:

```bash
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
```

Get these from:
Firebase Console → Project Settings → Your apps → SDK setup and configuration

---

**Good luck! 🚀 You're one step away from having a working authentication system!**

