import React from "react";

interface MarkdownRendererProps {
  content: string;
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  if (!content) return null;

  // Simple, elegant, custom parser for basic Markdown formatting:
  // - Headers: #, ##, ###
  // - Bold: **text**
  // - Bullet points: - item or * item
  // - Inline code: `code`
  // - Code blocks: ```language ... ```
  // - Numbered lists: 1. Item
  // - Line breaks

  const lines = content.split("\n");
  let inCodeBlock = false;
  let codeBlockLines: string[] = [];
  let codeBlockLang = "";

  const parsedElements: React.ReactNode[] = [];

  const parseInlineStyles = (text: string): React.ReactNode[] => {
    // Basic bold ** and inline code ` parser
    const parts: React.ReactNode[] = [];
    let currentIdx = 0;

    // Use regex to find markdown tokens
    const tokenRegex = /(\*\*|`)(.*?)\1/g;
    let match;

    while ((match = tokenRegex.exec(text)) !== null) {
      const matchIdx = match.index;
      // Append normal text before match
      if (matchIdx > currentIdx) {
        parts.push(text.substring(currentIdx, matchIdx));
      }

      const token = match[1];
      const tokenValue = match[2];

      if (token === "**") {
        parts.push(
          <strong key={matchIdx} className="font-semibold text-slate-100">
            {tokenValue}
          </strong>
        );
      } else if (token === "`") {
        parts.push(
          <code
            key={matchIdx}
            className="px-1.5 py-0.5 mx-0.5 rounded font-mono text-xs bg-slate-800 text-sky-400 border border-slate-700/50"
          >
            {tokenValue}
          </code>
        );
      }

      currentIdx = tokenRegex.lastIndex;
    }

    if (currentIdx < text.length) {
      parts.push(text.substring(currentIdx));
    }

    return parts.length > 0 ? parts : [text];
  };

  lines.forEach((line, idx) => {
    // Handle code blocks
    if (line.trim().startsWith("```")) {
      if (inCodeBlock) {
        // End of code block
        inCodeBlock = false;
        parsedElements.push(
          <div key={`code-${idx}`} className="my-3 rounded-lg overflow-hidden border border-slate-800">
            {codeBlockLang && (
              <div className="bg-slate-900 px-4 py-1.5 text-[10px] font-mono text-slate-400 border-b border-slate-800 flex justify-between items-center">
                <span>{codeBlockLang.toUpperCase()}</span>
                <span className="text-[9px]">RAW CODE</span>
              </div>
            )}
            <pre className="bg-slate-950/90 p-4 font-mono text-xs text-slate-300 overflow-x-auto leading-relaxed">
              <code>{codeBlockLines.join("\n")}</code>
            </pre>
          </div>
        );
        codeBlockLines = [];
        codeBlockLang = "";
      } else {
        // Start of code block
        inCodeBlock = true;
        codeBlockLang = line.trim().substring(3) || "text";
      }
      return;
    }

    if (inCodeBlock) {
      codeBlockLines.push(line);
      return;
    }

    const trimmedLine = line.trim();

    // Handle Headers
    if (trimmedLine.startsWith("# ")) {
      parsedElements.push(
        <h1 key={idx} className="text-xl font-bold text-slate-100 mt-5 mb-2 border-b border-slate-800 pb-1 tracking-tight">
          {parseInlineStyles(trimmedLine.substring(2))}
        </h1>
      );
    } else if (trimmedLine.startsWith("## ")) {
      parsedElements.push(
        <h2 key={idx} className="text-lg font-semibold text-slate-100 mt-4 mb-2 flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-sky-400"></span>
          {parseInlineStyles(trimmedLine.substring(3))}
        </h2>
      );
    } else if (trimmedLine.startsWith("### ")) {
      parsedElements.push(
        <h3 key={idx} className="text-base font-semibold text-slate-200 mt-3 mb-1">
          {parseInlineStyles(trimmedLine.substring(4))}
        </h3>
      );
    }
    // Handle Bullet points
    else if (trimmedLine.startsWith("- ") || trimmedLine.startsWith("* ")) {
      parsedElements.push(
        <ul key={idx} className="list-none pl-4 my-1.5">
          <li className="flex items-start gap-2.5 text-slate-300 text-sm leading-relaxed">
            <span className="text-sky-500 mt-1.5 select-none text-[8px]">•</span>
            <span>{parseInlineStyles(trimmedLine.substring(2))}</span>
          </li>
        </ul>
      );
    }
    // Handle checklists
    else if (trimmedLine.match(/^-\s*\[\s*[xX ]\s*\]/)) {
      const checked = trimmedLine.toLowerCase().includes("[x]");
      const text = trimmedLine.replace(/^-\s*\[\s*[xX ]\s*\]/, "").trim();
      parsedElements.push(
        <div key={idx} className="flex items-center gap-2 my-1 pl-4">
          <span className={`h-4 w-4 rounded border flex items-center justify-center text-[10px] ${
            checked ? 'bg-sky-500/20 border-sky-400 text-sky-400' : 'border-slate-700 text-slate-500'
          }`}>
            {checked ? "✓" : ""}
          </span>
          <span className={`text-sm ${checked ? 'text-slate-500 line-through' : 'text-slate-300'}`}>
            {parseInlineStyles(text)}
          </span>
        </div>
      );
    }
    // Handle Numbered Lists
    else if (/^\d+\.\s/.test(trimmedLine)) {
      const match = trimmedLine.match(/^(\d+)\.\s(.*)/);
      const num = match ? match[1] : "1";
      const text = match ? match[2] : trimmedLine;
      parsedElements.push(
        <div key={idx} className="flex items-start gap-2 my-1.5 pl-2 text-sm text-slate-300 leading-relaxed">
          <span className="font-mono text-sky-400/80 text-xs font-semibold mt-0.5 min-w-[16px]">{num}.</span>
          <span>{parseInlineStyles(text)}</span>
        </div>
      );
    }
    // Normal paragraphs
    else if (trimmedLine === "") {
      parsedElements.push(<div key={idx} className="h-2"></div>);
    } else {
      parsedElements.push(
        <p key={idx} className="text-sm text-slate-300 leading-relaxed my-1">
          {parseInlineStyles(line)}
        </p>
      );
    }
  });

  return (
    <div className="font-sans space-y-0.5 select-text text-left max-w-full overflow-hidden break-words">
      {parsedElements}
    </div>
  );
}
