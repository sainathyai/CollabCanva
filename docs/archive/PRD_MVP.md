### PRD: Real-Time Collaborative Whiteboard — MVP (24-hour scope)

- Source: local `PRD` and the linked project plan [`Google Doc`](https://docs.google.com/document/d/1OSbceaAvqhaqI-R0HX_e1X3zvgFTOiQFsg7F4Ea_x2Y/edit?pli=1&tab=t.0)

### Introduction
Deliver a minimal, functional real-time collaborative whiteboard that allows multiple authenticated users to interact on a single shared canvas, with presence (live cursors and name labels), and a public staging deployment. This PRD is strictly limited to MVP requirements from the source document.

### MVP Objectives
- Real-time synchronization of canvas state between all active users.
- Presence awareness: show each active user’s cursor and name label.
- Basic user authentication to identify individual users.
- Deploy a working web app to a publicly accessible staging environment and host code in a personal GitHub repository.

### Core MVP Features: User Stories with Acceptance Criteria

#### 1) Basic Authentication
- User Story
  - As a user, I want to log in so my identity is visible to others on the shared canvas.
- Acceptance Criteria
  - AC-A1: A user can sign up/sign in (email/password or social) and is redirected to the single shared canvas.
  - AC-A2: The user’s display name is available and shown next to their cursor.

#### 2) Single Shared Canvas
- User Story
  - As a user, I want a single shared whiteboard so everyone collaborates in the same space.
- Acceptance Criteria
  - AC-C1: Two authenticated users see the same canvas session after login.
  - AC-C2: Users can perform a minimal collaborative action (e.g., create or move a simple object) and both clients reflect the same state.

#### 3) Real-Time Synchronization
- User Story
  - As a user, I want my canvas actions to appear to all other active users in real time.
- Acceptance Criteria
  - AC-RS1: When User A performs a minimal canvas action, User B sees the update nearly instantly.
  - AC-RS2: During a brief collaborative session, no actions are lost or duplicated.

#### 4) Presence: Live Cursors with Name Labels
- User Story
  - As a user, I want to see other users’ cursors and names so I can coordinate on the canvas.
- Acceptance Criteria
  - AC-P1: With two authenticated users, both see each other’s live cursor positions on the canvas.
  - AC-P2: Each cursor displays the correct name label sourced from authentication.

#### 5) Deployment & Repository
- User Story
  - As a reviewer, I want a public staging URL and a personal GitHub repository to evaluate the MVP.
- Acceptance Criteria
  - AC-D1: A reviewer can open the staging URL, log in with two accounts (or two browsers), and observe real-time collaboration on the shared canvas.
  - AC-D2: The GitHub repository link is provided and publicly accessible for grading.

### Technical Stack Recommendations (suited for rapid MVP)
- Backend & Database: Firebase Firestore (recommended by source) or an equivalent free-tier database.
- Real-Time Communication: Minimal websocket server to manage/persist canvas state and live interactions (as required by source).
- Frontend: Simple web app (e.g., React) rendering a basic canvas interaction sufficient to demonstrate collaboration.
- Deployment: Any public staging environment; AWS preferred (not strictly required).
- Repository: Personal GitHub repository (required).

### Quick, Free-Tier Authentication Options (choose one)
- Firebase Authentication (free tier): Email/password and common social providers; integrates cleanly with Firestore.
- Okta Developer (free plan): OAuth 2.0/OpenID Connect with quick-start templates suitable for web apps.

### Out of Scope (deferred from the source document)
- AI layer or any AI agent integration.
- Advanced drawing tools (e.g., shapes beyond minimum needed, text boxes, color palettes).
- Chat functionality.
- Version history or saving/loading of boards.
- Advanced user profiles or permissions.
- Cross-platform mobile applications (web-only for MVP).

This PRD is intentionally minimal, containing only the requirements explicitly designated for MVP to meet the 24-hour delivery window, per the source plan: [`Google Doc`](https://docs.google.com/document/d/1OSbceaAvqhaqI-R0HX_e1X3zvgFTOiQFsg7F4Ea_x2Y/edit?pli=1&tab=t.0).
