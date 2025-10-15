# AI-FIRST DEVELOPMENT: METHODOLOGIES AND LESSONS LEARNED

**Project Type:** Real-Time Collaborative Web Application  
**AI Tool:** Cursor IDE with Claude Sonnet 4.5  
**Timeline:** 24-hour MVP Sprint  
**Development Approach:** AI-First with Human Validation  

---

## 1. STRATEGIC PLANNING METHODOLOGY

### The Planning-First Approach

**Critical Success Factor:** Spending 1 hour on planning saved 5+ hours during execution.

#### Three Planning Documents Created:

**Product Requirements Document (PRD)**
- Started with complex project brief
- Prompted AI to extract ONLY 24-hour MVP requirements
- Result: Focused scope with explicit "out of scope" section
- Prevented scope creep throughout development

**Detailed Task Breakdown**
- AI generated Pull Requests with exact file paths
- Each PR had specific subtasks: "Create backend/src/auth/verifyToken.ts"
- Not vague goals like "implement auth" but precise file-level instructions
- This roadmap guided entire execution phase

**System Architecture**
- Created component relationship diagrams
- Defined message protocols and data structures
- Chose technical patterns upfront (singleton, broadcast, etc.)
- Had clear mental model before writing any code

**Why This Mattered:**
No time wasted on "what should I build next?" or "how does this fit together?" Every subsequent PR referenced the planning documents.

---

## 2. EXECUTION METHODOLOGY

### PR-by-PR Development Pattern

**The Process:**
1. Work through PRs in sequential order
2. Simple prompt: "work on pr1 of the tasks only"
3. AI reads task document and generates complete files
4. Each PR is merge-ready with no placeholders
5. Move to next PR only after validation

**Key Principle:** Incremental progress with clear checkpoints prevents confusion and enables rollback if needed.

### Real-Time Problem Solving Pattern

**Effective Debugging Flow:**
- Hit error → Copy full error log → Paste to AI → Get fix → Test → Continue
- ~90% success rate on first fix attempt
- Fast iteration without human fatigue or frustration

**The Error Pattern That Works:**
```
Human: "Build failed [paste full error log with stack trace]"
AI: [Analyzes root cause] → [Proposes specific fix] → [Implements] → [Commits]
Result: Fixed in one iteration
```

**The Pattern That Doesn't Work:**
```
Human: "Authentication doesn't work"
AI: [Asks clarifying questions] → More back-and-forth → [Repeat 3x]
Result: Slow progress
```

### Documentation-Alongside-Code

- Generate documentation while building, not after
- Writing "why" in docs solidifies architectural decisions
- Subsequent PRs reference earlier docs for consistency
- Better quality than typical post-project documentation

---

## 3. FIVE EFFECTIVE PROMPTING STRATEGIES

### PROMPT 1: Scope Reduction (Initial Planning)

**The Prompt:**
> "Create a formal PRD based on the attached project plan. Your primary task is to strictly limit scope to ONLY the MVP requirements achievable within 24 hours."

**Why It Worked:**
- Clear time constraint forced pragmatic decisions
- AI suggested in-memory state instead of database
- Focused on core features only
- Result: Actionable scope instead of idealistic feature list

**Key Learning:** AI thrives on constraints. Without boundaries, AI generates ideal solutions (over-engineered). With constraints, AI optimizes within realistic boundaries.

---

### PROMPT 2: File-Level Task Breakdown

**The Prompt:**
> "Generate a task list broken down by Pull Requests. For each subtask, specify the EXACT file paths that will be created or edited."

**Why It Worked:**
- Zero ambiguity in implementation
- Not "implement WebSocket" but "Create backend/src/ws/handlers.ts with message routing"
- Made each PR concrete and actionable
- AI knows exactly what files to create/modify

**Key Learning:** Specificity beats abstraction. File paths eliminate interpretation ambiguity.

---

### PROMPT 3: Incremental Execution

**The Prompt:**
> "work on the pr1 of the tasks only"

**Why It Worked:**
- Simple and direct
- AI reads task document for context automatically
- Stays focused on one PR at a time
- Prevented scope creep
- Repeated this pattern for all PRs with consistent results

**Key Learning:** Let AI reference structured documents. Don't repeat context in every prompt.

---

### PROMPT 4: Error-Driven Debugging

**The Prompt:**
> "Build failed src/ws/handlers.ts(1,27): error TS7016: Could not find a declaration file for module 'ws'. [full error log pasted verbatim]"

**Why It Worked:**
- Actual error output (not paraphrased) enables accurate diagnosis
- Stack traces reveal root cause immediately
- AI identified NODE_ENV=production was blocking devDependencies
- Fixed in one attempt with full context

