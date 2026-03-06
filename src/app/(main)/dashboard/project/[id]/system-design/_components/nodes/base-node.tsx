"use client";

import { Handle, Position } from "@xyflow/react";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

type BaseNodeProps = {
  icon: LucideIcon;
  label: string;
  sublabel?: string;
  selected?: boolean;
  dashed?: boolean;
  accentColor?: string;
};

export function BaseNode({ icon: Icon, label, sublabel, selected, dashed, accentColor }: BaseNodeProps) {
  return (
    <div
      className={cn(
        "relative min-w-[140px] cursor-default rounded-xl border border-border bg-card px-4 py-3 transition-all",
        dashed && "border-dashed",
        selected && "border-blue-500/30 ring-2 ring-blue-500/50",
      )}
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
          <p className="truncate font-medium text-foreground text-xs leading-tight">{label}</p>
          {sublabel && <p className="mt-0.5 truncate text-[10px] text-muted-foreground leading-tight">{sublabel}</p>}
        </div>
      </div>
    </div>
  );
}
