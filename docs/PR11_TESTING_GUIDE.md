# PR11: AI Canvas Agent - Testing Guide

**Branch**: `pr11-ai-canvas-agent`  
**Status**: ✅ Code Complete - Ready for Testing  
**TypeScript**: ✅ No compilation errors

---

## What Was Built

### 🤖 AI Canvas Agent with 8 Command Types

1. **create_shape** - Create shapes with natural language
2. **modify_color** - Change colors of objects
3. **move_objects** - Move objects by direction/distance  
4. **resize_objects** - Scale objects up/down
5. **rotate_objects** - Rotate by degrees
6. **delete_objects** - Delete by selector
7. **arrange_objects** - Grid, circle, line, align layouts
8. **duplicate_objects** - Duplicate with patterns

### 📁 Files Created/Modified

**New Files:**
- `frontend/src/lib/ai-functions.ts` - 8 AI function definitions
- `frontend/src/lib/ai-service.ts` - OpenAI integration service
- `frontend/src/components/AIChat.tsx` - Chat UI component

**Modified Files:**
- `frontend/src/pages/Canvas.tsx` - AI integration + executeAIFunction handler
- `frontend/src/styles.css` - AI chat styling (380+ lines)
- `frontend/env.example.txt` - Added VITE_OPENAI_API_KEY
- `frontend/package.json` - Added openai dependency

---

## Prerequisites for Testing

### 1. Get OpenAI API Key

Visit: https://platform.openai.com/api-keys

1. Sign up or log in to OpenAI
2. Navigate to API Keys section
3. Create new secret key
4. Copy the key (starts with `sk-`)

### 2. Configure Environment

```bash
# In frontend directory
cd frontend

# Copy the example if you don't have .env yet
cp env.example.txt .env

# Edit .env and add your OpenAI API key
# Add this line:
VITE_OPENAI_API_KEY=sk-your-actual-key-here
```

### 3. Install Dependencies (if needed)

```bash
cd frontend
npm install
```

---

## How to Test

### Start the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

Open browser to: `http://localhost:5173`

---

## Test Cases

### Test 1: Open AI Chat

1. Look for the **"🤖 AI Assistant"** button in bottom-right corner
2. Click it to open the sidebar
3. **Expected**: Sidebar slides in from right with welcome message
4. **Expected**: Status shows "AI Ready" with green dot

**If API key not configured:**
- Status will show "API Key Required" in red
- Chat will show error message with instructions

---

### Test 2: Create Shapes

**Test 2.1 - Simple Creation:**
```
Type: "create 3 blue circles"
```
- **Expected**: 3 blue circles appear on canvas
- **Expected**: AI responds with confirmation
- **Expected**: All users see the circles (multi-user sync)

**Test 2.2 - Multiple Types:**
```
Type: "create a red rectangle and a yellow star"
```
- **Expected**: Red rectangle and yellow star appear
- **Expected**: Positioned randomly on canvas

**Test 2.3 - Complex Creation:**
```
Type: "create 5 triangles"
```
- **Expected**: 5 triangles with random colors appear

---

### Test 3: Modify Colors

**Setup**: Create some shapes first

**Test 3.1 - All Objects:**
```
Type: "make everything red"
```
- **Expected**: All objects turn red

**Test 3.2 - By Type:**
```
Type: "make all circles blue"
```
- **Expected**: Only circles turn blue, others unchanged

**Test 3.3 - Selected Only:**
```
1. Select some shapes (Shift+click or drag-select)
2. Type: "make selected shapes green"
```
- **Expected**: Only selected shapes turn green

---

### Test 4: Move Objects

**Test 4.1 - Directional Move:**
```
Type: "move everything 50 pixels right"
```
- **Expected**: All objects shift 50px to the right

**Test 4.2 - Selected Move:**
```
1. Select some shapes
2. Type: "move selected 100 pixels down"
```
- **Expected**: Only selected shapes move down

---

### Test 5: Resize Objects

**Test 5.1 - Scale Up:**
```
Type: "make all circles bigger"
```
- **Expected**: Circles double in size (AI infers scale=2)

**Test 5.2 - Scale Down:**
```
Type: "make selected shapes smaller"
```
- **Expected**: Selected shapes become half size

**Test 5.3 - Specific Scale:**
```
Type: "resize all rectangles by 1.5"
```
- **Expected**: Rectangles grow by 50%

---

### Test 6: Rotate Objects

**Test 6.1 - Simple Rotation:**
```
Type: "rotate everything 45 degrees"
```
- **Expected**: All objects rotate 45° clockwise

**Test 6.2 - Counter-Clockwise:**
```
Type: "rotate selected -90 degrees"
```
- **Expected**: Selected shapes rotate 90° counter-clockwise

---

### Test 7: Delete Objects

**Test 7.1 - By Type:**
```
Type: "delete all circles"
```
- **Expected**: All circles disappear
- **Expected**: Other shapes remain

**Test 7.2 - Selected:**
```
1. Select some shapes
2. Type: "delete selected"
```
- **Expected**: Selected shapes removed

**Test 7.3 - Clear All:**
```
Type: "delete everything"
```
- **Expected**: Canvas becomes empty

---

### Test 8: Arrange Objects (Advanced)

**Setup**: Create multiple shapes first

