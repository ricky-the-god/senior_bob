"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { type UIMessage, useChat } from "@ai-sdk/react";
import type { Edge, Node } from "@xyflow/react";
import { DefaultChatTransport } from "ai";
import { Bot, Loader2, Send } from "lucide-react";

import { cn } from "@/lib/utils";

type Props = {
  projectId: string;
  nodes: Node[];
  edges: Edge[];
  onApplyDiagram: (nodes: Node[], edges: Edge[]) => void;
};

type DiagramUpdate = { nodes: Node[]; edges: Edge[] };

function tryParseDiagramUpdate(text: string): DiagramUpdate | null {
  const match = text.match(/```json\s*([\s\S]*?)```/);
  if (!match) return null;
  try {
    const parsed = JSON.parse(match[1]) as unknown;
    if (
      parsed &&
      typeof parsed === "object" &&
      "nodes" in parsed &&
      "edges" in parsed &&
      Array.isArray((parsed as DiagramUpdate).nodes) &&
      Array.isArray((parsed as DiagramUpdate).edges)
    ) {
      return parsed as DiagramUpdate;
    }
  } catch {
    // not valid JSON
  }
  return null;
}

function getMessageText(msg: UIMessage): string {
  return msg.parts.map((p) => (p.type === "text" ? p.text : "")).join("");
}

const MAX_DIAGRAM_NODES = 80;

export function AiPanel({ projectId, nodes, edges, onApplyDiagram }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState("");

  // Keep refs to the latest diagram and projectId so the transport (created once) always
  // sends the current state without being re-created on every canvas change or remount.
  const diagramRef = useRef({ nodes, edges });
  const projectIdRef = useRef(projectId);
  useEffect(() => {
    diagramRef.current = { nodes, edges };
    projectIdRef.current = projectId;
  }, [nodes, edges, projectId]);

  // Transport is stable — only created once. Dynamic diagram state is injected
  // per-request via the custom fetch override that reads from the ref above.
  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/diagram-ai",
        fetch: async (url, options) => {
          const existing = JSON.parse((options?.body as string) ?? "{}") as Record<string, unknown>;
          const current = diagramRef.current;
          const truncated = {
            nodes: current.nodes.slice(0, MAX_DIAGRAM_NODES),
            edges: current.edges.slice(0, MAX_DIAGRAM_NODES * 2),
          };
          return fetch(url, {
            ...options,
            body: JSON.stringify({ ...existing, currentDiagram: truncated, projectId: projectIdRef.current }),
          });
        },
      }),
    [], // intentionally empty — transport must never be re-created
  );

  const { messages, sendMessage, status } = useChat({ transport });
  const isLoading = status === "streaming" || status === "submitted";

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    sendMessage({ text: input });
    setInput("");
  }

  return (
    <div className="flex w-72 flex-shrink-0 flex-col border-border border-l bg-card/60 backdrop-blur-sm">
      {/* Header */}
      <div className="flex items-center gap-2 border-border border-b px-3 py-2.5">
        <Bot className="size-3.5 text-foreground/50" />
        <span className="font-medium text-foreground text-xs">AI Architect</span>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex flex-1 flex-col gap-3 overflow-y-auto p-3">
        {messages.length === 0 && (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 py-8 text-center">
            <Bot className="size-6 text-foreground/20" />
            <p className="text-muted-foreground text-xs">
              Describe a system and I&apos;ll design it, or ask me to modify the current diagram.
            </p>
          </div>
        )}

        {messages.map((msg) => {
          const text = getMessageText(msg);
          const diagramUpdate = msg.role === "assistant" ? tryParseDiagramUpdate(text) : null;
          const displayContent = text.replace(/```json[\s\S]*?```/g, "").trim();

          return (
            <div
              key={msg.id}
              className={cn(
                "rounded-lg px-3 py-2 text-xs leading-relaxed",
                msg.role === "user"
                  ? "max-w-[90%] self-end bg-foreground/8 text-foreground"
                  : "max-w-full self-start border border-border bg-background text-foreground/80",
              )}
            >
              {displayContent || (diagramUpdate ? "Diagram update ready." : "")}

              {diagramUpdate && (
                <button
                  type="button"
                  onClick={() => onApplyDiagram(diagramUpdate.nodes, diagramUpdate.edges)}
                  className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-md border border-blue-500/30 bg-blue-500/15 px-2 py-1.5 font-medium text-[11px] text-blue-400 transition-colors hover:bg-blue-500/25"
                >
                  Apply to canvas
                </button>
              )}
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-center gap-2 self-start rounded-lg border border-border bg-background px-3 py-2">
            <Loader2 className="size-3 animate-spin text-foreground/40" />
            <span className="text-muted-foreground text-xs">Thinking…</span>
          </div>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="flex items-center gap-2 border-border border-t p-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Describe a system…"
          className="flex-1 rounded-md border border-border bg-background px-2.5 py-1.5 text-foreground text-xs placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-blue-500/50"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="flex h-7 w-7 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-foreground/8 hover:text-foreground disabled:opacity-40"
        >
          <Send className="size-3.5" />
        </button>
      </form>
    </div>
  );
}
