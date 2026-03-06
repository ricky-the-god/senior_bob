import type { Edge, Node } from "@xyflow/react";

import { getDiagram } from "@/lib/queries/get-diagram";
import { getProject } from "@/lib/queries/get-project";

import { SystemDesignCanvas } from "./_components/system-design-canvas";

type Props = {
  params: Promise<{ id: string }>;
};

type DiagramData = { nodes: Node[]; edges: Edge[] };

function parseDiagramData(raw: unknown): DiagramData | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  if (!Array.isArray(r.nodes) || !Array.isArray(r.edges)) return null;
  // Shape was written by our own saveDiagram action; cast is safe
  return { nodes: r.nodes as Node[], edges: r.edges as Edge[] };
}

export default async function SystemDesignPage({ params }: Props) {
  const { id } = await params;

  const [diagram, project] = await Promise.all([getDiagram(id, "system-design"), getProject(id)]);

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <SystemDesignCanvas
        projectId={id}
        projectName={project?.name ?? "System Design"}
        initialData={parseDiagramData(diagram?.data)}
      />
    </div>
  );
}
