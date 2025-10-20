# Gauntlet AI Cohort 3 - Class Materials Index

*Last Updated: October 17, 2025*

## 📚 How to Use These Materials

This folder contains all class recordings, transcripts, and structured learning materials for Gauntlet AI Cohort 3.

### Recommended Learning Path

1. **Start Here**: [LEARNING_GUIDE_Philosophy_and_Technical_Deep_Dive.md](./LEARNING_GUIDE_Philosophy_and_Technical_Deep_Dive.md)
   - Read this first for deep understanding
   - Goes slow, builds concepts layer by layer
   - ~90 minutes reading time

2. **Program Structure**: [Cohort 3 Kickoff - Program Overview.md](./Cohort%203%20Kickoff%20-%20Program%20Overview.md)
   - Reference for deadlines, logistics, requirements
   - Quick reference document

3. **Technical Implementation**: [Class 1 - AI-First Development Introduction.md](./Class%201%20-%20AI-First%20Development%20Introduction.md)
   - Ash's specific methodology
   - Step-by-step technical guidance

4. **Individual Class Notes**: See below for specific topics

---

## 📅 Class Schedule & Materials

### Week 1: Foundations

#### Sunday, Oct 13 - Program Kickoff
- **📄 [Cohort 3 Kickoff - Program Overview.md](./Cohort%203%20Kickoff%20-%20Program%20Overview.md)**
  - Speakers: Austen Allred & Ash Tilawat
  - Topics: Program philosophy, structure, expectations, timelines
  - Duration: 2+ hours
  - [Recording Link](https://drive.google.com/file/d/1eS4Id9DernazMZCVMt2xl28Uu7lGBkKo/view?usp=drive_web)

#### Sunday, Oct 13 - Class 1: AI-First Development Introduction
- **📄 [Class 1 - AI-First Development Introduction.md](./Class%201%20-%20AI-First%20Development%20Introduction.md)**
  - Instructor: Ash Tilawat
  - Project Intro: Collab Canvas (Figma Clone)
  - Topics: PRD, Task Lists, Architecture Diagrams, Cursor setup
  - Duration: Embedded in Kickoff
  - Key Concepts: Planning workflow, context management, MVP strategy

---

### Monday, Oct 14 - Class 2: AI-First Methodologies - Memory Bank
- **📄 [Class 2_ AI-First Methodologies - Memory Bank - 2025_10_14 09_50 EDT - Notes by Gemini.md](./Class%202_%20AI-First%20Methodologies%20-%20Memory%20Bank%20-%202025_10_14%2009_50%20EDT%20-%20Notes%20by%20Gemini.md)**
  - Instructor: **Zachery Smith (Zac)** - Senior Principal AI Engineer
  - Topics: Memory Bank system, Feature Tasking, Cursor Rules
  - Project Demo: Stock comparison app with Alpha Vantage API
  - Duration: ~2 hours
  - [Recording Link](https://drive.google.com/file/d/1WRI5c6gBi1z0iLtz_ZCg6P4BnC50ShwM/view?usp=drive_web)

**Key Concepts**:
- Memory Bank: Semi-permanent, real-time LLM memory system
- Feature tasking vs comprehensive upfront planning
- Cursor rules installation and management (NPX package)
- Frontend testing challenges with LLMs
- Treating LLM as "fast junior developer"
- Context window management strategies

**Critical Insight**: Memory bank provides long-term memory across chat sessions, saving 10-15 min per new chat.

---

### Tuesday, Oct 15 - Class 3: Tool Calling
- **📄 [Class 3_ Tool Calling - 2025_10_15 10_57 EDT - Notes by Gemini.md](./Class%203_%20Tool%20Calling%20-%202025_10_15%2010_57%20EDT%20-%20Notes%20by%20Gemini.md)**
  - Instructor: **Aaron Gallant** (NOT Brett - Brett handles hiring partnerships)
  - Topics: LLM fundamentals, tool calling architecture, LangChain ecosystem
  - Duration: ~1 hour
  - [Recording Link](https://drive.google.com/file/d/1MTUMCuMpqqmUEkUHWxuI48eVhWtTS-9c/view?usp=drive_web)
  - [Chat Transcript](https://drive.google.com/file/d/1ROivoIU3O9eNjK2j0cv__tlT_S0X6lRf/view?usp=drive_web)

**Key Concepts**:
- LLMs as mathematical functions (not true AI)
- "Confabulation" vs "Hallucination"
- Tool calling for reliability in engineering
- LangChain, LangGraph, LangSmith ecosystem
- When to use tools: math, real-time data, side effects
- Best practices: simple focused tools, limit available tools

**Critical Insight**: Never trust LLM for math or factual data—always use tools.

---

### Wednesday, Oct 16 - Class 4: Agents
- **📄 [Class 4_ Agents - 2025_10_16 10_59 EDT - Notes by Gemini.md](./Class%204_%20Agents%20-%202025_10_16%2010_59%20EDT%20-%20Notes%20by%20Gemini.md)**
  - Instructor: **Aaron Gallant**
  - Topics: Agent architecture, React framework, action loops, multi-agent systems
  - Duration: ~1 hour
  - [Recording Link](https://drive.google.com/file/d/12sdohOBbmGUE6TCIDrXwXbvz7CgYn0E0/view?usp=drive_web)

**Key Concepts**:
- Agents use LLMs to select sequence of actions
- React framework: Reasoning + Acting
- Action loop and recursion limits
- Model selection: use least compute necessary
- Latency challenges in user-facing applications
- Multi-agent systems and specialization

**Critical Insight**: Agents add complexity—don't overcomplicate solutions unnecessarily.

---

## 🏢 Office Hours & Supplemental Sessions

### Frontend Office Hours with Zac
- **📄 [Frontend Office Hours w_ Zac - 2025_10_13 19_29 EDT - Notes by Gemini.md](./Frontend%20Office%20Hours%20w_%20Zac%20-%202025_10_13%2019_29%20EDT%20-%20Notes%20by%20Gemini.md)**
  - Date: Sunday, Oct 13 (Evening)
  - Instructor: Zachery Smith
  - Topics: React frameworks, state management, tool recommendations
  - Duration: ~1 hour
  - [Recording Link](https://drive.google.com/file/d/11UYs3HoiyVpCUb8PfONuCQNTEKdSPJpZ/view?usp=drive_web)

**Key Topics**:
- React vs Next.js recommendations
- useState vs useContext for state management
- Vite over Create React App
- Firebase for backend services
- Cursor model selection (auto, Claude, Gemini)
- Tool recommendations: Linear, Responsively
- Critiques: GPT, Claude Opus, Vercel, Next.js

**Zac's Background**: 40+ years coding (since 1983), double master's + PhD, prefers backend but full-stack with AI.

---

### Office Hours with Ash (Oct 13)
- **📄 [Office Hours w_ Ash - 2025_10_13 18_22 EDT - Notes by Gemini.md](./Office%20Hours%20w_%20Ash%20-%202025_10_13%2018_22%20EDT%20-%20Notes%20by%20Gemini.md)**
  - Date: Sunday, Oct 13 (Afternoon)
  - Instructor: Ash Tilawat
  - Topics: Technical decisions, task lists, debugging strategies
  - Duration: ~1 hour
  - [Recording Link](https://drive.google.com/file/d/1yr5CQ_C9ZWwKPvZOTfqFRoVa2nU22bI1/view?usp=drive_web)

**Key Questions Addressed**:
- PostgreSQL vs Firestore (both acceptable)
- Task list effectiveness (need prescriptive detail)
- Context window management
- Firebase production issues
- Multiplayer cursor synchronization
- Testing strategy (focus on integration tests)
- Managing code quality and "slop"

---

### Office Hours with Ash (Oct 14)
- **📄 [Office Hours w_ Ash - 2025_10_14 16_15 EDT - Notes by Gemini.md](./Office%20Hours%20w_%20Ash%20-%202025_10_14%2016_15%20EDT%20-%20Notes%20by%20Gemini.md)**
  - Date: Monday, Oct 14 (Afternoon)
  - Instructor: Ash Tilawat
  - Topics: Submission requirements, AI development log, cleanup strategies
  - Duration: ~1 hour
  - [Recording Link](https://drive.google.com/file/d/11g2o0XQx109buHV_CkvMG0M2rDd2VsrP/view?usp=drive_web)

**Key Topics**:
- Mandatory submission requirements (GitHub, video, deployed link, AI dev log)
- AI development log content and purpose
- Video should demonstrate MVP features working
- Importance of high-quality prompts
- Scheduled cleanup sessions throughout week
- Leveraging AI for slop detection (Gemini 2.5)
- **Critical**: Submit something by deadline to avoid program removal

---

## 🎯 Key Instructors & Roles

### Program Leadership
- **Austen Allred** - Founder, Gauntlet AI
- **Ash Tilawat** - Program Director, Primary Instructor
- **Brett** - Hiring Partnerships (brett@gauntlethq.com)

### Technical Instructors
- **Zachery Smith (Zac)** - Senior Principal AI Engineer
  - 40+ years experience, PhD in software/cybersecurity
  - Teaches: Memory Bank, AI-First Methodologies, Frontend

- **Aaron Gallant** - ML/AI Expert
  - Teaches: Tool Calling, Agents, Mathematical intuition behind LLMs

- **Tom Tarpy** - DevOps Specialist
  - Available for deployment issues

---

## 📖 Comprehensive Learning Guide

### 📚 [LEARNING_GUIDE_Philosophy_and_Technical_Deep_Dive.md](./LEARNING_GUIDE_Philosophy_and_Technical_Deep_Dive.md)

**This is your main study document.** It synthesizes all class materials into a progressive learning journey.

**Contents**:

#### Part 1: The Philosophical Foundation (30 min read)
- Why Gauntlet AI exists
- The force multiplier concept
- The uncomfortable truth about manual coding
- Understanding the crossover point

#### Part 2: The Paradigm Shift (20 min read)
- From coder to navigator
- Skills that matter now vs before
- The "everything engineer" philosophy
- Real examples of old way vs new way

#### Part 3: AI-First Methodologies - Deep Dive (45 min read)
- Complete Memory Bank system explanation
- Memory Bank architecture and files
- Setup and initialization
- Team collaboration strategies
- Zac's Feature Tasking methodology

#### Part 4: Tool Calling - Technical Deep Dive (40 min read)
- LLM fundamentals (how they actually work)
- Why LLMs confabulate (not hallucinate)
- Tool calling architecture step-by-step
- LangChain ecosystem detailed explanation
- Best practices with examples
- Practical implementation walkthrough

#### Part 5: Memory Bank System - Advanced Technique (25 min read)
- Stock app demo breakdown
- Feature tasking vs comprehensive planning
- Cursor rules installation and management
- Frontend testing challenges
- Context window management deep dive

#### Part 6: Practical Application & Synthesis (30 min read)
- Complete workflow: Todo app example
- Phase-by-phase implementation guide
- Time comparison: Traditional vs AI-First
- Learning curve week-by-week
- Skills for success

**Total reading time**: ~3 hours for deep understanding

---

## 🎓 Learning Strategy Recommendations

### For Quick Reference (10 minutes)
1. Read: [Cohort 3 Kickoff - Program Overview.md](./Cohort%203%20Kickoff%20-%20Program%20Overview.md)
2. Focus on: Deadlines, submission requirements, logistics

### For Technical Implementation (1 hour)
1. Read: [Class 1 - AI-First Development Introduction.md](./Class%201%20-%20AI-First%20Development%20Introduction.md)
2. Follow: PRD → Tasks → Architecture workflow
3. Practice: Set up Cursor environment

### For Deep Understanding (3+ hours)
1. Read: [LEARNING_GUIDE_Philosophy_and_Technical_Deep_Dive.md](./LEARNING_GUIDE_Philosophy_and_Technical_Deep_Dive.md)
2. Take breaks between sections
3. Practice concepts as you learn them
4. Re-read sections that don't click immediately

### For Specific Topics (30 minutes each)
- **Memory Bank**: Class 2 notes + Learning Guide Part 3 & 5
- **Tool Calling**: Class 3 notes + Learning Guide Part 4
- **Agents**: Class 4 notes
- **Frontend**: Frontend Office Hours with Zac notes

---

## 🔗 Quick Links

### Recordings
- [Cohort 3 Kickoff Recording](https://drive.google.com/file/d/1eS4Id9DernazMZCVMt2xl28Uu7lGBkKo/view?usp=drive_web)
- [Class 2 (Memory Bank) Recording](https://drive.google.com/file/d/1WRI5c6gBi1z0iLtz_ZCg6P4BnC50ShwM/view?usp=drive_web)
- [Class 3 (Tool Calling) Recording](https://drive.google.com/file/d/1MTUMCuMpqqmUEkUHWxuI48eVhWtTS-9c/view?usp=drive_web)
- [Class 4 (Agents) Recording](https://drive.google.com/file/d/12sdohOBbmGUE6TCIDrXwXbvz7CgYn0E0/view?usp=drive_web)

### Slack Channels
- **#cohort-3-only**: Official announcements
- **#help**: Technical questions
- **#recordings**: All class recordings and notes
- **#ai-first-methodologies**: Share workflows
- **#social**: Informal discussion

### Important Contacts
- **Ash Tilawat**: ash@gauntlethq.com (Program questions)
- **Brett**: brett@gauntlethq.com (Hiring partnerships)
- **Tom Tarpy**: DevOps specialist (Deployment issues)

---

## 💡 Key Takeaways from Week 1

### Philosophy
1. AI enables 20-30x productivity multiplier
2. Your role shifted from coder to architect/navigator
3. First few weeks: 100% AI-generated code (no manual coding)
4. Crossover point typically happens Week 2-3

### Technical
1. **Three-step planning**: PRD → Tasks → Architecture
2. **Memory Bank**: Long-term memory for LLMs across chats
3. **Tool Calling**: Make LLMs reliable for math, data, side effects
4. **Agents**: Use LLMs to select sequence of actions (with caution)

### Practical
1. Plan outside Cursor (save tokens), code inside Cursor
2. Treat AI as fast junior developer
3. Review all AI output—you're the senior engineer
4. Deploy early and often
5. Scheduled cleanup sessions prevent code bloat

### Success Metrics
- Can you generate a quality PRD in 30-45 min?
- Do you understand memory bank setup and usage?
- Can you explain when to use tool calling?
- Are you trusting AI more and manually fixing less?

---

## 📝 Notes on Document Organization

**Why these documents exist:**
- Original recording notes were auto-generated by Gemini (Google Meet AI)
- Reorganized for clarity and learning efficiency
- Separated program logistics from technical teaching
- Created comprehensive learning guide synthesizing all materials

**Document types:**
- `Class X - [Topic].md`: Class-specific content
- `Office Hours w_ [Instructor].md`: Q&A sessions
- `Cohort 3 Kickoff - Program Overview.md`: Logistics reference
- `LEARNING_GUIDE_Philosophy_and_Technical_Deep_Dive.md`: Teaching document
- `README_Class_Materials.md` (this file): Navigation and index

---

*Keep building. Stay curious. Trust the process.*

*The crossover point is coming. 🚀*

