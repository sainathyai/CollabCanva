Oct 13, 2025

## Class 1: AI-First Development Introduction

**Instructor**: Ash Tilawat
**Project**: Collab Canvas (Figma Clone with AI Features)

### Class Overview

This class introduced the foundational AI-first development methodology, covering planning, context management, and effective interaction with AI coding agents like Cursor. The focus was on building a collaborative design experience (Figma clone) as the first project.

---

## Project Introduction: Collab Canvas

### Project Goal

Build a collaborative design experience similar to Figma with AI features that will be added in later stages.

### MVP Requirements

1. **Basic Canvas**: Pan and zoom functionality
2. **Object Creation**: Ability to create and move objects
3. **Real-time Sync**: Synchronization between at least two users
4. **Presence Awareness**: See other users and their cursors
5. **Basic Authentication**: User authentication system
6. **Deployment**: Deploy to staging environment

### Purpose

This project serves as a **foundational layer for future AI agent integration**—the underlying Figma features are necessary for the AI agent to function effectively.

---

## AI-First Development Methodology

### The Three Planning Steps

Ash outlined three crucial planning steps that provide context to the AI coding agent:

1. **Product Requirements Document (PRD)**
2. **Task Creation (Task List)**
3. **Architecture Diagram**

These elements enable the coding agent to follow prescriptive directives accurately.

### Why Planning Matters

- Provides necessary context for AI
- Enables more accurate code generation
- Reduces back-and-forth iterations
- Maintains scope and direction
- Saves tokens and time in the long run

---

## Step 1: Product Requirements Document (PRD)

### Purpose

A high-level document that outlines the product vision, features, user stories, and requirements for MVP development.

### Time Investment

Spend **at least 30 minutes to 1 hour** on PRD planning and breakdown, especially when unfamiliar with the technology.

### PRD Structure

```markdown
## Overview
- Brief description of the feature/product
- Problem it solves

## Goals
- Specific, measurable objectives

## User Stories
- As a [user type], I want to [action] so that [benefit]

## Key Features (MVP)
- List of essential features for MVP

## Technical Stack
- Recommended technologies (e.g., Firebase, React)

## Out of Scope
- Features NOT included in MVP

## Success Criteria
- How to measure success
```

### PRD Best Practices

#### Do's:
- Focus on MVP requirements first
- Prioritize primary user personas
- Be specific about features
- Define clear success criteria
- Include technical stack recommendations

#### Don'ts:
- Don't over-focus on UI aesthetics initially
- Don't include every possible feature
- Don't be vague about requirements
- Don't skip validation of user stories

### Example: Collab Canvas PRD

**Priority Decision**: During class, Ash reviewed a PRD and decided to prioritize the "primary user designer and creator" over the "collaborator" for MVP development, moving collaborator user stories to a later stage.

**Tech Stack Decision**: Agreed on Firebase (for real-time events and subscriptions) and React (for frontend).

---

## Step 2: Task Creation

### Purpose

Break down the PRD into actionable, prescriptive tasks that guide the AI step-by-step through implementation.

### Task List Requirements

Tasks must be:
- **Highly prescriptive and detailed**
- **Broken into parent tasks and subtasks**
- **Specific and actionable**
- **Ordered logically**

### Task List Structure

```markdown
## Tasks

- [ ] 1.0 Parent Task Title
  - [ ] 1.1 Sub-task description 1.1
  - [ ] 1.2 Sub-task description 1.2
- [ ] 2.0 Parent Task Title
  - [ ] 2.1 Sub-task description 2.1
  - [ ] 2.2 Sub-task description 2.2
- [ ] 3.0 Parent Task Title
  ...
```

### Common Pitfall: Too General

Jared in office hours noted his task list felt "too general." Ash advised that task lists need to be **highly prescriptive and detailed**, with external documents or architecture diagrams providing more context.

### Task List Best Practices

