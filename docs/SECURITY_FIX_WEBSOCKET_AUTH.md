# Security Fix: WebSocket Authentication Vulnerability

## Issue Summary

**Severity:** HIGH  
**Date Fixed:** October 14, 2025  
**Affected Files:** 
- `backend/src/ws/index.ts`
- `backend/src/ws/handlers.ts`

## Vulnerability Description

### The Problem

The WebSocket server was sending the initial canvas state immediately upon connection establishment, **before** the client had authenticated. This allowed any unauthenticated client to:

1. Connect to the WebSocket server
2. Receive all canvas objects and data
3. View potentially sensitive collaborative content
4. Access data without providing valid credentials

### Vulnerable Code

```typescript
// backend/src/ws/index.ts (BEFORE FIX)
wss.on('connection', (ws: WebSocket) => {
  logger.info('New WebSocket connection established')

  // ❌ SECURITY ISSUE: Sending data before authentication!
  const initialObjects = getAllObjects()
  const initialStateMessage = JSON.stringify({
    type: MessageType.INITIAL_STATE,
    objects: initialObjects,
    timestamp: new Date().toISOString()
  })
  ws.send(initialStateMessage)
  logger.debug('Sent initial state to client', { objectCount: initialObjects.length })
  
  // ... rest of connection handler
})
```

### Attack Scenario

```javascript
// An attacker could simply connect and receive all data:
const ws = new WebSocket('ws://target-server:8080')

ws.onopen = () => {
  // No authentication needed!
}

ws.onmessage = (event) => {
  const data = JSON.parse(event.data)
  if (data.type === 'initialState') {
    console.log('Stolen canvas data:', data.objects)
    // ☠️ Attacker now has all canvas objects without authentication
  }
}
```

## The Fix

### Changes Made

#### 1. Removed Insecure Initial State Send (`ws/index.ts`)

**Before:**
```typescript
wss.on('connection', (ws: WebSocket) => {
  logger.info('New WebSocket connection established')
  
  // Send initial canvas state to new client
  const initialObjects = getAllObjects()
  const initialStateMessage = JSON.stringify({ /* ... */ })
  ws.send(initialStateMessage)  // ❌ Sent before auth!
```

**After:**
```typescript
wss.on('connection', (ws: WebSocket) => {
  logger.info('New WebSocket connection established')

  // NOTE: Initial canvas state is sent AFTER authentication
  // See handleAuth() in handlers.ts for secure state hydration
```

#### 2. Added Secure State Send After Authentication (`handlers.ts`)

**Before:**
```typescript
async function handleAuth(ws: WebSocket, message: AuthMessage) {
  try {
    const userClaims = await verifyToken(message.token)
    connectedClients.set(ws, userClaims)
    
    // Send success response
    ws.send(JSON.stringify({ type: MessageType.AUTH_SUCCESS, ... }))
    
    logger.info('User authenticated', { uid: userClaims.uid })
    // ❌ No initial state sent - client gets nothing!
  }
```

**After:**
```typescript
async function handleAuth(ws: WebSocket, message: AuthMessage) {
  try {
    const userClaims = await verifyToken(message.token)
    connectedClients.set(ws, userClaims)
    
    // Send success response
    ws.send(JSON.stringify({ type: MessageType.AUTH_SUCCESS, ... }))
    
    // ✅ SECURITY FIX: Send initial canvas state ONLY after authentication
    const initialObjects = canvasState.getAllObjects()
    ws.send(JSON.stringify({
      type: MessageType.INITIAL_STATE,
      objects: initialObjects,
      timestamp: new Date().toISOString()
    }))
    
    logger.info('User authenticated and initial state sent', { 
      uid: userClaims.uid, 
      objectCount: initialObjects.length 
    })
  }
```

### Secure Flow After Fix

```
1. Client connects to WebSocket
   ↓
2. Server accepts connection (NO DATA SENT)
   ↓
3. Client sends AUTH message with token
   ↓
4. Server verifies token
   ↓
   ├─ Invalid → Send AUTH_ERROR and close connection
   │
   └─ Valid → 
      ├─ Add client to connectedClients Map
      ├─ Send AUTH_SUCCESS message
      └─ Send INITIAL_STATE with canvas objects ✅
```

