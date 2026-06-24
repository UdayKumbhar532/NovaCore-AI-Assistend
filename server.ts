import express from "express";
import path from "path";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
app.use(express.json());

const PORT = 3000;

// Initialize Gemini Client Lazily to prevent crash on startup if key is missing
let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is not set. Please configure it in the Secrets panel of AI Studio.");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// API Endpoints
app.post("/api/nova/assistant", async (req, res) => {
  try {
    const { functionType, promptTemplate, userContent, temperature = 0.7, systemInstruction } = req.body;

    if (!userContent) {
      res.status(400).json({ error: "User content is required." });
      return;
    }

    const ai = getAiClient();

    // Construct the actual message combining prompt template and user content
    // For a prompt engineering tool, we show the user the template and substitute the userContent in.
    let finalPrompt = "";
    if (promptTemplate) {
      // Replace placeholder if present, or append
      if (promptTemplate.includes("[input]")) {
        finalPrompt = promptTemplate.replace("[input]", userContent);
      } else if (promptTemplate.includes("[text]")) {
        finalPrompt = promptTemplate.replace("[text]", userContent);
      } else {
        finalPrompt = `${promptTemplate}\n\nUser Input:\n${userContent}`;
      }
    } else {
      finalPrompt = userContent;
    }

    const isTaskGenerator = functionType === "tasks";

    const config: any = {
      temperature,
    };

    if (systemInstruction) {
      config.systemInstruction = systemInstruction;
    }

    if (isTaskGenerator) {
      config.responseMimeType = "application/json";
      config.responseSchema = {
        type: Type.OBJECT,
        properties: {
          tasks: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING, description: "Short, actionable name of the task" },
                description: { type: Type.STRING, description: "Detailed description of what needs to be done" },
                priority: { type: Type.STRING, description: "Low, Medium, or High priority level" },
                category: { type: Type.STRING, description: "Category or project label, e.g. Study, Creative, Personal, Work" },
                estimatedTime: { type: Type.STRING, description: "Estimate of how long it takes, e.g., '30 mins', '2 hours'" }
              },
              required: ["title", "description", "priority", "category"]
            }
          }
        },
        required: ["tasks"]
      };
    }

    const modelsToTry = ["gemini-3.5-flash", "gemini-flash-latest", "gemini-3.1-flash-lite"];
    let response: any = null;
    let lastError: any = null;

    for (const modelName of modelsToTry) {
      let attempts = 2;
      let delay = 300;
      for (let attempt = 1; attempt <= attempts; attempt++) {
        try {
          response = await ai.models.generateContent({
            model: modelName,
            contents: finalPrompt,
            config,
          });
          break; // Succeeded! Break the retry loop
        } catch (error: any) {
          lastError = error;
          const errorMsg = error?.message || "";
          const errorStatus = error?.status || "";
          const errorCode = error?.code || error?.status || 0;
          
          const isOverloaded = 
            errorStatus === "UNAVAILABLE" || 
            errorCode === 503 ||
            errorMsg.includes("503") || 
            errorMsg.toLowerCase().includes("high demand") || 
            errorMsg.toLowerCase().includes("temporary") ||
            errorMsg.toLowerCase().includes("overloaded") ||
            errorMsg.toLowerCase().includes("unavailable");

          const isRateLimited = 
            errorCode === 429 ||
            errorMsg.includes("429") ||
            errorMsg.toLowerCase().includes("rate limit");

          // If the model is overloaded, don't waste time retrying it - immediately break and try the next fallback model!
          if (isOverloaded) {
            console.warn(`[Nova Core Fallback] Model ${modelName} is overloaded/unavailable. Skipping retries, switching immediately to next fallback...`);
            break; 
          }

          if (isRateLimited && attempt < attempts) {
            console.warn(`[Nova Core Retry] Model ${modelName} is rate-limited on attempt ${attempt}. Retrying in ${delay}ms...`);
            await new Promise((resolve) => setTimeout(resolve, delay));
            delay *= 1.5;
          } else {
            console.warn(`[Nova Core Fallback] Model ${modelName} failed on attempt ${attempt} with error:`, errorMsg, ". Trying next fallback model if available...");
            break; 
          }
        }
      }
      if (response) {
        break; // Successfully got a response from one of the models
      }
    }

    if (!response) {
      throw lastError || new Error("All available AI models are currently saturated. Please try again in a few moments.");
    }

    const text = response.text || "";

    res.json({
      success: true,
      text: text,
      finalPromptUsed: finalPrompt,
    });
  } catch (error: any) {
    console.error("Error in Nova Assistant:", error);
    res.status(500).json({
      success: false,
      error: error.message || "An unexpected error occurred while communicating with the AI.",
    });
  }
});

// Configure Vite or Static Assets serving based on environment
async function setupApp() {
  if (process.env.NODE_ENV !== "production") {
    // Import Vite on the fly so it is only loaded in dev mode
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`NovaCore AI running on port ${PORT}`);
  });
}

setupApp();