1. **Be prescriptive**: Tell AI exactly what to do
2. **One task at a time**: Complete one before moving to next
3. **Update as you go**: Mark completed tasks immediately
4. **Add new tasks**: As they emerge during development
5. **Version control**: Commit task lists to GitHub

### Cursor Rule for Automatic Updates

You can create a Cursor rule that automatically checks off completed tasks:
```
Every time you complete a task in the task list, check it off.
```

---

## Step 3: Architecture Diagram

### Purpose

Visual representation of:
- Codebase connections
- Client-server interactions
- Technologies used
- Data flow
- Component relationships

### Recommended Format: Mermaid Diagrams

Mermaid diagrams can be created by AI and embedded in markdown files.

### Verification Process

1. **Generate**: Use AI (Claude) to create Mermaid diagram based on PRD and tech stack
2. **Visualize**: Use tools like Excalidraw to check for errors
3. **Correct**: Feed errors back to Claude for correction
4. **Verify**: Thorough review for accuracy is essential

**Key Point**: Always verify AI-generated content—don't trust it blindly.

### When Architecture Diagrams Matter Most

- **Initial greenfielding**: Less critical, can be lighter
- **Complex codebases**: Crucial for multi-service, multi-repository systems
- **Brownfield projects**: Essential for understanding existing structure
- **Team collaboration**: Helps everyone understand system design

---

## Voice-to-Text for Workflow Optimization

### Why Use Voice Transcription?

Typing is a significant time sink when developing with AI. Voice transcription services save time and allow faster idea capture.

### Recommended Tools

- **Aqua Voice**: Removes filler words ("ums") and grammatical mistakes, saving tokens
- **Basic voice-to-text**: Also sufficient if specialized tools unavailable

### Best Practices

- Use quality microphone for better accuracy
- Speak clearly and naturally
- Review and edit output before submitting to AI
- Use for PRD creation, task descriptions, prompts

### Demonstration

Ash demonstrated using voice input to create a PRD for the Collab Canvas project, detailing necessary sections and focusing on MVP requirements.

---

## Planning Environment Strategy

### Where to Plan: Outside of Cursor

**Key Recommendation**: Perform initial planning in a **free environment** (Claude.ai, ChatGPT) outside of Cursor to conserve premium account tokens.

### Why This Matters

- Tokens are consumed in Cursor for research, planning, and document creation
- Coding should be the primary activity within Cursor once planning is complete
- AI service costs are predicted to increase
- Context window management is crucial, especially in brownfield projects

### Workflow

```
1. Free LLM (Claude.ai/ChatGPT)
   ↓
   Generate PRD, Task List, Architecture
   ↓
2. Transfer to Cursor
   ↓
   Add to project as .md files
   ↓
3. Use Cursor for Coding
   ↓
   Point AI to planning documents for context
```

---

## Context Engineering & Management

### What is Context Engineering?

Deciding what information to **provide or withhold** from the AI's prompt to ensure task completion.

### Context Window in Cursor

- **Open tabs**: Cursor reads first 250 lines
- **Directly pointed files**: Takes whole file (up to 500 lines)
- **Past chats**: Use sparingly—can corrupt current chat's context window
- **Best practice**: Divide chats by tasks to maintain clear context

### Strategy: Delineating Concerns

**Reuben's Question**: How to separate concerns in prompts?

**Ash's Answer**: Only delineate concerns by **repository**—the repository serves as the domain of context for AI.

### Context Window Fluctuations

**What causes percentage changes?**
- Cursor manages context dynamically
- Cleans up at checkpoints
- Adjusts based on added/removed chat history and documents
- Drops may indicate internal summarization happening

**When to start new chat:**
- Context reaches 80-90%
- Stuck on complex issues
- Need fresh perspective
- Major task/feature shift

---

## Cursor Environment Setup

### Initial Setup Process

1. **Create planning files** in project:
   - `prd.md` - Product Requirements Document
   - `tasks.md` - Task list
   - `architecture.md` - Mermaid diagram