**Key Learning:** Always provide raw error logs, console output, specific symptoms. No paraphrasing or summarizing.

---

### PROMPT 5: Strategic Feedback

**The Prompt:**
> "Why are you cd'ing every time even though you are in the current project root?"

**Why It Worked:**
- Direct feedback improved AI behavior permanently
- After this, AI checked current directory before running commands
- Human oversight refined the workflow
- AI learns from behavioral correction

**Key Learning:** Give direct feedback when AI develops inefficient patterns. AI adjusts quickly.

---

## 4. AI STRENGTHS & LIMITATIONS

### Where AI Excelled

**Architecture & Design**
- Created system architecture with clear component relationships
- Designed message protocols with proper typing
- Chose appropriate patterns from extensive knowledge base
- Breadth across many tech stacks

**Boilerplate & Configuration**
- Perfect configuration files (TypeScript, bundlers, deployment)
- Correct types and interfaces without trial-and-error
- Proper module setup from millions of examples
- Saves hours of documentation reading

**Documentation Quality**
- Professional structure and consistent format
- Comprehensive coverage without gaps
- No laziness or shortcuts
- Often better than human-written docs

**Debugging Efficiency**
- Fixed 12+ deployment errors with ~90% first-attempt success
- Identified subtle issues (environment conflicts, path problems)
- Fast iteration without fatigue
- Consistent diagnostic approach

**Full-Stack Consistency**
- Kept frontend/backend types synchronized automatically
- Consistent error handling patterns throughout
- Matching interfaces between client and server
- Sees entire codebase, prevents mismatches

### Where AI Struggled

**Platform UIs**
- Cannot interact with web dashboards (Vercel, Firebase Console, GitHub)
- Cannot manually add SSH keys or set environment variables
- Cannot create pull requests (can push branches)
- Limited to terminal and file operations

**External Services**
- Needs human to verify credentials
- Cannot access external service dashboards
- Cannot enable features in third-party consoles
- Requires human for OAuth setup verification

**Ambiguity**
- "Authentication not working" → needs specific error logs
- "Deployment failed" → needs actual build output  
- Cannot "see" browser console or network tab
- Needs precise information, not descriptions

### What AI Needed From Humans

1. **Credentials:** API keys, project IDs, secrets
2. **Manual Actions:** Dashboard configurations, platform settings
3. **Validation:** Testing and confirming "yes, this works"
4. **Strategic Decisions:** Choosing between Firebase vs Okta, deployment platforms
5. **Environment Info:** Local machine setup, network configuration

---

## 5. SEVEN KEY LEARNINGS

### LEARNING 1: AI Thrives on Constraints

Without constraints, AI generates ideal (over-engineered) solutions. With constraints, AI optimizes pragmatically.

**Actionable:** Always specify time, scope, and complexity limits upfront.

---

### LEARNING 2: Planning Beats Perfect Code

1 hour of planning (PRD + Tasks + Architecture) saved 5+ hours during execution.

**Actionable:** Invest in strategic planning with AI before any coding. Generate comprehensive roadmap first.

---

### LEARNING 3: Error Logs Are Gold

12 deployment errors fixed with ~90% success rate by providing full error logs.

**Actionable:** Always provide complete error logs, console output, specific symptoms. Never paraphrase.

---

### LEARNING 4: AI Better at "Solved Problems"

Configuration files, boilerplate, standard patterns = 100% AI-generated effectively. AI has seen millions of examples of common patterns.

**Actionable:** Let AI generate all boilerplate/config. Focus human effort on novel problems and business logic.

---

### LEARNING 5: Iterate, Don't Perfect

Best results came from conversational iteration, not one-shot prompts.

**Example Pattern:**
- Prompt 1: "Deploy to platform" → AI creates config
- Prompt 2: "Build failed [error]" → AI fixes types
- Prompt 3: "Still failing [error]" → AI fixes command
- Prompt 4: "Wrong path" → AI corrects
- Result: Working after 4 quick iterations

**Actionable:** Start with clear goal, iterate based on results. Don't craft perfect prompt for 30 minutes.

---

### LEARNING 6: Human Role Shifted

**Traditional Flow:**  
Human writes code → AI reviews → Human fixes

**AI-First Flow:**  
Human specifies goal → AI generates → Human tests → Iterate

Human role becomes product validator, not code reviewer. Focus on behavioral validation, not line-by-line review.

**Actionable:** Structure workflow around "does it work?" not "is the code perfect?"

---

### LEARNING 7: Documentation Compounds

AI-generated docs alongside code (not after) improved code quality. Writing architectural rationale in docs solidified patterns for subsequent work.

**Actionable:** Generate documentation alongside code. Don't treat as post-project cleanup.

---

**End of Document**


