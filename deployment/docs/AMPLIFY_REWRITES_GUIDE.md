# AWS Amplify SPA Routing Fix

## Problem
- Refreshing `/canvas/...` or `/dashboard` gives 404
- Only the root URL (`/`) works

## Root Cause
Amplify tries to find physical files for routes like `/canvas/123`, but these are handled by React Router in the browser.

## Solution: Add Rewrites & Redirects

### Option 1: Via AWS Console (RECOMMENDED - Do this now!)

1. Go to [AWS Amplify Console](https://us-east-2.console.aws.amazon.com/amplify/home)
2. Select your app: `pr15-rbac`
3. Click **"App settings"** → **"Rewrites and redirects"**
4. Click **"Manage rewrites and redirects"**
5. Add this rule:

```
Source address: </^[^.]+$|\.(?!(css|gif|ico|jpg|js|png|txt|svg|woff|woff2|ttf|map|json)$)([^.]+$)/>
Target address: /index.html
Type: 200 (Rewrite)
```

**OR** use this simpler rule:

```
Source address: /<*>
Target address: /index.html
Type: 200 (Rewrite)
Condition: (Leave blank)
```

6. Click **"Save"**

### Option 2: Via AWS CLI

```bash
aws amplify update-app \
  --app-id d391c0a1azscel \
  --custom-rules '[
    {
      "source": "/<*>",
      "target": "/index.html",
      "status": "200"
    },
    {
      "source": "</^[^.]+$|\\.(?!(css|gif|ico|jpg|js|png|txt|svg|woff|woff2|ttf|map|json)$)([^.]+$)/>",
      "target": "/index.html",
      "status": "200"
    }
  ]' \
  --region us-east-2
```

## How It Works

### Before (Broken):
```
User visits: /canvas/123
  ↓
Amplify looks for file: /canvas/123
  ↓
File not found → 404 ❌
```

### After (Fixed):
```
User visits: /canvas/123
  ↓
Amplify rewrite rule catches it
  ↓
Returns: /index.html (status 200)
  ↓
React Router loads → Sees /canvas/123 → Shows Canvas ✅
```

## Common Rewrite Rules

### Rule 1: Catch-all for SPA (RECOMMENDED)
```json
{
  "source": "/<*>",
  "target": "/index.html",
  "status": "200"
}
```

### Rule 2: Advanced (excludes static files)
```json
{
  "source": "</^[^.]+$|\\.(?!(css|gif|ico|jpg|js|png|txt|svg|woff|woff2|ttf|map|json|webp)$)([^.]+$)/>",
  "target": "/index.html",
  "status": "200"
}
```

### Rule 3: Redirect to HTTPS
```json
{
  "source": "<*>",
  "target": "https://collabcanva.sainathyai.com<*>",
  "status": "301",
  "condition": "<US>"
}
```

## Testing After Fix

1. ✅ Visit: `https://collabcanva.sainathyai.com/` → Should work
2. ✅ Visit: `https://collabcanva.sainathyai.com/dashboard` → Should work
3. ✅ Visit: `https://collabcanva.sainathyai.com/canvas/123` → Should work
4. ✅ Refresh on `/dashboard` → Should stay on dashboard
5. ✅ Refresh on `/canvas/123` → Should stay on canvas

## Complete AWS CLI Command

```powershell
# Get your Amplify App ID
$APP_ID = "d391c0a1azscel"

# Update rewrite rules
aws amplify update-app `
  --app-id $APP_ID `
  --custom-rules '[{\"source\":\"/<*>\",\"target\":\"/index.html\",\"status\":\"200\"}]' `
  --region us-east-2
```

## Verification

After adding the rule, check in AWS Console:
1. Go to Amplify → Your App → App Settings → Rewrites and redirects
2. You should see the rule listed
3. Test all routes!

## Notes

- **Status 200**: This is a "rewrite" (URL stays the same, but serves index.html)
- **Status 301/302**: This is a "redirect" (URL changes)
- For SPA routing, we want **200 (rewrite)**

