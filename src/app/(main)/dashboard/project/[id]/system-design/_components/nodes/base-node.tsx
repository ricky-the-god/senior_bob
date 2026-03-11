"use client";

import { useEffect, useRef, useState } from "react";

import { addEdge, Handle, MarkerType, NodeToolbar, Position, useReactFlow } from "@xyflow/react";
import type { LucideIcon } from "lucide-react";
import { Pencil, Trash2 } from "lucide-react";

import { cn } from "@/lib/utils";

import { useCanvasTool } from "../canvas-context";

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
  const { deleteElements, setNodes, setEdges, screenToFlowPosition } = useReactFlow();
  const { activeTool, pendingConnection, setPendingConnection, snapTargetNodeId, snapHandleId } = useCanvasTool();
  const connectMode = activeTool === "connect";
  const isConnecting = !!pendingConnection;
  const isPendingSource = pendingConnection?.sourceNodeId === id;
  const isSnapTarget = snapTargetNodeId === id;
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(label);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input after React commits the editing state to the DOM
  useEffect(() => {
    if (editing) inputRef.current?.select();
  }, [editing]);

  function startEdit() {
    setDraft(label);
    setEditing(true);
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

  function onHandleClick(e: React.MouseEvent, handleId: string) {
    e.stopPropagation();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const flowPos = screenToFlowPosition({
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    });

    if (!pendingConnection) {
      setPendingConnection({ sourceNodeId: id, sourceHandleId: handleId, x: flowPos.x, y: flowPos.y });
      return;
    }
    if (pendingConnection.sourceNodeId === id) return; // clicked same node — ignore

    // Complete the connection
    setEdges((eds) =>
      addEdge(
        {
          id: crypto.randomUUID(),
          source: pendingConnection.sourceNodeId,
          sourceHandle: pendingConnection.sourceHandleId,
          target: id,
          targetHandle: handleId,
          type: "custom",
          markerEnd: { type: MarkerType.ArrowClosed },
          style: { stroke: "#64748b", strokeWidth: 1.5 },
        },
        eds,
      ),
    );
    setPendingConnection(null);
  }

  // "bottom" is first so React Flow's fallback (first source handle) produces a
  // bottom-to-top edge when no explicit sourceHandle is set — correct for
  // top-down architecture diagrams.
  const HANDLE_POSITIONS = [
    { id: "bottom", position: Position.Bottom },
    { id: "top", position: Position.Top },
    { id: "left", position: Position.Left },
    { id: "right", position: Position.Right },
  ] as const;

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
          "group relative min-w-[140px] cursor-default rounded-xl border border-border bg-card px-4 py-3 transition-all",
          dashed && "border-dashed",
          selected && "border-blue-500/30 ring-2 ring-blue-500/50",
          connectMode && "cursor-crosshair",
          isPendingSource && "border-blue-500/60 ring-2 ring-blue-500/40 ring-offset-1 ring-offset-background",
          isConnecting && !isPendingSource && "cursor-crosshair",
        )}
        onDoubleClick={startEdit}
      >
        {/* Handles — always visible in connect mode or while connecting, appear on hover otherwise */}
        {HANDLE_POSITIONS.map(({ id: hId, position }) => {
          const isThisHandleSnap = isSnapTarget && snapHandleId === hId;
          const cls = cn(
            "!bg-blue-500 !border-blue-400 !w-2.5 !h-2.5 transition-all duration-150",
            connectMode || isConnecting ? "!opacity-100" : "!opacity-0 group-hover:!opacity-100",
            isThisHandleSnap && "!bg-blue-400 !w-3.5 !h-3.5 !shadow-[0_0_10px_3px_rgba(59,130,246,0.7)]",
          );
          return (
            <Handle
              key={hId}
              type="source"
              position={position}
              id={hId}
              className={cls}
              onClick={(e) => onHandleClick(e, hId)}
            />
          );
        })}

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
