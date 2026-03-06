"use client";

import { NODE_PALETTE_ITEMS, type NodeTypeId } from "./nodes";

export function NodePalette() {
  function onDragStart(event: React.DragEvent, nodeType: NodeTypeId) {
    event.dataTransfer.setData("application/reactflow", nodeType);
    event.dataTransfer.effectAllowed = "move";
  }

  return (
    <aside className="flex w-[72px] flex-shrink-0 flex-col gap-1 border-border border-r bg-card/60 p-1.5 backdrop-blur-sm">
      <p className="px-1 pt-1 pb-0.5 text-center font-medium text-[9px] text-muted-foreground uppercase tracking-wider">
        Nodes
      </p>
      {NODE_PALETTE_ITEMS.map(({ type, label, icon: Icon }) => (
        // biome-ignore lint/a11y/noStaticElementInteractions: drag-source tile has no keyboard equivalent in MVP
        <div
          key={type}
          draggable
          onDragStart={(e) => onDragStart(e, type)}
          className="flex cursor-grab select-none flex-col items-center gap-1 rounded-lg border border-border bg-background px-1.5 py-2 transition-colors hover:border-blue-500/40 hover:bg-foreground/[0.03] active:cursor-grabbing"
          title={`Drag to add ${label}`}
        >
          <Icon className="size-3.5 text-foreground/60" />
          <span className="text-center text-[9px] text-muted-foreground leading-tight">{label}</span>
        </div>
      ))}
    </aside>
  );
}