2. **Populate with content** generated in Claude/ChatGPT

3. **Configure Cursor settings**:
   - Select model (Claude 4.5 or GPT-5 as starting points)
   - Use Max Mode only for difficult tasks (due to cost)
   - Keep auto mode for general tasks

4. **Index documents**: Ensure Cursor has access to planning files

### What NOT to Let AI Do

**Critical**: Do **NOT** let AI create the initial environment setup for frontend or Python projects—it tends to fail.

**Recommended approach**:
1. Developer scaffolds environment using templates
2. Follow official documentation ("getting started" guides)
3. Then instruct AI to work within pre-set structure

### Why This Matters

AI is primarily for **coding**, not **environment setup**. Setup requires current documentation and specific configurations that AI training data may not reflect accurately.

---

## Managing AI Interactions

### Treating AI as a Conversational Partner

Effective interaction involves **open conversation**—discussing checks and processes rather than simply issuing commands.

**Example**: "Let's review the authentication flow. Walk me through what you're planning to implement, then we'll verify it meets the requirements."

### Review Terminal Commands

**Critical**: Carefully review terminal commands before execution.

**Common issues**:
- Versioning problems (Node, Python)
- Package installation issues
- Environment variable misconfigurations
- Dependency conflicts

### Allow List Strategy

**Kiran's Question**: Which commands to allow list for AI?

**Ash's Answer**: Keep AI away from:
- Packages
- Environments
- Dependencies
- Runtime configurations

Allow AI more freedom with:
- Direct code (API routes, components)
- As long as changes are confirmed and planned

---

## Technical Stack Recommendations

### Recommended for Collab Canvas

#### Frontend
- **React**: Widely understood by LLMs, quick compilation
- **Vite**: Faster than Create React App, better routing

#### Backend
- **Firebase**: Real-time events, subscriptions, authentication
  - Firestore for database
  - Firebase Auth for authentication
  - Cloud Functions for serverless backend

#### State Management
- **useState**: For short-term, local state
- **useContext**: For app-wide, global state
- Both are well-understood by LLMs

### Architecture Considerations

**Matt's Question**: What architecture is suitable for adding agents?

**Ash's Answer**: Basic setup including:
- Database
- Backend layer
- React frontend (to handle caching and data)

Firebase recommended due to real-time capabilities needed for collaborative features.

---

## Common MVP Pitfalls & Advice

### Avoid These Mistakes

1. **Over-focusing on UI aesthetics**
   - Get functionality working first
   - Polish UI after core features complete

2. **Building authentication from scratch**
   - Use third-party authentication services
   - Don't reinvent the wheel for MVP

3. **Not planning before Cursor**
   - Spend time on thorough planning
   - Reduces need for major refactors

4. **Deploying at the last minute**
   - Deploy early to avoid CI/CD issues
   - Establish deployment pipeline from beginning

5. **Not reducing scope**
   - Focus on single collaborative canvas for MVP
   - Multiple users can access it
   - Get core feature working first

### Scope Reduction Strategy

For MVP, focus on:
- **One canvas** that multiple users can access
- **Core collaboration features** (presence, cursors, basic shapes)
- **Simple objects** (rectangles, circles)
- **Basic functionality** (create, move, delete)

Advanced features for later:
- Multi-select
- Complex shapes
- Layers panel
- Advanced editing tools

---

## Managing Secrets & Security

### Best Practices

1. **Use `.env` files** for environment variables
2. **Add to `.gitignore`** to prevent committing secrets
3. **Add to `.cursorignore`** to prevent AI from seeing secrets
4. **Manual verification**: Check that API keys aren't in code before commits

### Firebase Security Rules

Common production issue: Firebase security rules blocking requests.

**Debugging steps**:
1. Check Firebase console for security rules
2. Review logging for component making call
3. Verify environment variables in production
4. Test locally first, then deploy

---

## Test-Driven Development with AI

### Setting Clear Rules

