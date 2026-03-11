"use client";

import {
  addEdge,
  Background,
  BackgroundVariant,
  ConnectionMode,
  Controls,
  type Edge,
  MarkerType,
  MiniMap,
  type Node,
  ReactFlow,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  useReactFlow,
  useViewport,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useRouter } from "next/navigation";

import { Network } from "lucide-react";
import { toast } from "sonner";

import { generateAndSaveTasks } from "@/lib/api/tasks";
import type { ProjectMeta } from "@/lib/project-types";
import { saveDiagram } from "@/server/diagrams";

import { AiCommandPalette } from "./ai-command-palette";
import { AiPanel } from "./ai-panel";
import { CanvasContext, type CanvasTool, type PendingConnection } from "./canvas-context";
import { CanvasToolbar } from "./canvas-toolbar";
import { edgeTypes } from "./edges";
import { NodePalette } from "./node-palette";
import { type NodeTypeId, nodeTypes } from "./nodes";

type DiagramData = { nodes: Node[]; edges: Edge[] };

const DEFAULT_MARKER_END = { type: MarkerType.ArrowClosed } as const;

type HandleId = "top" | "bottom" | "left" | "right";

/**
 * Deterministically pick the best source/target handles from the relative
 * positions of two nodes. Mirrors the server-side logic in
 * /api/diagram-ai/generate/route.ts so that edges from the streaming chat
 * panel (which has no server-side handle resolution) are also routed
 * correctly.
 */
function resolveEdgeHandles(
  src: { x: number; y: number },
  tgt: { x: number; y: number },
): { sourceHandle: HandleId; targetHandle: HandleId } {
  const dx = tgt.x - src.x;
  const dy = tgt.y - src.y;
  if (Math.abs(dy) >= Math.abs(dx)) {
    return dy >= 0 ? { sourceHandle: "bottom", targetHandle: "top" } : { sourceHandle: "top", targetHandle: "bottom" };
  }
  return dx >= 0 ? { sourceHandle: "right", targetHandle: "left" } : { sourceHandle: "left", targetHandle: "right" };
}

/** Ensure every edge has the custom renderer + arrow marker when loaded or created. */
function asCustomEdge(edge: Edge): Edge {
  return {
    ...edge,
    type: edge.type ?? "custom",
    markerEnd: edge.markerEnd ?? DEFAULT_MARKER_END,
  };
}

type Props = {
  projectId: string;
  projectName: string;
  initialData: DiagramData | null;
  projectMeta?: Pick<ProjectMeta, "app_type" | "tech_stack" | "wizard_description" | "infra" | "backend">;
};

type GhostEdgeProps = {
  source: { x: number; y: number };
  target: { x: number; y: number };
  viewport: { x: number; y: number; zoom: number };
  isSnapping: boolean;
};

/** SVG ghost line that follows the cursor during click-to-connect. */
function GhostEdgeLine({ source, target, viewport, isSnapping }: GhostEdgeProps) {
  const toContainer = (p: { x: number; y: number }) => ({
    x: p.x * viewport.zoom + viewport.x,
    y: p.y * viewport.zoom + viewport.y,
  });
  const s = toContainer(source);
  const t = toContainer(target);
  const color = isSnapping ? "#3b82f6" : "#94a3b8";

  return (
    <svg
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 10,
        overflow: "visible",
      }}
    >
      <defs>
        <marker id="ghost-arrow" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto">
          <path d="M0,0 L0,6 L8,3 z" fill={color} />
        </marker>
      </defs>
      <line
        x1={s.x}
        y1={s.y}
        x2={t.x}
        y2={t.y}
        stroke={color}
        strokeWidth={isSnapping ? 2 : 1.5}
        strokeDasharray="6 3"
        markerEnd="url(#ghost-arrow)"
        style={{ opacity: 0.85 }}
      />
      {isSnapping && (
        <circle cx={t.x} cy={t.y} r={7} fill="none" stroke="#3b82f6" strokeWidth={2} style={{ opacity: 0.9 }} />
      )}
    </svg>
  );
}

