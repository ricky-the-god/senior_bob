import type { ProjectMeta } from "@/lib/project-types";
import { getProject } from "@/lib/queries/get-project";

import { TasksBoard } from "./_components/tasks-board";

type Props = {
  params: Promise<{ id: string }>;
};

const META_DEFAULTS: ProjectMeta = {
  app_type: null,
  is_new_app: null,
  bio: null,
  tech_stack: null,
  sprints: null,
  releases: null,
  user_scale: null,
  infra: null,
  backend: null,
  wizard_description: null,
  task_sprints: null,
};

export default async function TasksPage({ params }: Props) {
  const { id } = await params;
  const project = await getProject(id);

  let meta: ProjectMeta = { ...META_DEFAULTS };
  try {
    if (project?.description) {
      meta = { ...meta, ...(JSON.parse(project.description) as Partial<ProjectMeta>) };
    }
  } catch {
    // malformed JSON — use defaults
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden p-6">
      <TasksBoard
        projectId={id}
        taskSprints={meta.task_sprints ?? null}
        projectMeta={{
          app_type: meta.app_type,
          tech_stack: meta.tech_stack,
          wizard_description: meta.wizard_description,
          infra: meta.infra,
          backend: meta.backend,
        }}
      />
    </div>
  );
}
