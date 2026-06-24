export type TaskPriority = "Low" | "Medium" | "High";
export type TaskCategory = "Study" | "Creative" | "Work" | "Life" | "Personal" | "Other";
export type TaskStatus = "Active" | "Completed";

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: TaskPriority;
  category: TaskCategory;
  status: TaskStatus;
  estimatedTime?: string;
  createdAt: string;
  subtasks?: { id: string; title: string; completed: boolean }[];
}

export type AssistantFunctionType = "qa" | "summarize" | "creative" | "advice" | "tasks";

export interface PromptPreset {
  id: string;
  name: string;
  description: string;
  template: string; // [input] is the placeholder
  systemInstruction?: string;
  tone: string;
  complexity: "Simple" | "Moderate" | "Advanced";
}

export interface SavedResponse {
  id: string;
  functionType: AssistantFunctionType;
  promptName: string;
  userContent: string;
  engineeredPrompt: string;
  aiResponse: string;
  helpful?: boolean;
  feedbackCategory?: string;
  timestamp: string;
}
