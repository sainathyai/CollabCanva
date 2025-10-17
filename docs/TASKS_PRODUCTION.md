# CollabCanvas Production - Task Index

**Strategy**: PR-by-PR development with continuous testing
**AWS Deployment**: Deferred until all features working locally
**Testing**: Every task includes immediate verification

---

## Development Workflow

1. **Work on one PR at a time**
2. **Test every task immediately** (don't accumulate untested code)
3. **Fix issues before moving to next task**
4. **Merge PR when Definition of Done is met**
5. **Start next PR**

---

## PR Sequence (Updated Strategy)

### ✅ Phase 1: Canvas Foundation (COMPLETE)
- **[PR10: Konva Migration + Transforms](./tasks/PR10_KONVA_TRANSFORMS.md)** ✅
  - Replace HTML5 Canvas with Konva.js
  - Add resize, rotate, duplicate, color picker
  - **BONUS**: Drag-to-select, 12 shape types, random generator
  - Test: All transforms sync in real-time

### 🚀 Phase 2: AI Features (PRIORITY - 15 POINTS)
- **[PR11: AI Canvas Agent](./tasks/PR11_AI_CANVAS_AGENT.md)** ⏳ **CURRENT**
  - OpenAI/Claude integration
  - 6+ command types (create, move, resize, rotate, color, delete)
  - Natural language understanding
  - Test: AI creates/manipulates objects
  - **VALUE: +15 points → 100/100**

### ⏳ Phase 3: Polish & Additional Features (AFTER 100/100)
- **[PR12: Layer Panel + Z-Index](./tasks/PR12_LAYER_PANEL.md)** (formerly PR11)
  - Layer panel with z-index controls
  - Bring to front / send to back
  - Test: Layer management works

- **[PR13: Persistence](./tasks/PR13_PERSISTENCE.md)**
  - Save canvas state to Firestore/DynamoDB
  - Load on startup
  - Test: State survives restart

- **[PR14: Advanced AI Commands](./tasks/PR14_AI_ADVANCED.md)** (formerly PR16)
  - Multi-step commands (login form, nav bar)
  - Layout algorithms (grid, circle arrangement)
  - Test: AI creates complex layouts

### ⏳ Phase 4: Production Deployment (OPTIONAL)
- **[PR15: AWS Deployment](./tasks/PR15_AWS.md)** (formerly PR14)
  - EC2 + Redis + DynamoDB
  - Production deployment
  - Test: Works on AWS

- **[Demo Video](./tasks/DEMO_VIDEO.md)**
  - 3-5 minute video
  - Show collaboration + AI
  - Architecture explanation

---

## Current Status

**Active PR**: PR11 (AI Canvas Agent) - **PRIORITY**

**Completed**:
- ✅ MVP (Firebase Auth + WebSocket + Cursors)
- ✅ PR10 (Konva Migration + All Canvas Features)

**Current Score**: 85/100 (Grade A)

**Next**: Complete PR11 → **100/100 (Grade A+)**

---

## Quick Start

**To begin PR11 (AI Features):**
```bash
cd frontend
npm install openai
git checkout -b pr11-ai-canvas-agent
```

**Then follow**: [PR11 Tasks](./tasks/PR11_AI_CANVAS_AGENT.md)

**Get OpenAI API Key**: https://platform.openai.com/api-keys

---

## Testing Philosophy

**Test immediately after every task:**
- Don't accumulate untested code
- Fix issues right away
- Verify real-time sync with 2 browsers
- Check console for errors
- Confirm TypeScript compiles

**If test fails:**
- Stop and debug
- Don't proceed to next task
- Don't merge PR with failing tests

**When PR complete:**
- Run full End-to-End test suite
- Check "Definition of Done"
- Merge to main
- Start next PR

---

## Notes

- **No timelines** - focus on quality and testing
- **AWS deployment** - defer until features complete locally
- **Aggressive development** - move fast but test continuously
- **PR-by-PR** - complete one PR fully before starting next
