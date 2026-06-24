import React, { useState, useEffect, useRef } from "react";
import {
  Sparkles,
  Sliders,
  Zap,
  CheckCircle2,
  ListChecks,
  TrendingUp,
  HelpCircle,
  FileText,
  Trash2,
  Plus,
  Download,
  Upload,
  Clock,
  CornerDownRight,
  CheckSquare,
  Square,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
  SlidersHorizontal,
  AlertCircle,
  Layers,
  Calendar,
  ChevronRight,
  BookOpen,
  Settings,
  Share2,
  Send,
  User,
  Bot,
  Copy,
  ChevronDown,
  ArrowRight,
  Check,
  RotateCcw,
  Info,
  Sun,
  Moon,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  Pause,
  Play,
  X
} from "lucide-react";
import { Task, TaskPriority, TaskCategory, TaskStatus, AssistantFunctionType, PromptPreset, SavedResponse } from "./types";
import { FUNCTION_CATEGORIES, PROMPT_PRESETS } from "./promptPresets";
import MarkdownRenderer from "./components/MarkdownRenderer";
import PromptEngineeringStats from "./components/PromptEngineeringStats";

export default function App() {
  // --- Persistent Local States ---
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem("novacore_tasks");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    // Default initial tasks to demonstrate board capabilities
    return [
      {
        id: "task-1",
        title: "Explore Socratic Prompt Tuning",
        description: "Review Socratic guide presets under the Q&A panel to learn deep concepts instead of memorizing flat facts.",
        priority: "High" as TaskPriority,
        category: "Study" as TaskCategory,
        status: "Active" as TaskStatus,
        estimatedTime: "20 mins",
        createdAt: new Date().toISOString(),
        subtasks: [
          { id: "sub-1-1", title: "Select Deep Q&A category", completed: true },
          { id: "sub-1-2", title: "Trigger Socratic Guide with 'Quantum Superposition'", completed: false },
        ]
      },
      {
        id: "task-2",
        title: "Draft Portfolio Bio",
        description: "Draft a modern atmospheric personal bio using the Sensory & Evocative Creative generator.",
        priority: "Medium" as TaskPriority,
        category: "Creative" as TaskCategory,
        status: "Active" as TaskStatus,
        estimatedTime: "45 mins",
        createdAt: new Date().toISOString(),
        subtasks: []
      }
    ];
  });

  const [savedResponses, setSavedResponses] = useState<SavedResponse[]>(() => {
    const saved = localStorage.getItem("novacore_responses");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return [];
  });

  // --- Active Workspace Selection State ---
  const [activeTab, setActiveTab] = useState<"workspace" | "tasks" | "diagnostics">("workspace");
  const [selectedFunc, setSelectedFunc] = useState<AssistantFunctionType>("qa");
  const [selectedPreset, setSelectedPreset] = useState<PromptPreset>(PROMPT_PRESETS.qa[0]);
  const [userContent, setUserContent] = useState("");
  const [temperature, setTemperature] = useState(0.7);
  
  // Custom prompt override toggles
  const [isCustomTemplate, setIsCustomTemplate] = useState(false);
  const [customTemplate, setCustomTemplate] = useState("[input]");
  const [customSystem, setCustomSystem] = useState("");

  // --- AI Model Generation states ---
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [lastUsedPrompt, setLastUsedPrompt] = useState<string>("");
  const [generationError, setGenerationError] = useState<string | null>(null);

  // --- Feedback loop states ---
  const [feedbackGiven, setFeedbackGiven] = useState(false);
  const [feedbackHelpful, setFeedbackHelpful] = useState<boolean | null>(null);
  const [feedbackCategory, setFeedbackCategory] = useState("");
  const [customFeedbackComment, setCustomFeedbackComment] = useState("");

  // --- Task Board UI states ---
  const [taskFilterCategory, setTaskFilterCategory] = useState<"All" | TaskCategory>("All");
  const [taskFilterPriority, setTaskFilterPriority] = useState<"All" | TaskPriority>("All");
  const [taskFilterStatus, setTaskFilterStatus] = useState<"All" | TaskStatus>("Active");

  // Inline Task Builder states
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDesc, setNewTaskDesc] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState<TaskPriority>("Medium");
  const [newTaskCategory, setNewTaskCategory] = useState<TaskCategory>("Work");
  const [newTaskEstimate, setNewTaskEstimate] = useState("");

  // State management sync logs
  const [syncMessage, setSyncMessage] = useState<{ text: string; isError: boolean } | null>(null);
  const [importJson, setImportJson] = useState("");
  const [showSyncModal, setShowSyncModal] = useState(false);

  // Panel settings toggles
  const [showSettingsDropdown, setShowSettingsDropdown] = useState(false);
  const [copiedResponse, setCopiedResponse] = useState(false);
  const [currentChatHistoryIndex, setCurrentChatHistoryIndex] = useState<number | null>(null);

  // Subtask temporary input state
  const [newSubtaskTexts, setNewSubtaskTexts] = useState<Record<string, string>>({});

  // --- Sync storage changes ---
  useEffect(() => {
    localStorage.setItem("novacore_tasks", JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem("novacore_responses", JSON.stringify(savedResponses));
  }, [savedResponses]);

  // --- Theme Selection State ---
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    const saved = localStorage.getItem("novacore_theme");
    return (saved === "light" || saved === "dark") ? saved : "dark";
  });

  useEffect(() => {
    localStorage.setItem("novacore_theme", theme);
    const root = document.documentElement;
    if (theme === "light") {
      root.classList.add("light");
    } else {
      root.classList.remove("light");
    }
  }, [theme]);

  // --- Voice / Speech Feature States & Functions ---
  const [isListening, setIsListening] = useState(false);
  const [micError, setMicError] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isTtsPaused, setIsTtsPaused] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceName, setSelectedVoiceName] = useState<string>(() => {
    return localStorage.getItem("novacore_tts_voice") || "";
  });
  const [ttsRate, setTtsRate] = useState<number>(() => {
    const rate = localStorage.getItem("novacore_tts_rate");
    return rate ? parseFloat(rate) : 1.0;
  });
  const [ttsAutoPlay, setTtsAutoPlay] = useState<boolean>(() => {
    return localStorage.getItem("novacore_tts_autoplay") === "true";
  });
  const [lastExecutedCommand, setLastExecutedCommand] = useState<string | null>(null);
  const [showVoiceControlModal, setShowVoiceControlModal] = useState(false);

  const recognitionRef = useRef<any>(null);

  // Initialize Speech Synthesis Voices
  useEffect(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      const loadVoices = () => {
        const available = window.speechSynthesis.getVoices();
        setVoices(available);
        if (!selectedVoiceName && available.length > 0) {
          const defaultVoice = available.find(v => v.lang.startsWith("en")) || available[0];
          setSelectedVoiceName(defaultVoice.name);
        }
      };
      
      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("novacore_tts_voice", selectedVoiceName);
  }, [selectedVoiceName]);

  useEffect(() => {
    localStorage.setItem("novacore_tts_rate", ttsRate.toString());
  }, [ttsRate]);

  useEffect(() => {
    localStorage.setItem("novacore_tts_autoplay", ttsAutoPlay ? "true" : "false");
  }, [ttsAutoPlay]);

  // Handle Voice Commands matching
  const handleVoiceCommand = (rawText: string) => {
    const text = rawText.toLowerCase().trim();
    console.log("[Voice Command Processor] Received phrase:", text);

    if (text.includes("clear chat") || text.includes("new chat") || text.includes("reset chat")) {
      handleNewChat();
      showVoiceCommandFeedback("New Chat Started");
      setUserContent("");
    } else if (text.includes("send message") || text.includes("submit query") || text.includes("run assistant") || text.includes("generate response")) {
      showVoiceCommandFeedback("Sending Message");
      runNovaAssistant();
    } else if (text.includes("light mode") || text.includes("switch to light")) {
      setTheme("light");
      showVoiceCommandFeedback("Switched to Light Mode");
    } else if (text.includes("dark mode") || text.includes("switch to dark")) {
      setTheme("dark");
      showVoiceCommandFeedback("Switched to Dark Mode");
    } else if (text.includes("go to tasks") || text.includes("open tasks") || text.includes("show board") || text.includes("sprints board")) {
      setActiveTab("tasks");
      showVoiceCommandFeedback("Switched to Sprints Board");
    } else if (text.includes("go to chat") || text.includes("open chat") || text.includes("interactive chat")) {
      setActiveTab("workspace");
      showVoiceCommandFeedback("Switched to Interactive Chat");
    } else if (text.includes("go to analytics") || text.includes("open analytics") || text.includes("prompt analytics")) {
      setActiveTab("diagnostics");
      showVoiceCommandFeedback("Switched to Prompt Analytics");
    }
  };

  const showVoiceCommandFeedback = (message: string) => {
    setLastExecutedCommand(message);
    setSyncMessage({ text: `Voice command recognized: "${message}"`, isError: false });
    setTimeout(() => {
      setLastExecutedCommand(null);
      setSyncMessage(null);
    }, 4000);
  };

  // Initialize Speech-to-Text Recognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false; // standard non-continuous dictation is highly accurate
      rec.interimResults = false;
      rec.lang = "en-US";

      rec.onstart = () => {
        setIsListening(true);
        setMicError(null);
      };

      rec.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setUserContent(prev => {
            const trimmed = prev.trim();
            if (trimmed) {
              return trimmed + " " + transcript;
            }
            return transcript;
          });
          // Process voice commands
          handleVoiceCommand(transcript);
        }
      };

      rec.onerror = (event: any) => {
        console.error("[SpeechToText Error]", event.error);
        if (event.error === "not-allowed") {
          setMicError("Microphone access denied. Grant permissions in browser address bar.");
        } else {
          setMicError(`Speech Recognition: ${event.error}`);
        }
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
    }
  }, [theme, selectedFunc, selectedPreset, userContent]); // Bind essential states to ensure accurate command scope

  const toggleListening = () => {
    if (!recognitionRef.current) {
      setMicError("Web Speech Recognition is not supported in this browser. Please try Google Chrome, Safari, or Microsoft Edge.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      setMicError(null);
      try {
        recognitionRef.current.start();
      } catch (err: any) {
        console.error("Mic start failed", err);
      }
    }
  };

  const cleanTextForSpeech = (text: string): string => {
    return text
      .replace(/[*#`_\-]/g, "") // remove formatting characters
      .replace(/\[.*?\]\(.*?\)/g, "") // remove links
      .replace(/<\/?[^>]+(>|$)/g, "") // remove HTML tags if any
      .trim();
  };

  const speakText = (text: string) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    
    // Stop any active speech first
    window.speechSynthesis.cancel();

    const cleanText = cleanTextForSpeech(text);
    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    
    if (selectedVoiceName) {
      const allVoices = window.speechSynthesis.getVoices();
      const match = allVoices.find(v => v.name === selectedVoiceName);
      if (match) utterance.voice = match;
    }
    
    utterance.rate = ttsRate;
    
    utterance.onstart = () => {
      setIsSpeaking(true);
      setIsTtsPaused(false);
    };
    
    utterance.onend = () => {
      setIsSpeaking(false);
      setIsTtsPaused(false);
    };
    
    utterance.onerror = (e) => {
      console.error("TTS speech failed", e);
      setIsSpeaking(false);
      setIsTtsPaused(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setIsTtsPaused(false);
    }
  };

  const togglePauseSpeaking = () => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    if (isTtsPaused) {
      window.speechSynthesis.resume();
      setIsTtsPaused(false);
    } else {
      window.speechSynthesis.pause();
      setIsTtsPaused(true);
    }
  };

  // Adjust selected preset when function changes
  const handleFuncChange = (funcId: AssistantFunctionType) => {
    setSelectedFunc(funcId);
    const presets = PROMPT_PRESETS[funcId];
    if (presets && presets.length > 0) {
      setSelectedPreset(presets[0]);
      setIsCustomTemplate(false);
    }
  };

  // Compile prompt for preview in UI
  const getCompiledPromptPreview = () => {
    const templateToUse = isCustomTemplate ? customTemplate : selectedPreset.template;
    const content = userContent.trim() || "[Insert Your Query Here]";
    
    if (templateToUse.includes("[input]")) {
      return templateToUse.replace("[input]", content);
    }
    if (templateToUse.includes("[text]")) {
      return templateToUse.replace("[text]", content);
    }
    return `${templateToUse}\n\nUser Input:\n${content}`;
  };

  // --- Reset to new Chat ---
  const handleNewChat = () => {
    setUserContent("");
    setAiResult(null);
    setLastUsedPrompt("");
    setGenerationError(null);
    setFeedbackGiven(false);
    setFeedbackHelpful(null);
    setFeedbackCategory("");
    setCustomFeedbackComment("");
    setCurrentChatHistoryIndex(null);
    setActiveTab("workspace");
  };

  // --- Load Chat Session from History ---
  const handleLoadSession = (session: SavedResponse, index: number) => {
    setUserContent(session.userContent);
    setAiResult(session.aiResponse);
    setLastUsedPrompt(session.engineeredPrompt);
    setSelectedFunc(session.functionType);
    setFeedbackGiven(session.helpful !== undefined);
    setFeedbackHelpful(session.helpful ?? null);
    setFeedbackCategory(session.feedbackCategory ?? "");
    setCurrentChatHistoryIndex(index);
    setGenerationError(null);
    setActiveTab("workspace");

    // Attempt to match preset
    const presets = PROMPT_PRESETS[session.functionType];
    const matched = presets.find(p => p.name === session.promptName);
    if (matched) {
      setSelectedPreset(matched);
      setIsCustomTemplate(false);
    } else {
      setIsCustomTemplate(true);
      setCustomTemplate(session.engineeredPrompt);
    }
  };

  // --- Execute AI Assistant Query ---
  const runNovaAssistant = async () => {
    if (!userContent.trim()) {
      setGenerationError("Please enter some input content before asking Nova.");
      return;
    }

    setIsGenerating(true);
    setGenerationError(null);
    setAiResult(null);
    setFeedbackGiven(false);
    setFeedbackHelpful(null);
    setFeedbackCategory("");
    setCustomFeedbackComment("");

    const templateToUse = isCustomTemplate ? customTemplate : selectedPreset.template;
    const systemToUse = isCustomTemplate ? customSystem : selectedPreset.systemInstruction;

    try {
      const response = await fetch("/api/nova/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          functionType: selectedFunc,
          promptTemplate: templateToUse,
          userContent: userContent,
          temperature: temperature,
          systemInstruction: systemToUse,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setAiResult(data.text);
        setLastUsedPrompt(data.finalPromptUsed);

        // If auto play voice is active, trigger Text-to-Speech immediately
        if (ttsAutoPlay) {
          speakText(data.text);
        }

        // Auto save to history on success
        const newResponseRecord: SavedResponse = {
          id: "resp-" + Date.now(),
          functionType: selectedFunc,
          promptName: isCustomTemplate ? "Custom Hybrid Prompt" : selectedPreset.name,
          userContent: userContent,
          engineeredPrompt: data.finalPromptUsed,
          aiResponse: data.text,
          timestamp: new Date().toISOString(),
        };
        setSavedResponses(prev => [newResponseRecord, ...prev]);
        setCurrentChatHistoryIndex(0);
      } else {
        setGenerationError(data.error || "Failed to generate AI response.");
      }
    } catch (err: any) {
      setGenerationError(err.message || "Network error. Make sure server is running.");
    } finally {
      setIsGenerating(false);
    }
  };

  // --- Submit User Prompt feedback ---
  const submitFeedback = (helpful: boolean) => {
    setFeedbackHelpful(helpful);
    setFeedbackGiven(true);

    // Update history record
    setSavedResponses(prev => {
      if (prev.length === 0) return prev;
      const indexToUpdate = currentChatHistoryIndex !== null ? currentChatHistoryIndex : 0;
      const updated = [...prev];
      if (updated[indexToUpdate]) {
        updated[indexToUpdate] = {
          ...updated[indexToUpdate],
          helpful: helpful,
          feedbackCategory: helpful ? "Optimal Response" : "Requires Calibration"
        };
      }
      return updated;
    });

    setSyncMessage({
      text: helpful ? "Telemetry locked: Model response approved!" : "Telemetry registered. Tune parameters below to resolve.",
      isError: !helpful
    });
    setTimeout(() => setSyncMessage(null), 3000);
  };

  const saveFeedbackWithCategory = (category: string) => {
    setFeedbackCategory(category);
    setSavedResponses(prev => {
      if (prev.length === 0) return prev;
      const indexToUpdate = currentChatHistoryIndex !== null ? currentChatHistoryIndex : 0;
      const updated = [...prev];
      if (updated[indexToUpdate]) {
        updated[indexToUpdate] = {
          ...updated[indexToUpdate],
          feedbackCategory: category,
          aiResponse: updated[indexToUpdate].aiResponse + (customFeedbackComment ? `\n\n[Calibration Note: ${customFeedbackComment}]` : "")
        };
      }
      return updated;
    });

    setSyncMessage({ text: "Diagnostic parameters recalibrated successfully.", isError: false });
    setTimeout(() => setSyncMessage(null), 3500);
  };

  // --- Copy AI Response to Clipboard ---
  const handleCopyResponse = () => {
    if (!aiResult) return;
    navigator.clipboard.writeText(aiResult);
    setCopiedResponse(true);
    setTimeout(() => setCopiedResponse(false), 2000);
  };

  // --- Add Manual Task ---
  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const newTask: Task = {
      id: "task-" + Date.now(),
      title: newTaskTitle.trim(),
      description: newTaskDesc.trim(),
      priority: newTaskPriority,
      category: newTaskCategory,
      status: "Active",
      estimatedTime: newTaskEstimate.trim() || undefined,
      createdAt: new Date().toISOString(),
      subtasks: [],
    };

    setTasks(prev => [newTask, ...prev]);
    setNewTaskTitle("");
    setNewTaskDesc("");
    setNewTaskEstimate("");
    
    setSyncMessage({ text: "Sprinting task added offline.", isError: false });
    setTimeout(() => setSyncMessage(null), 3000);
  };

  // --- Toggle Task Status ---
  const toggleTaskStatus = (id: string) => {
    setTasks(prev =>
      prev.map(t => {
        if (t.id === id) {
          const nextStatus: TaskStatus = t.status === "Active" ? "Completed" : "Active";
          return { ...t, status: nextStatus };
        }
        return t;
      })
    );
  };

  // --- Delete Task ---
  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  // --- Add Subtask ---
  const handleAddSubtaskSubmit = (taskId: string) => {
    const text = newSubtaskTexts[taskId];
    if (!text || !text.trim()) return;

    setTasks(prev =>
      prev.map(t => {
        if (t.id === taskId) {
          const subs = t.subtasks || [];
          return {
            ...t,
            subtasks: [...subs, { id: "sub-" + Date.now(), title: text.trim(), completed: false }]
          };
        }
        return t;
      })
    );

    setNewSubtaskTexts(prev => ({ ...prev, [taskId]: "" }));
  };

  // --- Toggle Subtask Completion ---
  const toggleSubtask = (taskId: string, subId: string) => {
    setTasks(prev =>
      prev.map(t => {
        if (t.id === taskId) {
          const subs = (t.subtasks || []).map(s => {
            if (s.id === subId) {
              return { ...s, completed: !s.completed };
            }
            return s;
          });
          return { ...t, subtasks: subs };
        }
        return t;
      })
    );
  };

  // --- Clean all Chat history ---
  const handleClearHistory = () => {
    if (window.confirm("Are you sure you want to clear your chat session history?")) {
      setSavedResponses([]);
      handleNewChat();
      setSyncMessage({ text: "Chat history cleared successfully.", isError: false });
      setTimeout(() => setSyncMessage(null), 2500);
    }
  };

  // --- Auto-Inject AI Structured Tasks ---
  const injectAiGeneratedTasks = () => {
    if (!aiResult) return;
    try {
      // Find JSON block in output if wrapped in codeblocks
      let cleanJson = aiResult.trim();
      const firstBrace = cleanJson.indexOf("{");
      const lastBrace = cleanJson.lastIndexOf("}");
      
      if (firstBrace !== -1 && lastBrace !== -1) {
        cleanJson = cleanJson.substring(firstBrace, lastBrace + 1);
      }

      const parsed = JSON.parse(cleanJson);
      if (parsed && Array.isArray(parsed.tasks)) {
        const mapped: Task[] = parsed.tasks.map((t: any, index: number) => ({
          id: `ai-task-${Date.now()}-${index}`,
          title: t.title || "AI Generated Task",
          description: t.description || "",
          priority: (t.priority || "Medium") as TaskPriority,
          category: (t.category || "Work") as TaskCategory,
          status: "Active" as TaskStatus,
          estimatedTime: t.estimatedTime || "30 mins",
          createdAt: new Date().toISOString(),
          subtasks: []
        }));

        setTasks(prev => [...mapped, ...prev]);
        setSyncMessage({ text: `Successfully injected ${mapped.length} tasks to command board!`, isError: false });
        setActiveTab("tasks");
        setTimeout(() => setSyncMessage(null), 4000);
      }
    } catch (e) {
      setSyncMessage({ text: "Failed to parse task format. Check if the AI generated valid JSON.", isError: true });
      setTimeout(() => setSyncMessage(null), 4000);
    }
  };

  // --- Cross-Device Sync State Management ---
  const handleExportState = () => {
    const backupState = {
      tasks,
      savedResponses,
      version: "2.1",
      timestamp: new Date().toISOString()
    };
    const jsonString = JSON.stringify(backupState, null, 2);
    setImportJson(jsonString);
    
    const element = document.createElement("a");
    const file = new Blob([jsonString], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `novacore_sync_vault_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);

    setSyncMessage({ text: "Vault compiled! Download triggered.", isError: false });
  };

  const handleImportState = () => {
    if (!importJson.trim()) {
      setSyncMessage({ text: "Please paste a valid JSON backup string.", isError: true });
      return;
    }
    try {
      const parsed = JSON.parse(importJson);
      if (parsed && (Array.isArray(parsed.tasks) || Array.isArray(parsed.savedResponses))) {
        if (Array.isArray(parsed.tasks)) {
          setTasks(parsed.tasks);
        }
        if (Array.isArray(parsed.savedResponses)) {
          setSavedResponses(parsed.savedResponses);
        }
        setSyncMessage({ text: "Sync vault imported. Local state updated successfully!", isError: false });
        setShowSyncModal(false);
        setImportJson("");
      } else {
        setSyncMessage({ text: "Format verification failed. Must contain tasks or responses.", isError: true });
      }
    } catch (err) {
      setSyncMessage({ text: "JSON integrity check failed. Verify text input.", isError: true });
    }
  };

  // Get active stats of current task lists
  const activeCount = tasks.filter(t => t.status === "Active").length;
  const completedCount = tasks.filter(t => t.status === "Completed").length;
  const progressPercent = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  // Filter tasks based on status/category/priority selection
  const filteredTasks = tasks.filter(t => {
    const matchesCategory = taskFilterCategory === "All" || t.category === taskFilterCategory;
    const matchesPriority = taskFilterPriority === "All" || t.priority === taskFilterPriority;
    const matchesStatus = taskFilterStatus === "All" || t.status === taskFilterStatus;
    return matchesCategory && matchesPriority && matchesStatus;
  });

  return (
    <div className={`flex h-screen w-screen overflow-hidden font-sans selection:bg-sky-500/30 selection:text-sky-200 ${
      theme === "light" ? "light bg-slate-50 text-slate-900" : "bg-[#0d0e12] text-slate-100"
    }`}>
      
      {/* 1. CHATGPT/CLAUDE STYLE LEFT SIDEBAR */}
      <aside className="w-68 bg-[#111218] border-r border-[#1d1f2d] flex flex-col h-full shrink-0 select-none z-30">
        
        {/* Sidebar Header Title */}
        <div className="p-4 border-b border-[#1d1f2d]/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-sky-500 via-indigo-500 to-fuchsia-500 flex items-center justify-center shadow-md">
              <Sparkles className="h-4 w-4 text-white animate-pulse" />
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-tight text-white flex items-center gap-1">
                NovaCore AI
              </h1>
              <span className="text-[9px] font-mono text-sky-400 block tracking-widest uppercase">PROMPT VAULT</span>
            </div>
          </div>
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping"></span>
        </div>

        {/* Start New Chat Control */}
        <div className="p-3">
          <button
            onClick={handleNewChat}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold bg-[#1a1c27] hover:bg-[#222535] text-sky-400 hover:text-white border border-[#2d3148] transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4 text-sky-400" />
            New Assistant Chat
          </button>
        </div>

        {/* Workspace Mode Selection */}
        <div className="px-3 space-y-1 py-1">
          <button
            onClick={() => setActiveTab("workspace")}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              activeTab === "workspace"
                ? "bg-[#1f2233] text-white font-semibold border-l-2 border-sky-400"
                : "text-slate-400 hover:text-slate-200 hover:bg-[#1a1c27]/40"
            }`}
          >
            <Bot className="h-4 w-4 text-sky-400" />
            <span>Interactive Chat</span>
          </button>

          <button
            onClick={() => setActiveTab("tasks")}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              activeTab === "tasks"
                ? "bg-[#1f2233] text-white font-semibold border-l-2 border-sky-400"
                : "text-slate-400 hover:text-slate-200 hover:bg-[#1a1c27]/40"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <ListChecks className="h-4 w-4 text-indigo-400" />
              <span>Sprints Board</span>
            </div>
            <span className="bg-[#171924] px-1.5 py-0.5 rounded text-[10px] font-mono text-slate-400">
              {activeCount}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("diagnostics")}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              activeTab === "diagnostics"
                ? "bg-[#1f2233] text-white font-semibold border-l-2 border-sky-400"
                : "text-slate-400 hover:text-slate-200 hover:bg-[#1a1c27]/40"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <TrendingUp className="h-4 w-4 text-fuchsia-400" />
              <span>Prompt Analytics</span>
            </div>
            <span className="bg-[#171924] px-1.5 py-0.5 rounded text-[10px] font-mono text-emerald-400">
              {savedResponses.length}
            </span>
          </button>
        </div>

        {/* Past Sessions Chat History List (Like ChatGPT History list!) */}
        <div className="flex-1 overflow-y-auto px-3 mt-4 space-y-3">
          <div className="flex items-center justify-between px-2">
            <span className="text-[10px] font-bold text-slate-500 tracking-wider uppercase">Active Session Threads</span>
            {savedResponses.length > 0 && (
              <button
                onClick={handleClearHistory}
                className="text-[9px] font-mono text-red-400 hover:text-red-300 flex items-center gap-0.5 cursor-pointer"
                title="Wipe Session History"
              >
                <Trash2 className="h-3 w-3" />
                Clear
              </button>
            )}
          </div>

          {savedResponses.length === 0 ? (
            <div className="text-center py-8 text-slate-600 text-[11px] font-mono px-2">
              No previous threads saved yet. Execute a prompt to trigger auto-archival.
            </div>
          ) : (
            <div className="space-y-1.5">
              {savedResponses.map((session, index) => {
                const isSelected = currentChatHistoryIndex === index;
                return (
                  <button
                    key={session.id}
                    onClick={() => handleLoadSession(session, index)}
                    className={`w-full text-left p-2 rounded-xl border text-xs transition-all flex flex-col gap-1 cursor-pointer ${
                      isSelected
                        ? "bg-[#1f2233] border-sky-500/30 text-white"
                        : "bg-[#141520]/60 border-transparent text-slate-400 hover:border-[#1d1f2d] hover:bg-[#1a1c27]/60"
                    }`}
                  >
                    <div className="flex items-center justify-between w-full font-medium">
                      <span className="truncate text-[11px] text-slate-200 w-4/5">
                        {session.userContent}
                      </span>
                      {session.helpful !== undefined && (
                        <span className={`h-1.5 w-1.5 rounded-full ${session.helpful ? 'bg-emerald-400' : 'bg-red-400'}`}></span>
                      )}
                    </div>
                    <div className="flex items-center justify-between w-full text-[9px] font-mono text-slate-500">
                      <span className="truncate max-w-[120px]">{session.promptName}</span>
                      <span>{new Date(session.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Sidebar Footer Controls */}
        <div className="p-3 border-t border-[#1d1f2d] mt-auto space-y-2">
          <button
            onClick={() => {
              setShowSyncModal(true);
              setSyncMessage(null);
            }}
            className="w-full flex items-center justify-between p-2.5 bg-[#171924] hover:bg-[#1f2233] border border-[#232738]/80 text-slate-300 rounded-xl text-[11px] font-medium transition-all cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Share2 className="h-3.5 w-3.5 text-sky-400" />
              <span>Multi-Device Sync</span>
            </div>
            <span className="text-[9px] font-mono bg-sky-500/10 text-sky-400 px-1.5 py-0.2 rounded">Vault 2.1</span>
          </button>

          <div className="flex items-center justify-between px-2 text-[10px] text-slate-500 font-mono">
            <span>Offline LocalStorage DB</span>
            <span className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
              SECURE
            </span>
          </div>
        </div>
      </aside>

      {/* 2. MAIN WORKSPACE CONTENT WINDOW */}
      <main className="flex-1 flex flex-col min-w-0 relative h-full">
        
        {/* Main Content Sticky Header */}
        <header className="h-14 bg-[#0d0e12]/80 backdrop-blur-md border-b border-[#1d1f2d]/50 flex items-center justify-between px-6 z-25 sticky top-0 select-none">
          <div className="flex items-center gap-3">
            <h2 className="text-xs font-mono font-bold tracking-wider text-slate-400 uppercase flex items-center gap-1.5">
              {activeTab === "workspace" && (
                <>
                  <Bot className="h-3.5 w-3.5 text-sky-400" />
                  Nova Interactive Chat Workspace
                </>
              )}
              {activeTab === "tasks" && (
                <>
                  <ListChecks className="h-3.5 w-3.5 text-indigo-400" />
                  Offline Kanban Sprints Board
                </>
              )}
              {activeTab === "diagnostics" && (
                <>
                  <TrendingUp className="h-3.5 w-3.5 text-fuchsia-400" />
                  System Diagnostics & Calibration
                </>
              )}
            </h2>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            {/* Theme Toggle Control */}
            <button
              onClick={() => setTheme(prev => prev === "dark" ? "light" : "dark")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all cursor-pointer text-[11px] font-semibold ${
                theme === "light"
                  ? "bg-white text-slate-800 border-slate-300 hover:bg-slate-100"
                  : "bg-[#141520] text-slate-300 border-[#1d1f2d] hover:bg-[#1a1c27]"
              }`}
              title={theme === "dark" ? "Switch to High-Contrast Light Mode" : "Switch to Dark Mode"}
            >
              {theme === "dark" ? (
                <>
                  <Sun className="h-3.5 w-3.5 text-amber-400" />
                  <span>Light Mode</span>
                </>
              ) : (
                <>
                  <Moon className="h-3.5 w-3.5 text-indigo-500" />
                  <span>Dark Mode</span>
                </>
              )}
            </button>

            {/* Sync Notifications or current Calibration Settings preview */}
            <div className="bg-[#141520] border border-[#1d1f2d] px-2.5 py-1 rounded-md text-[10px] text-slate-400 flex items-center gap-1.5">
              <Sliders className="h-3 w-3 text-sky-400" />
              <span>Preset Mode: <strong>{isCustomTemplate ? "Hybrid Custom" : selectedPreset.name}</strong></span>
              <span className="text-slate-600">|</span>
              <span>Temp: <strong>{temperature}</strong></span>
            </div>

            <div className="text-slate-500 hidden sm:block">
              Time: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        </header>

        {/* Fast Action Feedback Notifications */}
        {syncMessage && (
          <div className={`px-6 py-2 text-xs font-mono text-center flex items-center justify-center gap-2 transition-all duration-300 absolute top-14 left-0 w-full z-20 ${
            syncMessage.isError ? "bg-red-950/90 text-red-300 border-b border-red-900/50" : "bg-sky-950/90 text-sky-300 border-b border-sky-900/50"
          }`}>
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            <span>{syncMessage.text}</span>
          </div>
        )}

        {/* ----------------------------------------------- */}
        {/* TAB 1: MINIMAL CHAT INTERFACE & DASHBOARD GREETING */}
        {activeTab === "workspace" && (
          <div className="flex-1 flex flex-col justify-between overflow-hidden relative">
            
            {/* Chat viewport scrollable area */}
            <div className="flex-1 overflow-y-auto px-6 py-8 space-y-6">
              
              {/* IF CHAT IS EMPTY: Display Stunning Gemini/Claude style Welcome Screen */}
              {aiResult === null && !isGenerating ? (
                <div className="max-w-3xl mx-auto py-12 space-y-12">
                  
                  {/* Glowing logo / Header title */}
                  <div className="text-center space-y-3">
                    <div className="h-16 w-16 mx-auto rounded-3xl bg-gradient-to-tr from-sky-500 via-indigo-500 to-fuchsia-500 p-0.5 flex items-center justify-center shadow-xl shadow-indigo-500/10">
                      <div className="h-full w-full bg-[#0d0e12] rounded-[22px] flex items-center justify-center">
                        <Sparkles className="h-8 w-8 text-sky-400" />
                      </div>
                    </div>
                    <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-slate-400 tracking-tight">
                      How can I assist you today?
                    </h2>
                    <p className="text-xs text-slate-400 font-mono tracking-wide uppercase">
                      NovaCore AI • Multi-Function Prompt Playground
                    </p>
                  </div>

                  {/* Suggestion Bento Grid categorized by Assistant functions */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest text-left pl-1">
                      Choose an Assistant Prompt Template to trigger calibration:
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                      {FUNCTION_CATEGORIES.map((cat) => {
                        // Pick first preset for this category to show as starter card
                        const starterPreset = PROMPT_PRESETS[cat.id][0];
                        return (
                          <button
                            key={cat.id}
                            onClick={() => {
                              setSelectedFunc(cat.id);
                              setSelectedPreset(starterPreset);
                              setIsCustomTemplate(false);
                              // Auto populate inspirational placeholder if blank
                              if (!userContent) {
                                if (cat.id === "qa") setUserContent("Explain how quantum superposition works with a beautiful analogy.");
                                if (cat.id === "summarize") setUserContent("Paste text to summarize here...");
                                if (cat.id === "creative") setUserContent("Draft a science fiction movie outline about a rogue asteroid mining colony.");
                                if (cat.id === "advice") setUserContent("What is a roadmap for mastering modern software design architectures?");
                                if (cat.id === "tasks") setUserContent("Create a full project sprint for developing a secure web application prototype.");
                              }
                            }}
                            className="bg-[#141520] hover:bg-[#1a1c27] border border-[#1d1f2d] rounded-2xl p-4 text-left transition-all hover:scale-[1.01] hover:border-slate-700 hover:shadow-lg hover:shadow-sky-500/5 cursor-pointer flex gap-4 group"
                          >
                            <div className="p-3 bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl border border-slate-800 group-hover:text-sky-400 shrink-0 h-fit">
                              {cat.id === "qa" && <HelpCircle className="h-5 w-5 text-sky-400" />}
                              {cat.id === "summarize" && <FileText className="h-5 w-5 text-emerald-400" />}
                              {cat.id === "creative" && <Sparkles className="h-5 w-5 text-fuchsia-400" />}
                              {cat.id === "advice" && <TrendingUp className="h-5 w-5 text-amber-400" />}
                              {cat.id === "tasks" && <ListChecks className="h-5 w-5 text-rose-400" />}
                            </div>
                            <div>
                              <h4 className="text-sm font-semibold text-white group-hover:text-sky-400 flex items-center gap-2">
                                {cat.title}
                                <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                              </h4>
                              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                                {cat.description}
                              </p>
                              <div className="mt-2 text-[10px] font-mono text-slate-500">
                                Starter: <span className="text-slate-400">{starterPreset.name}</span>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Tuning guidelines banner */}
                  <div className="bg-[#12131b]/60 rounded-2xl border border-[#1d1f2d] p-5 flex gap-4 text-left">
                    <Info className="h-5 w-5 text-indigo-400 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <h4 className="text-xs font-semibold text-slate-200">How Prompt Engineering works here</h4>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Nova automatically embeds your raw input query within robust system directives, format regulations, and semantic guardrails depending on the chosen template. You can observe the compiled wrapper update dynamically inside the preview module!
                      </p>
                    </div>
                  </div>

                </div>
              ) : (
                
                /* IN THREAD VIEW: Display Elegant Message Bubble Sequence */
                <div className="max-w-3xl mx-auto space-y-8">
                  
                  {/* User query block */}
                  <div className="flex gap-4 text-left bg-[#13141d]/50 rounded-2xl p-5 border border-[#1d1f2d]/50">
                    <div className="h-8 w-8 rounded-full bg-slate-800 text-slate-300 font-bold flex items-center justify-center text-xs shrink-0">
                      U
                    </div>
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <span className="text-[10px] font-mono text-slate-500 uppercase font-bold">You (Input Query)</span>
                      <p className="text-slate-200 text-sm whitespace-pre-wrap leading-relaxed select-text font-sans">
                        {userContent}
                      </p>
                    </div>
                  </div>

                  {/* AI output result block */}
                  <div className="flex gap-4 text-left">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-500 flex items-center justify-center shrink-0">
                      <Sparkles className="h-4.5 w-4.5 text-white animate-pulse" />
                    </div>
                    <div className="space-y-4 flex-1 min-w-0">
                      
                      <div className="flex items-center justify-between border-b border-[#1d1f2d]/60 pb-2">
                        <div className="space-y-0.5">
                          <span className="text-xs font-semibold text-white">Nova Assistant Model</span>
                          <span className="text-[9px] font-mono text-sky-400 block uppercase">CALIBRATED INFERENCE CHANNELS</span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          {/* Sound wave visualizer while speaking */}
                          {isSpeaking && (
                            <div className="flex items-center gap-0.5 px-2 py-1 bg-indigo-500/10 text-indigo-400 rounded-lg text-[10px] font-mono select-none">
                              <span className="h-1.5 w-0.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                              <span className="h-3 w-0.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                              <span className="h-2 w-0.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                              <span className="text-[9px] font-semibold uppercase tracking-wider ml-1">Speaking</span>
                            </div>
                          )}

                          {/* Play/Pause Speech Button */}
                          {isSpeaking ? (
                            <>
                              <button
                                onClick={togglePauseSpeaking}
                                className="p-1.5 hover:bg-[#1a1c27] text-slate-400 hover:text-white rounded-lg transition-all cursor-pointer"
                                title={isTtsPaused ? "Resume Audio Reading" : "Pause Audio Reading"}
                              >
                                {isTtsPaused ? <Play className="h-3.5 w-3.5 text-sky-400" /> : <Pause className="h-3.5 w-3.5 text-indigo-400" />}
                              </button>
                              <button
                                onClick={stopSpeaking}
                                className="p-1.5 hover:bg-[#1a1c27] text-red-400 hover:text-red-300 rounded-lg transition-all cursor-pointer"
                                title="Stop Audio Reading"
                              >
                                <VolumeX className="h-3.5 w-3.5" />
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => speakText(aiResult || "")}
                              className="p-1.5 hover:bg-[#1a1c27] text-slate-400 hover:text-white rounded-lg transition-all cursor-pointer"
                              title="Read Response Aloud (Text-to-Speech)"
                            >
                              <Volume2 className="h-3.5 w-3.5" />
                            </button>
                          )}

                          <button
                            onClick={handleCopyResponse}
                            className="p-1.5 hover:bg-[#1a1c27] text-slate-400 hover:text-white rounded-lg transition-all cursor-pointer"
                            title="Copy Response to Clipboard"
                          >
                            {copiedResponse ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                          </button>
                        </div>
                      </div>

                      {/* Actual Response Content wrapper with beautiful typography */}
                      <div className="bg-[#111218]/30 rounded-2xl p-1 border border-[#1d1f2d]/40 min-h-[100px] leading-relaxed">
                        <MarkdownRenderer content={aiResult || ""} />
                      </div>

                      {/* FAST-LANE TASK INJECT TRIGGER */}
                      {selectedFunc === "tasks" && aiResult && (
                        <div className="bg-gradient-to-r from-purple-950/20 to-indigo-950/20 border border-purple-900/30 rounded-2xl p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4 text-left">
                          <div className="space-y-1">
                            <span className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                              <ListChecks className="h-4 w-4" />
                              Structured Task Blueprint Generated
                            </span>
                            <p className="text-xs text-slate-400">
                              Would you like to instantly synchronize these tasks into your local Sprint board?
                            </p>
                          </div>

                          <button
                            onClick={injectAiGeneratedTasks}
                            className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-bold text-xs px-4 py-2 rounded-xl border border-indigo-400/20 transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                          >
                            <Plus className="h-3.5 w-3.5" />
                            Instantly Ingest Tasks
                          </button>
                        </div>
                      )}

                      {/* DETAILED INTERACTIVE FEEDBACK LOOP BAR */}
                      <div className="bg-[#12131c] rounded-2xl border border-[#1d1f2d] p-4 space-y-3">
                        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                          <span className="text-xs font-semibold text-slate-300">
                            Helpfulness rating for this prompt configuration:
                          </span>
                          
                          <div className="flex gap-2">
                            <button
                              onClick={() => submitFeedback(true)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition-all flex items-center gap-1.5 cursor-pointer ${
                                feedbackHelpful === true
                                  ? "bg-emerald-500 text-slate-950"
                                  : "bg-[#1d1f2d] text-slate-300 hover:bg-[#272a3d]"
                              }`}
                            >
                              <ThumbsUp className="h-3.5 w-3.5" />
                              YES
                            </button>

                            <button
                              onClick={() => submitFeedback(false)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition-all flex items-center gap-1.5 cursor-pointer ${
                                feedbackHelpful === false
                                  ? "bg-red-500 text-slate-950"
                                  : "bg-[#1d1f2d] text-slate-300 hover:bg-[#272a3d]"
                              }`}
                            >
                              <ThumbsDown className="h-3.5 w-3.5" />
                              NO
                            </button>
                          </div>
                        </div>

                        {/* Expandable validation choices based on helpful/unhelpful selections */}
                        {feedbackGiven && (
                          <div className="pt-3 border-t border-[#1d1f2d] space-y-3">
                            <span className="text-xs font-bold text-sky-400 block">
                              {feedbackHelpful 
                                ? "💡 Structure Optimization: Select performance tag to lock:"
                                : "⚠️ Prompt failure registered. Select core defect category:"
                              }
                            </span>

                            <div className="flex flex-wrap gap-2">
                              {feedbackHelpful ? (
                                <>
                                  <button onClick={() => saveFeedbackWithCategory("Perfect structure")} className="px-2.5 py-1 bg-[#1a1c27] hover:bg-slate-800 text-[10px] text-slate-300 rounded border border-slate-850">Perfect structure</button>
                                  <button onClick={() => saveFeedbackWithCategory("Analogy accuracy")} className="px-2.5 py-1 bg-[#1a1c27] hover:bg-slate-800 text-[10px] text-slate-300 rounded border border-slate-850">Analogy accuracy</button>
                                  <button onClick={() => saveFeedbackWithCategory("Excellent brevity")} className="px-2.5 py-1 bg-[#1a1c27] hover:bg-slate-800 text-[10px] text-slate-300 rounded border border-slate-850">Excellent brevity</button>
                                  <button onClick={() => saveFeedbackWithCategory("Strong logic flow")} className="px-2.5 py-1 bg-[#1a1c27] hover:bg-slate-800 text-[10px] text-slate-300 rounded border border-slate-850">Strong logic flow</button>
                                </>
                              ) : (
                                <>
                                  <button onClick={() => saveFeedbackWithCategory("Too verbose")} className="px-2.5 py-1 bg-red-950/20 hover:bg-red-950/40 text-[10px] text-red-300 rounded border border-red-900/30">Too verbose</button>
                                  <button onClick={() => saveFeedbackWithCategory("Ignored constraints")} className="px-2.5 py-1 bg-red-950/20 hover:bg-red-950/40 text-[10px] text-red-300 rounded border border-red-900/30">Ignored constraints</button>
                                  <button onClick={() => saveFeedbackWithCategory("Poor formatting")} className="px-2.5 py-1 bg-red-950/20 hover:bg-red-950/40 text-[10px] text-red-300 rounded border border-red-900/30">Poor formatting</button>
                                  <button onClick={() => saveFeedbackWithCategory("Repetitive tone")} className="px-2.5 py-1 bg-red-950/20 hover:bg-red-950/40 text-[10px] text-red-300 rounded border border-red-900/30">Repetitive tone</button>
                                </>
                              )}
                            </div>

                            <div className="flex gap-2">
                              <input
                                type="text"
                                placeholder="Add custom debugging comments (optional)..."
                                value={customFeedbackComment}
                                onChange={(e) => setCustomFeedbackComment(e.target.value)}
                                className="flex-1 bg-slate-950 text-slate-200 border border-[#1d1f2d] rounded px-3 py-1 text-xs focus:outline-none focus:border-sky-500 font-mono"
                              />
                              <button
                                onClick={() => saveFeedbackWithCategory(feedbackCategory || "Detailed commentary")}
                                className="px-3 py-1 bg-sky-500 hover:bg-sky-400 text-slate-950 rounded font-semibold text-xs transition-all cursor-pointer"
                              >
                                Submit Note
                              </button>
                            </div>

                            {/* Automated diagnostics feedback suggestions */}
                            <div className="pt-2 text-[10px] text-slate-500 leading-normal font-mono flex items-start gap-1">
                              <Info className="h-3.5 w-3.5 text-slate-600 shrink-0 mt-0.5" />
                              <span>
                                <strong>System Optimization Tips:</strong> {
                                  feedbackHelpful
                                    ? "Perfect alignment detected. Cache matching weights locked client-side."
                                    : "If model output is inconsistent, try tweaking temperature settings inside parameters capsule below, or inject explicit direct command templates."
                                }
                              </span>
                            </div>
                          </div>
                        )}
                      </div>

                    </div>
                  </div>

                </div>
              )}

              {/* Loader visual when query generates */}
              {isGenerating && (
                <div className="max-w-3xl mx-auto flex gap-4 text-left">
                  <div className="h-8 w-8 rounded-full bg-[#1c1d28] border border-slate-700 flex items-center justify-center shrink-0">
                    <RefreshCw className="h-4.5 w-4.5 text-sky-400 animate-spin" />
                  </div>
                  <div className="space-y-3 flex-1">
                    <div className="h-4 bg-[#141520] rounded w-1/4 animate-pulse"></div>
                    <div className="space-y-2">
                      <div className="h-3 bg-[#141520] rounded w-full animate-pulse"></div>
                      <div className="h-3 bg-[#141520] rounded w-5/6 animate-pulse"></div>
                      <div className="h-3 bg-[#141520] rounded w-2/3 animate-pulse"></div>
                    </div>
                  </div>
                </div>
              )}

              {/* Critical Error Banner inside thread */}
              {generationError && (
                <div className="max-w-3xl mx-auto bg-red-950/20 border border-red-900/30 p-4 rounded-2xl flex gap-3 text-left">
                  <AlertCircle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-red-300 font-mono">CONNECTION DISRUPTED</h4>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">{generationError}</p>
                  </div>
                </div>
              )}

            </div>

            {/* FLOATING TEXT CHAT INPUT CONTAINER AT BOTTOM */}
            <div className="p-4 bg-gradient-to-t from-[#0d0e12] via-[#0d0e12] to-transparent sticky bottom-0 z-20">
              <div className="max-w-3xl mx-auto space-y-3">
                
                {/* 1. Parameter capsule row */}
                <div className="flex flex-wrap items-center justify-between gap-2.5 px-1 select-none">
                  <div className="flex items-center gap-2">
                    
                    {/* Active preset toggle */}
                    <div className="relative">
                      <button
                        onClick={() => setShowSettingsDropdown(!showSettingsDropdown)}
                        className="px-2.5 py-1 bg-[#13141d] hover:bg-[#1f2233] border border-[#1d1f2d] rounded-xl text-[11px] font-medium text-slate-300 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <SlidersHorizontal className="h-3 w-3 text-sky-400" />
                        <span>Preset: <strong>{isCustomTemplate ? "Hybrid Custom" : selectedPreset.name}</strong></span>
                        <ChevronDown className="h-3 w-3" />
                      </button>

                      {/* Float Dropdown for easy Prompt Tuning Selection on the fly */}
                      {showSettingsDropdown && (
                        <div className="absolute bottom-8 left-0 w-80 bg-[#141520] border border-[#242738] rounded-2xl p-4 shadow-xl z-50 text-left space-y-4">
                          <div className="flex justify-between items-center pb-2 border-b border-[#242738]">
                            <span className="text-xs font-bold text-white uppercase tracking-wider">Calibration Matrix</span>
                            <button
                              onClick={() => setShowSettingsDropdown(false)}
                              className="text-[10px] text-slate-400 hover:text-white"
                            >
                              Close
                            </button>
                          </div>

                          {/* Function choice inside popup */}
                          <div className="space-y-1">
                            <span className="text-[10px] font-mono text-slate-500 block uppercase">Mode Channel</span>
                            <select
                              value={selectedFunc}
                              onChange={(e) => handleFuncChange(e.target.value as AssistantFunctionType)}
                              className="w-full bg-[#0d0e12] border border-[#242738] rounded-lg p-1.5 text-xs text-white"
                            >
                              <option value="qa">Deep Q&A & Concepts</option>
                              <option value="summarize">Text Summarization</option>
                              <option value="creative">Creative Ideation</option>
                              <option value="advice">Productivity Advice</option>
                              <option value="tasks">AI Task Planner</option>
                            </select>
                          </div>

                          {/* Preset Choice inside popup */}
                          <div className="space-y-1">
                            <span className="text-[10px] font-mono text-slate-500 block uppercase">Template wrappers</span>
                            <div className="max-h-32 overflow-y-auto space-y-1 pr-1">
                              {PROMPT_PRESETS[selectedFunc]?.map((preset) => (
                                <button
                                  key={preset.id}
                                  onClick={() => {
                                    setSelectedPreset(preset);
                                    setIsCustomTemplate(false);
                                  }}
                                  className={`w-full text-left p-1.5 rounded text-[11px] transition-all ${
                                    selectedPreset.id === preset.id && !isCustomTemplate
                                      ? "bg-sky-500/10 text-sky-400 border border-sky-500/20"
                                      : "text-slate-400 hover:text-slate-200"
                                  }`}
                                >
                                  {preset.name} ({preset.tone})
                                </button>
                              ))}
                              <button
                                onClick={() => setIsCustomTemplate(true)}
                                className={`w-full text-left p-1.5 rounded text-[11px] transition-all ${
                                  isCustomTemplate ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20" : "text-slate-400 hover:text-slate-200"
                                }`}
                              >
                                Custom Hybrid Override
                              </button>
                            </div>
                          </div>

                          {/* Temperature Slider */}
                          <div className="space-y-1">
                            <div className="flex justify-between items-center text-[10px] font-mono text-slate-500 uppercase">
                              <span>Temperature Calibration</span>
                              <span className="text-sky-400 font-bold">{temperature}</span>
                            </div>
                            <input
                              type="range"
                              min="0.1"
                              max="1.2"
                              step="0.1"
                              value={temperature}
                              onChange={(e) => setTemperature(parseFloat(e.target.value))}
                              className="w-full accent-sky-400 cursor-ew-resize"
                            />
                          </div>

                          {/* Raw Wrapper toggles */}
                          {isCustomTemplate && (
                            <div className="bg-[#0d0e12] p-2.5 rounded-lg space-y-2 border border-slate-800">
                              <input
                                type="text"
                                placeholder="System Instruction Constraint..."
                                value={customSystem}
                                onChange={(e) => setCustomSystem(e.target.value)}
                                className="w-full bg-[#141520] text-xs text-slate-300 p-1.5 rounded border border-[#242738]"
                              />
                              <textarea
                                value={customTemplate}
                                onChange={(e) => setCustomTemplate(e.target.value)}
                                rows={2}
                                className="w-full bg-[#141520] text-xs text-slate-300 p-1.5 rounded border border-[#242738] font-mono"
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Fast Clear Output helper */}
                    {aiResult && (
                      <button
                        onClick={handleNewChat}
                        className="px-2.5 py-1 bg-[#13141d] hover:bg-[#1f2233] border border-[#1d1f2d] rounded-xl text-[11px] font-medium text-slate-400 hover:text-slate-200 transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <RotateCcw className="h-3 w-3" />
                        <span>Clear chat</span>
                      </button>
                    )}
                  </div>

                  <span className="text-[10px] font-mono text-slate-500 hidden sm:inline">
                    State Synchronizer: Secure Node Online
                  </span>
                </div>

                {/* Active Voice status/feedback strip */}
                {(isListening || micError) && (
                  <div className={`p-3 rounded-xl text-xs flex items-center justify-between gap-2 mb-2 border transition-all ${
                    micError 
                      ? "bg-red-500/10 text-red-500 border-red-500/20" 
                      : "bg-sky-500/10 text-sky-400 border-sky-500/20 animate-pulse"
                  }`}>
                    <div className="flex items-center gap-2">
                      {isListening ? (
                        <>
                          <span className="h-2 w-2 rounded-full bg-red-500 animate-ping shrink-0" />
                          <span className="font-mono text-[11px]">Listening... Say <b>"send message"</b> to submit or <b>"clear chat"</b> to reset.</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="h-3.5 w-3.5 text-red-400 shrink-0" />
                          <span className="font-sans leading-relaxed text-[11px]">{micError}</span>
                        </>
                      )}
                    </div>
                    {isListening && (
                      <button 
                        onClick={toggleListening}
                        className="text-[10px] underline hover:text-white cursor-pointer px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 font-mono"
                      >
                        Stop
                      </button>
                    )}
                  </div>
                )}

                {/* 2. ChatGPT style text-input container */}
                <div className="bg-[#141520] rounded-2xl border border-[#1d1f2d] p-3 focus-within:border-sky-500/50 focus-within:ring-1 focus-within:ring-sky-500/10 transition-all flex items-end gap-3 shadow-md">
                  <textarea
                    value={userContent}
                    onChange={(e) => setUserContent(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        runNovaAssistant();
                      }
                    }}
                    placeholder={
                      selectedFunc === "qa" ? "Ask a concept or factual question..." :
                      selectedFunc === "summarize" ? "Paste blocks of text or articles to condense..." :
                      selectedFunc === "creative" ? "Describe your creative story/poem constraints..." :
                      selectedFunc === "advice" ? "Enter a roadmap or productivity topic..." :
                      "Describe a coding project or objective to map directly into tasks..."
                    }
                    rows={Math.min(6, Math.max(1, userContent.split('\n').length))}
                    className="flex-1 bg-transparent border-0 outline-none resize-none text-slate-200 text-sm placeholder-slate-500 py-1 max-h-48 leading-relaxed focus:ring-0 focus:outline-none"
                  />
                  
                  {/* Voice / Audio controls container */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    {/* Microphone Dictation Trigger */}
                    <button
                      onClick={toggleListening}
                      type="button"
                      className={`h-9 w-9 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                        isListening
                          ? "bg-red-500 text-white shadow-lg shadow-red-500/30 hover:bg-red-600 animate-pulse"
                          : theme === "light"
                            ? "bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 border border-slate-200"
                            : "bg-[#1d1f2d] hover:bg-[#25283c] text-slate-400 hover:text-white border border-transparent"
                      }`}
                      title={isListening ? "Stop voice recognition" : "Speak to prompt (Speech-to-Text)"}
                    >
                      {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                    </button>

                    {/* Speech Settings Button */}
                    <button
                      onClick={() => setShowVoiceControlModal(true)}
                      type="button"
                      className={`h-9 w-9 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                        theme === "light"
                          ? "bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 border border-slate-200"
                          : "bg-[#1d1f2d] hover:bg-[#25283c] text-slate-400 hover:text-white border border-transparent"
                      }`}
                      title="Speech & Voice Commands Panel"
                    >
                      <Volume2 className="h-4 w-4" />
                    </button>

                    {/* Submit Button */}
                    <button
                      onClick={runNovaAssistant}
                      disabled={isGenerating || !userContent.trim()}
                      className={`h-9 w-9 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                        isGenerating || !userContent.trim()
                          ? "bg-[#1d1f2d] text-slate-600 cursor-not-allowed border border-[#1d1f2d]"
                          : "bg-gradient-to-tr from-sky-500 to-indigo-600 text-white hover:opacity-90 shadow-md shadow-sky-500/10"
                      }`}
                    >
                      {isGenerating ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Prompt preview capsule bar below input */}
                <div className="text-center">
                  <p className="text-[10px] text-slate-500 font-mono">
                    Press Enter to query Nova. Markdown & lists supported.
                  </p>
                </div>

              </div>
            </div>

          </div>
        )}

        {/* ----------------------------------------------- */}
        {/* TAB 2: KANBAN TASK SPRINT MANAGER */}
        {activeTab === "tasks" && (
          <div className="flex-1 overflow-y-auto px-6 py-8">
            <div className="max-w-6xl mx-auto space-y-8 text-left">
              
              {/* Kanban Heading block */}
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-[#1d1f2d] pb-4">
                <div>
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <ListChecks className="h-5 w-5 text-indigo-400" />
                    Sprints command board
                  </h3>
                  <p className="text-slate-400 text-xs mt-1">
                    Manage active objectives, toggle task checkpoints, and synchronize state metrics client-side.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  {/* Category filters */}
                  <div className="bg-[#141520] border border-[#1d1f2d] rounded-xl p-1 flex gap-1 text-xs">
                    {(["All", "Study", "Creative", "Work", "Life"] as const).map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setTaskFilterCategory(cat)}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                          taskFilterCategory === cat ? "bg-[#1f2233] text-white" : "text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Grid: Create Task Form (Left) & Task List Columns (Right) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* Form column (4 cols) */}
                <div className="lg:col-span-4 bg-[#141520] rounded-2xl border border-[#1d1f2d] p-5 space-y-4">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Plus className="h-4 w-4 text-sky-400" />
                    Manually Append Sprint
                  </h4>

                  <form onSubmit={handleAddTask} className="space-y-4 text-xs">
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-slate-400 uppercase">Task Name / Title</label>
                      <input
                        type="text"
                        value={newTaskTitle}
                        onChange={(e) => setNewTaskTitle(e.target.value)}
                        placeholder="e.g. Optimize temperature heuristics..."
                        className="w-full bg-[#0d0e12] border border-[#1d1f2d] rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-sky-500"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-slate-400 uppercase">Description / Details</label>
                      <textarea
                        value={newTaskDesc}
                        onChange={(e) => setNewTaskDesc(e.target.value)}
                        placeholder="Provide details about checkpoints..."
                        rows={2}
                        className="w-full bg-[#0d0e12] border border-[#1d1f2d] rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-sky-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono text-slate-400 uppercase">Priority</label>
                        <select
                          value={newTaskPriority}
                          onChange={(e) => setNewTaskPriority(e.target.value as TaskPriority)}
                          className="w-full bg-[#0d0e12] border border-[#1d1f2d] rounded-xl px-2.5 py-1.5 text-slate-300"
                        >
                          <option value="Low">Low</option>
                          <option value="Medium">Medium</option>
                          <option value="High">High</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-mono text-slate-400 uppercase">Category</label>
                        <select
                          value={newTaskCategory}
                          onChange={(e) => setNewTaskCategory(e.target.value as TaskCategory)}
                          className="w-full bg-[#0d0e12] border border-[#1d1f2d] rounded-xl px-2.5 py-1.5 text-slate-300"
                        >
                          <option value="Work">Work</option>
                          <option value="Study">Study</option>
                          <option value="Creative">Creative</option>
                          <option value="Life">Life</option>
                          <option value="Personal">Personal</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-slate-400 uppercase">Estimated Sprint Time (optional)</label>
                      <input
                        type="text"
                        value={newTaskEstimate}
                        onChange={(e) => setNewTaskEstimate(e.target.value)}
                        placeholder="e.g. 30 mins, 2 hours..."
                        className="w-full bg-[#0d0e12] border border-[#1d1f2d] rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-sky-500"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-sky-500 hover:bg-sky-450 text-slate-950 font-bold py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                    >
                      <Plus className="h-4 w-4 text-slate-950" />
                      Add Task to Board
                    </button>
                  </form>
                </div>

                {/* Sprints Column lists (8 cols) */}
                <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Column 1: Active Sprints */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center bg-[#141520]/60 p-3 rounded-xl border border-[#1d1f2d]">
                      <span className="text-xs font-bold text-slate-300 uppercase font-mono flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 bg-amber-400 rounded-full animate-pulse"></span>
                        Active Tasks ({filteredTasks.filter(t => t.status === "Active").length})
                      </span>
                    </div>

                    <div className="space-y-3.5 max-h-[500px] overflow-y-auto pr-1">
                      {filteredTasks.filter(t => t.status === "Active").length === 0 ? (
                        <div className="text-center py-12 text-slate-600 text-xs border border-dashed border-[#1d1f2d] rounded-2xl font-mono">
                          No active sprints. Use the AI Task Planner or Form to create some!
                        </div>
                      ) : (
                        filteredTasks.filter(t => t.status === "Active").map((task) => (
                          <div
                            key={task.id}
                            className="bg-[#141520] border border-[#1d1f2d] rounded-2xl p-4.5 space-y-3.5 transition-all hover:border-slate-800"
                          >
                            <div className="flex justify-between items-start gap-2">
                              <div className="space-y-1">
                                <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${
                                  task.priority === "High" ? "bg-red-500/10 text-red-400 border border-red-500/20" :
                                  task.priority === "Medium" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
                                  "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                }`}>
                                  {task.priority}
                                </span>
                                <h5 className="text-sm font-semibold text-white mt-1 leading-snug">{task.title}</h5>
                              </div>

                              <div className="flex gap-1.5">
                                <button
                                  onClick={() => toggleTaskStatus(task.id)}
                                  className="p-1 text-slate-400 hover:text-emerald-400 hover:bg-[#1a1c27] rounded transition-all cursor-pointer"
                                  title="Complete Task"
                                >
                                  <CheckSquare className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => deleteTask(task.id)}
                                  className="p-1 text-slate-500 hover:text-red-400 hover:bg-[#1a1c27] rounded transition-all cursor-pointer"
                                  title="Delete Task"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </div>

                            {task.description && (
                              <p className="text-xs text-slate-400 leading-relaxed font-sans">{task.description}</p>
                            )}

                            {/* Checklist Subtasks */}
                            <div className="space-y-1.5 pt-1.5 border-t border-[#1d1f2d]/50 text-xs">
                              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">Checkpoints:</span>
                              
                              {task.subtasks?.map(sub => (
                                <div key={sub.id} className="flex items-center gap-2">
                                  <button
                                    onClick={() => toggleSubtask(task.id, sub.id)}
                                    className="text-slate-400 hover:text-white shrink-0 cursor-pointer"
                                  >
                                    {sub.completed ? (
                                      <CheckCircle2 className="h-3.5 w-3.5 text-sky-400" />
                                    ) : (
                                      <Square className="h-3.5 w-3.5 text-slate-600" />
                                    )}
                                  </button>
                                  <span className={`text-[11px] leading-relaxed ${sub.completed ? 'line-through text-slate-500' : 'text-slate-300'}`}>
                                    {sub.title}
                                  </span>
                                </div>
                              ))}

                              {/* Quick Inline subtask add */}
                              <div className="flex gap-1.5 pt-1">
                                <input
                                  type="text"
                                  placeholder="New checkpoint..."
                                  value={newSubtaskTexts[task.id] || ""}
                                  onChange={(e) => setNewSubtaskTexts(prev => ({ ...prev, [task.id]: e.target.value }))}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                      e.preventDefault();
                                      handleAddSubtaskSubmit(task.id);
                                    }
                                  }}
                                  className="flex-1 bg-slate-950 text-xs text-slate-200 border border-[#1d1f2d] px-2 py-0.5 rounded focus:outline-none focus:border-sky-500"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleAddSubtaskSubmit(task.id)}
                                  className="px-2 bg-slate-850 hover:bg-slate-800 rounded text-sky-400 font-bold"
                                >
                                  +
                                </button>
                              </div>
                            </div>

                            <div className="flex justify-between items-center text-[10px] font-mono text-slate-500 pt-1">
                              <span>Category: <strong>{task.category}</strong></span>
                              {task.estimatedTime && (
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {task.estimatedTime}
                                </span>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Column 2: Completed Sprints */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center bg-[#141520]/60 p-3 rounded-xl border border-[#1d1f2d]">
                      <span className="text-xs font-bold text-emerald-400 uppercase font-mono flex items-center gap-1.5">
                        <CheckCircle2 className="h-4 w-4" />
                        Completed Sprints ({filteredTasks.filter(t => t.status === "Completed").length})
                      </span>
                    </div>

                    <div className="space-y-3.5 max-h-[500px] overflow-y-auto pr-1">
                      {filteredTasks.filter(t => t.status === "Completed").length === 0 ? (
                        <div className="text-center py-12 text-slate-600 text-xs border border-dashed border-[#1d1f2d] rounded-2xl font-mono">
                          Zero completed sprints. Finish checklists to populate statistics.
                        </div>
                      ) : (
                        filteredTasks.filter(t => t.status === "Completed").map((task) => (
                          <div
                            key={task.id}
                            className="bg-[#141520]/50 border border-[#1d1f2d]/60 rounded-2xl p-4.5 space-y-3 transition-all opacity-70"
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <h5 className="text-sm font-semibold text-slate-400 line-through leading-snug">{task.title}</h5>
                                <span className="text-[10px] font-mono text-slate-500 block">Completed Sprint Logged</span>
                              </div>

                              <div className="flex gap-1.5">
                                <button
                                  onClick={() => toggleTaskStatus(task.id)}
                                  className="p-1 text-emerald-400 hover:text-amber-400 hover:bg-[#1a1c27] rounded transition-all cursor-pointer"
                                  title="Reopen Task"
                                >
                                  <CheckSquare className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => deleteTask(task.id)}
                                  className="p-1 text-slate-500 hover:text-red-400 hover:bg-[#1a1c27] rounded transition-all cursor-pointer"
                                  title="Delete Task"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </div>

                            <p className="text-xs text-slate-500 line-through leading-relaxed">{task.description}</p>

                            <div className="flex justify-between items-center text-[10px] font-mono text-slate-600">
                              <span>Category: {task.category}</span>
                              <span>Completed</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                </div>

              </div>

            </div>
          </div>
        )}

        {/* ----------------------------------------------- */}
        {/* TAB 3: DIAGNOSTICS & TELEMETRY */}
        {activeTab === "diagnostics" && (
          <div className="flex-1 overflow-y-auto px-6 py-8">
            <div className="max-w-4xl mx-auto">
              <PromptEngineeringStats savedResponses={savedResponses} />
            </div>
          </div>
        )}

      </main>

      {/* 3. MULTI-DEVICE DATA SYNC DIALOG MODAL */}
      {showSyncModal && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4 z-50 text-left select-none">
          <div className="bg-[#141520] border border-[#242738] rounded-3xl p-6 max-w-lg w-full space-y-6">
            
            <div className="flex justify-between items-start pb-2 border-b border-[#242738]">
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white flex items-center gap-1.5">
                  <Share2 className="h-5 w-5 text-sky-400 animate-pulse" />
                  Multi-Device Synchronization
                </h3>
                <p className="text-xs text-slate-400">
                  Import or Export compiled JSON states to align chat histories and sprint workflows.
                </p>
              </div>
              <button
                onClick={() => setShowSyncModal(false)}
                className="text-slate-500 hover:text-white transition-all cursor-pointer p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              
              <div className="bg-[#0d0e12] p-4 rounded-2xl border border-[#1e2133] space-y-3">
                <h4 className="font-semibold text-slate-300">1. Synchronizer Vault Output (Download)</h4>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Trigger the download or copy the string representation of your vault storage file to paste inside other browsers/tabs.
                </p>
                <button
                  type="button"
                  onClick={handleExportState}
                  className="px-4 py-2 bg-sky-500 hover:bg-sky-450 text-slate-950 font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Download className="h-4 w-4" />
                  Generate and Download Vault State
                </button>
              </div>

              <div className="space-y-2">
                <label className="font-semibold text-slate-300 block">2. Ingest Synchronizer Vault (Import)</label>
                <textarea
                  value={importJson}
                  onChange={(e) => setImportJson(e.target.value)}
                  placeholder='Paste your backup JSON vault here (e.g. { "tasks": [...], "savedResponses": [...] })'
                  rows={4}
                  className="w-full bg-[#0d0e12] border border-[#242738] rounded-xl p-3 text-slate-200 placeholder-slate-500 font-mono text-xs focus:outline-none focus:border-sky-500 leading-relaxed"
                />
                
                <button
                  type="button"
                  onClick={handleImportState}
                  className="w-full bg-indigo-500 hover:bg-indigo-450 text-white font-bold py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                >
                  <Upload className="h-4 w-4" />
                  Ingest Vault JSON State
                </button>
              </div>

            </div>

            <div className="pt-2 border-t border-[#242738] flex justify-end">
              <button
                onClick={() => setShowSyncModal(false)}
                className="px-4 py-2 bg-[#1c1d29] hover:bg-[#25283b] text-slate-300 rounded-xl font-medium text-xs cursor-pointer transition-all"
              >
                Close Panel
              </button>
            </div>

          </div>
        </div>
      )}

      {/* --- 4. Interactive Voice Control Center Modal --- */}
      {showVoiceControlModal && (
        <div className="fixed inset-0 bg-[#0d0e12]/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in text-left">
          <div className="bg-[#141520] border border-[#1d1f2d] rounded-2xl max-w-lg w-full p-6 space-y-6 shadow-2xl relative">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center pb-3 border-b border-[#1d1f2d]">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-gradient-to-tr from-sky-500 to-indigo-500 rounded-xl">
                  <Mic className="h-4.5 w-4.5 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Nova Voice Command Center</h3>
                  <p className="text-[10px] font-mono text-sky-400 uppercase tracking-wider">SPEECH-TO-TEXT & AUDIO MANAGEMENT</p>
                </div>
              </div>
              <button
                onClick={() => setShowVoiceControlModal(false)}
                className="p-1 text-slate-500 hover:text-white hover:bg-[#1a1c27] rounded-lg transition-all cursor-pointer"
                title="Dismiss Panel"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            {/* Modal Content container */}
            <div className="space-y-5 max-h-[480px] overflow-y-auto pr-1">
              
              {/* SECTION A: TTS Options */}
              <div className="space-y-4">
                <h4 className="text-[11px] font-mono text-slate-400 uppercase tracking-widest border-l-2 border-indigo-500 pl-2">
                  Speech Synthesis (Text-to-Speech)
                </h4>

                {/* Auto Play Toggle Option */}
                <div className="flex items-center justify-between p-3.5 bg-[#0d0e12] rounded-xl border border-[#1d1f2d]/80">
                  <div className="space-y-0.5">
                    <span className="text-xs font-semibold text-slate-200 block">Auto-Speak Responses</span>
                    <span className="text-[10px] text-slate-500 leading-relaxed">
                      Automatically read aloud AI assistant outputs upon calibration.
                    </span>
                  </div>
                  <button
                    onClick={() => setTtsAutoPlay(prev => !prev)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono transition-all border ${
                      ttsAutoPlay 
                        ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/30" 
                        : "bg-[#141520] text-slate-400 border-[#1d1f2d]"
                    }`}
                  >
                    {ttsAutoPlay ? "Enabled" : "Disabled"}
                  </button>
                </div>

                {/* Voice Selection */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-slate-400 uppercase">Voice Profile Selection</label>
                  <select
                    value={selectedVoiceName}
                    onChange={(e) => setSelectedVoiceName(e.target.value)}
                    className="w-full bg-[#0d0e12] border border-[#1d1f2d] rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-sky-500"
                  >
                    {voices.length === 0 ? (
                      <option value="">Default System Voice (Loading...)</option>
                    ) : (
                      voices.map((voice) => (
                        <option key={voice.name} value={voice.name}>
                          {voice.name} ({voice.lang})
                        </option>
                      ))
                    )}
                  </select>
                </div>

                {/* Speech rate/speed slider */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 uppercase">
                    <span>Reading Velocity</span>
                    <span className="text-sky-400 font-bold">{ttsRate}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="2.0"
                    step="0.1"
                    value={ttsRate}
                    onChange={(e) => setTtsRate(parseFloat(e.target.value))}
                    className="w-full accent-indigo-500 bg-[#0d0e12] h-1.5 rounded-lg appearance-none cursor-ew-resize"
                  />
                </div>

                {/* Test synthesis */}
                <div className="flex gap-2">
                  <button
                    onClick={() => speakText("Testing the Nova voice calibration. Synthesis parameters online.")}
                    className="flex-1 py-2 bg-gradient-to-r from-sky-500 to-indigo-600 hover:opacity-95 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-md flex items-center justify-center gap-1.5"
                  >
                    <Volume2 className="h-4.5 w-4.5" />
                    Auditory Voice Calibration Test
                  </button>
                </div>
              </div>

              {/* SECTION B: Voice commands Cheat Sheet */}
              <div className="space-y-3.5 pt-3 border-t border-[#1d1f2d]">
                <h4 className="text-[11px] font-mono text-slate-400 uppercase tracking-widest border-l-2 border-fuchsia-500 pl-2">
                  Integrated Voice Command Dictionary
                </h4>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Toggle the microphone inside the chat input bar and say any of the following triggers to execute fast actions hands-free:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                  
                  <div className="p-2.5 bg-[#0d0e12] rounded-xl border border-[#1d1f2d]/60 space-y-1">
                    <span className="text-sky-400 font-bold block">"send message"</span>
                    <span className="text-[10px] text-slate-500">Submits current prompt</span>
                  </div>

                  <div className="p-2.5 bg-[#0d0e12] rounded-xl border border-[#1d1f2d]/60 space-y-1">
                    <span className="text-sky-400 font-bold block">"clear chat" / "new chat"</span>
                    <span className="text-[10px] text-slate-500">Resets prompt session</span>
                  </div>

                  <div className="p-2.5 bg-[#0d0e12] rounded-xl border border-[#1d1f2d]/60 space-y-1">
                    <span className="text-emerald-400 font-bold block">"light mode"</span>
                    <span className="text-[10px] text-slate-500">Switches to Light visual mode</span>
                  </div>

                  <div className="p-2.5 bg-[#0d0e12] rounded-xl border border-[#1d1f2d]/60 space-y-1">
                    <span className="text-indigo-400 font-bold block">"dark mode"</span>
                    <span className="text-[10px] text-slate-500">Switches to Dark visual mode</span>
                  </div>

                  <div className="p-2.5 bg-[#0d0e12] rounded-xl border border-[#1d1f2d]/60 space-y-1">
                    <span className="text-amber-400 font-bold block">"open tasks" / "sprints board"</span>
                    <span className="text-[10px] text-slate-500">Navigates to Kanban board</span>
                  </div>

                  <div className="p-2.5 bg-[#0d0e12] rounded-xl border border-[#1d1f2d]/60 space-y-1">
                    <span className="text-fuchsia-400 font-bold block">"open chat"</span>
                    <span className="text-[10px] text-slate-500">Returns to chat playground</span>
                  </div>

                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="pt-3 border-t border-[#1d1f2d] flex justify-end">
              <button
                onClick={() => setShowVoiceControlModal(false)}
                className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-sky-500 hover:opacity-95 text-white rounded-xl font-bold text-xs cursor-pointer transition-all shadow-md"
              >
                Calibration Confirmed
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
