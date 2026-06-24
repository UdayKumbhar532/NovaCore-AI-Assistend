import { PromptPreset, AssistantFunctionType } from "./types";

export const FUNCTION_CATEGORIES: {
  id: AssistantFunctionType;
  title: string;
  description: string;
  icon: string;
}[] = [
  {
    id: "qa",
    title: "Deep Q&A & Concepts",
    description: "Factual answering, semantic breakdowns, and conceptual explanations.",
    icon: "HelpCircle",
  },
  {
    id: "summarize",
    title: "Text Summarization",
    description: "Condense long articles, transcripts, or notes into structured highlights.",
    icon: "FileText",
  },
  {
    id: "creative",
    title: "Creative Content",
    description: "Generate poetry, narratives, brainstorming ideas, or outlines.",
    icon: "Sparkles",
  },
  {
    id: "advice",
    title: "Productivity & Study advice",
    description: "Effective learning roadmap, time-blocking, and strategic mentorship.",
    icon: "TrendingUp",
  },
  {
    id: "tasks",
    title: "AI Task Planner",
    description: "Transform an abstract goal or project description directly into a structured task list.",
    icon: "ListChecks",
  },
];

export const PROMPT_PRESETS: Record<AssistantFunctionType, PromptPreset[]> = {
  qa: [
    {
      id: "qa-direct",
      name: "Standard Direct Chat",
      description: "Direct, helpful, and highly accurate answers just like ChatGPT or Gemini.",
      template: "[input]",
      systemInstruction: "You are a professional, highly accurate, and helpful AI assistant. Answer the user's questions clearly, directly, and thoroughly with factual precision. Use markdown to format your response elegantly, providing rich code snippets, lists, and examples when relevant.",
      tone: "Direct & Accurate",
      complexity: "Simple",
    },
    {
      id: "qa-socratic",
      name: "Socratic Inquisitive Guide",
      description: "Encourages critical thinking by guiding the user with deep reasoning and exploratory questions.",
      template: "You are a Socratic tutor. Instead of giving a direct, flat answer to the query below, explain the foundational concepts step-by-step and end with 2-3 thought-provoking questions that guide the user to a deeper understanding.\n\nQuery: [input]\n\nSocratic Breakdown:",
      systemInstruction: "You are an intellectual Socratic guide. Do not lecture; promote curiosity and critical reasoning.",
      tone: "Inquisitive & Educational",
      complexity: "Advanced",
    },
    {
      id: "qa-academic",
      name: "Academic Deep-Dive",
      description: "Highly structured, detailed analysis with definitions, historical context, and technical breakdowns.",
      template: "Provide a comprehensive, scholarly explanation of the following topic. Structure your response with clear headings: \n1. Abstract Overview\n2. Historical Context & Origins\n3. Core Mechanisms/Theoretical Foundations\n4. Modern Significance & Applications\n\nTopic to analyze: [input]\n\nScholarly Treatise:",
      systemInstruction: "You are an elite academic professor writing a clear, rigorously structured encyclopedia entry.",
      tone: "Formal & Scientific",
      complexity: "Advanced",
    },
    {
      id: "qa-eli5",
      name: "Explain Like I'm Five (ELI5)",
      description: "Simplifies complex subjects using vivid everyday analogies and easy-to-understand language.",
      template: "Explain the following concept like I am five years old. Use a playful, visual analogy from everyday life (like baking a cake, playground rules, or building blocks) and avoid any technical jargon.\n\nConcept to explain: [input]\n\nSimple Analogy Response:",
      systemInstruction: "You are a warm, imaginative elementary school teacher who is excellent at simplifying advanced physics, science, and tech concepts.",
      tone: "Playful & Simplified",
      complexity: "Simple",
    },
  ],
  summarize: [
    {
      id: "sum-exec",
      name: "Executive Action Summary",
      description: "Condenses the text into core takeaways, decisions made, and direct actionable items.",
      template: "Analyze the source text below and distill it into a high-impact executive summary. Format your output exactly as:\n- **The Big Picture (1-2 sentences)**: Summarize the main theme.\n- **Core Takeaways**: 3-4 bullet points highlighting key decisions or arguments.\n- **Action Items**: A checklist of actions implied by the text.\n\nSource Text:\n[input]\n\nExecutive Summary:",
      systemInstruction: "You are a highly efficient Chief of Staff. You value time, clarity, and immediate actionability.",
      tone: "Direct & Professional",
      complexity: "Moderate",
    },
    {
      id: "sum-mindmap",
      name: "Conceptual Outliner",
      description: "Creates a hierarchical nested structure showing the structural relationship of all major points.",
      template: "Deconstruct the following text into a nested, hierarchical Markdown outline (using #, ##, ###, and nested bullets). Show the logical relationships between main themes, secondary concepts, and supporting data points.\n\nSource Text:\n[input]\n\nHierarchical Outline:",
      systemInstruction: "You are an expert cognitive designer who excels at turning dense prose into clear mental models and outlines.",
      tone: "Analytical & Structural",
      complexity: "Advanced",
    },
    {
      id: "sum-punchline",
      name: "The One-Sentence Essence",
      description: "Boils everything down into a single, punchy, memorable statement of core truth.",
      template: "Read the text below. Ignore minor details, and distill the absolute essence of the argument into exactly one single, powerful, memorable sentence. Follow it with an optional 3-word slogan in bold.\n\nText:\n[input]\n\nDistilled Essence:",
      systemInstruction: "You are an award-winning copywriter and deep thinker who excels at brevity and finding the absolute soul of any text.",
      tone: "Concise & Wittily Sharp",
      complexity: "Simple",
    },
  ],
  creative: [
    {
      id: "cre-poetic",
      name: "Sensory & Evocative",
      description: "Generates rich imagery, vivid metaphors, and emotional narrative depth.",
      template: "Write a creative description or narrative piece inspired by the prompt below. Focus heavily on sensory details (sound, light, texture, temperature, smell) and employ vivid metaphors. Avoid flat descriptions.\n\nInspiration: [input]\n\nSensory Piece:",
      systemInstruction: "You are a poetic novelist known for breathtaking description and emotional resonance.",
      tone: "Expressive & Atmospheric",
      complexity: "Moderate",
    },
    {
      id: "cre-cyberpunk",
      name: "Gritty Cyberpunk Narrative",
      description: "Creates suspenseful, high-tech, low-life sci-fi descriptions with dark neon aesthetics.",
      template: "Draft a gritty, atmospheric story or scene description set in a rain-slicked, neon-lit cyberpunk metropolis based on the concept below. Include elements of rogue technology, neon contrast, and street-level struggle.\n\nConcept: [input]\n\nCyberpunk Draft:",
      systemInstruction: "You are a sci-fi novelist writing in a rain-soaked, neon-drenched cyberpunk setting.",
      tone: "Gritty, Techno-noir & Dystopian",
      complexity: "Moderate",
    },
    {
      id: "cre-pitch",
      name: "Persuasive Story Hook",
      description: "Generates a structured storytelling pitch, complete with a hook, conflict, and character roles.",
      template: "Develop a structured creative pitch for a film, novel, or campaign based on this concept. Include:\n- **The Logline**: A single compelling hook sentence.\n- **The Inciting Incident**: What sparks the journey.\n- **Core Conflict**: The major obstacle.\n- **Protagonist Profile**: Who they are and what they stand to lose.\n\nCore Concept: [input]\n\nCreative Pitch Blueprint:",
      systemInstruction: "You are a master Hollywood creative development executive who knows exactly how to hook an audience.",
      tone: "Persuasive & Dynamic",
      complexity: "Advanced",
    },
  ],
  advice: [
    {
      id: "adv-pomodoro",
      name: "Pomodoro Block Planning",
      description: "Structures your goal into a realistic sequence of 25-minute highly focused sprints.",
      template: "Break down the following learning goal or topic into 4 highly-focused 25-minute Pomodoro sprints. For each block, detail:\n- **Focus Objective**: Exactly what to read, study, or build.\n- **Active Practice**: A tactile or active task (e.g., flashcards, drafting, coding) instead of passive review.\n- **Mental Check**: A question to ask yourself at the 25-minute mark to verify comprehension.\n\nGoal: [input]\n\nPomodoro Schedule:",
      systemInstruction: "You are an elite academic performance coach specialized in high-efficiency study routines.",
      tone: "Encouraging & Systematic",
      complexity: "Moderate",
    },
    {
      id: "adv-roadmap",
      name: "Incremental Roadmap",
      description: "Establishes a three-phased milestones roadmap to go from absolute beginner to competent practitioner.",
      template: "Map out a 3-stage learning curriculum (Beginner, Intermediate, Advanced) for the following topic. For each stage, define:\n- Key concepts to master\n- A practical hands-on project to build\n- A critical test or checkpoint to pass before moving to the next level.\n\nTopic: [input]\n\nCurriculum Roadmap:",
      systemInstruction: "You are a professional syllabus and curriculum architect focused on competency-based mastery.",
      tone: "Syllabus-Structured & Instructive",
      complexity: "Advanced",
    },
    {
      id: "adv-premortem",
      name: "Risk Premortem Coach",
      description: "Analyzes why you might fail to study or execute this goal and designs habits to prevent failure.",
      template: "Imagine it is 3 months from now, and you have completely failed to learn or achieve the goal below. Analyze the top 3 high-probability psychological bottlenecks (e.g., procrastination, information overload, confusion) that caused this failure, and design 3 specific 'if-then' habits to neutralize those threats before they start.\n\nGoal: [input]\n\nPremortem & Anti-Failure Blueprint:",
      systemInstruction: "You are a behavior change specialist and habits designer, inspired by atomic behavioral psychology.",
      tone: "Pragmatic, Direct & Bulletproof",
      complexity: "Advanced",
    },
  ],
  tasks: [
    {
      id: "task-standard",
      name: "Milestone Breakdown",
      description: "Standard decomposition of a project into sequential milestones and subtasks.",
      template: "Deconstruct the following project or objective into a logical sequence of actionable, standalone tasks for a todo board. Each task must have a title, short description, priority (Low, Medium, High), and category. Focus on clear, logical sequence.\n\nObjective: [input]",
      tone: "Action-Oriented & Sequential",
      complexity: "Moderate",
    },
    {
      id: "task-agile",
      name: "Agile Feature Sprints",
      description: "Formats tasks like software user stories, complete with acceptance criteria.",
      template: "Convert this project idea into technical, agile-styled tasks. For each task, structure it with a 'As a... I want to... So that...' title, a concrete description, and a clear 'Definition of Done' checklist.\n\nProject Idea: [input]",
      tone: "Structured & Technical",
      complexity: "Advanced",
    },
    {
      id: "task-minimal",
      name: "Slam-the-Bottleneck Planner",
      description: "Extracts only the critical-path tasks needed to prove the concept quickly, ignoring fluff.",
      template: "Identify the absolute core of the goal. Ignore all optional, secondary, or decorative elements. Generate a minimal set of tasks (maximum 4) representing the absolute 'critical path' required to validate the project or achieve the basic objective.\n\nGoal: [input]",
      tone: "Hyper-Focused & Ruthless",
      complexity: "Simple",
    },
  ],
};
