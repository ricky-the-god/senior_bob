import type { Edge, Node } from "@xyflow/react";

import type { ProjectMeta, TaskSprint } from "@/lib/project-types";
import { updateProjectMeta } from "@/server/projects";

type GenerateContext = Pick<
  ProjectMeta,
  "app_type" | "tech_stack" | "wizard_description" | "infra" | "backend" | "guided_setup"
>;

/**
 * Calls /api/tasks/generate, saves the result to ProjectMeta, and returns the sprints.
 * Pass an empty diagram when the live canvas is not available (e.g. from the tasks board).
 * Note: passing an empty diagram yields context-only tasks without architecture specifics —
 * prefer calling from the system-design canvas where nodes/edges are live.
 */
export async function generateAndSaveTasks(
  projectId: string,
  diagram: { nodes: Node[]; edges: Edge[] },
  context: GenerateContext | null,
): Promise<TaskSprint[]> {
  const res = await fetch("/api/tasks/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      diagram,
      context: context
        ? {
            app_type: context.app_type ?? undefined,
            tech_stack: context.tech_stack ?? undefined,
            wizard_description: context.wizard_description ?? undefined,
            infra: context.infra ?? undefined,
            backend: context.backend ?? undefined,
            guided_setup: context.guided_setup ?? undefined,
          }
        : undefined,
    }),
  });
  if (!res.ok) throw new Error(`Task generation failed: ${res.status}`);
  const data = (await res.json()) as { sprints: TaskSprint[] };
  await updateProjectMeta(projectId, { task_sprints: data.sprints });
  return data.sprints;
}