**Reuben's Question**: AI might ignore or improperly create tests—how to handle?

**Ash's Answer**:
- Establish strict rule that **tests must pass**
- Specify exact terminal command to run tests
- Example: `npx jest [optional/path/to/test/file]`

### Testing Strategy

#### Unit Tests
- Place alongside code files being tested
- Example: `MyComponent.tsx` and `MyComponent.test.tsx` in same directory
- AI often struggles with frontend unit tests (especially with Vit)

#### Integration Tests
- **Focus here for MVP**: Test key features
- Ensure data sync works
- Verify database storage
- Test real-time updates

#### Manual Testing
- Often more effective for frontend during rapid development
- Visual testing catches UI issues faster
- Save deep unit testing for later stages

---

## Debugging Strategy with AI

### When Errors Occur (Which They Will)

**Noah's Question**: Should I manually correct errors if I can debug faster than AI?

**Ash's Answer**:
- **This week**: No—practice prompting AI to understand and fix its own errors
- **Purpose**: Improve your prompting skills
- **Exception**: Minor issues (like Mermaid diagram corrections) can be manual

### Debugging Workflow

1. **Copy error** directly from browser console or terminal
2. **Provide to AI** with context about what you were trying to do
3. **Ask AI to explain** the error first
4. **Request fix** with specific instructions
5. **Verify fix** and test
6. **If still broken**: Use screenshots, logs, more context

### Advanced Debugging

**Mark's Bug-Fixing Process** (from office hours):
1. Identify all functions/components involved
2. Give prescriptive prompt to log entire data flow
3. Run process again
4. Screenshot logs
5. Feed logs back to AI to pinpoint and fix error

**Nick's Addition**: Tell AI to **stop writing code** and **discuss root cause** before executing fix.

---

## Product Manager + Engineer Role Merging

### Modern Software Development Trend

**Johnathan's Question**: Is this process showing PM and engineer roles merging?

**Ash's Answer**: At Gauntlet, they believe **PM and engineer roles are becoming the same job**.

### Why This Matters

- AI enables one person to handle both roles
- Product thinking + technical implementation = powerful combination
- Some startups seek individuals who can perform functions of entire team
- Varies by company—not universal yet

### Ash's Background

Ash's product management background influences their task breakdown and management approach, demonstrating this merged role in action.

---

## Technical Decision-Making Without Expertise

### When You Don't Know the Best Approach

**Matt's Question**: How to ensure architectural and technology decisions are correct when lacking expertise?

**Ash's Answer**:

1. **First**: Learn about the technologies involved
   - Don't stay completely ignorant
   - Basic understanding required

2. **Second**: Prompt LLM to generate **pros/cons list** for different choices
   - Compare options
   - Understand tradeoffs

3. **Third**: Remember AI development allows **flexible technology changes**
   - Can swap libraries/tools more easily
   - Not locked in permanently

### Making Technology Choices

For Collab Canvas:
- Firebase vs PostgreSQL: Both acceptable based on comfort level
- React vs other frameworks: Recommended React for LLM understanding
- State management tools: Flexible—Zustand, Kia, useContext all work

---

## Managing Code Quality & "Slop"

### What is "Slop"?

- Unnecessary code
- Dead code not being used
- Over-complicated implementations
- Bloated files (1000+ lines)
- Repetitive code

### Detection Strategy

**Francisco's Question**: How to clean up slop when focused on AI generation?

**Ash's Answer**:

1. **AI Detection**: Use Gemini 2.5 to efficiently detect and remove dead code
2. **Cursor Analysis**: Use cursor to detect slop within code
3. **Existing Libraries**: Utilize libraries for deterministic code analysis
4. **Scheduled Cleanup**: About 1 hour throughout week to break up large files

### Prevention Strategy

1. **Understand code being generated**: Don't blindly accept AI output
2. **Review files after generation**: Check for over-complexity
3. **Break up large files**: Keep components focused and manageable
4. **Remove dead code**: Delete unused imports, functions, components

