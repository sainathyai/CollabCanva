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

## PR Sequence

### ✅ Phase 1: Canvas Foundation
- **[PR10: Konva Migration + Transforms](./tasks/PR10_KONVA_TRANSFORMS.md)**
  - Replace HTML5 Canvas with Konva.js
  - Add resize, rotate, duplicate, color picker
  - Test: All transforms sync in real-time

- **[PR11: Multi-Select + Layers](./tasks/PR11_MULTISELECT_LAYERS.md)**
  - Drag-to-select rectangle
  - Layer panel with z-index controls
  - Test: Multi-select + layers work together

### ⏳ Phase 2: All Shapes + Persistence
- **[PR12: Multiple Shape Types](./tasks/PR12_SHAPES.md)**
  - Add circles, text, lines
  - All shapes support transforms
  - Test: All 4 shape types work

- **[PR13: DynamoDB Persistence](./tasks/PR13_PERSISTENCE.md)**
  - Save canvas state to DynamoDB
  - Load on startup
  - Test: State survives restart

### ⏳ Phase 3: AI Agent
- **[PR15: AI Agent Basic Commands](./tasks/PR15_AI_BASIC.md)**
  - OpenAI integration
  - 8 basic commands (create, move, resize, rotate, color)
  - Test: AI creates/manipulates objects

- **[PR16: AI Complex Commands](./tasks/PR16_AI_COMPLEX.md)**
  - Multi-step commands (login form, nav bar)
  - Layout algorithms
  - Test: AI creates complex layouts

### ⏳ Phase 4: Polish + Deployment
- **[PR17: Polish Features](./tasks/PR17_POLISH.md)**
  - Undo/redo (Ctrl+Z, Ctrl+Y)
  - Pan/zoom
  - Keyboard shortcuts
  - Test: All polish features work

- **[PR14: AWS Deployment](./tasks/PR14_AWS_DEPLOYMENT.md)**
  - EC2 + Redis + DynamoDB
  - Production deployment
  - Test: Works on AWS

- **[Demo Video](./tasks/DEMO_VIDEO.md)**
  - 3-5 minute video
  - Show collaboration + AI
  - Architecture explanation

---

## Current Status

**Active PR**: None (ready to start PR10)

**Completed**:
- MVP (Firebase Auth + WebSocket + Cursors)

**Next**: Start PR10

---

## Quick Start

**To begin PR10:**
```bash
cd frontend
npm install konva react-konva @types/konva
git checkout -b pr10-konva-transforms
```

**Then follow**: [PR10 Tasks](./tasks/PR10_KONVA_TRANSFORMS.md)

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
