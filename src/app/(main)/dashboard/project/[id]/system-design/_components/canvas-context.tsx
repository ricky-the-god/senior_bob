"use client";

import { createContext, useContext } from "react";

export type CanvasTool = "select" | "connect";

export type PendingConnection = {
  sourceNodeId: string;
  sourceHandleId: string;
  x: number; // flow coordinates of the source handle
  y: number;
};

type CanvasContextValue = {
  activeTool: CanvasTool;
  setActiveTool: (tool: CanvasTool) => void;
  pendingConnection: PendingConnection | null;
  setPendingConnection: (c: PendingConnection | null) => void;
  snapTargetNodeId: string | null;
  snapHandleId: string | null;
};

// Context is intentionally initialised to `null` so that `useCanvasTool()`
// throws a clear error when called outside a `<CanvasContext.Provider>`.
export const CanvasContext = createContext<CanvasContextValue | null>(null);

export function useCanvasTool(): CanvasContextValue {
  const ctx = useContext(CanvasContext);
  if (!ctx) {
    throw new Error("useCanvasTool must be used inside <CanvasContext.Provider>");
  }
  return ctx;
}
