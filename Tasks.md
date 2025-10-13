# CollabCanvas MVP – Development Tasks and PR Plan

This roadmap aligns strictly to `PRD_MVP.md` and breaks the work into mergeable PRs with file-by-file subtasks.

## Project file structure (scalable)
- `README.md`: Quickstart, env, deploy, test steps
- `.gitignore`: Ignore node_modules, env files, build artifacts
- `.env.example`: Example env variables for frontend/backend
- `frontend/`: React app (Vite), UI, auth, realtime client
  - `frontend/package.json`, `frontend/tsconfig.json`, `frontend/vite.config.ts`, `frontend/index.html`
  - `frontend/src/`
    - `frontend/src/main.tsx`, `frontend/src/App.tsx`
    - `frontend/src/routes/Router.tsx`
    - `frontend/src/pages/Login.tsx`, `frontend/src/pages/Canvas.tsx`
    - `frontend/src/components/Header.tsx`, `frontend/src/components/Toolbar.tsx`, `frontend/src/components/CursorOverlay.tsx`
    - `frontend/src/lib/auth.ts` (provider auth)
    - `frontend/src/lib/ws.ts` (WebSocket client)
    - `frontend/src/lib/canvas.ts` (canvas helpers)
    - `frontend/src/types.ts` (shared FE types)
    - `frontend/src/styles.css`
- `backend/`: Node server (WS + minimal HTTP)
  - `backend/package.json`, `backend/tsconfig.json`, `backend/Dockerfile`
  - `backend/src/`
    - `backend/src/server.ts` (HTTP + WS bootstrap)
    - `backend/src/env.ts` (env parsing)
    - `backend/src/http/health.ts` (GET /health)
    - `backend/src/auth/verifyToken.ts` (verify provider token)
    - `backend/src/ws/index.ts` (WS setup)
    - `backend/src/ws/messageTypes.ts` (message schemas)
    - `backend/src/ws/handlers.ts` (object/presence handlers)
    - `backend/src/state/canvasState.ts` (in-memory objects)
    - `backend/src/state/presenceState.ts` (in-memory presence)
    - `backend/src/utils/logger.ts`
- `docs/SMOKE_TEST.md`: 2-browser validation steps

---

## PR 1 — Repo scaffold, structure, and documentation
- Create repo scaffolding
  - Create `README.md` (overview, quickstart, deploy)
  - Create `.gitignore`
  - Create `.env.example` (frontend `VITE_*`, backend `PORT`, `ALLOWED_ORIGINS`)
- Initialize folders
  - Create directory `frontend/`
  - Create directory `backend/`
  - Create directory `docs/`
- Smoke test doc
  - Create `docs/SMOKE_TEST.md` (2-browser scenarios: login, cursors, add/move/delete)

## PR 2 — Frontend scaffold (React + Vite + Router)
- Bootstrap Vite app
  - Create `frontend/package.json`
  - Create `frontend/tsconfig.json`
  - Create `frontend/vite.config.ts`
  - Create `frontend/index.html`
- App shell and routing
  - Create `frontend/src/main.tsx`
  - Create `frontend/src/App.tsx`
  - Create `frontend/src/routes/Router.tsx`
  - Create `frontend/src/pages/Login.tsx`
  - Create `frontend/src/pages/Canvas.tsx`
  - Create `frontend/src/components/Header.tsx`
  - Create `frontend/src/styles.css`
- Types and placeholders
  - Create `frontend/src/types.ts`
  - Edit `frontend/src/App.tsx` (mount header + router)
  - Edit `frontend/src/pages/Login.tsx` (placeholder UI)
  - Edit `frontend/src/pages/Canvas.tsx` (placeholder UI)

