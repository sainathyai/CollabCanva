# PR10: Konva Migration + Transform Operations

**Branch**: `pr10-konva-transforms`
**Goal**: Replace HTML5 Canvas with Konva.js, add resize/rotate/duplicate/color picker

---

## Task 1.1: Install Konva Dependencies

**What to do:**
- Install konva, react-konva, @types/konva

**Test immediately:**
- Run `npm list konva` - should show version
- Run `npm list react-konva` - should show version
- No errors in terminal

**If fails:** Check Node version (need 18+), try `--legacy-peer-deps`

---

## Task 1.2: Update TypeScript Types

**File**: `frontend/src/types.ts`

**What to add:**
- Add `rotation: number` field to CanvasObject
- Add `color: string` field to CanvasObject
- Add `zIndex: number` field to CanvasObject
- Add `updatedAt?: string` field to CanvasObject
- Add shape type union: `'rectangle' | 'circle' | 'line' | 'text'`
- Add text-specific fields (text, fontSize, fontFamily)
- Add line-specific fields (points array)

**Test immediately:**
- Run `npm run dev` in frontend
- TypeScript should compile with no errors
- Check browser console - no errors

**Commit**: `feat(types): add rotation, color, zIndex to CanvasObject`

---

## Task 1.3: Create Konva Canvas Component

**File**: `frontend/src/components/KonvaCanvas.tsx` (NEW FILE)

**What to create:**
- KonvaCanvas component with props:
  - objects: CanvasObject[]
  - selectedIds: Set<string>
  - onSelect: (ids: Set<string>) => void
  - onTransform: (id: string, attrs: Partial<CanvasObject>) => void
  - stageWidth, stageHeight: number

**Component should:**
- Render Konva Stage and Layer
- Render Rectangle shapes from objects array
- Add Transformer for selected objects
- Handle click to select (single)
- Handle shift+click to multi-select
- Handle click on empty to deselect
- Handle drag to move
- Handle transform (resize/rotate)
- Call onTransform when shape changes

**Test immediately:**
- Component compiles with no TypeScript errors
- Can import in Canvas.tsx without errors

**Commit**: `feat(canvas): create Konva canvas component with transforms`

---

## Task 1.4: Update Canvas Page to Use Konva

**File**: `frontend/src/pages/Canvas.tsx`

**What to change:**
- Replace HTML5 Canvas with KonvaCanvas component
- Add stageSize state (width, height)
- Add useRef for container div
- Calculate stage size from container
- Handle window resize
- Pass objects and selectedIds to KonvaCanvas
- Handle onSelect callback
- Handle onTransform callback (send WebSocket message)

**Keep existing:**
- WebSocket connection logic
- Message handlers
- Presence tracking
- All existing state

**Test immediately:**
- Run frontend dev server
- Run backend dev server
- Open http://localhost:5173
- Should see canvas (might be empty)
- Check console for errors
- Add rectangle should work (even if not on Konva yet)

**Commit**: `feat(canvas): integrate Konva canvas component`

---

## Task 1.5: Update Toolbar Component

**File**: `frontend/src/components/Toolbar.tsx`

**What to add:**
- Props:
  - onAddShape: (type) => void
  - onDelete: () => void
  - onDuplicate: () => void
  - onColorChange: (color) => void
  - selectedCount: number

**Buttons to add:**
- "Add Rectangle"
- "Add Circle"
- "Add Text"
- "Add Line"
- "Duplicate" (disabled if selectedCount === 0)
- "Delete" (disabled if selectedCount === 0)
- Color picker input (disabled if selectedCount === 0)
- Show selection count

**Test immediately:**
- Buttons render
- Buttons call correct handlers
- Disabled state works
- Color picker works

**Commit**: `feat(toolbar): add shape buttons, duplicate, color picker`

---

## Task 1.6: Connect Toolbar to Canvas

**File**: `frontend/src/pages/Canvas.tsx`

**What to add:**
- handleAddShape(type) function
  - Create CanvasObject with random position
  - Send OBJECT_CREATE via WebSocket

- handleDuplicate() function
  - Get selected objects
  - Create duplicates with offset position
  - Send OBJECT_CREATE for each

- handleColorChange(color) function
  - Update selected objects color
  - Send OBJECT_UPDATE for each

- handleDelete() function (already exists, verify it works)

**Add keyboard shortcuts:**
- Delete/Backspace: delete selected
- Ctrl+D: duplicate
- Escape: deselect

