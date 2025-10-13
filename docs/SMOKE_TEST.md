# CollabCanvas MVP - Smoke Test Guide

This document provides manual test scenarios to validate the MVP against acceptance criteria from `PRD_MVP.md`.

## Prerequisites

- Staging URL is accessible
- Two separate browsers or browser profiles (e.g., Chrome normal + Chrome incognito)
- Two Google accounts for authentication

## Test Scenarios

### Scenario 1: Authentication (AC-A1, AC-A2)

**Objective**: Verify users can sign in and their identity is visible.

**Steps**:
1. Open staging URL in Browser 1
2. Click "Sign in with Google"
3. Authenticate with Google Account 1
4. Verify redirect to `/canvas`
5. Verify display name appears in header

**Expected Results**:
- ✅ User successfully signs in
- ✅ Redirected to canvas page
- ✅ Display name visible in UI

---

### Scenario 2: Single Shared Canvas (AC-C1, AC-C2)

**Objective**: Verify two users see the same canvas session.

**Steps**:
1. Complete Scenario 1 in Browser 1
2. Open staging URL in Browser 2 (incognito/different profile)
3. Sign in with Google Account 2
4. Verify both browsers show the canvas page

**Expected Results**:
- ✅ Both users access the same canvas
- ✅ Canvas is empty initially or shows existing objects

---

### Scenario 3: Real-Time Object Synchronization (AC-RS1, AC-RS2)

**Objective**: Verify canvas actions sync in real time across users.

**Steps**:
1. In Browser 1, click "Add Rectangle" button
2. Observe Browser 2 within 1-2 seconds
3. In Browser 1, drag the rectangle to a new position
4. Observe Browser 2
5. In Browser 2, click "Add Rectangle" button
6. Observe Browser 1
7. In Browser 2, select and delete a rectangle
8. Observe Browser 1

**Expected Results**:
- ✅ Rectangle created in Browser 1 appears in Browser 2 nearly instantly
- ✅ Rectangle moved in Browser 1 updates position in Browser 2
- ✅ Rectangle created in Browser 2 appears in Browser 1
- ✅ Rectangle deleted in Browser 2 disappears in Browser 1
- ✅ No duplicate or phantom objects appear
- ✅ No actions are lost

---

### Scenario 4: Live Cursors with Name Labels (AC-P1, AC-P2)

**Objective**: Verify live cursor presence and name labels.

**Steps**:
1. Ensure both browsers are signed in and on canvas
2. In Browser 1, move mouse cursor around the canvas
3. Observe Browser 2
4. In Browser 2, move mouse cursor around the canvas
5. Observe Browser 1
6. Verify cursor labels display correct user names

**Expected Results**:
- ✅ Browser 2 shows Browser 1's cursor moving in real time
- ✅ Browser 1 shows Browser 2's cursor moving in real time
- ✅ Each cursor displays the correct user's display name
- ✅ Cursors are visually distinct (different colors)
- ✅ Cursor updates are smooth (no significant lag)

---

### Scenario 5: Presence List (Optional Enhancement)

**Objective**: Verify active users are listed.

**Steps**:
1. With both browsers signed in on canvas
2. Check for presence indicator or user list in UI
3. Close Browser 2 or sign out
4. Observe Browser 1 after 5-10 seconds

**Expected Results** (if implemented):
- ✅ Both user names appear in presence list
- ✅ When user leaves, their name is removed from list

---

### Scenario 6: Reconnection and State Persistence (AC-RS2)

**Objective**: Verify canvas state persists across refresh.

**Steps**:
1. In Browser 1, add 2-3 rectangles to canvas
2. Refresh Browser 1 (F5 or Cmd+R)
3. Wait for page reload and re-authentication
4. Verify canvas state

**Expected Results**:
- ✅ All previously created objects are still visible
- ✅ No data loss on refresh

---

### Scenario 7: Deployment Validation (AC-D1, AC-D2)

**Objective**: Verify public accessibility and repository availability.

**Steps**:
1. Access staging URL from a fresh device/network
2. Confirm application loads without errors
3. Perform quick auth + cursor + object test
4. Access GitHub repository link
5. Verify code is publicly accessible

**Expected Results**:
- ✅ Staging URL is publicly accessible
- ✅ Application loads and functions correctly
- ✅ GitHub repository is public and contains project code
- ✅ README includes setup instructions

---

## Pass/Fail Criteria

**MVP PASSES if**:
- All scenarios 1-4 pass completely
- Scenario 6 passes (state persistence)
- Scenario 7 passes (deployment + repo)

**MVP FAILS if**:
- Authentication does not work
- Real-time sync has >5 second lag or loses data
- Cursors do not appear or are not labeled
- Application crashes with 2 concurrent users
- Staging URL is not accessible
- GitHub repository is not available

---

## Troubleshooting

### Issue: Cursors not appearing
- Check browser console for WebSocket errors
- Verify `VITE_WS_URL` points to correct backend
- Confirm backend is running and accessible

### Issue: Objects not syncing
- Check browser console for message errors
- Verify WebSocket connection is established
- Check backend logs for broadcast issues

### Issue: Authentication fails
- Verify Firebase project has Google sign-in enabled
- Check `VITE_FIREBASE_*` environment variables
- Confirm Firebase authorized domains include staging URL

### Issue: Canvas state lost on refresh
- This is acceptable for MVP if using in-memory only
- Optional: Enable Firestore persistence if needed

---

## Notes

- These tests should be run on the **staging/production deployment**, not localhost
- Tests should be performed by at least 2 different people or using 2 separate devices
- Document any issues or unexpected behavior in GitHub issues

