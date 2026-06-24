import { SavedResponse } from "../types";
import { Award, CheckCircle2, TrendingUp, HelpCircle, Lightbulb, Shield, Sliders, Zap } from "lucide-react";

interface PromptEngineeringStatsProps {
  savedResponses: SavedResponse[];
}

export default function PromptEngineeringStats({ savedResponses }: PromptEngineeringStatsProps) {
  // Compute metrics
  const totalQueries = savedResponses.length;
  const ratedQueries = savedResponses.filter(r => r.helpful !== undefined);
  const helpfulQueries = ratedQueries.filter(r => r.helpful === true);
  const helpfulnessScore = ratedQueries.length > 0 
    ? Math.round((helpfulQueries.length / ratedQueries.length) * 100) 
    : 0;

  // Compute category distribution
  const typeCount = savedResponses.reduce((acc, curr) => {
    acc[curr.functionType] = (acc[curr.functionType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const getPercentage = (type: string) => {
    if (totalQueries === 0) return 0;
    return Math.round(((typeCount[type] || 0) / totalQueries) * 100);
  };

  const promptEngineeringTips = [
    {
      title: "Context Injection & [input] Placement",
      icon: Zap,
      desc: "Replacing placeholder tags in your templates dynamically maps raw user inputs. Position [input] logically to isolate context from instructions.",
      color: "text-amber-400 bg-amber-500/10 border-amber-500/20"
    },
    {
      title: "The Power of Role-Play Constraints",
      icon: Shield,
      desc: "Assigning custom System Instructions grounds model weights in a specific professional domain, suppressing hallucinations and verbal noise.",
      color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
    },
    {
      title: "Calibrating Temperature Sliders",
      icon: Sliders,
      desc: "Lower values (0.1 - 0.3) force logical determinism, ideal for parsing data. Higher values (0.8 - 1.0) ignite stochastic creativity for narrative draftings.",
      color: "text-sky-400 bg-sky-500/10 border-sky-500/20"
    },
    {
      title: "Mitigating Bad Output (Negative Feedback)",
      icon: Lightbulb,
      desc: "When feedback is negative, programmatically append refining delimiters like 'Be direct', 'Explain why before answering', or structured JSON schemas.",
      color: "text-fuchsia-400 bg-fuchsia-500/10 border-fuchsia-500/20"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Title block */}
      <div className="text-left border-b border-slate-800 pb-4">
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <Award className="h-5 w-5 text-sky-400" />
          Prompt Diagnostics & Analysis
        </h2>
        <p className="text-slate-400 text-xs mt-1">
          Review optimization telemetry, user feedback metrics, and structural guidance guidelines.
        </p>
      </div>

      {/* Grid containing key telemetry */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Metric 1 */}
        <div className="bg-slate-900/60 rounded-xl p-4 border border-slate-800/80 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Helpfulness Score</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="mt-4 text-left">
            <div className="text-3xl font-extrabold text-slate-100 font-mono">
              {ratedQueries.length > 0 ? `${helpfulnessScore}%` : "—"}
            </div>
            <p className="text-slate-400 text-[11px] mt-1">
              Based on {ratedQueries.length} rated prompt iterations ({helpfulQueries.length} approved).
            </p>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-slate-900/60 rounded-xl p-4 border border-slate-800/80 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Total Evaluated Runs</span>
            <TrendingUp className="h-4 w-4 text-sky-400" />
          </div>
          <div className="mt-4 text-left">
            <div className="text-3xl font-extrabold text-slate-100 font-mono">{totalQueries}</div>
            <p className="text-slate-400 text-[11px] mt-1">
              Active local cache and state history synchronized successfully across sessions.
            </p>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-slate-900/60 rounded-xl p-4 border border-slate-800/80 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Cache Synchronizer</span>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <span className="h-1.5 w-1.5 rounded-full bg-sky-400 animate-pulse"></span>
              OFFLINE SECURE
            </span>
          </div>
          <div className="mt-4 text-left">
            <div className="text-lg font-bold text-slate-200">LocalState Engine</div>
            <p className="text-slate-400 text-[11px] mt-1">
              Data strictly isolated client-side. Persistent JSON storage guarantees total multi-device safety.
            </p>
          </div>
        </div>
      </div>

      {/* Breakdown distribution */}
      <div className="bg-slate-900/30 rounded-xl p-5 border border-slate-800/60 text-left">
        <h3 className="text-sm font-semibold text-slate-200 mb-4 flex items-center gap-2">
          <HelpCircle className="h-4 w-4 text-slate-400" />
          Function Category Distribution
        </h3>
        {totalQueries === 0 ? (
          <p className="text-slate-500 text-xs font-mono text-center py-6">
            Execute prompts inside the workspace to populate telemetric distribution data.
          </p>
        ) : (
          <div className="space-y-3 font-mono text-xs">
            {/* Q&A */}
            <div>
              <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                <span>DEEP Q&A & CONCEPT MAPS</span>
                <span>{typeCount["qa"] || 0} ({getPercentage("qa")}%)</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-sky-400 h-full rounded-full transition-all duration-500" style={{ width: `${getPercentage("qa")}%` }}></div>
              </div>
            </div>

            {/* Summarize */}
            <div>
              <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                <span>TEXT SUMMARIZATION</span>
                <span>{typeCount["summarize"] || 0} ({getPercentage("summarize")}%)</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-emerald-400 h-full rounded-full transition-all duration-500" style={{ width: `${getPercentage("summarize")}%` }}></div>
              </div>
            </div>

            {/* Creative */}
            <div>
              <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                <span>CREATIVE WRITING & IDEATION</span>
                <span>{typeCount["creative"] || 0} ({getPercentage("creative")}%)</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-fuchsia-400 h-full rounded-full transition-all duration-500" style={{ width: `${getPercentage("creative")}%` }}></div>
              </div>
            </div>

            {/* Productivity Advice */}
            <div>
              <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                <span>PRODUCTIVITY & ROADMAP STUDY</span>
                <span>{typeCount["advice"] || 0} ({getPercentage("advice")}%)</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-amber-400 h-full rounded-full transition-all duration-500" style={{ width: `${getPercentage("advice")}%` }}></div>
              </div>
            </div>

            {/* Task Planning */}
            <div>
              <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                <span>AI TASK GENERATIONS</span>
                <span>{typeCount["tasks"] || 0} ({getPercentage("tasks")}%)</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-red-400 h-full rounded-full transition-all duration-500" style={{ width: `${getPercentage("tasks")}%` }}></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Prompt engineering lessons */}
      <div className="space-y-3 text-left">
        <h3 className="text-sm font-semibold text-slate-200">
          Core Prompt Engineering Guidelines
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {promptEngineeringTips.map((tip, i) => {
            const Icon = tip.icon;
            return (
              <div key={i} className="bg-slate-900/40 rounded-xl p-4 border border-slate-800/80 flex gap-3">
                <div className={`p-2 rounded-lg h-fit border shrink-0 ${tip.color}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-slate-200">{tip.title}</h4>
                  <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                    {tip.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
