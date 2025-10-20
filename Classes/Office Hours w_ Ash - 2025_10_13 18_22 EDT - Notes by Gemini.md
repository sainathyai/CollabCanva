Oct 13, 2025

## Office Hours w/ Ash

Invited [Ash Tilawat](mailto:ash@gauntlethq.com)

Attachments [Office Hours w/ Ash](https://www.google.com/calendar/event?eid=MmdwOW4xYThmYms3aDlpNXZmY2FsdThzMzIgYXNoQGdhdW50bGV0aHEuY29t) 

Meeting records [Recording](https://drive.google.com/file/d/1yr5CQ_C9ZWwKPvZOTfqFRoVa2nU22bI1/view?usp=drive_web) 

### Summary

Ash Tilawat initiated the meeting by discussing the collaboration policy, emphasizing helping with methodology but prohibiting code sharing. They addressed several technical queries from participants, including Johnathan Skeete's choice of PostgreSQL over Firestore, Jared's questions on task list effectiveness and mermaid diagrams, Nick Blaskovich's concerns about context window management and updating task lists, Mike Tikh's inquiry about architecture diagrams, Isaac Jaramillo's Firebase production issues, Logan May's questions on multiplayer cursor synchronization and canvas interaction, and Amaan Sayed's queries on testing, reducing "slop" in PRDs and code, and managing deadlines. Reena Puthota asked about managing context across new chat windows and performance targets, Davi Caetano shared their first-time Cursor experience, and Thomas Bauer inquired about grading and MVP criteria. Key talking points included the importance of prescriptive prompts for AI interaction, the dynamic management of Cursor's context window, and strategies for effective AI-driven development.

### Details

* **Meeting Introduction and Expectations** Ash Tilawat initiated the meeting by allowing a five-minute grace period for attendees to join. Sainatha Reddy Yatham inquired about the video requirement and dress code, to which Ash Tilawat responded that video is optional unless interacting with a hiring partner, emphasizing professionalism in such scenarios.

* **Initial Progress and Tool Usage** Kiran Rushton gauged the overall sentiment of progress, asking participants to rate their experience on a scale of 1 to 10\. Francisco dG shared their positive experience, noting they were "having a blast" and utilized AI, specifically Copilot PPT5, to navigate issues with the cursor tool. Kiran Rushton also mentioned positive experiences with Codeex within Cursor.

* **Collaboration Policy** Ash Tilawat clarified the collaboration policy, stating that participants are encouraged to help each other with methodology and approach, including sharing prompts, but explicitly prohibited sharing actual code, files, or documents. They stressed that code repetition in repositories is easily detectable.

* **Technical Decisions and Alternatives (Johnathan Skeete)** Johnathan Skeete sought advice on their technical decisions, questioning if they were overcomplicating things by opting for PostgreSQL over Firebase's Firestore due to familiarity and perceived limitations. Ash Tilawat confirmed that using PostgreSQL and Redis is acceptable if they are comfortable with them, noting that some AI statements about Firestore are incorrect and Firebase is generally performant.

* **Package Managers and State Management** Ash Tilawat clarified a misunderstanding regarding \`npm\` and \`nvm\`, explaining that \`npm\` is a package manager while \`nvm\` manages Node versions. They also informed Johnathan Skeete that the choice of front-end state management tool, such as Zustand or Kia, is flexible as AI can handle various options.

* **Code Analysis and Manual Edits** Johnathan Skeete asked about the expectation of manual code edits, particularly for typos, given the goal of not writing code. Ash Tilawat clarified that the process involves directing AI to fix identified errors in code rather than manual editing, but manual edits are permissible for documents like the PRD.

* **Task List and Mermaid Diagrams** Jared inquired about the effectiveness of their task list and the role of mermaid diagrams, noting that their task list felt too general. Ash Tilawat advised that task lists need to be highly prescriptive and detailed, suggesting the addition of external documents or architecture diagrams to provide more context to the AI.

* **Optimizing AI Interaction** Ash Tilawat demonstrated how to instruct AI to review documents and confirm steps before proceeding, emphasizing that users need to be prescriptive in their prompts. They highlighted that improving prompts and providing better context through detailed documents and sources are key to effective AI interaction.

* **Context Window Management** Jared questioned the fluctuating context percentage in Cursor. Ash Tilawat explained that Cursor manages context dynamically, cleaning it up at checkpoints and adjusting based on added or removed chat history and documents. Nick Blaskovich raised concerns about context size impacting performance in larger projects. Ash Tilawat clarified that the percentage reflects the interaction window rather than the entire codebase, and advised opening a new chat window if the context reaches 80-90%.

* **Updating Task Lists Post-Development** Nick Blaskovich asked if there was an easy way to retroactively update the task list with changes made during code development. Ash Tilawat suggested either setting up a Cursor rule to automatically check off completed tasks or manually prompting the AI to do so after a task is finished. For retroactive updates after an error, they advised reverting to a previous checkpoint, fixing the task list, and then continuing.

* **Purpose of Architecture Diagrams** Mike Tikh sought clarification on the usage of architecture diagrams. Ash Tilawat explained that while they may be used less in initial greenfielding, they become crucial for complex, multi-service codebases, serving as a roadmap for AI to navigate different directories and microservices.

* **Firebase Production Issues** Isaac Jaramillo reported issues with Firebase persistence in production despite local functionality, receiving a 400 error. Ash Tilawat suggested checking Firebase security rules and requested to see the logging for the component making the call. After reviewing the code and environment, Ash Tilawat suspected a Vercel configuration issue with Vite and provided a \`vercel.json\` snippet to resolve it.

* **Multiplayer Cursor Synchronization** Logan May inquired about the expected behavior of multiplayer cursor synchronization, specifically regarding visibility. Ash Tilawat confirmed that cursors should be visible if they are within the user's current zoom or window, similar to Figma, and that a list of online users is also desirable.

* **Canvas Interaction and Performance** Logan May also asked about the interaction with shapes on the canvas, to which Ash Tilawat suggested starting with a simpler approach where any logged-in user can move any block, deferring complex permissioning for later. Regarding choppy refresh rates in multi-window local development, Ash Tilawat recommended deploying the application and testing on separate laptops, believing it to be a local development environment issue.

* **Unit and Integration Testing** Amaan Sayed asked about the effective use of unit and integration testing. Ash Tilawat recommended focusing on integration tests for key features to ensure data sync and proper database storage, rather than UI tests.

* **Reducing Slop in PRDs and Code** Amaan Sayed sought tips for reducing unnecessary wording in PRDs and code. Ash Tilawat suggested providing a well-structured example PRD for document generation to guide AI. For code, they advised reviewing files after generation for over-complexity, dead code, or simplification opportunities.

* **Managing Deadlines and Code Quality** Amaan Sayed questioned how to balance speed for MVP deadlines with code quality and reducing slop. Ash Tilawat recommended focusing on reaching MVP with all features working first, and then dedicating time to polishing the code, removing slop, and ensuring alignment. They emphasized the importance of understanding the code generated by AI to avoid unmanageable slop.

* **Chat and Context Management** Reena Puthota asked about managing context across new chat windows and agents. Ash Tilawat explained that new chats start with an empty context window and require explicitly linking to past chats or manually summarizing previous conversations and attaching relevant documents. They also confirmed that background agents have their own finite context windows tied to the LLM being used.

* **First-Time Cursor Experience and User Session Management** Davi Caetano shared their positive first experience with Cursor and asked about the behavior of user cursors persisting after closing windows. Ash Tilawat deemed the proposed behavior of eliminating user presence after window closure or two minutes of inactivity acceptable for the MVP, requesting a short video for direct feedback.

* **Grading and MVP Criteria** Thomas Bauer inquired about the grading process and expectations for MVP. Ash Tilawat stated that for MVP, the focus is solely on the existence and functionality of features. They mentioned that a detailed rubric covering performance, scalability, and other criteria would be provided after the MVP submission for subsequent grading.

* **AI Usage in Development** Ash Tilawat clarified the appropriate use of AI models like Claude during development. They advised that it is acceptable to use AI for planning and research, but not for the coding stage to avoid context confusion. Ash Tilawat also noted that while planning and research outside of Cursor save tokens, asking one or two clarifying questions within Cursor is acceptable if needed to understand dependencies or catch up on the codebase.

* **Task List and PRD Synchronization** Ash Tilawat explained that the task list does not always need to be perfectly synchronized with the PRD (Product Requirements Document). They stated that minor updates to tasks do not necessitate immediate PRD revisions, as the PRD serves as a high-level product document. Only significant updates, such as four or five tasks being updated, would warrant an update to the PRD.

* **Performance Targets for Objects** Reena Puthota sought clarification on performance targets regarding object visibility. Ash Tilawat confirmed that the target of 500+ simple objects without FPS drops implies all objects would be visible simultaneously, even with multiple concurrent users actively moving them.

* **Upcoming Front-End Workshop** Ash Tilawat announced an upcoming workshop focused on front-end React and JavaScript. They indicated that Zach would lead this crash course for individuals unfamiliar with front-end technologies, state management, browser cache, and JavaScript web-based UI.

### Suggested next steps

- [ ] Amaan Sayed will aim to reach MVP by midday tomorrow and then spend the rest of the day removing slop and cleaning up files.  
- [ ] Isaac Jaramillo will send Ash Tilawat a screenshot of the error to resolve the Firebase issue, and add the provided versell.json file to the root directory and redeploy the application.  
- [ ] Amaan Sayed will focus on integration tests for key features to ensure sync and proper database value storage.  
- [ ] Amaan Sayed will give a self-generated PRD version as context when creating new PRDs to ensure consistent structure, and review each code file for over-complexity, dead code, or simplification after thinking it's ready for review.  
- [ ] Jared will go back to his task list and examine if it was detailed enough or if he could be more prescriptive on what the AI should be doing.  
- [ ] Nick Blaskovich will make a cursor rule that basically says every time you complete a task in the task list, you check it off.

*You should review Gemini's notes to make sure they're accurate. [Get tips and learn how Gemini takes notes](https://support.google.com/meet/answer/14754931)*

*Please provide feedback about using Gemini to take notes in a [short survey.](https://google.qualtrics.com/jfe/form/SV_9vK3UZEaIQKKE7A?confid=5ZvFoQO3pQr95Ei-jpyRDxIVOAIIigIgABgBCA&detailid=unspecified)*