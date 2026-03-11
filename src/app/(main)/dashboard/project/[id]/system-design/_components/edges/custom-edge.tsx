"use client";

import { useCallback, useState } from "react";

import { BaseEdge, EdgeLabelRenderer, type EdgeProps, getBezierPath, Position, useReactFlow } from "@xyflow/react";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";

function handleIdToPosition(id: string | null | undefined): Position | undefined {
  switch (id) {
    case "top":
      return Position.Top;
    case "bottom":
      return Position.Bottom;
    case "left":
      return Position.Left;
    case "right":
      return Position.Right;
    default:
      return undefined;
  }
}

export function CustomEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition: rfSourcePosition,
  targetPosition: rfTargetPosition,
  sourceHandle,
  targetHandle,
  data,
  selected,
  markerEnd,
  style,
}: EdgeProps) {
  const sourcePosition = handleIdToPosition(sourceHandle) ?? rfSourcePosition;
  const targetPosition = handleIdToPosition(targetHandle) ?? rfTargetPosition;
  const { deleteElements, setEdges } = useReactFlow();
  const [editing, setEditing] = useState(false);
  // Narrow `data.label` safely rather than casting. React Flow `data` is typed
  // as `Record<string, unknown>`, so an unsafe `as string` cast would hide a
  // runtime type mismatch if the diagram ever stores a non-string label.
  const initialLabel = typeof data?.label === "string" ? data.label : "";
  const [labelValue, setLabelValue] = useState(initialLabel);

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    curvature: 0.1,
  });

  const onDelete = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      deleteElements({ edges: [{ id }] });
    },
    [deleteElements, id],
  );

  const startEdit = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setEditing(true);
  }, []);

  const commitLabel = useCallback(() => {
    setEditing(false);
    setEdges((eds) => eds.map((e) => (e.id === id ? { ...e, data: { ...e.data, label: labelValue } } : e)));
  }, [id, labelValue, setEdges]);

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") commitLabel();
      if (e.key === "Escape") setEditing(false);
    },
    [commitLabel],
  );

  const hasLabel = labelValue.trim().length > 0;

  return (
    <>
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          stroke: selected ? "#3b82f6" : "#64748b",
          strokeWidth: selected ? 2 : 1.5,
        }}
      />
      <EdgeLabelRenderer>
        {/* biome-ignore lint/a11y/noStaticElementInteractions: canvas edge label — keyboard nav not applicable in React Flow canvas */}
        <div
          style={{
            position: "absolute",
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: "all",
          }}
          className="nodrag nopan group"
          onDoubleClick={startEdit}
        >
          {editing ? (
            <input
              // biome-ignore lint/a11y/noAutofocus: intentional focus on inline edit activation
              autoFocus
              value={labelValue}
              onChange={(e) => setLabelValue(e.target.value)}
              onBlur={commitLabel}
              onKeyDown={onKeyDown}
              placeholder="Label..."
              className="w-28 rounded border border-blue-500/50 bg-card px-2 py-0.5 text-center text-foreground text-xs outline-none ring-1 ring-blue-500/30"
            />
          ) : (
            <div className="flex items-center gap-1">
              {hasLabel && (
                <button
                  type="button"
                  onDoubleClick={startEdit}
                  className="cursor-text rounded bg-card/90 px-1.5 py-0.5 text-foreground/60 text-xs shadow-sm ring-1 ring-border backdrop-blur-sm"
                >
                  {labelValue}
                </button>
              )}

              {/* Controls: visible on hover or when edge is selected */}
              <div
                className={cn(
                  "flex items-center gap-0.5 transition-opacity",
                  selected ? "opacity-100" : "opacity-0 group-hover:opacity-100",
                )}
              >
                {!hasLabel && (
                  <button
                    type="button"
                    onClick={startEdit}
                    className="rounded bg-card/90 px-1.5 py-0.5 text-foreground/30 text-xs shadow-sm ring-1 ring-border backdrop-blur-sm hover:text-foreground/70"
                  >
                    + label
                  </button>
                )}
                <button
                  type="button"
                  onClick={onDelete}
                  title="Delete edge"
                  className="flex h-5 w-5 items-center justify-center rounded bg-card/90 text-foreground/40 shadow-sm ring-1 ring-border backdrop-blur-sm hover:bg-red-500/10 hover:text-red-400"
                >
                  <X className="size-3" />
                </button>
              </div>
            </div>
          )}
        </div>
      </EdgeLabelRenderer>
    </>
  );
}
