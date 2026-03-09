"use client";

import { useRef, useState } from "react";

import { Handle, NodeToolbar, Position, useReactFlow } from "@xyflow/react";
import type { LucideIcon } from "lucide-react";
import { Pencil, Trash2 } from "lucide-react";

import { cn } from "@/lib/utils";

type BaseNodeProps = {
  id: string;
  icon: LucideIcon;
  label: string;
  sublabel?: string;
  selected?: boolean;
  dashed?: boolean;
  accentColor?: string;
};

export function BaseNode({ id, icon: Icon, label, sublabel, selected, dashed, accentColor }: BaseNodeProps) {
  const { deleteElements, setNodes } = useReactFlow();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(label);
  const inputRef = useRef<HTMLInputElement>(null);

  function startEdit() {
    setDraft(label);
    setEditing(true);
    // focus after render
    setTimeout(() => inputRef.current?.select(), 0);
  }

  function commitEdit() {
    const trimmed = draft.trim();
    if (trimmed && trimmed !== label) {
      setNodes((nds) => nds.map((n) => (n.id === id ? { ...n, data: { ...n.data, label: trimmed } } : n)));
    }
    setEditing(false);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") commitEdit();
    if (e.key === "Escape") setEditing(false);
    // Prevent ReactFlow from intercepting Delete while editing
    e.stopPropagation();
  }

  function handleDelete() {
    deleteElements({ nodes: [{ id }] });
  }

  return (
    <>
      {/* Floating toolbar — only when selected */}
      <NodeToolbar isVisible={selected && !editing} position={Position.Top} align="center" offset={8}>
        <div className="flex items-center gap-0.5 rounded-lg border border-border bg-card px-1 py-1 shadow-lg">
          <button
            type="button"
            onClick={startEdit}
            className="flex h-6 w-6 items-center justify-center rounded transition-colors hover:bg-foreground/8"
            title="Rename"
          >
            <Pencil className="size-3 text-foreground/60" />
          </button>
          <div className="mx-0.5 h-3.5 w-px bg-border" />
          <button
            type="button"
            onClick={handleDelete}
            className="flex h-6 w-6 items-center justify-center rounded transition-colors hover:bg-red-500/10"
            title="Delete"
          >
            <Trash2 className="size-3 text-red-400/70 hover:text-red-400" />
          </button>
        </div>
      </NodeToolbar>

      {/* biome-ignore lint/a11y/noStaticElementInteractions: canvas node — double-click to rename is the UX; keyboard alternative is the toolbar pencil button */}
      <div
        className={cn(
          "relative min-w-[140px] cursor-default rounded-xl border border-border bg-card px-4 py-3 transition-all",
          dashed && "border-dashed",
          selected && "border-blue-500/30 ring-2 ring-blue-500/50",
        )}
        onDoubleClick={startEdit}
      >
        {/* Handles — appear on hover via CSS */}
        <Handle
          type="target"
          position={Position.Top}
          className="!bg-blue-500 !border-blue-400 !w-2 !h-2 opacity-0 transition-opacity group-hover:opacity-100"
        />
        <Handle
          type="source"
          position={Position.Bottom}
          className="!bg-blue-500 !border-blue-400 !w-2 !h-2 opacity-0 transition-opacity group-hover:opacity-100"
        />
        <Handle
          type="source"
          position={Position.Left}
          id="left"
          className="!bg-blue-500 !border-blue-400 !w-2 !h-2 opacity-0 transition-opacity group-hover:opacity-100"
        />
        <Handle
          type="source"
          position={Position.Right}
          id="right"
          className="!bg-blue-500 !border-blue-400 !w-2 !h-2 opacity-0 transition-opacity group-hover:opacity-100"
        />

        <div className="flex items-center gap-2">
          <div
            className={cn(
              "flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md",
              accentColor ?? "bg-foreground/8",
            )}
          >
            <Icon className="size-3.5 text-foreground/70" />
          </div>
          <div className="min-w-0">
            {editing ? (
              <input
                ref={inputRef}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onBlur={commitEdit}
                onKeyDown={handleKeyDown}
                className="w-full border-blue-500/50 border-b bg-transparent font-medium text-foreground text-xs leading-tight outline-none focus:border-blue-500"
                // biome-ignore lint/a11y/noAutofocus: input appears inline after user action; autofocus is intentional UX
              />
            ) : (
              <p className="truncate font-medium text-foreground text-xs leading-tight">{label}</p>
            )}
            {sublabel && <p className="mt-0.5 truncate text-[10px] text-muted-foreground leading-tight">{sublabel}</p>}
          </div>
        </div>
      </div>
    </>
  );
}