---

## Checkpointing & Version Control

### Git Best Practices

- Use Git for version control
- Have clean commits
- Essential for complex projects or team work
- Enables rollback if needed

### Cursor's In-Built Checkpointing

- Manages chat history and context
- Allows reverting to previous states
- Don't rely on as ultimate solution
- Adhere to standard best practices

### Commit Strategy

**Zac's Preference**: Commit when task fully completed rather than after every change.

**Alternative**: Some prefer frequent commits for granular history.

Choose what works for your workflow.

---

## Green Fielding vs Brown Fielding

### Green Fielding (New Projects)

**Ash's demonstrated strategy** is primarily for green fielding:
- Starting from scratch
- Clean slate
- Define all architecture
- Control all decisions

### Brown Fielding (Existing Codebases)

**Different process** required:
- Understanding existing structure
- Working within constraints
- Careful context management
- More challenging—blowing context happens quickly

### Strategy Differences

- Green fielding: More freedom, easier context management
- Brown fielding: Requires deep understanding, careful navigation

---

## Understanding Your Codebase

### What You Need to Know

When green-fielding, understand:

1. **Component Structure**: High-level system design
2. **Directory Organization**: Purpose of each folder
3. **Data Flow**: User actions → data movement across application

### What You DON'T Need to Know

- Inner workings of every UI component
- Exact implementation of every API call
- Low-level details of dependencies

### Why This Matters

You control all new code being generated—focus on architecture and flow, not implementation details (that's AI's job).

---

## Feedback & Iteration

### Feedback Timeline

- Typically **24 hours after submission** due to volume
- Don't wait for feedback to continue working
- Success criteria already defined in rubric

### Iterating Without Feedback

- Project success criteria are clearly defined
- Continue working based on requirements
- Ask questions in office hours if stuck
- Use help channel for peer support

---

## Key Insights from Class Discussion

### Brain Lifts & Non-Consensus Views

**Austen's concept**: "Brain lifts" are methods for overriding AI models' default or "consensus" behavior.

**Purpose**: Build innovative products that go beyond generic solutions.

**Process**:
1. Learn facts
2. Identify areas where non-consensus views are correct
3. Guide AI model to adopt those perspectives

### Cost-Effectiveness

**Context window management** is critical:
- Especially important in brownfield projects
- Blowing context can occur quickly
- Use Cursor primarily as coder
- Conduct research outside to manage costs

### Control Over Task List Generation

**Matt's Question**: Claude vs Cursor for PRD/checklist generation?

**Ash's Answer**:
- If you generate task lists yourself: Maintain control over prompts and criteria
- If Cursor/Claude generates: They follow their own system prompts (less control)
- **Beginning stage**: Maintain more control to direct tech stack and architecture

---

## Success Metrics for This Class

By end of Class 1, you should:

✅ Understand the three planning steps (PRD, Tasks, Architecture)
✅ Know how to use voice transcription for efficiency
✅ Understand context engineering and management
✅ Have Cursor environment set up with planning files
✅ Know what to let AI handle vs do yourself
✅ Understand green fielding strategy
✅ Be ready to start building Collab Canvas MVP

---

## Action Items from Class 1

- [ ] Set up Cursor environment with planning files
- [ ] Create PRD for Collab Canvas MVP
- [ ] Generate task list from PRD
- [ ] Create architecture diagram (Mermaid)
- [ ] Begin Figma MVP development following task list
- [ ] Deploy early to establish CI/CD pipeline
- [ ] Note down questions for office hours

---

## Additional Resources

### Links & Documentation

- Cursor-specific links (provided after class)
- Link library (available on platform)
- Topic-specific resources (provided as relevant)

### Support Channels

- **Help Channel**: For significant questions
- **Office Hours**: For detailed troubleshooting
- **Direct Messages to Ash**: Always welcome

---

*Last Updated: October 13, 2025*
*Transcribed from Cohort 3 Kickoff & Class 1*

