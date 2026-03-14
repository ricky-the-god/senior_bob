"use client";

import { useEffect, useRef, useState } from "react";

import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ClipboardList,
  Copy,
  FileCode2,
  FileText,
  Package,
  RefreshCw,
  Sparkles,
  Terminal,
} from "lucide-react";

import type { OutputFile } from "@/lib/project-types";

import { type FileColorScheme, OutputFileCard } from "./output-file-card";
import { PrerequisiteChecklist } from "./prerequisite-checklist";

export type Prereqs = {
  workflow: boolean;
  features: boolean;
  integrations: boolean;
  diagram: boolean;
};

type Props = {
  projectId: string;
  prereqs: Prereqs;
  allPrereqsMet: boolean;
  initialFiles: OutputFile[] | null;
};

// Color scheme per file position
const FILE_COLOR_SCHEMES: FileColorScheme[] = [
  {
    icon: "text-sky-400",
    bg: "bg-sky-400/10",
    border: "border-border",
    badge: "bg-sky-400/10",
    badgeText: "text-sky-400",
    leftBorder: "border-l-sky-400/40",
  },
  {
    icon: "text-violet-400",
    bg: "bg-violet-400/10",
    border: "border-border",
    badge: "bg-violet-400/10",
    badgeText: "text-violet-400",
    leftBorder: "border-l-violet-400/40",
  },
  {
    icon: "text-emerald-400",
    bg: "bg-emerald-400/10",
    border: "border-border",
    badge: "bg-emerald-400/10",
    badgeText: "text-emerald-400",
    leftBorder: "border-l-emerald-400/40",
  },
  {
    icon: "text-amber-400",
    bg: "bg-amber-400/10",
    border: "border-border",
    badge: "bg-amber-400/10",
    badgeText: "text-amber-400",
    leftBorder: "border-l-amber-400/40",
  },
  {
    icon: "text-rose-400",
    bg: "bg-rose-400/10",
    border: "border-border",
    badge: "bg-rose-400/10",
    badgeText: "text-rose-400",
    leftBorder: "border-l-rose-400/40",
  },
];

const LOADING_MESSAGES = [
  "Reading your guided setup…",
  "Analyzing your system design…",
  "Inferring architecture decisions…",
  "Writing implementation context…",
  "Finalizing output files…",
];

function GeneratingState() {
  const [messageIndex, setMessageIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setMessageIndex((i) => (i + 1) % LOADING_MESSAGES.length);
        setVisible(true);
      }, 300);
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 py-24">
      {/* Animated icon cluster */}
      <div className="relative flex h-16 w-16 items-center justify-center">
        <div
          className="absolute inset-0 animate-ping rounded-full bg-foreground/5"
          style={{ animationDuration: "2s" }}
        />
        <div className="relative flex h-14 w-14 items-center justify-center rounded-full border border-border bg-card">
          <Sparkles className="size-6 animate-pulse text-foreground/60" />
        </div>
      </div>

      {/* Status message */}
      <div className="flex flex-col items-center gap-2 text-center">
        <p className="font-medium text-foreground text-sm">Generating your context pack</p>
        <p
          className="text-muted-foreground text-xs transition-opacity duration-300"
          style={{ opacity: visible ? 1 : 0 }}
        >
          {LOADING_MESSAGES[messageIndex]}
        </p>
      </div>

      {/* Progress dots */}
      <div className="flex items-center gap-1.5">
        {LOADING_MESSAGES.map((_, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: static list, order never changes
          <div
            key={i}
            className={`h-1 rounded-full transition-all duration-500 ${
              i <= messageIndex ? "w-4 bg-foreground/50" : "w-1.5 bg-foreground/15"
            }`}
          />
        ))}
      </div>

      <p className="max-w-xs text-center text-muted-foreground/50 text-xs leading-relaxed">
        Claude is reading your project context and writing implementation-ready files. This usually takes 20–40 seconds.
      </p>
    </div>
  );
}

