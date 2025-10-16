# PR11: Multi-Select + Layer Management

**Branch**: `pr11-multiselect-layers`
**Goal**: Add drag-to-select, layer panel with z-index controls

**Prerequisites**: PR10 must be complete and merged

---

## Task 2.1: Add Drag-to-Select Rectangle

**File**: `frontend/src/components/KonvaCanvas.tsx`

**What to add:**
- State for selection rectangle (x, y, width, height)
- onMouseDown handler: start selection rectangle if clicked on empty
- onMouseMove handler: update selection rectangle size
- onMouseUp handler: find objects in selection box, select them
- Render selection rectangle (dashed border, light blue fill)

**Logic:**
- If click on empty + not shift → start drag-to-select
- If click on shape → handle normal selection
- While dragging → show selection rectangle
- On mouse up → select all objects that intersect with rectangle
- If shift held → add to existing selection

**Test immediately:**
- [ ] Click and drag on empty canvas → selection rectangle appears
- [ ] Release → objects in rectangle get selected
- [ ] Shift + drag → adds to selection (doesn't clear existing)
- [ ] Works smoothly, no jank

**Commit**: `feat(canvas): add drag-to-select rectangle`

---

## Task 2.2: Create Layer Panel Component

**File**: `frontend/src/components/LayerPanel.tsx` (NEW FILE)

**What to create:**
- LayerPanel component with props:
  - objects: CanvasObject[]
  - selectedIds: Set<string>
  - onSelect: (ids: Set<string>) => void
  - onBringToFront: (id: string) => void
  - onSendToBack: (id: string) => void

**Component should:**
- Show list of all objects (sorted by zIndex, top to bottom)
- Display object type and color preview
- Show which objects are selected
- Click object → select it
- Shift+click object → add/remove from selection
- "↑" button → bring to front (increase zIndex)
- "↓" button → send to back (decrease zIndex)

**Test immediately:**
- [ ] Component renders without errors
- [ ] Can import in Canvas.tsx
- [ ] TypeScript compiles

**Commit**: `feat(layers): create layer panel component`

---

## Task 2.3: Integrate Layer Panel into Canvas

**File**: `frontend/src/pages/Canvas.tsx`

**What to add:**
- Import LayerPanel component
- Add handlers:
  - handleBringToFront(id) → find max zIndex, set object to max+1
  - handleSendToBack(id) → find min zIndex, set object to min-1
  - Send OBJECT_UPDATE via WebSocket
- Update layout to show layer panel on right side

**Layout:**
- Canvas.tsx should have flex layout
- Main canvas on left (flex: 1)
- Layer panel on right (fixed width 250px)

**Test immediately:**
- [ ] Layer panel visible on right side
- [ ] Shows all objects in list
- [ ] Click object in panel → selects on canvas
- [ ] Click "↑" → object moves to front visually
- [ ] Click "↓" → object moves to back visually
- [ ] Z-index changes sync to other users

**Commit**: `feat(canvas): integrate layer panel with z-index controls`

---

## Task 2.4: Add Layer Panel Styles

**File**: `frontend/src/styles.css`

**What to add:**
- .canvas-layout (flex row)
- .canvas-main (flex 1)
- .layer-panel (width 250px, border-left)
- .layer-panel-header (padding, border-bottom)
- .layer-list (scrollable)
- .layer-item (hover states, selected state)
- .layer-preview (color square)
- .layer-label (text)
- .layer-actions (button container)
- .layer-action-btn (small buttons)

**Test immediately:**
- [ ] Layer panel looks clean
- [ ] Hover states work
- [ ] Selected items highlighted
- [ ] Buttons visible on hover
- [ ] Scrolls if many objects

**Commit**: `style: add layer panel styling`

---

## Task 2.5: End-to-End Testing

**Test all PR11 features:**

1. **Drag-to-Select:**
   - [ ] Click and drag on empty canvas → selection box appears
   - [ ] Drag over multiple objects → all get selected
   - [ ] Shift + drag → adds to existing selection
   - [ ] Works with all shape types
   - [ ] Works smoothly, no lag

2. **Layer Panel:**
   - [ ] Panel shows all objects
   - [ ] Objects listed top-to-bottom by z-index
   - [ ] Click object in panel → selects on canvas
   - [ ] Shift+click in panel → multi-select
   - [ ] Selected items highlighted in panel

3. **Z-Index Controls:**
   - [ ] Create 3 overlapping rectangles
   - [ ] Click "↑" on bottom one → moves to top
   - [ ] Click "↓" on top one → moves to bottom
   - [ ] Visual stacking order matches panel order
   - [ ] Changes sync to other users

4. **Combined with PR10 Features:**
   - [ ] Can still resize/rotate selected objects
   - [ ] Can still duplicate selected objects
   - [ ] Can still change color of selected objects
   - [ ] Multi-select works with all these actions
   - [ ] Everything syncs in real-time

5. **Multi-User Testing:**
   - [ ] User A drag-selects 3 objects → User B sees selection (optional)
   - [ ] User A brings object to front → User B sees it move to front
   - [ ] User A and User B manipulate different objects → no conflicts

**If any test fails:**
- Debug and fix before merging PR11
- Verify PR10 features still work

**Commit**: `test: verify PR11 complete - multi-select and layers working`

---

## PR11 Definition of Done

- [ ] Shift+click multi-select works
- [ ] Drag-to-select rectangle works
- [ ] Selection rectangle visually clear
- [ ] Layer panel shows all objects
- [ ] Click layer item selects object
- [ ] "Bring to Front" works
- [ ] "Send to Back" works
- [ ] Z-index changes sync in real-time
- [ ] Panel scrolls with many objects
- [ ] No console errors
- [ ] No TypeScript errors
- [ ] All PR10 features still work
- [ ] Tested with 2 browser windows

**When all checked, PR11 is DONE → Merge to main → Start PR12**