**Test immediately:**
- Click "Add Rectangle" → rectangle appears on canvas
- Select rectangle → can drag to move
- Drag corners → can resize
- Drag rotation handle → can rotate
- Select rectangle → change color → color changes
- Select rectangle → press Ctrl+D → duplicate appears
- Select rectangle → press Delete → rectangle disappears
- All changes sync to second browser window

**If any test fails, debug before continuing!**

**Commit**: `feat(canvas): connect toolbar actions with keyboard shortcuts`

---

## Task 1.7: Add Styles for Konva Canvas

**File**: `frontend/src/styles.css`

**What to add:**
- .canvas-page styles (flex column layout)
- .canvas-container styles (flex 1, relative position, background)
- .toolbar styles (flexbox, padding, border)
- .toolbar-btn styles (padding, border, hover states)
- .toolbar-btn:disabled styles (opacity, cursor)
- .color-picker styles
- .connection-status styles

**Test immediately:**
- Canvas fills screen properly
- Toolbar looks clean
- Buttons have hover effects
- Color picker visible
- No layout issues

**Commit**: `style: add Konva canvas and toolbar styles`

---

## Task 1.8: Update Backend Message Types

**File**: `backend/src/ws/messageTypes.ts`

**What to add:**
- Add rotation, color, zIndex to CanvasObject interface
- Add text, fontSize, fontFamily (optional fields)
- Add points (optional field for lines)
- Add updatedAt (optional field)
- Add shape type: 'rectangle' | 'circle' | 'line' | 'text'

**Test immediately:**
- Backend compiles with no TypeScript errors
- Run `npm run build` in backend → success

**Commit**: `feat(types): add rotation, color, shape types to backend`

---

## Task 1.9: Update Backend State Management

**File**: `backend/src/state/canvasState.ts`

**What to change:**
- update() method should handle partial updates
- Support new fields (rotation, color, zIndex, etc.)
- Sort objects by zIndex when adding

**Test immediately:**
- Backend compiles
- Backend runs with no errors
- Can still create/update/delete objects via WebSocket

**Commit**: `refactor(state): support new object fields`

---

## Task 1.10: End-to-End Testing

**Test all features together:**

1. **Basic Canvas:**
   - [ ] Frontend runs with no console errors
   - [ ] Backend runs with no console errors
   - [ ] Can see canvas area

2. **Create Objects:**
   - [ ] Click "Add Rectangle" → rectangle appears
   - [ ] Click "Add Circle" → circle appears (should work now)
   - [ ] Click "Add Text" → text appears
   - [ ] Click "Add Line" → line appears

3. **Transform Objects:**
   - [ ] Click rectangle → selection border appears
   - [ ] Drag rectangle → moves smoothly
   - [ ] Drag corner → resizes
   - [ ] Drag rotation handle → rotates
   - [ ] All transforms feel smooth (no lag)

4. **Multi-Select:**
   - [ ] Shift+click multiple objects → all selected
   - [ ] Click empty space → all deselected

5. **Actions:**
   - [ ] Select object → change color → color updates
   - [ ] Select object → press Ctrl+D → duplicate appears
   - [ ] Select object → press Delete → object removed
   - [ ] Press Escape → deselects

6. **Real-Time Sync:**
   - [ ] Open two browser windows (different accounts)
   - [ ] User A creates rectangle → User B sees it appear
   - [ ] User A moves rectangle → User B sees it move
   - [ ] User A resizes rectangle → User B sees resize
   - [ ] User A rotates rectangle → User B sees rotation
   - [ ] User A changes color → User B sees color change
   - [ ] User A deletes → User B sees disappear
   - [ ] Cursors visible for both users
   - [ ] All sync happens in <1 second

7. **Performance:**
   - [ ] Create 20 rectangles → still smooth
   - [ ] Drag multiple objects → no lag
   - [ ] Resize while other user creates → no conflicts

**If any test fails:**
- Debug and fix before merging PR10
- Don't proceed to PR11 with broken features

**Commit**: `test: verify PR10 complete - all features working`

---

## PR10 Definition of Done

- [ ] Konva.js integrated and rendering
- [ ] Can create rectangles, circles, text, lines
- [ ] Can resize by dragging corners
- [ ] Can rotate by dragging rotation handle
- [ ] Can duplicate with Ctrl+D
- [ ] Can change color with color picker
- [ ] Can delete with Delete key
- [ ] Multi-select with shift+click works
- [ ] Keyboard shortcuts work (Delete, Ctrl+D, Escape)
- [ ] All features sync in real-time between users
- [ ] No console errors
- [ ] No TypeScript errors
- [ ] Tested with 2 browser windows

**When all checked, PR10 is DONE → Merge to main → Start PR11**