**Test 8.1 - Grid Layout:**
```
1. Create 9 shapes (any type)
2. Type: "arrange all in a grid"
```
- **Expected**: Shapes arranged in 3x3 grid
- **Expected**: Even spacing between shapes

**Test 8.2 - Circle Layout:**
```
Type: "arrange selected in a circle"
```
- **Expected**: Selected shapes positioned in circular pattern

**Test 8.3 - Line Layout:**
```
Type: "arrange all in a horizontal line"
```
- **Expected**: Shapes lined up horizontally with spacing

**Test 8.4 - Alignment:**
```
Type: "align selected to the left"
```
- **Expected**: All selected shapes have same left edge (x position)

---

### Test 9: Duplicate Objects

**Test 9.1 - Simple Duplicate:**
```
1. Select a shape
2. Type: "duplicate selected"
```
- **Expected**: Duplicate appears offset by 20px

**Test 9.2 - Multiple Duplicates:**
```
Type: "duplicate selected 5 times"
```
- **Expected**: 5 copies created, each offset by 20px

**Test 9.3 - Custom Offset:**
```
Type: "duplicate all with 50 pixel spacing"
```
- **Expected**: Duplicates created with 50px offset

---

### Test 10: Multi-User Collaboration

**Setup**: Open in 2 browser windows with different Google accounts

**Test 10.1 - AI Actions Sync:**
```
Window 1: Type "create 3 red circles"
Window 2: Should see 3 red circles appear immediately
```

**Test 10.2 - Both Use AI:**
```
Window 1: "create blue rectangles"
Window 2: "create yellow stars"
Both: Should see each other's shapes
```

---

### Test 11: Error Handling

**Test 11.1 - Invalid Command:**
```
Type: "do something impossible"
```
- **Expected**: AI responds with helpful message
- **Expected**: No errors in console

**Test 11.2 - No Selection:**
```
Type: "move selected 50 right" (with nothing selected)
```
- **Expected**: Command executes but affects 0 objects
- **Expected**: AI responds appropriately

---

### Test 12: Example Commands

1. Click the **💡** button in chat input
2. **Expected**: Example commands list appears
3. Click any example
4. **Expected**: Command fills input field
5. Press send
6. **Expected**: Command executes successfully

---

### Test 13: Chat UI Features

**Test 13.1 - Message History:**
- Send multiple commands
- **Expected**: Messages stay in history
- **Expected**: Scrollable if many messages
- **Expected**: User messages on right (purple), AI on left (gray)

**Test 13.2 - Loading State:**
- Send a command
- **Expected**: Animated dots appear while AI processes
- **Expected**: Dots disappear when response arrives

**Test 13.3 - Close and Reopen:**
- Close sidebar with X button
- Reopen with floating button
- **Expected**: Message history preserved
- **Expected**: Smooth animations

---

## Expected Behavior Summary

### ✅ What Should Work

1. **AI Understanding**: Natural language like "create 3 blue circles"
2. **Real-Time Sync**: All users see AI actions immediately
3. **Context Awareness**: AI knows about selected shapes and canvas state
4. **All 8 Commands**: Every command type executes correctly
5. **Smooth UI**: Animations, loading states, error handling
6. **Multi-User**: Multiple users can use AI simultaneously

### ⚠️ Known Limitations

1. **API Key Required**: Without OpenAI key, AI features won't work
2. **Cost**: Each command uses OpenAI API (small cost per request)
3. **Context Limit**: Very long conversation history may hit token limits
4. **Ambiguity**: Vague commands like "fix this" may not work well

---

## Debugging

### If AI Chat Doesn't Open

1. Check browser console for errors
2. Verify TypeScript compiled: `cd frontend && npx tsc --noEmit`
3. Check that frontend is running on `localhost:5173`

### If AI Commands Don't Execute

1. **Check API Key**: Look at chat status indicator
   - Green dot + "AI Ready" = configured ✅
   - Red + "API Key Required" = not configured ❌
   
2. **Check Console**: Look for error messages
   - Network errors = API key invalid
   - CORS errors = API key domain restrictions
   
3. **Check OpenAI Dashboard**: 
   - Visit platform.openai.com/usage
   - Verify API key is active
   - Check for rate limits or billing issues

### If Commands Execute But Don't Sync

1. Check WebSocket connection (should see "Connected" in console)
2. Verify backend is running
3. Test with manual canvas operations (do they sync?)

---

## Performance Expectations

- **AI Response Time**: 1-3 seconds per command
- **Canvas Update**: < 100ms after AI response
- **Multi-User Sync**: < 100ms across clients
- **UI Animations**: 60 FPS smooth

---

## Success Criteria

PR11 is ready to merge when:

- [ ] All 8 command types execute correctly
- [ ] AI actions sync across multiple users
- [ ] Chat UI is smooth with no errors
- [ ] TypeScript compiles with no errors
- [ ] Example commands work as expected
- [ ] Error handling graceful (bad API key, invalid commands)
- [ ] Performance meets expectations (<2s AI response)

---

## Next Steps After Testing

1. **If all tests pass**: Commit PR11 changes
2. **Create PR on GitHub**: Merge to main
3. **Deploy to production**: Test with production WebSocket
4. **Update memory bank**: Document 100/100 achievement
5. **Create demo video**: Show AI features in action

---

**Value**: This PR adds the final 15 points → **100/100 (Grade A+)** 🎉

