"use client";

import { Bot, Check, Expand, Loader2, Minus, Plus, Save, Sparkles, X } from "lucide-react";

import { cn } from "@/lib/utils";

type Props = {
  title: string;
  saveState: "idle" | "saving" | "saved";
  zoom: number;
  onFitView: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onOpenCommandPalette: () => void;
  onToggleAiPanel: () => void;
  aiPanelOpen: boolean;
  onSave: () => void;
  isDirty: boolean;
  onGenerateTasks: () => void;
  generatingTasks: boolean;
};

export function CanvasToolbar({
  title,
  saveState,
  zoom,
  onFitView,
  onZoomIn,
  onZoomOut,
  onOpenCommandPalette,
  onToggleAiPanel,
  aiPanelOpen,
  onSave,
  isDirty,
  onGenerateTasks,
  generatingTasks,
}: Props) {
  return (
    <div className="flex h-11 flex-shrink-0 items-center gap-2 border-border border-b bg-card/80 px-3 backdrop-blur-sm">
      {/* Title */}
      <span className="max-w-[160px] truncate font-medium text-foreground text-sm">{title}</span>

      <div className="flex-1" />

      {/* Manual save */}
      <button
        type="button"
        onClick={onSave}
        disabled={!isDirty || saveState === "saving" || saveState === "saved"}
        className={cn(
          "flex h-7 items-center gap-1.5 rounded-md border border-border px-2 text-xs transition-colors",
          saveState === "saved"
            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-500"
            : "text-muted-foreground hover:bg-foreground/8 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50",
        )}
        title="Save (⌘S)"
      >
        {saveState === "saving" ? (
          <Loader2 className="size-3 animate-spin" />
        ) : saveState === "saved" ? (
          <Check className="size-3" />
        ) : (
          <Save className="size-3" />
        )}
        <span>{saveState === "saving" ? "Saving…" : saveState === "saved" ? "Saved" : "Save"}</span>
      </button>

      {/* Zoom controls */}
      <div className="flex items-center gap-0.5 rounded-md border border-border bg-background px-1">
        <button
          type="button"
          onClick={onZoomOut}
          className="flex h-6 w-6 items-center justify-center rounded transition-colors hover:bg-foreground/8"
          aria-label="Zoom out"
        >
          <Minus className="size-3 text-foreground/60" />
        </button>
        <button
          type="button"
          onClick={onFitView}
          className="w-10 px-1.5 text-center text-muted-foreground text-xs tabular-nums transition-colors hover:text-foreground"
          title="Fit view"
        >
          {Math.round(zoom * 100)}%
        </button>
        <button
          type="button"
          onClick={onZoomIn}
          className="flex h-6 w-6 items-center justify-center rounded transition-colors hover:bg-foreground/8"
          aria-label="Zoom in"
        >
          <Plus className="size-3 text-foreground/60" />
        </button>
      </div>

      {/* Fit view */}
      <button
        type="button"
        onClick={onFitView}
        className="flex h-7 items-center gap-1.5 rounded-md border border-border px-2 text-muted-foreground text-xs transition-colors hover:bg-foreground/8 hover:text-foreground"
        title="Fit view"
      >
        <Expand className="size-3" />
        <span>Fit</span>
      </button>

      {/* AI command palette */}
      <button
        type="button"
        onClick={onOpenCommandPalette}
        className="flex h-7 items-center gap-1.5 rounded-md border border-border px-2 text-muted-foreground text-xs transition-colors hover:bg-foreground/8 hover:text-foreground"
      >
        <Bot className="size-3" />
        <span>AI</span>
        <kbd className="ml-0.5 rounded bg-foreground/8 px-1 font-mono text-[10px]">⌘K</kbd>
      </button>

      {/* AI panel toggle */}
      <button
        type="button"
        onClick={onToggleAiPanel}
        className={cn(
          "flex h-7 w-7 items-center justify-center rounded-md border border-border transition-colors",
          aiPanelOpen
            ? "bg-foreground/8 text-foreground"
            : "text-muted-foreground hover:bg-foreground/8 hover:text-foreground",
        )}
        title={aiPanelOpen ? "Close AI panel" : "Open AI panel"}
      >
        {aiPanelOpen ? <X className="size-3.5" /> : <Bot className="size-3.5" />}
      </button>

      {/* Generate Tasks */}
      <button
        type="button"
        onClick={onGenerateTasks}
        disabled={generatingTasks}
        className="flex h-7 items-center gap-1.5 rounded-md border border-border bg-foreground px-2.5 font-medium text-background text-xs transition-colors hover:bg-foreground/90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {generatingTasks ? (
          <>
            <Loader2 className="size-3 animate-spin" />
            <span>Generating…</span>
          </>
        ) : (
          <>
            <Sparkles className="size-3" />
            <span>Generate Tasks</span>
          </>
        )}
      </button>
    </div>
  );
}
