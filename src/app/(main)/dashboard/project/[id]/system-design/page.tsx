import type { Edge, Node } from "@xyflow/react";

import type { ProjectMeta } from "@/lib/project-types";
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
  return { nodes: r.nodes as Node[], edges: r.edges as Edge[] };
}

function parseProjectMeta(
  description: string | null,
): Pick<ProjectMeta, "app_type" | "tech_stack" | "wizard_description" | "infra" | "backend"> {
  const defaults = { app_type: null, tech_stack: null, wizard_description: null, infra: null, backend: null } as Pick<
    ProjectMeta,
    "app_type" | "tech_stack" | "wizard_description" | "infra" | "backend"
  >;
  if (!description) return defaults;
  try {
    const parsed = JSON.parse(description) as Partial<ProjectMeta>;
    return {
      app_type: parsed.app_type ?? null,
      tech_stack: parsed.tech_stack ?? null,
      wizard_description: parsed.wizard_description ?? null,
      infra: parsed.infra ?? null,
      backend: parsed.backend ?? null,
    };
  } catch {
    return defaults;
  }
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
        projectMeta={parseProjectMeta(project?.description ?? null)}
      />
    </div>
  );
}
