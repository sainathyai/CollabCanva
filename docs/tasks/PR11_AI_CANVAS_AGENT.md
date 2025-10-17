# PR11: AI Canvas Agent

**Branch**: `pr11-ai-canvas-agent`
**Goal**: Implement AI-powered canvas manipulation with natural language commands

**Prerequisites**: PR10 must be complete and merged

**Status**: 🚀 PRIORITY - **15 POINTS TO 100/100**

**Estimated Time**: 4-6 hours

**Value**: This PR delivers the final 15 points needed to achieve 100/100 (Grade A+)

---

## Overview

Implement an AI agent that can manipulate the canvas through natural language commands. Users can type commands like "create 3 red circles" or "make all rectangles blue" and the AI will execute them.

### Core Requirements
- Natural language understanding
- 6+ distinct command types
- Function calling to canvas operations
- Shared results (all users see AI actions)
- <2 second response time

### Technical Approach
- OpenAI GPT-4 with function calling
- Chat UI component (sidebar or overlay)
- Map canvas operations to AI functions
- WebSocket broadcast of AI actions

---

## Task 1: Choose AI Provider & Set Up

**Decision needed**: OpenAI GPT-4 or Anthropic Claude?

### Option A: OpenAI GPT-4 ✅ RECOMMENDED
**Pros:**
- Native function calling support
- Well-documented
- Fast response times
- Easy integration

**Cons:**
- Requires API key
- Usage costs ($0.03 per 1K tokens)

**Setup needed:**
- Install openai package from npm
- Get API key from OpenAI platform
- Add to environment variables

### Option B: Anthropic Claude
**Pros:**
- Better reasoning for complex commands
- Tool use (similar to function calling)

**Cons:**
- Slightly more complex setup
- Different API structure

**Recommendation**: Start with OpenAI GPT-4 for speed and simplicity.

---

## Task 2: Define AI Functions (Canvas Operations)

**File**: `frontend/src/lib/ai-functions.ts` (NEW)

Define functions the AI can call:

### Basic Commands (6 required)
1. **create_shape** - Create new shapes
   - Parameters: type, count, color?, x?, y?, width?, height?
   - Example: "create 3 red circles"

2. **modify_color** - Change object colors
   - Parameters: selector (all/selected/type), color
   - Example: "make all rectangles blue"

3. **move_objects** - Move objects
   - Parameters: selector, dx, dy (or to x, y)
   - Example: "move selected shapes 50 pixels right"

4. **resize_objects** - Resize objects
   - Parameters: selector, scale or width/height
   - Example: "make all circles bigger"

5. **rotate_objects** - Rotate objects
   - Parameters: selector, degrees
   - Example: "rotate selected 45 degrees"

6. **delete_objects** - Delete objects
   - Parameters: selector
   - Example: "delete all text objects"

### Advanced Commands (Bonus)
7. **arrange_objects** - Layout/alignment
   - Parameters: selector, arrangement (grid, circle, line, align)
   - Example: "arrange selected in a circle"

8. **duplicate_objects** - Duplicate with pattern
   - Parameters: selector, count, offset
   - Example: "duplicate selected 5 times with 20px spacing"

---

## Task 3: Create AI Service

**File**: `frontend/src/lib/ai-service.ts` (NEW)

**What to implement:**
- Create OpenAI client instance with API key from environment
- Allow browser-based API calls (for frontend usage)
- Implement function to process AI commands
- Accept prompt and canvas context (objects, selected IDs)
- Send request to OpenAI with:
  - Model: GPT-4 Turbo
  - System message describing the assistant role
  - Context about current canvas state (object count, selected count, available shapes)
  - User prompt
  - Function definitions for canvas operations
  - Auto function calling enabled
- Parse AI response and return structured result
- Handle function call responses from AI

---

## Task 4: Create Chat UI Component

**File**: `frontend/src/components/AIChat.tsx` (NEW)

**Design options:**

### Option A: Sidebar (Recommended)
- Right side panel (300px width)
- Chat history
- Input at bottom
- Toggle open/close

### Option B: Overlay Modal
- Centered modal
- Keyboard shortcut to open (Ctrl+K)
- Smaller footprint

**Recommendation**: Sidebar for always-visible AI access

**UI Elements:**
- Chat messages (user + AI)
- Input field with send button
- Loading state while AI thinks
- Error handling
- Example commands button

---

## Task 5: Integrate AI with Canvas

**File**: `frontend/src/pages/Canvas.tsx`

**Changes needed:**
1. Add AI chat sidebar
2. Add `handleAICommand` function
3. Execute AI function calls
4. Broadcast actions via WebSocket
5. Show AI actions in chat

**Flow:**
1. User types "create 3 red circles" in chat
2. Send prompt to OpenAI API with canvas context
3. AI returns function call with parameters (shape type, count, color)
4. Execute the function locally to create objects
5. Broadcast created objects via WebSocket
6. All users see 3 red circles appear on canvas
7. Display AI confirmation message in chat

---

## Task 6: Add Environment Variables

**File**: `frontend/.env`

