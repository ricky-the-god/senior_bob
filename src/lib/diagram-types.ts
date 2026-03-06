// Shared type for system design diagram data returned by /api/diagram-ai/generate
// and persisted via saveDiagram().

export type DiagramNode = {
  id: string;
  type: "service" | "database" | "cache" | "queue" | "gateway" | "client" | "external";
  position: { x: number; y: number };
  data: { label: string; sublabel?: string };
};

export type DiagramEdge = {
  id: string;
  source: string;
  target: string;
};

export type DiagramPayload = {
  nodes: DiagramNode[];
  edges: DiagramEdge[];
};