function NextStepsBanner({ files }: { files: OutputFile[] }) {
  const [allCopied, setAllCopied] = useState(false);
  const [cmdCopied, setCmdCopied] = useState(false);

  const handleCopyAll = async () => {
    const combined = files.map((f) => `# ${f.filename}\n\n${f.content}`).join("\n\n---\n\n");
    await navigator.clipboard.writeText(combined);
    setAllCopied(true);
    setTimeout(() => setAllCopied(false), 2500);
  };

  const claudeCodeCmd = `claude "Read the files in this folder, starting with claude-code-prompt.md, then implement the plan."`;

  const handleCopyCmd = async () => {
    await navigator.clipboard.writeText(claudeCodeCmd);
    setCmdCopied(true);
    setTimeout(() => setCmdCopied(false), 2500);
  };

  // Find the architecture prompt and task prompt if they exist
  const archPrompt = files.find((f) => f.filename.includes("architecture") || f.filename.includes("claude-code"));
  const taskPrompt = files.find((f) => f.filename.includes("task"));

  return (
    <div className="overflow-hidden rounded-xl border border-emerald-500/20 bg-emerald-500/5">
      <div className="flex items-start justify-between gap-4 px-5 py-4">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex size-8 flex-shrink-0 items-center justify-center rounded-lg bg-emerald-500/10">
            <CheckCircle2 className="size-4 text-emerald-400" />
          </div>
          <div>
            <p className="font-medium text-foreground text-sm">Your context pack is ready</p>
            <p className="mt-0.5 text-muted-foreground text-xs">
              {files.length} files generated — copy them into your project folder, then use Claude Code
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleCopyAll}
          className={`flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 font-medium text-xs transition-all ${
            allCopied ? "bg-emerald-500/20 text-emerald-400" : "bg-foreground text-background hover:opacity-80"
          }`}
        >
          {allCopied ? (
            <>
              <CheckCircle2 className="size-3.5" />
              Copied all
            </>
          ) : (
            <>
              <Copy className="size-3.5" />
              Copy all files
            </>
          )}
        </button>
      </div>

      {/* Next steps */}
      <div className="grid grid-cols-1 divide-y divide-emerald-500/10 border-emerald-500/10 border-t sm:grid-cols-2 sm:divide-x sm:divide-y-0">
        <div className="flex items-start gap-3 px-5 py-4">
          <div className="mt-0.5 flex size-6 flex-shrink-0 items-center justify-center rounded-full bg-emerald-500/10 font-bold text-[10px] text-emerald-400">
            1
          </div>
          <div className="min-w-0 flex-1">
            <div className="mb-1.5 flex items-center gap-1.5">
              <Terminal className="size-3 text-muted-foreground/60" />
              <p className="font-medium text-foreground text-xs">Copy files into your project folder</p>
            </div>
            <p className="mb-2 text-[11px] text-muted-foreground leading-relaxed">
              Save the files from this pack into your repo root (or a{" "}
              <span className="font-mono text-foreground/60">.context/</span> subfolder). Copy{" "}
              <span className="font-mono text-foreground/70">{archPrompt?.filename ?? "claude-code-prompt.md"}</span>{" "}
              first — it&apos;s the entry point.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 px-5 py-4">
          <div className="mt-0.5 flex size-6 flex-shrink-0 items-center justify-center rounded-full bg-emerald-500/10 font-bold text-[10px] text-emerald-400">
            2
          </div>
          <div className="min-w-0 flex-1">
            <div className="mb-1.5 flex items-center gap-1.5">
              <ClipboardList className="size-3 text-muted-foreground/60" />
              <p className="font-medium text-foreground text-xs">Start a Claude Code session</p>
            </div>
            <p className="mb-2 text-[11px] text-muted-foreground leading-relaxed">
              Open your terminal in the project folder and run:
            </p>
            <div className="flex items-center gap-2 rounded-md border border-emerald-500/15 bg-background/40 px-2.5 py-1.5">
              <code className="flex-1 truncate font-mono text-[10px] text-foreground/70">{claudeCodeCmd}</code>
              <button
                type="button"
                onClick={handleCopyCmd}
                className="flex-shrink-0 text-muted-foreground/50 transition-colors hover:text-emerald-400"
                title="Copy command"
              >
                {cmdCopied ? <CheckCircle2 className="size-3 text-emerald-400" /> : <Copy className="size-3" />}
              </button>
            </div>
            {taskPrompt && (
              <p className="mt-2 text-[10px] text-muted-foreground/50 leading-relaxed">
                For sprint-level sessions, use{" "}
                <span className="font-mono text-foreground/50">{taskPrompt.filename}</span> instead.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ onGenerate }: { onGenerate: () => void }) {
  const outputFiles = [
    {
      icon: FileText,
      name: "project-overview.md",
      color: "text-sky-400",
      bg: "bg-sky-400/10",
      leftBorder: "border-l-sky-400/40",
    },
    {
      icon: FileText,
      name: "requirements.md",
      color: "text-violet-400",
      bg: "bg-violet-400/10",
      leftBorder: "border-l-violet-400/40",
    },
    {
      icon: FileText,
      name: "system-design.md",
      color: "text-emerald-400",
      bg: "bg-emerald-400/10",
      leftBorder: "border-l-emerald-400/40",
    },
    {
      icon: BookOpen,
      name: "implementation-plan.md",
      color: "text-amber-400",
      bg: "bg-amber-400/10",
      leftBorder: "border-l-amber-400/40",
    },
    {
      icon: FileCode2,
      name: "claude-code-prompt.md",
      color: "text-rose-400",
      bg: "bg-rose-400/10",
      leftBorder: "border-l-rose-400/40",
    },
  ];

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-16">
      <div className="w-full max-w-md">
        {/* Icon with subtle glow */}
        <div className="relative mb-5 inline-flex">
          <div className="absolute inset-0 rounded-xl bg-foreground/5 blur-md" />
          <div className="relative flex h-14 w-14 items-center justify-center rounded-xl border border-border bg-card">
            <Package className="size-6 text-foreground/50" />
          </div>
        </div>

        <h2 className="mb-1 font-semibold text-foreground text-lg tracking-tight">Ready to generate your pack</h2>
        <p className="mb-5 text-muted-foreground text-sm leading-relaxed">
          Claude will read your project context — guided setup, system design, and tasks — and produce{" "}
          <span className="font-medium text-foreground">5 structured files</span> ready to drop into Claude Code.
        </p>

        {/* File preview with color accents */}
        <div className="mb-6 overflow-hidden rounded-xl border border-border bg-card">
          <div className="border-border border-b px-4 py-2.5">
            <p className="font-medium text-muted-foreground text-xs">Files that will be generated</p>
          </div>
          <ul className="divide-y divide-border">
            {outputFiles.map(({ icon: Icon, name, color, bg, leftBorder }) => (
              <li key={name} className={`flex items-center gap-3 border-l-2 px-4 py-2.5 ${leftBorder}`}>
                <div className={`flex size-6 flex-shrink-0 items-center justify-center rounded ${bg}`}>
                  <Icon className={`size-3 ${color}`} />
                </div>
                <span className="font-mono text-muted-foreground text-xs">{name}</span>
              </li>
            ))}
          </ul>
        </div>

        <button
          type="button"
          onClick={onGenerate}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-foreground px-5 py-3 font-semibold text-background text-sm transition-opacity hover:opacity-85 active:opacity-70"
        >
          <Sparkles className="size-4" />
          Generate Output Pack
          <ArrowRight className="size-4" />
        </button>
        <p className="mt-3 text-center text-[11px] text-muted-foreground/40">
          Powered by Claude · Usually takes 20–40 seconds
        </p>
      </div>
    </div>
  );
}