function CanvasInner({ projectId, projectName, initialData, projectMeta }: Props) {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>(initialData?.nodes ?? []);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>((initialData?.edges ?? []).map(asCustomEdge));
  const [activeTool, setActiveTool] = useState<CanvasTool>("select");
  const [aiPanelOpen, setAiPanelOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">("idle");
  const [isDirty, setIsDirty] = useState(false);
  const [isCanvasVisible, setIsCanvasVisible] = useState(!!initialData);
  const [generatingTasks, setGeneratingTasks] = useState(false);
  const [pendingConnection, setPendingConnection] = useState<PendingConnection | null>(null);
  const [mouseFlowPos, setMouseFlowPos] = useState({ x: 0, y: 0 });
  const [snapTargetNodeId, setSnapTargetNodeId] = useState<string | null>(null);
  const [snapHandleId, setSnapHandleId] = useState<string | null>(null);
  const [snapPos, setSnapPos] = useState<{ x: number; y: number } | null>(null);
  const router = useRouter();

  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Skip the initial render so that loading initialData doesn't mark the canvas dirty
  const isMounted = useRef(false);

  // Stable context value — only changes when the referenced state values change.
  // Without useMemo this object is a new reference every render, forcing all
  // context consumers (BaseNode, NodePalette) to re-render unnecessarily.
  const canvasContextValue = useMemo(
    () => ({ activeTool, setActiveTool, pendingConnection, setPendingConnection, snapTargetNodeId, snapHandleId }),
    [activeTool, pendingConnection, snapTargetNodeId, snapHandleId],
  );

  // S3: useViewport() is reactive — no getViewport() in render body
  const { zoom, x: vpX, y: vpY } = useViewport();
  const { fitView, zoomIn, zoomOut, screenToFlowPosition } = useReactFlow();

  // ── Track dirty state — skip initial mount so loading data doesn't trigger ─
  // biome-ignore lint/correctness/useExhaustiveDependencies: nodes/edges are in deps to trigger on mutation; their values are not read in the body
  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }
    setIsDirty(true);
  }, [nodes, edges]);

  // ── Core save function (shared by auto-save and manual save) ─────────────
  const doSave = useCallback(
    async (currentNodes: Node[], currentEdges: Edge[]) => {
      setSaveState("saving");
      try {
        await saveDiagram(projectId, "system-design", { nodes: currentNodes, edges: currentEdges });
        setSaveState("saved");
        setIsDirty(false);
        setTimeout(() => setSaveState("idle"), 2000);
      } catch {
        setSaveState("idle");
        toast.error("Failed to save diagram");
      }
    },
    [projectId],
  );

  // ── Auto-save (1.5s debounce, only when dirty) ────────────────────────────
  useEffect(() => {
    if (!isCanvasVisible || !isDirty) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => doSave(nodes, edges), 1500);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [nodes, edges, isDirty, isCanvasVisible, doSave]);

  // ── Manual save ───────────────────────────────────────────────────────────
  const handleSave = useCallback(() => {
    if (!isDirty) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    doSave(nodes, edges);
  }, [nodes, edges, isDirty, doSave]);

  // ── Keyboard shortcuts (⌘K = AI palette, ⌘S = save, Escape = select tool) ──
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setActiveTool("select");
        setPendingConnection(null);
        setSnapTargetNodeId(null);
        setSnapHandleId(null);
        setSnapPos(null);
        return;
      }
      if (!(e.metaKey || e.ctrlKey)) return;
      if (e.key === "k") {
        e.preventDefault();
        setCommandPaletteOpen(true);
      }
      if (e.key === "s") {
        e.preventDefault();
        handleSave();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handleSave]);

  // ── Edge connection ──────────────────────────────────────────────────────
  const onConnect = useCallback(
    (params: Parameters<typeof addEdge>[0]) => {
      setEdges((eds) => addEdge(asCustomEdge({ ...params, id: crypto.randomUUID() } as Edge), eds));
      setPendingConnection(null);
    },
    [setEdges],
  );

  // ── Cancel pending click-to-connect on pane click ────────────────────────
  const onPaneClick = useCallback(() => {
    setPendingConnection(null);
    setSnapTargetNodeId(null);
    setSnapHandleId(null);
    setSnapPos(null);
  }, []);

  // ── Mouse tracking for ghost edge + magnetic snapping ─────────────────────
  const onCanvasMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!pendingConnection) return;
      const pos = screenToFlowPosition({ x: e.clientX, y: e.clientY });
      setMouseFlowPos(pos);

      // Magnetic snapping: find the closest handle on a non-source node (50px screen threshold)
      const SNAP_PX = 50;
      let closest: { x: number; y: number; nodeId: string; handleId: string } | null = null;
      let closestDist = SNAP_PX;

      for (const node of nodes) {
        if (node.id === pendingConnection.sourceNodeId) continue;
        const w = (node.measured?.width as number | undefined) ?? 140;
        const h = (node.measured?.height as number | undefined) ?? 56;
        const handlePositions = [
          { id: "top", x: node.position.x + w / 2, y: node.position.y },
          { id: "bottom", x: node.position.x + w / 2, y: node.position.y + h },
          { id: "left", x: node.position.x, y: node.position.y + h / 2 },
          { id: "right", x: node.position.x + w, y: node.position.y + h / 2 },
        ];
        for (const hp of handlePositions) {
          // Convert flow-space distance to screen-space pixels
          const screenDist = Math.hypot((pos.x - hp.x) * zoom, (pos.y - hp.y) * zoom);
          if (screenDist < closestDist) {
            closestDist = screenDist;
            closest = { x: hp.x, y: hp.y, nodeId: node.id, handleId: hp.id };
          }
        }
      }
      setSnapTargetNodeId(closest?.nodeId ?? null);
      setSnapHandleId(closest?.handleId ?? null);
      setSnapPos(closest ?? null);
    },
    [pendingConnection, nodes, zoom, screenToFlowPosition],
  );

  // ── Drag-to-add from NodePalette ─────────────────────────────────────────
  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const type = e.dataTransfer.getData("application/reactflow") as NodeTypeId;
      if (!type) return;

      const position = screenToFlowPosition({ x: e.clientX, y: e.clientY });
      // W3: crypto.randomUUID() — no collisions across HMR reloads or concurrent sessions
      const newNode: Node = {
        id: `${type}-${crypto.randomUUID()}`,
        type,
        position,
        data: { label: type.charAt(0).toUpperCase() + type.slice(1) },
      };
      setNodes((nds) => [...nds, newNode]);
    },
    [screenToFlowPosition, setNodes],
  );

  // ── Apply AI diagram update ───────────────────────────────────────────────
  const applyDiagramUpdate = useCallback(
    (newNodes: Node[], newEdges: Edge[]) => {
      setNodes((nds) => {
        const existingIds = new Set(nds.map((n) => n.id));
        const toAdd = newNodes.filter((n) => !existingIds.has(n.id));
        return [...nds, ...toAdd];
      });
      setEdges((eds) => {
        // Build a position map from existing + incoming nodes so handles can
        // be resolved for edges that the LLM returned without them (e.g. from
        // the streaming chat panel which has no server-side resolveHandles).
        const positionMap = new Map<string, { x: number; y: number }>(
          [...nodes, ...newNodes].map((n) => [n.id, n.position]),
        );

        const existingIds = new Set(eds.map((e) => e.id));
        const toAdd = newEdges
          .filter((e) => !existingIds.has(e.id))
          .map((e) => {
            // If the server already resolved handles (generate route), keep them.
            // If not (streaming chat route), resolve client-side from positions.
            if (e.sourceHandle && e.targetHandle) return asCustomEdge(e);
            const src = positionMap.get(e.source);
            const tgt = positionMap.get(e.target);
            if (!src || !tgt) return asCustomEdge(e);
            return asCustomEdge({ ...e, ...resolveEdgeHandles(src, tgt) });
          });
        return [...eds, ...toAdd];
      });
      toast.success("Diagram updated");
      // S4: setTimeout(0) — defer fitView until after React has committed new nodes
      setTimeout(() => fitView({ padding: 0.2, duration: 400 }), 0);
    },
    [nodes, setNodes, setEdges, fitView],
  );

  // ── Generate Tasks ────────────────────────────────────────────────────────
  const handleGenerateTasks = useCallback(async () => {
    if (nodes.length === 0) {
      toast.error("Add nodes to your diagram first");
      return;
    }
    setGeneratingTasks(true);
    try {
      await generateAndSaveTasks(projectId, { nodes, edges }, projectMeta ?? null);
      toast.success("Tasks generated");
      router.push(`/dashboard/project/${projectId}/tasks`);
    } catch {
      toast.error("Failed to generate tasks");
    } finally {
      setGeneratingTasks(false);
    }
  }, [nodes, edges, projectId, projectMeta, router]);

  // ── Empty state overlay ───────────────────────────────────────────────────
  if (!isCanvasVisible) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-border bg-card">
          <Network className="size-6 text-foreground/30" />
        </div>
        <div>
          <p className="font-semibold text-foreground text-sm">No architecture yet</p>
          <p className="mt-1 max-w-xs text-muted-foreground text-xs leading-relaxed">
            Start designing your system visually with services, databases, and AI assistance.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsCanvasVisible(true)}
          className="mt-1 flex items-center gap-2 rounded-lg bg-foreground px-4 py-2 font-medium text-background text-sm transition-colors hover:bg-foreground/90"
        >
          <Network className="size-4" />
          Open Architect Mode
        </button>
      </div>
    );
  }

  return (
    <CanvasContext.Provider value={canvasContextValue}>
      <div className="flex flex-1 flex-col overflow-hidden">
        <CanvasToolbar
          title={projectName}
          saveState={saveState}
          zoom={zoom}
          onFitView={() => fitView({ padding: 0.2, duration: 300 })}
          onZoomIn={() => zoomIn({ duration: 200 })}
          onZoomOut={() => zoomOut({ duration: 200 })}
          onOpenCommandPalette={() => setCommandPaletteOpen(true)}
          onToggleAiPanel={() => setAiPanelOpen((v) => !v)}
          aiPanelOpen={aiPanelOpen}
          onSave={handleSave}
          isDirty={isDirty}
          onGenerateTasks={handleGenerateTasks}
          generatingTasks={generatingTasks}
        />

        <div className="flex flex-1 overflow-hidden">
          <NodePalette />

          {/* biome-ignore lint/a11y/noStaticElementInteractions: div is an HTML5 drop target; keyboard alternative is the AI palette */}
          <div
            className="relative flex-1 bg-background"
            onDragOver={onDragOver}
            onDrop={onDrop}
            onMouseMove={onCanvasMouseMove}
          >
            <ReactFlow
              nodes={nodes}
              edges={edges}
              nodeTypes={nodeTypes}
              edgeTypes={edgeTypes}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onPaneClick={onPaneClick}
              fitView={!initialData}
              defaultEdgeOptions={{
                type: "custom",
                markerEnd: DEFAULT_MARKER_END,
                style: { stroke: "#64748b", strokeWidth: 1.5 },
              }}
              connectionMode={ConnectionMode.Loose}
              proOptions={{ hideAttribution: true }}
            >
              <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="hsl(var(--border))" />
              <Controls
                className="[&>button]:border-border [&>button]:bg-card [&>button]:text-foreground/60 [&>button]:hover:bg-foreground/8"
                showInteractive={false}
              />
              <MiniMap
                className="!rounded-xl !border !border-border !bg-card"
                nodeColor="hsl(var(--foreground) / 0.15)"
                maskColor="hsl(var(--background) / 0.7)"
              />
            </ReactFlow>

            {pendingConnection && (
              <GhostEdgeLine
                source={{ x: pendingConnection.x, y: pendingConnection.y }}
                target={snapPos ?? mouseFlowPos}
                viewport={{ x: vpX, y: vpY, zoom }}
                isSnapping={!!snapPos}
              />
            )}
          </div>

          {aiPanelOpen && (
            <AiPanel projectId={projectId} nodes={nodes} edges={edges} onApplyDiagram={applyDiagramUpdate} />
          )}
        </div>

        <AiCommandPalette
          open={commandPaletteOpen}
          onClose={() => setCommandPaletteOpen(false)}
          onApplyDiagram={applyDiagramUpdate}
          currentNodes={nodes}
          currentEdges={edges}
        />
      </div>
    </CanvasContext.Provider>
  );
}

export function SystemDesignCanvas({ projectId, projectName, initialData, projectMeta }: Props) {
  return (
    <ReactFlowProvider>
      <CanvasInner
        projectId={projectId}
        projectName={projectName}
        initialData={initialData}
        projectMeta={projectMeta}
      />
    </ReactFlowProvider>
  );
}