**What to add:**
- Add VITE_OPENAI_API_KEY variable
- Value should be your OpenAI API key from platform.openai.com
- Ensure .env is in .gitignore (don't commit API keys)

**Security Note**: For production, API calls should go through backend to hide API key. For MVP/demo, frontend is acceptable.

---

## Task 7: Styling

**File**: `frontend/src/styles.css`

Add styles for:
- `.ai-chat-sidebar`
- `.ai-message` (user vs AI)
- `.ai-input`
- `.ai-loading`
- `.ai-examples`

**Design inspiration**: GitHub Copilot chat, ChatGPT interface

---

## Task 8: Testing

### Manual Testing Checklist

**Basic Commands:**
- [ ] "create 5 circles" → 5 circles appear
- [ ] "make them red" → selected circles turn red
- [ ] "create a blue rectangle" → blue rectangle appears
- [ ] "delete all circles" → circles removed
- [ ] "rotate selected 45 degrees" → rotation works

**Context Awareness:**
- [ ] "make them bigger" → affects selected or last created
- [ ] "create another one" → creates same type as last
- [ ] Commands understand "all", "selected", specific types

**Error Handling:**
- [ ] Invalid commands → helpful error message
- [ ] API errors → graceful fallback
- [ ] Rate limiting → queue or notify user

**Multi-User:**
- [ ] User A uses AI → User B sees results
- [ ] AI actions sync in real-time
- [ ] Both users can use AI simultaneously

**Performance:**
- [ ] AI response <2 seconds
- [ ] No lag during AI operations
- [ ] Multiple commands in sequence work

---

## Task 9: Advanced Features (If Time Permits)

### 9.1: Conversation Context
- Remember previous commands in session
- "and another one" → creates based on context
- "undo that" → reverse last AI action

### 9.2: Complex Multi-Step Commands
- "create a login form" → rectangle, 2 text fields, button
- "arrange in a grid" → layout algorithm

### 9.3: Smart Defaults
- Infer reasonable sizes/positions
- Don't overlap existing objects
- Use canvas center for placement

### 9.4: Undo/Redo for AI Actions
- Track AI actions separately
- "undo" command specific to AI
- History in chat

---

## Definition of Done

### Core Requirements ✅
- [ ] AI chat UI visible and functional
- [ ] 6+ command types working
- [ ] Natural language understanding
- [ ] Function calling works
- [ ] Actions broadcast via WebSocket
- [ ] All users see AI results
- [ ] Response time <2 seconds
- [ ] No console errors
- [ ] TypeScript compiles

### Testing ✅
- [ ] All basic commands tested
- [ ] Multi-user testing completed
- [ ] Error handling works
- [ ] Performance acceptable

### Polish ✅
- [ ] UI looks professional
- [ ] Example commands provided
- [ ] Loading states clear
- [ ] Error messages helpful

**When complete: 85/100 → 100/100 (Grade A+)** 🎉

---

## Implementation Order

**Recommended sequence:**

1. **Task 1** - Set up OpenAI (30 min)
2. **Task 2** - Define functions (1 hour)
3. **Task 3** - AI service (1 hour)
4. **Task 4** - Chat UI (1.5 hours)
5. **Task 5** - Integration (1 hour)
6. **Task 6** - Environment setup (15 min)
7. **Task 7** - Styling (30 min)
8. **Task 8** - Testing (1 hour)
9. **Task 9** - Advanced features (optional, 2 hours)

**Total**: 6-8 hours

---

## Expected Challenges

### Challenge 1: Function Calling Format
**Issue**: OpenAI function calling requires specific JSON schema
**Solution**: Use clear parameter definitions, test thoroughly

### Challenge 2: Context Understanding
**Issue**: "them", "those", "it" references
**Solution**: Pass canvas context in system prompt

### Challenge 3: Rate Limiting
**Issue**: OpenAI API has rate limits
**Solution**: Implement queuing, show loading state

### Challenge 4: Cost Management
**Issue**: API calls cost money
**Solution**: Cache responses where possible, use efficient prompts

---

## Success Metrics

**Functional:**
- ✅ 6+ command types working
- ✅ 90%+ command success rate
- ✅ <2 second response time

**User Experience:**
- ✅ Intuitive commands (no technical jargon needed)
- ✅ Clear feedback (loading, success, error)
- ✅ Examples provided for discovery

**Technical:**
- ✅ Clean code structure
- ✅ Proper error handling
- ✅ TypeScript types for all AI operations
- ✅ WebSocket sync working

---

## Notes

- **API Key**: Get from OpenAI dashboard (platform.openai.com)
- **Model**: Use `gpt-4-turbo-preview` for speed
- **Alternative**: Can switch to Claude if needed
- **Security**: Move API calls to backend for production
- **Testing**: Test with multiple users in different browsers

---

## Resources

- [OpenAI Function Calling Docs](https://platform.openai.com/docs/guides/function-calling)
- [OpenAI API Reference](https://platform.openai.com/docs/api-reference)
- [React OpenAI Integration Examples](https://github.com/openai/openai-node)

---

**When PR11 is complete, you'll have reached 100/100 points! 🏆**

