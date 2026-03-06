"use client";

import {
  addEdge,
  Background,
  BackgroundVariant,
  Controls,
  type Edge,
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
import { useCallback, useEffect, useRef, useState } from "react";

import { Network } from "lucide-react";
import { toast } from "sonner";

import { saveDiagram } from "@/server/diagrams";

import { AiCommandPalette } from "./ai-command-palette";
import { AiPanel } from "./ai-panel";
import { CanvasToolbar } from "./canvas-toolbar";
import { NodePalette } from "./node-palette";
import { type NodeTypeId, nodeTypes } from "./nodes";

type DiagramData = { nodes: Node[]; edges: Edge[] };

type Props = {
  projectId: string;
  projectName: string;
  initialData: DiagramData | null;
};

function CanvasInner({ projectId, projectName, initialData }: Props) {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>(initialData?.nodes ?? []);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(initialData?.edges ?? []);
  const [aiPanelOpen, setAiPanelOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">("idle");
  const [isCanvasVisible, setIsCanvasVisible] = useState(!!initialData);

  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // S3: useViewport() is reactive — no getViewport() in render body
  const { zoom } = useViewport();
  const { fitView, zoomIn, zoomOut, screenToFlowPosition } = useReactFlow();

  // ── Auto-save ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isCanvasVisible) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      setSaveState("saving");
      try {
        await saveDiagram(projectId, "system-design", { nodes, edges });
        setSaveState("saved");
        setTimeout(() => setSaveState("idle"), 2000);
      } catch {
        setSaveState("idle");
        toast.error("Failed to save diagram");
      }
    }, 1500);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [nodes, edges, projectId, isCanvasVisible]);

  // ── ⌘K shortcut ─────────────────────────────────────────────────────────
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCommandPaletteOpen(true);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // ── Edge connection ──────────────────────────────────────────────────────
  const onConnect = useCallback(
    (params: Parameters<typeof addEdge>[0]) => {
      setEdges((eds) => addEdge(params, eds));
    },
    [setEdges],
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
        const existingIds = new Set(eds.map((e) => e.id));
        const toAdd = newEdges.filter((e) => !existingIds.has(e.id));
        return [...eds, ...toAdd];
      });
      toast.success("Diagram updated");
      // S4: setTimeout(0) — defer fitView until after React has committed new nodes
      setTimeout(() => fitView({ padding: 0.2, duration: 400 }), 0);
    },
    [setNodes, setEdges, fitView],
  );

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
      />

      <div className="flex flex-1 overflow-hidden">
        <NodePalette />

        {/* biome-ignore lint/a11y/noStaticElementInteractions: div is an HTML5 drop target; keyboard alternative is the AI palette */}
        <div className="flex-1 bg-background" onDragOver={onDragOver} onDrop={onDrop}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            fitView={!initialData}
            defaultEdgeOptions={{
              style: { stroke: "hsl(var(--border))", strokeWidth: 1.5 },
            }}
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
  );
}

export function SystemDesignCanvas({ projectId, projectName, initialData }: Props) {
  return (
    <ReactFlowProvider>
      <CanvasInner projectId={projectId} projectName={projectName} initialData={initialData} />
    </ReactFlowProvider>
  );
}
