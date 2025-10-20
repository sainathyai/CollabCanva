Oct 13, 2025

## Frontend Office Hours w/ Zac

Invited [zac@gauntlethq.com](mailto:zac@gauntlethq.com)

Attachments [Frontend Office Hours w/ Zac](https://www.google.com/calendar/event?eid=Nzk1anR0aWh0NDduOHNpdGU4Y2htYjVyZGIgYXNoQGdhdW50bGV0aHEuY29t) 

Meeting records [Recording](https://drive.google.com/file/d/11UYs3HoiyVpCUb8PfONuCQNTEKdSPJpZ/view?usp=drive_web) 

### Summary

Zachery Smith, the senior principal AI engineer, provided an overview of their background and an AI-first engineering approach, advocating for rapid learning, leveraging AI to overcome deficiencies, and emphasizing the importance of prompt control and navigation skills over traditional coding. They recommended React frameworks for front-end development, discussed state management with \`useState\` and \`useContext\`, and advised on tool selections like Vit over Create React App and Firebase for backend services, while also critiquing GPT, Claude Opus, Versel, and Next.js. Max Efremov was advised to re-prompt AI, and Kiran Rushton was encouraged to embrace daily refactoring of their thought process, while Harrison Glenn reported a website bug that Zachery Smith committed to investigating.

### Details

* **Introduction and Background** Zachery Smith, the senior principal AI engineer, shared their extensive background in computer science, including a double master's degree and a PhD in software and cybersecurity. They started coding in 1983 on a Commodore 64 and have a preference for back-end engineering, although they also have experience in front-end development. Zachery Smith emphasized a shift from single-skill engineering to being an "everything engineer" within the AI-first engineering paradigm.

* **Approach to Engineering and Learning** Zachery Smith explained their preference for breaking things to test limits and find edges. They stated that in the Gauntlet AI program, the focus is on rapid learning and leveraging AI to overcome deficiencies in unfamiliar areas, asserting that engineers can quickly adapt and produce results within days.

* **Camera Policy and Location** Zachery Smith requested participants to keep their cameras on to facilitate interaction and visibility within the group. They mentioned their location in New Mexico and plans to visit Austin, where some participants are located, and shared a recent trip to San Jose for training.

* **Front-end Framework Recommendations** Zachery Smith recommended staying within React frameworks for front-end development due to their ease of understanding, quick compilation, and widespread understanding by LLMs. They also acknowledged Next.js as a common default in many front-end tools but expressed a preference for pure React.

* **State Management in React** Zachery Smith detailed React's state management capabilities, recommending \`useState\` for short-term management and \`useContext\` for app-wide state, noting both are well-understood by LLMs. They advised against overcomplicating state management, suggesting \`useContext\` as a generally easy option for global state.

* **Problem Solving with AI** Zachery Smith advised Max Efremov to re-prompt the AI to recreate canvas functionality entirely rather than debugging in detail, emphasizing the importance of prompt control as a primary AI tool. They likened the AI to a faster junior engineer and encouraged a paradigm shift in thinking, focusing on what outcome is desired rather than how to code it.

* **Paradigm Shift Example** Zachery Smith shared a personal anecdote about using an AI-first approach to process 97 zip files totaling 500GB of data, a task that traditionally took months, by using a Python script with pandas in minutes. This highlighted the need for a mental shift in problem-solving, moving away from traditional methods and leveraging AI to find new, more efficient solutions.

* **Adapting to AI-First Engineering** Zachery Smith advised Kiran Rushton to embrace daily refactoring of their thought process when working with AI, emphasizing that there's no single "best way". They recommended starting with a quick chat with an LLM to determine architecture and next steps, focusing on asking good questions to assimilate information quickly.

* **Choosing a Front-end Compiler and Architecture Setup** Zachery Smith recommended Vit over Create React App for pure React projects due to its faster compilation and better routing. They strongly advised against letting LLMs set up the initial architecture, recommending instead to follow official documentation like Vit's "getting started" guide to avoid issues with outdated LLM training data.

* **Firebase and Development Workflow** Zachery Smith clarified that Firebase is a backend-as-a-service and should be integrated after the front-end is set up. They recommended using LLMs within Cursor to guide the setup of Firebase services like authentication, database, and cloud functions once the basic front-end environment is established. The workflow should involve starting with a clear product assignment, conversing with an LLM, and then building on the fly rather than planning every tool and service upfront.

* **Demonstration of LLM Interaction and Tool Use** Zachery Smith demonstrated how to use an LLM (Claude) to generate recommendations for tools and packages for building a Figma clone. They highlighted the LLM's ability to provide a comprehensive list, including core packages, setup instructions, and even suggestions for state management and UI libraries.

* **Navigating with AI** Zachery Smith stressed that the true skill in AI-first engineering lies in navigating and recognizing good code, not in the initial setup or basic prompting. They compared engineers to "navigators" with a map, guiding the AI rather than being the "white knuckle driver" who physically produces the code.

* **Troubleshooting and Learning from Failure** Zachery Smith acknowledged that encountering issues like race conditions and janky performance, as experienced by Kiran Rushton, is a normal part of the learning process. They emphasized that troubleshooting skills and improvement come primarily from failure, not success, and encouraged breaking things as an acceptable part of the process.

* **Task Management and Trust in AI** Zachery Smith revealed their method for managing tasks, which involves setting up a detailed feature PRD and allowing the system to automatically update and check off items. They expressed caution about over-reliance on AI, particularly concerning "vibe coding," which they believe leads to "garbage" and failed startups.

* **Efficiency Gains with AI** Zachery Smith highlighted the significant increase in productivity with AI, stating that a task that typically takes a sprint can now be completed three to five times a day. They noted that 80% of the work in the Gauntlet program will be done by Wednesday lunchtime, with the rest dedicated to refining and bug fixing.

* **Precision in State Management** Zachery Smith confirmed that precision in state management is crucial, but noted that LLMs often get it right. They suggested adding documentation to the LLM's context within Cursor for unfamiliar or new topics to improve accuracy.

* **LLM Tool Preferences and Responsiveness** Zachery Smith shared their personal preference for Claude, especially for complex CSS and media queries, demonstrating its effectiveness with a new site being built for Gauntlet. They also recommended Responsively, a tool that allows developers to view multiple mobile and screen versions simultaneously, particularly useful for non-front-end engineers.

* **AI Model Selection and Usage** Zachery Smith recommends using Cursor in auto mode for general tasks, switching to Claude for tougher problems, and Gemini for Firebase-related issues due to its integration. He suggests that auto mode is often sufficient and cost-effective, noting that it selects the most available and cost-effective models. Zachery Smith also advises against becoming locked into one model, emphasizing the need to switch based on task requirements and budget.

* **Tool Recommendations for Developers** Zachery Smith highly recommends Linear for task management, praising its integration and ability to keep tasks organized within one application. He also introduces Responsively, a tool for previewing websites across various screen sizes, highlighting its utility for debugging and front-end development. Reena Puthota further clarifies that Responsively is beneficial for building any web-based product, ensuring proper display on different devices.

* **Critique of Specific AI Models and Frameworks** Zachery Smith expresses a dislike for GPT, finding it less effective for software development compared to other models. He also criticizes Claude Opus, stating that it is not worth the cost for the minimal improvements it offers over Sonnet and noting its rapid token consumption. Furthermore, Zachery Smith articulates his aversion to Versel and Next.js, particularly disliking their forced use of TypeScript and limited choices for developers.

* **Deployment Options** Zachery Smith suggests Firebase for hosting due to its flexibility in deploying various build types, including static or React applications. He also recommends Render as a suitable alternative to Heroku, describing it as a "Heroku backend without all the BS". Conversely, Zachery Smith advises against using Hostinger and Blue Host, considering Versel a much better option than those.

* **Personal Health and Diet Philosophy** Kiran Rushton and Zachery Smith discuss their contrasting diets, with Kiran Rushton being a vegetarian and Zachery Smith identifying as a carnivore. Zachery Smith shares his personal experience with a vegan diet, which he adopted during chemotherapy, finding it unhealthy for himself despite general recommendations. He concludes that there is no universal "right diet," only what works for an individual, and expresses a preference for meat.

* **Discussion on Gauntlet AI Website Bug** Harrison Glenn reports a bug on the Gauntlet AI website where clicking a specific button leads to a 404 page, and then removing part of the URL redirects to a Vietnamese cockfighting crypto website. Zachery Smith, unaware of the issue, expresses interest in investigating it, clarifying that the ATRO project, which was originally intended to provide AI tools, was blended into Gauntlet due to the difficulty of keeping up with rapidly changing AI information.

* **Cybersecurity and Ethical Considerations in Software Development** Zachery Smith shares his past experiences in cybersecurity, including penetration testing and building malware and spyware for ethical purposes. He emphasizes the importance for cybersecurity professionals to understand and be comfortable with all criminal techniques to effectively protect systems, even if they have moral qualms. Zachery Smith concludes the meeting by encouraging hard work and smart questions, highlighting that a lack of effort is a significant career impediment in the industry .

### Suggested next steps

- [ ] Zachery Smith will show a couple of techniques by Wednesday.

*You should review Gemini's notes to make sure they're accurate. [Get tips and learn how Gemini takes notes](https://support.google.com/meet/answer/14754931)*

*Please provide feedback about using Gemini to take notes in a [short survey.](https://google.qualtrics.com/jfe/form/SV_9vK3UZEaIQKKE7A?confid=nIEUbtEz6sMA3hpcrux7DxIWOAIIigIgABgBCA&detailid=unspecified)*