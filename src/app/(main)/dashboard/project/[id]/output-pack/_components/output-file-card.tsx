"use client";

import { useState } from "react";

import { Check, ChevronDown, ChevronUp, Copy, FileCode2, FileText, RefreshCw } from "lucide-react";

import type { OutputFile } from "@/lib/project-types";

type Props = {
  file: OutputFile;
  onRegenerate: (filename: string) => void;
  isRegenerating?: boolean;
  colorScheme: FileColorScheme;
};

export type FileColorScheme = {
  icon: string;
  bg: string;
  border: string;
  badge: string;
  badgeText: string;
  leftBorder: string;
};

const PREVIEW_LINES = 12;

function formatRelativeTime(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHrs = Math.floor(diffMins / 60);
  if (diffHrs < 24) return `${diffHrs}h ago`;
  return `${Math.floor(diffHrs / 24)}d ago`;
}

function FileIcon({ filename, className }: { filename: string; className?: string }) {
  if (filename.includes("claude-code")) return <FileCode2 className={className} />;
  return <FileText className={className} />;
}

/** Renders a single line of markdown with basic header styling */
function MarkdownLine({ line }: { line: string }) {
  if (line.startsWith("### ")) {
    return <span className="mt-2 mb-0.5 block font-semibold text-[11px] text-foreground/80">{line.slice(4)}</span>;
  }
  if (line.startsWith("## ")) {
    return <span className="mt-3 mb-0.5 block font-semibold text-foreground/90 text-xs">{line.slice(3)}</span>;
  }
  if (line.startsWith("# ")) {
    return <span className="mt-1 mb-1 block font-bold text-foreground text-sm">{line.slice(2)}</span>;
  }
  if (line.startsWith("---") || line.startsWith("===")) {
    return <span className="my-1.5 block border-border/30 border-t" />;
  }
  if (line.startsWith("- ") || line.startsWith("* ")) {
    return <span className="block pl-2 text-[11px] text-foreground/55 leading-relaxed">· {line.slice(2)}</span>;
  }
  if (line === "") {
    return <span className="block h-1.5" />;
  }
  return <span className="block text-[11px] text-foreground/55 leading-relaxed">{line}</span>;
}

/** Renders markdown content with styled headers */
function MarkdownPreview({ content }: { content: string }) {
  const lines = content.split("\n");
  return (
    <div className="px-4 py-3.5">
      {lines.map((line, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: line index is stable — content is read-only
        <MarkdownLine key={i} line={line} />
      ))}
    </div>
  );
}

export function OutputFileCard({ file, onRegenerate, isRegenerating = false, colorScheme }: Props) {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const lines = file.content.split("\n");
  const previewLines = lines.slice(0, PREVIEW_LINES);
  const hasMore = lines.length > PREVIEW_LINES;
  const displayLines = expanded ? lines : previewLines;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(file.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lineCount = lines.length;
  const charCount = file.content.length;
  const generatedAt = formatRelativeTime(file.generated_at);

  return (
    <div
      className={`overflow-hidden rounded-xl border border-l-2 bg-card transition-all ${colorScheme.leftBorder} ${colorScheme.border}`}
    >
      {/* Header */}
      <div className="flex items-center gap-3 border-border border-b px-4 py-3">
        <div className={`flex size-7 flex-shrink-0 items-center justify-center rounded-lg ${colorScheme.bg}`}>
          <FileIcon filename={file.filename} className={`size-3.5 ${colorScheme.icon}`} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium font-mono text-foreground text-sm">{file.filename}</p>
          <p className="mt-0.5 text-[10px] text-muted-foreground/60">
            {lineCount} lines · {charCount > 1000 ? `${Math.round(charCount / 1000)}k` : charCount} chars · Generated{" "}
            {generatedAt}
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => onRegenerate(file.filename)}
            disabled={isRegenerating}
            title="Regenerate this file"
            className="flex items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1.5 text-xs transition-colors hover:bg-foreground/[0.04] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw className={`size-3 text-muted-foreground/60 ${isRegenerating ? "animate-spin" : ""}`} />
            <span className="text-muted-foreground">Regen</span>
          </button>
          <button
            type="button"
            onClick={handleCopy}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 font-medium text-xs transition-all ${
              copied
                ? "border border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                : `${colorScheme.badge} ${colorScheme.badgeText} border border-transparent hover:opacity-80`
            }`}
          >
            {copied ? (
              <>
                <Check className="size-3" />
                Copied
              </>
            ) : (
              <>
                <Copy className="size-3" />
                Copy
              </>
            )}
          </button>
        </div>
      </div>

      {/* Content preview — markdown-aware rendering */}
      <div className="relative overflow-hidden" style={{ maxHeight: expanded ? "none" : "220px" }}>
        <MarkdownPreview content={displayLines.join("\n")} />

        {/* Gradient fade when collapsed */}
        {!expanded && hasMore && (
          <div className="pointer-events-none absolute right-0 bottom-0 left-0 h-14 bg-gradient-to-t from-card to-transparent" />
        )}
      </div>

      {/* Expand/collapse toggle */}
      {hasMore && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="flex w-full items-center justify-center gap-1.5 border-border border-t px-4 py-2 text-muted-foreground/50 text-xs transition-colors hover:bg-foreground/[0.03] hover:text-muted-foreground"
        >
          {expanded ? (
            <>
              <ChevronUp className="size-3" />
              Show less
            </>
          ) : (
            <>
              <ChevronDown className="size-3" />
              Show {lines.length - PREVIEW_LINES} more lines
            </>
          )}
        </button>
      )}
    </div>
  );
}
