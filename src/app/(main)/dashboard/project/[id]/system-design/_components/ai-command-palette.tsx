"use client";

import { useEffect, useRef, useState } from "react";

import type { Edge, Node } from "@xyflow/react";
import { Bot, Loader2, Sparkles } from "lucide-react";

type Props = {
  open: boolean;
  onClose: () => void;
  onApplyDiagram: (nodes: Node[], edges: Edge[]) => void;
  currentNodes: Node[];
  currentEdges: Edge[];
};

const SUGGESTIONS = [
  "Add a Redis cache layer",
  "Add a message queue between services",
  "Add a CDN in front of the gateway",
  "Add a load balancer",
  "Show a microservices architecture",
];

export function AiCommandPalette({ open, onClose, onApplyDiagram, currentNodes, currentEdges }: Props) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setQuery("");
      setStatus("idle");
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  async function handleSubmit(prompt: string) {
    if (!prompt.trim()) return;
    setStatus("loading");

    // Truncate large diagrams to stay within the server's Zod .max() limits
    const currentDiagram = {
      nodes: currentNodes.slice(0, 100),
      edges: currentEdges.slice(0, 200),
    };

    try {
      const res = await fetch("/api/diagram-ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, currentDiagram }),
      });

      if (!res.ok) throw new Error("Failed");

      const json = (await res.json()) as { nodes?: Node[]; edges?: Edge[] };
      if (json.nodes && json.edges) {
        onApplyDiagram(json.nodes, json.edges);
        setStatus("done");
        setTimeout(onClose, 600);
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  if (!open) return null;

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: modal backdrop closes on click; Escape key handled via useEffect
    // biome-ignore lint/a11y/useKeyWithClickEvents: same as above
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Modal — stopPropagation prevents backdrop close when clicking inside */}
      {/* biome-ignore lint/a11y/noStaticElementInteractions: modal container, not a user-facing interactive element */}
      {/* biome-ignore lint/a11y/useKeyWithClickEvents: keyboard handling (Escape) is on the parent */}
      <div
        className="relative w-full max-w-lg rounded-xl border border-border bg-card shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Input row */}
        <div className="flex items-center gap-3 border-border border-b px-4 py-3">
          {status === "loading" ? (
            <Loader2 className="size-4 flex-shrink-0 animate-spin text-blue-400" />
          ) : status === "done" ? (
            <Sparkles className="size-4 flex-shrink-0 text-emerald-400" />
          ) : (
            <Bot className="size-4 flex-shrink-0 text-foreground/40" />
          )}

          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") void handleSubmit(query);
            }}
            placeholder="Describe what to add or change…"
            className="flex-1 bg-transparent text-foreground text-sm placeholder:text-muted-foreground/50 focus:outline-none"
            disabled={status === "loading"}
          />

          <kbd className="rounded bg-foreground/8 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">↵</kbd>
        </div>

        {/* Suggestions */}
        {status === "idle" && (
          <div className="p-2">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => void handleSubmit(s)}
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-muted-foreground text-xs transition-colors hover:bg-foreground/8 hover:text-foreground"
              >
                <Sparkles className="size-3 flex-shrink-0 text-foreground/30" />
                {s}
              </button>
            ))}
          </div>
        )}

        {status === "loading" && (
          <div className="flex items-center justify-center gap-2 py-6 text-muted-foreground text-xs">
            <Loader2 className="size-3.5 animate-spin" />
            Applying to canvas…
          </div>
        )}

        {status === "error" && (
          <p className="px-4 py-3 text-red-400 text-xs">Something went wrong. Try again or rephrase.</p>
        )}
      </div>
    </div>
  );
}