## Security Implications

### Before Fix
- **Exposure Level:** Complete canvas data exposed to anyone
- **Authentication Required:** None
- **Attack Complexity:** Trivial (single WebSocket connection)
- **Data at Risk:** All canvas objects, potentially sensitive designs/content

### After Fix
- **Exposure Level:** None (data only sent to authenticated users)
- **Authentication Required:** Valid Firebase ID token
- **Attack Complexity:** Requires valid credentials
- **Data at Risk:** None (properly protected)

## Testing the Fix

### Manual Test

1. Start the backend server:
   ```bash
   cd backend
   npm run dev
   ```

2. Test unauthenticated connection:
   ```javascript
   const ws = new WebSocket('ws://localhost:8080')
   ws.onmessage = (e) => {
     console.log('Received:', e.data)
     // Should NOT receive initialState without auth
   }
   ```

3. Test authenticated connection:
   ```javascript
   const ws = new WebSocket('ws://localhost:8080')
   ws.onopen = () => {
     // Send auth message
     ws.send(JSON.stringify({
       type: 'auth',
       token: 'valid-firebase-token',
       timestamp: new Date().toISOString()
     }))
   }
   ws.onmessage = (e) => {
     const data = JSON.parse(e.data)
     console.log('Received:', data.type)
     // Should receive: auth.success, then initialState
   }
   ```

### Expected Behavior

✅ **Correct:** Unauthenticated clients receive no canvas data  
✅ **Correct:** Authenticated clients receive initial state after successful auth  
✅ **Correct:** Invalid tokens result in connection closure  

## Additional Recommendations

### 1. Add Rate Limiting
Consider adding rate limiting to prevent brute-force token attempts:

```typescript
// backend/src/ws/index.ts
import rateLimit from 'ws-rate-limit'

const limiter = rateLimit({
  window: 60000, // 1 minute
  max: 10 // 10 connections per IP
})
```

### 2. Implement Connection Timeout
Add a timeout for unauthenticated connections:

```typescript
wss.on('connection', (ws: WebSocket) => {
  // Close connection if not authenticated within 5 seconds
  const authTimeout = setTimeout(() => {
    if (!connectedClients.has(ws)) {
      logger.warn('Connection closed: Authentication timeout')
      ws.close(4000, 'Authentication timeout')
    }
  }, 5000)
  
  // Clear timeout on successful auth in handleAuth()
})
```

### 3. Add Audit Logging
Log failed authentication attempts for security monitoring:

```typescript
async function handleAuth(ws: WebSocket, message: AuthMessage) {
  try {
    // ...
  } catch (error) {
    logger.warn('Failed authentication attempt', { 
      ip: ws._socket?.remoteAddress,
      timestamp: new Date().toISOString()
    })
    // ...
  }
}
```

### 4. Use WSS (WebSocket Secure) in Production
Ensure the WebSocket connection uses TLS in production:

```typescript
// backend/src/server.ts
if (env.NODE_ENV === 'production') {
  // Use HTTPS server for WSS
  const httpsServer = https.createServer(tlsOptions, app)
  setupWebSocket(httpsServer)
}
```

## Related Security Considerations

- **Token Expiration:** Ensure Firebase ID tokens are validated for expiration
- **Token Refresh:** Implement token refresh mechanism for long-lived connections
- **Connection Limits:** Set maximum connections per user to prevent resource exhaustion
- **Input Validation:** Validate all incoming messages before processing
- **CORS Policy:** Configure appropriate CORS settings for WebSocket connections

## References

- [OWASP WebSocket Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/WebSocket_Security_Cheat_Sheet.html)
- [Firebase Authentication Docs](https://firebase.google.com/docs/auth)
- [WebSocket RFC 6455](https://tools.ietf.org/html/rfc6455)

---

**Fix Status:** ✅ RESOLVED  
**Verification:** Manual testing required  
**Deployment:** Ready for staging/production after testing