## PR 3 — Auth integration (Firebase Auth; Google OAuth)
- Auth library and config
  - Create `frontend/src/lib/auth.ts` (init, sign-in/out, current user)
  - Edit `frontend/src/pages/Login.tsx` (Google sign-in; error handling)
  - Edit `frontend/src/components/Header.tsx` (show `displayName`, sign out)
  - Edit `frontend/src/routes/Router.tsx` (protected route to `/canvas`)
  - Edit `.env.example` (add `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, etc.)
- Post-auth redirect
  - Edit `frontend/src/pages/Login.tsx` (redirect to `/canvas` on success)
- Docs
  - Edit `README.md` (enable Google provider; env setup)
- Test: Frontend unit tests for auth and routing
  - Create `frontend/vitest.config.ts`
  - Edit `frontend/package.json` (add `test` script using Vitest)
  - Create `frontend/src/lib/auth.test.ts` (mock provider; test `signIn`/`signOut` flows)
  - Create `frontend/src/routes/Router.test.tsx` (unauthenticated blocked from `/canvas`; authenticated allowed)
  - Create `frontend/src/pages/Login.test.tsx` (successful sign-in triggers redirect to `/canvas`)

## PR 4 — Backend bootstrap (HTTP + WebSocket skeleton)
- Backend project setup
  - Create `backend/package.json`
  - Create `backend/tsconfig.json`
  - Create `backend/Dockerfile`
- HTTP server + health
  - Create `backend/src/server.ts` (HTTP server, `/health`, WS upgrade)
  - Create `backend/src/http/health.ts`
  - Create `backend/src/env.ts` (load `PORT`, `ALLOWED_ORIGINS`)
  - Create `backend/src/utils/logger.ts`
- WS skeleton
  - Create `backend/src/ws/index.ts` (connection lifecycle)
  - Create `backend/src/ws/messageTypes.ts` (message enums/types)
  - Create `backend/src/ws/handlers.ts` (stubs)
- Auth verification stub
  - Create `backend/src/auth/verifyToken.ts` (verify Firebase ID token OR no-op)
  - Edit `backend/src/ws/index.ts` (use `verifyToken` on upgrade)
  - Edit `README.md` (backend run instructions, env)
- Test: Backend API and auth basics
  - Create `backend/vitest.config.ts`
  - Edit `backend/package.json` (add `test` script using Vitest)
  - Create `backend/src/http/health.test.ts` (GET `/health` returns 200)
  - Create `backend/src/auth/verifyToken.test.ts` (valid token → claims; invalid token → error)

## PR 5 — Realtime protocol and in-memory canvas state
- Object state and CRUD messages
  - Create `backend/src/state/canvasState.ts` (create/update/delete/list)
  - Edit `backend/src/ws/messageTypes.ts` (add `object.create`, `object.update`, `object.delete`, `initialState`)
  - Edit `backend/src/ws/handlers.ts` (implement handlers, broadcast)
  - Edit `backend/src/ws/index.ts` (send initial state on connect)
- Frontend WS integration
  - Create `frontend/src/lib/ws.ts` (connect/reconnect, send/receive)
  - Edit `frontend/src/types.ts` (mirror message types subset)
  - Edit `frontend/src/pages/Canvas.tsx` (hydrate initial state from WS)
  - Create `frontend/src/lib/canvas.ts` (helpers: object ids, transforms)
- Test: Core state and WS broadcast
  - Create `backend/src/state/canvasState.test.ts` (unit: create/update/delete correctness; last-write-wins)
  - Create `backend/src/ws/handlers.object.integration.test.ts` (integration: object messages broadcast to all clients)

## PR 6 — Canvas UI: add/select/move/delete rectangles (wired to WS)
- UI components and tools
  - Create `frontend/src/components/Toolbar.tsx` (Add Rectangle, Select/Move, Delete)
  - Edit `frontend/src/pages/Canvas.tsx` (render objects; selection; drag/move; delete)
  - Edit `frontend/src/lib/canvas.ts` (object manipulation helpers)
- Wire to realtime
  - Edit `frontend/src/pages/Canvas.tsx` (send WS messages on add/move/delete)
  - Edit `frontend/src/lib/ws.ts` (apply remote `object.*` updates idempotently)
- Test: Canvas helpers and UI integration
  - Create `frontend/src/lib/canvas.test.ts` (unit: add/move/delete transformers)
  - Create `frontend/src/pages/Canvas.test.tsx` (integration: clicking Add Rectangle emits `object.create`; drag emits `object.update`)

## PR 7 — Presence: live cursors + name labels
- Backend presence
  - Create `backend/src/state/presenceState.ts` (track `userId`, `displayName`, `lastSeen`)
  - Edit `backend/src/ws/messageTypes.ts` (add `presence.join`, `presence.cursor`, `presence.leave`)
  - Edit `backend/src/ws/handlers.ts` (broadcast join/leave; cursor ingress)
  - Edit `backend/src/ws/index.ts` (on connect/close, update presence; heartbeat timeout)
- Frontend cursors
  - Create `frontend/src/components/CursorOverlay.tsx` (render remote cursors + labels)
  - Edit `frontend/src/pages/Canvas.tsx` (pointer move listener → throttle → send `presence.cursor`)
  - Edit `frontend/src/lib/ws.ts` (handle presence messages)
  - Edit `frontend/src/types.ts` (presence types)
  - Edit `frontend/src/styles.css` (cursor styles)
- Test: Presence state and cursor flow
  - Create `backend/src/state/presenceState.test.ts` (unit: join/leave/timeout updates)
  - Create `backend/src/ws/handlers.presence.integration.test.ts` (integration: cursor updates delivered; leave removes presence)
  - Create `frontend/src/components/CursorOverlay.test.tsx` (unit: renders labels for provided presence data)

## PR 8 — Deployment (frontend + backend)
- Frontend deploy
  - Edit `frontend/package.json` (build script)
  - Create `frontend/vercel.json` (optional)
  - Edit `README.md` (Vercel/Netlify deploy steps; env vars)
- Backend deploy
  - Edit `backend/Dockerfile` (ensure production build)
  - Create `backend/render.yaml` (optional) or deployment notes for Fly/AWS
  - Edit `backend/src/env.ts` (allow production origins)
  - Edit `README.md` (backend deploy steps; set `ALLOWED_ORIGINS`, provider keys)
- Environment wiring
  - Edit `.env.example` (final env var names)
  - Edit `frontend/src/lib/ws.ts` (use `import.meta.env.VITE_WS_URL`)
  - Edit `README.md` (staging URLs and smoke test steps)

## PR 9 — Staging smoke tests and fixes
- Test docs
  - Edit `docs/SMOKE_TEST.md` (final checks: two users, cursors, object add/move/delete)
- Fixes (as needed)
  - Edit `frontend/src/pages/Canvas.tsx` (edge cases, selection state)
  - Edit `backend/src/ws/handlers.ts` (validation, error logs)
  - Edit `frontend/src/lib/ws.ts` (reconnect backoff tuning)

---

## Notes
- This plan implements `PRD_MVP.md`: auth, single shared canvas, realtime sync, live cursors, deployment.
- If Okta/Auth0 is chosen instead of Firebase, only `frontend/src/lib/auth.ts`, provider envs, and `backend/src/auth/verifyToken.ts` change; PR boundaries remain the same.
