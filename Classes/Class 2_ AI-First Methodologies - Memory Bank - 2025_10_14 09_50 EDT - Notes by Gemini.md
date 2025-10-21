Oct 14, 2025

## Class 2: AI-First Methodologies \- Memory Bank

Invited [zac@gauntlethq.com](mailto:zac@gauntlethq.com) [Ash Tilawat](mailto:ash@gauntlethq.com) [zac@codeshock.dev](mailto:zac@codeshock.dev)

Attachments [Class 2: AI-First Methodologies - Memory Bank](https://www.google.com/calendar/event?eid=MDhlanVxZXM5OGI1bDJiY2wxdXFxZjBwZmEgYXNoQGdhdW50bGV0aHEuY29t) 

Meeting records [Recording](https://drive.google.com/file/d/1WRI5c6gBi1z0iLtz_ZCg6P4BnC50ShwM/view?usp=drive_web) 

### Summary

Zachery Smith, Grateful Gabe, 燕妍, Mike Tikh, Ryan Zernach, Max Efremov, Jared, Reuben, Johnathan Skeete, John Crimmins, Matt Hulme, Harrison Glenn, Atharva Sardar, Noah Rosenfield, Tyler Pohn, Francisco dG, Nick Blaskovich, Yan, Tanner Eischen, Kiran Rushton, Yibin Long, and Benjamin Cohen discussed setting up a stock application project using the Alpha Vantage API, creating a Project Research Document (PRD), and implementing a "memory bank" for LLM long-term memory. They also addressed screen resolution issues, LLM consistency, frontend testing challenges, and debugging strategies, while also discussing the evolution of the memory bank and debugging graph issues.

### Details

* **Setting Up the Project and Initial Requirements** Zachery Smith initiated a new project, demonstrating a methodology for starting a simple stock application using the Alpha Vantage API. They outlined the importance of pre-search for understanding possibilities and selecting dependencies, though they skipped this step for the demonstration. The plan included building a React app to compare two stocks based on Alpha Vantage documentation, with a modern layout using standard React components.

* **Project Research Document (PRD) Creation** Zachery Smith explained the creation of a minimal Project Research Document (PRD), emphasizing that it serves as a high-level, semi-structured guide. They recommended spending 20-30 minutes on the PRD to outline the project based on pre-search findings, including the chosen technology stack like React and JavaScript.

* **Screen Resolution and Visibility Issues** Grateful Gabe and 燕妍 raised concerns about the screen resolution, making it difficult to read the terminal and website content. Mike Tikh further clarified that the video resolution was blurry even on an ultra-wide screen. Zachery Smith acknowledged the issue and planned to adjust the screen settings and move to a cursor window to improve visibility.

* **Introduction to Memory Bank** Zachery Smith introduced the concept of a "memory bank," which is a semi-permanent, real-time update of the application's state, designed to provide the LLM with long-term memory. They explained that the memory bank is created through a set of rules, which can be added to user rules for global instantiation or manually initiated. The memory bank automatically updates markdown files based on a Mermaid diagram, and the LLM decides when to trigger updates based on major changes.

* **Memory Bank Functionality and Benefits** The memory bank generates files such as "front end," "project brief," "active context," and "progress," providing the LLM with a high-level overview of the project and its current status. Zachery Smith highlighted that the memory bank helps maintain context across new chat threads by summarizing relevant information, reducing the need for manual context provision and optimizing context window usage.

* **Clarifying Memory Bank vs. Other Files** Ryan Zernach inquired if the memory bank redirects the energy of regularly generated markdown files, to which Zachery Smith responded that the memory bank is a structured methodology controlled by rules, distinct from newer, experimental build notes. Max Efremov and Jared sought further clarification on the differences between cursor rules, root MD files, and memory bank files, with Zachery Smith explaining that rules are specific directives, while the memory bank is a real-time context storage.

* **Addressing LLM Consistency and Rules** Reuben brought up issues with LLM consistency, specifically regarding outdated information about Tailwind. Zachery Smith suggested creating a specific cursor rule to direct the LLM to refer to updated documentation for such issues. 燕妍 later asked about creating a rule to ensure the LLM consistently follows desired steps, and Zachery Smith explained that while rules are detailed, the initial acknowledgment and indexing process for a new project can be non-deterministic and may require prompting.

* **Comparison of Methodologies** Johnathan Skeete asked about the difference between Zachery Smith's methodology and Ash's, particularly regarding generating MD files. Zachery Smith clarified that their approach automates the creation of task lists and other files through rules, rather than manual generation. John Crimmins further explored the high-level planning approach, where Zachery Smith prefers to define features one at a time using feature-based tasks rather than planning all granular details upfront.

* **Feature Tasking and Rules Installation** Zachery Smith introduced "feature tasking," which involves creating a PRD focused on a single feature to maintain scope and direct the LLM effectively. They then demonstrated installing additional rules using an MPX package, including "create feature PRD," "generate tasks," "process task list," a security scanner, and "Yoda quotes" for visual confirmation of rule engagement.

* **LLM Engagement with Rules** Zachery Smith illustrated how the LLM sometimes needs to be explicitly prompted to acknowledge newly installed rules, even if they are indexed. The "Yoda quotes" rule serves as a visual cue to confirm that the LLM is actively engaging with the rules. Zachery Smith noted that this acknowledgment process is often necessary at the beginning of a new project and may occasionally require reminders in subsequent chats.

* **Addressing Determinism in Rule Control** Zachery Smith explains that while many attempt to solve the issue of deterministic rule control in systems like Wind surf, a definitive method doesn't yet exist; users must experiment to find what works best, as the effectiveness of rule control changes with each new software version.

* **Importance of Feature Task PRD** Zachery Smith highlights the critical role of a well-defined Feature Task PRD (Product Requirements Document) in the development process, emphasizing that a poorly written PRD will lead to unsatisfactory results. He demonstrates by quickly answering clarifying questions, indicating that normally more time would be spent on this crucial step.

* **Key Decisions for Stock Comparison PRD** Zachery Smith outlines specific decisions for the stock comparison PRD, including the ability to analyze and compare two stocks, displaying data using drop-down tables, showing comparisons side-by-side on the same input stock, and allowing users to select a date range. He also stresses the importance of adhering to rate limits and keeping features minimal and specific.

* **Task Generation and Workflow** Following the PRD completion, Zachery Smith initiates the generation of a task list, indicating that the system will produce high-level tasks and subtasks for development areas like API integration, state management, charts, and UI. He notes that users can customize the order of these tasks in the rules and advises including visual cues to track progress.

* **Reviewing and Adjusting Generated Tasks** Zachery Smith reviews the generated task list, emphasizing the importance of developers ensuring the task order aligns with their preferred workflow. He advises adjusting the system rules or deleting and re-indexing files if the generated tasks are significantly off-base, particularly due to poor indexing.

* **Treating LLM as a Junior Developer** Zachery Smith suggests treating the LLM as a fast-moving junior developer, advocating for clear, concise, and unique tasks to avoid confusion. He explains that breaking down tasks ensures that the LLM can process and acknowledge each step, which is beneficial for continuity, especially in side projects or when switching to new chats due to the LLM's memory management.

* **Commit Practices and Rollback Capability** Zachery Smith discusses commit practices, stating a personal preference for committing when a task is fully completed rather than after every change. He also mentions the availability of a rollback feature within the cursor system, cautioning against relying on it as an ultimate solution and recommending adherence to standard best practices.

* **Developer's Role in LLM-driven Development** Zachery Smith explains that while the LLM follows the path provided, developers must apply common sense and expertise, particularly in areas like environment variables and API keys, which the LLM may not inherently manage. He also advises continuous server monitoring and testing during development, even when visual components are not yet available.

* **Challenges with Frontend Unit Testing by LLMs** Zachery Smith highlights difficulties LLMs face in writing effective frontend unit tests, particularly with frameworks like Vit. He explains that LLMs often produce tests that require significant manual fixing, suggesting that visual and manual testing are often more effective for frontend development.

* **Discussion on Frontend Testing Frameworks** Johnathan Skeete inquires about the specific testing frameworks used, to which Zachery Smith clarifies that Vit, a React framework, has its own built-in testing suite which provides the best results for him. Matt Hulme adds that for end-to-end tests, Playright MCP and Chrome Dev Tools MCP are effective for LLMs as they allow browser control and screenshots.

* **Context Window Management and Summarization** Harrison Glenn raises a concern about fluctuating context window percentages. Zachery Smith attributes this to the cursor's internal processes, including summarization, which allows the system to continue working beyond previous capacity limits, effectively creating a new chat summary without explicit user action.

* **Starting New Chats and Memory Bank Usage** Zachery Smith discusses strategies for starting new chats, particularly when encountering complex issues or stuck points, and recommends using the memory bank first for existing projects to leverage its productivity benefits. He shares a successful instance where the LLM efficiently adapted to a large legacy codebase with extensive files and commits.

* **Managing Multiple Subtasks and Context Window Drops** Atharva Sardar asks about the downside of giving the LLM multiple subtasks at once, to which Zachery Smith advises against it, as it tends to increase the LLM's "creativity" and lead to undesirable results. He also clarifies that sudden drops in context percentage often indicate the system performing a summary and moving to a new internal chat.

* **Visual Cues for Rule Adherence** Noah Rosenfield questions whether the "Yoda rule" guarantees adherence to all rules. Zachery Smith clarifies that the Yoda prompt is a secondary visual cue, and he primarily relies on pattern recognition of the LLM's response structure to determine if the rules are being followed correctly.

* **Maintaining Structure in Post-MVP Development** Tyler Pohn asks about maintaining structure during post-MVP feature development and patching. Zachery Smith advises moving to a new chat for significant issues but attempting to keep smaller UI fixes within the same context window to avoid retraining the LLM. He also notes that the optimal approach often depends on experimentation and that the methodology changes weekly.

* **Terminal Issues in Cursor** Zachery Smith mentions that the terminal within the cursor often breaks, becoming unresponsive, and the only solution he has found is to close and reopen the cursor application. He notes that while the terminal can be popped out, it doesn't maintain context as well as the integrated terminal.

* **Evaluating Rule Adherence and Pattern Recognition** Francisco dG asks how often the LLM follows only some rules. Zachery Smith explains that he relies on pattern recognition of the response structure and the presence of the Yoda rule as visual cues for adherence. He advises against excessive rules, as it can waste context. He also cautions against hitting the stop button unnecessarily, as it can disrupt context.

* **Troubleshooting and Common Development Issues** Zachery Smith guides the discussion toward common development issues encountered during the LLM's process, such as missing API keys, which prevent real data from being retrieved. He emphasizes the need for developers to intervene and ask the LLM to "show its work" or ensure necessary packages are installed.

* **Inconsistency in LLM Behavior** Zachery Smith highlights the non-deterministic nature of LLMs, noting that the system's "auto LLM selector" can use different LLMs, leading to inconsistencies. He provides an example where the LLM incorrectly suggests installing Babel when Vit is being used, emphasizing the importance of developers catching such errors.

* **Managing Unit Tests in Frontend Development** Zachery Smith explains his approach to unit tests in frontend development, where he defers working on them until later stages because LLMs often generate problematic tests, especially for responsive UIs. He recommends running basic tests but advises against deep dives into fixing every test immediately, as it can be a significant time sink.

* **Context Window Management and API Calls** Yan asks about the time to reach an API call within the demonstration. Zachery Smith estimates it will take approximately 10-15 minutes, noting that summarization processes can slow down progress. He also explains that if the context window becomes full, it might be necessary to switch to a new chat window, as the current one may become unresponsive.

* **Memory Bank Updates and Task Complexity** Tanner Eischen inquires about memory bank updates. Zachery Smith explains that the memory bank typically updates at the start and end of processes and that for initial setups, frequent updates are not always necessary. Kiran Rushton asks if the memory bank can update at predefined progress points, to which Zachery Smith confirms this is possible, especially with more complex codebases.

* **Continuing Development after Context Breaks** Zachery Smith demonstrates how to continue development after a context break, explaining that the LLM can usually pick up where it left off by being told to check the last task. He also advises that spelling errors are not critical due to semantic processing.

* **Sniff Testing and Iterative Development** Kiran Rushton expresses comfort with their "sniff testing" approach for MVPs. Zachery Smith validates this, stating that for initial development, less stringent testing is acceptable, but as code complexity increases, testing should become more frequent and granular.

* **One-shot Development and Persistent Knowledge Bases** Zachery Smith explained that one-shot development lacks a persistent knowledge base for steps and indexing, which can be a limitation. Zachery Smith highlighted that while the initial setup should not consume excessive time, efficiency improves with practice, allowing individuals to find their optimal pace. Kiran Rushton inquired whether practical testing is preferable to theoretical algorithmic analysis for meeting performance guidelines, particularly for an MVP.

* **MVP Development and Interview Process** Zachery Smith advised that for an MVP, it is beneficial to continually add features and explore next steps, emphasizing that comfort can hinder progress. Zachery Smith stressed that the program is a rigorous 10-week, 1000-hour interview, where continuous learning, tool proficiency, and collaboration with peers are crucial for success. Zachery Smith also warned against "cheating the system" by using external codebases, as tools are in place to detect such instances, underscoring that the primary concern is the quality of the future employee.

* **Figma Clone Project and Learning Objectives** Francisco dG inquired about the rationale behind choosing Figma as a cloning project. Zachery Smith clarified that the choice of clone projects, which have included TikTok, Snapchat, and others, is arbitrary and based on finding challenging and engaging tasks, not on specific tools being the best. Zachery Smith emphasized that the focus is on ensuring participants gain extensive experience with various tools and technologies, as modern engineers need to be versatile rather than single-discipline specialists.

* **Debugging and Syncing Issues** Francisco dG mentioned experiencing syncing issues with cursors between logged-on users while working on their project. Kiran Rushton offered to help Francisco dG resolve the cursor syncing issue, indicating that they had found a solution. Francisco dG noted that their project's syncing issues began after they passed the MVP stage and were trying to make the application production-ready, suggesting that changes made during this phase inadvertently broke the cursor positioning synchronization.

* **Using a Chromebook for Development** Francisco dG shared that they are coding on a Chromebook, a decision made out of necessity after selling their beefier laptop for their dog's surgery. Zachery Smith acknowledged that new Chromebooks are becoming more impressive for development, noting that they now support VS Code. Francisco dG expressed confidence in their ability to complete the development tasks on the Chromebook, primarily relying on its Linux capabilities.

* **Memory Banks and Cloud Code Compatibility** Reuben asked about the general applicability of memory banks and the development process in other cloud code environments beyond Cursor. Zachery Smith explained that while Cloud Code's unit process works, it doesn't achieve the same quality as Cursor, though it is useful for CSS. Zachery Smith noted that Windsurf's rules are similar and can be imported from Cursor, but ultimately, compatibility depends on the specific tool being used.

* **Marin Software Acquisition by Gauntlet AI** Grateful Gabe inquired about Gauntlet AI's acquisition of Marin Software, an ad tech company. Zachery Smith explained that Gauntlet AI plans to take Marin Software's infrastructure, which was originally a publicly traded company that failed due to Google's tools and high overhead, and rebuild it. Benjamin Cohen expressed skepticism about reviving a legacy monolith with LLMs, but Zachery Smith countered that LLMs have significantly improved in handling such projects, especially with memory banks.

* **Legacy Code Modernization with LLMs** Zachery Smith shared personal experience contracting as a Cobalt engineer for Texaco, using LLM-driven approaches to update a 500-million-line legacy Cobalt code. Zachery Smith also cited an example from a previous cohort where a student modernized a Fortran repo from before their birth to 2025, demonstrating the LLM's capability to update and build legacy software. Benjamin Cohen expressed interest in the potential of LLMs to deeply learn and manage old, complex codebases that human engineers can no longer fully comprehend.

* **Managing Code Bloat and LLM Guidance** Kiran Rushton sought clarity on identifying and avoiding code bloat, particularly in the context of MVP deadlines and the integration of AI features. Zachery Smith explained that bloat is often found in large, multi-billion dollar company software and that the focus is on how participants direct the LLM, which is considered an art. Zachery Smith mentioned that tools are being developed to surface such issues and that participants will be part of a test group, emphasizing that doing one's best is generally sufficient.

* **Debugging Strategies and Tool Recommendations** Zachery Smith demonstrated various debugging methods, including copying errors directly from the browser console and using screenshot tools like Awesome Screenshot. Zachery Smith also noted that LLMs might create fake versions of files for API keys and documentation files, which can be organized into a \`docs\` folder to avoid being flagged as bloat. Zachery Smith advised manually checking for API key leaks, as automatically generated \`.gitignore\` files might not always include them.

* **Troubleshooting and LLM Interaction** Nick Blaskovich expressed relief that the debugging process, which often involves fixing one error only for another to appear, is a common experience. Zachery Smith affirmed that anticipating every error is unnecessary and that simple issues are generally not a major concern. Kiran Rushton confirmed that it is acceptable and even best practice to explain issues to the LLM in simple, layman's terms, such as "nothing happens when I do blank," as this directness is often more effective.

* **Addressing Fake Data and API Integration** Zachery Smith observed that the application was returning "fake" stock data, indicating a lack of real API integration. Zachery Smith emphasized the importance of explicitly instructing the LLM to use real data and avoid mocking, particularly with backend systems like Firebase, due to the complexity of mocking data. After being prompted to integrate real API calls, the application successfully fetched accurate stock data, demonstrating the LLM's ability to connect tools to functionality.

* **Data Model Definition and AI's Role** Kiran Rushton questioned the necessity of manually defining a data model versus letting the AI pick one. Zachery Smith stated that the AI often creates better data models than most individuals, unless one is a dedicated data professional or deeply familiar with specific databases like Firebase. Zachery Smith advised reviewing the AI-generated data model, which is typically provided at the beginning of the process, for specific requirements.

* **LLM Challenges with Visual/Layout Issues** Zachery Smith highlighted a peculiar issue where the LLM consistently struggled to make the web page go full screen, despite repeated attempts and significant token usage. Francisco dG and Reuben identified the problem as a CSS issue, with Zachery Smith confirming it was a width problem related to the \`body\` rule or media queries. Zachery Smith noted that this was the first time the LLM successfully resolved the full-screen issue, even after explicit instructions.

* **Debugging Line Graphs and API Calls** The application encountered a handler issue when attempting to display and compare multiple stock graphs, resulting in "Something went wrong" errors. Zachery Smith advised clearing errors and re-running to isolate issues, and encouraged the use of console logs for easier troubleshooting in front-end development. Despite getting some data, the line graph and comparison features were not working, leading Zachery Smith to hypothesize that another API endpoint or data transformation might be needed, reinforcing the need for continuous problem-solving.

* **Memory Bank Management in Team Environments** Noah St. Juliana asked about managing memory banks on a team, particularly regarding divergence and merge conflicts when committing them to Git. Zachery Smith admitted that it's an ongoing challenge without a perfect solution, as differing memory banks lead to significantly different code structures. Zachery Smith mentioned testing methods like initially creating a memory bank and then using a \`.gitignore\`, with active members pushing to a branch to unify conflicts, but acknowledged that the process is not ideal.

* **Committing Dot-Cursor Folder and Rules** Noah St. Juliana also asked if the \`.cursor\` folder, initialized with the \`npx\` script, should be committed to Git. Zachery Smith confirmed that it should be committed because its rules do not change and it helps maintain consistency across the team, saving everyone from having to recreate them. Zachery Smith advised teams to establish their own system for distributing rules to keep everyone on the same page.

* **Memory Bank Evolution** Yibin Long asked about the memory bank's updates, noting that it seemed to be a live document that constantly evolves. Zachery Smith confirmed that it should evolve automatically, though they observed a need to create a cursor rule to dictate more frequent updates. They also mentioned that cursor used to generate rules automatically for the memory bank, but this feature might have changed.

* **Debugging Graph Issues** Zachery Smith initiated a test to observe the memory bank's behavior by attempting to debug non-functional graphs showing no data. They encountered and addressed a \`useState\` error and identified that the system was using a date object instead of a string, which was affecting all graphs. Zachery Smith later switched to a stronger model like Sonnet after realizing the system was stuck and not providing actionable solutions.

* **Actionable Solutions vs. Probable Causes** Zachery Smith expressed a strong preference for actionable results over probable causes when debugging, emphasizing that the system should provide concrete steps rather than speculative explanations. They noted that the prompt seemed to have been modified to encourage more concise and actionable outputs, which they found to be an improvement.

* **Memory Bank Setup for New Projects** Nick Blaskovich inquired about the memory bank setup process, having missed the initial discussion. Zachery Smith demonstrated how to set up a global user rule for the memory bank in the settings, allowing it to be available for any new project. They explained that initiating the memory bank analyzes the codebase and creates the necessary structure and files, which can take longer for larger codebases.

* **Using Cursor Rules Package** Zachery Smith also informed Nick Blaskovich about the Cursor Rules Package, which is available via MPX and contains frequently used rules. They explained that users can install these rules, create their own, or fork the repository to customize them, highlighting the ease of use with a CLI tool.

### Suggested next steps

- [ ] Zachery Smith will post the memory bank and the npm package link in the Slack chat after the meeting.  
- [ ] The group will watch the recording to learn the overall process of the methodology and review the summarized steps for highlights.  
- [ ] Kiran Rushton will talk with Francisco dG after this meeting to help him with his syncing issues.  
- [ ] Francisco dG will proceed through the rest of his tasks after identifying where his syncing issues failed.  
- [ ] Zachery Smith will create a cursor rule that dictates the memory bank is updated every so often.

*You should review Gemini's notes to make sure they're accurate. [Get tips and learn how Gemini takes notes](https://support.google.com/meet/answer/14754931)*

*Please provide feedback about using Gemini to take notes in a [short survey.](https://google.qualtrics.com/jfe/form/SV_9vK3UZEaIQKKE7A?confid=o2IS_A1VTrg2bj3sm1TzDxITOAIIigIgABgBCA&detailid=unspecified)*