export function OutputPackShell({ projectId, prereqs, allPrereqsMet, initialFiles }: Props) {
  const [files, setFiles] = useState<OutputFile[] | null>(initialFiles);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const filesRef = useRef<HTMLDivElement>(null);

  if (!allPrereqsMet) {
    return <PrerequisiteChecklist prereqs={prereqs} projectId={projectId} />;
  }

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      const res = await fetch("/api/output-pack/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId }),
      });
      if (!res.ok) {
        const text = await res.text();
        setError(text || "Generation failed. Please try again.");
        return;
      }
      const { files: generated } = (await res.json()) as { files: OutputFile[] };
      setFiles(generated);
      // Scroll to top of files after generation
      setTimeout(() => {
        filesRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRegenerate = async (_filename: string) => {
    await handleGenerate();
  };

  const hasFiles = !isGenerating && files && files.length > 0;

  return (
    <div className="flex flex-1 flex-col overflow-y-auto">
      {/* Page header */}
      <div className="flex items-start justify-between border-border border-b px-6 py-4">
        <div>
          <h1 className="font-semibold text-foreground text-lg tracking-tight">Output Pack</h1>
          <p className="mt-0.5 text-muted-foreground text-xs">Implementation-ready files for Claude Code</p>
        </div>
        {hasFiles && (
          <button
            type="button"
            onClick={handleGenerate}
            disabled={isGenerating}
            className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm transition-colors hover:bg-foreground/[0.04] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw className={`size-3.5 text-muted-foreground/60 ${isGenerating ? "animate-spin" : ""}`} />
            <span className="text-muted-foreground text-xs">Regenerate All</span>
          </button>
        )}
      </div>

      {/* Error banner */}
      {error && (
        <div className="mx-6 mt-4 rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-3 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Generating state */}
      {isGenerating && <GeneratingState />}

      {/* Empty state */}
      {!isGenerating && !files && <EmptyState onGenerate={handleGenerate} />}

      {/* Files */}
      {hasFiles && (
        <div ref={filesRef} className="flex flex-col gap-5 p-6">
          {/* Next steps banner */}
          <NextStepsBanner files={files} />

          {/* File cards */}
          <div className="flex flex-col gap-3">
            {files.map((file, i) => (
              <OutputFileCard
                key={file.filename}
                file={file}
                onRegenerate={handleRegenerate}
                isRegenerating={isGenerating}
                colorScheme={FILE_COLOR_SCHEMES[i % FILE_COLOR_SCHEMES.length]}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
